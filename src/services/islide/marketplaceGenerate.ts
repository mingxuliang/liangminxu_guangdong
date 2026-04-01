import type { IslideOutlineRoot } from './outlineFromSlides';

export interface GeneratePptResult {
  fileUrl: string;
  pptId: string;
  totalPage: number;
}

function parseSsePptUrl(body: string): GeneratePptResult | null {
  let fileUrl = '';
  let pptId = '';
  let totalPage = 0;
  for (const line of body.split('\n')) {
    const s = line.trim();
    if (!s.startsWith('data:')) continue;
    const payload = s.slice(5).trim();
    if (payload === '[DONE]') break;
    try {
      const j = JSON.parse(payload) as {
        status?: string;
        ppt?: string;
        ppt_id?: string;
        total_page?: number;
      };
      if (j.status === 'generate-ppt-end' && j.ppt) {
        fileUrl = j.ppt;
        pptId = j.ppt_id || '';
        totalPage = j.total_page ?? 0;
      }
    } catch {
      /* ignore */
    }
  }
  if (!fileUrl) return null;
  return { fileUrl, pptId, totalPage };
}

/** 是否已配置阿里云市场 AppCode（走 Vite 代理 /islide-api） */
export function isIslideMarketplaceConfigured(): boolean {
  return Boolean(import.meta.env.VITE_ISLIDE_APPCODE?.trim());
}

/**
 * 调用阿里云市场 islide generate_ppt（流式 SSE，与脚本 call-aliyun-islide-ppt.mjs 一致）
 * 若服务端支持 themeId，可一并传入（部分封装可能忽略）
 */
export async function generatePptViaMarketplace(
  outline: IslideOutlineRoot,
  themeId?: number | null
): Promise<GeneratePptResult> {
  const appcode = import.meta.env.VITE_ISLIDE_APPCODE?.trim();
  if (!appcode) {
    throw new Error('未配置 VITE_ISLIDE_APPCODE');
  }

  const body: Record<string, unknown> = { outline };
  if (themeId != null && themeId > 0) {
    body.themeId = themeId;
  }

  const prefix = import.meta.env.BASE_URL || '/';
  const url = (prefix.endsWith('/') ? prefix : `${prefix}/`) + 'islide-api/generate_ppt';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `APPCODE ${appcode}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text.slice(0, 500) || `HTTP ${res.status}`);
  }

  const parsed = parseSsePptUrl(text);
  if (!parsed) {
    throw new Error('未能从接口响应中解析 PPT 下载地址，请检查网络或 AppCode');
  }
  return parsed;
}
