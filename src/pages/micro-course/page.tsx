import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UserMenuButton from '../../components/UserMenuButton';
import DashboardSidebar from '../dashboard/components/DashboardSidebar';
import MicroStepBar from './components/MicroStepBar';
import CoursePlanningStep, { type CoursePlanData } from './components/CoursePlanningStep';
import ScriptGenerationStep from './components/ScriptGenerationStep';
import ScriptDesignStep from './components/ScriptDesignStep';
import VideoSynthesisStep from './components/VideoSynthesisStep';
import { saveCourse, updateCourseProgress } from '../../utils/courseStorage';

const MicroCoursePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [courseTitle, setCourseTitle] = useState('');
  const [script, setScript] = useState('');
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const handlePlanningNext = (data: CoursePlanData, title: string) => {
    setCourseTitle(title);
    const saved = saveCourse(title, 'AI微课开发', ['课程规划', '脚本生成', '脚本设计', '视频合成']);
    setSavedCourseId(saved.id);
    updateCourseProgress(saved.id, 0, 25);
    setCurrentStep(1);
  };

  const handleScriptGenerationNext = (generatedScript: string) => {
    setScript(generatedScript);
    if (savedCourseId) updateCourseProgress(savedCourseId, 1, 50);
    setCurrentStep(2);
  };

  const handleScriptDesignNext = () => {
    if (savedCourseId) updateCourseProgress(savedCourseId, 2, 75);
    setCurrentStep(3);
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4fa]">
      <DashboardSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-lg border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <a
                href="/ai-course"
                className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                onClick={(e) => { e.preventDefault(); navigate('/ai-course'); }}
              >
                AI课程制作
              </a>
              <i className="ri-arrow-right-s-line" />
              <span className="text-gray-700 font-semibold">AI微课开发</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg">
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <i className="ri-video-chat-line text-blue-500 text-xs" />
              </div>
              <span className="text-[11px] font-semibold text-blue-600">《创课车间®》视频微课流程</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-gray-400 w-44">
              <i className="ri-search-line text-sm" />
              <span className="text-xs">快速搜索...</span>
              <span className="ml-auto text-[10px] bg-gray-200 rounded px-1">⌘K</span>
            </div>

            {/* Notification */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <i className="ri-notification-3-line text-base" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
              </button>
              {notifOpen && (
                <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">通知</span>
                    <span className="text-[10px] text-blue-600 cursor-pointer">全部已读</span>
                  </div>
                  {[
                    { title: '微课生成完成', desc: '《高效沟通三步法》视频已合成', time: '2分钟前', icon: 'ri-check-circle-fill', color: 'text-blue-500' },
                    { title: 'AI调用提醒', desc: '本月调用次数达到300次', time: '1小时前', icon: 'ri-robot-line', color: 'text-sky-500' },
                    { title: '视频合成提醒', desc: '队列中有1个微课正在合成', time: '今天', icon: 'ri-video-line', color: 'text-indigo-500' },
                  ].map((n) => (
                    <div key={n.title} className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex items-start gap-3">
                        <i className={`${n.icon} text-base ${n.color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <i className="ri-settings-3-line text-base" />
            </button>

            <UserMenuButton />
          </div>
        </header>

        {/* ── Step Bar ── */}
        <MicroStepBar currentStep={currentStep} />

        {/* ── Main Content ── */}
        <div className="flex-1 px-6 py-5 overflow-hidden" style={{ maxHeight: 'calc(100vh - 110px)' }}>
          {currentStep === 0 && (
            <CoursePlanningStep onNext={handlePlanningNext} />
          )}
          {currentStep === 1 && (
            <ScriptGenerationStep
              courseTitle={courseTitle}
              onBack={() => setCurrentStep(0)}
              onNext={handleScriptGenerationNext}
            />
          )}
          {currentStep === 2 && (
            <ScriptDesignStep
              onBack={() => setCurrentStep(1)}
              onNext={handleScriptDesignNext}
            />
          )}
          {currentStep === 3 && (
            <VideoSynthesisStep
              courseTitle={courseTitle}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default MicroCoursePage;
