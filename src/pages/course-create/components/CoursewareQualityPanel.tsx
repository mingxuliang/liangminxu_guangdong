import { useState } from 'react';

export interface QualityIssue {
  id: number;
  level: 'error' | 'warning' | 'suggestion';
  slideId: number;
  slideTitle: string;
  field: string;
  issue: string;
  suggestion: string;
  accepted: boolean;
}

export const INITIAL_ISSUES: QualityIssue[] = [
  { id: 1, level: 'error', slideId: 3, slideTitle: '第一章：销售破冰与信任建立', field: '内容完整性', issue: '章节缺少学习目标描述，学员无法明确本章收益', suggestion: '在章节首页添加"学完本章，你将掌握…"的学习目标模块', accepted: false },
  { id: 2, level: 'warning', slideId: 4, slideTitle: '黄金30秒话术设计', field: '文字量', issue: '当前页面文字量过多，预计讲解超过8分钟，超出单页建议时长', suggestion: '将"实战演练"部分拆分为独立页面，保持单页重点突出', accepted: false },
  { id: 3, level: 'warning', slideId: 6, slideTitle: 'SPIN提问技术实战', field: '视觉层次', issue: '四个要点字体大小一致，缺乏视觉引导和重点强调', suggestion: '建议将S/P/I/N首字母放大处理，或采用不同颜色区分记忆点', accepted: false },
  { id: 4, level: 'suggestion', slideId: 7, slideTitle: '第三章：方案呈现与价值塑造', field: '互动设计', issue: '章节内容丰富但缺乏互动环节设计，学员参与感较低', suggestion: '在章节末添加"小组讨论：你的产品核心价值是什么？"互动页', accepted: false },
  { id: 5, level: 'suggestion', slideId: 9, slideTitle: '第四章：异议处理与成交推进', field: '案例支撑', issue: '异议处理内容偏理论，缺少真实销售场景案例', suggestion: '补充2-3个真实行业销售案例', accepted: false },
  { id: 6, level: 'error', slideId: 11, slideTitle: '第五章：客户维护与转介绍', field: '工具配套', issue: '提到客户分级管理但未提供配套工具表格', suggestion: '添加"客户价值矩阵"工具图表页，方便学员课后使用', accepted: false },
  { id: 7, level: 'suggestion', slideId: 12, slideTitle: '课程总结', field: '行动计划', issue: '行动计划仅提到"30天"但缺少具体指引', suggestion: '设计"30天销售提升打卡表"附件页或补充具体行动步骤清单', accepted: false },
];

const levelConfig = {
  error:      { label: '必须修改', color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   icon: 'ri-error-warning-fill' },
  warning:    { label: '建议修改', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'ri-alert-fill' },
  suggestion: { label: '优化建议', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'ri-lightbulb-fill' },
};

interface Props {
  issues: QualityIssue[];
  onAccept: (id: number) => void;
  onJumpToSlide: (slideId: number) => void;
  onGoEdit: (slideId: number) => void;
  acceptedCount: number;
}

const CoursewareQualityPanel = ({ issues, onAccept, onJumpToSlide, onGoEdit, acceptedCount }: Props) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warning' | 'suggestion'>('all');

  const errorCount = issues.filter(i => i.level === 'error').length;
  const warningCount = issues.filter(i => i.level === 'warning').length;
  const suggestionCount = issues.filter(i => i.level === 'suggestion').length;

  const filtered = issues.filter(i => filterLevel === 'all' || i.level === filterLevel);
  const score = Math.min(100, 68 + acceptedCount * 5);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1 h-3.5 bg-amber-400 rounded-full" />
          <span className="text-[11px] font-bold text-gray-700">PPT质量校验与优化建议</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'error', 'warning', 'suggestion'] as const).map(lv => (
            <button key={lv} type="button" onClick={() => setFilterLevel(lv)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer whitespace-nowrap transition-all ${filterLevel === lv ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {lv === 'all' ? `全部(${issues.length})` : lv === 'error' ? `必须(${errorCount})` : lv === 'warning' ? `建议(${warningCount})` : `优化(${suggestionCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Issue list */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-300">
            <i className="ri-checkbox-circle-line text-xl mb-1" />
            <p className="text-[10px]">该类型无问题</p>
          </div>
        )}
        {filtered.map(issue => {
          const cfg = levelConfig[issue.level];
          return (
            <div key={issue.id}
              className={`rounded-lg border p-2.5 transition-all text-[11px] ${issue.accepted ? 'opacity-40 bg-gray-50 border-gray-100' : `${cfg.bg} ${cfg.border}`}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <i className={`${cfg.icon} ${cfg.color} text-xs`} />
                <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                <span className="text-gray-400 text-[9px]">· {issue.field}</span>
                {issue.accepted && <span className="ml-auto text-teal-600 text-[9px] flex items-center gap-0.5"><i className="ri-check-line" />已处理</span>}
              </div>
              <button type="button" onClick={() => onJumpToSlide(issue.slideId)}
                className="flex items-center gap-1 mb-1 cursor-pointer hover:underline">
                <i className="ri-slideshow-2-line text-gray-400 text-[9px]" />
                <span className="text-[10px] text-gray-500 truncate">{issue.slideTitle}</span>
              </button>
              <p className="text-gray-700 leading-relaxed mb-1.5">{issue.issue}</p>
              <div className="bg-white/70 rounded-md px-2 py-1.5 mb-2">
                <p className="text-[9px] text-gray-400 font-medium mb-0.5">优化建议</p>
                <p className="text-gray-600 leading-relaxed">{issue.suggestion}</p>
              </div>
              {!issue.accepted && (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => onGoEdit(issue.slideId)}
                    className="flex-1 py-0.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-[10px] rounded-md cursor-pointer whitespace-nowrap transition-all">
                    <i className="ri-edit-line mr-0.5" />去修改
                  </button>
                  <button type="button" onClick={() => onAccept(issue.id)}
                    className="flex-1 py-0.5 border border-gray-200 bg-white hover:bg-teal-50 hover:border-teal-200 text-gray-500 hover:text-teal-600 text-[10px] rounded-md cursor-pointer whitespace-nowrap transition-all">
                    <i className="ri-check-line mr-0.5" />已处理
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score */}
      <div className="flex-shrink-0 border-t border-gray-100 px-3 py-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 font-medium">课件质量评分</span>
          <span className="text-[16px] font-bold text-indigo-600">{score}<span className="text-[10px] text-gray-400 font-normal">/100</span></span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: 'linear-gradient(to right,#6366f1,#8b5cf6)' }} />
        </div>
        <p className="text-[9px] text-gray-400 mt-1">每处理一条建议，评分提升约5分</p>
      </div>
    </div>
  );
};

export default CoursewareQualityPanel;
