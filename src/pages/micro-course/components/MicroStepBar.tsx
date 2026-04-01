import { Fragment } from 'react';

const STEPS = [
  { num: '第一步', label: '课程规划', sub: '需求描述 · 优化建议' },
  { num: '第二步', label: '脚本生成', sub: '解析需求 · 精准输出' },
  { num: '第三步', label: '脚本设计', sub: 'AI分析 · 画面匹配' },
  { num: '第四步', label: '视频合成', sub: '配音字幕 · 输出视频' },
];

interface MicroStepBarProps {
  currentStep: number;
}

const MicroStepBar = ({ currentStep }: MicroStepBarProps) => {
  return (
    <div className="bg-white border-b border-gray-100 flex-shrink-0">
      <div className="flex items-stretch">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;

          return (
            <Fragment key={step.label}>
              <div
                className={`flex-1 flex flex-col items-center justify-center py-3.5 px-4 relative select-none transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isDone
                    ? 'text-blue-500 hover:bg-blue-50 cursor-pointer'
                    : 'text-gray-400 cursor-default'
                }`}
                style={isActive ? { clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)' } : {}}
              >
                <span
                  className={`text-[10px] font-medium mb-0.5 ${
                    isActive ? 'text-blue-200' : isDone ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {step.num}
                </span>
                <span
                  className={`text-[13px] font-bold tracking-wide ${
                    isActive ? 'text-white' : isDone ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isActive ? 'text-blue-200' : isDone ? 'text-blue-300' : 'text-gray-300'
                  }`}
                >
                  {step.sub}
                </span>
                {isDone && (
                  <span className="absolute top-2 right-5 w-4 h-4 flex items-center justify-center">
                    <i className="ri-checkbox-circle-fill text-blue-500 text-xs" />
                  </span>
                )}
              </div>
              {idx < STEPS.length - 1 && !isActive && (
                <div className="w-px self-stretch bg-gray-100 flex-shrink-0" />
              )}
            </Fragment>
          );
        })}

        {/* Right info tag */}
        <div className="ml-auto flex items-center gap-2 pr-6 text-[11px] text-gray-400 whitespace-nowrap border-l border-gray-100 pl-5">
          <i className="ri-information-line text-blue-400" />
          <span>AI全程指导 · 专业标准化输出</span>
        </div>
      </div>
    </div>
  );
};

export default MicroStepBar;
