export { createConsequenceEngine, type ConsequenceEngine } from "./engine";
export {
  whatCouldThePlayerHaveDoneDifferently,
  whatHappened,
  whatPreviousDecisionContributed,
  whyDidItHappen,
} from "./queries";
export { SchemaError, assertSpineVisibility, validateCommitSpec } from "./validate";
export { coveTakeCommit, paycheckTakeCommit } from "./fixtures";
export type {
  Answer,
  Consequence,
  ConsequenceDomain,
  Decision,
  DecisionCommitSpec,
  Horizon,
} from "./types";
