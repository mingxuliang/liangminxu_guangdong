import { useState, useRef, useEffect, useCallback } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

import WPSRibbon, { type RibbonTab, type FormatState } from './WPSRibbon';
import PPTSlideCanvas, { PPTSlideThumbnail, type PPTSlide, type SlideElement, CANVAS_W, CANVAS_H } from './PPTSlideCanvas';
import CoursewareQualityPanel, { INITIAL_ISSUES, type QualityIssue } from './CoursewareQualityPanel';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

/* ─── helpers ─── */
let _eid = 0;
const eid = (slideId: number) => `${slideId}-${_eid++}`;

const el = (
  slideId: number,
  type: SlideElement['type'],
  content: string,
  x: number, y: number, w: number, h: number,
  fs: number, fw: SlideElement['fontWeight'], color: string,
  align: SlideElement['textAlign'] = 'left',
  fi: SlideElement['fontStyle'] = 'normal',
): SlideElement => ({
  id: eid(slideId), type, content, x, y, w, h,
  fontSize: fs, fontWeight: fw, fontStyle: fi, fontFamily: '微软雅黑',
  textDecoration: 'none', color, textAlign: align,
});

/* ─── Initial slides data ─── */
const buildSlides = (): PPTSlide[] => [
  { id: 1, type: 'cover', background: 'gradient-cover', elements: [
    el(1,'title','顾问式销售实战训练营', 8,28,84,14, 36,'bold','#ffffff','center'),
    el(1,'subtitle','打造高效能销售团队的核心方法论', 8,48,84,8, 18,'normal','#c7d2fe','center'),
    el(1,'note','培训周期：3天  |  学时：24课时', 8,60,84,6, 13,'normal','#a5b4fc','center'),
  ]},
  { id: 2, type: 'toc', background: 'gradient-toc', elements: [
    el(2,'title','目 录', 12,8,76,10, 28,'bold','#3730a3','left'),
    el(2,'body','第一章  销售破冰与信任建立', 14,26,72,7, 15,'normal','#374151'),
    el(2,'body','第二章  需求挖掘与痛点定位', 14,36,72,7, 15,'normal','#374151'),
    el(2,'body','第三章  方案呈现与价值塑造', 14,46,72,7, 15,'normal','#374151'),
    el(2,'body','第四章  异议处理与成交推进', 14,56,72,7, 15,'normal','#374151'),
    el(2,'body','第五章  客户维护与转介绍体系', 14,66,72,7, 15,'normal','#374151'),
  ]},
  { id: 3, type: 'content', background: '#ffffff', elements: [
    el(3,'title','第一章：销售破冰与信任建立', 5,3,90,10, 18,'bold','#ffffff'),
    el(3,'body','1.1  初次拜访的黄金30秒', 8,28,84,7, 15,'normal','#374151'),
    el(3,'body','1.2  同频共振技术实战', 8,38,84,7, 15,'normal','#374151'),
    el(3,'body','1.3  信任账户的建立方法', 8,48,84,7, 15,'normal','#374151'),
    el(3,'label','核心工具：FORM破冰模型', 8,60,84,7, 13,'normal','#6366f1'),
  ]},
  { id: 4, type: 'content', background: '#ffffff', elements: [
    el(4,'title','黄金30秒话术设计', 5,3,90,10, 18,'bold','#ffffff'),
    el(4,'body','自我介绍三要素：姓名 + 公司 + 价值主张', 8,26,84,8, 15,'normal','#374151'),
    el(4,'body','开场白避雷指南（7个禁忌词）', 8,38,84,8, 15,'normal','#374151'),
    el(4,'body','建立好感的三个肢体语言信号', 8,50,84,8, 15,'normal','#374151'),
    el(4,'body','实战演练：设计你的专属开场白', 8,62,84,8, 15,'normal','#374151'),
  ]},
  { id: 5, type: 'content', background: '#ffffff', elements: [
    el(5,'title','第二章：需求挖掘与痛点定位', 5,3,90,10, 18,'bold','#ffffff'),
    el(5,'body','2.1  SPIN提问技术详解', 8,28,84,7, 15,'normal','#374151'),
    el(5,'body','2.2  倾听的五个层次', 8,38,84,7, 15,'normal','#374151'),
    el(5,'body','2.3  客户决策链分析', 8,48,84,7, 15,'normal','#374151'),
    el(5,'label','工具：需求挖掘漏斗图', 8,60,84,7, 13,'normal','#6366f1'),
  ]},
  { id: 6, type: 'content', background: '#ffffff', elements: [
    el(6,'title','SPIN提问技术实战', 5,3,90,10, 18,'bold','#ffffff'),
    el(6,'body','S（Situation）— 现状类问题：了解客户当前状态', 8,26,84,8, 14,'normal','#374151'),
    el(6,'body','P（Problem）— 问题类问题：挖掘客户潜在困扰', 8,38,84,8, 14,'normal','#374151'),
    el(6,'body','I（Implication）— 影响类问题：放大问题严重性', 8,50,84,8, 14,'normal','#374151'),
    el(6,'body','N（Need-payoff）— 需求确认：引导客户描述理想方案', 8,62,84,8, 14,'normal','#374151'),
  ]},
  { id: 7, type: 'content', background: '#ffffff', elements: [
    el(7,'title','第三章：方案呈现与价值塑造', 5,3,90,10, 18,'bold','#ffffff'),
    el(7,'body','3.1  FAB价值呈现模型', 8,28,84,7, 15,'normal','#374151'),
    el(7,'body','3.2  对比法与锚定效应', 8,38,84,7, 15,'normal','#374151'),
    el(7,'body','3.3  故事化销售技术', 8,48,84,7, 15,'normal','#374151'),
    el(7,'body','3.4  ROI计算与商业价值证明', 8,58,84,7, 15,'normal','#374151'),
  ]},
  { id: 8, type: 'content', background: '#ffffff', elements: [
    el(8,'title','价值塑造四步法', 5,3,90,10, 18,'bold','#ffffff'),
    el(8,'body','第一步：确认客户核心需求与决策标准', 8,26,84,9, 15,'normal','#374151'),
    el(8,'body','第二步：呈现产品独特价值与差异化优势', 8,38,84,9, 15,'normal','#374151'),
    el(8,'body','第三步：提供成功案例与数据佐证', 8,50,84,9, 15,'normal','#374151'),
    el(8,'body','第四步：量化投资回报与长期收益', 8,62,84,9, 15,'normal','#374151'),
  ]},
  { id: 9, type: 'content', background: '#ffffff', elements: [
    el(9,'title','第四章：异议处理与成交推进', 5,3,90,10, 18,'bold','#ffffff'),
    el(9,'body','4.1  常见异议类型分析', 8,28,84,7, 15,'normal','#374151'),
    el(9,'body','4.2  LAER异议处理模型', 8,38,84,7, 15,'normal','#374151'),
    el(9,'body','4.3  成交信号识别与把握', 8,48,84,7, 15,'normal','#374151'),
    el(9,'body','4.4  七种经典成交技术', 8,58,84,7, 15,'normal','#374151'),
  ]},
  { id: 10, type: 'content', background: '#ffffff', elements: [
    el(10,'title','异议处理实战话术', 5,3,90,10, 18,'bold','#ffffff'),
    el(10,'body','"太贵了"的5种应对方法', 8,26,84,8, 15,'normal','#374151'),
    el(10,'body','"再考虑考虑"的破解话术', 8,38,84,8, 15,'normal','#374151'),
    el(10,'body','"你们没有知名度"如何回应', 8,50,84,8, 15,'normal','#374151'),
    el(10,'body','"效果不确定"的信任重建策略', 8,62,84,8, 15,'normal','#374151'),
  ]},
  { id: 11, type: 'content', background: '#ffffff', elements: [
    el(11,'title','第五章：客户维护与转介绍', 5,3,90,10, 18,'bold','#ffffff'),
    el(11,'body','5.1  客户分级管理体系', 8,28,84,7, 15,'normal','#374151'),
    el(11,'body','5.2  售后关系维护关键节点', 8,38,84,7, 15,'normal','#374151'),
    el(11,'body','5.3  转介绍时机选择与话术设计', 8,48,84,7, 15,'normal','#374151'),
    el(11,'body','5.4  老客户裂变增长模型', 8,58,84,7, 15,'normal','#374151'),
  ]},
  { id: 12, type: 'end', background: 'gradient-end', elements: [
    el(12,'title','课程总结', 8,22,84,12, 32,'bold','#ffffff','center'),
    el(12,'subtitle','顾问式销售的核心本质：帮助客户成功', 8,40,84,9, 17,'normal','#99f6e4','center'),
    el(12,'note','30天行动计划 · 持续精进 · 共创卓越', 8,55,84,7, 13,'normal','#5eead4','center'),
  ]},
];

/* ─── Upload Modal Component ─── */
interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UploadPPTModal = ({ onClose, onUpload }: UploadModalProps) => {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['ppt', 'pptx'].includes(ext || '')) {
      setError('仅支持 .ppt 或 .pptx 格式文件');
      setSelectedFile(null);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过 50MB');
      setSelectedFile(null);
      return;
    }
    setError('');
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    onUpload(selectedFile);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-indigo-50 rounded-xl">
              <i className="ri-file-ppt-2-line text-indigo-600 text-lg" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-800">上传新PPT</p>
              <p className="text-[11px] text-gray-400 mt-0.5">替换当前课件，重新进行审核</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-6">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center gap-3 cursor-pointer transition-all select-none
              ${dragging ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50/60'}
              ${selectedFile ? 'border-teal-400 bg-teal-50/40' : ''}
            `}
          >
            <input ref={fileInputRef} type="file" accept=".ppt,.pptx" className="hidden" onChange={handleFileInput} />

            {selectedFile ? (
              <>
                <div className="w-14 h-14 flex items-center justify-center bg-teal-100 rounded-2xl">
                  <i className="ri-file-ppt-2-line text-teal-600 text-3xl" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-gray-800">{selectedFile.name}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{formatSize(selectedFile.size)}</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                  className="text-[11px] text-gray-400 hover:text-red-500 underline cursor-pointer transition-colors">
                  重新选择
                </button>
              </>
            ) : (
              <>
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-colors ${dragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <i className={`ri-upload-cloud-2-line text-3xl transition-colors ${dragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-gray-700">
                    {dragging ? '松开鼠标上传' : '拖拽文件到此处'}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    或 <span className="text-indigo-600 font-medium">点击选择文件</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  {['.pptx', '.ppt'].map(fmt => (
                    <span key={fmt} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{fmt}</span>
                  ))}
                  <span className="text-[10px] text-gray-400">最大 50 MB</span>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              <i className="ri-error-warning-line flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1.5 mb-1.5">
              <i className="ri-information-line" />上传须知
            </p>
            <ul className="space-y-1">
              {[
                '上传后将替换当前课件，AI质量校验会自动重新执行',
                '文字内容将保留可编辑状态，支持直接修改',
                '上传后建议重新检查质量审核项',
              ].map((tip, i) => (
                <li key={i} className="text-[10px] text-amber-600 flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">·</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-[12px] text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors whitespace-nowrap">
            取消
          </button>
          <button type="button" onClick={handleConfirm} disabled={!selectedFile}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all
              ${selectedFile ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            <i className="ri-upload-2-line" />
            确认上传并替换
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Component ─── */
const CoursewareReviewEditor = ({ onBack, onNext }: Props) => {
  const [slides, setSlides] = useState<PPTSlide[]>(buildSlides);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedElId, setSelectedElId] = useState<string | null>(null);
  const [issues, setIssues] = useState<QualityIssue[]>(INITIAL_ISSUES);
  const [showReview, setShowReview] = useState(true);
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [format, setFormat] = useState<FormatState>({
    bold: false, italic: false, underline: false,
    fontSize: 16, fontFamily: '微软雅黑',
    textAlign: 'left', color: '#1a1a1a',
  });
  const [outputDone, setOutputDone] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [scale, setScale] = useState(0.7);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  /* Scale calculation */
  useEffect(() => {
    const update = () => {
      if (!canvasContainerRef.current) return;
      const w = canvasContainerRef.current.clientWidth - 32;
      const h = canvasContainerRef.current.clientHeight - 32;
      const scaleW = w / CANVAS_W;
      const scaleH = h / CANVAS_H;
      setScale(Math.min(scaleW, scaleH, 1));
    };
    update();
    const obs = new ResizeObserver(update);
    if (canvasContainerRef.current) obs.observe(canvasContainerRef.current);
    return () => obs.disconnect();
  }, [showReview]);

  /* Sync format from selected element */
  useEffect(() => {
    if (!selectedElId) return;
    const slide = slides[activeIdx];
    const elem = slide?.elements.find(e => e.id === selectedElId);
    if (elem) {
      setFormat({
        bold: elem.fontWeight === 'bold',
        italic: elem.fontStyle === 'italic',
        underline: elem.textDecoration === 'underline',
        fontSize: elem.fontSize,
        fontFamily: elem.fontFamily,
        textAlign: elem.textAlign,
        color: elem.color,
      });
    }
  }, [selectedElId, activeIdx, slides]);

  const handleFormat = useCallback((key: keyof FormatState, value: string | boolean | number) => {
    setFormat(prev => ({ ...prev, [key]: value }));
    if (!selectedElId) return;
    setSlides(prev => prev.map((s, i) => {
      if (i !== activeIdx) return s;
      return {
        ...s,
        elements: s.elements.map(e => {
          if (e.id !== selectedElId) return e;
          const updates: Partial<SlideElement> = {};
          if (key === 'bold') updates.fontWeight = value ? 'bold' : 'normal';
          else if (key === 'italic') updates.fontStyle = value ? 'italic' : 'normal';
          else if (key === 'underline') updates.textDecoration = value ? 'underline' : 'none';
          else if (key === 'fontSize') updates.fontSize = value as number;
          else if (key === 'fontFamily') updates.fontFamily = value as string;
          else if (key === 'textAlign') updates.textAlign = value as SlideElement['textAlign'];
          else if (key === 'color') updates.color = value as string;
          return { ...e, ...updates };
        }),
      };
    }));
  }, [selectedElId, activeIdx]);

  const handleUpdateElement = useCallback((slideId: number, elemId: string, content: string) => {
    setSlides(prev => prev.map(s => s.id !== slideId ? s : {
      ...s,
      elements: s.elements.map(e => e.id !== elemId ? e : { ...e, content }),
    }));
  }, []);

  const handleUploadPPT = (file: File) => {
    setParsing(true);
    setUploadedFile(file.name);
    setOutputDone(false);
    setTimeout(() => {
      setParsing(false);
      setSlides(buildSlides());
      setActiveIdx(0);
      setIssues(INITIAL_ISSUES);
      setSelectedElId(null);
    }, 2200);
  };

  const handleAddSlide = () => {
    const newId = Math.max(...slides.map(s => s.id)) + 1;
    const newSlide: PPTSlide = {
      id: newId, type: 'content', background: '#ffffff',
      elements: [
        el(newId,'title','单击添加标题', 5,3,90,10, 18,'bold','#ffffff'),
        el(newId,'body','单击添加内容', 8,28,84,10, 15,'normal','#374151'),
      ],
    };
    const next = [...slides];
    next.splice(activeIdx + 1, 0, newSlide);
    setSlides(next);
    setActiveIdx(activeIdx + 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== activeIdx);
    setSlides(next);
    setActiveIdx(Math.max(0, activeIdx - 1));
  };

  const handleOutput = () => {
    setOutputLoading(true);
    setTimeout(() => { setOutputLoading(false); setOutputDone(true); }, 2400);
  };

  const acceptedCount = issues.filter(i => i.accepted).length;
  const unresolvedErrors = issues.filter(i => i.level === 'error' && !i.accepted).length;

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0]">
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadPPTModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadPPT}
        />
      )}

      {/* WPS Ribbon */}
      <WPSRibbon
        fileName={uploadedFile || '顾问式销售实战训练营.pptx'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        format={format}
        onFormat={handleFormat}
        onUploadPPT={handleUploadPPT}
        onAddSlide={handleAddSlide}
        onDeleteSlide={handleDeleteSlide}
        onUndo={() => {}}
        onRedo={() => {}}
        showReview={showReview}
        onToggleReview={() => setShowReview(v => !v)}
      />

      {/* Parsing overlay */}
      {parsing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/85 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-400/20">
            <GenerationProgressScreen
              layout="embedded"
              title="正在解析课件文件"
              subtitle="智能引擎正在读取幻灯片结构与版式，解析完成后将自动载入编辑器"
              stepLabels={['读取文件', '解析版式', '加载画布']}
              className="py-8"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Left: Slide thumbnails */}
        <div className="w-[150px] flex-shrink-0 bg-[#e8e8e8] border-r border-gray-300 overflow-y-auto flex flex-col py-2 gap-1.5 px-2">
          {slides.map((slide, idx) => {
            const hasIssue = issues.some((iss) => iss.slideId === slide.id && !iss.accepted);
            const isActive = idx === activeIdx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setActiveIdx(idx);
                  setSelectedElId(null);
                }}
                className={`relative w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                  isActive ? 'border-indigo-500 shadow-md' : 'border-transparent hover:border-gray-400'
                }`}
              >
                <PPTSlideThumbnail slide={slide} />
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-1.5 py-0.5">
                  <span className="text-[9px] text-gray-400">{idx + 1}</span>
                  {slide.elements.some((e) => e.content.includes('已修改')) && (
                    <span className="text-[8px] text-amber-500">已改</span>
                  )}
                </div>
                {hasIssue && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleAddSlide}
            className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 py-2 text-[11px] text-gray-400 transition-all hover:border-indigo-400 hover:bg-white/50 hover:text-indigo-500"
          >
            <i className="ri-add-line" />
            新建
          </button>
        </div>

        {/* Center: Canvas area */}
        <div ref={canvasContainerRef} className="relative flex flex-1 min-h-0 items-center justify-center overflow-hidden bg-[#404040]">
          {/* Slide info bar */}
          <div className="absolute left-0 right-0 top-0 z-10 flex h-7 items-center justify-between bg-black/30 px-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/70">
                第 {activeIdx + 1} / {slides.length} 张
              </span>
              {uploadedFile && (
                <span className="flex items-center gap-1 text-[10px] text-indigo-300">
                  <i className="ri-file-ppt-line" />
                  {uploadedFile}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="flex cursor-pointer items-center gap-1 rounded border border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] text-white/80 transition-all hover:border-indigo-400 hover:bg-indigo-500/70 hover:text-white"
              >
                <i className="ri-upload-2-line text-[11px]" />
                上传新PPT
              </button>
              <div className="h-3 w-px bg-white/20" />
              <button
                type="button"
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-sm text-white/60 hover:text-white disabled:opacity-20"
              >
                <i className="ri-arrow-left-s-line" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIdx(Math.min(slides.length - 1, activeIdx + 1))}
                disabled={activeIdx === slides.length - 1}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-sm text-white/60 hover:text-white disabled:opacity-20"
              >
                <i className="ri-arrow-right-s-line" />
              </button>
              <span className="text-[10px] text-white/40">{Math.round(scale * 100)}%</span>
            </div>
          </div>

          {/* Canvas wrapper */}
          <div
            className="relative"
            style={{
              width: `${CANVAS_W * scale}px`,
              height: `${CANVAS_H * scale}px`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <PPTSlideCanvas
              slide={slides[activeIdx]}
              onUpdateElement={handleUpdateElement}
              selectedId={selectedElId}
              onSelectElement={setSelectedElId}
              scale={scale}
            />
          </div>

          {!selectedElId && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] text-white/80">
              单击选中元素 · 双击编辑文字 · 拖拽移动位置
            </div>
          )}
        </div>

        {/* Right: Quality review panel */}
        {showReview && (
          <div className="w-[290px] flex-shrink-0 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
            <CoursewareQualityPanel
              issues={issues}
              onAccept={id => setIssues(prev => prev.map(i => i.id === id ? { ...i, accepted: true } : i))}
              onJumpToSlide={slideId => {
                const idx = slides.findIndex(s => s.id === slideId);
                if (idx !== -1) setActiveIdx(idx);
              }}
              onGoEdit={slideId => {
                const idx = slides.findIndex(s => s.id === slideId);
                if (idx !== -1) setActiveIdx(idx);
              }}
              acceptedCount={acceptedCount}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[12px] font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap">
          <i className="ri-arrow-left-line text-sm" />上一步：课件生成
        </button>

        <div className="flex items-center gap-3">
          {/* Upload shortcut in footer */}
          <button type="button" onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[12px] font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap">
            <i className="ri-upload-2-line text-sm" />上传新PPT
          </button>

          {/* Status hints */}
          {unresolvedErrors > 0 ? (
            <span className="text-[11px] text-red-500 flex items-center gap-1">
              <i className="ri-error-warning-line" />{unresolvedErrors} 条必须修改项未处理
            </span>
          ) : (
            <span className="text-[11px] text-teal-600 flex items-center gap-1">
              <i className="ri-shield-check-line" />质量校验通过 · 已处理 {acceptedCount}/{issues.length}
            </span>
          )}

          {outputDone ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 text-[11px] font-medium">
              <i className="ri-file-download-line" />
              终稿已生成 · {slides.length} 张幻灯片
            </div>
          ) : (
            <button type="button" onClick={handleOutput} disabled={outputLoading}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all ${outputLoading ? 'bg-gray-100 text-gray-400' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
              {outputLoading ? <><i className="ri-loader-4-line animate-spin" />生成终稿...</> : <><i className="ri-file-text-line" />输出课件PPT终稿</>}
            </button>
          )}

          <button type="button" onClick={onNext} disabled={!outputDone}
            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all ${outputDone ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            确认审核，继续下一步 <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursewareReviewEditor;
