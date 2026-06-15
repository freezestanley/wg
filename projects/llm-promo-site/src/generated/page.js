const capabilityStates = {
  live: {
    label: "在线推理",
    badge: "Live",
    title: "面向中文业务的推理编排中枢",
    description: "统一处理检索、长上下文理解、工具调用与多轮协作，让复杂任务在一个工作台内完成闭环。",
    metrics: [
      { label: "上下文窗口", value: "256K" },
      { label: "工具链路", value: "18 条" },
      { label: "交付周期", value: "T+3 周" }
    ],
    logs: [
      "接入知识库与业务规则后，答案可追溯到证据片段。",
      "对多步骤任务做执行编排，支持审批、重试与人工接管。",
      "在客服、销售、运营与内部 Copilot 场景中共用同一套模型底座。"
    ]
  },
  loading: {
    label: "预热中",
    badge: "Loading",
    title: "模型集群正在扩容并同步最新策略",
    description: "用于演示加载骨架、渐进占位与等待反馈，保证关键界面在高峰期仍然可预期。",
    metrics: [
      { label: "节点准备", value: "08 / 12" },
      { label: "策略同步", value: "74%" },
      { label: "排队时延", value: "< 3s" }
    ],
    logs: []
  },
  empty: {
    label: "待接入",
    badge: "Empty",
    title: "还没有接入你的品牌语料与业务动作",
    description: "适合用于演示首轮部署前的空状态：先导入文档、FAQ、知识库与流程动作，再开始训练业务助手。",
    metrics: [
      { label: "已上传文档", value: "0" },
      { label: "流程模板", value: "0" },
      { label: "待办清单", value: "4 项" }
    ],
    logs: [
      "导入品牌手册、产品文档与服务话术。",
      "确认权限范围与需要调用的工具。"
    ]
  },
  error: {
    label: "异常告警",
    badge: "Error",
    title: "发现数据源授权失效，需要人工复核",
    description: "用于展示错误态：在接口异常、权限失效或知识库不可用时，界面会直接给出可操作提示，而不是静默失败。",
    metrics: [
      { label: "异常源", value: "CRM Token" },
      { label: "影响范围", value: "销售线索" },
      { label: "恢复建议", value: "重新授权" }
    ],
    logs: [
      "最近一次同步在 09:42 失败，原因：access token expired。",
      "建议 30 分钟内完成授权恢复，避免影响线索自动分发。"
    ]
  }
};

const scenarioCards = [
  {
    title: "智能客服与知识问答",
    copy: "把 FAQ、文档、工单与业务规则整合成统一回答层，复杂问题自动升级给人工。",
    stat: "首答时间缩短 61%"
  },
  {
    title: "销售线索筛选与跟进",
    copy: "自动判断线索成熟度、生成跟进建议与客户摘要，让销售先看到更值得打的电话。",
    stat: "线索处理效率提升 2.3 倍"
  },
  {
    title: "运营内容与数据洞察",
    copy: "在同一工作流里生成活动文案、提取数据异动原因，并联动报表与审批节点。",
    stat: "周报生成时间压缩到 15 分钟"
  }
];

const faqItems = [
  {
    q: "你们是通用模型官网，还是可交付的企业级方案？",
    a: "首版以品牌官网视角呈现，但页面文案和结构已经预留了方案化表达，后续可继续补接部署方式、行业案例、报价与试用流程。"
  },
  {
    q: "是否支持私有化、专有知识库和工具调用？",
    a: "支持。页面中已经把知识库接入、工具编排、人工接管与权限策略作为主能力表达，后续可替换成你的真实产品能力。"
  },
  {
    q: "没有品牌名和 Logo，为什么还能先做首版？",
    a: "当前使用占位品牌“曜识大模型”，版式、变量和文案结构都做成了易替换形式，后续换品牌资产不需要推倒重来。"
  },
  {
    q: "移动端会不会因为特效太多影响可读性？",
    a: "不会。动效只用于渐进入场与状态反馈，移动端弱化背景装饰，首屏优先保留标题、价值点和主 CTA。"
  }
];

function metricCard(metric) {
  return `
    <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-400">${metric.label}</p>
      <p class="mt-3 text-2xl font-semibold tracking-tight text-white">${metric.value}</p>
    </div>
  `;
}

function getStatePanelMarkup(stateKey) {
  const state = capabilityStates[stateKey];

  if (stateKey === "loading") {
    return `
      <div class="space-y-5">
        <div class="space-y-3">
          <div class="h-3 w-28 rounded-full bg-white/10 capability-skeleton"></div>
          <div class="h-8 w-3/4 rounded-full bg-white/10 capability-skeleton"></div>
          <div class="h-4 w-full rounded-full bg-white/10 capability-skeleton"></div>
          <div class="h-4 w-5/6 rounded-full bg-white/10 capability-skeleton"></div>
        </div>
        <div class="grid gap-3 md:grid-cols-3">
          ${state.metrics
            .map(
              () => `
                <div class="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div class="h-3 w-16 rounded-full bg-white/10 capability-skeleton"></div>
                  <div class="mt-4 h-7 w-20 rounded-full bg-white/10 capability-skeleton"></div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="inline-flex min-h-11 items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 text-sm font-medium text-emerald-200">${state.label}</span>
        <span class="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs uppercase tracking-[0.26em] text-slate-300">${state.badge}</span>
      </div>
      <div class="space-y-3">
        <h3 class="text-2xl font-semibold tracking-tight text-white md:text-3xl">${state.title}</h3>
        <p class="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">${state.description}</p>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        ${state.metrics.map(metricCard).join("")}
      </div>
      <div class="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div class="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p class="text-sm font-medium text-white">运行观察</p>
            <p class="mt-1 text-xs tracking-[0.22em] text-slate-400 uppercase">Runtime Notes</p>
          </div>
          <button type="button" id="pulse-demo" class="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-200 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-300/40 hover:bg-emerald-400/10 hover:text-white active:scale-[0.98]">
            触发反馈
          </button>
        </div>
        <div class="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          ${(state.logs.length ? state.logs : ["暂无运行日志"]).map((item) => `<p class="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">${item}</p>`).join("")}
        </div>
        <p id="active-feedback" class="mt-4 hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">已模拟一次成功反馈：适合用于 CTA 提交成功、模型试跑完成或线索收集完成后的即时提示。</p>
      </div>
    </div>
  `;
}

export function mountPage({ container, runtime }) {
  document.title = "曜识大模型｜企业级大模型宣传官网";

  container.innerHTML = `
    <div class="relative overflow-hidden bg-[#060816] text-slate-50">
      <style>
        :root {
          color-scheme: dark;
          --accent: 74 222 128;
          --accent-soft: 34 197 94;
          --surface: 12 16 33;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          background: #060816;
        }
        .hero-grid::before,
        .hero-grid::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .hero-grid::before {
          background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at center, rgba(0,0,0,0.9), transparent 78%);
          opacity: 0.28;
        }
        .hero-grid::after {
          background: radial-gradient(circle at 18% 18%, rgba(74, 222, 128, 0.22), transparent 34%),
                      radial-gradient(circle at 78% 24%, rgba(56, 189, 248, 0.16), transparent 28%),
                      radial-gradient(circle at 60% 72%, rgba(16, 185, 129, 0.18), transparent 30%);
          filter: blur(28px);
          opacity: 0.95;
        }
        .glass-panel {
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px -40px rgba(18, 29, 58, 0.9);
          backdrop-filter: blur(18px);
        }
        .capability-skeleton {
          position: relative;
          overflow: hidden;
        }
        .capability-skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
          animation: shimmer 1.8s infinite;
        }
        .reveal {
          opacity: 0;
          transform: translateY(20px);
        }
        .state-chip.is-active {
          border-color: rgba(74, 222, 128, 0.36);
          background: rgba(74, 222, 128, 0.12);
          color: white;
        }
        .faq-item[data-open='true'] .faq-answer {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 280ms cubic-bezier(0.16,1,0.3,1), opacity 240ms ease;
        }
        .faq-answer > div {
          overflow: hidden;
        }
        .faq-toggle svg {
          transition: transform 280ms cubic-bezier(0.16,1,0.3,1);
        }
        .faq-item[data-open='true'] .faq-toggle svg {
          transform: rotate(45deg);
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .faq-answer,
          .faq-toggle svg,
          .capability-skeleton::after {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      </style>

      <div class="hero-grid relative isolate">
        <header class="relative z-10 border-b border-white/8">
          <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <i data-lucide="brain-circuit" class="h-5 w-5"></i>
              </div>
              <div>
                <p class="text-sm font-medium tracking-[0.24em] text-slate-200 uppercase">曜识大模型</p>
                <p class="mt-1 text-xs text-slate-400">Enterprise LLM Operating Layer</p>
              </div>
            </div>
            <nav class="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <a href="#capabilities" class="transition hover:text-white">核心能力</a>
              <a href="#scenarios" class="transition hover:text-white">应用场景</a>
              <a href="#showcase" class="transition hover:text-white">模型展示</a>
              <a href="#faq" class="transition hover:text-white">FAQ</a>
            </nav>
            <a href="#cta" class="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-300/40 hover:bg-emerald-400/12 active:scale-[0.98]">申请演示</a>
          </div>
        </header>

        <main class="relative z-10">
          <section class="mx-auto grid min-h-[100dvh] max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-16">
            <div class="reveal space-y-8">
              <div class="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-4 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <i data-lucide="sparkles" class="h-4 w-4"></i>
                <span>面向企业落地的大模型品牌首版官网</span>
              </div>
              <div class="space-y-6">
                <p class="text-sm uppercase tracking-[0.34em] text-slate-400">可信 · 中文优先 · 可交付</p>
                <h1 class="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl xl:text-7xl">
                  把大模型从演示能力，推进成真正能跑进业务流程的系统资产。
                </h1>
                <p class="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  曜识大模型聚焦中文场景理解、知识检索、工具调用与流程编排，让客服、销售、运营和内部协作都能围绕同一模型底座稳定运行。
                </p>
              </div>

              <div class="flex flex-col gap-4 sm:flex-row">
                <a href="#cta" class="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-slate-950 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-300 active:scale-[0.98]">预约专属演示</a>
                <a href="#showcase" class="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]">查看能力展示</a>
              </div>

              <div class="grid gap-4 sm:grid-cols-3">
                <div class="glass-panel rounded-[1.5rem] p-5">
                  <p class="text-xs uppercase tracking-[0.28em] text-slate-400">模型治理</p>
                  <p class="mt-3 text-2xl font-semibold text-white">统一策略层</p>
                  <p class="mt-3 text-sm leading-7 text-slate-300">权限、审核、知识来源与工具边界统一治理，避免多系统各自为政。</p>
                </div>
                <div class="glass-panel rounded-[1.5rem] p-5">
                  <p class="text-xs uppercase tracking-[0.28em] text-slate-400">业务接入</p>
                  <p class="mt-3 text-2xl font-semibold text-white">流程级编排</p>
                  <p class="mt-3 text-sm leading-7 text-slate-300">不止回答问题，还能串联 CRM、知识库、审批流与工单系统。</p>
                </div>
                <div class="glass-panel rounded-[1.5rem] p-5">
                  <p class="text-xs uppercase tracking-[0.28em] text-slate-400">中文体验</p>
                  <p class="mt-3 text-2xl font-semibold text-white">长上下文理解</p>
                  <p class="mt-3 text-sm leading-7 text-slate-300">覆盖复杂文档、会议纪要和多轮问答，适配真实中文业务表达。</p>
                </div>
              </div>
            </div>

            <div class="reveal lg:justify-self-end">
              <div class="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
                <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                <div class="grid gap-4 md:grid-cols-[0.88fr_1.12fr]">
                  <div class="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="text-sm font-medium text-white">运行总览</p>
                        <p class="mt-1 text-xs uppercase tracking-[0.26em] text-slate-400">Model Ops</p>
                      </div>
                      <span class="inline-flex min-h-10 items-center rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 text-xs text-emerald-100">稳定运行</span>
                    </div>
                    <div class="mt-5 space-y-4">
                      <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div class="flex items-end justify-between gap-3">
                          <div>
                            <p class="text-xs uppercase tracking-[0.22em] text-slate-400">模型响应评分</p>
                            <p class="mt-3 text-4xl font-semibold tracking-tight text-white">4.7</p>
                          </div>
                          <p class="text-sm text-emerald-200">较上周 +0.3</p>
                        </div>
                      </div>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between text-sm text-slate-300"><span>知识命中率</span><span>89%</span></div>
                        <div class="h-2 rounded-full bg-white/8"><div class="h-2 w-[89%] rounded-full bg-emerald-300"></div></div>
                        <div class="flex items-center justify-between text-sm text-slate-300"><span>工具调用成功率</span><span>96%</span></div>
                        <div class="h-2 rounded-full bg-white/8"><div class="h-2 w-[96%] rounded-full bg-cyan-300"></div></div>
                      </div>
                    </div>
                  </div>
                  <div class="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,33,0.96),rgba(6,8,22,0.92))] p-5">
                    <div class="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                      <div>
                        <p class="text-sm font-medium text-white">业务工作台</p>
                        <p class="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Orchestration Layer</p>
                      </div>
                      <i data-lucide="workflow" class="h-5 w-5 text-emerald-200"></i>
                    </div>
                    <div class="mt-4 space-y-3">
                      <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p class="text-sm text-slate-300">01. 检索品牌知识与销售手册</p>
                      </div>
                      <div class="rounded-2xl border border-emerald-300/18 bg-emerald-300/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <p class="text-sm text-emerald-50">02. 整理客户背景与线索优先级</p>
                      </div>
                      <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p class="text-sm text-slate-300">03. 生成跟进建议并同步 CRM</p>
                      </div>
                      <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p class="text-sm text-slate-300">04. 人工复核后自动发出下一步动作</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="capabilities" class="reveal border-t border-white/8">
            <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
              <div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                <div class="space-y-4">
                  <p class="text-sm uppercase tracking-[0.3em] text-emerald-200">核心能力</p>
                  <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">用系统能力建立可信感，而不是只靠一句模型口号。</h2>
                  <p class="max-w-xl text-base leading-8 text-slate-300">页面结构避免机械三等分，改用 2+1 与不等比节奏呈现：既保留科技感，也让品牌官网更像成熟产品公司。</p>
                </div>
                <div class="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <article class="glass-panel rounded-[1.75rem] p-6 md:row-span-2">
                    <div class="flex items-center gap-3">
                      <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-emerald-200"><i data-lucide="database-zap" class="h-5 w-5"></i></div>
                      <div>
                        <h3 class="text-xl font-semibold text-white">知识与工具统一编排</h3>
                        <p class="mt-1 text-sm text-slate-400">把问答、检索、外部系统调用放进同一条执行链</p>
                      </div>
                    </div>
                    <p class="mt-5 text-sm leading-7 text-slate-300">适合知识问答、工单处理、线索筛选、内部 Copilot 等多业务场景。通过权限边界、来源追踪与人工接管，降低模型落地风险。</p>
                    <div class="mt-8 space-y-3">
                      <div class="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"><span>检索增强问答</span><span class="text-emerald-200">启用</span></div>
                      <div class="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"><span>流程自动执行</span><span class="text-emerald-200">可审计</span></div>
                      <div class="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"><span>人工兜底接管</span><span class="text-emerald-200">无缝切换</span></div>
                    </div>
                  </article>
                  <article class="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p class="text-sm uppercase tracking-[0.26em] text-slate-400">模型优势</p>
                    <h3 class="mt-3 text-2xl font-semibold text-white">中文业务表达更稳定</h3>
                    <p class="mt-4 text-sm leading-7 text-slate-300">长文档、复杂上下文、多角色语境下，仍能保持更自然的中文理解与输出。</p>
                  </article>
                  <article class="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p class="text-sm uppercase tracking-[0.26em] text-slate-400">可控交付</p>
                    <h3 class="mt-3 text-2xl font-semibold text-white">从试点到部署有完整路径</h3>
                    <p class="mt-4 text-sm leading-7 text-slate-300">先做场景试点，再扩到权限、知识库、审批和系统集成，不需要一开始就推翻现有流程。</p>
                  </article>
                </div>
              </div>
            </div>
          </section>

          <section id="scenarios" class="reveal border-t border-white/8 bg-white/[0.02]">
            <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
              <div class="grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
                <div class="space-y-4">
                  <p class="text-sm uppercase tracking-[0.3em] text-emerald-200">应用场景</p>
                  <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">把大模型接进真实业务，而不是只停留在体验页。</h2>
                  <p class="max-w-xl text-base leading-8 text-slate-300">从客服到销售，再到运营分析，页面用中文业务场景来建立可信度，避免空泛描述“赋能千行百业”。</p>
                </div>
                <div class="space-y-4">
                  ${scenarioCards
                    .map(
                      (card, index) => `
                        <article class="glass-panel rounded-[1.75rem] p-6">
                          <div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div class="max-w-2xl">
                              <p class="text-xs uppercase tracking-[0.26em] text-slate-400">0${index + 1}</p>
                              <h3 class="mt-3 text-2xl font-semibold text-white">${card.title}</h3>
                              <p class="mt-4 text-sm leading-7 text-slate-300">${card.copy}</p>
                            </div>
                            <div class="rounded-2xl border border-emerald-300/18 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">${card.stat}</div>
                          </div>
                        </article>
                      `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </section>

          <section id="showcase" class="reveal border-t border-white/8">
            <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
              <div class="space-y-6">
                <div class="max-w-3xl space-y-4">
                  <p class="text-sm uppercase tracking-[0.3em] text-emerald-200">模型能力展示</p>
                  <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">把 Loading / Empty / Error / Active Feedback 一起做进官网首版。</h2>
                  <p class="text-base leading-8 text-slate-300">这个区块既展示模型能力，也直接体现交互状态设计：桌面、Pad、H5 都能通过可见按钮切换，不依赖 hover 才看得见关键信息。</p>
                </div>
                <div class="flex flex-wrap gap-3" role="tablist" aria-label="模型展示状态切换">
                  <button type="button" class="state-chip is-active inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white active:scale-[0.98]" data-state="live">在线推理</button>
                  <button type="button" class="state-chip inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white active:scale-[0.98]" data-state="loading">Loading</button>
                  <button type="button" class="state-chip inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white active:scale-[0.98]" data-state="empty">Empty</button>
                  <button type="button" class="state-chip inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white active:scale-[0.98]" data-state="error">Error</button>
                </div>
                <div id="capability-panel" class="glass-panel rounded-[2rem] p-6 md:p-8"></div>
              </div>
            </div>
          </section>

          <section class="reveal border-t border-white/8 bg-white/[0.02]">
            <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
              <div class="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
                <div class="space-y-4">
                  <p class="text-sm uppercase tracking-[0.3em] text-emerald-200">客户 / 生态</p>
                  <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">适合先做试点，再逐步扩展到全链路协作。</h2>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
                    <p class="text-xs uppercase tracking-[0.24em] text-slate-400">接入生态</p>
                    <p class="mt-3 text-xl font-semibold text-white">知识库 / CRM / 工单 / BI</p>
                    <p class="mt-4 text-sm leading-7 text-slate-300">预留面向企业系统的集成表达，后续可替换为真实合作方、客户 Logo 或标准连接器能力。</p>
                  </div>
                  <div class="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
                    <p class="text-xs uppercase tracking-[0.24em] text-slate-400">交付方式</p>
                    <p class="mt-3 text-xl font-semibold text-white">SaaS / 混合部署 / 私有化</p>
                    <p class="mt-4 text-sm leading-7 text-slate-300">让官网表达不仅像产品品牌，也像可以推进采购、试点与安全评估的方案页面。</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" class="reveal border-t border-white/8">
            <div class="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:px-10">
              <div class="space-y-4 text-center">
                <p class="text-sm uppercase tracking-[0.3em] text-emerald-200">FAQ</p>
                <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">先把用户最关心的问题回答清楚。</h2>
              </div>
              <div class="mt-12 space-y-4">
                ${faqItems
                  .map(
                    (item, index) => `
                      <article class="faq-item rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" data-open="${index === 0 ? "true" : "false"}">
                        <button type="button" class="faq-toggle flex min-h-11 w-full items-center justify-between gap-4 text-left">
                          <span class="text-base font-medium text-white">${item.q}</span>
                          <span class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300"><i data-lucide="plus" class="h-4 w-4"></i></span>
                        </button>
                        <div class="faq-answer">
                          <div>
                            <p class="pt-4 text-sm leading-7 text-slate-300">${item.a}</p>
                          </div>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </section>

          <section id="cta" class="reveal border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
            <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
              <div class="glass-panel rounded-[2rem] p-8 md:p-10">
                <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                  <div class="space-y-4">
                    <p class="text-sm uppercase tracking-[0.3em] text-emerald-200">下一步</p>
                    <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">如果你已经有品牌名、Logo、案例和产品架构，我可以继续把这版替换成正式官网。</h2>
                    <p class="max-w-2xl text-base leading-8 text-slate-300">当前首版默认占位品牌为“曜识大模型”。后续只需补充真实品牌资产、客户案例、定价或部署说明，就能继续迭代成交付版。</p>
                  </div>
                  <div class="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
                    <p class="text-sm font-medium text-white">建议补充素材</p>
                    <ul class="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                      <li>1. 品牌名、Logo、品牌色、标准一句话介绍</li>
                      <li>2. 核心产品模块、行业场景、真实客户或合作生态</li>
                      <li>3. 是否支持私有化、API、知识库、Agent 工作流等真实能力说明</li>
                    </ul>
                    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a href="#" class="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-slate-950 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-300 active:scale-[0.98]">获取品牌定制版</a>
                      <a href="#faq" class="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]">查看常见问题</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;

  const capabilityPanel = container.querySelector("#capability-panel");
  const stateButtons = Array.from(container.querySelectorAll(".state-chip"));
  const faqNodes = Array.from(container.querySelectorAll(".faq-item"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function attachFeedbackAction() {
    const feedbackButton = container.querySelector("#pulse-demo");
    const feedback = container.querySelector("#active-feedback");

    if (!feedbackButton || !feedback) return;

    feedbackButton.addEventListener("click", () => {
      feedback.classList.remove("hidden");
      if (!reducedMotion && window.animate) {
        window.animate(feedback, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 420,
          easing: "easeOutExpo"
        });
      }
    });
  }

  function renderCapabilityState(stateKey) {
    capabilityPanel.innerHTML = getStatePanelMarkup(stateKey);
    stateButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.state === stateKey);
    });
    attachFeedbackAction();
    runtime.refreshIcons();
  }

  stateButtons.forEach((button) => {
    button.addEventListener("click", () => renderCapabilityState(button.dataset.state));
  });

  faqNodes.forEach((item) => {
    const button = item.querySelector(".faq-toggle");
    button?.addEventListener("click", () => {
      const willOpen = item.dataset.open !== "true";
      faqNodes.forEach((node) => {
        node.dataset.open = node === item && willOpen ? "true" : "false";
      });
    });
  });

  renderCapabilityState("live");

  const revealNodes = Array.from(container.querySelectorAll(".reveal"));
  if (!reducedMotion && window.animate) {
    window.animate(revealNodes, {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: window.anime?.stagger ? window.anime.stagger(90) : (el, i) => i * 90,
      duration: 700,
      easing: "easeOutExpo"
    });
  } else {
    revealNodes.forEach((node) => {
      node.style.opacity = "1";
      node.style.transform = "none";
    });
  }

  runtime.refreshIcons();
}
