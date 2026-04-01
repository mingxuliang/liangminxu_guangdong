/**
 * 调用阿里云市场 iSlide「生成 PPT」接口（文档中的 POST /generate_ppt）
 * 认证：Header `Authorization: APPCODE <你的AppCode>`
 *
 * 使用：
 *   node scripts/call-aliyun-islide-ppt.mjs
 * 需在本项目根目录 .env.local 中配置 ALIYUN_ISLIDE_APPCODE（勿提交仓库）
 */
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadDotEnvLocal() {
  const p = join(root, '.env.local');
  if (!fs.existsSync(p)) return;
  const txt = fs.readFileSync(p, 'utf8');
  for (const line of txt.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnvLocal();

const APPCODE = process.env.ALIYUN_ISLIDE_APPCODE?.trim();
const URL = 'https://islide.market.alicloudapi.com/generate_ppt';

/** 与控制台文档中的 outline 结构一致（可按需扩展） */
const body = {
  outline: {
    title: '测试课程',
    subtitle: '阿里云 iSlide 接口联调',
    sections: [
      {
        title: '第一章 概述',
        subtitle: '',
        contents: [
          {
            title: '第一节 内容块',
            subtitle: '',
            items: [{ title: '要点一：联调成功即可下载 PPT' }, { title: '要点二：请查看返回 JSON 中的下载地址或文件字段' }],
          },
        ],
      },
    ],
  },
};

async function main() {
  if (!APPCODE) {
    console.error('缺少环境变量 ALIYUN_ISLIDE_APPCODE（请写入根目录 .env.local）');
    process.exit(1);
  }

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `APPCODE ${APPCODE}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log('HTTP', res.status, res.statusText);

  /** 接口返回为 SSE：多行 `data: {...}`，结束行为 `data: [DONE]` */
  let pptUrl = '';
  let pptId = '';
  let totalPage = 0;
  for (const line of text.split('\n')) {
    const s = line.trim();
    if (!s.startsWith('data:')) continue;
    const payload = s.slice(5).trim();
    if (payload === '[DONE]') break;
    try {
      const j = JSON.parse(payload);
      if (j.status === 'generate-ppt-end' && j.ppt) {
        pptUrl = j.ppt;
        pptId = j.ppt_id || '';
        totalPage = j.total_page || 0;
      }
    } catch {
      /* ignore */
    }
  }

  if (pptUrl) {
    console.log('\n[成功] 生成完成');
    console.log('  ppt_id:', pptId || '(无)');
    console.log('  页数:', totalPage || '(未知)');
    console.log('  下载:', pptUrl);
  } else {
    console.log('\n--- 原始响应（未解析到 ppt 链接时用于排查，前 4000 字符）---');
    console.log(text.length > 4000 ? text.slice(0, 4000) + '\n... [截断]' : text);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
