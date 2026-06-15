/**
 * Cookie 工具类
 * 运行时读取浏览器当前 cookie，提供解析与打印能力。
 */
export class CookieUtil {
  /**
   * 返回原始 document.cookie 字符串
   * @returns {string}
   */
  static getRaw() {
    if (typeof document === "undefined") {
      return "";
    }
    return document.cookie || "";
  }

  /**
   * 把当前 cookie 解析为键值对对象
   * @returns {Record<string, string>}
   */
  static getAll() {
    const raw = CookieUtil.getRaw();
    if (!raw) {
      return {};
    }

    return raw.split(";").reduce((acc, part) => {
      const index = part.indexOf("=");
      if (index === -1) {
        return acc;
      }
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      if (key) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});
  }

  /**
   * 读取指定名称的 cookie
   * @param {string} name
   * @returns {string|undefined}
   */
  static get(name) {
    return CookieUtil.getAll()[name];
  }

  /**
   * 在控制台打印当前所有 cookie，便于调试
   * @returns {Record<string, string>} 解析后的 cookie 对象
   */
  static log() {
    const all = CookieUtil.getAll();
    console.log("[CookieUtil] 当前 cookie 原始值:", CookieUtil.getRaw());
    console.log("[CookieUtil] 当前 cookie 解析结果:", all);
    return all;
  }
}
