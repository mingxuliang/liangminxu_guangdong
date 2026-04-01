/**
 * 第三步「课程大纲」编辑器内所有中文文案（示例大纲以外的 UI）。
 * 与 outline-sample.html 一样单独维护 UTF-8，避免写在 CourseOutlineEditor.tsx 中被错误编码破坏。
 */

export const DEFAULT_COURSE_DURATION = '6课时';

export const OUTLINE_ERR_GENERATE_FALLBACK = '生成失败';

export const OUTLINE_SKIP_WAITING_MESSAGE =
  '已使用本地示例大纲。若 Dify 或网络较慢，可稍后点击「重新生成课程大纲」重试。';

export const OUTLINE_BANNER_TITLE = '大纲生成提示';

export const OUTLINE_BANNER_HINT =
  '已显示示例大纲，可点击「重新生成课程大纲」重试。';

export const OUTLINE_DOC_TITLE = '课程大纲';

export const OUTLINE_DOC_FILENAME = '课程大纲.doc';

export const AI_REWRITE_LOADING = 'AI 生成中…';

export const AI_REWRITE_ACTION = 'AI 改写选区';

export const AI_REWRITE_HINT = '改写建议';

export const AI_REWRITE_APPLY = '替换选区';

export const AI_REWRITE_ANOTHER = '换一条';

export const QUALITY_PANEL_TITLE = '大纲质量检查（模拟）';

export const QUALITY_PANEL_COUNT = (n: number) => `共 ${n} 项`;

export const BTN_UPLOAD_WORD = '上传Word大纲';

export const BTN_REGENERATE = '重新生成课程大纲';

export const BTN_DOWNLOAD = '下载';

export const BTN_BACK = '上一步';

export const BTN_QUALITY_LOADING = '检测中…';

export const BTN_QUALITY_COLLAPSE = '收起质检';

export const BTN_QUALITY = '大纲质检';

export const LABEL_SAVED = '已保存';

export const BTN_SAVE = '保存';

export const BTN_NEXT_MATERIAL = '下一步：素材匹配';

export const QUALITY_ITEMS: ReadonlyArray<{
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
  text: string;
}> = [
  {
    icon: 'ri-checkbox-circle-line',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: '通过',
    text: '大纲层级完整，模块—节—知识点—要点行结构清晰，与课时时长基本匹配。',
  },
  {
    icon: 'ri-checkbox-circle-line',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: '通过',
    text: '课程背景与收益表述与第二步分析结论方向一致，可继续细化案例。',
  },
  {
    icon: 'ri-lightbulb-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: '建议',
    text: '可在「导论」中增加 1 个行业案例导入，增强代入感。',
  },
  {
    icon: 'ri-lightbulb-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: '建议',
    text: '各模块学时占比建议标注百分比，便于与第四步素材匹配对齐。',
  },
  {
    icon: 'ri-information-line',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: '信息',
    text: '当前为模拟质检结果，正式环境可对接模型或规则引擎。',
  },
  {
    icon: 'ri-information-line',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: '信息',
    text: '下载为 Word 兼容 HTML，可直接在本地继续编辑。',
  },
];

export const AI_REWRITES = [
  '可将本段改为「目标—障碍—行动」三段式，突出业务结果与可衡量指标。',
  '建议补充一个数据或案例支撑结论，增强说服力。',
  '可将动词统一为「掌握 / 应用 / 复盘」等等级，与布鲁姆分类对齐。',
] as const;
