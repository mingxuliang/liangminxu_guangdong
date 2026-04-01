import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { navItems } from '../../../mocks/dashboard';
import { logout } from '../../../utils/auth';

const PATH_TO_NAV: Record<string, string> = {
  '/ai-course': 'ai-design',
  '/micro-course': 'tips',
  '/course/create': 'ai-design',
  '/system/users': 'tools',
};

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeId, setActiveId] = useState(() => PATH_TO_NAV[location.pathname] ?? 'ai-design');
  const [toolsExpanded, setToolsExpanded] = useState(() =>
    location.pathname.startsWith('/system')
  );

  useEffect(() => {
    const id = PATH_TO_NAV[location.pathname];
    if (id) setActiveId(id);
    if (location.pathname.startsWith('/system')) setToolsExpanded(true);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="relative flex w-[260px] min-h-screen flex-shrink-0 flex-col overflow-hidden border-r border-white/5 bg-gradient-to-b from-slate-950 via-[#0f172a] to-[#0c1a3a]">
      <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-blue-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent" />

      {/* Logo：与登录页左侧品牌区比例一致 */}
      <div className="relative flex items-center gap-3 px-6 pb-6 pt-8">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
          <i className="ri-magic-line text-xl text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-tight text-white">广东移动</p>
          <p className="truncate text-[11px] font-medium text-slate-400">智创制课平台</p>
        </div>
        <button
          type="button"
          className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          aria-label="收起菜单"
        >
          <i className="ri-menu-fold-line text-lg" />
        </button>
      </div>

      <p className="relative mb-2 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">主导航</p>

      <nav className="relative flex flex-1 flex-col space-y-1 overflow-y-auto px-4 pb-4">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          const isTools = item.id === 'tools';
          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (isTools) {
                    setActiveId('tools');
                    if (activeId === 'tools' && toolsExpanded) {
                      setToolsExpanded(false);
                    } else {
                      setToolsExpanded(true);
                      navigate('/system/users');
                    }
                    return;
                  }
                  setActiveId(item.id);
                  if (item.path) navigate(item.path);
                }}
                className={`group relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/18 text-white shadow-sm shadow-blue-950/40'
                    : 'text-slate-300/90 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-400 to-blue-600"
                    aria-hidden
                  />
                )}
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-white/[0.07] text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
                  }`}
                >
                  <i className={`${item.icon} text-[15px]`} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight">{item.label}</span>
                {isTools && (
                  <i
                    className={`ri-arrow-down-s-line flex-shrink-0 text-base text-slate-500 transition-transform ${
                      toolsExpanded ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {isTools && toolsExpanded && (
                <div className="ml-[3.25rem] mt-1 space-y-0.5 border-l border-white/5 pl-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId('tools');
                      navigate('/system/users');
                    }}
                    className={`flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-left text-[12px] whitespace-nowrap transition-colors ${
                      location.pathname === '/system/users'
                        ? 'bg-white/[0.08] font-medium text-white'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                  >
                    <i className="ri-user-settings-line text-[14px]" />
                    用户管理
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="relative mt-auto space-y-3 px-4 pb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/25">
              <i className="ri-sparkle-line text-sm text-sky-300" />
            </div>
            <p className="text-xs font-semibold text-slate-200">当前任务</p>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">探索省体验卡</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
            </div>
            <span className="cursor-pointer whitespace-nowrap text-[10px] text-sky-400/90 hover:underline">生成中</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 py-3 text-[13px] font-medium text-slate-300 transition-colors hover:border-red-400/35 hover:bg-red-950/30 hover:text-red-200"
        >
          <i className="ri-logout-box-r-line text-base" />
          退出登录
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
