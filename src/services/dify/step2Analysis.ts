/**
 * 步骤二 · Dify 双工作流（课程分析评估 + 学员画像/课程目标）
 */
import type { AnalysisFormData } from '@/pages/course-create/components/CourseAnalysisInputPanel';

import { runDifyWorkflowBlocking } from './agent-dify';
import {
  buildStep2AWorkflowInputs,
  buildStep2BWorkflowInputs,
  ensureCourseGoalsShape,
  parseStep2AEvaluationReport,
  parseStep2BOutputs,
  type CourseAnalysisResultData,
} from './step2-parse';

function getStep2ApiKey(which: 'a' | 'b'): string {
  const k =
    which === 'a'
      ? import.meta.env.VITE_DIFY_STEP2A_API_KEY?.trim()
      : import.meta.env.VITE_DIFY_STEP2B_API_KEY?.trim();
  if (!k) throw new Error(which === 'a' ? '未配置 VITE_DIFY_STEP2A_API_KEY' : '未配置 VITE_DIFY_STEP2B_API_KEY');
  return k;
}

function getStep2UserId(): string {
  return import.meta.env.VITE_DIFY_STEP2_USER_ID?.trim() || 'course-create-step2';
}

export function isDifyStep2AConfigured(): boolean {
  return Boolean(import.meta.env.VITE_DIFY_STEP2A_API_KEY?.trim());
}

export function isDifyStep2BConfigured(): boolean {
  return Boolean(import.meta.env.VITE_DIFY_STEP2B_API_KEY?.trim());
}

/** 步骤二-A：生成《课程分析评估报告》Markdown 正文 */
export async function runStep2CourseAnalysisEvaluation(form: AnalysisFormData): Promise<string> {
  const inputs = buildStep2AWorkflowInputs(form);
  const outputs = await runDifyWorkflowBlocking(inputs, {
    apiKey: getStep2ApiKey('a'),
    userId: getStep2UserId(),
  });
  return parseStep2AEvaluationReport(outputs);
}

/** 步骤二-B：学员画像 + 三维课程目标 + 设计思路 */
export async function runStep2LearnerGoalsDesign(
  form: AnalysisFormData,
  evaluationReport: string
): Promise<CourseAnalysisResultData> {
  const inputs = buildStep2BWorkflowInputs(form, evaluationReport);
  const outputs = await runDifyWorkflowBlocking(inputs, {
    apiKey: getStep2ApiKey('b'),
    userId: getStep2UserId(),
  });
  return ensureCourseGoalsShape(parseStep2BOutputs(outputs));
}

export type { CourseAnalysisResultData } from './step2-parse';
