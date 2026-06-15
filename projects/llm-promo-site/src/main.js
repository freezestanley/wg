import { mountPage } from "./generated/page.js";
import { apiGet, apiPost } from "./lib/api.js";
import { CookieUtil } from "./lib/cookie.js";

CookieUtil.log();

const app = document.querySelector("#app");

const runtime = {
  api: {
    get: apiGet,
    post: apiPost
  },
  refreshIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }
};

mountPage({
  container: app,
  runtime
});
