/**
 * Worked examples — not live proposals.
 * @see docs/FEATURE_GATE.md
 */

import {
  evaluateFeatureGate,
  renderFeatureGateMarkdown,
  type FeatureGateInput,
} from "./featureGate";

/** Soft Beat fork vista — should accept */
export const EXAMPLE_SOFT_BEAT_VISTA: FeatureGateInput = {
  name: "Soft Beat fork vista",
  pitch: "Lid / Loft / Battlement lines name the irreversible Take you already made.",
  justification:
    "Deepens Cove/Paycheck/Credit Takes through Soft Beat + organ language already on the Plinth path.",
  systemsTouched: ["irreversible Take", "Soft Beat", "money organs", "Memory Plinth"],
  value: {
    strengthensCoreFantasy: 4,
    strengthensCoreLoop: 5,
    createsMeaningfulDecisions: 4,
    interactsWithExistingSystems: 5,
    createsEmergentPossibilities: 3,
    improvesMastery: 3,
    improvesPlayerExpression: 4,
    improvesReplayability: 3,
    improvesSocialPossibility: 1,
    createsMemorableStories: 5,
  },
  cost: {
    cognitiveComplexity: 2,
    uiComplexity: 1,
    technicalComplexity: 2,
    balanceRisk: 1,
    maintenanceBurden: 2,
    contentBurden: 2,
  },
};

/** Copycat PvP market — should reject */
export const EXAMPLE_COPYCAT_PVP: FeatureGateInput = {
  name: "Global PvP trading floor",
  pitch: "Voyagers duel prices in realtime",
  justification: "Other games have trading floors and players expect them",
  systemsTouched: ["shop"],
  value: {
    strengthensCoreFantasy: 1,
    strengthensCoreLoop: 1,
    createsMeaningfulDecisions: 2,
    interactsWithExistingSystems: 1,
    createsEmergentPossibilities: 2,
    improvesMastery: 2,
    improvesPlayerExpression: 1,
    improvesReplayability: 2,
    improvesSocialPossibility: 3,
    createsMemorableStories: 1,
  },
  cost: {
    cognitiveComplexity: 4,
    uiComplexity: 5,
    technicalComplexity: 5,
    balanceRisk: 5,
    maintenanceBurden: 5,
    contentBurden: 4,
  },
  fakeMultiplayerBackend: true,
};

export function exampleSoftBeatReport(): string {
  const result = evaluateFeatureGate(EXAMPLE_SOFT_BEAT_VISTA);
  return renderFeatureGateMarkdown(EXAMPLE_SOFT_BEAT_VISTA, result);
}
