export function mountPage({ container, runtime }) {
  container.innerHTML = `
    <section class="space-y-6">
      <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
        <i data-lucide="sparkles" class="h-4 w-4"></i>
        <span>Generated Page Module</span>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <article class="space-y-6">
          <div class="space-y-4">
            <p class="text-sm uppercase tracking-[0.32em] text-cyan-300">OpenClaw · Vite · Mounted Page</p>
            <h2 class="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              生成页只负责业务内容，预览壳负责服务、代理和运行时状态。
            </h2>
            <p class="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              现在页面不是直接接管整个入口，而是作为 <code>src/generated/page.js</code> 模块挂载进
              Vite 预览壳，这样 agent 可以迭代页面而不破坏预览基础设施。
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p class="text-sm text-slate-400">运行模式</p>
              <p class="mt-3 text-xl font-medium text-white">${runtime.project.pageMode}</p>
            </div>
            <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p class="text-sm text-slate-400">适配目标</p>
              <p class="mt-3 text-xl font-medium text-white">${runtime.preview.deviceTargets.join(" / ")}</p>
            </div>
          </div>
        </article>

        <aside class="rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-900/20">
          <p class="text-sm uppercase tracking-[0.28em] text-cyan-100">Delivery Contract</p>
          <ul class="mt-5 space-y-3 text-sm leading-7 text-cyan-50">
            <li>1. 页面代码写入 <code>src/generated/</code></li>
            <li>2. 入口壳由 <code>src/main.js</code> 固定托管</li>
            <li>3. 运行时统一提供 <code>/api</code> 代理访问</li>
            <li>4. 生成页通过挂载协议接入预览服务</li>
          </ul>
        </aside>
      </div>
    </section>
  `;

  runtime.refreshIcons();
}
