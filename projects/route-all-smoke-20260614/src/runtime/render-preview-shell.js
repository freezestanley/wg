export function renderPreviewShell(app, runtime) {
  app.innerHTML = `
    <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-50">
      <section class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header class="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-3">
              <div class="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200">
                <i data-lucide="monitor-play" class="h-4 w-4"></i>
                <span>Preview Shell</span>
              </div>
              <div>
                <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  WebGen 项目预览运行时
                </h1>
                <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  Vite 负责提供稳定本地服务，生成页面以模块形式挂载到预览壳中；代理、状态和调试信息由壳层统一管理。
                </p>
              </div>
            </div>
            <dl class="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt class="text-xs uppercase tracking-[0.2em] text-slate-400">Template</dt>
                <dd class="mt-2 font-medium text-white">${runtime.project.template}</dd>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt class="text-xs uppercase tracking-[0.2em] text-slate-400">Proxy</dt>
                <dd class="mt-2 font-medium text-white">${runtime.preview.proxyPrefix}</dd>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt class="text-xs uppercase tracking-[0.2em] text-slate-400">Devices</dt>
                <dd class="mt-2 font-medium text-white">${runtime.preview.deviceTargets.join(" / ")}</dd>
              </div>
            </dl>
          </div>
          <div id="preview-health" class="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
            正在初始化预览运行时…
          </div>
        </header>

        <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div class="rounded-[2rem] border border-white/10 bg-slate-950/60 p-3 shadow-[0_24px_80px_rgba(2,6,23,0.55)]">
            <div class="rounded-[1.5rem] border border-white/10 bg-slate-900/50 p-4 sm:p-6">
              <div id="generated-page-root"></div>
            </div>
          </div>
          <aside class="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Mount Contract</p>
              <p class="mt-2 text-sm leading-7 text-slate-300">
                业务生成页只负责导出 <code>mountPage({ container, runtime })</code>，入口层始终由预览壳托管。
              </p>
            </div>
            <div class="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p class="text-sm font-medium text-white">统一壳层能力</p>
              <ul class="mt-3 space-y-2 text-sm text-slate-300">
                <li>1. 本地 Vite 服务</li>
                <li>2. <code>/api</code> 代理映射</li>
                <li>3. 预览健康状态展示</li>
                <li>4. 设备适配目标提示</li>
              </ul>
            </div>
          </aside>
        </section>
      </section>
    </main>
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
