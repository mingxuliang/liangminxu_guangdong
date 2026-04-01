import type { CourseAnalysisResultData } from './step2-parse';

import { stripJsonFence } from './step1-parse';

/** 与 MaterialMatchingEditor 中单页结构一致（不含 id / media，由解析层补全） */
export interface PptOutlineSlideDraft {
  title: string;
  contentLines: string[];
  subItems?: { label: string; lines?: string[] }[];
}

export interface Step4PptOutlinePayload {
  slides: PptOutlineSlideDraft[];
}

function goalsBlock(label: string, items: string[]): string {
  const lines = items.filter((s) => s.trim()).map((s, i) => `${i + 1}. ${s.trim()}`);
  return lines.length ? `${label}\n${lines.join('\n')}` : `${label}\n（未填写）`;
}

/** 步骤四工作流输入（snake_case，与 Dify 开始节点变量名一致） */
export function buildStep4WorkflowInputs(
  courseName: string,
  data: CourseAnalysisResultData | null
): Record<string, string> {
  const empty: CourseAnalysisResultData = {
    learnerPortrait: '',
    courseGoals: { knowledge: [], skill: [], attitude: [] },
    designApproach: '',
  };
  const d = data ?? empty;
  return {
    course_name: courseName.trim() || '（未命名课程）',
    learner_portrait: d.learnerPortrait.trim() || '（暂无）',
    course_goals_knowledge: goalsBlock('【知识目标】', d.courseGoals.knowledge),
    course_goals_skill: goalsBlock('【技能目标】', d.courseGoals.skill),
    course_goals_attitude: goalsBlock('【态度目标】', d.courseGoals.attitude),
    design_approach: d.designApproach.trim() || '（暂无）',
  };
}

function normalizeDraft(s: unknown): PptOutlineSlideDraft | null {
  if (!s || typeof s !== 'object') return null;
  const o = s as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  if (!title) return null;
  const contentLines = Array.isArray(o.contentLines)
    ? o.contentLines.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
  let subItems: PptOutlineSlideDraft['subItems'];
  if (Array.isArray(o.subItems)) {
    subItems = o.subItems
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const it = item as Record<string, unknown>;
        const label = typeof it.label === 'string' ? it.label.trim() : '';
        if (!label) return null;
        const lines = Array.isArray(it.lines)
          ? it.lines.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
          : undefined;
        return { label, lines };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (subItems.length === 0) subItems = undefined;
  }
  return { title, contentLines, subItems };
}

export function parseStep4PptOutlineJson(raw: string): Step4PptOutlinePayload {
  const text = stripJsonFence(raw.trim());
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error('步骤四返回不是合法 JSON');
  }
  const slidesRaw = obj.slides;
  if (!Array.isArray(slidesRaw) || slidesRaw.length === 0) {
    throw new Error('步骤四 JSON 中缺少 slides 数组');
  }
  const slides: PptOutlineSlideDraft[] = [];
  for (const s of slidesRaw) {
    const d = normalizeDraft(s);
    if (d) slides.push(d);
  }
  if (slides.length === 0) {
    throw new Error('步骤四 slides 解析后为空');
  }
  return { slides };
}

export function parseStep4Outputs(outputs: Record<string, unknown>): Step4PptOutlinePayload {
  const keys = ['step4_ppt_outline', 'result', 'text', 'output'];
  for (const k of keys) {
    const v = outputs[k];
    if (typeof v === 'string' && v.trim()) {
      return parseStep4PptOutlineJson(v);
    }
  }
  throw new Error('步骤四返回中缺少可解析的 JSON 字符串字段');
}
