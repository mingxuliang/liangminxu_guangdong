import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../../../utils/auth';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.09] focus:ring-2 focus:ring-emerald-500/20';

const PasswordLoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/ai-course');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
      <div className="flex flex-col gap-1.5">
        <label className="pl-0.5 text-xs font-medium text-slate-400">账号</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <i className="ri-user-line text-base" />
          </span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱或手机号"
            name="email"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="pl-0.5 text-xs font-medium text-slate-400">密码</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <i className="ri-lock-line text-base" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            name="password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            <i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
          />
          <span className="text-xs text-slate-400">记住我</span>
        </label>
        <a href="/forgot-password" className="text-xs font-medium text-emerald-400/90 hover:text-emerald-300">
          忘记密码？
        </a>
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

export default PasswordLoginForm;
