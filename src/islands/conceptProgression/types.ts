/**
 * Progressive disclosure — concept phase machine.
 * Design: docs/ftue/PROGRESSIVE_DISCLOSURE_DESIGN.md
 */

export const CONCEPT_PROGRESS_VERSION = 1 as const;

export type ConceptPhase =
  | "LOCKED"
  | "AVAILABLE"
  | "GUIDED"
  | "REDUCED_GUIDANCE"
  | "INDEPENDENT"
  | "MASTERED"
  | "REVIEW_AVAILABLE";

export const CONCEPT_PHASES: readonly ConceptPhase[] = [
  "LOCKED",
  "AVAILABLE",
  "GUIDED",
  "REDUCED_GUIDANCE",
  "INDEPENDENT",
  "MASTERED",
  "REVIEW_AVAILABLE",
] as const;

export type ConceptPredicate =
  | { type: "never" }
  | { type: "quest_completed"; questId: string }
  | { type: "irreversible_set"; key: string }
  | { type: "scar_present"; scarId?: string; scarIdPrefix?: string }
  | { type: "minigame_completed"; minigameId: string }
  | { type: "mastery_gate_cleared"; gateId: string }
  | { type: "has_freedom" }
  | { type: "island_discovered"; islandId: string }
  | { type: "guided_hub_done" }
  | { type: "transfer_scenario_passed"; scenarioId: string }
  | { type: "all_of"; of: ConceptPredicate[] }
  | { type: "any_of"; of: ConceptPredicate[] };

export type HintPolicy = {
  maxHints: number;
  escalateAfterFailures: number;
};

export type RetryPolicy = {
  maxAttempts: number;
  stayPut: boolean;
};

export type ConceptDef = {
  concept_id: string;
  prerequisites: string[];
  trigger_condition: ConceptPredicate;
  instruction: string;
  attention_target: string;
  practice_task: string;
  success_condition: ConceptPredicate;
  failure_condition: ConceptPredicate;
  hint_policy: HintPolicy;
  retry_policy: RetryPolicy;
  transfer_task: ConceptPredicate;
  mastery_condition: ConceptPredicate;
};

export type ConceptRuntimeEntry = {
  phase: ConceptPhase;
  attempts: number;
  failures: number;
  hintsUsed: number;
  guidedEnteredAt?: string;
  masteredAt?: string;
  lastTransitionAt?: string;
  /** Guided practice succeeded (→ REDUCED_GUIDANCE) */
  guidedSuccess?: boolean;
  guidedAttempts?: number;
  /** Transfer window metrics (→ INDEPENDENT) */
  transferSuccess?: boolean;
  transferAttempts?: number;
  transferStartedAt?: string;
  transferTimeMs?: number;
  strategySelected?: string;
  transferScenarioId?: string;
};

/** Exported measurement row — docs/ftue/TRANSFER_TASKS.md */
export type ConceptTransferMetrics = {
  concept_id: string;
  guided_success: boolean;
  guided_attempts: number;
  hints_used: number;
  transfer_success: boolean;
  transfer_attempts: number;
  transfer_time?: number;
  strategy_selected?: string;
};

export type ConceptProgressState = {
  version: typeof CONCEPT_PROGRESS_VERSION;
  concepts: Record<string, ConceptRuntimeEntry>;
};

/** Snapshot of save proofs — never includes wall-clock age as a sole unlock. */
export type ConceptEvidence = {
  completedQuests: ReadonlySet<string>;
  irreversibleKeys: ReadonlySet<string>;
  scarIds: ReadonlySet<string>;
  completedMinigames: ReadonlySet<string>;
  masteryClears: ReadonlySet<string>;
  discoveredIslands: ReadonlySet<string>;
  hasFreedom: boolean;
  guidedHubDone: boolean;
  transferScenarioPasses: ReadonlySet<string>;
};
