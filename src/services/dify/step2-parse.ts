import type { AnalysisFormData } from '@/pages/course-create/components/CourseAnalysisInputPanel';

import { stripJsonFence } from './step1-parse';

/** 从任意位置提取第一个 ```json / ``` 代码块（Dify 常把 JSON 包在 Markdown 字符串里） */
function extractFirstMarkdownFence(raw: string): string | null {
  const m = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw.trim());
  return m ? m[1].trim() : null;
}

/** 若整段是 JSON 字符串（外层带引号），解一层后再解析 */
function unwrapJsonStringIfNeeded(text: string): string {
  let t = text.trim();
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1).trim();
  if (t.startsWith('"') && t.endsWith('"')) {
    try {
      const inner = JSON.parse(t) as unknown;
      if (typeof inner === 'string') return inner.trim();
    } catch {
      /* keep */
    }
  }
  return t;
}

/** 与 CourseAnalysisResultEditor / Dify step2-02 输出一致 */
export interface CourseAnalysisResultData {
  learnerPortrait: string;
  courseGoals: {
    knowledge: string[];
    skill: string[];
    attitude: string[];
  };
  designApproach: string;
}

const EMPTY_GOALS = { knowledge: [] as string[], skill: [] as string[], attitude: [] as string[] };

export function buildStep2AWorkflowInputs(form: AnalysisFormData): Record<string, string> {
  return {
    topic_name: form.topicName,
    need_background: form.needBackground,
    business_analysis: form.businessAnalysis,
    task_analysis: form.taskAnalysis,
    required_ability: form.requiredAbility,
    ability_gap: form.abilityGap,
    current_ability: form.currentAbility,
    learning_motivation: form.learningMotivation,
    learning_style: form.learningStyle,
    past_learning_effect: form.pastLearningEffect,
  };
}

export function buildStep2BWorkflowInputs(
  form: AnalysisFormData,
  evaluationReport: string
): Record<string, string> {
  return {
    ...buildStep2AWorkflowInputs(form),
    evaluation_report: evaluationReport,
  };
}

/** 解析步骤二-A 工作流 outputs → 报告正文 */
export function parseStep2AEvaluationReport(outputs: Record<string, unknown>): string {
  const keys = ['step2_evaluation_report', 'evaluation_report', 'text', 'result', 'output'];
  for (const k of keys) {
    const v = outputs[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return JSON.stringify(outputs);
}

function normalizeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

function coerceRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

/** 将 Dify 可能返回的对象（含 snake_case）规范为 CourseAnalysisResultData */
export function normalizeStep2BObject(obj: Record<string, unknown>): CourseAnalysisResultData {
  const portrait =
    (typeof obj.learnerPortrait === 'string' && obj.learnerPortrait) ||
    (typeof obj.learner_portrait === 'string' && obj.learner_portrait) ||
    '';
  const rawGoals = (obj.courseGoals ?? obj.course_goals) as Record<string, unknown> | undefined;
  const goals = rawGoals || {};
  return {
    learnerPortrait: portrait,
    courseGoals: {
      knowledge: normalizeStringArray(goals.knowledge ?? goals.knowledge_goals),
      skill: normalizeStringArray(goals.skill ?? goals.skill_goals),
      attitude: normalizeStringArray(goals.attitude ?? goals.attitude_goals),
    },
    designApproach:
      (typeof obj.designApproach === 'string' && obj.designApproach) ||
      (typeof obj.design_approach === 'string' && obj.design_approach) ||
      '',
  };
}

/** 解析步骤二-B JSON 输出 */
export function parseStep2BStructuredResult(raw: string): CourseAnalysisResultData {
  let t = unwrapJsonStringIfNeeded(raw);
  const fenced = extractFirstMarkdownFence(t);
  if (fenced) t = fenced;
  t = stripJsonFence(t);

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(t) as Record<string, unknown>;
  } catch {
    throw new Error('步骤二-B 返回不是合法 JSON（请检查工作流输出是否为纯 JSON 或 ```json 代码块）');
  }

  return normalizeStep2BObject(obj);
}

export function parseStep2BOutputs(outputs: Record<string, unknown>): CourseAnalysisResultData {
  const priorityKeys = [
    'step2_structured_result',
    'step2StructuredResult',
    'structured_result',
    'result',
    'text',
    'output',
  ];

  for (const k of priorityKeys) {
    const v = outputs[k];
    if (typeof v === 'string' && v.trim()) {
      try {
        return parseStep2BStructuredResult(v);
      } catch {
        /* try next key */
      }
    }
    const rec = coerceRecord(v);
    if (rec && ('learnerPortrait' in rec || 'learner_portrait' in rec || 'courseGoals' in rec || 'course_goals' in rec)) {
      return normalizeStep2BObject(rec);
    }
  }

  for (const v of Object.values(outputs)) {
    if (typeof v === 'string' && v.trim()) {
      const s = v.trim();
      if (s.includes('{') && (s.includes('learnerPortrait') || s.includes('learner_portrait') || s.includes('```'))) {
        try {
          return parseStep2BStructuredResult(s);
        } catch {
          /* continue */
        }
      }
    }
    const rec = coerceRecord(v);
    if (rec && ('learnerPortrait' in rec || 'learner_portrait' in rec || 'courseGoals' in rec || 'course_goals' in rec)) {
      return normalizeStep2BObject(rec);
    }
  }

  throw new Error(
    '步骤二-B 返回中缺少可解析的学员画像 JSON（请确认结束节点输出变量名为 step2_structured_result，且为 JSON 或 Markdown 包裹的 JSON）'
  );
}

/** 每组至少 3 行占位，与「知识/技能/态度各三条」编辑体验一致 */
export function ensureCourseGoalsShape(data: CourseAnalysisResultData): CourseAnalysisResultData {
  const pad = (arr: string[]) => {
    const out = [...arr];
    while (out.length < 3) out.push('');
    return out;
  };
  return {
    ...data,
    courseGoals: {
      knowledge: pad(data.courseGoals.knowledge),
      skill: pad(data.courseGoals.skill),
      attitude: pad(data.courseGoals.attitude),
    },
  };
}
