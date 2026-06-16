import http from "node:http";
import crypto from "node:crypto";
import net from "node:net";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildViewportPlan,
  createCompactReviewReport,
  describeEndpointProbeFailure,
  extractDevToolsListeningUrl,
  resolveDebuggerUrl
} from "./lib/cdp-design-review.mjs";

function fail(message) {
  console.error(message);
  process.exit(2);
}

if (process.argv.length < 4 || process.argv.length > 5) {
  fail("Usage: node scripts/project-design-review-cdp.mjs <project-root> <url> [targets]");
}

const projectRoot = process.argv[2];
const pageUrl = process.argv[3];
const requestedTargets = (process.argv[4] || "pc,pad,h5")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const viewportPlan = buildViewportPlan(requestedTargets);
const reviewDir = join(projectRoot, ".webgen", "artifacts", "design-review");
const reportFile = join(projectRoot, ".webgen", "checks", "design-review-cdp.json");
const fallbackEndpoints = parseCandidateEndpoints(
  process.env.WEBGEN_CDP_ENDPOINTS || "127.0.0.1:9222,::1:9222"
);

mkdirSync(reviewDir, { recursive: true });
mkdirSync(dirname(reportFile), { recursive: true });

function parseCandidateEndpoints(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const matched = item.match(/^\[?([^\]]+)\]?:([0-9]+)$/);
      if (!matched) return null;
      return {
        host: matched[1],
        port: Number(matched[2])
      };
    })
    .filter(Boolean);
}

function probeJson(host, port, pathname) {
  return new Promise((resolve) => {
    const request = http.get({ host, port, path: pathname }, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        let json = null;
        try {
          json = body ? JSON.parse(body) : null;
        } catch {
          json = null;
        }
        resolve({
          reachable: true,
          status: response.statusCode || 0,
          json
        });
      });
    });

    request.on("error", (error) => {
      resolve({
        reachable: false,
        status: 0,
        json: null,
        error
      });
    });
  });
}

async function probeEndpoint(host, port) {
  const [root, version, list, jsonRoot] = await Promise.all([
    probeJson(host, port, "/"),
    probeJson(host, port, "/json/version"),
    probeJson(host, port, "/json/list"),
    probeJson(host, port, "/json")
  ]);

  return {
    host,
    port,
    reachable: [root, version, list, jsonRoot].some((item) => item.reachable),
    statuses: {
      root: root.status,
      version: version.status,
      list: list.status,
      json: jsonRoot.status
    },
    debuggerUrl: resolveDebuggerUrl({
      versionPayload: version.json,
      listPayload: Array.isArray(list.json)
        ? list.json
        : Array.isArray(jsonRoot.json)
          ? jsonRoot.json
          : []
    })
  };
}

function findChromeBinary() {
  const candidates = [
    process.env.WEBGEN_CHROME_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ].filter(Boolean);

  return candidates.find((item) => existsSync(item)) || null;
}

function launchTemporaryChrome(binaryPath) {
  return new Promise((resolve, reject) => {
    const profileDir = join(
      tmpdir(),
      `webgen-cdp-${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
    mkdirSync(profileDir, { recursive: true });

    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-sync",
      "--metrics-recording-only",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "about:blank"
    ];

    const child = spawn(binaryPath, args, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let settled = false;
    let output = "";

    const cleanup = async () => {
      try {
        if (child.exitCode === null && !child.killed) {
          child.kill("SIGTERM");
        }
      } catch {
        // noop
      }

      await new Promise((resolveCleanup) => {
        if (child.exitCode !== null) {
          resolveCleanup();
          return;
        }

        const timeoutId = setTimeout(() => {
          try {
            if (child.exitCode === null) {
              child.kill("SIGKILL");
            }
          } catch {
            // noop
          }
          resolveCleanup();
        }, 1200);

        child.once("exit", () => {
          clearTimeout(timeoutId);
          resolveCleanup();
        });
      });

      try {
        rmSync(profileDir, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 100
        });
      } catch {
        // noop
      }
    };

    const finish = (error, browserWsUrl) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (error) {
        cleanup().finally(() => reject(error));
        return;
      }
      resolve({
        browserWsUrl,
        cleanup
      });
    };

    const onData = (chunk) => {
      output += chunk.toString("utf8");
      const wsUrl = extractDevToolsListeningUrl(output);
      if (wsUrl) {
        finish(null, wsUrl);
      }
    };

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", (error) => {
      finish(error);
    });
    child.on("exit", (code, signal) => {
      finish(new Error(`Chrome exited before DevTools became ready (${code ?? signal ?? "unknown"})`));
    });

    const timeout = setTimeout(() => {
      const snippet = output.trim().split("\n").slice(-6).join("\n");
      finish(
        new Error(
          `Timed out waiting for Chrome DevTools endpoint${snippet ? `: ${snippet}` : ""}`
        )
      );
    }, 10000);
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPageDebuggerUrl(host, port) {
  let lastProbe = null;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    lastProbe = await probeEndpoint(host, port);
    if (lastProbe.debuggerUrl) {
      return lastProbe;
    }
    await sleep(250);
  }

  return lastProbe;
}

async function discoverDebuggerSession() {
  const chromeBinary = findChromeBinary();
  if (chromeBinary) {
    const launched = await launchTemporaryChrome(chromeBinary);
    const browserUrl = new URL(launched.browserWsUrl);
    const probe = await waitForPageDebuggerUrl(browserUrl.hostname, Number(browserUrl.port));

    if (!probe?.debuggerUrl) {
      await launched.cleanup();
      throw new Error(`Launched Chrome but no page target was exposed on ${browserUrl.hostname}:${browserUrl.port}`);
    }

    return {
      debuggerUrl: probe.debuggerUrl,
      source: `launched:${chromeBinary}`,
      cleanup: launched.cleanup
    };
  }

  const probes = [];
  for (const endpoint of fallbackEndpoints) {
    const probe = await probeEndpoint(endpoint.host, endpoint.port);
    probes.push(probe);
    if (probe.debuggerUrl) {
      return {
        debuggerUrl: probe.debuggerUrl,
        source: `attached:${endpoint.host}:${endpoint.port}`,
        cleanup: async () => {}
      };
    }
  }

  throw new Error(
    `Unable to find Chrome DevTools endpoint. ${describeEndpointProbeFailure(probes)}. ` +
    "Install Google Chrome or set WEBGEN_CHROME_BIN."
  );
}

function encodeFrame(payloadText) {
  const payload = Buffer.from(payloadText, "utf8");
  const mask = crypto.randomBytes(4);
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.from([0x81, 0x80 | length]);
  } else if (length < 65536) {
    header = Buffer.from([0x81, 0x80 | 126, (length >> 8) & 255, length & 255]);
  } else {
    header = Buffer.from([
      0x81,
      0x80 | 127,
      0,
      0,
      0,
      0,
      (length >> 24) & 255,
      (length >> 16) & 255,
      (length >> 8) & 255,
      length & 255
    ]);
  }

  const masked = Buffer.alloc(length);
  for (let index = 0; index < length; index += 1) {
    masked[index] = payload[index] ^ mask[index % 4];
  }

  return Buffer.concat([header, mask, masked]);
}

function decodeFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0f;
  let length = buffer[1] & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 10) return null;
    length = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  if (buffer.length < offset + length) return null;
  return {
    opcode,
    payload: buffer.slice(offset, offset + length),
    rest: buffer.slice(offset + length)
  };
}

function connectWebSocket(webSocketUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(webSocketUrl);
    const key = crypto.randomBytes(16).toString("base64");
    const socket = net.connect(Number(url.port), url.hostname, () => {
      socket.write(
        `GET ${url.pathname}${url.search} HTTP/1.1\r\n` +
        `Host: ${url.hostname}:${url.port}\r\n` +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        `Sec-WebSocket-Key: ${key}\r\n` +
        "Sec-WebSocket-Version: 13\r\n\r\n"
      );
    });

    let buffer = Buffer.alloc(0);
    let handshaken = false;
    let nextId = 1;
    const pending = new Map();

    const client = {
      send(method, params = {}) {
        const id = nextId;
        nextId += 1;
        const payload = JSON.stringify({ id, method, params });
        socket.write(encodeFrame(payload));
        return new Promise((resolveCall, rejectCall) => {
          pending.set(id, { resolveCall, rejectCall });
        });
      },
      close() {
        socket.end();
      }
    };

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      if (!handshaken) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;
        handshaken = true;
        buffer = buffer.slice(headerEnd + 4);
        resolve(client);
      }

      while (true) {
        const frame = decodeFrame(buffer);
        if (!frame) break;
        buffer = frame.rest;
        if (frame.opcode === 8) {
          socket.end();
          break;
        }
        if (!frame.payload.length) continue;
        try {
          const message = JSON.parse(frame.payload.toString("utf8"));
          if (message.id && pending.has(message.id)) {
            const entry = pending.get(message.id);
            pending.delete(message.id);
            if (message.error) {
              entry.rejectCall(new Error(message.error.message || JSON.stringify(message.error)));
            } else {
              entry.resolveCall(message.result);
            }
          }
        } catch {
          // noop
        }
      }
    });

    socket.on("error", reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }

  return result.result?.value;
}

function renderOverviewHtml(url, screenshots) {
  const cards = screenshots.map((item) => `
    <article class="card">
      <header>
        <strong>${item.name.toUpperCase()}</strong>
        <span>${item.width} x ${item.height}</span>
      </header>
      <div class="frame">
        <img src="${pathToFileURL(item.path).href}" alt="${item.name}" />
      </div>
    </article>
  `).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>WebGen Design Review</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f3f0e8;
      color: #1f1b16;
    }
    .shell {
      max-width: 1220px;
      margin: 0 auto;
      display: grid;
      gap: 20px;
    }
    .hero {
      padding: 24px 28px;
      border-radius: 24px;
      background: linear-gradient(135deg, #fffaf1, #efe5d2);
      border: 1px solid rgba(83, 61, 28, 0.12);
    }
    .hero strong {
      display: block;
      font-size: 28px;
      line-height: 1.1;
      margin-bottom: 8px;
    }
    .hero p {
      margin: 0;
      color: #5e5140;
      font-size: 15px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
    .card {
      padding: 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(83, 61, 28, 0.12);
      box-shadow: 0 10px 30px rgba(31, 27, 22, 0.08);
    }
    .card header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      letter-spacing: 0.04em;
      margin-bottom: 12px;
      color: #5e5140;
    }
    .frame {
      border-radius: 16px;
      overflow: hidden;
      background: #f8f4ec;
      border: 1px solid rgba(83, 61, 28, 0.08);
      display: grid;
      place-items: center;
      min-height: 280px;
    }
    .frame img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: contain;
      background: white;
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <strong>WebGen CDP Design Review</strong>
      <p>${url}</p>
    </section>
    <section class="grid">${cards}</section>
  </main>
</body>
</html>`;
}

async function captureOverview(client, url, screenshots) {
  const width = 1280;
  const height = screenshots.length > 2 ? 1680 : 1180;
  const htmlFile = join(reviewDir, "overview.html");

  writeFileSync(htmlFile, renderOverviewHtml(url, screenshots));

  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  await client.send("Page.navigate", { url: pathToFileURL(htmlFile).href });
  await sleep(900);

  const shot = await client.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: 60,
    captureBeyondViewport: false,
    fromSurface: true
  });

  const targetPath = join(reviewDir, "overview.jpg");
  writeFileSync(targetPath, Buffer.from(shot.data, "base64"));

  return {
    path: targetPath,
    width,
    height
  };
}

async function main() {
  const discovery = await discoverDebuggerSession();
  const client = await connectWebSocket(discovery.debuggerUrl);
  const screenshots = [];

  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.navigate", { url: pageUrl });
    await sleep(2500);

    const checks = await evaluate(client, `(() => {
      const h1 = document.querySelector('h1');
      const ctas = [...document.querySelectorAll('a,button')]
        .map((node) => (node.textContent || '').trim())
        .filter(Boolean);
      return {
        title: document.title,
        h1Text: h1 ? h1.textContent.trim() : '',
        h1Count: document.querySelectorAll('h1').length,
        ctaCount: ctas.length,
        ctas: ctas.slice(0, 6)
      };
    })()`);

    for (const viewport of viewportPlan) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile
      });
      await sleep(700);
      const shot = await client.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 58,
        captureBeyondViewport: false,
        fromSurface: true
      });
      const targetPath = join(reviewDir, `${viewport.name}.jpg`);
      writeFileSync(targetPath, Buffer.from(shot.data, "base64"));
      screenshots.push({
        name: viewport.name,
        path: targetPath,
        width: viewport.width,
        height: viewport.height,
        bytesBase64: shot.data
      });
    }

    const overview = await captureOverview(client, pageUrl, screenshots);
    const report = createCompactReviewReport({
      url: pageUrl,
      overview,
      screenshots,
      checks,
      errors: []
    });
    writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");

    console.log(`CDP REVIEW OK: ${pageUrl}`);
    console.log(`- source: ${discovery.source}`);
    console.log(`- report: ${reportFile}`);
    console.log(`- overview: ${overview.path}`);
  } finally {
    client.close();
    await discovery.cleanup();
  }
}

main().catch((error) => {
  const report = createCompactReviewReport({
    url: pageUrl,
    overview: null,
    screenshots: [],
    checks: {},
    errors: [error.message || String(error)]
  });
  writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
  fail(`CDP REVIEW FAILED: ${error.message || String(error)}`);
});
