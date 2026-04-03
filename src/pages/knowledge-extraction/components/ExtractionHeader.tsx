interface ExtractionHeaderProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

const steps = [
  { id: 0, label: '源头锚定', icon: 'ri-anchor-line', desc: '输入课程基础信息' },
  { id: 1, label: '分层筛选', icon: 'ri-filter-3-line', desc: '筛选核心有效内容' },
  { id: 2, label: '结构化提炼', icon: 'ri-mind-map', desc: '分层梳理知识成果' },
  { id: 3, label: '校验闭环', icon: 'ri-shield-check-line', desc: '双重校验与优化' },
];

const ExtractionHeader = ({ activeStep, onStepChange }: ExtractionHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-md shadow-blue-200">
            <i className="ri-filter-3-line text-white text-base" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">知识萃取工作台</h1>
            <p className="text-xs text-gray-400 mt-0.5">将课程知识转化为可复用的标准化资产</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-history-line text-sm" />
            历史记录
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-sm" />
            新建萃取
          </button>
        </div>
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-0">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap w-full ${
                activeStep === step.id
                  ? 'bg-blue-50 text-blue-700'
                  : activeStep > step.id
                  ? 'text-blue-500 hover:bg-blue-50/50'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                  activeStep > step.id
                    ? 'bg-blue-500 text-white'
                    : activeStep === step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {activeStep > step.id ? <i className="ri-check-line text-xs" /> : idx + 1}
              </div>
              <div className="text-left">
                <p className={`text-xs font-semibold ${activeStep === step.id ? 'text-blue-700' : activeStep > step.id ? 'text-blue-500' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 hidden sm:block">{step.desc}</p>
              </div>
            </button>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-shrink-0 w-6 mx-1 ${activeStep > idx ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractionHeader;
