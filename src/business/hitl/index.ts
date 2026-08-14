export type {
  RiskDimension,
  RiskScore,
  RiskProfile,
  RiskTier,
  PolicyThresholds,
  EvidenceItem,
  ApprovalRequest,
  ApprovalGate,
  TierAssessment,
  ApprovalStatus,
  ConfirmationStep,
  ApprovalDecision,
  ApprovalCase,
  ApprovalDecisionLog,
  ValidationIssue,
} from "./types";
export {
  RISK_DIMENSIONS,
  RISK_TIERS,
  DEFAULT_POLICY_THRESHOLDS,
} from "./types";
export {
  assessRisk,
  weightedSum,
  maxDimension,
  emptyRiskProfile,
  isRiskScore,
  assertRiskProfile,
} from "./risk";
export { validateApprovalRequest, HitlValidationError } from "./validate";
export {
  checkMediumPolicy,
  isFounderActor,
  isSecondConfirmer,
} from "./policy";
export { HitlApprovalEngine, type HitlEngineOptions } from "./engine";
