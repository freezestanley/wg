const issueFacts = [
  ["片名", "Roman Holiday / 罗马假日"],
  ["发行年份", "1953"],
  ["专题定位", "电影专题 / 影展刊物式单页"],
  ["阅读结构", "Editorial Longform / Single Page"]
];

const dossier = [
  ["导演", "William Wyler"],
  ["主演", "Audrey Hepburn / Gregory Peck"],
  ["类型", "爱情 / 喜剧 / 剧情"],
  ["片长", "118 分钟"],
  ["奖项", "奥斯卡 10 提 3 中"],
  ["关键词", "自由、责任、城市、告别"]
];

const sections = [
  {
    kicker: "剧情导读",
    title: "它不是公主出逃童话，而是一次知道终点的自由练习。",
    body:
      "安妮公主从礼仪、访问与身份秩序中短暂脱身，在罗马获得一天并不完整、却足以改变自我视角的自由。Joe Bradley 起初把她当作一条新闻，最后却选择把最有价值的内容留在心里。影片真正动人的地方，不是偶遇本身，而是两个人在各自现实仍然存在的前提下，仍然完成了一次完整相遇。"
  },
  {
    kicker: "主题解读",
    title: "自由在这里不是逃走成功，而是体验之后仍愿意回去承担。",
    body:
      "《罗马假日》的成熟，在于它没有把责任写成单纯压迫，也没有把爱情写成对现实的胜利。安妮回到记者会现场，并不是被打回原位，而是完成了对自我身份的重新理解；Joe 放弃独家新闻，也不是牺牲式浪漫，而是一种成年人对他人尊严的保留。"
  },
  {
    kicker: "影史位置",
    title: "它把克制写成经典，把未实现的情感留成了最漫长的余韵。",
    body:
      "这部电影长期位于经典爱情片与城市电影交叉带的核心位置：赫本的银幕形象在此建立，罗马的城市肌理在此被全球观众记住，而那个没有拥抱、没有宣言的结尾，则证明了浪漫电影并不依赖圆满，也能抵达最深的情绪浓度。"
  }
];

const scenes = [
  ["01", "夜里出逃", "从制度空间迈入真实城市，人物视角第一次改变。"],
  ["02", "短发时刻", "轻盈外表之下，是主动决定“成为自己”的动作。"],
  ["03", "Vespa 穿城", "罗马不只是背景，而是把关系推向真实的流动空间。"],
  ["04", "真理之口", "玩笑成为试探，默契在轻喜剧节奏中真正成立。"],
  ["05", "河畔舞会", "浪漫与危险同时升高，假日开始被现实追上。"],
  ["06", "记者会告别", "没有煽情宣言，只有最体面的情感收束。"]
];

const routeStops = [
  "西班牙广场：作为城市记忆入口，承担“来到罗马”的第一层想象。",
  "真理之口：电影与旅游互相放大的典型景点，轻松却带情感确认。",
  "台伯河沿岸：让夜色、舞会与追逐把短暂自由推向结束。",
  "街头咖啡馆与小店：使“这一天”像真实生活而不只是观光。"
];

const assumptions = [
  "本版在未收到新增文案、剧照、官方海报授权与接口资料前，基于公开电影常识与专题阅读场景先做一版。",
  "优先做电影专题 / 影展刊物感 redesign，而不是商业票务或流媒体详情页。",
  "首屏以信息层级、版式节奏和刊物视觉为主，不嵌入伪播放器，不依赖外部 API。",
  "默认适配 PC / Pad / H5；Pad 兼顾横竖屏，H5 优先保证标题、导语、锚点导航与核心片目信息先看到。"
];

function renderList(items) {
  return items
    .map(
      ([label, value]) => `
        <div class="border-t border-[#2d2a28]/15 py-3">
          <dt class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">${label}</dt>
          <dd class="mt-2 text-sm leading-7 text-[#201d1b]">${value}</dd>
        </div>`
    )
    .join("");
}

export function mountPage({ container, runtime }) {
  container.innerHTML = `
    <main class="min-h-screen bg-[#ece6dc] text-[#1f1a17] selection:bg-[#7f2f2f] selection:text-[#f8f1e8]">
      <section class="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div class="overflow-hidden border border-[#2d2a28]/60 bg-[#f7f1e8] shadow-[0_18px_50px_rgba(45,34,24,0.12)]">
          <header class="border-b border-[#2d2a28]/55 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div class="space-y-3">
                <p class="text-[11px] uppercase tracking-[0.42em] text-[#756c63]">CINEMATHEQUE DOSSIER · ROMA · ISSUE 01</p>
                <div class="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <h1 class="font-serif text-[clamp(3rem,8vw,7.2rem)] uppercase leading-none tracking-[0.08em] text-[#171311]">Roman Holiday</h1>
                  <span class="pb-2 text-sm uppercase tracking-[0.34em] text-[#8b3030]">罗马假日</span>
                </div>
                <p class="max-w-3xl text-sm leading-7 text-[#4e463f] sm:text-base">
                  一次自由、一座城市、一段注定无法延长的关系。这个版本不再像普通电影介绍页，
                  而是把它重新整理成一份更像影展刊物与欧洲老电影档案网页之间的专题阅读页。
                </p>
              </div>
              <nav class="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.28em] text-[#3d3732]">
                <a href="#lead" class="inline-flex min-h-11 items-center border border-[#2d2a28]/50 px-4 py-3 transition hover:bg-[#201b18] hover:text-[#f8f1e8]">开场</a>
                <a href="#dossier" class="inline-flex min-h-11 items-center border border-[#2d2a28]/50 px-4 py-3 transition hover:bg-[#201b18] hover:text-[#f8f1e8]">片目</a>
                <a href="#essay" class="inline-flex min-h-11 items-center border border-[#2d2a28]/50 px-4 py-3 transition hover:bg-[#201b18] hover:text-[#f8f1e8]">导读</a>
                <a href="#scenes" class="inline-flex min-h-11 items-center border border-[#2d2a28]/50 px-4 py-3 transition hover:bg-[#201b18] hover:text-[#f8f1e8]">场景</a>
                <a href="#rome" class="inline-flex min-h-11 items-center border border-[#2d2a28]/50 px-4 py-3 transition hover:bg-[#201b18] hover:text-[#f8f1e8]">罗马</a>
              </nav>
            </div>
          </header>

          <section id="lead" class="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div class="border-b border-[#2d2a28]/18 px-4 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
              <div class="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                <div class="space-y-5">
                  <div class="border-b border-[#2d2a28]/16 pb-4">
                    <p class="text-[11px] uppercase tracking-[0.34em] text-[#756c63]">Lead Text</p>
                    <p class="mt-4 font-serif text-[clamp(2rem,4.8vw,4.1rem)] leading-[1.06] text-[#171311]">
                      她借到一天像普通人的生活，
                      他放弃一次足以成名的机会，
                      罗马把这段关系保存为
                      最体面的告别样本。
                    </p>
                  </div>
                  <div class="space-y-4 text-[15px] leading-8 text-[#302a26] sm:text-base">
                    <p>
                      本版首屏改为更强的海报式构图：大标题压场、长导语分层、刊物注释与资料边栏并置，
                      不再使用常见影评站卡片堆叠方式，而让阅读从视觉重音开始。
                    </p>
                    <p>
                      重点不是“讲很多模块”，而是先建立电影气质：旧报刊纸色、深酒红强调、黑白电影时代的克制秩序、
                      以及更像展册而不是内容运营页的留白和边框系统。
                    </p>
                  </div>
                  <div class="grid gap-4 sm:grid-cols-2">
                    ${issueFacts
                      .map(
                        ([label, value], index) => `
                        <div class="${index % 2 === 1 ? "sm:translate-y-5" : ""} border-t ${
                          index === 0 ? "border-[#2d2a28]/48" : "border-[#2d2a28]/18"
                        } pt-3 text-sm leading-7 text-[#2f2926]">
                          <p class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">${label}</p>
                          <p class="mt-2">${value}</p>
                        </div>`
                      )
                      .join("")}
                  </div>
                </div>

                <div class="space-y-5">
                  <div class="grid min-h-[420px] gap-4 bg-[#e1d4c4] p-4 sm:p-5">
                    <div class="flex items-start justify-between border-b border-[#2d2a28]/15 pb-3">
                      <div>
                        <p class="text-[10px] uppercase tracking-[0.3em] text-[#756c63]">Poster-like Field</p>
                        <p class="mt-2 font-serif text-2xl text-[#201915]">A Princess, A Reporter, A City</p>
                      </div>
                      <span class="border border-[#2d2a28]/25 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-[#8b3030]">Black & White Classic</span>
                    </div>
                    <div class="grid flex-1 content-between gap-6">
                      <div class="grid gap-4 sm:grid-cols-[0.72fr_1.28fr]">
                        <div class="border border-[#2d2a28]/18 bg-[#f7f1e8] p-4">
                          <p class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">Editor’s Note</p>
                          <p class="mt-3 text-sm leading-7 text-[#302a26]">
                            重新设计的重点在于：把首屏从“普通内容头图”升级为一块可直接定义气质的专题封面。
                          </p>
                        </div>
                        <div class="relative overflow-hidden border border-[#2d2a28]/18 bg-[#211b18] p-5 text-[#f7f0e7]">
                          <div class="absolute inset-y-0 right-6 w-px bg-[#f7f0e7]/18"></div>
                          <p class="text-[11px] uppercase tracking-[0.34em] text-[#d5c1b0]">Memorable Ending</p>
                          <p class="mt-4 max-w-md font-serif text-[1.8rem] leading-[1.2]">
                            最经典的地方，
                            不是他们相爱，
                            而是他们都知道
                            该停在哪里。
                          </p>
                        </div>
                      </div>
                      <div class="grid gap-4 border-t border-[#2d2a28]/15 pt-4 md:grid-cols-2">
                        <div>
                          <p class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">Reading Path</p>
                          <p class="mt-2 text-sm leading-7 text-[#302a26]">先从片目与主题进入，再落到场景和罗马路线，让阅读从气质进入细节，而非从信息表开始。</p>
                        </div>
                        <div>
                          <p class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">Touch Strategy</p>
                          <p class="mt-2 text-sm leading-7 text-[#302a26]">所有按钮保持 44px 以上热区；hover 只作增强，触屏端靠边框、底色与位置变化反馈。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a href="#essay" class="inline-flex min-h-11 items-center justify-center border border-[#2d2a28]/55 bg-[#201b18] px-5 py-3 text-sm uppercase tracking-[0.22em] text-[#f8f1e8] transition hover:bg-[#8b3030]">进入专题正文</a>
                    <a href="#scenes" class="inline-flex min-h-11 items-center justify-center border border-[#2d2a28]/35 px-5 py-3 text-sm uppercase tracking-[0.22em] text-[#2d2623] transition hover:bg-[#e8ddd0]">查看经典场景</a>
                  </div>
                </div>
              </div>
            </div>

            <aside id="dossier" class="bg-[#efe3d4] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              <div class="grid gap-6">
                <div>
                  <p class="text-[11px] uppercase tracking-[0.34em] text-[#756c63]">Film Dossier</p>
                  <h2 class="mt-3 font-serif text-[clamp(1.9rem,3.6vw,3rem)] leading-tight text-[#171311]">像档案，也像节目册。</h2>
                  <p class="mt-4 max-w-xl text-sm leading-7 text-[#403833]">
                    这一栏不做平台式信息卡，而是像纸本文献页一样，把片目资料、人物关系、观看角度与专题假设压进同一块阅读区。
                  </p>
                </div>
                <dl class="grid gap-x-5 gap-y-2 md:grid-cols-2">${renderList(dossier)}</dl>
                <div class="grid gap-4 border-t border-[#2d2a28]/16 pt-5">
                  <div class="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <div class="border border-[#2d2a28]/18 bg-[#f7f1e8] p-4">
                      <p class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">人物轴</p>
                      <p class="mt-3 text-sm leading-7 text-[#2f2926]">安妮代表身份内部的渴望，Joe 代表现实世界的判断与退让，罗马则是让两者暂时等高的城市舞台。</p>
                    </div>
                    <div class="border border-[#2d2a28]/18 p-4">
                      <p class="text-[10px] uppercase tracking-[0.28em] text-[#756c63]">视觉方向假设</p>
                      <ul class="mt-3 space-y-2 text-sm leading-7 text-[#2f2926]">
                        <li>· 采用纸色底、深色边框、低饱和酒红强调</li>
                        <li>· 大标题 + 档案注释 + 分栏正文的 editorial 节奏</li>
                        <li>· 避免流媒体模板、玻璃卡和泛科技紫蓝发光</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section id="essay" class="border-t border-[#2d2a28]/55 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div class="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div class="space-y-4">
                <p class="text-[11px] uppercase tracking-[0.34em] text-[#756c63]">Editorial Reading</p>
                <h2 class="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] text-[#171311]">从电影资料页，改成真正可读的专题页。</h2>
                <p class="text-sm leading-7 text-[#433b35]">
                  这里把内容拆成三段长文，不是为了堆 section，而是为了重建阅读节奏：先进入故事，再理解主题，最后落到影史位置。
                </p>
              </div>
              <div class="grid gap-4 xl:grid-cols-3">
                ${sections
                  .map(
                    (item, index) => `
                    <article class="${index === 1 ? "bg-[#221c19] text-[#f4ede4]" : "bg-[#f2e8dc]"} border border-[#2d2a28]/18 p-5">
                      <p class="text-[10px] uppercase tracking-[0.28em] ${index === 1 ? "text-[#d8b7a0]" : "text-[#756c63]"}">${item.kicker}</p>
                      <h3 class="mt-3 font-serif text-[1.55rem] leading-[1.28] ${index === 1 ? "text-[#f8f1e8]" : "text-[#1a1512]"}">${item.title}</h3>
                      <p class="mt-4 text-sm leading-8 ${index === 1 ? "text-[#efe5dc]" : "text-[#302a26]"}">${item.body}</p>
                    </article>`
                  )
                  .join("")}
              </div>
            </div>
          </section>

          <section id="scenes" class="border-top border-[#2d2a28]/55 border-t px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div class="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
              <div class="space-y-4">
                <p class="text-[11px] uppercase tracking-[0.34em] text-[#756c63]">Six Memorable Scenes</p>
                <h2 class="font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] text-[#171311]">关键模块改成编号场景册，而不是同构卡片。</h2>
                <p class="text-sm leading-7 text-[#433b35]">
                  这里有意把“经典场景”做成更接近影展图录的编号列表：数字先行，说明跟上，弱化互联网组件味，增强刊物感与可扫读性。
                </p>
              </div>
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                ${scenes
                  .map(
                    ([no, title, text]) => `
                    <article class="flex min-h-[220px] flex-col justify-between border border-[#2d2a28]/18 bg-[#f8f2e8] p-5">
                      <div>
                        <span class="text-[2.4rem] font-serif leading-none text-[#8b3030]">${no}</span>
                        <h3 class="mt-4 font-serif text-[1.45rem] text-[#171311]">${title}</h3>
                      </div>
                      <p class="mt-4 text-sm leading-8 text-[#322c28]">${text}</p>
                    </article>`
                  )
                  .join("")}
              </div>
            </div>
          </section>

          <section id="rome" class="border-t border-[#2d2a28]/55 bg-[#1f1a17] px-4 py-6 text-[#f6eee5] sm:px-6 lg:px-8 lg:py-8">
            <div class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div class="space-y-4">
                <p class="text-[11px] uppercase tracking-[0.34em] text-[#d7c3b2]">Roma Route</p>
                <h2 class="font-serif text-[clamp(2.1rem,4vw,3.8rem)] leading-[1.08] text-[#f8f1e8]">城市不是背景板，城市本身就是情绪装置。</h2>
                <p class="max-w-2xl text-sm leading-8 text-[#e7ddd2]">
                  罗马路线区保留，但从旅游列表改成更有电影性的一页黑底附录：让城市地标像注脚一样出现，提醒观众这部电影如何把城市拍成情感结构的一部分。
                </p>
                <ul class="grid gap-3 pt-2 text-sm leading-7 text-[#f0e5da]">
                  ${routeStops.map((item) => `<li class="border-l border-[#b98686] pl-4">${item}</li>`).join("")}
                </ul>
              </div>
              <div class="grid gap-4 self-start bg-[#2b2420] p-5">
                <div>
                  <p class="text-[10px] uppercase tracking-[0.28em] text-[#d7c3b2]">Assumptions Used</p>
                  <ul class="mt-3 space-y-3 text-sm leading-7 text-[#f1e7dc]">
                    ${assumptions.map((item) => `<li>· ${item}</li>`).join("")}
                  </ul>
                </div>
                <div class="border-t border-white/10 pt-4">
                  <p class="text-[10px] uppercase tracking-[0.28em] text-[#d7c3b2]">Responsive Notes</p>
                  <p class="mt-3 text-sm leading-7 text-[#f1e7dc]">
                    PC 使用强分栏与封面式构图；Pad 保留双栏但减弱位移与大尺度留白；H5 收拢为单栏长卷，优先显示标题、导语、导航与片目资料，hover 全部可被点击态替代。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  `;

  runtime.refreshIcons();

  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && window.animate) {
    window.animate("#lead h1, #lead p, #dossier, #essay article, #scenes article", {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: (_, index) => index * 90,
      duration: 700,
      easing: "easeOutCubic"
    });
  }
}
