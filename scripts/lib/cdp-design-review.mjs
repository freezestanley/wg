export function buildViewportPlan(requested = []) {
  const presets = {
    pc: { name: "pc", width: 1440, height: 900, mobile: false },
    pad: { name: "pad", width: 834, height: 1194, mobile: false },
    h5: { name: "h5", width: 390, height: 844, mobile: true }
  };

  const names = requested.length ? requested : ["pc", "pad", "h5"];
  return names
    .filter((name) => presets[name])
    .slice(0, 3)
    .map((name) => presets[name]);
}

export function createCompactReviewReport(input) {
  return {
    url: input.url,
    checkedAt: input.checkedAt || new Date().toISOString(),
    overview: input.overview
      ? {
          path: input.overview.path,
          width: input.overview.width,
          height: input.overview.height
        }
      : null,
    screenshots: (input.screenshots || []).map((item) => ({
      name: item.name,
      path: item.path,
      width: item.width,
      height: item.height
    })),
    checks: input.checks || {},
    errors: input.errors || []
  };
}

export function resolveDebuggerUrl({ versionPayload, listPayload }) {
  const pageTarget = (listPayload || []).find(
    (item) => item?.type === "page" && item?.webSocketDebuggerUrl
  );

  if (pageTarget?.webSocketDebuggerUrl) {
    return pageTarget.webSocketDebuggerUrl;
  }

  if (versionPayload?.webSocketDebuggerUrl?.includes("/devtools/page/")) {
    return versionPayload.webSocketDebuggerUrl;
  }

  return null;
}

export function extractDevToolsListeningUrl(text = "") {
  const matched = text.match(/DevTools listening on (ws:\/\/[^\s]+)/i);
  return matched?.[1] || null;
}

export function describeEndpointProbeFailure(probes = []) {
  if (!probes.length) {
    return "No Chrome DevTools endpoint available";
  }

  return probes
    .map((probe) => {
      const address = `${probe.host}:${probe.port}`;
      if (!probe.reachable) {
        return `${address} unreachable`;
      }

      const { root, version, list, json } = probe.statuses || {};
      if ([root, version, list, json].every((status) => status === 404)) {
        return `${address} has listener, but it is not a Chrome DevTools endpoint`;
      }

      if (version === 200 || list === 200 || json === 200) {
        return `${address} responded, but no page websocket target was exposed`;
      }

      const seen = [root, version, list, json].filter((status) => Number.isInteger(status));
      if (seen.length) {
        return `${address} responded with unexpected statuses (${seen.join("/")})`;
      }

      return `${address} did not expose a usable debugger target`;
    })
    .join("; ");
}
