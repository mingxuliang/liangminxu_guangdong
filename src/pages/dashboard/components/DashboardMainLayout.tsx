import { useEffect, useState, type ReactNode } from 'react';

import UserMenuButton from '../../../components/UserMenuButton';
import DashboardSidebar from './DashboardSidebar';

type Props = {
  /** 顶栏面包屑区域（左侧） */
  breadcrumb: ReactNode;
  children: ReactNode;
};

const DashboardMainLayout = ({ breadcrumb, children }: Props) => {
  const [visible, setVisible] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f0f4fa]">
      <DashboardSidebar />

      <main
        className={`flex-1 min-w-0 overflow-y-auto transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-lg border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0 flex-wrap">
              {breadcrumb}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-gray-400 w-44">
              <i className="ri-search-line text-sm" />
              <span className="text-xs">快速搜索...</span>
              <span className="ml-auto text-[10px] bg-gray-200 rounded px-1">⌘K</span>
            </div>

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
                    { title: '课程生成完成', desc: '《最佳实践萃取》PPT已生成', time: '2分钟前', icon: 'ri-check-circle-fill', color: 'text-blue-500' },
                    { title: 'AI调用提醒', desc: '本月调用次数达到300次', time: '1小时前', icon: 'ri-robot-line', color: 'text-sky-500' },
                    { title: '新学员加入', desc: '10名学员开始学习您的课程', time: '今天', icon: 'ri-group-fill', color: 'text-indigo-500' },
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

            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <i className="ri-settings-3-line text-base" />
            </button>

            <UserMenuButton />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default DashboardMainLayout;
