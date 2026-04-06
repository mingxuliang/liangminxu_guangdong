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

// ── Step 2：分层筛选 ─────────────────────────────────────────────────────────

export async function runKeFilterWorkflow(inputs) {
  const apiKey = process.env.KE_FILTER_API_KEY?.trim();
  if (!apiKey) {
    return { mock: true, knowledge_items: buildMockFilterItems(inputs) };
  }

  const user = process.env.KE_ANCHOR_USER?.trim() || 'knowledge-extraction-filter';
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
      body: JSON.stringify({ inputs, response_mode: 'blocking', user }),
    });
  } finally {
    clearTimeout(tid);
  }

  const rawText = await res.text();
  if (!res.ok) throw new Error(`Dify Filter Workflow ${res.status}: ${rawText.slice(0, 800)}`);

  let json;
  try { json = JSON.parse(rawText); } catch { throw new Error('Dify 返回非 JSON'); }

  const data = json.data;
  const status = String(data?.status ?? '');
  if (status === 'failed' || status === 'error') {
    throw new Error(data?.error || json.message || '分层筛选工作流执行失败');
  }

  const rawOut = data?.outputs?.knowledge_items;
  const text = typeof rawOut === 'string' ? rawOut : JSON.stringify(rawOut ?? []);

  let knowledge_items;
  try {
    // 1. 先尝试去掉 markdown 围栏后直接解析
    const cleaned = stripJsonFence(text);
    const parsed = JSON.parse(cleaned);
    knowledge_items = Array.isArray(parsed) ? parsed : (parsed?.items ?? [parsed]);
  } catch {
    try {
      // 2. 用正则从文本中提取第一个 JSON 数组片段
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('未找到 JSON 数组');
      const parsed = JSON.parse(match[0]);
      knowledge_items = Array.isArray(parsed) ? parsed : [];
    } catch {
      // 3. 兜底：把原始文本作为提示条目返回，让用户知道出了什么问题
      knowledge_items = [{
        id: 'k_raw',
        type: 'explicit',
        category: '解析提示',
        title: 'AI返回内容解析失败，请查看原始内容',
        content: text.slice(0, 800),
        source: 'Dify原始输出',
        priority: 'low',
        reusable: false,
        selected: false,
      }];
    }
  }

  // 确保每个条目都有必要字段
  knowledge_items = knowledge_items.map((item, i) => ({
    id: item.id ?? `k${i + 1}`,
    type: item.type ?? 'explicit',
    category: item.category ?? '未分类',
    title: item.title ?? `知识条目${i + 1}`,
    content: item.content ?? '',
    source: item.source ?? 'Dify',
    priority: item.priority ?? 'medium',
    reusable: item.reusable !== false,
    selected: item.selected !== false && item.priority !== 'low',
  }));

  return { mock: false, knowledge_items };
}

function buildMockFilterItems(inputs) {
  const goal = inputs.extract_goal || '（未填写）';
  return [
    {
      id: 'mock_k1', type: 'explicit', category: '方法论',
      title: `【演示】${goal.slice(0, 20)} - 核心流程`,
      content: '未配置 KE_FILTER_API_KEY，当前显示演示数据。导入 ke-02 工作流并配置 Key 后可获取真实知识条目。',
      source: '演示数据', priority: 'high', reusable: true, selected: true,
    },
    {
      id: 'mock_k2', type: 'tacit', category: '经验技巧',
      title: '【演示】关键经验汇总',
      content: '请在 .env.local 中配置 KE_FILTER_API_KEY，并在 Dify 中导入 dify/ke-02-layered-filter.dsl.yml。',
      source: '演示数据', priority: 'medium', reusable: true, selected: false,
    },
  ];
}

// ── Step 3：结构化提炼 ───────────────────────────────────────────────────────

export async function runKeRefineWorkflow(inputs) {
  const apiKey = process.env.KE_REFINE_API_KEY?.trim();
  if (!apiKey) {
    return { mock: true, structured_result: buildMockRefinementResult(inputs) };
  }

  const user = process.env.KE_ANCHOR_USER?.trim() || 'knowledge-extraction-refine';
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
      body: JSON.stringify({ inputs, response_mode: 'blocking', user }),
    });
  } finally {
    clearTimeout(tid);
  }

  const rawText = await res.text();
  if (!res.ok) throw new Error(`Dify Refine Workflow ${res.status}: ${rawText.slice(0, 800)}`);

  let json;
  try { json = JSON.parse(rawText); } catch { throw new Error('Dify 返回非 JSON'); }

  const data = json.data;
  const status = String(data?.status ?? '');
  if (status === 'failed' || status === 'error') {
    throw new Error(data?.error || json.message || '结构化提炼工作流执行失败');
  }

  const rawOut = data?.outputs?.structured_result;
  const text = typeof rawOut === 'string' ? rawOut : JSON.stringify(rawOut ?? {});

  let structured_result;
  try {
    const cleaned = stripJsonFence(text);
    structured_result = JSON.parse(cleaned);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('未找到 JSON 对象');
      structured_result = JSON.parse(match[0]);
    } catch {
      structured_result = buildMockRefinementResult(inputs);
      structured_result._raw = text.slice(0, 800);
    }
  }

  return { mock: false, structured_result };
}

function buildMockRefinementResult(inputs) {
  const goal = inputs.extract_goal || '（未填写）';
  return {
    core_knowledge: [
      {
        id: 'ck1', title: `【演示】${goal.slice(0, 18)} - 核心方法`,
        type: '方法论',
        content: '未配置 KE_REFINE_API_KEY，当前显示演示数据。导入 ke-03 工作流并配置 Key 后可获取真实提炼成果。',
        tags: ['演示', '待配置'],
      },
    ],
    case_materials: [
      {
        id: 'cm1', title: '【演示】案例素材示例',
        source: '演示数据',
        content: '请在 .env.local 配置 KE_REFINE_API_KEY 后重试。',
        highlight: '配置Key后显示真实案例',
      },
    ],
    practical_tools: [
      {
        id: 'pt1', title: '【演示】工具模板示例',
        format: '模板',
        desc: '配置 KE_REFINE_API_KEY 并导入 dify/ke-03-structured-refinement.dsl.yml 后可获取真实工具建议。',
      },
    ],
    optimization_suggestions: [
      {
        id: 'os1',
        content: '配置 KE_REFINE_API_KEY 后，AI 将基于四大萃取目标给出具体优化建议。',
        priority: 'high',
      },
    ],
  };
}

// ── Step 4：重新提取单条 ─────────────────────────────────────────────────────

export async function runKeReextractWorkflow(inputs) {
  const apiKey = process.env.KE_REEXTRACT_API_KEY?.trim();
  if (!apiKey) {
    return { mock: true, optimized_content: buildMockOptimizedContent(inputs) };
  }

  const user = process.env.KE_ANCHOR_USER?.trim() || 'knowledge-extraction-reextract';
  const url = `${getV1Root()}/workflows/run`;
  const timeoutMs = Number(process.env.KE_ANCHOR_TIMEOUT_MS || 120000);

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
      body: JSON.stringify({ inputs, response_mode: 'blocking', user }),
    });
  } finally {
    clearTimeout(tid);
  }

  const rawText = await res.text();
  if (!res.ok) throw new Error(`Dify Reextract Workflow ${res.status}: ${rawText.slice(0, 800)}`);

  let json;
  try { json = JSON.parse(rawText); } catch { throw new Error('Dify 返回非 JSON'); }

  const data = json.data;
  const status = String(data?.status ?? '');
  if (status === 'failed' || status === 'error') {
    throw new Error(data?.error || json.message || '重新提取工作流执行失败');
  }

  const rawOut = data?.outputs?.optimized_content;
  const optimized_content = typeof rawOut === 'string' ? rawOut.trim() : buildMockOptimizedContent(inputs);

  return { mock: false, optimized_content };
}

function buildMockOptimizedContent(inputs) {
  const base = inputs.item_content || '';
  return `${base}\n\n【AI二次优化】经深度分析，该知识点在实际应用中需结合具体业务场景灵活调整，建议配合案例库使用，可提升学员理解效率。（请配置 KE_REEXTRACT_API_KEY 并导入 ke-04 工作流以获取真实 AI 优化内容）`;
}

// ── Step 1：源头锚定（保持在下方）──────────────────────────────────────────

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
