import { useState, useRef } from 'react';
import { PPTSlideThumbnail } from './PPTSlideCanvas';
import type { PPTSlide } from './PPTSlideCanvas';

// ─── Types ───────────────────────────────────────────────────────────
const TEACHING_TAGS = ['陈述', '提问', '总结', '过渡', '讨论', '提示', '发放', '板书', '记录', '演示'] as const;
type TeachingTag = (typeof TEACHING_TAGS)[number];

interface SlideManual {
  slideId: number;
  purpose: string;
  method: string;
  duration: string;
  tools: string;
  selectedTags: TeachingTag[];
  script: string;
  originalScript: string;
  aiOptimizing?: boolean;
  editing?: boolean;
}

// ─── Mock PPT Slides ───────────────────────────────────────────────────
const MOCK_SLIDES: PPTSlide[] = [
  {
    id: 1,
    type: 'cover',
    background: 'gradient-cover',
    elements: [
      { id: 'e1', type: 'title', content: 'AI 赋能的客户服务技能提升', x: 8, y: 28, w: 84, h: 18, fontSize: 36, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', textAlign: 'center', fontFamily: 'inherit' },
      { id: 'e2', type: 'subtitle', content: '讲师：', x: 8, y: 52, w: 84, h: 8, fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontFamily: 'inherit' },
      { id: 'e3', type: 'label', content: '2025.12', x: 8, y: 78, w: 84, h: 6, fontSize: 13, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: 'inherit' },
    ],
  },
  {
    id: 2,
    type: 'toc',
    background: 'gradient-toc',
    elements: [
      { id: 'e1', type: 'title', content: '目录', x: 12, y: 12, w: 40, h: 12, fontSize: 28, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#1e293b', textAlign: 'left', fontFamily: 'inherit' },
      { id: 'e2', type: 'body', content: '01  夯实AI解答知识基础', x: 14, y: 32, w: 72, h: 8, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#475569', textAlign: 'left', fontFamily: 'inherit' },
      { id: 'e3', type: 'body', content: '02  炼就AI分析问题技能', x: 14, y: 46, w: 72, h: 8, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#475569', textAlign: 'left', fontFamily: 'inherit' },
      { id: 'e4', type: 'body', content: '03  掌握客户导向调解方法', x: 14, y: 60, w: 72, h: 8, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#475569', textAlign: 'left', fontFamily: 'inherit' },
    ],
  },
  {
    id: 3,
    type: 'content',
    background: '#ffffff',
    elements: [
      { id: 'e1', type: 'title', content: '模块一：夯实AI解答知识基础', x: 6, y: 5, w: 88, h: 12, fontSize: 22, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', textAlign: 'left', fontFamily: 'inherit' },
      { id: 'e2', type: 'body', content: '• AI客服的核心能力模型：理解、判断、回应\n• 知识库搭建的底层逻辑与分类框架\n• 常见FAQ场景的标准化应答策略\n• 实战：用AI快速提升知识检索效率', x: 6, y: 26, w: 88, h: 60, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#334155', textAlign: 'left', fontFamily: 'inherit' },
    ],
  },
  {
    id: 4,
    type: 'content',
    background: '#ffffff',
    elements: [
      { id: 'e1', type: 'title', content: '模块二：炼就AI分析问题技能', x: 6, y: 5, w: 88, h: 12, fontSize: 22, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', textAlign: 'left', fontFamily: 'inherit' },
      { id: 'e2', type: 'body', content: '• 客户问题的本质拆解：表层诉求与隐性需求\n• AI辅助的问题分类与优先级判断\n• 复杂问题的多轮对话拆解技巧\n• 案例分析：从问题分析到精准解答', x: 6, y: 26, w: 88, h: 60, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#334155', textAlign: 'left', fontFamily: 'inherit' },
    ],
  },
  {
    id: 5,
    type: 'content',
    background: '#ffffff',
    elements: [
      { id: 'e1', type: 'title', content: '模块三：掌握客户导向调解方法', x: 6, y: 5, w: 88, h: 12, fontSize: 22, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', textAlign: 'left', fontFamily: 'inherit' },
      { id: 'e2', type: 'body', content: '• 以客户为中心的沟通思维转变\n• 情绪识别与冲突降温的实操技巧\n• AI协助下的个性化解决方案生成\n• 全渠道服务体验的一致性保障', x: 6, y: 26, w: 88, h: 60, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#334155', textAlign: 'left', fontFamily: 'inherit' },
    ],
  },
  {
    id: 6,
    type: 'end',
    background: 'gradient-end',
    elements: [
      { id: 'e1', type: 'title', content: '感谢参与', x: 8, y: 36, w: 84, h: 14, fontSize: 32, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', textAlign: 'center', fontFamily: 'inherit' },
      { id: 'e2', type: 'subtitle', content: '期待与你共同成长', x: 8, y: 55, w: 84, h: 10, fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: 'rgba(255,255,255,0.75)', textAlign: 'center', fontFamily: 'inherit' },
    ],
  },
];

// ─── Mock Lecture Scripts ──────────────────────────────────────────────
const INITIAL_MANUALS: SlideManual[] = [
  {
    slideId: 1,
    purpose: '引出课程主题',
    method: '讲解陈述',
    duration: '1分钟',
    tools: '无',
    selectedTags: ['陈述', '提问'],
    script: '好的，各位学员大家好！欢迎来到《AI赋能的客户服务技能提升》课程。我是今天的讲师，本次课程将聚焦如何借助AI工具提升客服效率与质量。在数字化时代，客户服务模式不断升级，AI已成为客服工作的重要助手，但如何真正发挥AI价值、提升服务技能，正是我们今天要共同探讨的核心内容。接下来，让我们一起开启今天的学习之旅！',
    originalScript: '好的，各位学员大家好！欢迎来到《AI赋能的客户服务技能提升》课程。我是今天的讲师，本次课程将聚焦如何借助AI工具提升客服效率与质量。在数字化时代，客户服务模式不断升级，AI已成为客服工作的重要助手，但如何真正发挥AI价值、提升服务技能，正是我们今天要共同探讨的核心内容。接下来，让我们一起开启今天的学习之旅！',
  },
  {
    slideId: 2,
    purpose: '展示课程目录',
    method: '讲解陈述',
    duration: '1分钟',
    tools: '无',
    selectedTags: ['陈述'],
    script: '现在我们来看本次课程的目录，主要分为三个模块：第一模块"夯实AI解答知识基础"，帮助大家掌握AI工具的核心知识；第二模块"炼就AI分析问题技能"，提升运用AI分析客户问题的能力；第三模块"掌握客户导向调解方法"，重点学习如何将复杂业务转化为客户易懂的语言。通过这三个模块的学习，我们将系统提升AI赋能下的客服技能。',
    originalScript: '现在我们来看本次课程的目录，主要分为三个模块：第一模块"夯实AI解答知识基础"，帮助大家掌握AI工具的核心知识；第二模块"炼就AI分析问题技能"，提升运用AI分析客户问题的能力；第三模块"掌握客户导向调解方法"，重点学习如何将复杂业务转化为客户易懂的语言。通过这三个模块的学习，我们将系统提升AI赋能下的客服技能。',
  },
  {
    slideId: 3,
    purpose: '讲解第一模块知识',
    method: '讲解+互动',
    duration: '12分钟',
    tools: '白板',
    selectedTags: ['陈述', '提问', '讨论'],
    script: '我们进入第一模块的核心内容。首先，大家思考一个问题：你们在日常工作中，AI帮你解决的最多的是哪类问题？\n\n好，让我们从AI客服的核心能力模型说起——理解、判断、回应三个维度缺一不可。理解，是指AI对用户意图的准确识别，包括语义理解和情感识别；判断，是指基于知识库和业务规则做出准确的决策路径；回应，是指生成既符合业务规范又贴近用户情感的回复内容。\n\n知识库是AI客服的"大脑"，搭建知识库时，需要按照场景、频次、复杂度三个维度进行分类，让AI能够快速定位最优解答路径。',
    originalScript: '我们进入第一模块的核心内容。首先，大家思考一个问题：你们在日常工作中，AI帮你解决的最多的是哪类问题？\n\n好，让我们从AI客服的核心能力模型说起——理解、判断、回应三个维度缺一不可。理解，是指AI对用户意图的准确识别，包括语义理解和情感识别；判断，是指基于知识库和业务规则做出准确的决策路径；回应，是指生成既符合业务规范又贴近用户情感的回复内容。\n\n知识库是AI客服的"大脑"，搭建知识库时，需要按照场景、频次、复杂度三个维度进行分类，让AI能够快速定位最优解答路径。',
  },
  {
    slideId: 4,
    purpose: '讲解第二模块知识',
    method: '案例教学',
    duration: '15分钟',
    tools: '案例卡片',
    selectedTags: ['陈述', '讨论', '演示'],
    script: '进入第二模块，炼就AI分析问题的技能。这里我们要建立一个核心认知：客户提出的问题，往往不是真正的问题。\n\n举个例子，客户说"你们的产品太难用了"，这是表层诉求。背后的隐性需求可能是：操作步骤太多、找不到某个功能、或者之前使用习惯被打乱了。AI的价值不只是回答表面问题，而是通过多轮对话，逐步剥离到问题的核心。\n\n接下来我们看一个实际案例，请大家分析这段客服对话，找出其中的问题分析步骤……',
    originalScript: '进入第二模块，炼就AI分析问题的技能。这里我们要建立一个核心认知：客户提出的问题，往往不是真正的问题。\n\n举个例子，客户说"你们的产品太难用了"，这是表层诉求。背后的隐性需求可能是：操作步骤太多、找不到某个功能、或者之前使用习惯被打乱了。AI的价值不只是回答表面问题，而是通过多轮对话，逐步剥离到问题的核心。\n\n接下来我们看一个实际案例，请大家分析这段客服对话，找出其中的问题分析步骤……',
  },
  {
    slideId: 5,
    purpose: '讲解第三模块知识',
    method: '角色扮演',
    duration: '15分钟',
    tools: '角色扮演卡',
    selectedTags: ['讨论', '演示', '提问'],
    script: '最后一个模块，我们重点讲"客户导向"的思维转变。许多客服人员习惯站在企业立场说话，但真正高效的客服，是能把客户的问题翻译成解决方案，而不是把规定念给客户听。\n\n当客户情绪激动时，第一步不是给方案，而是"情绪回应"——让客户感受到被理解。我们可以用"我理解您的感受"+"具体复述客户情况"+"承诺跟进行动"这三步来构建回应框架。\n\n现在我们来做一个小练习，请两位同学分别扮演客服和客户，演示如何用这三步框架处理一个投诉场景……',
    originalScript: '最后一个模块，我们重点讲"客户导向"的思维转变。许多客服人员习惯站在企业立场说话，但真正高效的客服，是能把客户的问题翻译成解决方案，而不是把规定念给客户听。\n\n当客户情绪激动时，第一步不是给方案，而是"情绪回应"——让客户感受到被理解。我们可以用"我理解您的感受"+"具体复述客户情况"+"承诺跟进行动"这三步来构建回应框架。\n\n现在我们来做一个小练习，请两位同学分别扮演客服和客户，演示如何用这三步框架处理一个投诉场景……',
  },
  {
    slideId: 6,
    purpose: '总结与结束',
    method: '总结回顾',
    duration: '2分钟',
    tools: '无',
    selectedTags: ['总结', '提问'],
    script: '好的，我们今天的课程就到这里。让我们做一个简单的回顾：通过三个模块的学习，我们从知识基础、分析技能到调解方法，构建了一套完整的AI赋能客服技能体系。\n\n最后，我想问大家一个问题：今天学到的哪个方法，是你明天就能用到工作中的？给大家30秒思考一下……\n\n非常好！希望大家把今天学到的内容真正落地到实际工作中。感谢大家的积极参与，期待在后续的实践中与大家共同成长！',
    originalScript: '好的，我们今天的课程就到这里。让我们做一个简单的回顾：通过三个模块的学习，我们从知识基础、分析技能到调解方法，构建了一套完整的AI赋能客服技能体系。\n\n最后，我想问大家一个问题：今天学到的哪个方法，是你明天就能用到工作中的？给大家30秒思考一下……\n\n非常好！希望大家把今天学到的内容真正落地到实际工作中。感谢大家的积极参与，期待在后续的实践中与大家共同成长！',
  },
];

// ─── Component ─────────────────────────────────────────────────────────
interface InstructorManualEditorProps {
  onBack: () => void;
  onNext: () => void;
}

const InstructorManualEditor = ({ onBack, onNext }: InstructorManualEditorProps) => {
  const [manuals, setManuals] = useState<SlideManual[]>(INITIAL_MANUALS);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleTag = (slideId: number, tag: TeachingTag) => {
    setManuals(prev => prev.map(m =>
      m.slideId === slideId
        ? {
            ...m,
            selectedTags: m.selectedTags.includes(tag)
              ? m.selectedTags.filter(t => t !== tag)
              : [...m.selectedTags, tag],
          }
        : m
    ));
  };

  const restoreScript = (slideId: number) => {
    setManuals(prev => prev.map(m =>
      m.slideId === slideId ? { ...m, script: m.originalScript } : m
    ));
  };

  const updateScript = (slideId: number, text: string) => {
    setManuals(prev => prev.map(m =>
      m.slideId === slideId ? { ...m, script: text } : m
    ));
  };

  const toggleEditing = (slideId: number) => {
    setManuals(prev => prev.map(m =>
      m.slideId === slideId ? { ...m, editing: !m.editing } : { ...m, editing: false }
    ));
  };

  const aiOptimize = (slideId: number) => {
    setManuals(prev => prev.map(m =>
      m.slideId === slideId ? { ...m, aiOptimizing: true } : m
    ));
    setTimeout(() => {
      setManuals(prev => prev.map(m => {
        if (m.slideId !== slideId) return m;
        const opt = m.script
          .replace(/。/g, '，请大家记住这一点。')
          .replace(/我们/g, '我们一起')
          .replace(/接下来/g, '那么接下来');
        return { ...m, aiOptimizing: false, script: opt.slice(0, m.script.length) };
      }));
    }, 1800);
  };

  const updateMeta = (slideId: number, field: keyof Pick<SlideManual, 'purpose' | 'method' | 'duration' | 'tools'>, value: string) => {
    setManuals(prev => prev.map(m =>
      m.slideId === slideId ? { ...m, [field]: value } : m
    ));
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f4fa]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center bg-indigo-100 rounded-lg flex-shrink-0">
            <i className="ri-booklet-line text-indigo-600 text-sm" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-800">讲师手册</p>
            <p className="text-[11px] text-gray-400">每页PPT与讲稿一一对应 · 支持手动编辑与AI优化</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400">{manuals.length} 页讲稿</span>
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-all"
          >
            <i className="ri-download-line text-sm" />
            下载讲师手册
          </button>
        </div>
      </div>

      {/* ── Column Labels ── */}
      <div className="flex flex-shrink-0 px-5 pt-3 gap-4">
        <div className="w-[48%] flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg">
          <i className="ri-slideshow-2-line text-indigo-500 text-sm" />
          <span className="text-[11px] font-bold text-gray-600">PPT 页面</span>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg">
          <i className="ri-file-text-line text-blue-500 text-sm" />
          <span className="text-[11px] font-bold text-gray-600">讲师讲稿</span>
        </div>
      </div>

      {/* ── Main scrollable area: PPT + Script in same row ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-3 space-y-4"
      >
        {manuals.map((manual) => {
          const slide = MOCK_SLIDES.find(s => s.id === manual.slideId);
          if (!slide) return null;

          return (
            <div key={manual.slideId} className="flex gap-4 items-stretch">

              {/* ── Left: PPT Slide ── */}
              <div className="w-[48%] flex-shrink-0 flex flex-col">
                {/* Page label */}
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-bold text-gray-500">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-bold mr-1.5">
                      {manual.slideId}
                    </span>
                    第 {manual.slideId} 页
                  </span>
                  {slide.type === 'cover' && <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded font-medium">封面</span>}
                  {slide.type === 'toc' && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-500 rounded font-medium">目录</span>}
                  {slide.type === 'end' && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium">结束页</span>}
                  {slide.type === 'content' && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded font-medium">内容页</span>}
                </div>
                {/* Slide thumbnail — fills remaining height */}
                <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 bg-white min-h-[220px]">
                  <PPTSlideThumbnail slide={slide} />
                </div>
              </div>

              {/* ── Right: Script Card ── */}
              <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Page label row (aligned with left) */}
                <div className="flex items-center gap-2 px-1 mb-0 h-[26px] flex-shrink-0">
                  {/* intentionally empty to align with left label row */}
                </div>

                {/* Meta row */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-500">
                    <MetaField label="目的" value={manual.purpose} onChange={v => updateMeta(manual.slideId, 'purpose', v)} />
                    <span className="text-gray-200">|</span>
                    <MetaField label="教学方法" value={manual.method} onChange={v => updateMeta(manual.slideId, 'method', v)} />
                    <span className="text-gray-200">|</span>
                    <MetaField label="时长" value={manual.duration} onChange={v => updateMeta(manual.slideId, 'duration', v)} />
                    <span className="text-gray-200">|</span>
                    <MetaField label="道具" value={manual.tools} onChange={v => updateMeta(manual.slideId, 'tools', v)} />
                  </div>
                </div>

                {/* Teaching method tags */}
                <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-1.5 flex-wrap flex-shrink-0">
                  <span className="text-[10px] text-gray-400 mr-0.5 whitespace-nowrap">教学方式：</span>
                  {TEACHING_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(manual.slideId, tag)}
                      className={`text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer transition-all whitespace-nowrap ${
                        manual.selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => restoreScript(manual.slideId)}
                    className="ml-auto flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <i className="ri-arrow-go-back-line text-xs" />
                    还原
                  </button>
                </div>

                {/* Script content — flex-1 so it fills remaining height */}
                <div className="flex-1 flex flex-col px-4 py-3 min-h-0">
                  {manual.editing ? (
                    <textarea
                      value={manual.script}
                      onChange={e => updateScript(manual.slideId, e.target.value)}
                      className="flex-1 w-full min-h-[100px] text-[12px] text-gray-700 leading-relaxed resize-none border border-blue-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-blue-50/30"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => toggleEditing(manual.slideId)}
                      className={`flex-1 text-[12px] text-gray-700 leading-[1.85] cursor-text rounded-lg px-3 py-2 border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all whitespace-pre-wrap ${
                        manual.aiOptimizing ? 'opacity-50' : ''
                      }`}
                    >
                      {manual.aiOptimizing ? (
                        <div className="flex items-center gap-2 text-blue-500">
                          <i className="ri-loader-4-line animate-spin" />
                          <span>AI正在优化讲稿...</span>
                        </div>
                      ) : manual.script}
                    </div>
                  )}

                  {/* Action bar */}
                  <div className="flex items-center gap-2 mt-2 flex-shrink-0">
                    {manual.editing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleEditing(manual.slideId)}
                          className="flex items-center gap-1 text-[11px] px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer whitespace-nowrap transition-all"
                        >
                          <i className="ri-check-line text-xs" />
                          完成编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => { restoreScript(manual.slideId); toggleEditing(manual.slideId); }}
                          className="text-[11px] px-3 py-1.5 border border-gray-200 text-gray-500 rounded-md cursor-pointer hover:bg-gray-50 whitespace-nowrap transition-all"
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleEditing(manual.slideId)}
                        className="flex items-center gap-1 text-[11px] px-3 py-1.5 border border-gray-200 text-gray-600 rounded-md cursor-pointer hover:bg-gray-50 whitespace-nowrap transition-all"
                      >
                        <i className="ri-edit-line text-xs" />
                        手动编辑
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => aiOptimize(manual.slideId)}
                      disabled={manual.aiOptimizing || manual.editing}
                      className="flex items-center gap-1 text-[11px] px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-md cursor-pointer whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {manual.aiOptimizing ? (
                        <><i className="ri-loader-4-line animate-spin text-xs" />优化中...</>
                      ) : (
                        <><i className="ri-sparkling-line text-xs" />AI优化</>
                      )}
                    </button>
                    <span className="ml-auto text-[10px] text-gray-300">
                      {manual.script.replace(/\s/g, '').length} 字
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* bottom padding */}
        <div className="h-4" />
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[12px] font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap"
        >
          <i className="ri-arrow-left-line text-sm" />
          上一步：课件审核
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400">
            {manuals.length} 页讲稿 · 随时可继续编辑
          </span>
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-all"
          >
            确认完成，返回课程列表
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MetaField ────────────────────────────────────────────────────────
interface MetaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const MetaField = ({ label, value, onChange }: MetaFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px]">
        <span className="text-gray-400">{label}：</span>
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
          }}
          className="border-b border-blue-400 bg-transparent outline-none text-[11px] text-blue-700 min-w-[40px] max-w-[100px] font-medium"
          style={{ width: `${Math.max(40, draft.length * 8)}px` }}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <span className="text-gray-400">{label}：</span>
      <span
        onClick={() => { setEditing(true); setDraft(value); }}
        className="text-gray-700 font-medium cursor-pointer hover:text-blue-600 hover:underline hover:decoration-dashed transition-colors"
      >
        {value}
      </span>
    </span>
  );
};

export default InstructorManualEditor;
