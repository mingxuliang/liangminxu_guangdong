import { useEffect, useState } from 'react';
import HomeHero from './components/HomeHero';
import HomeLoginPanel from './components/HomeLoginPanel';

const HomePage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712]">
      {/* 背景层 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(16,185,129,0.12),transparent_55%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(6,182,212,0.08),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.4),rgba(3,7,18,0.95))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full bg-emerald-600/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[min(420px,70vw)] w-[min(420px,70vw)] rounded-full bg-cyan-600/10 blur-[90px]"
        aria-hidden
      />

      {/* 大屏顶栏 */}
      <header className="relative z-20 hidden items-center justify-between px-10 py-6 lg:flex xl:px-14">
        <div className="flex items-center gap-3 opacity-90">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
          <span className="text-xs font-medium tracking-wide text-slate-500">内训数字化 · 广东移动</span>
        </div>
        <span className="text-xs text-slate-600">智创制课 v1</span>
      </header>

      <div
        className={`relative z-10 mx-auto flex min-h-0 w-full max-w-[1280px] flex-col transition-opacity duration-700 ease-out lg:min-h-[calc(100vh-88px)] lg:flex-row lg:items-center lg:gap-8 xl:gap-12 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <HomeHero />

        <div className="flex shrink-0 flex-col justify-center px-5 pb-12 pt-0 lg:w-[min(100%,460px)] lg:px-8 lg:pb-16 lg:pt-8 xl:px-10">
          <HomeLoginPanel />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
