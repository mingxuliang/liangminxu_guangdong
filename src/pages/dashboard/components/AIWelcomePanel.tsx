import { useState, useEffect } from 'react';
import { quickActions } from '../../../mocks/dashboard';

const typewriterTexts = [
  '帮您快速制作专业课程，节省80%制作工时，充分激发AI工具潜力，协助化为1~45分钟在线上课，使我们从材料到数字人人创课有所作为！',
  '智能提取关键知识点，一键生成高质量PPT和讲稿，让课程制作更高效更专业！',
  '基于您的材料，AI自动匹配最优课程结构，助力学员快速掌握核心技能！',
];

const AIWelcomePanel = () => {
  const [inputVal, setInputVal] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [textIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const target = typewriterTexts[textIdx];
    if (charIdx < target.length) {
      const t = setTimeout(() => {
        setDisplayText(target.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 22);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [charIdx, textIdx]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-blue-100 bg-white">
      {/* Top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-sky-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-70 pointer-events-none" />

      <div className="relative p-6 flex items-start gap-6">
        {/* AI Character */}
        <div className="relative flex-shrink-0 hidden lg:block">
          <div className="w-[110px] h-[145px] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50 to-transparent rounded-2xl" />
            <img
              src="https://readdy.ai/api/search-image?query=professional%203D%20rendered%20male%20AI%20assistant%20character%20wearing%20sharp%20navy%20blue%20business%20suit%20confident%20smile%20welcoming%20gesture%20isolated%20clean%20white%20background%20studio%20lighting%20premium%20quality%20render&width=200&height=260&seq=aichar-blue&orientation=portrait"
              alt="AI助手培培"
              className="w-full h-full object-contain object-top drop-shadow-lg"
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-2 bg-blue-300/30 rounded-full blur-sm" />
          </div>
          <div className="absolute -top-2 -right-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full px-2.5 py-1 shadow-lg shadow-blue-500/30">
            <span className="text-white text-[10px] font-bold whitespace-nowrap flex items-center gap-1">
              <span className="w-1 h-1 bg-sky-300 rounded-full animate-pulse" />
              AI 助手
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Greeting header */}
          <div className="flex items-center gap-2.5 mb-2">
            <h2 className="text-[15px] font-bold text-gray-900">你好，我是AI课程设计师培培！</h2>
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              在线服务中
            </span>
          </div>

          {/* Typewriter desc */}
          <p className="text-gray-500 text-sm leading-relaxed mb-4 min-h-[2.8rem]">
            {displayText}
            <span className="inline-block w-[2px] h-3.5 bg-blue-400 ml-0.5 animate-pulse align-middle" />
          </p>

          {/* Selected action hint */}
          {activeAction && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <i className="ri-checkbox-circle-fill text-blue-500 text-sm" />
              <span className="text-blue-700 text-xs font-medium">
                已选择：{quickActions.find((q) => q.id === activeAction)?.label}
              </span>
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="ml-auto text-blue-400 hover:text-blue-600 cursor-pointer"
              >
                <i className="ri-close-line text-sm" />
              </button>
            </div>
          )}

          {/* Input box */}
          <div
            className={`flex items-center gap-2.5 bg-white border rounded-xl px-4 py-3 transition-all duration-200 ${
              isFocused
                ? 'border-blue-400 shadow-md shadow-blue-100'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center text-blue-400 flex-shrink-0">
              <i className="ri-sparkling-2-line text-base" />
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="请先输入10个字以内的知识主题，培培帮您智能生成最优课程结构..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-blue-200"
            >
              <i className="ri-sparkling-line text-xs" />
              创课
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-3.5 flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => setActiveAction(activeAction === action.id ? null : action.id)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                  activeAction === action.id
                    ? `bg-gradient-to-r ${action.color} text-white border-transparent shadow-md`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className={`w-4 h-4 flex items-center justify-center ${
                  activeAction === action.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'
                }`}>
                  <i className={`${action.icon} text-xs`} />
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWelcomePanel;
