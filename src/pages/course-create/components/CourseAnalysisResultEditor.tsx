import { useEffect, useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';
import type { CourseAnalysisResultData } from '@/services/dify/step2-parse';

interface CourseGoal {
  knowledge: string[];
  skill: string[];
  attitude: string[];
}

const MOCK_RESULT: CourseAnalysisResultData = {
  learnerPortrait: `本次课程的目标学员为中国电信全省厅店渠道销售员及铁通直销人员，主要工作职责是完成智能门锁及相关增值服务的销售指标。

学员整体具备一定的产品销售基础，熟悉基本产品功能和资费构成，有同类产品销售经历。学习风格上偏好简单直观、即时见效的学习方式，对互动性强、贴近真实工作场景的内容接受度高，但对纯理论讲授和复杂操作流程耐受性较低。

学员当前面临的主要挑战是：产品认知停留在基础功能层面，客户辨识过度依赖标签系统，主动销售意识薄弱，缺乏系统化的销售话术与演示技能。在学习动机方面，完成业务指标、提升个人收入是最强驱动力。`,

  courseGoals: {
    knowledge: [
      '掌握智能门锁全系产品功能特点、核心卖点及差异化竞争优势，能清晰阐述各产品适用场景',
      '理解目标客户群体的业务需求与消费心理，能有效识别高潜力客户的关键信号',
      '了解智能门锁增值服务体系的内容与价值，能向客户说明服务优势及附加价值',
    ],
    skill: [
      '能熟练运用 FABE 话术完成产品讲解与演示，在模拟情境中达到客户 80% 以上满意度',
      '掌握客户异议处理的标准流程，能针对常见拒绝理由给出有效应对方案并推动成交',
      '能独立策划并执行一场完整的产品体验活动，包含需求挖掘、演示呈现、促成成交全流程',
    ],
    attitude: [
      '建立以客户需求为中心的服务意识，主动关注客户体验，而非仅关注销售指标完成',
      '养成主动学习和持续复盘的工作习惯，定期总结销售经验并与团队分享',
      '对智能家居行业发展保持积极关注，认识到持续提升专业能力对个人职业发展的长期价值',
    ],
  },

  designApproach: `本课程将采用「情景驱动 + 能力递进」的设计框架，围绕真实销售场景构建完整的学习路径。

一、问题导向切入
以"为什么卖不出去"为核心问题，引导学员诊断自身能力短板，激发学习动机，打破固有销售思维定式。

二、场景化内容设计
将课程内容拆解为三大核心销售场景：
• 客户识别场景：如何在厅店环境中快速识别高潜力客户，运用观察法和主动沟通建立初步信任
• 产品演示场景：以"看、摸、用"三步演示法呈现产品价值，结合竞品对比突出差异化优势
• 成交促进场景：处理常见异议的标准应答库建设，运用小步成交技术推动决策

三、互动与练习设计
每个场景模块配备 2-3 个情景模拟练习，采用角色扮演形式，设置观察员反馈机制，确保每位学员完成至少一次完整的销售流程演练。

四、成果转化保障
课程结束后，提供标准化的"销售工具包"（含产品卡片、异议处理手册、客户跟进模板），帮助学员将课堂所学直接转化为工作工具，降低落地门槛。`,
};

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  /** 来自步骤二-B Dify；未传时使用内置 MOCK */
  initialData?: CourseAnalysisResultData | null;
  loading?: boolean;
}

const CourseAnalysisResultEditor = ({ onBack, onNext, initialData, loading }: Props) => {
  const [data, setData] = useState<CourseAnalysisResultData>(() => initialData ?? MOCK_RESULT);

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);
  const [activeTab, setActiveTab] = useState<'portrait' | 'goals' | 'approach'>('portrait');
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateGoal = (type: keyof CourseGoal, idx: number, val: string) => {
    setData((prev) => ({
      ...prev,
      courseGoals: {
        ...prev.courseGoals,
        [type]: prev.courseGoals[type].map((item, i) => (i === idx ? val : item)),
      },
    }));
  };

  const buildWordHtml = () => {
    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>课程分析结果</title>
      <style>body{font-family:Microsoft YaHei,Arial;margin:40px;color:#222;line-height:1.8;}
      h1{font-size:20px;color:#1a56db;border-bottom:2px solid #1a56db;padding-bottom:8px;margin-bottom:20px;}
      h2{font-size:16px;color:#374151;margin:24px 0 10px;border-left:4px solid #1a56db;padding-left:10px;}
      p{font-size:13px;margin:0 0 10px;text-indent:2em;}
      table{width:100%;border-collapse:collapse;margin:12px 0;}
      th{background:#1a56db;color:#fff;padding:8px 12px;text-align:left;font-size:13px;}
      td{padding:6px 12px;border:1px solid #ddd;font-size:13px;}</style></head>
      <body>
      <h1>课程分析结果报告</h1>
      <h2>一、学员画像</h2>
      ${data.learnerPortrait.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
      <h2>二、课程目标</h2>
      <table>
        <tr><th style="width:120px;">目标类型</th><th>序号</th><th>具体目标</th></tr>
        ${data.courseGoals.knowledge.map((item, i) => `<tr><td rowspan="${i === 0 ? 3 : 0}" style="font-weight:bold;border:1px solid #ddd;padding:6px 12px;">${i === 0 ? '知识目标' : ''}</td><td style="border:1px solid #ddd;padding:6px 12px;text-align:center;">${i + 1}</td><td style="border:1px solid #ddd;padding:6px 12px;">${item}</td></tr>`).join('')}
        ${data.courseGoals.skill.map((item, i) => `<tr><td rowspan="${i === 0 ? 3 : 0}" style="font-weight:bold;border:1px solid #ddd;padding:6px 12px;">${i === 0 ? '技能目标' : ''}</td><td style="border:1px solid #ddd;padding:6px 12px;text-align:center;">${i + 1}</td><td style="border:1px solid #ddd;padding:6px 12px;">${item}</td></tr>`).join('')}
        ${data.courseGoals.attitude.map((item, i) => `<tr><td rowspan="${i === 0 ? 3 : 0}" style="font-weight:bold;border:1px solid #ddd;padding:6px 12px;">${i === 0 ? '态度目标' : ''}</td><td style="border:1px solid #ddd;padding:6px 12px;text-align:center;">${i + 1}</td><td style="border:1px solid #ddd;padding:6px 12px;">${item}</td></tr>`).join('')}
      </table>
      <h2>三、课程设计解决思路</h2>
      ${data.designApproach.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
      </body></html>`;
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      const html = buildWordHtml();
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '课程分析结果报告.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TAB_LABELS: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'portrait', label: '学员画像', icon: 'ri-user-heart-line' },
    { key: 'goals', label: '课程目标', icon: 'ri-target-line' },
    { key: 'approach', label: '设计解决思路', icon: 'ri-map-2-line' },
  ];

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <GenerationProgressScreen
          layout="embedded"
          title="正在生成学员画像与课程目标"
          subtitle="智能引擎正在串联分析结果并生成结构化内容，请稍候"
          stepLabels={['提炼学员画像', '生成课程目标', '撰写设计思路']}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
            >
              <i className="ri-arrow-left-line text-sm" />
            </button>
          )}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
              <i className="ri-file-word-line text-blue-500 text-sm" />
              课程分析结果
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">所有内容均可编辑，完成后一键下载 Word 文档</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-green-100"
        >
          {downloading ? (
            <i className="ri-loader-4-line animate-spin text-sm" />
          ) : (
            <i className="ri-download-2-line text-sm" />
          )}
          下载 Word 文档
        </button>
      </div>

      {/* Tab navigation */}
      <div className="px-6 pt-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full w-fit">
          {TAB_LABELS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={`${tab.icon} text-xs`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* 学员画像 */}
        {activeTab === 'portrait' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 flex items-center justify-center bg-blue-50 rounded-lg">
                <i className="ri-user-heart-line text-blue-500 text-sm" />
              </div>
              <span className="text-[13px] font-bold text-gray-900">学员画像</span>
              <span className="text-[11px] text-gray-400 ml-1">（点击文字区域可直接编辑）</span>
            </div>
            <textarea
              className="w-full min-h-[400px] text-[13px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 resize-none leading-loose focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              value={data.learnerPortrait}
              onChange={(e) => setData((prev) => ({ ...prev, learnerPortrait: e.target.value }))}
            />
          </div>
        )}

        {/* 课程目标 */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 flex items-center justify-center bg-green-50 rounded-lg">
                <i className="ri-target-line text-green-500 text-sm" />
              </div>
              <span className="text-[13px] font-bold text-gray-900">课程目标</span>
              <span className="text-[11px] text-gray-400 ml-1">（知识/技能/态度各三条，均可编辑）</span>
            </div>
            {(
              [
                { type: 'knowledge' as const, label: '知识目标', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
                { type: 'skill' as const, label: '技能目标', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
                { type: 'attitude' as const, label: '态度目标', color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700' },
              ]
            ).map((cat) => (
              <div key={cat.type} className={`rounded-xl border ${cat.borderColor} ${cat.bgColor} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[12px] font-bold ${cat.textColor}`}>{cat.label}</span>
                </div>
                <div className="space-y-2.5">
                  {data.courseGoals[cat.type].map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className={`mt-2.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-white border ${cat.borderColor} ${cat.textColor} text-[10px] font-bold`}>
                        {idx + 1}
                      </span>
                      <textarea
                        className="flex-1 text-[12px] text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none leading-relaxed focus:outline-none focus:border-blue-400 transition-all"
                        rows={2}
                        value={item}
                        onChange={(e) => updateGoal(cat.type, idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 课程设计解决思路 */}
        {activeTab === 'approach' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 flex items-center justify-center bg-teal-50 rounded-lg">
                <i className="ri-map-2-line text-teal-500 text-sm" />
              </div>
              <span className="text-[13px] font-bold text-gray-900">课程设计解决思路</span>
              <span className="text-[11px] text-gray-400 ml-1">（点击文字区域可直接编辑）</span>
            </div>
            <textarea
              className="w-full min-h-[440px] text-[13px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 resize-none leading-loose focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              value={data.designApproach}
              onChange={(e) => setData((prev) => ({ ...prev, designApproach: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
        <div className="flex gap-1.5">
          {TAB_LABELS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${activeTab === tab.key ? 'bg-blue-500 w-5' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`切换到${tab.label}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
              <i className="ri-check-line text-xs" />
              保存成功
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-[12px] font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-save-line text-sm" />
            保存
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-[12px] font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            {downloading ? (
              <i className="ri-loader-4-line animate-spin text-sm" />
            ) : (
              <i className="ri-file-word-line text-sm" />
            )}
            导出 Word
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            满意，进入下一步
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalysisResultEditor;
