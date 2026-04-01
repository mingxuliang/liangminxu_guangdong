import { useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

interface Props {
  loading?: boolean;
  generated?: boolean;
  evaluation?: string;
  onEvaluationChange?: (v: string) => void;
  onNext: () => void;
}

const MOCK_EVALUATION = `【课程分析评估报告】

一、需求背景分析
根据公司战略要求，本次培训需要培育全省智能门锁及其增值服务的营销能力，提升团队整体销售效能。当前业务指标明确，市场竞争激烈，团队能力参差不齐，亟需系统化培训介入。

二、培训对象画像
本次培训对象主要为厅店渠道销售员及铁通直销人员，具备一定的产品销售基础，但产品认知停留在基础层面，客户辨识能力依赖标签系统，缺乏主动销售思维和深度服务意识。

三、能力差距分析
• 知识层面：产品功能认知不足，对竞品对比、增值服务理解薄弱
• 技能层面：销售话术缺乏体系性，演示技能和客户沟通技巧有待提升
• 态度层面：部分人员主动服务意识不足，对完成指标存在畏难情绪

四、学习特征与风险点
学员偏好操作简单、直观、能即时反馈的学习内容。过往线上培训效果不佳，主要原因在于培训设计未能站在学员角度，与工作场景脱节，建议本次课程增加情景化、互动性强的内容设计。

五、综合评估建议
建议课程聚焦"会说、会演、会成交"三大核心场景，以客户辨识为切入，贯穿产品卖点提炼、演示技巧和异议处理，配合典型案例和通关练习，确保培训成果可转化落地。`;

const CourseAnalysisOutputPanel = ({ loading, generated, evaluation, onEvaluationChange, onNext }: Props) => {
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => setRegenerating(false), 1800);
  };

  /* ── Empty state ── */
  if (!generated && !loading) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-5 px-12 py-16 text-center">
        <div className="w-16 h-16 flex items-center justify-center bg-amber-50 rounded-2xl">
          <i className="ri-file-text-line text-amber-500 text-2xl" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-gray-800 mb-2">课程分析评估</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            填写左侧课题分析信息后，点击「生成课程分析评估」<br />AI 将输出完整的培训分析报告
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {['需求背景分析', '能力差距评估', '学习风险识别', '综合改进建议'].map((tag) => (
            <span key={tag} className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading && !regenerating) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <GenerationProgressScreen
          title="正在生成课程分析评估"
          subtitle="智能引擎正在整理培训需求与学员特征，请稍候"
          stepLabels={['汇总课题信息', '分析能力差距', '撰写评估结论']}
        />
      </div>
    );
  }

  /* ── Generated state ── */
  const displayText = evaluation?.trim() ? evaluation : MOCK_EVALUATION;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-file-text-fill text-amber-500 text-sm" />
            课程分析评估报告
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">AI 已完成分析，可在上方直接编辑报告</p>
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          {regenerating ? (
            <i className="ri-loader-4-line animate-spin text-xs" />
          ) : (
            <i className="ri-refresh-line text-xs" />
          )}
          重新生成
        </button>
      </div>

      {/* Evaluation content - editable */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0 min-h-0">
        {/* AI output - editable */}
        <div className="px-6 pt-4 pb-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium">AI 评估结果（可直接编辑修改）</span>
          </div>
          <textarea
            className="flex-1 min-h-[240px] w-full text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none leading-relaxed focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            value={displayText}
            onChange={(e) => onEvaluationChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
        >
          满意，进入下一步
          <i className="ri-arrow-right-line" />
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-2">下一步将输出学员画像、课程目标与设计解决思路</p>
      </div>
    </div>
  );
};

export default CourseAnalysisOutputPanel;
