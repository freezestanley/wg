import { apiGet, apiPost } from "../lib/api.js";

const PROJECT_META = {
  template: "vite-page",
  pageMode: "single-page"
};

const PREVIEW_META = {
  proxyPrefix: "/api",
  deviceTargets: ["PC", "Pad", "H5"]
};

export function createPreviewRuntime() {
  const healthNode = { current: null };

  return {
    project: PROJECT_META,
    preview: PREVIEW_META,
    api: {
      get: apiGet,
      post: apiPost
    },
    refreshIcons() {
      if (window.lucide?.createIcons) {
        window.lucide.createIcons();
      }
    },
    registerHealthNode(node) {
      healthNode.current = node;
    },
    setHealthMessage(message, tone = "pending") {
      if (!healthNode.current) {
        return;
      }

      healthNode.current.className =
        tone === "ready"
          ? "mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
          : tone === "warning"
            ? "mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
            : "mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100";
      healthNode.current.textContent = message;
    }
  };
}
