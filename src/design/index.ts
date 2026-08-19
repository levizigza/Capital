export {
  VALUE_AXES,
  COST_AXES,
  VALUE_AXIS_LABELS,
  COST_AXIS_LABELS,
  evaluateFeatureGate,
  renderFeatureGateMarkdown,
  isCopycatJustification,
  hasMultiSystemBonus,
  emptyValueScores,
  emptyCostScores,
  assertScore,
  sumScores,
} from "./featureGate";
export type {
  ValueAxis,
  CostAxis,
  GateScore,
  ValueScores,
  CostScores,
  FeatureGateInput,
  FeatureGateResult,
  GateVerdict,
} from "./featureGate";
