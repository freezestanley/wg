import { mountPage } from "./generated/page.js";
import { apiGet, apiPost } from "./lib/api.js";
import { CookieUtil } from "./lib/cookie.js";
import { createPreviewRuntime } from "./runtime/create-preview-runtime.js";
import { renderPreviewShell } from "./runtime/render-preview-shell.js";
import "./styles.css";

CookieUtil.log();

const app = document.querySelector("#app");
const searchParams = new URLSearchParams(window.location.search);
const shellEnabled = searchParams.get("previewShell") === "1";

const runtime = createPreviewRuntime();
runtime.api = {
  get: apiGet,
  post: apiPost
};
runtime.preview.shellEnabled = shellEnabled;

const shell = shellEnabled
  ? renderPreviewShell(app, runtime)
  : { healthNode: null, pageRoot: app };

mountPage({
  container: shell.pageRoot,
  runtime
});

if (shellEnabled) {
  runtime.setHealthMessage(
    "页面骨架已挂载，可继续补业务内容、数据和品牌素材。",
    "ready"
  );
}
