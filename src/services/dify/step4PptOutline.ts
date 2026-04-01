/**
 * 步骤四 · 课件 PPT 三级大纲（工作流）
 *
 * 依据前序步骤：课程名称、学员画像、课程目标（知识/技能/态度）、课程设计解决思路，
 * 生成与素材匹配页一致的「逐页」大纲结构，供 MaterialMatchingEditor 展示与配素材。
 */
import type { CourseAnalysisResultData } from './step2-parse';

import { runDifyWorkflowBlocking } from './agent-dify';
import {
  buildStep4WorkflowInputs,
  parseStep4Outputs,
  type PptOutlineSlideDraft,
} from './step4-parse';

function getStep4ApiKey(): string {
  const k = import.meta.env.VITE_DIFY_STEP4_API_KEY?.trim();
  if (!k) throw new Error('未配置 VITE_DIFY_STEP4_API_KEY');
  return k;
}

function getStep4UserId(): string {
  return import.meta.env.VITE_DIFY_STEP4_USER_ID?.trim() || 'course-create-step4';
}

export function isDifyStep4Configured(): boolean {
  return Boolean(import.meta.env.VITE_DIFY_STEP4_API_KEY?.trim());
}

const defaultMedia = () => ({
  video: false,
  image: false,
  audio: false,
  ppt: false,
});

export type MaterialSlide = {
  id: number;
  title: string;
  contentLines: string[];
  subItems?: { label: string; lines?: string[] }[];
  media: ReturnType<typeof defaultMedia>;
};

function draftsToSlides(drafts: PptOutlineSlideDraft[]): MaterialSlide[] {
  return drafts.map((d, i) => ({
    id: i + 1,
    title: d.title,
    contentLines: d.contentLines,
    subItems: d.subItems,
    media: defaultMedia(),
  }));
}

/** 调用步骤四工作流，返回可绑定 UI 的 slides */
export async function runStep4PptOutline(
  courseName: string,
  analysis: CourseAnalysisResultData | null
): Promise<MaterialSlide[]> {
  const inputs = buildStep4WorkflowInputs(courseName, analysis);
  const outputs = await runDifyWorkflowBlocking(inputs, {
    apiKey: getStep4ApiKey(),
    userId: getStep4UserId(),
  });
  const { slides } = parseStep4Outputs(outputs);
  return draftsToSlides(slides);
}
