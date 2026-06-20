import { apiGet, apiPost } from "../lib/api.js";

const PROJECT_META = {
  template: "vite-page",
  pageMode: "single-page",
  qualityBar: "production-starter"
};

const PREVIEW_META = {
  proxyPrefix: "/api",
  deviceTargets: ["PC", "Pad", "H5"],
  shellEnabled: false
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
      if (!healthNode.current) return;

      const toneClass =
        tone === "ready"
          ? "border-emerald-700/15 bg-emerald-50 text-emerald-900"
          : tone === "warning"
            ? "border-amber-700/15 bg-amber-50 text-amber-900"
            : "border-black/8 bg-[#f2ebdf] text-stone-700";

      healthNode.current.className =
        `rounded-full border px-4 py-2 text-xs sm:text-sm ${toneClass}`;
      healthNode.current.textContent = message;
    }
  };
}
