import type { CourseAnalysisResultData } from './step2-parse';

import { stripJsonFence } from './step1-parse';

function goalsBlock(label: string, items: string[]): string {
  const lines = items.filter((s) => s.trim()).map((s, i) => `${i + 1}. ${s.trim()}`);
  return lines.length ? `${label}\n${lines.join('\n')}` : `${label}\n（未填写）`;
}

/** 步骤三工作流输入（与 Dify 开始节点一致） */
export function buildStep3WorkflowInputs(
  courseName: string,
  courseDuration: string,
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
    course_duration: courseDuration.trim() || '6课时',
    learner_portrait: d.learnerPortrait.trim() || '（暂无）',
    course_goals_knowledge: goalsBlock('【知识目标】', d.courseGoals.knowledge),
    course_goals_skill: goalsBlock('【技能目标】', d.courseGoals.skill),
    course_goals_attitude: goalsBlock('【态度目标】', d.courseGoals.attitude),
    design_approach: d.designApproach.trim() || '（暂无）',
  };
}

/** 与 CourseOutlineEditor 中「六、【课程大纲】」层级一致：模块 → 节 → 知识点 → 要点行 */
export interface Step3OutlineSubsection {
  subsectionTitle: string;
  detailLines: string[];
}

export interface Step3OutlineSection {
  sectionTitle: string;
  subsections: Step3OutlineSubsection[];
}

export interface Step3OutlineModule {
  moduleTitle: string;
  sections: Step3OutlineSection[];
}

/** LLM 输出的完整文档结构（前端再渲染为与 INITIAL_HTML 一致的 p+style） */
export interface Step3OutlineDoc {
  courseTitle: string;
  /** 一、【课程背景】正文一段 */
  background: string;
  /** 二、【课程收益】多条 */
  benefits: string[];
  /** 三、【教学形式】 */
  teachingForm: string;
  /** 四、【业务目标】多条 */
  businessGoals: string[];
  /** 五、【课程时长】展示文案，可与 course_duration 输入一致 */
  durationText: string;
  /** 课程大纲前「导论」标题行，如「导论」 */
  introOutline: string;
  /** 导论下案例导入等说明行（对应 4em 缩进的一条） */
  introDetailLine?: string;
  modules: Step3OutlineModule[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 渲染为 CourseOutlineEditor 使用的片段 HTML（与内置 INITIAL_HTML 样式对齐）
 */
export function renderStep3OutlineDocumentHtml(doc: Step3OutlineDoc): string {
  const title = escapeHtml(doc.courseTitle || '课程');
  const parts: string[] = [];

  parts.push(
    `<p style="text-align:center;font-size:16px;font-weight:bold;margin:0 0 16px;">${title}</p>`
  );

  parts.push(`<p style="font-weight:bold;color:#111827;margin:14px 0 4px;">一、【课程背景】</p>`);
  parts.push(
    `<p style="text-indent:2em;line-height:1.9;margin:0 0 8px;">${escapeHtml(doc.background || '')}</p>`
  );

  parts.push(`<p style="font-weight:bold;color:#111827;margin:14px 0 4px;">二、【课程收益】</p>`);
  const benefits = doc.benefits?.length ? doc.benefits : ['（待补充）'];
  for (const b of benefits) {
    parts.push(`<p style="margin:2px 0 2px 2em;">${escapeHtml(b)}</p>`);
  }

  parts.push(`<p style="font-weight:bold;color:#111827;margin:14px 0 4px;">三、【教学形式】</p>`);
  parts.push(`<p style="margin:2px 0 2px 2em;">${escapeHtml(doc.teachingForm || '面授课程')}</p>`);

  parts.push(`<p style="font-weight:bold;color:#111827;margin:14px 0 4px;">四、【业务目标】</p>`);
  const goals = doc.businessGoals?.length ? doc.businessGoals : ['（待补充）'];
  for (const g of goals) {
    parts.push(`<p style="margin:2px 0 2px 2em;">${escapeHtml(g)}</p>`);
  }

  parts.push(`<p style="font-weight:bold;color:#111827;margin:14px 0 4px;">五、【课程时长】</p>`);
  parts.push(`<p style="margin:2px 0 2px 2em;">${escapeHtml(doc.durationText || '')}</p>`);

  parts.push(`<p style="font-weight:bold;color:#111827;margin:14px 0 8px;">六、【课程大纲】</p>`);

  const intro = (doc.introOutline || '导论').trim();
  parts.push(
    `<p style="font-style:italic;font-weight:bold;margin:6px 0 4px 2em;">${escapeHtml(intro)}</p>`
  );
  if (doc.introDetailLine?.trim()) {
    parts.push(
      `<p style="margin:2px 0 4px 4em;">${escapeHtml(doc.introDetailLine.trim())}</p>`
    );
  }

  for (const mod of doc.modules || []) {
    parts.push(
      `<p style="font-weight:bold;margin:10px 0 6px 2em;">${escapeHtml(mod.moduleTitle)}</p>`
    );
    for (const sec of mod.sections || []) {
      parts.push(
        `<p style="font-weight:bold;margin:6px 0 4px 3em;">${escapeHtml(sec.sectionTitle)}</p>`
      );
      for (const sub of sec.subsections || []) {
        parts.push(
          `<p style="font-weight:bold;margin:4px 0 2px 4em;">${escapeHtml(sub.subsectionTitle)}</p>`
        );
        for (const line of sub.detailLines || []) {
          if (line.trim()) {
            parts.push(`<p style="margin:2px 0 2px 5em;">${escapeHtml(line.trim())}</p>`);
          }
        }
      }
    }
  }

  return parts.join('\n');
}

function normalizeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim());
}

function parseSubsection(o: unknown): Step3OutlineSubsection | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  const subsectionTitle = typeof r.subsectionTitle === 'string' ? r.subsectionTitle.trim() : '';
  if (!subsectionTitle) return null;
  return {
    subsectionTitle,
    detailLines: normalizeStringArray(r.detailLines),
  };
}

function parseSection(o: unknown): Step3OutlineSection | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  const sectionTitle = typeof r.sectionTitle === 'string' ? r.sectionTitle.trim() : '';
  if (!sectionTitle) return null;
  const subsections = Array.isArray(r.subsections)
    ? r.subsections.map(parseSubsection).filter((x): x is Step3OutlineSubsection => x !== null)
    : [];
  return { sectionTitle, subsections };
}

function parseModule(o: unknown): Step3OutlineModule | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  const moduleTitle = typeof r.moduleTitle === 'string' ? r.moduleTitle.trim() : '';
  if (!moduleTitle) return null;
  const sections = Array.isArray(r.sections)
    ? r.sections.map(parseSection).filter((x): x is Step3OutlineSection => x !== null)
    : [];
  return { moduleTitle, sections };
}

export function parseStep3OutlineDocJson(raw: string): Step3OutlineDoc {
  const text = stripJsonFence(raw.trim());
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error('步骤三返回不是合法 JSON');
  }

  const modules = Array.isArray(obj.modules)
    ? obj.modules.map(parseModule).filter((x): x is Step3OutlineModule => x !== null)
    : [];

  if (modules.length === 0) {
    throw new Error('步骤三 JSON 中 modules 为空或无效');
  }

  return {
    courseTitle: typeof obj.courseTitle === 'string' ? obj.courseTitle : '',
    background: typeof obj.background === 'string' ? obj.background : '',
    benefits: normalizeStringArray(obj.benefits),
    teachingForm: typeof obj.teachingForm === 'string' ? obj.teachingForm : '面授课程',
    businessGoals: normalizeStringArray(obj.businessGoals),
    durationText: typeof obj.durationText === 'string' ? obj.durationText : '',
    introOutline: typeof obj.introOutline === 'string' ? obj.introOutline : '导论',
    introDetailLine:
      typeof obj.introDetailLine === 'string' && obj.introDetailLine.trim()
        ? obj.introDetailLine
        : undefined,
    modules,
  };
}

export function parseStep3Outputs(outputs: Record<string, unknown>): Step3OutlineDoc {
  const keys = ['step3_outline_json', 'result', 'text', 'output'];
  for (const k of keys) {
    const v = outputs[k];
    if (typeof v === 'string' && v.trim()) {
      return parseStep3OutlineDocJson(v);
    }
  }
  throw new Error('步骤三返回中缺少可解析的 JSON 字符串字段');
}
