import fs from 'node:fs';
import path from 'node:path';

const MAX_CHARS = 120_000;

function truncate(text) {
  const t = (text || '').trim();
  return t.length > MAX_CHARS ? t.slice(0, MAX_CHARS) + '\n…[内容已截断，超出 12 万字上限]' : t;
}

// ── 音频文件扩展名判断 ────────────────────────────────────────────────────────
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'mp4', 'webm'];

export function isAudioExt(ext) {
  return AUDIO_EXTENSIONS.includes((ext || '').toLowerCase());
}

/** 上传时写入资产的占位文本，anchor/run 时会替换为真实转写内容 */
export const AUDIO_PENDING = '[AUDIO_PENDING]';

// ── Word .docx ──────────────────────────────────────────────────────────────
async function extractDocx(filePath, originalName) {
  try {
    const { default: mammoth } = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    const text = truncate(result.value);
    if (!text) return `[Word 文档内容为空: ${originalName}]`;
    return text;
  } catch (e) {
    return `[Word 文档解析失败（${originalName}）: ${e.message}]`;
  }
}

// ── PPT .pptx / .ppt / 旧版 .doc ──────────────────────────────────────────
// officeparser v6+：已移除 parseOfficeAsync，统一使用 parseOffice()，返回 AST，需 .toText() 取纯文本
async function extractOffice(filePath, originalName) {
  try {
    const mod = await import('officeparser');
    const parseOffice =
      mod.parseOffice ??
      mod.default?.parseOffice;
    if (typeof parseOffice !== 'function') {
      throw new Error('officeparser 未导出 parseOffice，请检查依赖版本');
    }
    const ast = await parseOffice(filePath, { outputErrorToConsole: false });
    let raw = '';
    if (ast && typeof ast.toText === 'function') {
      raw = ast.toText();
    } else if (typeof ast === 'string') {
      raw = ast;
    }
    const result = truncate(raw);
    if (!result) return `[Office 文档内容为空: ${originalName}]`;
    return result;
  } catch (e) {
    return `[Office 文档解析失败（${originalName}）: ${e.message}]`;
  }
}

// ── PDF ─────────────────────────────────────────────────────────────────────
// pdf-parse@2+ 使用 package.json exports，禁止 deep import（如 lib/pdf-parse.js）。
// 使用官方导出的 PDFParse + getText()，与 v1 的 (buffer)=>{ text } 不同。
async function extractPdf(filePath, originalName) {
  try {
    const buf = fs.readFileSync(filePath);
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buf });
    try {
      const result = await parser.getText();
      const raw = typeof result?.text === 'string' ? result.text : '';
      const text = truncate(raw.trim());
      if (!text) return `[PDF 内容为空或为扫描版图片 PDF: ${originalName}]`;
      return text;
    } finally {
      try {
        await parser.destroy();
      } catch {
        /* ignore */
      }
    }
  } catch (e) {
    return `[PDF 解析失败（${originalName}）: ${e.message}]`;
  }
}

// ── Dify audio-to-text 按 MIME 校验类型；无 type 的 Blob 易导致 415 unsupported_audio_type ──
function mimeFromExt(ext) {
  const e = (ext || '').toLowerCase();
  const map = {
    mp3: 'audio/mpeg',
    mpga: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    wma: 'audio/x-ms-wma',
    mp4: 'audio/mp4',
    webm: 'audio/webm',
  };
  return map[e] || 'audio/mpeg';
}

/** 优先用磁盘路径扩展名；乱码 originalName 时仍能对上 MIME 与 multipart 文件名。 */
function resolveAudioExt(filePath, originalName) {
  let ext = path.extname(filePath).replace(/^\./, '').toLowerCase();
  if (!ext || !isAudioExt(ext)) {
    ext = (originalName.split('.').pop() || 'mp3').toLowerCase();
  }
  if (!isAudioExt(ext)) ext = 'mp3';
  return ext;
}

/** Dify 可能根据 multipart 文件名推断类型；中文乱码名会导致扩展名异常 → 415。改用磁盘扩展名 + ASCII 文件名。 */
function safeAudioUploadFilename(ext) {
  return `ke-audio-${Date.now()}.${ext}`;
}

/** 硅基流动 OpenAPI：POST /v1/audio/transcriptions，multipart：file + model，响应 { text } */
function siliconflowAsrUrl() {
  const raw = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').trim().replace(/\/$/, '');
  return `${raw}/audio/transcriptions`;
}

function siliconflowAsrModel() {
  return (process.env.SILICONFLOW_ASR_MODEL || 'FunAudioLLM/SenseVoiceSmall').trim();
}

function siliconflowApiKey() {
  return (process.env.SILICONFLOW_API_KEY || process.env.KE_SILICONFLOW_ASR_API_KEY || '').trim();
}

/** @returns {Promise<string>} 原始转写文本 */
async function transcribeWithSiliconFlow(filePath, originalName) {
  const apiKey = siliconflowApiKey();
  if (!apiKey) throw new Error('SILICONFLOW_API_KEY 未配置');

  const buf = fs.readFileSync(filePath);
  const ext = resolveAudioExt(filePath, originalName);
  const mime = mimeFromExt(ext);
  const uploadName = safeAudioUploadFilename(ext);
  const form = new FormData();
  const FileCtor = globalThis.File;
  if (typeof FileCtor === 'function') {
    form.append('file', new FileCtor([buf], uploadName, { type: mime }));
  } else {
    form.append('file', new Blob([buf], { type: mime }), uploadName);
  }
  form.append('model', siliconflowAsrModel());

  const res = await fetch(siliconflowAsrUrl(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = (json.text || '').trim();
  if (!text) throw new Error('转写结果为空');
  return text;
}

/** @returns {Promise<string>} 原始转写文本 */
async function transcribeWithDifyAudioToText(filePath, originalName, apiKey) {
  const raw = (process.env.DIFY_BASE_URL || '').trim() || 'http://127.0.0.1:8088/v1';
  const base = raw.replace(/\/$/, '');
  const v1Root = /\/v1$/i.test(base) ? base : `${base}/v1`;

  const buf = fs.readFileSync(filePath);
  const ext = resolveAudioExt(filePath, originalName);
  const mime = mimeFromExt(ext);
  const uploadName = safeAudioUploadFilename(ext);
  const form = new FormData();
  const FileCtor = globalThis.File;
  if (typeof FileCtor === 'function') {
    form.append('file', new FileCtor([buf], uploadName, { type: mime }));
  } else {
    form.append('file', new Blob([buf], { type: mime }), uploadName);
  }
  form.append('user', 'knowledge-extraction');

  const res = await fetch(`${v1Root}/audio-to-text`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = (json.text || '').trim();
  if (!text) throw new Error('转写结果为空');
  return text;
}

// ── 音频：硅基流动 ASR 优先 → 否则 Dify audio-to-text → 可选精炼工作流 ───
export async function transcribeAudio(filePath, originalName, sessionContext = {}) {
  // sessionContext 可传入 { extract_goal, course_title, target_audience }，用于精炼工作流
  const sfKey = siliconflowApiKey();
  const difyKey = (
    process.env.KE_AUDIO_TO_TEXT_API_KEY ||
    process.env.KE_ANCHOR_API_KEY ||
    ''
  ).trim();

  if (!sfKey && !difyKey) {
    return [
      `[音频文件已上传: ${originalName}]`,
      `提示：配置 SILICONFLOW_API_KEY（硅基流动 ASR）或 KE_AUDIO_TO_TEXT_API_KEY（Dify）后可自动转写。当前为占位描述，请在萃取目标中手动补充该音频的核心内容摘要。`,
    ].join('\n');
  }

  // ── 第一步：音频 → 原始文字（优先硅基流动，失败且存在 Dify Key 时回退 Dify）──
  let rawTranscript = '';
  try {
    if (sfKey) {
      try {
        rawTranscript = await transcribeWithSiliconFlow(filePath, originalName);
      } catch (sfErr) {
        if (difyKey) {
          console.warn(`[asr] 硅基流动转写失败，回退 Dify: ${sfErr.message}`);
          rawTranscript = await transcribeWithDifyAudioToText(filePath, originalName, difyKey);
        } else {
          throw sfErr;
        }
      }
    } else {
      rawTranscript = await transcribeWithDifyAudioToText(filePath, originalName, difyKey);
    }
  } catch (e) {
    const hint = sfKey
      ? '请检查 SILICONFLOW_API_KEY、额度与 SILICONFLOW_ASR_MODEL；若仅配置硅基流动，也可改配 Dify 语音转文字作为备用。'
      : '请确认 Dify 实例已配置语音转文字模型，或改配 SILICONFLOW_API_KEY 使用硅基流动 ASR。';
    return [`[音频转写失败（${originalName}）: ${e.message}]`, hint].join('\n');
  }

  // ── 第二步：原始文字 → 精炼整理（ke-audio-transcript-refine 工作流，可选）──
  const refineApiKey = process.env.KE_AUDIO_REFINE_API_KEY?.trim();
  if (refineApiKey) {
    try {
      // 动态导入避免循环依赖
      const { runKeAudioRefineWorkflow } = await import('./difyClient.mjs');
      const result = await runKeAudioRefineWorkflow({
        raw_transcript: truncate(rawTranscript),
        course_title: sessionContext.course_title || '',
        extract_goal: sessionContext.extract_goal || '',
        target_audience: sessionContext.target_audience || '',
      });
      const refined = (result.refined_transcript || '').trim();
      if (refined && refined !== rawTranscript) {
        return `[音频精炼内容 · ${originalName}]\n${truncate(refined)}`;
      }
    } catch (e) {
      // 精炼失败时降级返回原始转写，不影响整体流程
      console.warn(`[audio-refine] 精炼工作流调用失败，降级使用原始转写: ${e.message}`);
    }
  }

  // 未配置精炼工作流或精炼失败：返回原始转写
  return `[音频转写 · ${originalName}]\n${truncate(rawTranscript)}`;
}

// ── 公共入口（对外导出，音频文件直接返回 AUDIO_PENDING 占位）────────────────
export async function extractTextFromFile(filePath, originalName) {
  const hasDot = originalName.includes('.');
  const ext = hasDot ? (originalName.split('.').pop() || '').toLowerCase() : '';

  // 音频文件：上传时不做耗时转写，返回占位标记，由 anchor/run 统一批量处理
  if (isAudioExt(ext)) return AUDIO_PENDING;

  // 无扩展名：按 UTF-8 文本读取（如 README、noext）
  if (!ext) {
    try {
      const s = fs.readFileSync(filePath, 'utf8');
      return truncate(s);
    } catch {
      return '';
    }
  }

  // 纯文本类：直接读 UTF-8
  if (['txt', 'md', 'csv', 'json', 'html', 'htm', 'xml'].includes(ext)) {
    try {
      const s = fs.readFileSync(filePath, 'utf8');
      return truncate(s);
    } catch {
      return '';
    }
  }

  // Word
  if (ext === 'docx') return extractDocx(filePath, originalName);
  if (ext === 'doc') return extractOffice(filePath, originalName);

  // PPT / PowerPoint
  if (['ppt', 'pptx'].includes(ext)) return extractOffice(filePath, originalName);

  // PDF
  if (ext === 'pdf') return extractPdf(filePath, originalName);

  return `[文件已上传，暂不支持解析该格式: ${originalName} (.${ext})]`;
}

// ── 合并素材行（传给 Dify 的 material_bundle_text）─────────────────────────
export function mergeMaterialLines(session) {
  const lines = [];
  lines.push(`模式: ${session.mode}`);
  if (session.course_title) lines.push(`关联课程: ${session.course_title}`);
  lines.push(`萃取目标: ${String(session.extract_goal ?? '').trim() || '（空）'}`);
  lines.push(`目标受众: ${session.target_audience || '（未填）'}`);
  lines.push(`应用场景: ${(session.use_scenes || []).join(', ')}`);

  if (session.mode === 'course') {
    const m = session.material_selection || {};
    lines.push(
      `勾选资料: 大纲=${m.outline ? '是' : '否'}, PPT=${m.ppt ? '是' : '否'}, 讲稿=${m.script ? '是' : '否'}`
    );
  }

  if (session.assets?.length) {
    lines.push('--- 已上传素材 ---');
    for (const a of session.assets) {
      const charCount = a.extracted_text?.length || 0;
      const isPending = a.extracted_text === AUDIO_PENDING;
      lines.push(
        `- [${a.kind}] ${a.original_name}（${isPending ? '音频占位，转写未完成' : `解析字数: ${charCount}`}）`
      );
      if (a.extracted_text && !isPending) lines.push(a.extracted_text);
    }
  } else if (session.mode === 'course' && session.course_title) {
    lines.push('--- 课程模式（无上传文件时由课程元信息占位）---');
    lines.push(
      `课程「${session.course_title}」中与勾选类型相关的知识，请结合目标进行锚定。`
    );
  }

  return lines.join('\n\n');
}
