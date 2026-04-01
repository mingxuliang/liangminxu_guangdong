/// <reference types="vite/client" />

declare module '*.html?raw' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_DIFY_BASE_URL?: string;
  /** 步骤一「选题评估」应用 API Key（Dify「API 访问」） */
  readonly VITE_DIFY_STEP1_API_KEY?: string;
  /**
   * 应用类型：`workflow` 调 `/v1/workflows/run`；
   * `chat` 调 `/v1/chat-messages`（Agent / Chatflow）
   */
  readonly VITE_DIFY_STEP1_APP_MODE?: string;
  /** 终端用户标识，需在同一应用内唯一（默认 course-create-step1） */
  readonly VITE_DIFY_STEP1_USER_ID?: string;

  /** 步骤二-A：课程分析评估工作流 API Key */
  readonly VITE_DIFY_STEP2A_API_KEY?: string;
  /** 步骤二-B：学员画像与课程目标工作流 API Key */
  readonly VITE_DIFY_STEP2B_API_KEY?: string;
  /** 步骤二终端用户标识（默认 course-create-step2） */
  readonly VITE_DIFY_STEP2_USER_ID?: string;

  /** 步骤三：课程大纲（CourseOutlineEditor）工作流 API Key */
  readonly VITE_DIFY_STEP3_API_KEY?: string;
  /** 步骤三终端用户标识（默认 course-create-step3） */
  readonly VITE_DIFY_STEP3_USER_ID?: string;

  /** 步骤四：课件 PPT 三级大纲工作流 API Key */
  readonly VITE_DIFY_STEP4_API_KEY?: string;
  /** 步骤四终端用户标识（默认 course-create-step4） */
  readonly VITE_DIFY_STEP4_USER_ID?: string;

  /** 阿里云市场 iSlide：AppCode（第五步课件生成，勿提交仓库） */
  readonly VITE_ISLIDE_APPCODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __BASE_PATH__: string;
declare const __IS_PREVIEW__: boolean;
declare const __READDY_PROJECT_ID__: string;
declare const __READDY_VERSION_ID__: string;
declare const __READDY_AI_DOMAIN__: string;