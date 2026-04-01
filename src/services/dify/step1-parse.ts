import type { CourseFormData } from '@/pages/course-create/components/TopicPanel';

export type Step1Dimension = {
  label: string;
  current: number;
  total: number;
  analysis: string;
};

export type Step1EvaluationResult = {
  generatedTopic: string;
  overallScore: number;
  dimensions: Step1Dimension[];
  suggestions: string[];
};

export type DifyWorkflowOutputs = Record<string, unknown>;

const EXPECTED_LABELS = ['稀缺度', '实用度', '鲜活度', '颗粒度'] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** 去除 ```json ... ``` 等包裹，便于解析 Agent 返回的正文 */
export function stripJsonFence(text: string): string {
  let t = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  if (fence) t = fence[1].trim();
  return t;
}

export function parseStep1Json(text: string): Step1EvaluationResult {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const generatedTopic =
    String(parsed.generatedTopic ?? parsed.generated_topic ?? parsed.topic ?? '').trim() || '新课程主题';

  const overallScore = clamp(
    Number(parsed.overallScore ?? parsed.overall_score ?? parsed.score ?? 75),
    0,
    100
  );

  let dimensions: Step1Dimension[] = [];
  const rawDims = parsed.dimensions ?? parsed.dimension_scores;
  if (Array.isArray(rawDims)) {
    dimensions = rawDims.map((d: Record<string, unknown>, i: number) => {
      const label =
        String(d.label ?? d.name ?? EXPECTED_LABELS[i] ?? `维度${i + 1}`).trim() ||
        EXPECTED_LABELS[i] ||
        `维度${i + 1}`;
      const total = clamp(Number(d.total ?? d.max ?? 25), 1, 100);
      const current = clamp(Number(d.current ?? d.score ?? 18), 0, total);
      const analysis = String(d.analysis ?? d.desc ?? d.description ?? '').trim() || '暂无分析。';
      return { label, current, total, analysis };
    });
  }

  while (dimensions.length < 4) {
    const i = dimensions.length;
    dimensions.push({
      label: EXPECTED_LABELS[i] || `维度${i + 1}`,
      current: 18,
      total: 25,
      analysis: '模型未返回该维度分析，请在工作流中补全或使用重新生成。',
    });
  }
  dimensions = dimensions.slice(0, 4);

  let suggestions: string[] = [];
  const rawSug = parsed.suggestions ?? parsed.topic_suggestions;
  if (Array.isArray(rawSug)) {
    suggestions = rawSug.map((x) => String(x).trim()).filter(Boolean);
  }
  if (suggestions.length === 0 && generatedTopic) {
    suggestions = [generatedTopic];
  }

  return { generatedTopic, overallScore, dimensions, suggestions };
}

export function parseStep1Outputs(outputs: DifyWorkflowOutputs): Step1EvaluationResult {
  const tryKeys = ['step1_result', 'result', 'output', 'text', 'data'];

  for (const k of tryKeys) {
    const v = outputs[k];
    if (typeof v === 'string' && v.trim().startsWith('{')) {
      try {
        return parseStep1Json(stripJsonFence(v.trim()));
      } catch {
        /* continue */
      }
    }
  }

  const topic = String(outputs.generated_topic ?? outputs.generatedTopic ?? '').trim();
  const score = Number(outputs.overall_score ?? outputs.overallScore ?? 78);
  const dimsStr = outputs.dimensions_json ?? outputs.dimensionsJson;
  const sugStr = outputs.suggestions_json ?? outputs.suggestionsJson;

  if (topic && typeof dimsStr === 'string') {
    const dims = JSON.parse(String(dimsStr)) as unknown[];
    const suggestions =
      typeof sugStr === 'string' ? (JSON.parse(sugStr) as unknown[]).map(String) : [topic];
    const fakeJson = JSON.stringify({
      generatedTopic: topic,
      overallScore: score,
      dimensions: dims,
      suggestions: suggestions.length ? suggestions : [topic],
    });
    return parseStep1Json(fakeJson);
  }

  throw new Error('Dify 输出中未找到可解析的 step1_result（JSON 字符串）或分项字段');
}

export function buildStep1WorkflowInputs(form: CourseFormData): Record<string, string> {
  return {
    train_target: form.trainTarget,
    target_job_info: form.targetJobInfo,
    target_job_duty: form.targetJobDuty,
    train_goal: form.trainGoal,
    topic_name: form.topicName,
    course_duration: form.courseDuration,
  };
}
