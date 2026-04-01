const STEPS = [
  { icon: 'ri-compass-3-line', title: '选题评估', desc: 'AI 辅助选题' },
  { icon: 'ri-node-tree', title: '课程大纲', desc: '结构化拆解' },
  { icon: 'ri-slideshow-3-line', title: '课件生成', desc: '版式与素材' },
  { icon: 'ri-movie-2-line', title: '微课脚本', desc: '口播与分镜' },
];

const CAPABILITIES = [
  {
    icon: 'ri-sparkling-2-line',
    title: '全流程 AI',
    desc: '从需求到脚本，模型贯穿制课链路',
  },
  {
    icon: 'ri-stack-line',
    title: '标准可复用',
    desc: '课程大纲与模板沉淀，团队协同一致',
  },
  {
    icon: 'ri-timer-flash-line',
    title: '提效减负',
    desc: '减少重复劳动，内训师专注内容打磨',
  },
];

const HomeHero = () => {
  return (
    <>
      {/* 移动端顶栏 */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-6 pb-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-900/40 ring-1 ring-white/10">
            <i className="ri-magic-line text-xl text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-white">广东移动</p>
            <p className="text-[11px] font-medium text-slate-500">智创制课平台</p>
          </div>
        </div>
      </header>

      {/* 大屏左侧 + 移动端首屏文案 */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-8 pt-2 lg:px-12 lg:pb-16 lg:pt-12 xl:px-16">
        <div className="mb-6 hidden lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-900/35 ring-1 ring-white/10">
              <i className="ri-magic-line text-2xl text-white" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white">广东移动</p>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Course AI Platform
              </p>
            </div>
          </div>

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300/95">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            企业内训 · 智能制课
          </p>

          <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight text-white xl:text-5xl xl:leading-[1.1]">
            让每一门课
            <span className="mt-2 block bg-gradient-to-r from-emerald-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
              都可复制、可迭代
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
            面向内训场景的一站式制课工作台：大纲、课件、微课脚本由 AI
            协同完成，帮助团队稳定产出高质量课程资产。
          </p>
        </div>

        {/* 移动端标题（精简） */}
        <div className="mb-8 lg:hidden">
          <h1 className="text-[1.65rem] font-bold leading-snug tracking-tight text-white">
            智能制课
            <span className="block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              一站完成
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            AI 协同大纲、课件与微课，服务广东移动内训数字化。
          </p>
        </div>

        {/* 流程条 */}
        <div className="mb-10 w-full max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            制课链路
          </p>
          <div className="flex flex-wrap items-stretch gap-2 sm:flex-nowrap sm:gap-0">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex min-w-0 flex-1 items-center sm:flex-initial">
                <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 backdrop-blur-sm sm:px-3.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <i className={`${step.icon} text-sm text-emerald-400/90`} />
                    <span className="truncate text-xs font-semibold text-slate-200">{step.title}</span>
                  </div>
                  <span className="truncate text-[10px] text-slate-500">{step.desc}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden h-px w-3 shrink-0 self-center bg-gradient-to-r from-white/15 to-transparent sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 能力卡片 — 大屏 */}
        <div className="hidden max-w-2xl gap-3 lg:grid lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-transparent p-4 ring-1 ring-white/[0.04]"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                <i className={`${c.icon} text-lg text-cyan-300/90`} />
              </div>
              <p className="text-sm font-semibold text-white">{c.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* 数据条 */}
        <div className="mt-10 hidden flex-wrap gap-10 border-t border-white/[0.07] pt-8 lg:flex">
          {[
            { n: '8', l: '标准步骤' },
            { n: '10+', l: '智能能力' },
            { n: '全流程', l: 'AI 协同' },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-2xl font-bold tabular-nums text-white">{s.n}</p>
              <p className="text-xs text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeHero;
