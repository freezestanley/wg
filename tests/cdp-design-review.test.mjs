import test from "node:test";
import assert from "node:assert/strict";

import {
  buildViewportPlan,
  createCompactReviewReport,
  describeEndpointProbeFailure,
  extractDevToolsListeningUrl,
  resolveDebuggerUrl
} from "../scripts/lib/cdp-design-review.mjs";

test("buildViewportPlan caps review captures to three named targets", () => {
  const plan = buildViewportPlan(["pc", "pad", "h5", "extra"]);
  assert.deepEqual(
    plan.map((item) => item.name),
    ["pc", "pad", "h5"]
  );
});

test("createCompactReviewReport keeps artifact paths but strips screenshot payloads", () => {
  const report = createCompactReviewReport({
    url: "http://127.0.0.1:4173/",
    overview: {
      path: "/tmp/review/overview.jpg",
      width: 1200,
      height: 1600
    },
    screenshots: [
      {
        name: "pc",
        path: "/tmp/review/pc.jpg",
        bytesBase64: "a".repeat(5000)
      }
    ],
    checks: {
      title: "Demo",
      h1Count: 1,
      ctaCount: 2
    },
    errors: []
  });

  assert.equal(report.screenshots[0].path, "/tmp/review/pc.jpg");
  assert.equal("bytesBase64" in report.screenshots[0], false);
  assert.equal(report.overview.path, "/tmp/review/overview.jpg");
  assert.equal(JSON.stringify(report).includes("aaaa"), false);
});

test("resolveDebuggerUrl falls back from version to page list", () => {
  const debuggerUrl = resolveDebuggerUrl({
    versionPayload: null,
    listPayload: [
      { type: "service_worker" },
      { type: "page", webSocketDebuggerUrl: "ws://127.0.0.1:9222/devtools/page/1" }
    ]
  });

  assert.equal(debuggerUrl, "ws://127.0.0.1:9222/devtools/page/1");
});

test("resolveDebuggerUrl prefers page targets over browser websocket", () => {
  const debuggerUrl = resolveDebuggerUrl({
    versionPayload: {
      webSocketDebuggerUrl: "ws://127.0.0.1:9222/devtools/browser/root"
    },
    listPayload: [
      { type: "page", webSocketDebuggerUrl: "ws://127.0.0.1:9222/devtools/page/7" }
    ]
  });

  assert.equal(debuggerUrl, "ws://127.0.0.1:9222/devtools/page/7");
});

test("extractDevToolsListeningUrl parses Chrome startup output", () => {
  const url = extractDevToolsListeningUrl(`
Google Chrome is being controlled by automated test software
DevTools listening on ws://127.0.0.1:53363/devtools/browser/abc123
`);

  assert.equal(url, "ws://127.0.0.1:53363/devtools/browser/abc123");
});

test("describeEndpointProbeFailure explains non-Chrome listeners clearly", () => {
  const message = describeEndpointProbeFailure([
    {
      host: "127.0.0.1",
      port: 9222,
      reachable: true,
      statuses: {
        root: 404,
        version: 404,
        list: 404,
        json: 404
      }
    }
  ]);

  assert.match(message, /not a Chrome DevTools endpoint/i);
  assert.match(message, /127\.0\.0\.1:9222/);
});
