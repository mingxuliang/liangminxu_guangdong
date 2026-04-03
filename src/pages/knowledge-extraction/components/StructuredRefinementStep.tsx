import { useState } from 'react';

interface StructuredRefinementStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const refinementData = {
  coreKnowledge: [
    {
      id: 'ck1',
      title: '知识萃取五步法模型',
      type: '方法论',
      content: '源头锚定 → 分层筛选 → 结构化提炼 → 校验闭环 → 成果输出。每步有明确的输入输出标准，确保萃取过程可控、可复现。',
      tags: ['核心方法', '可复用', '工具化'],
    },
    {
      id: 'ck2',
      title: '需求分析三要素识别法',
      type: '实操步骤',
      content: '业务痛点识别（What）→ 根因分析（Why）→ 解决方案设计（How）。配合访谈提纲使用，确保需求分析不遗漏关键信息。',
      tags: ['需求分析', '访谈工具', '三步法'],
    },
    {
      id: 'ck3',
      title: '三级大纲MECE设计原则',
      type: '知识点',
      content: '一级：课程模块（3-5个）；二级：知识单元；三级：具体知识点。遵循MECE原则（相互独立、完全穷尽），避免知识点重叠或遗漏。',
      tags: ['大纲设计', 'MECE', '结构化'],
    },
  ],
  caseMaterials: [
    {
      id: 'cm1',
      title: '销售培训萃取成功案例',
      source: '学员第3组',
      content: '将《销售技巧》课程萃取为"客户拜访七步法"工具卡，已在团队推广使用，3个月内销售转化率提升18%。',
      highlight: '工具化落地，效果可量化',
    },
    {
      id: 'cm2',
      title: '讲师经验：判断学员理解度',
      source: '主讲讲师',
      content: '不要问"听懂了吗"，要让学员复述或举例。观察眼神和肢体语言，关键节点设置小测验，通过率低于70%需重讲。',
      highlight: '隐性经验显性化',
    },
  ],
  practicalTools: [
    {
      id: 'pt1',
      title: '知识萃取访谈提纲模板',
      format: 'Word模板',
      desc: '包含15个核心问题，覆盖显性知识、隐性经验、避坑技巧三大维度',
    },
    {
      id: 'pt2',
      title: '知识分类筛选矩阵',
      format: 'Excel工具',
      desc: '按优先级×可复用性双维度评估，自动生成筛选建议',
    },
    {
      id: 'pt3',
      title: '萃取成果质量检查清单',
      format: '检查表',
      desc: '20项质量标准，确保萃取内容准确、完整、可落地',
    },
  ],
  optimizationSuggestions: [
    { id: 'os1', content: '建议将"五步法模型"制作为可视化流程图，便于学员快速记忆和应用', priority: 'high' },
    { id: 'os2', content: '讲师经验部分建议录制短视频（3-5分钟），保留语气和情境，提升传承效果', priority: 'high' },
    { id: 'os3', content: '案例素材建议补充失败案例，形成"成功-失败"对比，加深学员理解', priority: 'medium' },
    { id: 'os4', content: '实操工具建议增加使用说明和填写示例，降低使用门槛', priority: 'medium' },
  ],
};

type TabKey = 'core' | 'case' | 'tool' | 'suggest';

const StructuredRefinementStep = ({ onNext, onPrev }: StructuredRefinementStepProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('core');
  const [editingId, setEditingId] = useState<string | null>(null);

  const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
    { key: 'core', label: '核心知识', icon: 'ri-star-line', count: refinementData.coreKnowledge.length },
    { key: 'case', label: '案例素材', icon: 'ri-file-copy-2-line', count: refinementData.caseMaterials.length },
    { key: 'tool', label: '实操工具', icon: 'ri-tools-line', count: refinementData.practicalTools.length },
    { key: 'suggest', label: '优化建议', icon: 'ri-lightbulb-line', count: refinementData.optimizationSuggestions.length },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold mb-1">结构化提炼成果</p>
            <p className="text-xs text-blue-200">按「核心知识 - 案例素材 - 实操工具 - 优化建议」四层架构梳理，逻辑清晰、重点突出</p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: '知识条目', value: '3' },
              { label: '案例素材', value: '2' },
              { label: '实操工具', value: '3' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-1 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`${tab.icon} text-sm`} />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-xs" />
              添加条目
            </button>
          </div>
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'core' && (
            <div className="space-y-3">
              {refinementData.coreKnowledge.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {item.type}
                        </span>
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-1.5">{item.title}</p>
                      {editingId === item.id ? (
                        <textarea
                          defaultValue={item.content}
                          className="w-full text-xs text-gray-600 border border-blue-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                          rows={3}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                        />
                      ) : (
                        <p className="text-xs text-gray-600 leading-relaxed">{item.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                      >
                        <i className="ri-edit-line text-xs" />
                      </button>
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'case' && (
            <div className="space-y-3">
              {refinementData.caseMaterials.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-sky-100 rounded-xl flex-shrink-0">
                      <i className="ri-file-copy-2-line text-sky-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">来源：{item.source}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{item.content}</p>
                      <div className="flex items-center gap-1.5">
                        <i className="ri-lightbulb-line text-amber-500 text-xs" />
                        <span className="text-[10px] text-amber-600 font-medium">{item.highlight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tool' && (
            <div className="grid grid-cols-3 gap-3">
              {refinementData.practicalTools.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-xl mb-3 group-hover:bg-blue-100 transition-colors">
                    <i className="ri-tools-line text-blue-500 text-base" />
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-1">{item.title}</p>
                  <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{item.format}</span>
                  <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
                  <button
                    type="button"
                    className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-download-line text-xs" />
                    下载模板
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'suggest' && (
            <div className="space-y-3">
              {refinementData.optimizationSuggestions.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${
                    item.priority === 'high' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.priority === 'high' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.priority === 'high' ? '高优先级' : '中优先级'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line" />
          返回上一步
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          进入校验闭环
          <i className="ri-arrow-right-line" />
        </button>
      </div>
    </div>
  );
};

export default StructuredRefinementStep;
