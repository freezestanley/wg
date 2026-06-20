const MENU_TREE = [
  {
    key: "dashboard",
    label: "仪表盘",
    icon: "layout-dashboard",
    path: "/dashboard"
  },
  {
    key: "users",
    label: "用户管理",
    icon: "users",
    children: [
      { key: "users-all", label: "所有用户", path: "/users/all" },
      { key: "users-roles", label: "角色管理", path: "/users/roles" }
    ]
  },
  {
    key: "content",
    label: "内容管理",
    icon: "folder-kanban",
    children: [
      { key: "content-posts", label: "文章", path: "/content/posts" },
      { key: "content-comments", label: "评论", path: "/content/comments" }
    ]
  },
  {
    key: "settings",
    label: "系统设置",
    icon: "settings-2",
    path: "/settings"
  }
];

const ROUTE_PAGES = {
  "/dashboard": {
    title: "仪表盘",
    description: "查看系统整体运行情况、关键指标和待处理事项。",
    cards: [
      { title: "今日活跃用户", value: "12,480", note: "较昨日 +8.2%" },
      { title: "待审核内容", value: "84", note: "需优先处理 12 条" },
      { title: "系统告警", value: "3", note: "2 条中风险，1 条低风险" }
    ],
    sections: [
      {
        title: "最近动态",
        type: "list",
        rows: ["09:32 新用户批量导入完成", "10:15 评论审核规则已更新", "11:08 系统通知模板已发布"]
      },
      {
        title: "待办事项",
        type: "list",
        rows: ["检查 3 条异常登录告警", "完成内容频道权限复核", "确认本周运营公告发布时间"]
      }
    ]
  },
  "/users/all": {
    title: "所有用户",
    description: "集中查看用户列表、状态与注册来源。",
    table: {
      columns: ["用户名", "手机号", "角色", "状态", "注册时间", "操作"],
      rows: [
        ["陈小北", "138****2198", "管理员", "正常", "2026-06-12 09:20", "查看 / 编辑"],
        ["李安然", "187****6632", "编辑", "冻结", "2026-06-15 13:42", "查看 / 解冻"],
        ["王若川", "139****1021", "运营", "正常", "2026-06-19 18:06", "查看 / 分配角色"]
      ]
    }
  },
  "/users/roles": {
    title: "角色管理",
    description: "维护后台角色与权限范围。",
    cards: [
      { title: "角色总数", value: "8", note: "含 2 个系统内置角色" },
      { title: "待审批变更", value: "2", note: "涉及菜单与数据权限" }
    ],
    sections: [
      {
        title: "角色清单",
        type: "table",
        columns: ["角色名称", "成员数", "数据权限", "最后修改", "操作"],
        rows: [
          ["超级管理员", "2", "全部", "2026-06-20 10:08", "编辑"],
          ["内容运营", "14", "内容中心", "2026-06-19 16:32", "编辑"],
          ["审核专员", "6", "评论与文章审核", "2026-06-18 14:26", "编辑"]
        ]
      }
    ]
  },
  "/content/posts": {
    title: "文章",
    description: "管理文章发布状态、频道归类与作者信息。",
    table: {
      columns: ["标题", "频道", "作者", "状态", "发布时间", "操作"],
      rows: [
        ["2026 夏季活动预告", "活动运营", "张明", "已发布", "2026-06-20 09:00", "查看 / 下线"],
        ["社区规范更新说明", "公告", "王悦", "草稿", "--", "编辑 / 发布"],
        ["功能上新周报", "产品动态", "赵宁", "待审核", "2026-06-19 17:20", "审核"]
      ]
    }
  },
  "/content/comments": {
    title: "评论",
    description: "处理评论审核、违规拦截与人工复核。",
    sections: [
      {
        title: "审核队列",
        type: "table",
        columns: ["评论内容", "来源文章", "用户", "风险等级", "提交时间", "操作"],
        rows: [
          ["这个活动规则不太清楚", "2026 夏季活动预告", "陈小北", "低", "2026-06-20 11:42", "通过 / 驳回"],
          ["包含敏感词内容（示例）", "社区规范更新说明", "匿名用户", "高", "2026-06-20 12:06", "复核"],
          ["建议增加筛选功能", "功能上新周报", "李安然", "低", "2026-06-20 12:58", "通过"]
        ]
      }
    ]
  },
  "/settings": {
    title: "系统设置",
    description: "维护系统参数、通知模板和基础配置。",
    sections: [
      {
        title: "基础配置",
        type: "form",
        fields: [
          ["系统名称", "企业后台管理系统"],
          ["默认语言", "简体中文"],
          ["时区", "Asia/Shanghai"],
          ["登录保护", "已启用二次验证"]
        ]
      },
      {
        title: "通知模板",
        type: "list",
        rows: ["用户注册通知", "评论审核通知", "系统告警通知"]
      }
    ]
  }
};

const NOTIFICATIONS = [
  { title: "评论审核队列新增 12 条待处理", time: "2 分钟前", unread: true },
  { title: "角色“内容运营”权限已变更", time: "18 分钟前", unread: true },
  { title: "系统将于今晚 23:00 进行例行维护", time: "1 小时前", unread: false }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getDefaultRoute() {
  return "/dashboard";
}

function findMatchedParent(routePath) {
  return MENU_TREE.find((item) => item.children?.some((child) => child.path === routePath))?.key || null;
}

function buildBreadcrumbs(routePath) {
  const parent = MENU_TREE.find((item) => item.path === routePath || item.children?.some((child) => child.path === routePath));
  const crumbs = [{ label: "首页", path: "/dashboard" }];
  if (!parent) return crumbs;
  crumbs.push({ label: parent.label, path: parent.path || routePath });
  const child = parent.children?.find((item) => item.path === routePath);
  if (child) crumbs.push({ label: child.label, path: child.path });
  return crumbs;
}

function renderSidebarItem(item, state, level = 0) {
  const isParent = Array.isArray(item.children);
  const currentChild = item.children?.some((child) => child.path === state.routePath);
  const isExpanded = state.expandedMenus.includes(item.key) || currentChild;
  const isDirectActive = item.path === state.routePath;
  const label = `<span class="nav-item__label">${escapeHtml(item.label)}</span>`;
  const icon = `<span class="nav-item__icon"><i data-lucide="${item.icon || 'dot'}"></i></span>`;

  if (!isParent) {
    return `
      <button class="nav-item ${isDirectActive ? "is-active" : ""} ${state.sidebarCollapsed ? "is-collapsed" : ""}" data-route="${item.path}" data-close-drawer="1">
        ${icon}
        ${label}
      </button>
    `;
  }

  return `
    <div class="nav-group ${isExpanded ? "is-open" : ""} ${state.sidebarCollapsed ? "is-collapsed" : ""}">
      <button class="nav-item nav-item--group ${currentChild ? "is-active" : ""}" data-toggle-menu="${item.key}">
        ${icon}
        ${label}
        <span class="nav-item__arrow"><i data-lucide="chevron-down"></i></span>
      </button>
      <div class="nav-submenu">
        ${item.children
          .map(
            (child) => `
              <button class="nav-subitem ${child.path === state.routePath ? "is-active" : ""}" data-route="${child.path}" data-close-drawer="1">
                <span class="nav-subitem__dot"></span>
                <span>${escapeHtml(child.label)}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSidebar(state) {
  return `
    <aside class="app-sidebar ${state.sidebarCollapsed ? "is-collapsed" : ""} ${state.drawerOpen ? "is-drawer-open" : ""}">
      <div class="sidebar__header">
        <button class="sidebar__logo" data-route="/dashboard" data-close-drawer="1">
          <span class="sidebar__logo-mark">A</span>
          <span class="sidebar__logo-text">Admin System</span>
        </button>
        <button class="sidebar__collapse-btn" id="sidebar-toggle" aria-label="切换侧栏">
          <i data-lucide="panel-left-close"></i>
        </button>
      </div>
      <nav class="sidebar__nav" aria-label="主导航">
        ${MENU_TREE.map((item) => renderSidebarItem(item, state)).join("")}
      </nav>
    </aside>
  `;
}

function renderTopbar(state) {
  const unreadCount = NOTIFICATIONS.filter((item) => item.unread).length;
  return `
    <header class="app-topbar">
      <div class="topbar__left">
        <button class="topbar__menu-btn" id="drawer-toggle" aria-label="展开导航">
          <i data-lucide="menu"></i>
        </button>
        <div class="topbar__brand">
          <span class="topbar__brand-mark">A</span>
          <div>
            <strong>后台管理系统</strong>
            <span>Admin Control Center</span>
          </div>
        </div>
      </div>
      <div class="topbar__right">
        <button class="topbar__icon-btn" id="notification-toggle" aria-label="通知中心">
          <i data-lucide="bell"></i>
          ${unreadCount ? `<span class="badge">${unreadCount}</span>` : ""}
        </button>
        <div class="user-menu-wrap">
          <button class="user-menu-trigger" id="user-menu-toggle">
            <span class="avatar">Z</span>
            <span class="user-meta">
              <strong>张管理员</strong>
              <em>超级管理员</em>
            </span>
            <i data-lucide="chevron-down"></i>
          </button>
          <div class="user-dropdown ${state.userMenuOpen ? "is-open" : ""}">
            <button data-toast="已打开个人中心（mock）">个人中心</button>
            <button data-toast="已打开账号设置（mock）">账号设置</button>
            <button data-toast="已退出登录（mock）">退出登录</button>
          </div>
        </div>
      </div>
    </header>
  `;
}

function renderNotificationPanel(state) {
  return `
    <aside class="notification-panel ${state.notificationOpen ? "is-open" : ""}">
      <div class="notification-panel__head">
        <h3>通知中心</h3>
        <button class="text-btn" data-toast="全部通知已标记已读（mock）">全部已读</button>
      </div>
      <div class="notification-list">
        ${NOTIFICATIONS.map(
          (item) => `
            <article class="notification-item ${item.unread ? "is-unread" : ""}">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.time)}</p>
            </article>
          `
        ).join("")}
      </div>
    </aside>
  `;
}

function renderBreadcrumbs(routePath) {
  const crumbs = buildBreadcrumbs(routePath);
  return `
    <nav class="breadcrumbs" aria-label="面包屑">
      ${crumbs
        .map(
          (item, index) => `
            <button class="breadcrumb-item ${index === crumbs.length - 1 ? "is-current" : ""}" ${index === crumbs.length - 1 ? "disabled" : `data-route="${item.path}"`}>
              ${escapeHtml(item.label)}
            </button>
          `
        )
        .join('<span class="breadcrumb-separator">/</span>')}
    </nav>
  `;
}

function renderCards(cards) {
  return `
    <section class="content-cards">
      ${cards
        .map(
          (card) => `
            <article class="info-card">
              <span>${escapeHtml(card.title)}</span>
              <strong>${escapeHtml(card.value)}</strong>
              <p>${escapeHtml(card.note)}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderTable(table) {
  return `
    <div class="content-table-wrap">
      <table class="content-table">
        <thead>
          <tr>${table.columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSection(section) {
  if (section.type === "list") {
    return `
      <section class="content-section">
        <div class="content-section__head"><h3>${escapeHtml(section.title)}</h3></div>
        <div class="content-list">
          ${section.rows.map((row) => `<div class="content-list__item">${escapeHtml(row)}</div>`).join("")}
        </div>
      </section>
    `;
  }

  if (section.type === "table") {
    return `
      <section class="content-section">
        <div class="content-section__head"><h3>${escapeHtml(section.title)}</h3></div>
        ${renderTable(section)}
      </section>
    `;
  }

  if (section.type === "form") {
    return `
      <section class="content-section">
        <div class="content-section__head"><h3>${escapeHtml(section.title)}</h3></div>
        <div class="form-grid">
          ${section.fields
            .map(
              ([label, value]) => `
                <label class="form-item">
                  <span>${escapeHtml(label)}</span>
                  <input value="${escapeHtml(value)}" readonly />
                </label>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  return "";
}

function renderRouteContent(routePath) {
  const page = ROUTE_PAGES[routePath] || ROUTE_PAGES[getDefaultRoute()];
  return `
    <section class="page-card">
      <div class="page-card__head">
        <div>
          <h1>${escapeHtml(page.title)}</h1>
          <p>${escapeHtml(page.description)} 当前页面包含关键 metric / 数据 / 规格占位区，用于证明后台信息架构与操作路径。</p>
        </div>
        <div class="page-card__actions">
          <button class="secondary-btn" data-toast="已触发次级操作（mock）">查看规格</button>
          <button class="primary-btn" data-toast="已触发主操作（mock）">开始处理</button>
        </div>
      </div>
      ${page.cards ? renderCards(page.cards) : ""}
      ${page.table ? renderTable(page.table) : ""}
      ${page.sections ? page.sections.map((section) => renderSection(section)).join("") : ""}
    </section>
  `;
}

function renderLayout(state) {
  return `
    <div class="app-shell ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">
      <div class="app-overlay ${state.drawerOpen ? "is-visible" : ""}" id="app-overlay"></div>
      ${renderSidebar(state)}
      <div class="app-main">
        ${renderTopbar(state)}
        ${renderNotificationPanel(state)}
        <main class="app-content">
          <div class="content-scroll-area">
            ${renderBreadcrumbs(state.routePath)}
            ${renderRouteContent(state.routePath)}
          </div>
        </main>
      </div>
      <div class="toast ${state.toast ? "is-visible" : ""}" role="status" aria-live="polite">${escapeHtml(state.toast || "")}</div>
    </div>
  `;
}

export function mountPage({ container, runtime }) {
  const state = {
    routePath: getDefaultRoute(),
    expandedMenus: [findMatchedParent(getDefaultRoute())].filter(Boolean),
    sidebarCollapsed: window.innerWidth <= 960,
    drawerOpen: false,
    notificationOpen: false,
    userMenuOpen: false,
    toast: ""
  };

  let toastTimer = null;

  const setToast = (text) => {
    state.toast = text;
    render();
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      state.toast = "";
      render();
    }, 2200);
  };

  const navigateTo = (path) => {
    state.routePath = path;
    const matchedParent = findMatchedParent(path);
    if (matchedParent && !state.expandedMenus.includes(matchedParent)) {
      state.expandedMenus.push(matchedParent);
    }
    state.drawerOpen = false;
    state.notificationOpen = false;
    state.userMenuOpen = false;
    render();
  };

  const toggleMenu = (key) => {
    state.expandedMenus = state.expandedMenus.includes(key)
      ? state.expandedMenus.filter((item) => item !== key)
      : [...state.expandedMenus, key];
    render();
  };

  const bindEvents = () => {
    container.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => navigateTo(button.dataset.route));
    });

    container.querySelectorAll("[data-toggle-menu]").forEach((button) => {
      button.addEventListener("click", () => toggleMenu(button.dataset.toggleMenu));
    });

    container.querySelectorAll("[data-toast]").forEach((button) => {
      button.addEventListener("click", () => setToast(button.dataset.toast));
    });

    container.querySelector("#sidebar-toggle")?.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      render();
    });

    container.querySelector("#drawer-toggle")?.addEventListener("click", () => {
      state.drawerOpen = true;
      render();
    });

    container.querySelector("#app-overlay")?.addEventListener("click", () => {
      state.drawerOpen = false;
      state.notificationOpen = false;
      state.userMenuOpen = false;
      render();
    });

    container.querySelector("#notification-toggle")?.addEventListener("click", () => {
      state.notificationOpen = !state.notificationOpen;
      state.userMenuOpen = false;
      render();
    });

    container.querySelector("#user-menu-toggle")?.addEventListener("click", () => {
      state.userMenuOpen = !state.userMenuOpen;
      state.notificationOpen = false;
      render();
    });
  };

  const handleResize = () => {
    const mobile = window.innerWidth <= 960;
    if (mobile) {
      state.sidebarCollapsed = true;
    }
    if (!mobile) {
      state.drawerOpen = false;
    }
    render();
  };

  const render = () => {
    container.innerHTML = renderLayout(state);
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
    bindEvents();
  };

  render();
  window.addEventListener("resize", handleResize);
  runtime?.setHealthMessage?.("后台整体布局已加载，可切换示例路由并验证侧栏/顶栏交互。", "ready");
}
