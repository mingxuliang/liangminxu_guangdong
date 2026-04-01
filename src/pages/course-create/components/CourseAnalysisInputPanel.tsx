import { useRef } from 'react';

export interface AnalysisFormData {
  /** 拟开发课题名称（步骤一「满意，进入下一步」时自动带入，可改） */
  topicName: string;
  needBackground: string;
  businessAnalysis: string;
  taskAnalysis: string;
  requiredAbility: string;
  abilityGap: string;
  currentAbility: string;
  learningMotivation: string;
  learningStyle: string;
  pastLearningEffect: string;
}

const FIELDS: { key: keyof AnalysisFormData; label: string; placeholder: string; rows: number }[] = [
  {
    key: 'topicName',
    label: '拟开发课题名称',
    placeholder: '从步骤一选题评估带入；可在此修改后再生成分析',
    rows: 2,
  },
  {
    key: 'needBackground',
    label: '需求背景',
    placeholder: '例如：根据公司战略要求，培育全省智能门锁及其增值服务营销能力，为全屋智能其他产品正式推广...',
    rows: 3,
  },
  {
    key: 'businessAnalysis',
    label: '培训对象业务分析',
    placeholder: '1.业务考核目标：新增规模：智能门锁15万台，视频门锁占10万台\n2.业务考核现状：截至4月30日，全省...',
    rows: 4,
  },
  {
    key: 'taskAnalysis',
    label: '培训对象任务分析',
    placeholder: '1.支撑业绩目标的关键任务：门锁销售、服务支撑\n2.任务目标：...',
    rows: 3,
  },
  {
    key: 'requiredAbility',
    label: '培训对象所需的能力项及达标程度（知识、技能、态度）',
    placeholder: '1.胜任任务所需的能力项及其达标程度：\n知识：熟悉产品功能和卖点\n技能：掌握销售话术和演示\n态度：积极主动的服务意识...',
    rows: 4,
  },
  {
    key: 'abilityGap',
    label: '培训对象目前的能力短板（知识、技能、态度）',
    placeholder: '2.任务所需能力目前的能力短板：\n1）产品认知能力：停留在能知道产品基本功能\n2）客户辨识能力：过分依赖标签系统...',
    rows: 4,
  },
  {
    key: 'currentAbility',
    label: '培训对象现有能力',
    placeholder: '基本能认识产品的基础知识和资费构成，并已有一定的本产品或同类产品销售经历...',
    rows: 3,
  },
  {
    key: 'learningMotivation',
    label: '培训对象学习动机',
    placeholder: '完成业务指标、提升销售技巧、提升个人能力...',
    rows: 2,
  },
  {
    key: 'learningStyle',
    label: '培训对象学习风格分析',
    placeholder: '厅店渠道（销售员）、铁通直销：倾向于操作简单直观的内容，同时能马上体现效果的工具讲授，因此课程需有互动、具有实操性...',
    rows: 4,
  },
  {
    key: 'pastLearningEffect',
    label: '培训对象过往学习效果分析',
    placeholder: '参加过厂家的线上和现场的产品标准化培训，但因培训材料和授课方式没有站在培训学员的角度、线上培训受临时工作干扰，培训效果不佳...',
    rows: 3,
  },
];

interface Props {
  form: AnalysisFormData;
  onChange: (key: keyof AnalysisFormData, value: string) => void;
  onGenerate: () => void;
  loading?: boolean;
}

const CourseAnalysisInputPanel = ({ form, onChange, onGenerate, loading }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasAnyInput = Object.values(form).some((v) => v.trim().length > 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-[14px] font-bold text-gray-900">课题分析信息</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">填写以下信息，AI 将生成完整的课程分析评估</p>
      </div>

      {/* Form fields */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 leading-snug">
              {field.label}
            </label>
            <textarea
              className="w-full text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 resize-none leading-relaxed placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              rows={field.rows}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Generate button */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!hasAnyInput || loading}
          className={`w-full py-3 text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            hasAnyInput && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              智能生成中…
            </>
          ) : (
            <>
              <i className="ri-sparkling-2-line" />
              生成课程分析评估
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseAnalysisInputPanel;
