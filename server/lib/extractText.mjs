import fs from 'node:fs';

const MAX_CHARS = 120_000;

function truncate(text) {
  const t = (text || '').trim();
  return t.length > MAX_CHARS ? t.slice(0, MAX_CHARS) + '\n…[内容已截断，超出 12 万字上限]' : t;
}

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
async function extractOffice(filePath, originalName) {
  try {
    const officeParser = await import('officeparser');
    const parse = officeParser.default?.parseOfficeAsync ?? officeParser.parseOfficeAsync;
    const text = await parse(filePath, { outputErrorToConsole: false });
    const result = truncate(text);
    if (!result) return `[Office 文档内容为空: ${originalName}]`;
    return result;
  } catch (e) {
    return `[Office 文档解析失败（${originalName}）: ${e.message}]`;
  }
}

// ── PDF ─────────────────────────────────────────────────────────────────────
async function extractPdf(filePath, originalName) {
  try {
    // 使用 lib 内部路径避免 pdf-parse 在 ESM 下触发测试文件读取的已知问题
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    const text = truncate(data.text);
    if (!text) return `[PDF 内容为空或为扫描版图片 PDF: ${originalName}]`;
    return text;
  } catch (e) {
    return `[PDF 解析失败（${originalName}）: ${e.message}]`;
  }
}

// ── 音频：调用 Dify audio-to-text 或 OpenAI Whisper ────────────────────────
async function transcribeAudio(filePath, originalName) {
  // 优先使用专用音频转写 key，回退使用 KE_ANCHOR_API_KEY
  const apiKey = (
    process.env.KE_AUDIO_TO_TEXT_API_KEY ||
    process.env.KE_ANCHOR_API_KEY ||
    ''
  ).trim();

  if (!apiKey) {
    return [
      `[音频文件已上传: ${originalName}]`,
      `提示：配置 KE_AUDIO_TO_TEXT_API_KEY（Dify 应用 API Key，需开启语音转文字）后可自动转写。`,
      `当前为占位描述，请在萃取目标中手动补充该音频的核心内容摘要。`,
    ].join('\n');
  }

  const raw = (process.env.DIFY_BASE_URL || '').trim() || 'http://127.0.0.1:8088/v1';
  const base = raw.replace(/\/$/, '');
  const v1Root = /\/v1$/i.test(base) ? base : `${base}/v1`;

  try {
    const buf = fs.readFileSync(filePath);
    // Node 18+ 全局 FormData / Blob / fetch
    const blob = new Blob([buf]);
    const form = new FormData();
    form.append('file', blob, originalName);
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
    const transcript = (json.text || '').trim();
    if (!transcript) return `[音频转写结果为空: ${originalName}]`;
    return `[音频转写 · ${originalName}]\n${truncate(transcript)}`;
  } catch (e) {
    return [
      `[音频转写失败（${originalName}）: ${e.message}]`,
      `请确认 Dify 实例已配置语音转文字模型，或在萃取目标中手动补充音频内容摘要。`,
    ].join('\n');
  }
}

// ── 公共入口（异步）────────────────────────────────────────────────────────
export async function extractTextFromFile(filePath, originalName) {
  const ext = (originalName.split('.').pop() || '').toLowerCase();

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

  // 音频
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'mp4', 'webm'].includes(ext)) {
    return transcribeAudio(filePath, originalName);
  }

  return `[文件已上传，暂不支持解析该格式: ${originalName} (.${ext})]`;
}

// ── 合并素材行（传给 Dify 的 material_bundle_text）─────────────────────────
export function mergeMaterialLines(session) {
  const lines = [];
  lines.push(`模式: ${session.mode}`);
  if (session.course_title) lines.push(`关联课程: ${session.course_title}`);
  lines.push(`萃取目标: ${session.extract_goal || '（空）'}`);
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
      lines.push(`- [${a.kind}] ${a.original_name}（解析字数: ${charCount}）`);
      if (a.extracted_text) lines.push(a.extracted_text);
    }
  } else if (session.mode === 'course' && session.course_title) {
    lines.push('--- 课程模式（无上传文件时由课程元信息占位）---');
    lines.push(
      `课程「${session.course_title}」中与勾选类型相关的知识，请结合目标进行锚定。`
    );
  }

  return lines.join('\n\n');
}
