export {
  FTUE_VERSION,
  EXPERIMENT_PRIMARY_METRICS,
  EXPERIMENT_GUARDRAIL_METRICS,
  HUMAN_REVIEW_GATES,
} from "./types";
export type {
  FtueVersionId,
  FtueExperimentDef,
  ExperimentPrimaryMetricId,
  ExperimentGuardrailMetricId,
  ExperimentStatus,
  ObservationPolicy,
  StopCondition,
  InterpretationRules,
  HumanReviewGateId,
  HumanReviewGateResult,
  HumanReviewDecision,
  FtueExperimentHumanReview,
  FtueExperimentAssignment,
} from "./types";

export {
  validateFtueExperiment,
  assertValidFtueExperiment,
  isExperimentRunnable,
} from "./validate";
export type { ExperimentValidationIssue } from "./validate";

export {
  evaluateShipReadiness,
  assertHumanReviewAllowsShip,
  createEmptyReviewGates,
} from "./review";
export type { ShipGateResult } from "./review";

export {
  FTUE_EXPERIMENT_REGISTRY,
  listFtueExperiments,
  getFtueExperiment,
  listRunningFtueExperiments,
  validateFtueExperimentRegistry,
  assertRegistryHealthy,
} from "./registry";

export {
  resolveFtueExperimentAssignment,
  getAssignedExperimentVariant,
  getAssignedExperimentId,
  isFtueVariant,
  ftueExperimentAnalyticsContext,
  clearFtueExperimentAssignmentForTests,
} from "./assignment";
