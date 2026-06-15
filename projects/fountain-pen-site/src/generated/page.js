function setupMotion(container) {
  const animate = window.animate;
  if (!animate) return;

  const items = container.querySelectorAll("[data-reveal]");
  animate(items, {
    opacity: [0, 1],
    translateY: [28, 0],
    delay: (_, index) => 120 * index,
    duration: 900,
    easing: "easeOutExpo"
  });

  const nib = container.querySelector("[data-nib]");
  if (nib) {
    animate(nib, {
      rotate: [0, 6, 0, -4, 0],
      translateY: [0, -6, 0],
      duration: 5200,
      easing: "easeInOutSine",
      loop: true
    });
  }
}

export function mountPage({ container, runtime }) {
  container.innerHTML = `
    <div class="min-h-screen overflow-hidden bg-[#0b0a09] text-[#f5efe6]">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(214,179,122,0.22),_transparent_28%),radial-gradient(circle_at_18%_18%,_rgba(72,45,26,0.55),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_32%)]"></div>

      <header class="relative z-10 px-5 pt-5 sm:px-8 lg:px-12 lg:pt-8">
        <div class="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur md:px-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b37a]/40 bg-[#d6b37a]/10 text-[#d6b37a]">
              <i data-lucide="pen-tool" class="h-4 w-4"></i>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-[0.34em] text-[#d6b37a]">AURELIA</p>
              <p class="text-sm text-[#f5efe6]">Pen Atelier</p>
            </div>
          </div>

          <nav class="hidden items-center gap-6 text-sm text-[#d9d0c3] md:flex">
            <a href="#series" class="transition hover:text-white">系列</a>
            <a href="#craft" class="transition hover:text-white">工艺</a>
            <a href="#moments" class="transition hover:text-white">场景</a>
            <a href="#contact" class="transition hover:text-white">预约</a>
          </nav>

          <a
            href="#contact"
            class="inline-flex min-h-11 items-center rounded-full border border-[#d6b37a]/40 bg-[#d6b37a] px-4 py-2 text-sm font-medium text-[#17130e] transition hover:bg-[#e4c793]"
          >
            预约试写
          </a>
        </div>
      </header>

      <main class="relative z-10 px-5 pb-14 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <section class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div class="space-y-8">
            <div data-reveal class="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d9cfbf]">
              <i data-lucide="sparkles" class="h-4 w-4 text-[#d6b37a]"></i>
              <span>高端钢笔 / 书写器物 / 礼赠收藏</span>
            </div>

            <div class="space-y-6">
              <p data-reveal class="text-xs uppercase tracking-[0.42em] text-[#b89561] sm:text-sm">For deliberate writing</p>
              <h1 data-reveal class="max-w-3xl text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-7xl">
                让每一次落笔，
                <span class="text-[#d6b37a]">都有金属与墨水的回响。</span>
              </h1>
              <p data-reveal class="max-w-2xl text-base leading-8 text-[#d4c9bb] sm:text-lg">
                AURELIA 以手工调校笔尖、深海树脂与黄铜机身打造高级书写体验，
                为签署、手账、收藏与礼赠场景提供一套克制而持久的器物答案。
              </p>
            </div>

            <div data-reveal class="flex flex-col gap-4 sm:flex-row">
              <a
                href="#series"
                class="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#f2eadf] px-6 py-3 text-sm font-medium text-[#17130e] transition hover:bg-white"
              >
                浏览系列
              </a>
              <a
                href="#craft"
                class="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                查看工艺细节
              </a>
            </div>

            <div data-reveal class="grid gap-4 sm:grid-cols-3">
              <article class="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p class="text-3xl font-semibold text-white">18K</p>
                <p class="mt-2 text-sm leading-6 text-[#cfc4b5]">手工微调笔尖，兼顾弹性与稳定出墨。</p>
              </article>
              <article class="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p class="text-3xl font-semibold text-white">9 层</p>
                <p class="mt-2 text-sm leading-6 text-[#cfc4b5]">树脂抛光工序，强化深色纹理与镜面质感。</p>
              </article>
              <article class="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p class="text-3xl font-semibold text-white">48h</p>
                <p class="mt-2 text-sm leading-6 text-[#cfc4b5]">企业礼赠方案最快两日内提供打样建议。</p>
              </article>
            </div>
          </div>

          <div data-reveal class="relative mx-auto w-full max-w-xl">
            <div class="absolute -left-6 top-12 hidden h-28 w-28 rounded-full bg-[#6a2330]/40 blur-3xl sm:block"></div>
            <div class="absolute bottom-10 right-0 h-28 w-28 rounded-full bg-[#223a53]/40 blur-3xl"></div>

            <div class="relative overflow-hidden rounded-[2rem] border border-[#d6b37a]/20 bg-[linear-gradient(145deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:p-7">
              <div class="rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,_rgba(214,179,122,0.24),_transparent_28%),linear-gradient(160deg,_#191614,_#0f0d0c_45%,_#17110f)] p-5 sm:p-7">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs uppercase tracking-[0.36em] text-[#d6b37a]">Signature piece</p>
                    <h2 class="mt-3 text-2xl font-semibold text-white sm:text-3xl">No. 07 Obsidian Flow</h2>
                  </div>
                  <div class="rounded-full border border-white/10 px-3 py-1 text-xs text-[#d9cfbf]">Fine / Medium</div>
                </div>

                <div class="relative mt-10 h-[240px] sm:h-[300px]">
                  <div class="absolute left-1/2 top-1/2 h-5/6 w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(214,179,122,0.18),_transparent_62%)] blur-xl"></div>
                  <div data-nib class="absolute left-1/2 top-1/2 h-6 w-[74%] -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] rounded-full bg-[linear-gradient(90deg,_#2b241f_0%,_#8d6f43_17%,_#d8c28d_34%,_#201a16_57%,_#6a2330_72%,_#0f1720_100%)] shadow-[0_18px_30px_rgba(0,0,0,0.45)]">
                    <div class="absolute right-[10%] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-[#eadab5]/40 bg-[radial-gradient(circle,_#f7efdd_0%,_#d2ad68_58%,_#7a5a2d_100%)]"></div>
                    <div class="absolute left-[12%] top-1/2 h-4 w-[22%] -translate-y-1/2 rounded-full bg-white/18"></div>
                    <div class="absolute left-[44%] top-1/2 h-3 w-[13%] -translate-y-1/2 rounded-full bg-black/20"></div>
                  </div>
                  <div class="absolute bottom-0 left-4 right-4 rounded-[1.4rem] border border-white/8 bg-black/20 p-4 backdrop-blur">
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <p class="text-xs uppercase tracking-[0.3em] text-[#b89561]">材质组合</p>
                        <p class="mt-2 text-sm leading-6 text-[#e7dccb]">玄黑树脂 · 暖金笔夹 · 真空储墨系统</p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs uppercase tracking-[0.3em] text-[#b89561]">Retail</p>
                        <p class="mt-2 text-lg font-semibold text-white">¥3,980</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-3">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p class="text-xs uppercase tracking-[0.28em] text-[#b89561]">Balance</p>
                  <p class="mt-2 text-sm text-[#e7dccb]">重心偏前，久写不坠腕。</p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p class="text-xs uppercase tracking-[0.28em] text-[#b89561]">Finish</p>
                  <p class="mt-2 text-sm text-[#e7dccb]">微镜面树脂，层次细腻不浮夸。</p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p class="text-xs uppercase tracking-[0.28em] text-[#b89561]">Ink feel</p>
                  <p class="mt-2 text-sm text-[#e7dccb]">湿润顺滑，适合正式签署与日记书写。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="series" class="mx-auto mt-16 max-w-7xl sm:mt-20">
          <div data-reveal class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.36em] text-[#b89561]">Collection</p>
              <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">为不同书写个性定制的三条产品线</h2>
            </div>
            <p class="max-w-xl text-sm leading-7 text-[#cfc4b5]">
              从入门收藏到限量定制，每一支钢笔都以节制的线条、恰当的重量与稳定的出墨逻辑回应真实使用场景。
            </p>
          </div>

          <div class="mt-8 grid gap-5 lg:grid-cols-3">
            ${[
              {
                tag: "Daily Signature",
                name: "Velour Line",
                desc: "面向商务书写与高频签署，采用轻量黄铜芯与柔润 EF/F 笔尖。",
                price: "¥1,680 起",
                tone: "from-[#36251d] to-[#101010]"
              },
              {
                tag: "Collector Edition",
                name: "Obsidian Reserve",
                desc: "深色树脂与金属饰件组合，适合礼赠、收藏与办公陈列。",
                price: "¥3,980 起",
                tone: "from-[#6a2330] to-[#18120f]"
              },
              {
                tag: "Studio Craft",
                name: "Atelier Bespoke",
                desc: "支持笔夹、刻字、笔尖调校与墨色建议，面向定制用户。",
                price: "预约定制",
                tone: "from-[#223a53] to-[#141312]"
              }
            ].map((item) => `
              <article data-reveal class="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04]">
                <div class="h-48 bg-gradient-to-br ${item.tone} p-6">
                  <div class="flex h-full flex-col justify-between rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
                    <p class="text-xs uppercase tracking-[0.34em] text-[#d6b37a]">${item.tag}</p>
                    <div class="self-end rounded-full border border-white/10 px-4 py-2 text-xs text-[#ece2d4] transition group-hover:bg-white/10">${item.price}</div>
                  </div>
                </div>
                <div class="space-y-3 p-6">
                  <h3 class="text-2xl font-semibold text-white">${item.name}</h3>
                  <p class="text-sm leading-7 text-[#cdc2b4]">${item.desc}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </section>

        <section id="craft" class="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] sm:mt-20">
          <div data-reveal class="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))] p-6 sm:p-8">
            <p class="text-xs uppercase tracking-[0.36em] text-[#b89561]">Craft narrative</p>
            <h2 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">每一支钢笔，都是材质、比例与书写手感的精密平衡。</h2>
            <p class="mt-5 text-sm leading-8 text-[#d3c8b9] sm:text-base">
              我们保留器物本身的克制感：不做过度装饰，而在握持、重心、开合阻尼与墨水流量上持续微调。
              从笔杆切面到笔尖角度，所有细节只为让书写更安静、更可靠。
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            ${[
              ["Resin Depth", "多层浇注树脂形成微妙纹理，光线下呈现深海般层叠感。"],
              ["Brass Precision", "黄铜结构提供稳定重心，避免长时间书写发飘。"],
              ["Nib Tuning", "手工测试不同纸张与墨水组合，确保出墨节奏一致。"],
              ["Ink Pairing", "提供墨色建议，让冷暖金属与纸面色调形成完整体验。"]
            ].map(([title, desc]) => `
              <article data-reveal class="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <div class="flex h-11 w-11 items-center justify-center rounded-full border border-[#d6b37a]/30 bg-[#d6b37a]/10 text-[#d6b37a]">
                  <i data-lucide="sparkles"></i>
                </div>
                <h3 class="mt-4 text-xl font-semibold text-white">${title}</h3>
                <p class="mt-3 text-sm leading-7 text-[#cec3b5]">${desc}</p>
              </article>
            `).join("")}
          </div>
        </section>

        <section id="moments" class="mx-auto mt-16 max-w-7xl sm:mt-20">
          <div data-reveal class="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(34,58,83,0.26),_rgba(255,255,255,0.03))] p-6 sm:p-8">
            <div class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p class="text-xs uppercase tracking-[0.36em] text-[#b89561]">Writing moments</p>
                <h2 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">从签署一份重要文件，到写下一页私人日记。</h2>
                <p class="mt-5 text-sm leading-8 text-[#d7ccbe] sm:text-base">
                  我们把器物的存在感控制在恰到好处的位置：既足够被记住，也不会压过使用者本身。
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                ${[
                  ["商务签署", "利落笔触、稳重材质与低调光泽，适合会议与正式签名。", "briefcase"],
                  ["手账记录", "湿润顺滑的出墨节奏，让长篇书写更轻松。", "book-open"],
                  ["礼赠方案", "支持企业刻字与包装建议，提升赠礼完成度。", "gift"],
                  ["私人收藏", "限量编号与定制配色，让每支笔都可被长期保留。", "gem"]
                ].map(([title, desc, icon]) => `
                  <article data-reveal class="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 backdrop-blur">
                    <div class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f0d6a5]">
                      <i data-lucide="${icon}" class="h-5 w-5"></i>
                    </div>
                    <h3 class="mt-4 text-lg font-semibold text-white">${title}</h3>
                    <p class="mt-2 text-sm leading-7 text-[#d7ccbe]">${desc}</p>
                  </article>
                `).join("")}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" class="mx-auto mt-16 max-w-7xl sm:mt-20">
          <div data-reveal class="grid gap-6 rounded-[2rem] border border-[#d6b37a]/20 bg-[linear-gradient(135deg,_rgba(214,179,122,0.16),_rgba(255,255,255,0.03))] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p class="text-xs uppercase tracking-[0.36em] text-[#8f6736]">Call to action</p>
              <h2 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">预约试写，或获取企业礼赠与定制方案。</h2>
              <p class="mt-4 max-w-2xl text-sm leading-8 text-[#f1e7d8] sm:text-base">
                当前为演示站点，占位联系方式如下：上海静安体验室、studio@aurelia-pen.example、400-900-2026。
                后续可替换为真实表单、客服渠道或门店地图。
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href="mailto:studio@aurelia-pen.example" class="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0f0d0b] px-6 py-3 text-sm font-medium text-white transition hover:bg-black">
                邮件咨询
              </a>
              <a href="#top" class="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                回到顶部
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;

  runtime.refreshIcons();
  setupMotion(container);
}
