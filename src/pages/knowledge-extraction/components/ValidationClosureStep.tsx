import { useState, useRef } from 'react';

interface ValidationClosureStepProps {
  onPrev: () => void;
}

// ─── 审核规则定义 ───────────────────────────────────────────────
const validationRules = [
  {
    id: 'rule1',
    title: '知识准确性',
    desc: '内容准确无误，经过业务/讲师验证',
    icon: 'ri-shield-check-line',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'rule2',
    title: '目标对齐性',
    desc: '与课程目标一致，无遗漏无冗余',
    icon: 'ri-focus-3-line',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  {
    id: 'rule3',
    title: '复用价值',
    desc: '可复用到带教、复训、微课等场景',
    icon: 'ri-recycle-line',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
];

// ─── 知识条目类型 ────────────────────────────────────────────────
interface KnowledgeItem {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  validation: { rule1: boolean; rule2: boolean; rule3: boolean };
  v1Content: string;   // 1.0 原始内容（不可变）
  v2Content: string;   // 2.0 修改后内容
  modified: boolean;
  reExtracted: boolean;
}

// ─── 初始数据 ────────────────────────────────────────────────────
const buildInitialList = (): KnowledgeItem[] => [
  {
    id: 'k1',
    type: '核心知识',
    title: '知识萃取五步法模型',
    content: '源头锚定 → 分层筛选 → 结构化提炼 → 校验闭环 → 成果输出。每步有明确的输入输出标准，确保萃取过程可控、可复现，适用于企业知识沉淀全场景。',
    tags: ['核心方法论', '可复用', '工具化'],
    validation: { rule1: true, rule2: true, rule3: true },
    v1Content: '源头锚定 → 分层筛选 → 结构化提炼 → 校验闭环 → 成果输出。每步有明确的输入输出标准，确保萃取过程可控、可复现，适用于企业知识沉淀全场景。',
    v2Content: '源头锚定 → 分层筛选 → 结构化提炼 → 校验闭环 → 成果输出。每步有明确的输入输出标准，确保萃取过程可控、可复现，适用于企业知识沉淀全场景。',
    modified: false,
    reExtracted: false,
  },
  {
    id: 'k2',
    type: '核心知识',
    title: '需求分析三要素识别法',
    content: '业务痛点识别（What）→ 根因分析（Why）→ 解决方案设计（How）。配合访谈提纲使用，确保需求分析不遗漏关键信息，已在3个项目中验证有效。',
    tags: ['需求分析', '访谈工具', '三步法'],
    validation: { rule1: true, rule2: false, rule3: true },
    v1Content: '业务痛点识别（What）→ 根因分析（Why）→ 解决方案设计（How）。配合访谈提纲使用，确保需求分析不遗漏关键信息，已在3个项目中验证有效。',
    v2Content: '业务痛点识别（What）→ 根因分析（Why）→ 解决方案设计（How）。配合访谈提纲使用，确保需求分析不遗漏关键信息，已在3个项目中验证有效。',
    modified: false,
    reExtracted: false,
  },
  {
    id: 'k3',
    type: '方法论',
    title: '三级大纲MECE设计原则',
    content: '一级：课程模块（3-5个）；二级：知识单元；三级：具体知识点。遵循MECE原则（相互独立、完全穷尽），避免知识点重叠或遗漏，已通过讲师验证。',
    tags: ['大纲设计', 'MECE', '结构化'],
    validation: { rule1: true, rule2: true, rule3: false },
    v1Content: '一级：课程模块（3-5个）；二级：知识单元；三级：具体知识点。遵循MECE原则（相互独立、完全穷尽），避免知识点重叠或遗漏，已通过讲师验证。',
    v2Content: '一级：课程模块（3-5个）；二级：知识单元；三级：具体知识点。遵循MECE原则（相互独立、完全穷尽），避免知识点重叠或遗漏，已通过讲师验证。',
    modified: false,
    reExtracted: false,
  },
  {
    id: 'k4',
    type: '配套案例',
    title: '销售培训萃取成功案例',
    content: '将《销售技巧》课程萃取为"客户拜访七步法"工具卡，已在团队推广使用，3个月内销售转化率提升18%。案例来源：2025年Q2销售部门实践报告。',
    tags: ['成功案例', '效果可量化', '可复用'],
    validation: { rule1: false, rule2: true, rule3: true },
    v1Content: '将《销售技巧》课程萃取为"客户拜访七步法"工具卡，已在团队推广使用，3个月内销售转化率提升18%。案例来源：2025年Q2销售部门实践报告。',
    v2Content: '将《销售技巧》课程萃取为"客户拜访七步法"工具卡，已在团队推广使用，3个月内销售转化率提升18%。案例来源：2025年Q2销售部门实践报告。',
    modified: false,
    reExtracted: false,
  },
  {
    id: 'k5',
    type: '配套案例',
    title: '讲师经验：判断学员理解度',
    content: '不要问"听懂了吗"，要让学员复述或举例。观察眼神和肢体语言，关键节点设置小测验，通过率低于70%需重讲。此为主讲讲师10年教学隐性经验显性化。',
    tags: ['隐性经验', '讲师验证', '带教场景'],
    validation: { rule1: true, rule2: true, rule3: false },
    v1Content: '不要问"听懂了吗"，要让学员复述或举例。观察眼神和肢体语言，关键节点设置小测验，通过率低于70%需重讲。此为主讲讲师10年教学隐性经验显性化。',
    v2Content: '不要问"听懂了吗"，要让学员复述或举例。观察眼神和肢体语言，关键节点设置小测验，通过率低于70%需重讲。此为主讲讲师10年教学隐性经验显性化。',
    modified: false,
    reExtracted: false,
  },
  {
    id: 'k6',
    type: '实操工具',
    title: '知识萃取访谈提纲模板',
    content: '包含15个核心问题，覆盖显性知识、隐性经验、避坑技巧三大维度。已标准化为企业通用模板，可直接用于新人带教和复训场景，无需二次改造。',
    tags: ['Word模板', '标准化', '即用型'],
    validation: { rule1: true, rule2: true, rule3: true },
    v1Content: '包含15个核心问题，覆盖显性知识、隐性经验、避坑技巧三大维度。已标准化为企业通用模板，可直接用于新人带教和复训场景，无需二次改造。',
    v2Content: '包含15个核心问题，覆盖显性知识、隐性经验、避坑技巧三大维度。已标准化为企业通用模板，可直接用于新人带教和复训场景，无需二次改造。',
    modified: false,
    reExtracted: false,
  },
];

// ─── 差异分析工具函数 ────────────────────────────────────────────
function computeDiff(v1: string, v2: string): Array<{ type: 'same' | 'removed' | 'added'; text: string }> {
  if (v1 === v2) return [{ type: 'same', text: v1 }];
  const result: Array<{ type: 'same' | 'removed' | 'added'; text: string }> = [];
  // 按句子分割做简单差异对比
  const sep = /([。！？；\n])/;
  const v1Parts = v1.split(sep).filter(Boolean);
  const v2Parts = v2.split(sep).filter(Boolean);
  const v1Set = new Set(v1Parts);
  const v2Set = new Set(v2Parts);
  // 找出删除的部分
  v1Parts.forEach(part => {
    if (!v2Set.has(part)) result.push({ type: 'removed', text: part });
  });
  // 找出新增的部分
  v2Parts.forEach(part => {
    if (!v1Set.has(part)) result.push({ type: 'added', text: part });
  });
  // 找出相同的部分
  v1Parts.forEach(part => {
    if (v2Set.has(part)) result.push({ type: 'same', text: part });
  });
  // 如果没有差异片段，直接返回整体对比
  if (result.length === 0) {
    return [
      { type: 'removed', text: v1 },
      { type: 'added', text: v2 },
    ];
  }
  return result;
}

type ViewMode = 'list' | 'compare' | 'success';
type PanelMode = 'v1' | 'v2' | 'diff';

// ─── 版本查看面板 ────────────────────────────────────────────────
interface VersionPanelProps {
  item: KnowledgeItem;
  onClose: () => void;
}

const VersionPanel = ({ item, onClose }: VersionPanelProps) => {
  const [mode, setMode] = useState<PanelMode>('diff');
  const diffResult = computeDiff(item.v1Content, item.v2Content);
  const hasChange = item.v1Content !== item.v2Content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[680px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl">
              <i className="ri-git-branch-line text-gray-600 text-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{item.title}</p>
              <p className="text-[10px] text-gray-400">版本内容查看与差异分析</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          {[
            { key: 'v1' as PanelMode, label: '1.0 原始版本', icon: 'ri-file-text-line' },
            { key: 'v2' as PanelMode, label: '2.0 优化版本', icon: 'ri-file-edit-line' },
            { key: 'diff' as PanelMode, label: '差异对比', icon: 'ri-git-merge-line' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                mode === tab.key
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
            >
              <i className={`${tab.icon} text-xs`} />
              {tab.label}
            </button>
          ))}
          {!hasChange && (
            <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              1.0 与 2.0 内容一致，暂无差异
            </span>
          )}
          {hasChange && (
            <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              内容已优化
            </span>
          )}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'v1' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">1.0 原始版本</span>
                <span className="text-[10px] text-gray-400">初次萃取内容，未经修改</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{item.v1Content}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {mode === 'v2' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">2.0 优化版本</span>
                <span className="text-[10px] text-gray-400">
                  {item.modified ? '经人工编辑优化' : item.reExtracted ? '经重新提取更新' : '与1.0版本一致'}
                </span>
              </div>
              <div className={`rounded-xl p-4 border ${item.modified || item.reExtracted ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-sm text-gray-700 leading-relaxed">{item.v2Content}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {mode === 'diff' && (
            <div className="space-y-4">
              {!hasChange ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-2xl mb-3">
                    <i className="ri-check-line text-gray-400 text-xl" />
                  </div>
                  <p className="text-sm text-gray-500">1.0 与 2.0 内容完全一致</p>
                  <p className="text-xs text-gray-400 mt-1">该条知识尚未进行编辑或重新提取</p>
                </div>
              ) : (
                <>
                  {/* 并排对比 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500">1.0 原始版本</span>
                      </div>
                      <div className="bg-red-50/40 border border-red-100 rounded-xl p-3">
                        <p className="text-xs text-gray-600 leading-relaxed">{item.v1Content}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700">2.0 优化版本</span>
                      </div>
                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3">
                        <p className="text-xs text-gray-600 leading-relaxed">{item.v2Content}</p>
                      </div>
                    </div>
                  </div>

                  {/* 差异高亮分析 */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 mb-2">差异分析</p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5">
                      {diffResult.map((seg, i) => (
                        <span
                          key={i}
                          className={`inline text-xs leading-relaxed ${
                            seg.type === 'removed'
                              ? 'bg-red-100 text-red-700 line-through px-0.5 rounded'
                              : seg.type === 'added'
                              ? 'bg-emerald-100 text-emerald-700 px-0.5 rounded'
                              : 'text-gray-600'
                          }`}
                        >
                          {seg.text}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-100 inline-block" />
                        <span className="text-[10px] text-gray-400">删除内容</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-100 inline-block" />
                        <span className="text-[10px] text-gray-400">新增内容</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
                        <span className="text-[10px] text-gray-400">保留内容</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 重新提取弹窗 ────────────────────────────────────────────────
interface ReExtractModalProps {
  item: KnowledgeItem;
  onConfirm: (newContent: string) => void;
  onClose: () => void;
}

const ReExtractModal = ({ item, onConfirm, onClose }: ReExtractModalProps) => {
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState('');
  const [done, setDone] = useState(false);

  const handleExtract = () => {
    setLoading(true);
    // 模拟重新提取过程
    setTimeout(() => {
      const enhanced = item.v1Content
        + '\n\n【重新提取补充】经二次分析，补充以下关键要点：该知识点在实际应用中需结合具体业务场景灵活调整，建议配合案例库使用，可提升学员理解效率约30%。';
      setExtracted(enhanced);
      setLoading(false);
      setDone(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[560px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-xl">
              <i className="ri-refresh-line text-amber-600 text-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">重新提取</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[280px]">{item.title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!done ? (
            <>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium mb-1">当前1.0内容</p>
                <p className="text-xs text-gray-600 leading-relaxed">{item.v1Content}</p>
              </div>
              <p className="text-xs text-gray-500">
                重新提取将基于原始素材重新分析，生成更完整、更准确的知识内容，并更新为2.0版本。
              </p>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin" />
                      正在提取...
                    </>
                  ) : (
                    <>
                      <i className="ri-refresh-line" />
                      开始重新提取
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <i className="ri-checkbox-circle-line text-emerald-600 text-sm" />
                  <p className="text-xs text-emerald-700 font-semibold">提取完成，新内容如下</p>
                </div>
                <textarea
                  value={extracted}
                  onChange={e => setExtracted(e.target.value)}
                  className="w-full text-xs text-gray-700 bg-white border border-emerald-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-100 leading-relaxed"
                  rows={5}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                  放弃
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(extracted)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-check-line" />
                  应用到2.0版本
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 删除确认弹窗 ────────────────────────────────────────────────
interface DeleteConfirmProps {
  item: KnowledgeItem;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirm = ({ item, onConfirm, onClose }: DeleteConfirmProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-xl">
          <i className="ri-delete-bin-line text-red-500 text-lg" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">确认删除</p>
          <p className="text-[10px] text-gray-400">此操作不可撤销</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          确定要删除「<strong className="text-gray-800">{item.title}</strong>」这条知识记录吗？
        </p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
          取消
        </button>
        <button type="button" onClick={onConfirm} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-delete-bin-line" />
          确认删除
        </button>
      </div>
    </div>
  </div>
);

// ─── 主组件 ──────────────────────────────────────────────────────
const ValidationClosureStep = ({ onPrev }: ValidationClosureStepProps) => {
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>(buildInitialList);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 弹窗状态
  const [versionPanelItem, setVersionPanelItem] = useState<KnowledgeItem | null>(null);
  const [reExtractItem, setReExtractItem] = useState<KnowledgeItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<KnowledgeItem | null>(null);

  // 计算审核通过率
  const calculatePassRate = () => {
    if (knowledgeList.length === 0) return 0;
    const totalChecks = knowledgeList.length * 3;
    const passedChecks = knowledgeList.reduce((sum, item) => {
      return sum + Object.values(item.validation).filter(Boolean).length;
    }, 0);
    return Math.round((passedChecks / totalChecks) * 100);
  };

  const getItemPassRate = (item: KnowledgeItem) => {
    const passed = Object.values(item.validation).filter(Boolean).length;
    return Math.round((passed / 3) * 100);
  };

  // 切换审核规则
  const toggleValidation = (itemId: string, ruleId: string) => {
    setKnowledgeList(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, validation: { ...item.validation, [ruleId]: !item.validation[ruleId as keyof typeof item.validation] } }
          : item
      )
    );
  };

  // 开始编辑
  const startEdit = (item: KnowledgeItem) => {
    setEditingId(item.id);
    setEditContent(item.v2Content);
    setExpandedId(item.id);
  };

  // 保存编辑
  const saveEdit = (itemId: string) => {
    setKnowledgeList(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, content: editContent, v2Content: editContent, modified: true }
          : item
      )
    );
    setEditingId(null);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // 删除知识
  const handleDelete = (itemId: string) => {
    setKnowledgeList(prev => prev.filter(item => item.id !== itemId));
    setDeleteItem(null);
    if (expandedId === itemId) setExpandedId(null);
    if (editingId === itemId) setEditingId(null);
  };

  // 重新提取确认
  const handleReExtractConfirm = (newContent: string) => {
    if (!reExtractItem) return;
    setKnowledgeList(prev =>
      prev.map(item =>
        item.id === reExtractItem.id
          ? { ...item, content: newContent, v2Content: newContent, reExtracted: true, modified: false }
          : item
      )
    );
    setReExtractItem(null);
  };

  // 生成2.0版本
  const generateV2 = () => setViewMode('compare');
  const finishExtraction = () => setViewMode('success');
  const backToList = () => setViewMode('list');

  // 下载成果包
  const handleDownload = () => {
    const passRate = calculatePassRate();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lines: string[] = [];
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('              知识萃取成果包（2.0版本）');
    lines.push(`              生成日期：${dateStr}`);
    lines.push(`              审核通过率：${passRate}%`);
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('【审核规则】');
    validationRules.forEach(rule => { lines.push(`  · ${rule.title}：${rule.desc}`); });
    lines.push('');
    lines.push('【萃取知识清单（2.0版本）】');
    knowledgeList.forEach((item, idx) => {
      const itemRate = getItemPassRate(item);
      lines.push('');
      lines.push(`${idx + 1}. 【${item.type}】${item.title}  ${item.modified ? '（已编辑）' : item.reExtracted ? '（已重新提取）' : ''}`);
      lines.push(`   2.0内容：${item.v2Content}`);
      if (item.modified || item.reExtracted) {
        lines.push(`   1.0原始：${item.v1Content}`);
      }
      lines.push(`   标签：${item.tags.join(' / ')}`);
      lines.push(`   审核状态：${itemRate}% 通过`);
    });
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `知识萃取成果包_2.0_${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const passRate = calculatePassRate();
  const modifiedCount = knowledgeList.filter(item => item.modified || item.reExtracted).length;

  // ─── 成功页面 ────────────────────────────────────────────────
  if (viewMode === 'success') {
    return (
      <div className="flex flex-col h-full gap-4">
        {/* 顶部成功提示 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-5 text-white [box-shadow:0_8px_24px_-4px_rgba(59,130,246,0.35)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-full flex-shrink-0">
              <i className="ri-check-double-line text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">萃取完成！</h2>
              <p className="text-sm text-blue-100">
                共 <strong className="text-white">{knowledgeList.length}</strong> 条知识，
                审核通过率 <strong className="text-white">{passRate}%</strong>，
                手动优化 <strong className="text-white">{modifiedCount}</strong> 条
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-download-line" />
                下载成果包
              </button>
            </div>
          </div>
        </div>

        {/* 知识列表预览 */}
        <div className="bg-white rounded-2xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">萃取成果预览</p>
            <button type="button" onClick={() => setViewMode('list')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
              <i className="ri-arrow-left-line" />
              返回继续编辑
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {knowledgeList.map((item, idx) => {
                const itemRate = getItemPassRate(item);
                const allPass = itemRate === 100;
                return (
                  <div key={item.id} className={`rounded-xl border p-4 transition-all ${allPass ? 'border-blue-100 bg-blue-50/20' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-[10px] font-bold w-5 flex-shrink-0 mt-0.5 ${allPass ? 'text-blue-400' : 'text-gray-300'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.type === '核心知识' ? 'bg-amber-100 text-amber-700' :
                            item.type === '方法论' ? 'bg-sky-100 text-sky-700' :
                            item.type === '配套案例' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-violet-100 text-violet-700'
                          }`}>{item.type}</span>
                          <span className="text-sm font-bold text-gray-800 truncate">{item.title}</span>
                          {item.modified && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">已编辑</span>}
                          {item.reExtracted && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">已重提取</span>}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.v2Content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                          <span className={`ml-auto text-[10px] font-semibold ${allPass ? 'text-blue-600' : 'text-gray-400'}`}>
                            {itemRate}% 通过
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 版本比对页面 ────────────────────────────────────────────
  if (viewMode === 'compare') {
    const changedItems = knowledgeList.filter(item => item.modified || item.reExtracted);
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold mb-1">1.0 vs 2.0 版本比对</p>
              <p className="text-xs text-gray-400">对比初版萃取成果与优化后的2.0版本，查看改进效果</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold">1.0</p>
                <p className="text-[10px] text-gray-400">初版萃取</p>
              </div>
              <i className="ri-arrow-right-line text-gray-500 text-xl" />
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-400">2.0</p>
                <p className="text-[10px] text-gray-400">优化版本</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {/* 汇总指标 */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: '知识条目数', v1: `${knowledgeList.length}条`, v2: `${knowledgeList.length}条`, change: '保持', color: 'text-gray-600' },
                { label: '审核通过率', v1: '58%', v2: `${passRate}%`, change: passRate > 58 ? '提升' : '持平', color: 'text-emerald-600' },
                { label: '内容修改数', v1: '-', v2: `${changedItems.length}条`, change: '优化', color: 'text-sky-600' },
                { label: '复用场景', v1: '3个', v2: '5个', change: '扩展', color: 'text-violet-600' },
              ].map((row, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-1">{row.label}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 line-through">{row.v1}</span>
                    <i className="ri-arrow-right-line text-gray-300 text-[10px]" />
                    <span className={`text-sm font-bold ${row.color}`}>{row.v2}</span>
                  </div>
                  <span className={`text-[10px] font-semibold mt-1 inline-block px-1.5 py-0.5 rounded-full ${
                    row.change === '提升' || row.change === '扩展' ? 'bg-emerald-100 text-emerald-700' :
                    row.change === '优化' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'
                  }`}>{row.change}</span>
                </div>
              ))}
            </div>

            {/* 知识条目详细比对 */}
            <p className="text-xs font-bold text-gray-700 mb-3">知识条目逐条比对</p>
            <div className="space-y-2">
              {knowledgeList.map((item, idx) => {
                const itemRate = getItemPassRate(item);
                const hasChange = item.v1Content !== item.v2Content;
                return (
                  <div key={item.id} className={`rounded-xl border overflow-hidden ${hasChange ? 'border-emerald-200' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-5">{idx + 1}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.type === '核心知识' ? 'bg-amber-100 text-amber-700' :
                          item.type === '方法论' ? 'bg-sky-100 text-sky-700' :
                          item.type === '配套案例' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-violet-100 text-violet-700'
                        }`}>{item.type}</span>
                        <span className="text-xs font-semibold text-gray-800">{item.title}</span>
                        {item.modified && <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full">已编辑</span>}
                        {item.reExtracted && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">已重提取</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">1.0: 待审核</span>
                        <i className="ri-arrow-right-line text-gray-300 text-xs" />
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          itemRate === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>2.0: {itemRate}%</span>
                        <button
                          type="button"
                          onClick={() => setVersionPanelItem(item)}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-git-merge-line text-[10px]" />
                          查看差异
                        </button>
                      </div>
                    </div>
                    {hasChange && (
                      <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
                        <div className="px-4 py-2.5 bg-red-50/30 border-r border-gray-100">
                          <p className="text-[10px] text-gray-400 mb-1">1.0 原始</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{item.v1Content}</p>
                        </div>
                        <div className="px-4 py-2.5 bg-emerald-50/30">
                          <p className="text-[10px] text-emerald-600 mb-1">2.0 优化</p>
                          <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-2">{item.v2Content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={backToList} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-arrow-left-line" />
            返回审核
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-download-line" />
              下载报告
            </button>
            <button type="button" onClick={finishExtraction} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-check-double-line" />
              完成萃取
            </button>
          </div>
        </div>

        {/* 版本查看弹窗 */}
        {versionPanelItem && (
          <VersionPanel item={versionPanelItem} onClose={() => setVersionPanelItem(null)} />
        )}
      </div>
    );
  }

  // ─── 主列表页面 ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 顶部统计栏 */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500 mr-2">审核规则</span>
          {validationRules.map(rule => (
            <div
              key={rule.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${rule.border} ${rule.bg}`}
            >
              <i className={`${rule.icon} text-sm ${rule.color}`} />
              <span className={`text-xs font-semibold ${rule.color}`}>{rule.title}</span>
              <span className="text-[10px] text-gray-400 hidden lg:inline">— {rule.desc}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400">综合通过率</p>
            <p className={`text-lg font-bold leading-tight ${passRate >= 80 ? 'text-blue-600' : passRate >= 60 ? 'text-blue-400' : 'text-gray-400'}`}>
              {passRate}%
            </p>
          </div>
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${
            passRate >= 80 ? 'bg-blue-50' : passRate >= 60 ? 'bg-blue-50/60' : 'bg-gray-100'
          }`}>
            <i className={`ri-shield-check-line text-lg ${
              passRate >= 80 ? 'text-blue-600' : passRate >= 60 ? 'text-blue-400' : 'text-gray-400'
            }`} />
          </div>
        </div>
      </div>

      {/* 知识列表 */}
      <div className="bg-gray-50/80 rounded-2xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white/80">
          <p className="text-xs text-gray-500">
            共 <strong className="text-gray-700">{knowledgeList.length}</strong> 条知识，
            <span className="text-emerald-600"> {knowledgeList.filter(item => getItemPassRate(item) === 100).length}</span> 条全部通过，
            <span className="text-sky-600"> {modifiedCount}</span> 条已优化
          </p>
          <span className="text-[10px] text-gray-400">点击规则标签切换审核状态 · 图标按钮可编辑/删除/重提取</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            {knowledgeList.map((item, idx) => {
              const itemRate = getItemPassRate(item);
              const isEditing = editingId === item.id;
              const allPass = itemRate === 100;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-200
                    bg-white border
                    hover:-translate-y-0.5
                    ${allPass
                      ? 'border-blue-200 [box-shadow:0_4px_20px_-2px_rgba(59,130,246,0.20),0_1px_4px_-1px_rgba(59,130,246,0.10)]'
                      : 'border-gray-200 [box-shadow:0_4px_16px_-2px_rgba(0,0,0,0.08),0_1px_4px_-1px_rgba(0,0,0,0.04)]'
                    }
                  `}
                >
                  {/* ── 卡片顶部：序号 + 类型 + 标题 + 状态标签 ── */}
                  <div className={`flex items-center gap-2.5 px-4 pt-3.5 pb-0`}>
                    <span className={`text-[10px] font-bold w-5 flex-shrink-0 ${allPass ? 'text-blue-400' : 'text-gray-300'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.type === '核心知识' ? 'bg-amber-100 text-amber-700' :
                      item.type === '方法论' ? 'bg-sky-100 text-sky-700' :
                      item.type === '配套案例' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-violet-100 text-violet-700'
                    }`}>{item.type}</span>
                    <span className="text-sm font-bold text-gray-800 flex-1 truncate">{item.title}</span>
                    {item.modified && (
                      <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-full flex-shrink-0">已编辑</span>
                    )}
                    {item.reExtracted && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full flex-shrink-0">已重提取</span>
                    )}
                    {allPass && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        <i className="ri-check-double-line text-[10px]" />全部通过
                      </span>
                    )}
                  </div>

                  {/* ── 知识内容 ── */}
                  <div className="px-4 pt-2.5 pb-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <i className="ri-edit-line text-blue-500 text-xs" />
                          <span className="text-[10px] text-blue-600 font-semibold">编辑 2.0 版本内容</span>
                          <span className="text-[10px] text-gray-400">（1.0原始内容保留用于对比）</span>
                        </div>
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full text-xs text-gray-700 border border-blue-300 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => saveEdit(item.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                            <i className="ri-check-line" />保存
                          </button>
                          <button type="button" onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.v2Content}</p>
                    )}
                  </div>

                  {/* ── 分隔线 ── */}
                  <div className={`mx-4 h-px ${allPass ? 'bg-blue-100' : 'bg-gray-100'}`} />

                  {/* ── 底部：审核规则横排 + 操作按钮 ── */}
                  {!isEditing && (
                    <div className="flex items-center gap-0 px-3 py-2">
                      {/* 审核规则横排 */}
                      <div className="flex items-center gap-1.5 flex-1">
                        {validationRules.map(rule => {
                          const passed = item.validation[rule.id as keyof typeof item.validation];
                          return (
                            <button
                              key={rule.id}
                              type="button"
                              onClick={() => toggleValidation(item.id, rule.id)}
                              title={`${rule.title}：${rule.desc}`}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                                passed
                                  ? `${rule.bg} ${rule.border} ${rule.color}`
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 flex items-center justify-center rounded-full flex-shrink-0 ${
                                passed ? `${rule.color} bg-white/60` : 'bg-gray-200 text-gray-400'
                              }`}>
                                <i className={`text-[8px] font-bold ${passed ? 'ri-check-line' : 'ri-close-line'}`} />
                              </div>
                              <span className="text-[10px] font-semibold">{rule.title}</span>
                            </button>
                          );
                        })}

                        {/* 通过率 pill */}
                        <div className={`ml-1 flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                          allPass ? 'bg-blue-50' : itemRate >= 60 ? 'bg-blue-50/50' : 'bg-gray-100'
                        }`}>
                          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                allPass ? 'bg-blue-500' : itemRate >= 60 ? 'bg-blue-300' : 'bg-gray-300'
                              }`}
                              style={{ width: `${itemRate}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${
                            allPass ? 'text-blue-600' : itemRate >= 60 ? 'text-blue-400' : 'text-gray-400'
                          }`}>{itemRate}%</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                        <button type="button" onClick={() => setVersionPanelItem(item)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="版本对比">
                          <i className="ri-git-merge-line text-xs" />
                        </button>
                        <button type="button" onClick={() => setReExtractItem(item)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="重新提取">
                          <i className="ri-refresh-line text-xs" />
                        </button>
                        <button type="button" onClick={() => startEdit(item)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="编辑">
                          <i className="ri-edit-line text-xs" />
                        </button>
                        <button type="button" onClick={() => setDeleteItem(item)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="删除">
                          <i className="ri-delete-bin-line text-xs" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {knowledgeList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-2xl mb-3">
                  <i className="ri-inbox-line text-gray-400 text-xl" />
                </div>
                <p className="text-sm text-gray-500">暂无知识条目</p>
                <p className="text-xs text-gray-400 mt-1">所有条目已被删除</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onPrev} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-arrow-left-line" />
          返回上一步
        </button>
        <button
          type="button"
          onClick={finishExtraction}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 [box-shadow:0_4px_12px_-2px_rgba(59,130,246,0.40)]"
        >
          <i className="ri-check-double-line" />
          完成萃取
        </button>
      </div>

      {/* 弹窗层 */}
      {versionPanelItem && (
        <VersionPanel item={versionPanelItem} onClose={() => setVersionPanelItem(null)} />
      )}
      {reExtractItem && (
        <ReExtractModal
          item={reExtractItem}
          onConfirm={handleReExtractConfirm}
          onClose={() => setReExtractItem(null)}
        />
      )}
      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onConfirm={() => handleDelete(deleteItem.id)}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
};

export default ValidationClosureStep;
