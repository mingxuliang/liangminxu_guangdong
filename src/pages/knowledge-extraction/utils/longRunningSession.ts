import { keGetSession, type KeSession } from '@/services/knowledgeExtractionApi';

const POLL_MS = 2500;
/** 约 5 分钟：覆盖 Dify 长任务 */
const POLL_MAX_ROUNDS = 120;

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Step2：当前会话为 filter running 时轮询，直到 ready/failed 或超时。
 * 用于「前端 POST 已断开，但服务端仍在跑」时接回结果。
 */
export async function pollFilterUntilSettled(
  sessionId: string,
  options: { signal?: AbortSignal } = {},
): Promise<KeSession> {
  const { signal } = options;
  for (let i = 0; i < POLL_MAX_ROUNDS; i++) {
    if (signal?.aborted) throw new Error('Aborted');
    const s = await keGetSession(sessionId);
    if (s.filter_status === 'ready' || s.filter_status === 'failed') return s;
    if (s.filter_status !== 'running') return s;
    await sleep(POLL_MS);
  }
  return keGetSession(sessionId);
}

/** Step3：同上，针对 refine */
export async function pollRefineUntilSettled(
  sessionId: string,
  options: { signal?: AbortSignal } = {},
): Promise<KeSession> {
  const { signal } = options;
  for (let i = 0; i < POLL_MAX_ROUNDS; i++) {
    if (signal?.aborted) throw new Error('Aborted');
    const s = await keGetSession(sessionId);
    if (s.refine_status === 'ready' || s.refine_status === 'failed') return s;
    if (s.refine_status !== 'running') return s;
    await sleep(POLL_MS);
  }
  return keGetSession(sessionId);
}
