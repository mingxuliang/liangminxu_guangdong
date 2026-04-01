/**
 * 第三步「课程大纲」生成等待态文案。
 * 单独文件保存 UTF-8，避免主组件被错误编码工具改写后出现「????」。
 * 布局与第一步 AnalysisPanel 中 GenerationProgressScreen 一致（默认 panel 布局）。
 */
export const OUTLINE_GENERATION_PROGRESS = {
  title: '正在生成课程大纲',
  subtitle: '智能引擎正在分析课程结构并撰写大纲，请稍候',
  stepLabels: ['解析学员与目标', '编排四级结构', '对齐学时与逻辑'],
} as const;

export const SKIP_OUTLINE_WAITING_LABEL = '使用示例大纲，跳过等待';
