export function mountPage({ container, runtime }) {
  container.innerHTML = `
    <section class="min-h-screen bg-slate-950 px-6 py-12 text-slate-50 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-6xl space-y-8">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          <i data-lucide="sparkles" class="h-4 w-4"></i>
          <span>WebGen Starter Page</span>
        </div>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <article class="space-y-6">
            <div class="space-y-4">
              <p class="text-sm uppercase tracking-[0.32em] text-cyan-300">OpenClaw · Vite · Single Page</p>
              <h1 class="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                这里就是最终页面本体，不再额外套一层 Preview Shell。
              </h1>
              <p class="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                直接从 <code>src/main.js</code> 渲染到 <code>#app</code>，页面即最终用户会看到的内容。
                如果需要接口能力，仍可继续复用 <code>src/lib/api.js</code> 发起请求。
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p class="text-sm text-slate-400">页面入口</p>
                <p class="mt-3 text-xl font-medium text-white">src/main.js → #app</p>
              </div>
              <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p class="text-sm text-slate-400">图标刷新</p>
                <p class="mt-3 text-xl font-medium text-white">runtime.refreshIcons()</p>
              </div>
            </div>
          </article>

          <aside class="rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-900/20">
            <p class="text-sm uppercase tracking-[0.28em] text-cyan-100">Starter Notes</p>
            <ul class="mt-5 space-y-3 text-sm leading-7 text-cyan-50">
              <li>1. 页面业务代码默认写在 <code>src/generated/page.js</code></li>
              <li>2. 不再展示运行时调试壳或健康检查面板</li>
              <li>3. 需要接口时可直接使用 <code>runtime.api</code></li>
              <li>4. 用户访问时看到的就是实际页面本体</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  `;

  runtime.refreshIcons();
}
