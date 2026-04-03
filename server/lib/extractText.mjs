import fs from 'node:fs';

const MAX_CHARS = 120_000;

/**
 * 本地开发用：文本类直接读 UTF-8；Office/PDF/音频暂不解析，占位说明给 Dify 元数据推理。
 */
export function extractTextFromFile(filePath, originalName) {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? '';
  const textLike = ['txt', 'md', 'csv', 'json', 'html', 'htm'].includes(ext);
  if (textLike) {
    try {
      const buf = fs.readFileSync(filePath);
      const s = buf.toString('utf8');
      return s.length > MAX_CHARS ? s.slice(0, MAX_CHARS) + '\n…[已截断]' : s;
    } catch {
      return '';
    }
  }
  return `[文件已上传，本地暂未抽取正文: ${originalName}，类型 .${ext}。请结合萃取目标与文件名推理可能的知识范围。]`;
}

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
      lines.push(`- [${a.kind}] ${a.original_name} (${a.extracted_text?.length || 0} 字)`);
      if (a.extracted_text) lines.push(a.extracted_text);
    }
  } else if (session.mode === 'course' && session.course_title) {
    lines.push('--- 课程模式（无上传文件时由课程元信息占位）---');
    lines.push(`课程「${session.course_title}」中与勾选类型相关的知识，请结合目标进行锚定。`);
  }
  return lines.join('\n\n');
}
