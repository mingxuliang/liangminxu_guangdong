/**
 * 服务端调用 Dify Workflow（blocking），与前端 agent-dify 行为对齐。
 */
function getV1Root() {
  const raw = (process.env.DIFY_BASE_URL || '').trim() || 'http://127.0.0.1:8088/v1';
  const base = raw.replace(/\/$/, '');
  if (/\/v1$/i.test(base)) return base;
  return `${base}/v1`;
}

function stripJsonFence(s) {
  const t = s.trim();
  if (t.startsWith('```')) {
    return t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return t;
}

export async function runKeAnchorWorkflow(inputs) {
  const apiKey = process.env.KE_ANCHOR_API_KEY?.trim();
  if (!apiKey) {
    return { mock: true, anchor_package: buildMockAnchorPackage(inputs) };
  }

  const user = process.env.KE_ANCHOR_USER?.trim() || 'knowledge-extraction-anchor';
  const url = `${getV1Root()}/workflows/run`;
  const timeoutMs = Number(process.env.KE_ANCHOR_TIMEOUT_MS || 180000);

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  let res;
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
        user,
      }),
    });
  } finally {
    clearTimeout(tid);
  }

  const rawText = await res.text();
  if (!res.ok) {
    throw new Error(`Dify Workflow ${res.status}: ${rawText.slice(0, 800)}`);
  }

  let json;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error('Dify 返回非 JSON');
  }

  const data = json.data;
  const status = String(data?.status ?? '');
  if (status === 'failed' || status === 'error') {
    throw new Error(data?.error || json.message || '工作流执行失败');
  }

  const outputs = data?.outputs;
  if (!outputs || typeof outputs !== 'object') {
    throw new Error('缺少 data.outputs');
  }

  const rawOut = outputs.anchor_package;
  const text = typeof rawOut === 'string' ? rawOut : JSON.stringify(rawOut ?? {});

  let anchor_package;
  try {
    anchor_package = JSON.parse(stripJsonFence(text));
  } catch {
    anchor_package = {
      anchor_summary: text.slice(0, 2000),
      scope_in: [],
      scope_out: [],
      material_inventory: [],
      gaps: ['解析 anchor_package JSON 失败，已保存原始文本片段'],
      downstream_hints: '',
      _raw: text,
    };
  }

  return { mock: false, anchor_package };
}

function buildMockAnchorPackage(inputs) {
  const goal = inputs.extract_goal || '（未填写）';
  return {
    anchor_summary: `【离线演示】已根据萃取目标生成占位锚定说明：${goal.slice(0, 200)}`,
    scope_in: ['与目标直接相关的课程知识点', '可复用的流程与工具'],
    scope_out: ['与目标无关的扩展阅读'],
    material_inventory: [
      { kind: 'bundle', status: 'ok', note: '未配置 KE_ANCHOR_API_KEY 时返回模拟数据' },
    ],
    gaps: ['配置 KE_ANCHOR_API_KEY 并导入 dify/ke-01-source-anchor.dsl.yml 工作流后可调用真实 Dify'],
    downstream_hints: '进入第二步时可按「显性/隐性」维度筛选',
  };
}
