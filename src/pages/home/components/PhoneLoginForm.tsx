import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../../../utils/auth';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.09] focus:ring-2 focus:ring-emerald-500/20';

const PhoneLoginForm = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleGetCode = () => {
    if (countdown > 0 || !phone.trim()) return;
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/ai-course');
  };

  const canSend = phone.trim().length > 0 && countdown === 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
      <div className="flex flex-col gap-1.5">
        <label className="pl-0.5 text-xs font-medium text-slate-400">手机号</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <i className="ri-smartphone-line text-base" />
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            name="phone"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="pl-0.5 text-xs font-medium text-slate-400">验证码</label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <i className="ri-shield-keyhole-line text-base" />
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="请输入验证码"
              name="code"
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={handleGetCode}
            disabled={!canSend}
            className={`flex-shrink-0 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              canSend
                ? 'border border-emerald-500/35 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                : 'cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500'
            }`}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 w-full rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.99]"
      >
        登录
      </button>

      <p className="text-center text-xs text-slate-500">
        还没有账号？
        <a href="/register" className="ml-1 font-medium text-emerald-400/90 hover:text-emerald-300">
          联系管理员开通
        </a>
      </p>
    </form>
  );
};

export default PhoneLoginForm;
