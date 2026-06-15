import { mountPage } from "./generated/page.js";
import { createPreviewRuntime } from "./runtime/create-preview-runtime.js";
import { renderPreviewShell } from "./runtime/render-preview-shell.js";
import { CookieUtil } from "./lib/cookie.js";

// 运行时获取并打印当前 cookie
CookieUtil.log();

const app = document.querySelector("#app");
const runtime = createPreviewRuntime();
const shell = renderPreviewShell(app, runtime);

mountPage({
  container: shell.pageRoot,
  runtime
});

runtime.setHealthMessage("正在检查 `/api/health` 示例请求能力…", "pending");

runtime.api
  .get("/api/health")
  .then(() => {
    runtime.setHealthMessage(
      "本地代理示例可用：`/api/health` 已返回成功。",
      "ready"
    );
  })
  .catch(() => {
    runtime.setHealthMessage(
      "尚未配置可用的 `/api/health` 远端目标。这是预期状态，可在 `.env` 中配置代理目标后重试。",
      "warning"
    );
  });
