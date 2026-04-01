import { useCallback, useEffect, useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';
import type { CourseAnalysisResultData } from '@/services/dify/step2-parse';
import {
  isDifyStep4Configured,
  runStep4PptOutline,
  type MaterialSlide,
} from '@/services/dify/step4PptOutline';

type SlideMedia = MaterialSlide['media'];

type Slide = MaterialSlide;

export const INITIAL_SLIDES: Slide[] = [
  {
    id: 1,
    title: '封面',
    contentLines: ['顾·问心，销·达意'],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 2,
    title: '目录',
    contentLines: [
      '火花：场景需求识别',
      '火苗：产品价值映射',
      '火种：方案组合设计',
      '火把：预算需求探询',
      '火炬：动态策略调整',
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 3,
    title: '章节',
    contentLines: ['火花：场景需求识别'],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 4,
    title: '火花：场景需求识别',
    contentLines: [],
    subItems: [
      {
        label: '开场：失败案例剖析',
        lines: [
          '案例呈现：制造业客户流失的关键原因',
          '·背景：某销售向生产型客户推荐高价5G套餐，未结合其"车间设备联网"场景推荐边缘计算产品',
          '·结果：客户因"用不上"拒绝续约，转而选择竞品的"通信+设备管理"组合方案',
        ],
      },
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 5,
    title: '场景需求识别 — 工具讲解',
    contentLines: [],
    subItems: [
      {
        label: '工具：场景画布（Scene Canvas）',
        lines: [
          '·行业属性：制造/零售/医疗/教育/政务',
          '·业务规模：员工数/门店数/设备规模',
          '·数字化现状：当前使用系统、痛点、期望',
          '·通信依赖度：移动/固网/专线/云需求比重',
        ],
      },
      {
        label: '实战演练',
        lines: ['两两搭档，用场景画布分析指定行业客户'],
      },
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 6,
    title: '章节',
    contentLines: ['火苗：产品价值映射'],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 7,
    title: '火苗：产品价值映射',
    contentLines: [],
    subItems: [
      {
        label: '核心方法：FAB价值转化法',
        lines: [
          '·Feature（特性）：产品/方案的核心参数',
          '·Advantage（优势）：相比竞品的差异化亮点',
          '·Benefit（利益）：客户实际业务场景下的价值体现',
        ],
      },
      {
        label: '应用示例',
        lines: ['千兆宽带 → 支持8K无损传输 → 远程手术指导稳定可靠'],
      },
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 8,
    title: '章节',
    contentLines: ['火种：方案组合设计'],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 9,
    title: '火种：方案组合设计',
    contentLines: [],
    subItems: [
      {
        label: '方案设计四维框架',
        lines: [
          '1. 连接层：5G/固网/专线选型建议',
          '2. 应用层：行业SaaS/云平台匹配',
          '3. 终端层：智能设备/IoT配套方案',
          '4. 服务层：运维/安全/培训支持包',
        ],
      },
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 10,
    title: '章节',
    contentLines: ['火把：预算需求探询'],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 11,
    title: '火把：预算需求探询',
    contentLines: [],
    subItems: [
      {
        label: '预算探询三步法',
        lines: [
          '第一步：了解客户年度IT/通信预算区间',
          '第二步：拆解决策链（IT负责人/财务/CEO）',
          '第三步：提供阶梯方案，引导预算升级',
        ],
      },
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
  {
    id: 12,
    title: '火炬：动态策略调整',
    contentLines: [],
    subItems: [
      {
        label: '动态跟进模型：PDCA闭环',
        lines: [
          '·Plan：制定拜访计划与目标',
          '·Do：执行拜访，收集客户反馈',
          '·Check：复盘成单/丢单原因分析',
          '·Act：调整策略，优化下一轮方案',
        ],
      },
      {
        label: '总结与行动承诺',
        lines: ['学员填写《30天行动计划表》，明确落地场景'],
      },
    ],
    media: { video: false, image: false, audio: false, ppt: false },
  },
];

type MediaType = 'video' | 'image' | 'audio' | 'ppt';

const MEDIA_BUTTONS: { key: MediaType; icon: string; label: string }[] = [
  { key: 'video', icon: 'ri-video-add-line', label: '添加视频' },
  { key: 'image', icon: 'ri-image-add-line', label: '添加插图' },
  { key: 'audio', icon: 'ri-music-2-line', label: '添加音频' },
  { key: 'ppt', icon: 'ri-file-ppt-2-line', label: '添加PPT' },
];

interface Props {
  onBack: () => void;
  onNext: () => void;
  /** 第四步幻灯片大纲（与第五步联动） */
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  /** 课程名称（课题名称） */
  courseTitle?: string;
  /** 步骤二结构化结果：学员画像、课程目标、设计思路 */
  courseAnalysis?: CourseAnalysisResultData | null;
}

const MaterialMatchingEditor = ({
  onBack,
  onNext,
  slides,
  onSlidesChange,
  courseTitle = '',
  courseAnalysis = null,
}: Props) => {
  const [outlineLoading, setOutlineLoading] = useState(() => isDifyStep4Configured());
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [useLocalLibrary, setUseLocalLibrary] = useState(false);
  const [uploadModal, setUploadModal] = useState<{ slideId: number; type: MediaType } | null>(null);
  const total = slides.length;

  const loadAiOutline = useCallback(async () => {
    if (!isDifyStep4Configured()) return;
    setOutlineLoading(true);
    setOutlineError(null);
    try {
      const next = await runStep4PptOutline(courseTitle, courseAnalysis);
      onSlidesChange(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '大纲生成失败';
      setOutlineError(msg);
      onSlidesChange(INITIAL_SLIDES.map((s) => ({ ...s, media: { ...s.media } })));
    } finally {
      setOutlineLoading(false);
    }
  }, [courseTitle, courseAnalysis, onSlidesChange]);

  useEffect(() => {
    if (isDifyStep4Configured()) {
      void loadAiOutline();
    }
  }, [loadAiOutline]);

  const toggleMedia = (slideId: number, type: MediaType) => {
    onSlidesChange(
      slides.map((s) =>
        s.id === slideId ? { ...s, media: { ...s.media, [type]: !s.media[type] } } : s
      )
    );
  };

  const handleMediaClick = (slideId: number, type: MediaType) => {
    const slide = slides.find((s) => s.id === slideId);
    if (slide && slide.media[type]) {
      toggleMedia(slideId, type);
    } else {
      setUploadModal({ slideId, type });
    }
  };

  const handleUploadConfirm = () => {
    if (uploadModal) {
      toggleMedia(uploadModal.slideId, uploadModal.type);
      setUploadModal(null);
    }
  };

  const totalMedia = slides.reduce(
    (acc, s) => acc + Object.values(s.media).filter(Boolean).length,
    0
  );

  if (outlineLoading) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <GenerationProgressScreen
          layout="embedded"
          title="正在生成课件 PPT 三级大纲"
          subtitle="智能引擎正结合课程目标与教学设计，拆解逐页结构与要点，请稍候"
          stepLabels={['对齐学员与目标', '搭建章节与页序', '细化三级要点']}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {outlineError && (
        <div
          role="status"
          className="mb-3 shrink-0 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-900"
        >
          <span className="font-semibold">课件大纲生成提示</span>
          <span className="mt-1 block text-amber-800/90">{outlineError}</span>
          <span className="mt-1 block text-amber-800/80">已回退为示例大纲，可点击「重新生成大纲」重试。</span>
        </div>
      )}
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-6">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                {slide.id}/{total}
              </span>
              <span className="text-[14px] font-bold text-gray-800">{slide.title}</span>
            </div>

            {/* Card Body */}
            <div className="flex items-stretch">
              {/* Left: Content */}
              <div className="flex-1 px-4 py-3 min-w-0">
                {slide.contentLines.map((line, i) => (
                  <p key={i} className="text-[13px] text-gray-700 leading-6">
                    {line}
                  </p>
                ))}
                {slide.subItems?.map((item, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <p className="text-[13px] font-semibold text-gray-800 leading-6">{item.label}</p>
                    {item.lines?.map((line, j) => (
                      <p
                        key={j}
                        className={`text-[12px] leading-5.5 ${
                          line.startsWith('·') || line.startsWith('第') || line.match(/^\d+\./)
                            ? 'text-gray-600 pl-2'
                            : 'text-gray-500 pl-4'
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-100 flex-shrink-0 my-3" />

              {/* Right: Media buttons 2x2 */}
              <div className="flex-shrink-0 px-4 py-3 flex items-center">
                <div className="grid grid-cols-2 gap-2">
                  {MEDIA_BUTTONS.map(({ key, icon, label }) => {
                    const active = slide.media[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleMediaClick(slide.id, key)}
                        className={`w-[88px] flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-all cursor-pointer ${
                          active
                            ? 'border-blue-400 bg-blue-50 text-blue-600'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i
                            className={`${icon} text-base ${active ? 'text-blue-600' : 'text-gray-400'}`}
                          />
                        </div>
                        <span className={`text-[11px] font-medium whitespace-nowrap ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                          {active ? '已添加' : label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-4 mt-auto">
        {/* Local library toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-500 whitespace-nowrap">优先使用本地素材库</span>
          <button
            type="button"
            onClick={() => setUseLocalLibrary(!useLocalLibrary)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
              useLocalLibrary ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                useLocalLibrary ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {totalMedia > 0 && (
          <span className="text-[11px] text-gray-400">
            已匹配 <strong className="text-blue-600">{totalMedia}</strong> 个素材
          </span>
        )}

        {isDifyStep4Configured() && (
          <button
            type="button"
            onClick={() => void loadAiOutline()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[12px] font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line text-sm" />
            重新生成大纲
          </button>
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
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          确认素材选择，继续下一步
          <i className="ri-arrow-right-line text-sm" />
        </button>
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">
                {MEDIA_BUTTONS.find((b) => b.key === uploadModal.type)?.label}
              </h3>
              <button
                type="button"
                onClick={() => setUploadModal(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer rounded-full hover:bg-gray-100"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>

            {/* Upload zone */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 mb-5 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl">
                <i className={`${MEDIA_BUTTONS.find((b) => b.key === uploadModal.type)?.icon} text-blue-500 text-xl`} />
              </div>
              <p className="text-[13px] font-semibold text-gray-700">点击或拖拽文件至此处上传</p>
              <p className="text-[11px] text-gray-400 text-center">
                {uploadModal.type === 'video' && '支持 MP4、MOV、AVI 格式，最大 500MB'}
                {uploadModal.type === 'image' && '支持 JPG、PNG、GIF、WebP 格式，最大 20MB'}
                {uploadModal.type === 'audio' && '支持 MP3、WAV、AAC 格式，最大 50MB'}
                {uploadModal.type === 'ppt' && '支持 PPT、PPTX、PDF 格式，最大 100MB'}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[11px] text-gray-400">或从素材库选取</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Quick library preview */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={handleUploadConfirm}
                  className="aspect-square rounded-lg bg-gray-100 hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://readdy.ai/api/search-image?query=professional%20business%20training%20presentation%20slide%20clean%20minimal%20background%20corporate&width=80&height=80&seq=${n + 20}&orientation=squarish`}
                    alt="素材"
                    className="w-full h-full object-cover rounded-md"
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUploadModal(null)}
                className="flex-1 py-2 border border-gray-200 text-gray-600 text-[12px] font-semibold rounded-xl hover:border-gray-300 transition-all cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleUploadConfirm}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialMatchingEditor;
