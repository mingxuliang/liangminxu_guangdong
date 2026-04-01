import { useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

const MOCK_SCRIPT = `【开场白 | 0:00-0:30】
画面：职场会议室，一位主管看着手机皱眉

旁白："你有没有遇到过这样的情况——发出去的消息，对方回复'好的'，但最后根本没按你说的做？"

引导："今天，我们来聊聊一个职场必备技能——高效沟通的三步法则。"

---

【知识点一 | 0:30-2:00】
核心：明确意图，先说结论

画面：对比展示「模糊表达」vs「清晰表达」

脚本：
"很多人沟通无效，是因为说了半天没讲清楚'我要什么'。

高效沟通的第一步：先说结论，再说理由。

比如，不要说'最近项目有点问题，可能需要调整'。
要说'这个项目我们需要延期3天，原因是供应商延迟交货，我已有应对方案'。

一句话，把结论、原因、方案全部说清楚。"

---

【知识点二 | 2:00-3:30】
核心：确认理解，避免信息失真

画面：传话游戏动画，信息逐渐变形

脚本：
"说完了，就以为对方听懂了？

高效沟通的第二步：用提问确认理解。

说完之后，可以问对方：'你觉得这样安排有没有问题？'或者'你能复述一下咱们达成的共识吗？'

这不是不信任，而是对结果负责。"

---

【结尾行动 | 3:30-4:00】
画面：一位职场人自信发消息

脚本：
"今天学了高效沟通的核心——先说结论，再确认理解。

从今天起，试着在每次重要沟通前，先在心里想：我要说什么结论？对方需要做什么行动？

这个小习惯，能让你的职场效率提升至少30%。"

行动提示：【今日行动】在下一次重要沟通中，用'结论+原因+行动'的结构表达。`;

const SCRIPT_SEGMENTS = [
  { id: 's1', time: '0:00-0:30', type: '开场白', color: 'blue', summary: '职场场景引入，激发共鸣' },
  { id: 's2', time: '0:30-2:00', type: '知识点一', color: 'sky', summary: '先说结论法则' },
  { id: 's3', time: '2:00-3:30', type: '知识点二', color: 'indigo', summary: '确认理解技巧' },
  { id: 's4', time: '3:30-4:00', type: '结尾行动', color: 'amber', summary: '总结与行动承诺' },
];

interface ScriptGenerationStepProps {
  courseTitle: string;
  onBack: () => void;
  onNext: (script: string) => void;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  sky: 'bg-sky-100 text-sky-700 border-sky-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
};

const ScriptGenerationStep = ({ courseTitle, onBack, onNext }: ScriptGenerationStepProps) => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [script, setScript] = useState('');
  const [activeSegment, setActiveSegment] = useState('s1');
  const [style, setStyle] = useState<'professional' | 'casual' | 'story'>('professional');

  const STYLE_OPTIONS = [
    { value: 'professional', label: '专业严谨', desc: '逻辑清晰，数据支撑' },
    { value: 'casual', label: '轻松对话', desc: '亲切自然，易于理解' },
    { value: 'story', label: '故事化叙述', desc: '场景带入，情感共鸣' },
  ] as const;

  const handleGenerate = () => {
    setLoading(true);
    setGenerated(false);
    setTimeout(() => {
      setScript(MOCK_SCRIPT);
      setLoading(false);
      setGenerated(true);
    }, 2800);
  };

  return (
    <div className="flex gap-5 h-full">
      {/* ── Left: Requirements Parse Panel ── */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-search-eye-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">解析输入需求</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Course info */}
          <div className="bg-blue-50 rounded-lg p-3.5 border border-blue-100">
            <p className="text-[10px] text-blue-600 font-semibold mb-1">微课主题</p>
            <p className="text-[13px] font-bold text-gray-800">{courseTitle || '高效职场沟通三步法'}</p>
          </div>

          {/* Parsed requirements */}
          <div>
            <p className="text-[12px] font-semibold text-gray-600 mb-2.5">AI需求解析结果</p>
            <div className="space-y-2">
              {[
                { icon: 'ri-user-line', label: '目标受众', value: '职场中层管理者' },
                { icon: 'ri-flag-line', label: '核心目标', value: '掌握2个沟通核心技巧' },
                { icon: 'ri-time-line', label: '课程时长', value: '5分钟精华版' },
                { icon: 'ri-lightbulb-line', label: '知识点数', value: '2个核心知识点' },
                { icon: 'ri-emotion-line', label: '情感基调', value: '共鸣 → 启发 → 行动' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`${item.icon} text-blue-500 text-xs`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">{item.label}</p>
                    <p className="text-[11px] font-semibold text-gray-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Script style */}
          <div>
            <p className="text-[12px] font-semibold text-gray-600 mb-2">脚本风格</p>
            <div className="space-y-2">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStyle(opt.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    style === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <p className={`text-[12px] font-semibold ${style === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Segments overview */}
          {generated && (
            <div>
              <p className="text-[12px] font-semibold text-gray-600 mb-2">脚本结构</p>
              <div className="space-y-1.5">
                {SCRIPT_SEGMENTS.map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setActiveSegment(seg.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      activeSegment === seg.id ? colorMap[seg.color] : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">{seg.type}</span>
                      <span className="text-[10px] opacity-70">{seg.time}</span>
                    </div>
                    <p className="text-[10px] opacity-70 mt-0.5">{seg.summary}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-[13px] font-semibold rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <><i className="ri-loader-4-line animate-spin" />AI生成中...</>
            ) : generated ? (
              <><i className="ri-refresh-line" />重新生成脚本</>
            ) : (
              <><i className="ri-sparkling-line" />精准输出脚本</>
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            ← 返回课程规划
          </button>
        </div>
      </div>

      {/* ── Right: Script Editor ── */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-file-text-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">精准输出脚本</span>
          </div>
          {generated && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400">字数：约{script.replace(/\s/g, '').length}字</span>
              <button type="button" className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap flex items-center gap-1">
                <i className="ri-download-line" />
                导出脚本
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {!generated && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <i className="ri-quill-pen-line text-3xl text-blue-300" />
              </div>
              <p className="text-[14px] text-gray-400 font-medium">点击左侧按钮，AI生成专业脚本</p>
              <p className="text-[12px] text-gray-300 mt-1">系统将根据你的课程需求，精准输出结构化脚本</p>
            </div>
          )}

          {loading && (
            <div className="flex h-full min-h-[280px] flex-col">
              <GenerationProgressScreen
                layout="embedded"
                title="正在生成专业脚本"
                subtitle="智能引擎正在解析课程结构并编排表达，请稍候"
                stepLabels={['解析课程结构', '设计表达方式', '输出脚本内容']}
                className="flex-1 justify-center py-6"
              />
            </div>
          )}

          {generated && (
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-full px-6 py-5 text-[12px] text-gray-700 leading-relaxed resize-none focus:outline-none font-mono"
              style={{ fontFamily: '\'Noto Serif SC\', serif' }}
            />
          )}
        </div>

        {generated && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <i className="ri-edit-line" />
              <span>可直接编辑脚本内容，确认无误后进入下一步</span>
            </div>
            <button
              type="button"
              onClick={() => onNext(script)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              进入脚本设计
              <i className="ri-arrow-right-line" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerationStep;
