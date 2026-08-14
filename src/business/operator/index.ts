export type {
  ProtectedDomain,
  TaskClass,
  ExecutionMode,
  OperatorPhase,
  PhaseStatus,
  OperatorStatus,
  ApprovalEvent,
  ProposedAction,
  ExecutedAction,
  BlockedAction,
  ContextSnippet,
  OperatorObservation,
  OperatorRequest,
  PhaseLog,
  ConfidenceReport,
  Classification,
  DelegateResult,
  OperatorResult,
  ExecutionRecord,
  TaskHandler,
  TaskHandlerInput,
  ContextPort,
  MemoryPort,
  MetricsPort,
} from "./types";
export { PROTECTED_DOMAINS } from "./types";
export {
  isProtectedDomain,
  isHumanApprover,
  findMatchingApproval,
  approvalBlockReason,
  inferTouchedDomains,
} from "./protected";
export { classifyTask, resolveMode } from "./classify";
export { evaluateConfidence, mayAutoExecute } from "./confidence";
export {
  createInMemoryContextPort,
  createInMemoryMetricsPort,
  createInMemoryMemoryPort,
  defaultDeterministicHandler,
  createAiReasoningStubHandler,
} from "./ports";
export { ExecutionAudit, createInMemoryAuditStore, type AuditStore } from "./audit";
export { CapitalOperator, type OperatorDeps } from "./orchestrator";
