/**
 * Restores UTF-8 Chinese in CourseOutlineEditor.tsx from scripts/outline-initial.txt
 * and additional literal replacements (ASCII-safe script).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const editorPath = path.join(root, 'src/pages/course-create/components/CourseOutlineEditor.tsx');
const initialPath = path.join(__dirname, 'outline-initial.txt');

const initialBody = fs.readFileSync(initialPath, 'utf8');
let s = fs.readFileSync(editorPath, 'utf8');

const initialBlock =
  '/* 内置示例 HTML（与 step3-parse 渲染结构一致） */\nconst INITIAL_HTML = `\n' +
  initialBody +
  '\n`;';

const m = s.match(/\/\*[\s\S]*?\*\/\s*const INITIAL_HTML = `[\s\S]*?`;/);
if (!m) {
  console.error('Could not find INITIAL_HTML block');
  process.exit(1);
}
s = s.replace(m[0], initialBlock);

const pairs = [
  [
    `    label: '??',\n    text: '??????????????????????????????????',`,
    `    label: '通过',\n    text: '大纲层级完整，模块—节—知识点—要点行结构清晰，与课时时长基本匹配。',`,
  ],
  [
    `    label: '??',\n    text: '??????????????????????????????',`,
    `    label: '通过',\n    text: '课程背景与收益表述与第二步分析结论方向一致，可继续细化案例。',`,
  ],
  [
    `    label: '??',\n    text: '????????? 1 ??????????????',`,
    `    label: '建议',\n    text: '可在「导论」中增加 1 个行业案例导入，增强代入感。',`,
  ],
  [
    `    label: '??',\n    text: '????????????????????????????',`,
    `    label: '建议',\n    text: '各模块学时占比建议标注百分比，便于与第四步素材匹配对齐。',`,
  ],
  [
    `    label: '??',\n    text: '?????????????????????????',`,
    `    label: '信息',\n    text: '当前为模拟质检结果，正式环境可对接模型或规则引擎。',`,
  ],
  [
    `    label: '??',\n    text: '??? Word ?? HTML????????????',`,
    `    label: '信息',\n    text: '下载为 Word 兼容 HTML，可直接在本地继续编辑。',`,
  ],
  [
    `const AI_REWRITES = [\n  '?????????????????????????????????',\n  '??????????????????????',\n  '?????????? / ?? / ????????????????',\n];`,
    `const AI_REWRITES = [\n  '可将本段改为「目标—障碍—行动」三段式，突出业务结果与可衡量指标。',\n  '建议补充一个数据或案例支撑结论，增强说服力。',\n  '可将动词统一为「掌握 / 应用 / 复盘」等等级，与布鲁姆分类对齐。',\n];`,
  ],
  [`courseDuration = '6??'`, `courseDuration = '6课时'`],
  [`const msg = e instanceof Error ? e.message : '????'`, `const msg = e instanceof Error ? e.message : '生成失败'`],
  [
    `      '??????????? Dify ????????????????????????'\n    );`,
    `      '已使用本地示例大纲。若 Dify 或网络较慢，可稍后点击「重新生成课程大纲」重试。'\n    );`,
  ],
  [`<title>????</title>`, `<title>课程大纲</title>`],
  [`a.download = '????.doc'`, `a.download = '课程大纲.doc'`],
  [`<span className="font-semibold">??????</span>`, `<span className="font-semibold">大纲生成提示</span>`],
  [
    `          <span className="mt-1 block text-amber-800/80">\n            ????????????????????????\n          </span>`,
    `          <span className="mt-1 block text-amber-800/80">\n            已显示示例大纲，可点击「重新生成课程大纲」重试。\n          </span>`,
  ],
  [
    `                  {aiLoading ? 'AI ????' : 'AI ????'}`,

    `                  {aiLoading ? 'AI 生成中…' : 'AI 改写选区'}`,
  ],
  [`<p className="mb-1.5 text-[11px] text-gray-500">????</p>`, `<p className="mb-1.5 text-[11px] text-gray-500">改写建议</p>`],
  [`                      ????\n                    </button>`, `                      替换选区\n                    </button>`],
  [`                      ???\n                    </button>`, `                      换一条\n                    </button>`],
  [
    `<span className="text-[13px] font-bold text-gray-900">??????????</span>`,
    `<span className="text-[13px] font-bold text-gray-900">大纲质量检查（模拟）</span>`,
  ],
  [
    `<span className="ml-1 text-[11px] text-gray-400">? {QUALITY_ITEMS.length} ?</span>`,
    `<span className="ml-1 text-[11px] text-gray-400">共 {QUALITY_ITEMS.length} 项</span>`,
  ],
  [`          ??Word??`, `          上传Word大纲`],
  [`            ????????\n          </button>`, `            重新生成课程大纲\n          </button>`],
  [`          ??\n        </button>`, `          下载\n        </button>`],
  [`            ???\n          </button>`, `            上一步\n          </button>`],
  [
    `          {qualityLoading ? '????' : showQuality ? '????' : '????'}`,
    `          {qualityLoading ? '检测中…' : showQuality ? '收起质检' : '大纲质检'}`,
  ],
  [`            ???\n          </span>`, `            已保存\n          </span>`],
  [`          ??\n        </button>`, `          保存\n        </button>`],
  [`            ????????\n            <i className="ri-arrow-right-line text-sm" />`, `            下一步：素材匹配\n            <i className="ri-arrow-right-line text-sm" />`],
];

let before = s;
for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.warn('skip (not found):', a.slice(0, 60) + '...');
  } else {
    s = s.split(a).join(b);
  }
}

if (s === before) {
  console.error('No changes applied');
  process.exit(1);
}

fs.writeFileSync(editorPath, s, 'utf8');
console.log('patched full', editorPath);
