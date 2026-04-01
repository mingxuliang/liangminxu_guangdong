import { useEffect, useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

interface DimScore {
  label: string;
  current: number;
  total: number;
  analysis: string;
}

interface AnalysisPanelProps {
  score: number;
  dimensions: DimScore[];
  onNext: () => void;
  loading?: boolean;
  generated?: boolean;
  generatedTopicName?: string;
  suggestions?: string[];
  onSelectSuggestion?: (s: string) => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 44;

const AnalysisPanel = ({
  score,
  dimensions,
  onNext,
  loading,
  generated,
  generatedTopicName,
  suggestions = [],
  onSelectSuggestion,
}: AnalysisPanelProps) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (generated) {
      setAnimated(false);
      const t = setTimeout(() => setAnimated(true), 200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [generated]);

  const strokeDash = animated ? CIRCUMFERENCE * (1 - score / 100) : CIRCUMFERENCE;

  /* ── Empty state ── */
  if (!generated && !loading) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-5 px-12 py-16 text-center">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-2xl">
          <i className="ri-sparkling-2-line text-blue-500 text-2xl" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-gray-800 mb-2">AI 评估报告</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            填写左侧课程信息后，点击「生成评估报告」<br />AI 将自动分析并生成课题名称与评分
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {['课题名称生成', '四维评估分析', '优化主题建议'].map((tag) => (
            <span key={tag} className="text-[11px] text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <GenerationProgressScreen
          title="正在生成评估结果"
          subtitle="智能引擎正在分析课题与四维评分，请稍候"
          stepLabels={['解析课程信息', '评估课题价值', '生成优化建议']}
        />
      </div>
    );
  }

  /* ── Generated state ── */
  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
      {/* Generated topic name */}
      {generatedTopicName && (
        <div className="px-8 pt-6 pb-5 border-b border-gray-50">
          <p className="text-[11px] text-gray-400 font-medium mb-2 flex items-center gap-1.5">
            <i className="ri-flag-2-fill text-blue-500 text-xs" />
            拟开发主题名
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[13px] px-4 py-2 rounded-full border border-blue-100 font-semibold">
              <i className="ri-bookmark-fill text-blue-400 text-xs" />
              {generatedTopicName}
            </span>
          </div>
        </div>
      )}

      {/* Score area */}
      <div className="px-8 pt-5 pb-5 border-b border-gray-50">
        <div className="flex items-center gap-10">
          {/* Circle score */}
          <div className="relative flex-shrink-0 w-28 h-28 flex items-center justify-center">
            <svg width="112" height="112" className="absolute inset-0 -rotate-90">
              <circle cx="56" cy="56" r="44" fill="none" stroke="#e8f0fe" strokeWidth="8" />
              <circle
                cx="56"
                cy="56"
                r="44"
                fill="none"
                stroke="#2563eb"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDash}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="relative text-center">
              <span className="block text-3xl font-black text-blue-600 leading-none">{score}</span>
              <span className="block text-[10px] text-gray-400 mt-1 font-medium">综合分</span>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="flex-1 space-y-3">
            {dimensions.map((dim) => (
              <div key={dim.label} className="flex items-center gap-3">
                <span className="text-[12px] text-gray-500 w-12 flex-shrink-0">{dim.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: animated ? `${(dim.current / dim.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 w-12 text-right flex-shrink-0">
                  {dim.current}/{dim.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis results */}
      <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
        {/* Dimension analysis */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-bold text-gray-900">AI分析结果</span>
            <span className="text-[11px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 whitespace-nowrap">
              告诉你的课程主题，有一些优化建议
            </span>
          </div>
          <div className="space-y-4">
            {dimensions.map((dim, idx) => (
              <div key={dim.label} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {idx === 0 ? (
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 border border-blue-200">
                      <i className="ri-add-line text-blue-600 text-xs font-bold" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                      <i className="ri-close-line text-gray-500 text-xs" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-800 mb-0.5">{dim.label}</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">{dim.analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p className="text-[12px] text-gray-500 font-semibold mb-3 flex items-center gap-1.5">
              <i className="ri-lightbulb-line text-amber-400" />
              拟开发课题名称建议
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSelectSuggestion?.(s)}
                  className="w-full text-left px-4 py-2.5 text-[12px] text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all cursor-pointer leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-8 pb-7 pt-4 flex-shrink-0 border-t border-gray-50">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
        >
          满意，进入下一步
          <i className="ri-arrow-right-line" />
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-2.5">不满意评分结果？可以修改信息重新生成</p>
      </div>
    </div>
  );
};

export default AnalysisPanel;
