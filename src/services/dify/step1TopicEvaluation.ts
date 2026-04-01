/**
 * 步骤一 Dify 对接（兼容旧 import 路径）
 *
 * 实现与类型定义见：
 * - `agent-dify.ts` — 按官方 API 调用 Workflow / Chat-Agent
 * - `step1-parse.ts` — 解析 `outputs` / JSON 正文
 */
export type {
  Step1Dimension,
  Step1EvaluationResult,
  DifyWorkflowOutputs,
} from './step1-parse';

export {
  parseStep1Json,
  parseStep1Outputs,
  buildStep1WorkflowInputs,
  stripJsonFence,
} from './step1-parse';

export {
  runStep1DifyEvaluation as runStep1TopicEvaluation,
  runDifyWorkflowBlocking,
  runDifyChatMessageBlocking,
  getStep1AppMode,
  isDifyStep1Configured,
} from './agent-dify';
