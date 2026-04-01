const STEPS = [
  { num: '第一步', label: '选题评估' },
  { num: '第二步', label: '课程分析' },
  { num: '第三步', label: '课程大纲' },
  { num: '第四步', label: '素材匹配' },
  { num: '第五步', label: '课件生成' },
  { num: '第六步', label: '课件审核' },
  { num: '第七步', label: '讲师手册' },
];

/** 箭头斜切宽度（px），与 margin 负值重叠配套 */
const ARROW_W = 14;

function clipPathFor(index: number, total: number): string {
  if (total <= 1) return 'none';
  const t = ARROW_W;
  if (index === 0) {
    return `polygon(0 0, calc(100% - ${t}px) 0, 100% 50%, calc(100% - ${t}px) 100%, 0 100%)`;
  }
  if (index === total - 1) {
    return `polygon(${t}px 0, 100% 0, 100% 100%, ${t}px 100%, 0 50%)`;
  }
  return `polygon(0 0, calc(100% - ${t}px) 0, 100% 50%, calc(100% - ${t}px) 100%, 0 100%, ${t}px 50%)`;
}

interface StepBarProps {
  currentStep?: number;
  /** 已通过「下一步」推进完成的最后一步索引（0–6），-1 表示尚无 */
  completedThrough?: number;
  onStepClick?: (stepIndex: number) => void;
}

const StepBar = ({ currentStep = 0, completedThrough = -1, onStepClick }: StepBarProps) => {
  const total = STEPS.length;

  return (
    <div className="border-b border-slate-200/90 bg-slate-100/80">
      <div className="max-w-[1800px] mx-auto px-0 sm:px-2 py-2 sm:py-3">
        <div
          className="flex items-stretch w-full min-w-0 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="课程制作步骤"
        >
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx <= completedThrough && idx !== currentStep;

            return (
              <button
                key={step.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onStepClick?.(idx)}
                style={{
                  clipPath: clipPathFor(idx, total),
                  marginLeft: idx === 0 ? 0 : -ARROW_W,
                  zIndex: isActive ? 40 : 10 + idx,
                }}
                className={[
                  'relative flex-1 min-w-[108px] sm:min-w-[120px] flex flex-col items-center justify-center',
                  'py-3 sm:py-3.5 px-4 sm:px-5 pl-5 sm:pl-7',
                  'transition-colors duration-200 ease-out cursor-pointer select-none border-0',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100',
                  isActive && 'bg-blue-600 text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.55)]',
                  !isActive &&
                    isDone &&
                    'bg-slate-200/95 text-slate-700 hover:bg-slate-300/90',
                  !isActive && !isDone && 'bg-slate-100 text-slate-500 hover:bg-slate-200/90 hover:text-slate-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'text-[11px] sm:text-[12px] md:text-[13px] font-semibold tracking-tight text-center leading-snug',
                    'whitespace-nowrap max-w-[100%] truncate px-1',
                    isActive ? 'text-white' : '',
                  ].join(' ')}
                  title={`${step.num} ${step.label}`}
                >
                  {step.num} {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepBar;
