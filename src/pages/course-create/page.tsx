import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UserMenuButton from '../../components/UserMenuButton';
import StepBar from './components/StepBar';
import TopicPanel, { type CourseFormData } from './components/TopicPanel';
import AnalysisPanel from './components/AnalysisPanel';
import CourseAnalysisInputPanel, { type AnalysisFormData } from './components/CourseAnalysisInputPanel';
import CourseAnalysisOutputPanel from './components/CourseAnalysisOutputPanel';
import CourseAnalysisResultEditor from './components/CourseAnalysisResultEditor';
import CourseOutlineEditor from './components/CourseOutlineEditor';
import MaterialMatchingEditor, { INITIAL_SLIDES } from './components/MaterialMatchingEditor';
import CoursewareGenerationEditor from './components/CoursewareGenerationEditor';
import CoursewareReviewEditor from './components/CoursewareReviewEditor';
import InstructorManualEditor from './components/InstructorManualEditor';
import { saveCourse, updateCourseProgress } from '../../utils/courseStorage';
import {
  isDifyStep1Configured,
  runStep1TopicEvaluation,
  type Step1Dimension,
} from '../../services/dify/step1TopicEvaluation';
import type { CourseAnalysisResultData } from '../../services/dify/step2-parse';
import type { MaterialSlide } from '../../services/dify/step4PptOutline';
import {
  isDifyStep2AConfigured,
  isDifyStep2BConfigured,
  runStep2CourseAnalysisEvaluation,
  runStep2LearnerGoalsDesign,
} from '../../services/dify/step2Analysis';

/* ─── Step 1 constants ─── */
const DEFAULT_FORM: CourseFormData = {
  trainTarget: '',
  targetJobInfo: '',
  targetJobDuty: '',
  trainGoal: '',
  topicName: '',
  courseDuration: '6课时',
};

const MOCK_DIMENSIONS = [
  { label: '稀缺度', current: 19, total: 25, analysis: '该主题结合了AI最新技术趋势，在市场上具备一定的稀缺性，能够吸引高潜力学员群体，获基础分19分。' },
  { label: '实用度', current: 21, total: 25, analysis: '课程内容与岗位职责高度匹配，能够直接解决工作痛点，实操性较强，可获较高实用度评分。' },
  { label: '鲜活度', current: 20, total: 25, analysis: '结合当前热门技术方向，内容时效性好，建议补充近期行业案例以进一步提升鲜活度。' },
  { label: '颗粒度', current: 18, total: 25, analysis: '课程知识点拆解较为完整，建议进一步细化实战演练环节，使学员能够逐步深入掌握。' },
];

const MOCK_SUGGESTIONS = [
  'AI辅助推动团队效能提升',
  '用数据说话的业务复盘方法',
  'AI赋能的一线运营提效',
];

/* ─── Step 2 constants ─── */
const DEFAULT_ANALYSIS_FORM: AnalysisFormData = {
  topicName: '',
  needBackground: '',
  businessAnalysis: '',
  taskAnalysis: '',
  requiredAbility: '',
  abilityGap: '',
  currentAbility: '',
  learningMotivation: '',
  learningStyle: '',
  pastLearningEffect: '',
};

const CourseCreatePage = () => {
  const navigate = useNavigate();

  /* ── Global step state ── */
  const [currentStep, setCurrentStep] = useState(0); // 0 = 选题评估, 1 = 课程分析
  /** 已通过各步「下一步」推进完成的步骤索引（用于步骤条勾选，与点击跳转无关） */
  const [completedThrough, setCompletedThrough] = useState(-1);

  /* ── Step 1 state ── */
  const [form, setForm] = useState<CourseFormData>(DEFAULT_FORM);
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Generated, setStep1Generated] = useState(false);
  const [generatedTopicName, setGeneratedTopicName] = useState('');
  const [step1Score, setStep1Score] = useState(78);
  const [step1Dimensions, setStep1Dimensions] = useState<Step1Dimension[]>(MOCK_DIMENSIONS);
  const [step1Suggestions, setStep1Suggestions] = useState(MOCK_SUGGESTIONS);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  /* ── Step 2 state ── */
  const [analysisForm, setAnalysisForm] = useState<AnalysisFormData>(DEFAULT_ANALYSIS_FORM);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Generated, setStep2Generated] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [step2ResultData, setStep2ResultData] = useState<CourseAnalysisResultData | null>(null);
  const [step2ResultLoading, setStep2ResultLoading] = useState(false);
  const [step2Phase, setStep2Phase] = useState<'analysis' | 'result'>('analysis');

  /* ── Nav ── */
  const [notifOpen, setNotifOpen] = useState(false);

  /* ── Saved course tracking ── */
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);

  /* ── Step 4 → 5：素材匹配页幻灯片大纲（供第五步生成 PPT） ── */
  const [materialSlides, setMaterialSlides] = useState<MaterialSlide[]>(() =>
    INITIAL_SLIDES.map((s) => ({ ...s, media: { ...s.media } }))
  );

  /* ── Step 1 handlers ── */
  const handleFormChange = (key: keyof CourseFormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleGenerate = async () => {
    setStep1Loading(true);
    setStep1Generated(false);
    setStep1Error(null);
    try {
      if (isDifyStep1Configured()) {
        const r = await runStep1TopicEvaluation(form);
        setGeneratedTopicName(r.generatedTopic);
        setStep1Score(r.overallScore);
        setStep1Dimensions(r.dimensions);
        setStep1Suggestions(r.suggestions);
      } else {
        await new Promise((res) => setTimeout(res, 1200));
        const base = form.topicName.trim() || form.trainTarget.trim() || 'AI工程师';
        setGeneratedTopicName(`${base}从零到精通实战培训`);
        setStep1Score(78);
        setStep1Dimensions(MOCK_DIMENSIONS);
        setStep1Suggestions(MOCK_SUGGESTIONS);
      }
      setStep1Generated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      setStep1Error(msg);
      await new Promise((res) => setTimeout(res, 400));
      const base = form.topicName.trim() || form.trainTarget.trim() || 'AI工程师';
      setGeneratedTopicName(`${base}从零到精通实战培训`);
      setStep1Score(78);
      setStep1Dimensions(MOCK_DIMENSIONS);
      setStep1Suggestions(MOCK_SUGGESTIONS);
      setStep1Generated(true);
    } finally {
      setStep1Loading(false);
    }
  };

  const handleSelectSuggestion = (s: string) => {
    setForm((prev) => ({ ...prev, topicName: s }));
    setStep1Generated(false);
  };

  /* ── Step 1 → Step 2 (save course to localStorage) ── */
  const handleStep1Next = () => {
    const title = generatedTopicName || form.topicName.trim() || form.trainTarget.trim() || '新建课程';
    /** 第二步「拟开发课题名称」：优先用步骤一表单字段，空时再带 AI 生成名 / 兜底 */
    const topicForStep2 =
      form.topicName.trim() ||
      generatedTopicName.trim() ||
      form.trainTarget.trim() ||
      title;
    const saved = saveCourse(title);
    setSavedCourseId(saved.id);
    updateCourseProgress(saved.id, 0, 12);
    setAnalysisForm({
      ...DEFAULT_ANALYSIS_FORM,
      topicName: topicForStep2,
    });
    setCompletedThrough((m) => Math.max(m, 0));
    setCurrentStep(1);
    setStep2Phase('analysis');
  };

  /* ── Step 2 handlers ── */
  const handleAnalysisFormChange = (key: keyof AnalysisFormData, val: string) => {
    setAnalysisForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleAnalysisGenerate = async () => {
    setStep2Loading(true);
    setStep2Generated(false);
    setStep2Error(null);
    try {
      if (isDifyStep2AConfigured()) {
        const text = await runStep2CourseAnalysisEvaluation(analysisForm);
        setEvaluation(text);
      } else {
        await new Promise((r) => setTimeout(r, 2400));
        setEvaluation('');
      }
      setStep2Generated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      setStep2Error(msg);
      setEvaluation('');
      setStep2Generated(true);
    } finally {
      setStep2Loading(false);
    }
  };

  /* ── Step 2 analysis → result ── */
  const handleStep2Next = async () => {
    setStep2Error(null);
    setStep2Phase('result');
    if (!isDifyStep2BConfigured() || !evaluation.trim()) {
      setStep2ResultData(null);
      setStep2ResultLoading(false);
      return;
    }
    setStep2ResultLoading(true);
    setStep2ResultData(null);
    try {
      const result = await runStep2LearnerGoalsDesign(analysisForm, evaluation);
      setStep2ResultData(result);
    } catch (e) {
      setStep2Error(e instanceof Error ? e.message : '学员画像生成失败');
      setStep2ResultData(null);
    } finally {
      setStep2ResultLoading(false);
    }
  };

  /* ── Step 2 result → Step 3 ── */
  const handleResultNext = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 1, 25);
    setCompletedThrough((m) => Math.max(m, 1));
    setCurrentStep(2);
  };

  /* ── Step 3 → Step 4 ── */
  const handleStep3Next = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 2, 37);
    setCompletedThrough((m) => Math.max(m, 2));
    setCurrentStep(3);
  };

  /* ── Step 4 → Step 5 ── */
  const handleStep4Next = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 2, 50);
    setCompletedThrough((m) => Math.max(m, 3));
    setCurrentStep(4);
  };

  /* ── Step 5 → Step 6 ── */
  const handleStep5Next = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 3, 62);
    setCompletedThrough((m) => Math.max(m, 4));
    setCurrentStep(5);
  };

  /* ── Step 6 → Step 7 ── */
  const handleStep6Next = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 3, 75);
    setCompletedThrough((m) => Math.max(m, 5));
    setCurrentStep(6);
  };

  /* ── Step 7（讲师手册）→ 完成并返回课程列表（第八步课程脚本已隐藏） ── */
  const handleStep7Next = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 5, 100);
    setCompletedThrough((m) => Math.max(m, 6));
    navigate('/ai-course');
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Navigation ── */}
      <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex-shrink-0">
            <i className="ri-magic-line text-white text-sm" />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] text-gray-400 font-medium">七步成诗</p>
            <p className="text-[12px] text-gray-800 font-bold -mt-0.5">AI制课</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ai-course')}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-home-3-line" />
            回到 AI课程制作
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer relative"
            >
              <i className="ri-notification-3-line text-base" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute top-10 right-0 w-64 bg-white rounded-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <span className="text-[12px] font-bold text-gray-800">通知</span>
                </div>
                {['课程生成完成', '新学员加入', 'AI调用提醒'].map((n) => (
                  <div key={n} className="px-4 py-2.5 text-[11px] text-gray-600 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                    {n}
                  </div>
                ))}
              </div>
            )}
          </div>

          <UserMenuButton variant="compact" />
        </div>
      </header>

      {/* ── Step bar ── */}
      <StepBar currentStep={currentStep} completedThrough={completedThrough} onStepClick={handleStepClick} />

      {step1Error && currentStep === 0 && (
        <div className="px-8 pt-2">
          <div
            role="status"
            className="rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-900"
          >
            <span className="font-semibold">Dify 调用失败，已使用本地示例数据。</span>
            <span className="mt-1 block text-amber-800/90">{step1Error}</span>
          </div>
        </div>
      )}

      {step2Error && currentStep === 1 && (
        <div className="px-8 pt-2">
          <div
            role="status"
            className="rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-900"
          >
            <span className="font-semibold">课程分析 · Dify 提示</span>
            <span className="mt-1 block text-amber-800/90">{step2Error}</span>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex min-h-0 flex-1 items-stretch gap-6 px-8 py-6" style={{ minHeight: 0 }}>
        {/* ─ STEP 1: 选题评估 ─ */}
        {currentStep === 0 && (
          <>
            <div className="flex w-[400px] min-h-0 flex-shrink-0 flex-col self-stretch" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <TopicPanel
                form={form}
                onFormChange={handleFormChange}
                onGenerate={handleGenerate}
                loading={step1Loading}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col self-stretch" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <AnalysisPanel
                score={step1Score}
                dimensions={step1Dimensions}
                onNext={handleStep1Next}
                loading={step1Loading}
                generated={step1Generated}
                generatedTopicName={generatedTopicName}
                suggestions={step1Suggestions}
                onSelectSuggestion={handleSelectSuggestion}
              />
            </div>
          </>
        )}

        {/* ─ STEP 2: 课程分析 ─ */}
        {currentStep === 1 && step2Phase === 'analysis' && (
          <>
            <div className="flex w-[420px] min-h-0 flex-shrink-0 flex-col self-stretch" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <CourseAnalysisInputPanel
                form={analysisForm}
                onChange={handleAnalysisFormChange}
                onGenerate={handleAnalysisGenerate}
                loading={step2Loading}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col self-stretch" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <CourseAnalysisOutputPanel
                loading={step2Loading}
                generated={step2Generated}
                evaluation={evaluation || undefined}
                onEvaluationChange={setEvaluation}
                onNext={handleStep2Next}
              />
            </div>
          </>
        )}

        {/* ─ STEP 2 RESULT: 学员画像 + 课程目标 + 设计思路 ─ */}
        {currentStep === 1 && step2Phase === 'result' && (
          <div className="flex min-h-0 flex-1 flex-col self-stretch" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <CourseAnalysisResultEditor
              onBack={() => setStep2Phase('analysis')}
              onNext={handleResultNext}
              initialData={step2ResultData}
              loading={step2ResultLoading}
            />
          </div>
        )}

        {/* ─ STEP 3: 课程大纲 ─ */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <CourseOutlineEditor
              onBack={() => {
                setCurrentStep(1);
              }}
              onNext={handleStep3Next}
              courseTitle={
                analysisForm.topicName.trim() ||
                form.topicName.trim() ||
                generatedTopicName.trim() ||
                ''
              }
              courseDuration={form.courseDuration}
              courseAnalysis={step2ResultData}
            />
          </div>
        )}

        {/* ─ STEP 4: 素材匹配 ─ */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <MaterialMatchingEditor
              onBack={() => setCurrentStep(2)}
              onNext={handleStep4Next}
              slides={materialSlides}
              onSlidesChange={setMaterialSlides}
              courseTitle={analysisForm.topicName}
              courseAnalysis={step2ResultData}
            />
          </div>
        )}

        {/* ─ STEP 5: 课件生成 ─ */}
        {currentStep === 4 && (
          <div className="flex-1 flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <CoursewareGenerationEditor
              onBack={() => setCurrentStep(3)}
              onNext={handleStep5Next}
              courseTitle={
                analysisForm.topicName.trim() ||
                form.topicName.trim() ||
                generatedTopicName.trim() ||
                '课程课件'
              }
              materialSlides={materialSlides}
            />
          </div>
        )}

        {/* ─ STEP 6: 课件审核 ─ */}
        {currentStep === 5 && (
          <div className="flex-1 flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <CoursewareReviewEditor
              onBack={() => setCurrentStep(4)}
              onNext={handleStep6Next}
            />
          </div>
        )}

        {/* ─ STEP 7: 讲师手册 ─ */}
        {currentStep === 6 && (
          <div className="flex-1 flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <InstructorManualEditor
              onBack={() => setCurrentStep(5)}
              onNext={handleStep7Next}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseCreatePage;
