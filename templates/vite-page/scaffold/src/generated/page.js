function createStateCard(title, body) {
  return `
    <article class="rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(28,25,23,0.04)]">
      <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">${title}</p>
      <p class="mt-3 text-sm leading-7 text-stone-600">${body}</p>
    </article>
  `;
}

export function mountPage({ container, runtime }) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  container.innerHTML = `
    <section class="bg-[linear-gradient(180deg,#f7f4ee_0%,#faf8f4_100%)] text-stone-900">
      <div class="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div class="overflow-hidden rounded-[2rem] border border-black/7 bg-[rgba(255,255,255,0.72)] shadow-[0_24px_80px_rgba(57,38,17,0.06)] backdrop-blur">
          <section class="border-b border-black/6 px-5 py-8 sm:px-8 sm:py-10">
            <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div class="max-w-2xl">
                <div class="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.26em] text-stone-500">
                  <i data-lucide="layout-template" class="h-4 w-4"></i>
                  <span>Scaffold Only</span>
                </div>
                <h1 class="mt-5 text-[clamp(2.6rem,6vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-stone-950">
                  这里是中性脚手架，
                  <span class="block text-stone-600">不是最终交付页面设计。</span>
                </h1>
                <p class="mt-5 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
                  默认模板只负责提供稳定的运行壳、响应式容器、状态示例与挂载链路。真正的视觉风格、叙事结构和品牌表达，应由当前项目的生成结果决定。
                </p>

                <div class="mt-8 flex flex-wrap gap-3">
                  <a href="#design-checklist" class="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 active:scale-[0.98]">
                    查看设计检查点
                  </a>
                  <button id="starter-feedback" class="inline-flex h-11 items-center rounded-full border border-stone-300 bg-white px-5 text-sm font-medium text-stone-900 transition hover:bg-stone-50 active:scale-[0.98]">
                    触发反馈示例
                  </button>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                ${createStateCard("Runtime", "保留 page 挂载、图标刷新、API 代理与预览健康状态。")}
                ${createStateCard("Responsive", "默认容器和节奏覆盖 PC / Pad / H5，不绑定具体品牌布局。")}
                ${createStateCard("States", "模板仅示例 Loading / Empty / Error / Active Feedback 的实现挂点。")}
              </div>
            </div>
          </section>

          <section id="design-checklist" class="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
            <div class="border-b border-black/6 px-5 py-8 sm:px-8 lg:border-b-0 lg:border-r">
              <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">Design Handoff</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl [text-wrap:balance]">
                默认模板把设计要求前置到流程，而不是写死在模板页面里。
              </h2>
              <div class="mt-6 space-y-3">
                ${createStateCard("Design Read", "先明确页面目标、受众、语气、记忆点，再开始写页面。")}
                ${createStateCard("Block Plan", "先定首屏、证明区、内容区、CTA 收口，不允许直接套三等分卡片。")}
                ${createStateCard("Review Loop", "至少经过一次 build / preview 验证和一次页面实看复核后再交付。")}
              </div>
            </div>

            <div class="px-5 py-8 sm:px-8">
              <div class="grid gap-4 sm:grid-cols-2">
                <article class="rounded-[1.7rem] border border-dashed border-stone-300 bg-white/70 p-5">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">Hero Slot</p>
                  <p class="mt-4 text-sm leading-7 text-stone-600">
                    在这里替换成当前项目的首屏结构、主文案、主视觉和主 CTA。不要沿用模板文案。
                  </p>
                </article>
                <article class="rounded-[1.7rem] border border-dashed border-stone-300 bg-white/70 p-5">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">Proof Slot</p>
                  <p class="mt-4 text-sm leading-7 text-stone-600">
                    在这里放价值证明、案例、规格、功能、场景或数据，不预设品牌气质。
                  </p>
                </article>
                <article class="rounded-[1.7rem] border border-dashed border-stone-300 bg-white/70 p-5">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">State Slot</p>
                  <p class="mt-4 text-sm leading-7 text-stone-600">
                    在这里替换成业务相关的 Loading / Empty / Error / Active 反馈。
                  </p>
                </article>
                <article class="rounded-[1.7rem] border border-dashed border-stone-300 bg-white/70 p-5">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">CTA Slot</p>
                  <p class="mt-4 text-sm leading-7 text-stone-600">
                    收口区必须服务当前项目目标，不允许保留模板式“继续优化”泛文案。
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section class="border-t border-black/6 px-5 py-8 sm:px-8 sm:py-10">
            <div class="grid gap-4 lg:grid-cols-4">
              <article class="rounded-[1.6rem] border border-black/7 bg-white/78 p-4">
                <p class="text-[11px] uppercase tracking-[0.22em] text-stone-500">Loading</p>
                <div class="mt-4 space-y-2">
                  <div class="h-3 w-3/4 rounded-full bg-stone-200"></div>
                  <div class="h-3 w-full rounded-full bg-stone-200/90"></div>
                  <div class="h-3 w-4/5 rounded-full bg-stone-200/80"></div>
                </div>
              </article>
              <article class="rounded-[1.6rem] border border-black/7 bg-white/78 p-4">
                <p class="text-[11px] uppercase tracking-[0.22em] text-stone-500">Empty</p>
                <p class="mt-4 text-sm leading-7 text-stone-600">空态需要说明下一步，而不是只留一个“暂无数据”。</p>
              </article>
              <article class="rounded-[1.6rem] border border-black/7 bg-[#f8eee7] p-4">
                <p class="text-[11px] uppercase tracking-[0.22em] text-stone-500">Error</p>
                <p class="mt-4 text-sm leading-7 text-stone-700">错误提示应靠近问题源，并明确重试或回退路径。</p>
              </article>
              <article class="rounded-[1.6rem] border border-black/7 bg-[#ecf1e9] p-4">
                <p class="text-[11px] uppercase tracking-[0.22em] text-stone-500">Active Feedback</p>
                <p class="mt-4 text-sm leading-7 text-stone-700">点击、提交、切换都应有即时反馈，不能静默。</p>
              </article>
            </div>
          </section>
        </div>
      </div>

      <div id="starter-toast" class="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 translate-y-3 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 opacity-0 shadow-[0_18px_40px_rgba(22,16,10,0.28)] transition-all duration-300">
        已触发默认反馈示例
      </div>
    </section>
  `;

  runtime.refreshIcons();

  const feedbackButton = container.querySelector("#starter-feedback");
  const toast = document.querySelector("#starter-toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translate(-50%, 0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translate(-50%, 0.75rem)";
    }, 1600);
  }

  feedbackButton?.addEventListener("click", () => {
    showToast("这是脚手架级交互反馈示例，交付页中应替换成真实业务动作。");

    if (!prefersReducedMotion && window.animate) {
      try {
        window.animate(feedbackButton, {
          scale: [1, 0.96, 1],
          duration: 340,
          ease: "out(4)"
        });
      } catch {
        // noop
      }
    }
  });
}
