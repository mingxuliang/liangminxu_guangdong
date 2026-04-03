import { useState, useCallback } from 'react';

interface LayeredFilterStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const knowledgeItems = [
  {
    id: 'k1',
    type: 'explicit',
    category: '知识点',
    title: '知识萃取的五步法模型',
    content: '源头锚定 → 分层筛选 → 结构化提炼 → 校验闭环 → 成果输出，每步有明确的输入输出标准',
    source: 'PPT第3页',
    priority: 'high',
    reusable: true,
    selected: true,
  },
  {
    id: 'k2',
    type: 'explicit',
    category: '实操步骤',
    title: '需求分析三要素识别方法',
    content: '业务痛点识别（What）→ 根因分析（Why）→ 解决方案设计（How），配合访谈提纲使用',
    source: '讲师讲稿第2章',
    priority: 'high',
    reusable: true,
    selected: true,
  },
  {
    id: 'k3',
    type: 'explicit',
    category: '方法论',
    title: '三级大纲结构化设计原则',
    content: '一级：课程模块（3-5个）；二级：知识单元；三级：具体知识点，遵循MECE原则',
    source: '三级大纲文档',
    priority: 'high',
    reusable: true,
    selected: true,
  },
  {
    id: 'k4',
    type: 'tacit',
    category: '讲师经验',
    title: '如何判断学员是否真正理解',
    content: '讲师分享：不要问"听懂了吗"，要让学员复述或举例，观察眼神和肢体语言，关键节点设置小测验',
    source: '课堂录音整理',
    priority: 'high',
    reusable: true,
    selected: true,
  },
  {
    id: 'k5',
    type: 'tacit',
    category: '避坑技巧',
    title: '大纲设计常见误区',
    content: '误区1：知识点堆砌无逻辑；误区2：目标与内容脱节；误区3：忽视学员基础差异。对应解决方案...',
    source: '讲师经验分享',
    priority: 'medium',
    reusable: true,
    selected: true,
  },
  {
    id: 'k6',
    type: 'tacit',
    category: '学员反馈',
    title: '学员最困惑的三个问题',
    content: '①如何确定萃取边界；②显性知识和隐性知识如何区分；③萃取成果如何落地应用',
    source: '课堂互动记录',
    priority: 'medium',
    reusable: true,
    selected: false,
  },
  {
    id: 'k7',
    type: 'explicit',
    category: '知识点',
    title: '课程开发ADDIE模型',
    content: '分析(Analysis)→设计(Design)→开发(Development)→实施(Implementation)→评估(Evaluation)',
    source: 'PPT第7页',
    priority: 'low',
    reusable: false,
    selected: false,
  },
  {
    id: 'k8',
    type: 'practice',
    category: '优秀实践',
    title: '学员小组：销售培训萃取案例',
    content: '第3组学员将销售技巧课程萃取为"客户拜访七步法"工具卡，已在团队推广使用，效果显著',
    source: '学员作业展示',
    priority: 'high',
    reusable: true,
    selected: true,
  },
];

const LayeredFilterStep = ({ onNext, onPrev }: LayeredFilterStepProps) => {
  const [items, setItems] = useState(knowledgeItems);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const filtered = items.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const selectedCount = items.filter(i => i.selected).length;
  const explicitCount = items.filter(i => i.type === 'explicit' && i.selected).length;
  const tacitCount = items.filter(i => i.type === 'tacit' && i.selected).length;
  const practiceCount = items.filter(i => i.type === 'practice' && i.selected).length;

  const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    explicit: { label: '显性知识', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: 'ri-book-2-line' },
    tacit: { label: '隐性知识', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: 'ri-brain-line' },
    practice: { label: '优秀实践', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', icon: 'ri-trophy-line' },
  };

  const priorityConfig: Record<string, { label: string; dot: string }> = {
    high: { label: '高优先', dot: 'bg-blue-500' },
    medium: { label: '中优先', dot: 'bg-sky-400' },
    low: { label: '低优先', dot: 'bg-gray-300' },
  };

  return (
    <div className="flex gap-5 h-full">
      {/* Left stats */}
      <div className="w-[220px] flex-shrink-0 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-700 mb-3">筛选统计</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">已选内容</span>
              <span className="text-sm font-bold text-blue-600">{selectedCount}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">显性知识</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{explicitCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs text-gray-500">隐性知识</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{tacitCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-xs text-gray-500">优秀实践</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{practiceCount}</span>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-700 mb-3">筛选条件</p>
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">知识类型</p>
            {[
              { value: 'all', label: '全部' },
              { value: 'explicit', label: '显性知识' },
              { value: 'tacit', label: '隐性知识' },
              { value: 'practice', label: '优秀实践' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterType(opt.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  filterType === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">优先级</p>
            {[
              { value: 'all', label: '全部' },
              { value: 'high', label: '高优先' },
              { value: 'medium', label: '中优先' },
              { value: 'low', label: '低优先' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterPriority(opt.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  filterPriority === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: knowledge list */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex-1">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-filter-3-line text-blue-500 text-sm" />
              </div>
              <span className="text-xs font-bold text-gray-800">知识内容筛选</span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length} 条</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: true })))}
                className="text-[10px] text-blue-500 hover:underline cursor-pointer whitespace-nowrap"
              >
                全选
              </button>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: false })))}
                className="text-[10px] text-gray-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                清空
              </button>
            </div>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)]">
            {filtered.map(item => {
              const tc = typeConfig[item.type];
              const pc = priorityConfig[item.priority];
              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-3 transition-all cursor-pointer ${
                    item.selected ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 flex items-center justify-center rounded border flex-shrink-0 mt-0.5 transition-all ${
                      item.selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {item.selected && <i className="ri-check-line text-white text-[10px]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tc.bg} ${tc.color}`}>
                          {tc.label}
                        </span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                          <span className="text-[10px] text-gray-400">{pc.label}</span>
                        </div>
                        {item.reusable && (
                          <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">可复用</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 mb-1">{item.title}</p>
                      <div>
                        <p className={`text-[11px] text-gray-500 leading-relaxed break-all ${expandedIds.has(item.id) ? '' : 'line-clamp-2'}`}>
                          {item.content}
                        </p>
                        {item.content.length > 60 && (
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(item.id, e)}
                            className="mt-0.5 text-[10px] text-blue-500 hover:text-blue-700 cursor-pointer whitespace-nowrap"
                          >
                            {expandedIds.has(item.id) ? (
                              <><i className="ri-arrow-up-s-line" /> 收起</>
                            ) : (
                              <><i className="ri-arrow-down-s-line" /> 展开全文</>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        <i className="ri-file-line mr-1" />
                        来源：{item.source}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
            进入结构化提炼
            <i className="ri-arrow-right-line" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayeredFilterStep;
