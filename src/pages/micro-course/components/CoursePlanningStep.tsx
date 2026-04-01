import { useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

const TOPIC_EXAMPLES = [
  '数字化时代的团队管理与协作',
  'AI赋能的客户服务技能提升',
  '新零售环境下的销售策略创新',
  '领导力转型:从管控到赋能',
  '数据驱动的决策思维培养',
];

const DURATION_OPTIONS = ['3分钟', '5分钟', '8分钟', '10分钟', '15分钟'];
const AUDIENCE_OPTIONS = ['基层员工', '中层管理者', '销售团队', '技术团队', '新员工', '全体员工'];

interface CoursePlanData {
  topic: string;
  audience: string;
  goal: string;
  duration: string;
  background: string;
}

interface CoursePlanningStepProps {
  onNext: (data: CoursePlanData, title: string) => void;
}

const CoursePlanningStep = ({ onNext }: CoursePlanningStepProps) => {
  const [form, setForm] = useState<CoursePlanData>({
    topic: '',
    audience: '',
    goal: '',
    duration: '5分钟',
    background: '',
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [optimizedTopic, setOptimizedTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [scoreData, setScoreData] = useState<{ label: string; score: number; tip: string }[]>([]);

  const handleGenerate = () => {
    if (!form.topic.trim()) return;
    setLoading(true);
    setGenerated(false);
    setTimeout(() => {
      const base = form.topic.trim();
      setOptimizedTopic(`${base}——实战微课精华版`);
      setSuggestions([
        `${base}：3步掌握核心技法`,
        `${base}精要：一看就懂的实操指南`,
        `告别困惑！${base}的正确打开方式`,
      ]);
      setScoreData([
        { label: '聚焦度', score: 88, tip: '主题边界清晰，内容高度聚焦，非常适合微课形式' },
        { label: '实用性', score: 92, tip: '与日常工作场景高度相关，学员能快速迁移应用' },
        { label: '传播性', score: 85, tip: '话题具备较强社交属性，适合在组织内部广泛传播' },
        { label: '完成率预测', score: 91, tip: '5分钟以内的微课完成率普遍高于传统长视频' },
      ]);
      setLoading(false);
      setGenerated(true);
    }, 2000);
  };

  const handleSelectExample = (ex: string) => {
    setForm((p) => ({ ...p, topic: ex }));
    setGenerated(false);
  };

  const handleSelectSuggestion = (s: string) => {
    setForm((p) => ({ ...p, topic: s }));
    setOptimizedTopic(s);
  };

  const handleNext = () => {
    const title = optimizedTopic || form.topic.trim() || '新建微课';
    onNext(form, title);
  };

  const isFormFilled = form.topic.trim() && form.audience && form.goal.trim();

  return (
    <div className="flex gap-5 h-full">
      {/* ── Left Input Panel ── */}
      <div className="w-[400px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-edit-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">课程需求描述</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">填写微课基本信息，AI将为你生成优化建议</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              微课主题 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.topic}
              onChange={(e) => { setForm((p) => ({ ...p, topic: e.target.value })); setGenerated(false); }}
              placeholder="请输入微课主题，例如：如何在工作中高效沟通..."
              className="w-full h-20 px-3 py-2.5 text-[12px] border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 placeholder-gray-300"
            />
            <div className="mt-2">
              <p className="text-[10px] text-gray-400 mb-1.5">主题示例参考：</p>
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => handleSelectExample(ex)}
                    className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              目标学员 <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, audience: opt }))}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    form.audience === opt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
              学习目标 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.goal}
              onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))}
              placeholder="学员完成微课后能掌握什么？能做到什么？"
              className="w-full h-16 px-3 py-2.5 text-[12px] border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 placeholder-gray-300"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">视频时长</label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, duration: d }))}
                  className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    form.duration === d
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">背景说明（选填）</label>
            <textarea
              value={form.background}
              onChange={(e) => setForm((p) => ({ ...p, background: e.target.value }))}
              placeholder="课程背景、痛点场景、特殊要求等..."
              className="w-full h-14 px-3 py-2.5 text-[12px] border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 placeholder-gray-300"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isFormFilled || loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                AI正在分析...
              </>
            ) : (
              <>
                <i className="ri-sparkling-line" />
                AI生成优化建议
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Right Output Panel ── */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-bar-chart-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">AI课程评估 &amp; 优化建议</span>
          </div>
          {generated && (
            <span className="text-[11px] text-blue-600 flex items-center gap-1">
              <i className="ri-checkbox-circle-fill" />
              分析完成
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!generated && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <i className="ri-file-chart-line text-3xl text-blue-300" />
              </div>
              <p className="text-[14px] text-gray-400 font-medium">填写左侧表单，点击生成</p>
              <p className="text-[12px] text-gray-300 mt-1">AI将为你的微课主题进行可行性评估</p>
            </div>
          )}

          {loading && (
            <div className="flex h-full min-h-[280px] flex-col">
              <GenerationProgressScreen
                layout="embedded"
                title="正在分析课程可行性"
                subtitle="智能引擎正在评估主题与受众匹配度，请稍候"
                stepLabels={['读取微课信息', '评估可行性', '生成优化建议']}
                className="flex-1 justify-center py-6"
              />
            </div>
          )}

          {generated && (
            <div className="space-y-5">
              {/* Optimized title */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-[11px] text-blue-600 font-semibold mb-2 flex items-center gap-1">
                  <i className="ri-sparkling-line" />
                  AI优化标题建议
                </p>
                <p className="text-[15px] font-bold text-gray-800">{optimizedTopic}</p>
              </div>

              {/* Score cards */}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-3">课程质量评分</p>
                <div className="grid grid-cols-2 gap-3">
                  {scoreData.map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-semibold text-gray-700">{item.label}</span>
                        <span className="text-[18px] font-black text-blue-600">{item.score}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{item.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* More title suggestions */}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-2.5">更多标题方向</p>
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-3.5 py-2.5 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-[12px] text-gray-700 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <i className="ri-lightbulb-line text-blue-500 flex-shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50 rounded-lg p-3.5 border border-amber-100">
                <p className="text-[11px] text-amber-600 font-semibold mb-1.5 flex items-center gap-1">
                  <i className="ri-information-line" />
                  微课设计建议
                </p>
                <ul className="space-y-1">
                  {[
                    `${form.duration}微课建议聚焦1-2个核心知识点`,
                    '开场15秒内需要抓住学员注意力',
                    '每个知识点配合1个真实场景案例',
                    '结尾设计行动承诺或小测验提高转化',
                  ].map((tip) => (
                    <li key={tip} className="text-[11px] text-amber-700 flex items-start gap-1.5">
                      <i className="ri-arrow-right-s-line text-amber-400 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {generated && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">确认课程方向后，进入脚本生成阶段</p>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              进入脚本生成
              <i className="ri-arrow-right-line" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export type { CoursePlanData };
export default CoursePlanningStep;
