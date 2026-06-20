export function renderPreviewShell(app, runtime) {
  app.innerHTML = `
    <div class="min-h-screen bg-[linear-gradient(180deg,#f4eee6_0%,#f8f5ef_46%,#fbfaf7_100%)] text-stone-900">
      <div class="mx-auto min-h-screen max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8">
        <div class="grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="overflow-hidden rounded-[2rem] border border-black/8 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_24px_80px_rgba(57,38,17,0.08)] backdrop-blur">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-[0.28em] text-stone-500">WebGen</p>
                <h1 class="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Preview Atelier</h1>
              </div>
              <div class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-stone-50">
                <i data-lucide="sparkles" class="h-5 w-5"></i>
              </div>
            </div>

            <div class="mt-6 space-y-3 text-sm">
              <div class="rounded-[1.4rem] border border-black/6 bg-white/75 p-4">
                <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">Template</p>
                <p class="mt-2 font-medium text-stone-900">${runtime.project.template}</p>
              </div>
              <div class="rounded-[1.4rem] border border-black/6 bg-white/75 p-4">
                <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">Proxy</p>
                <p class="mt-2 font-medium text-stone-900">${runtime.preview.proxyPrefix}</p>
              </div>
              <div class="rounded-[1.4rem] border border-black/6 bg-white/75 p-4">
                <p class="text-[11px] uppercase tracking-[0.24em] text-stone-500">Targets</p>
                <p class="mt-2 font-medium text-stone-900">${runtime.preview.deviceTargets.join(" / ")}</p>
              </div>
            </div>

            <div class="mt-6 rounded-[1.7rem] border border-black/8 bg-stone-900 p-4 text-stone-50">
              <p class="text-[11px] uppercase tracking-[0.24em] text-stone-300">Preview Rules</p>
              <ul class="mt-3 space-y-2 text-sm text-stone-200/85">
                <li>1. 这是运行脚手架，不是最终交付设计</li>
                <li>2. 页面需覆盖 PC / Pad / H5 的安全布局</li>
                <li>3. 交付设计由当前项目生成结果决定</li>
              </ul>
            </div>
          </aside>

          <main class="overflow-hidden rounded-[2.4rem] border border-black/8 bg-white/82 shadow-[0_24px_80px_rgba(57,38,17,0.1)] backdrop-blur">
            <header class="flex flex-col gap-4 border-b border-black/6 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p class="text-[11px] uppercase tracking-[0.28em] text-stone-500">Single Page Starter</p>
                <p class="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
                  这里渲染的是页面挂载区域。外层只保留轻量预览壳，用来提供设备目标、运行状态和中性容器，不预设最终品牌风格。
                </p>
              </div>
              <div id="preview-health" class="rounded-full border border-black/8 bg-[#f2ebdf] px-4 py-2 text-xs text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                正在初始化页面预览…
              </div>
            </header>

            <div class="bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(249,245,238,0.86)_100%)] p-3 sm:p-4">
              <div class="overflow-hidden rounded-[1.8rem] border border-black/6 bg-[#f8f4ec] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div id="generated-page-root"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `;

  runtime.refreshIcons();

  const healthNode = app.querySelector("#preview-health");
  const pageRoot = app.querySelector("#generated-page-root");
  runtime.registerHealthNode(healthNode);

  return {
    healthNode,
    pageRoot
  };
}
