import { useEffect, useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';
import type { MaterialSlide } from '@/services/dify/step4PptOutline';
import {
  buildIslideOutlineFromMaterialSlides,
  countOutlineNodes,
} from '@/services/islide/outlineFromSlides';
import { generatePptViaMarketplace, isIslideMarketplaceConfigured } from '@/services/islide/marketplaceGenerate';

/* ─── Types ─── */
type SideTab = 'enterprise' | 'popular' | 'history';

/** 本地展示用 id + iSlide 主题 themeId（文档示例中的资源 id，用于可选传入 generate） */
interface Template {
  id: number;
  themeId: number;
  title: string;
  category: string;
  style: string;
  profession: string;
  imgSeq: number;
  selected?: boolean;
}

/* ─── Constants ─── */
const SIDE_TABS: { key: SideTab; label: string; icon: string }[] = [
  { key: 'enterprise', label: '企业模板', icon: 'ri-building-4-line' },
  { key: 'popular', label: '热门推荐', icon: 'ri-fire-line' },
  { key: 'history', label: '历史模板', icon: 'ri-history-line' },
];

const SCENE_FILTERS = ['全部', '总结汇报', '教育培训', '医学医疗', '营销推广', '商业计划', '高校专区', '企业介绍', '党政宣传', '自我介绍', '分析报告'];
const PROFESSION_FILTERS = ['全部', '学生/家长', '老师/讲师', '高校群体', '市场/运营', '产品/研发', '企业管理', '医生/护士', '商务/销售', '人力资源'];
const STYLE_FILTERS = ['全部', '简约', '商务', '科技', '插画', '政务', '零散', '潮流', '国风', '立体', '复古', '大气'];
const COLOR_OPTIONS = [
  { value: 'all', bg: 'bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400', label: '全部' },
  { value: 'orange', bg: 'bg-orange-400', label: '橙色' },
  { value: 'yellow', bg: 'bg-yellow-400', label: '黄色' },
  { value: 'green', bg: 'bg-green-500', label: '绿色' },
  { value: 'pink', bg: 'bg-pink-400', label: '粉色' },
  { value: 'teal', bg: 'bg-teal-400', label: '青色' },
  { value: 'indigo', bg: 'bg-indigo-400', label: '靛蓝' },
  { value: 'sky', bg: 'bg-sky-400', label: '天蓝' },
  { value: 'amber', bg: 'bg-amber-700', label: '棕色' },
  { value: 'red', bg: 'bg-red-500', label: '红色' },
];

/** themeId 取自 iSlide 开放文档示例，便于与生成接口联动；完整「海量」主题需对接 SaaS GET /api/presentation/theme */
const THEME_IDS_ROTATION = [8743, 10349, 10342, 10556, 12762, 10349, 8743, 10556, 10342, 12762, 10349, 8743];

const TEMPLATE_SEEDS: Omit<Template, 'id' | 'themeId'>[] = [
  { title: '顾问式销售技能提升培训', category: '教育培训', style: '商务', profession: '商务/销售', imgSeq: 101 },
  { title: '客户需求挖掘与分析方法', category: '总结汇报', style: '简约', profession: '商务/销售', imgSeq: 102 },
  { title: '产品价值体系构建与传达', category: '营销推广', style: '科技', profession: '市场/运营', imgSeq: 103 },
  { title: '销售团队绩效管理与激励', category: '企业介绍', style: '商务', profession: '企业管理', imgSeq: 104 },
  { title: 'SWOT竞品对比分析框架', category: '总结汇报', style: '简约', profession: '产品/研发', imgSeq: 105 },
  { title: '营销策略复盘与下阶段规划', category: '营销推广', style: '大气', profession: '市场/运营', imgSeq: 106 },
  { title: '新员工入职培训完整手册', category: '教育培训', style: '插画', profession: '人力资源', imgSeq: 107 },
  { title: '企业年度战略拆解与落地', category: '总结汇报', style: '商务', profession: '企业管理', imgSeq: 108 },
  { title: '市场洞察报告及机会评估', category: '分析报告', style: '科技', profession: '市场/运营', imgSeq: 109 },
  { title: '产品上市GTM策略规划', category: '商业计划', style: '大气', profession: '产品/研发', imgSeq: 110 },
  { title: '渠道合作伙伴赋能培训', category: '教育培训', style: '简约', profession: '商务/销售', imgSeq: 111 },
  { title: '客户成功管理与续签策略', category: '营销推广', style: '商务', profession: '商务/销售', imgSeq: 112 },
  { title: '销售漏斗管理精细化运营', category: '分析报告', style: '科技', profession: '商务/销售', imgSeq: 113 },
  { title: '团队沟通与协作能力提升', category: '教育培训', style: '插画', profession: '企业管理', imgSeq: 114 },
  { title: '数字化转型战略部署方案', category: '商业计划', style: '科技', profession: '企业管理', imgSeq: 115 },
  { title: '高效会议管理与决策方法', category: '总结汇报', style: '简约', profession: '企业管理', imgSeq: 116 },
  { title: '商务演讲与表达力训练', category: '教育培训', style: '商务', profession: '商务/销售', imgSeq: 117 },
  { title: '数据驱动运营复盘模板', category: '分析报告', style: '科技', profession: '市场/运营', imgSeq: 118 },
  { title: '领导力与执行力提升', category: '总结汇报', style: '大气', profession: '企业管理', imgSeq: 119 },
  { title: '客户服务与投诉处理', category: '教育培训', style: '简约', profession: '商务/销售', imgSeq: 120 },
  { title: '创新思维与问题解决', category: '教育培训', style: '创意', profession: '产品/研发', imgSeq: 121 },
  { title: '招投标与方案撰写', category: '商业计划', style: '商务', profession: '商务/销售', imgSeq: 122 },
  { title: '跨部门协作工作坊', category: '总结汇报', style: '插画', profession: '企业管理', imgSeq: 123 },
  { title: '时间管理与工作效率', category: '教育培训', style: '简约', profession: '高校群体', imgSeq: 124 },
];

const TEMPLATES: Template[] = TEMPLATE_SEEDS.map((t, i) => ({
  ...t,
  id: i + 1,
  themeId: THEME_IDS_ROTATION[i % THEME_IDS_ROTATION.length],
}));

const HISTORY_TEMPLATES: Template[] = [
  { id: 201, themeId: 8743, title: '2024年销售技巧培训课件', category: '教育培训', style: '商务', profession: '商务/销售', imgSeq: 201 },
  { id: 202, themeId: 10349, title: '客户关系维护年度总结', category: '总结汇报', style: '简约', profession: '商务/销售', imgSeq: 202 },
  { id: 203, themeId: 10342, title: '产品知识培训手册v3', category: '教育培训', style: '科技', profession: '市场/运营', imgSeq: 203 },
  { id: 204, themeId: 10556, title: '季度业绩复盘与展望', category: '总结汇报', style: '大气', profession: '企业管理', imgSeq: 204 },
];

interface Props {
  onBack: () => void;
  onNext: () => void;
  /** 课题名称 */
  courseTitle: string;
  /** 第四步素材匹配页的逐页大纲 */
  materialSlides: MaterialSlide[];
}

const CoursewareGenerationEditor = ({
  onBack,
  onNext,
  courseTitle,
  materialSlides,
}: Props) => {
  const [sideTab, setSideTab] = useState<SideTab>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [sceneFilter, setSceneFilter] = useState('全部');
  const [professionFilter, setProfessionFilter] = useState('全部');
  const [styleFilter, setStyleFilter] = useState('全部');
  const [colorFilter, setColorFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [pptUrl, setPptUrl] = useState<string | null>(null);
  const [totalPage, setTotalPage] = useState(0);
  const [showSceneMore, setShowSceneMore] = useState(false);
  const [showProfessionMore, setShowProfessionMore] = useState(false);

  useEffect(
    () => () => {
      if (pptUrl?.startsWith('blob:')) URL.revokeObjectURL(pptUrl);
    },
    [pptUrl]
  );

  const sourceTemplates = sideTab === 'history' ? HISTORY_TEMPLATES : TEMPLATES;

  const filteredTemplates = sourceTemplates.filter((t) => {
    if (searchQuery && !t.title.includes(searchQuery) && !t.category.includes(searchQuery)) return false;
    if (sceneFilter !== '全部' && t.category !== sceneFilter) return false;
    if (professionFilter !== '全部' && t.profession !== professionFilter) return false;
    if (styleFilter !== '全部' && t.style !== styleFilter) return false;
    return true;
  });

  const selectedTpl = selectedTemplate != null ? sourceTemplates.find((t) => t.id === selectedTemplate) : null;

  const handleGenerate = async () => {
    setGenError(null);
    if (pptUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pptUrl);
    }
    setPptUrl(null);

    if (materialSlides.length === 0) {
      setGenError('第四步大纲为空，请返回上一步生成或编辑课件页大纲。');
      return;
    }

    if (materialSlides.length > 45) {
      setGenError('幻灯片页数过多（建议≤45页），请在第四步精简后再生成。');
      return;
    }

    if (selectedTemplate === null || !selectedTpl) return;

    if (!isIslideMarketplaceConfigured()) {
      setGenError('未配置 VITE_ISLIDE_APPCODE，请在 .env.local 中填写阿里云市场 AppCode，并重启开发服务。');
      return;
    }

    const outline = buildIslideOutlineFromMaterialSlides(courseTitle, materialSlides);
    const nodes = countOutlineNodes(outline);
    if (nodes > 68) {
      setGenError('大纲节点过多，请精简第四步内容后再试。');
      return;
    }

    setGenerating(true);
    try {
      const r = await generatePptViaMarketplace(outline, selectedTpl.themeId);
      setPptUrl(r.fileUrl);
      setTotalPage(r.totalPage);
      setGenerated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      setGenError(msg);
      setGenerated(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pptUrl) return;
    const a = document.createElement('a');
    a.href = pptUrl;
    if (!pptUrl.startsWith('blob:')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    a.download = `${courseTitle || '课件'}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNext = () => {
    if (!generated) return;
    onNext();
  };

  if (generating) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <GenerationProgressScreen
          layout="embedded"
          title="正在生成课件 PPT"
          subtitle="已结合第四步大纲与所选阿里云主题，正在调用智能排版服务，请稍候"
          stepLabels={['解析大纲结构', '应用主题风格', '合成演示文件']}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 gap-0 bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* ── Left Sidebar ── */}
      <div className="w-[100px] flex-shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col py-3">
        {SIDE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setSideTab(tab.key);
              setSelectedTemplate(null);
            }}
            className={`flex flex-col items-center gap-1.5 py-4 px-2 cursor-pointer transition-all ${
              sideTab === tab.key
                ? 'bg-white border-r-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:bg-white hover:text-gray-700'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${tab.icon} text-base`} />
            </div>
            <span className="text-[11px] font-medium whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex-shrink-0 px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-bold text-gray-800 whitespace-nowrap">选择模板创建 PPT</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              已载入第四步共 <strong className="text-gray-700">{materialSlides.length}</strong> 页大纲
              {!isIslideMarketplaceConfigured() && (
                <span className="text-amber-600 ml-2">（未配置 AppCode 时无法使用阿里云主题生成）</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-1 max-w-[420px] justify-end">
            <div className="flex-1 relative max-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入模板关键词..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-gray-50 text-gray-700 placeholder-gray-400"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400">
                <i className="ri-search-line text-sm" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={selectedTemplate === null}
              className={`flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedTemplate !== null
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {generated ? (
                <>
                  <i className="ri-refresh-line text-sm" />
                  重新生成
                </>
              ) : (
                <>
                  <i className="ri-magic-line text-sm" />
                  生成 PPT
                </>
              )}
            </button>
          </div>
        </div>

        {genError && (
          <div className="shrink-0 mx-5 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] text-red-800">
            {genError}
          </div>
        )}

        <>
          {/* ── Filter Rows ── */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-gray-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 whitespace-nowrap w-10 flex-shrink-0">场景：</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(showSceneMore ? SCENE_FILTERS : SCENE_FILTERS.slice(0, 8)).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSceneFilter(f)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      sceneFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowSceneMore(!showSceneMore)}
                  className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-blue-500 cursor-pointer whitespace-nowrap"
                >
                  {showSceneMore ? (
                    <>
                      <i className="ri-arrow-up-s-line text-sm" />
                      收起
                    </>
                  ) : (
                    <>
                      <i className="ri-arrow-right-s-line text-sm" />
                      更多
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 whitespace-nowrap w-10 flex-shrink-0">职业：</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(showProfessionMore ? PROFESSION_FILTERS : PROFESSION_FILTERS.slice(0, 7)).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setProfessionFilter(f)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      professionFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowProfessionMore(!showProfessionMore)}
                  className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-blue-500 cursor-pointer whitespace-nowrap"
                >
                  {showProfessionMore ? (
                    <>
                      <i className="ri-arrow-up-s-line text-sm" />
                      收起
                    </>
                  ) : (
                    <>
                      <i className="ri-arrow-right-s-line text-sm" />
                      更多
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 whitespace-nowrap w-10 flex-shrink-0">风格：</span>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStyleFilter(f)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      styleFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 whitespace-nowrap w-10 flex-shrink-0">颜色：</span>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColorFilter(c.value)}
                    title={c.label}
                    className={`w-5 h-5 rounded-full ${c.bg} cursor-pointer transition-all flex-shrink-0 ${
                      colorFilter === c.value
                        ? 'ring-2 ring-offset-1 ring-blue-500 scale-110'
                        : 'hover:scale-110 ring-2 ring-transparent ring-offset-1'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Template Grid ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <div className="w-10 h-10 flex items-center justify-center mb-2">
                  <i className="ri-file-search-line text-2xl" />
                </div>
                <p className="text-[13px]">暂无匹配模板，请调整筛选条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setGenerated(false);
                        if (pptUrl?.startsWith('blob:')) URL.revokeObjectURL(pptUrl);
                        setPptUrl(null);
                        setGenError(null);
                      }}
                      className={`group text-left rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col ${
                        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-100 hover:border-blue-300'
                      }`}
                    >
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <img
                          src={`https://readdy.ai/api/search-image?query=professional%20business%20training%20powerpoint%20presentation%20slide%20template%20clean%20modern%20corporate%20style%20with%20charts%20and%20icons%20showing%20sales%20consulting%20course%20material%20design%20blue%20white%20color%20scheme&width=320&height=180&seq=${tpl.imgSeq}&orientation=landscape`}
                          alt={tpl.title}
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                            <div className="w-7 h-7 flex items-center justify-center bg-blue-600 rounded-full">
                              <i className="ri-check-line text-white text-sm" />
                            </div>
                          </div>
                        )}
                        {!isSelected && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="bg-white/90 text-gray-700 text-[11px] font-semibold px-3 py-1 rounded-full">点击选择</span>
                          </div>
                        )}
                      </div>

                      <div className="px-2.5 py-2 bg-white">
                        <p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2 mb-1.5">{tpl.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">{tpl.category}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">{tpl.style}</span>
                          <span className="text-[10px] text-gray-400">主题#{tpl.themeId}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>

        {/* ── Bottom Bar ── */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap">
          {generated && pptUrl && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <i className="ri-checkbox-circle-fill text-green-500 text-sm" />
                <span className="text-[11px] text-green-700 font-medium whitespace-nowrap">
                  PPT 已生成{totalPage > 0 ? `，共 ${totalPage} 张` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <i className="ri-download-2-line text-sm" />
                下载 PPTX
              </button>
            </div>
          )}

          {selectedTemplate && !generated && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <i className="ri-information-line text-amber-500 text-sm" />
              <span className="text-[11px] text-amber-700 whitespace-nowrap">已选择阿里云主题，点击「生成 PPT」</span>
            </div>
          )}

          {!selectedTemplate && (
            <p className="text-[11px] text-gray-400 whitespace-nowrap">
              共 <strong className="text-gray-600">{filteredTemplates.length}</strong> 套主题可选
            </p>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-[12px] font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-sm" />
            返回上一步
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!generated}
            className={`flex items-center gap-2 px-8 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              generated ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            确认课件，继续下一步
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursewareGenerationEditor;
