import { useEffect, useState } from 'react';

const DEFAULT_STEPS = ['解析输入内容', '构建知识结构', '优化输出结果'];

export interface GenerationProgressScreenProps {
  /** 主标题 */
  title: string;
  /** 副标题，默认不写技术名词 */
  subtitle?: string;
  /** 底部循环高亮的步骤文案 */
  stepLabels?: string[];
  className?: string;
  /**
   * panel：白底圆角卡片（制课右侧主区域）
   * embedded：嵌入已有容器，无额外边框
   */
  layout?: 'panel' | 'embedded';
}

/**
 * 全站统一的「智能生成」等待态：渐变光晕、轨道环、流动进度条、步骤轮播。
 * 不含外部服务名称，适用于所有 AI 生成等待场景。
 */
export function GenerationProgressScreen({
  title,
  subtitle = '智能引擎正在处理，请稍候片刻',
  stepLabels,
  className = '',
  layout = 'panel',
}: GenerationProgressScreenProps) {
  const steps = stepLabels?.length ? stepLabels : DEFAULT_STEPS;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % steps.length);
    }, 1300);
    return () => window.clearInterval(t);
  }, [steps.length]);

  const inner = (
    <div className={`relative flex w-full max-w-lg flex-col items-center justify-center gap-8 px-8 py-6 text-center ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="gp-blob-anim absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/35 via-cyan-300/25 to-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-sky-300/20 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-blue-100/80 bg-white/60 shadow-lg shadow-blue-500/10 backdrop-blur-sm" />
          <div
            className="gp-orbit-ring absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-cyan-400/80"
            style={{ margin: '-2px' }}
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/35">
            <i className="ri-sparkling-2-fill text-2xl text-white" />
          </div>
        </div>

        <div className="max-w-sm space-y-2">
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">{title}</h3>
          <p className="text-[13px] leading-relaxed text-gray-500">{subtitle}</p>
        </div>

        <div className="relative z-10 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-100/90">
          <div className="gp-shimmer-bar h-full w-full rounded-full" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {steps.map((label, i) => (
            <span
              key={label}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-500 ${
                i === active
                  ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/15'
                  : 'border-transparent bg-gray-50/80 text-gray-400'
              }`}
            >
              <span
                className={`mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-blue-500 ${i === active ? 'gp-dot-pulse opacity-100' : 'opacity-30'}`}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (layout === 'embedded') {
    return (
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-[inherit]">
        {inner}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">{inner}</div>
    </div>
  );
}
