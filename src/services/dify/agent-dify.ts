/**
 * 步骤一 · Dify 对接（Agent / Chatflow / Workflow）
 *
 * 依据 Dify 官方 API 文档（OpenAPI）：
 * - Workflow 应用：`POST {api_base}/v1/workflows/run`
 *   请求体需包含 `inputs`、`user`；`response_mode: blocking` 同步返回 JSON，
 *   成功时根级含 `task_id`、`workflow_run_id`，业务在 `data.outputs`。
 *   参考：https://docs.dify.ai/api-reference/workflows/run-workflow
 *
 * - Chatflow / Agent / 对话类应用：`POST {api_base}/v1/chat-messages`
 *   请求体需包含 `inputs`、`query`、`user`、`response_mode`；
 *   blocking 模式下返回体含 `answer`（模型回复正文）。
 *   若应用为 Chatflow，可能为 `advanced-chat` 模式。
 *   参考：https://docs.dify.ai/api-reference/chats/send-chat-message
 *
 * 错误码提示：若返回 `not_workflow_app`，说明 API Key 对应应用不是工作流类型，应改用
 * `VITE_DIFY_STEP1_APP_MODE=chat`；反之若对话应用误调 workflow 接口也会失败。
 *
 * 环境变量：
 * - VITE_DIFY_STEP1_API_KEY — 应用「API 访问」中的密钥（Bearer）
 * - VITE_DIFY_BASE_URL — 可选。支持两种写法：① 仅主机，如 `http://81.70.78.132:8088`（将自动补 `/v1`）；
 *   ② 已含版本前缀，如 `http://81.70.78.132:8088/v1` 或开发时 `/dify-api/v1`（不再重复拼接 `/v1`）。
 *   默认开发环境 `/dify-api`（走 Vite 代理）、生产 `https://api.dify.ai`。
 * - VITE_DIFY_STEP1_APP_MODE — `workflow` | `chat`（Agent/Chatflow 用 chat）
 * - VITE_DIFY_STEP1_USER_ID — 可选，默认 `course-create-step1`（须在同一应用内唯一标识终端用户）
 *
 * 步骤二（独立 API Key，Base URL 同上）：
 * - VITE_DIFY_STEP2A_API_KEY — 课程分析评估工作流
 * - VITE_DIFY_STEP2B_API_KEY — 学员画像与课程目标工作流
 * - VITE_DIFY_STEP2_USER_ID — 可选，默认 `course-create-step2`
 */
import type { CourseFormData } from '@/pages/course-create/components/TopicPanel';

import {
  buildStep1WorkflowInputs,
  parseStep1Json,
  parseStep1Outputs,
  stripJsonFence,
  type Step1EvaluationResult,
} from './step1-parse';

/**
 * Dify OpenAPI 根路径（须以 `/v1` 结尾，不含尾部斜杠）。
 * 与官方文档一致：`{Base URL}/workflows/run`，其中 Base URL 常为 `.../v1`。
 */
function getApiV1Root(): string {
  const raw =
    import.meta.env.VITE_DIFY_BASE_URL?.trim() ||
    (import.meta.env.DEV ? '/dify-api' : 'https://api.dify.ai');
  const base = raw.replace(/\/$/, '');
  if (/\/v1$/i.test(base)) return base;
  return `${base}/v1`;
}

function getApiKey(): string {
  const k = import.meta.env.VITE_DIFY_STEP1_API_KEY?.trim();
  if (!k) throw new Error('未配置 VITE_DIFY_STEP1_API_KEY');
  return k;
}

function getEndUserId(): string {
  return import.meta.env.VITE_DIFY_STEP1_USER_ID?.trim() || 'course-create-step1';
}

export type DifyWorkflowRunOptions = {
  /** 不传则使用 VITE_DIFY_STEP1_API_KEY */
  apiKey?: string;
  /** 不传则使用 VITE_DIFY_STEP1_USER_ID / 默认 course-create-step1 */
  userId?: string;
  /** 超时毫秒数，默认 180000（3 分钟）；避免 blocking 请求挂起导致前端一直转圈 */
  timeoutMs?: number;
};

/** Workflow：POST /v1/workflows/run（见官方 WorkflowBlockingResponse） */
export async function runDifyWorkflowBlocking(
  inputs: Record<string, string>,
  options?: DifyWorkflowRunOptions
): Promise<Record<string, unknown>> {
  const apiKey = options?.apiKey?.trim() || getApiKey();
  const userId = options?.userId ?? getEndUserId();
  const timeoutMs = options?.timeoutMs ?? 180_000;

  const url = `${getApiV1Root()}/workflows/run`;

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        inputs,
        response_mode: 'blocking',
        user: userId,
      }),
    });
  } catch (e) {
    const isAbort =
      (e instanceof DOMException && e.name === 'AbortError') ||
      (e instanceof Error && e.name === 'AbortError');
    if (isAbort) {
      throw new Error(
        `Dify 工作流请求超时（>${Math.round(timeoutMs / 1000)}s）。请检查网络/代理，或确认自建 Dify 未卡住；部分版本 blocking 接口异常时可参考官方 issue 改用 streaming。`
      );
    }
    throw e;
  } finally {
    clearTimeout(tid);
  }

  const rawText = await res.text();
  if (!res.ok) {
    let hint = rawText.slice(0, 800);
    try {
      const errJson = JSON.parse(rawText) as { code?: string; message?: string };
      if (errJson.code === 'not_workflow_app') {
        hint += '\n提示：当前 API Key 不是「工作流」应用，请将 VITE_DIFY_STEP1_APP_MODE 设为 chat。';
      }
    } catch {
      /* ignore */
    }
    throw new Error(`Dify Workflow ${res.status}: ${hint}`);
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    throw new Error('Dify 返回非 JSON');
  }

  const data = json.data as Record<string, unknown> | undefined;
  const status = String(data?.status ?? '');
  if (status === 'failed' || status === 'error') {
    const err = (data?.error as string) || (json.message as string) || '工作流执行失败';
    throw new Error(err);
  }

  const outputs = data?.outputs as Record<string, unknown> | undefined;
  const hasOutputs =
    outputs && typeof outputs === 'object' && Object.keys(outputs as object).length > 0;

  const ok =
    status === 'succeeded' ||
    status === 'partial-succeeded' ||
    status === 'success' ||
    (!status && hasOutputs);

  if (!ok) {
    throw new Error(`工作流状态异常: ${status || 'unknown'}`);
  }

  if (!outputs || typeof outputs !== 'object') {
    throw new Error(
      'Dify 返回中缺少 data.outputs（日志若已成功，可能是 blocking 接口未带回输出，请升级 Dify 或改用 streaming / 见官方 issue）'
    );
  }

  return outputs;
}

/**
 * Chat / Agent / Chatflow：POST /v1/chat-messages
 * 返回 `answer` 字段；请在编排中让模型输出步骤一 JSON，或仅输出 JSON 正文。
 */
export async function runDifyChatMessageBlocking(
  inputs: Record<string, string>,
  query: string,
  conversationId?: string
): Promise<string> {
  const url = `${getApiV1Root()}/chat-messages`;

  const body: Record<string, unknown> = {
    inputs,
    query,
    response_mode: 'blocking',
    user: getEndUserId(),
  };
  if (conversationId) {
    body.conversation_id = conversationId;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  if (!res.ok) {
    let hint = rawText.slice(0, 800);
    try {
      const errJson = JSON.parse(rawText) as { code?: string; message?: string };
      if (errJson.code === 'not_chat_app' || errJson.message?.includes('chat')) {
        hint += '\n提示：当前 API Key 不是对话类应用，请将 VITE_DIFY_STEP1_APP_MODE 设为 workflow。';
      }
    } catch {
      /* ignore */
    }
    throw new Error(`Dify Chat ${res.status}: ${hint}`);
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    throw new Error('Dify Chat 返回非 JSON');
  }

  const answer = json.answer;
  if (typeof answer !== 'string' || !answer.trim()) {
    throw new Error('Dify Chat 返回中缺少 answer 字段');
  }

  return answer;
}

/** Agent 模式下的用户 query：触发编排内 Prompt；变量仍以 inputs 为准 */
const STEP1_AGENT_QUERY =
  '请根据已填写的课程信息完成「选题评估」。请直接输出一个 JSON 对象（不要 Markdown 代码块），字段包括：generatedTopic、overallScore、dimensions（4 项：稀缺度/实用度/鲜活度/颗粒度，每项含 label、current、total、analysis）、suggestions（字符串数组，3 条备选课题名）。';

export function getStep1AppMode(): 'workflow' | 'chat' {
  const m = (import.meta.env.VITE_DIFY_STEP1_APP_MODE || 'workflow').toLowerCase();
  if (m === 'chat' || m === 'agent' || m === 'advanced-chat') return 'chat';
  return 'workflow';
}

export async function runStep1DifyEvaluation(form: CourseFormData): Promise<Step1EvaluationResult> {
  const inputs = buildStep1WorkflowInputs(form);
  const mode = getStep1AppMode();

  if (mode === 'chat') {
    const answer = await runDifyChatMessageBlocking(inputs, STEP1_AGENT_QUERY);
    const jsonText = stripJsonFence(answer.trim());
    return parseStep1Json(jsonText);
  }

  const outputs = await runDifyWorkflowBlocking(inputs);
  return parseStep1Outputs(outputs);
}

export function isDifyStep1Configured(): boolean {
  return Boolean(import.meta.env.VITE_DIFY_STEP1_API_KEY?.trim());
}
