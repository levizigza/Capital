/** Generic consequence records — isolated from Islands save. See docs/simulation/CONSEQUENCE_SCHEMA.md */

export const HORIZONS = ["IMMEDIATE", "SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"] as const;
export type Horizon = (typeof HORIZONS)[number];

export const DEFAULT_DELAY: Record<Horizon, number> = {
  IMMEDIATE: 0,
  SHORT_TERM: 1,
  MEDIUM_TERM: 3,
  LONG_TERM: 8,
};

export const DOMAINS = [
  "money",
  "liquidity",
  "debt",
  "risk",
  "relationships",
  "reputation",
  "career",
  "business",
  "neighborhood",
  "story",
  "future_opportunities",
] as const;
export type ConsequenceDomain = (typeof DOMAINS)[number];

export const VISIBILITIES = ["hidden", "foreshadowed", "felt", "named"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const CERTAINTY_TYPES = ["certain", "likely", "uncertain", "conditional"] as const;
export type CertaintyType = (typeof CERTAINTY_TYPES)[number];

export const REVERSIBILITIES = ["irreversible", "costly", "reversible"] as const;
export type Reversibility = (typeof REVERSIBILITIES)[number];

export const CONSEQUENCE_STATUSES = ["pending", "fired", "cancelled", "blocked"] as const;
export type ConsequenceStatus = (typeof CONSEQUENCE_STATUSES)[number];

export const CAUSAL_RELATIONS = ["produces", "amplifies", "unlocks", "blocks", "enables"] as const;
export type CausalRelation = (typeof CAUSAL_RELATIONS)[number];

export const ENTITY_KINDS = ["player", "npc", "place", "holding", "opportunity", "system"] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export type Alternative = {
  id: string;
  label: string;
};

export type SourceAction = {
  decisionId: string;
  verb: string;
  choiceId: string;
  chosenLabel: string;
  alternatives: Alternative[];
  committedAtTick: number;
  context?: {
    placeId?: string;
    questId?: string;
    npcId?: string;
  };
};

export type CausalHop = {
  fromId: string;
  toId: string;
  relation: CausalRelation;
};

export type TriggerTime = {
  horizon: Horizon;
  delayTicks: number;
  fireAtTick?: number;
};

export type AffectedEntity = {
  kind: EntityKind;
  id: string;
  label: string;
};

export type ExplanationData = {
  whatHappened: string;
  whyItHappened: string;
  priorDecisionHint: string | null;
  counterfactual: string;
  organHint?: string;
};

export type Consequence = {
  id: string;
  domain: ConsequenceDomain;
  magnitude: number;
  source_action: SourceAction;
  causal_path: CausalHop[];
  trigger_time: TriggerTime;
  visibility: Visibility;
  certainty_type: CertaintyType;
  conditionId?: string;
  affected_entities: AffectedEntity[];
  reversibility: Reversibility;
  explanation_data: ExplanationData;
  status: ConsequenceStatus;
  firedAtTick?: number;
  cancelReason?: string;
};

export type Decision = {
  id: string;
  source_action: SourceAction;
  scheduledIds: string[];
};

export type ConsequenceDraft = {
  /** Unique suffix after consequence:{decisionId}: */
  key: string;
  domain: ConsequenceDomain;
  horizon: Horizon;
  delayTicks?: number;
  visibility: Visibility;
  certainty_type: CertaintyType;
  conditionId?: string;
  affected_entities: AffectedEntity[];
  reversibility: Reversibility;
  magnitude: number;
  explanation_data: ExplanationData;
  /** Extra hops after the origin decision hop (e.g. earlier consequence ids). */
  extraPath?: CausalHop[];
  relationFromDecision?: CausalRelation;
};

export type DecisionCommitSpec = {
  id: string;
  verb: string;
  choiceId: string;
  chosenLabel: string;
  alternatives: Alternative[];
  context?: SourceAction["context"];
  consequences: ConsequenceDraft[];
  /** Other decision ids this commit depends on (chained causality). */
  priorDecisionIds?: string[];
};

export type QueryFilter = {
  decisionId?: string;
  domain?: ConsequenceDomain;
  fromTick?: number;
  toTick?: number;
};

export type QuestionKind =
  | "what_happened"
  | "why_did_it_happen"
  | "what_previous_decision_contributed"
  | "what_could_have_been_done_differently";

export type Answer = {
  question: QuestionKind;
  sentence: string;
  evidenceIds: string[];
  causal_path: CausalHop[];
};
