/**
 * 步骤三 · 课程大纲（工作流）
 * 依据课程名称、课时时长、第二步学员画像/三维目标/设计思路生成与 CourseOutlineEditor 一致的 HTML 文档。
 */
import type { CourseAnalysisResultData } from './step2-parse';

import { runDifyWorkflowBlocking } from './agent-dify';
import {
  buildStep3WorkflowInputs,
  parseStep3Outputs,
  renderStep3OutlineDocumentHtml,
  type Step3OutlineDoc,
} from './step3-parse';

function getStep3ApiKey(): string {
  const k = import.meta.env.VITE_DIFY_STEP3_API_KEY?.trim();
  if (!k) throw new Error('未配置 VITE_DIFY_STEP3_API_KEY');
  return k;
}

function getStep3UserId(): string {
  return import.meta.env.VITE_DIFY_STEP3_USER_ID?.trim() || 'course-create-step3';
}

export function isDifyStep3Configured(): boolean {
  return Boolean(import.meta.env.VITE_DIFY_STEP3_API_KEY?.trim());
}

export async function runStep3FourLevelOutline(
  courseName: string,
  courseDuration: string,
  analysis: CourseAnalysisResultData | null
): Promise<string> {
  const inputs = buildStep3WorkflowInputs(courseName, courseDuration, analysis);
  const timeoutMs = Number(import.meta.env.VITE_DIFY_STEP3_TIMEOUT_MS?.trim() || 120_000);
  const outputs = await runDifyWorkflowBlocking(inputs, {
    apiKey: getStep3ApiKey(),
    userId: getStep3UserId(),
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 120_000,
  });
  const doc = parseStep3Outputs(outputs);
  if (!doc.durationText.trim()) {
    doc.durationText = courseDuration.trim() || '6课时';
  }
  return renderStep3OutlineDocumentHtml(doc);
}

export type { Step3OutlineDoc };
