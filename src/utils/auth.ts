/** 前端登录态（演示：可与后端 token 对接） */
const AUTH_KEY = 'magictrainer_auth';

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1';
}

export function login(): void {
  localStorage.setItem(AUTH_KEY, '1');
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getDisplayName(): string {
  return '刘楚涵';
}
