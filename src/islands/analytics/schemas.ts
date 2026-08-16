/**
 * Stable gameplay telemetry payload shapes.
 * Append fields carefully; never rename existing fields.
 * @see docs/GAME_METRICS.md
 */

export type SessionEndReason = "user_exit" | "visibility_hidden" | "crash_recover";

export type CoreLoopPhase =
  | "take"
  | "harbor_felt"
  | "soft_beat"
  | "quest_clear"
  | "board_clear"
  | "ritual";

export type LocationKind =
  | "minigame"
  | "quest"
  | "take"
  | "structure"
  | "voyage"
  | "dialogue"
  | "hub";

export type LocationOutcome = "success" | "failure" | "abandon";

export type ResourceId = "coins" | "xp" | "stars";

export type ResourceReason =
  | "minigame_reward"
  | "minigame_consolation"
  | "quest_reward"
  | "ritual_payday"
  | "ritual_bonus"
  | "harbor_purchase"
  | "soft_beat_thankyou"
  | "party_star"
  | "other";

export type StrategyDomain =
  | "irreversible"
  | "soft_beat"
  | "shop"
  | "board"
  | "dialogue_fork";

export type FeatureId =
  | "memory_plinth"
  | "family_room"
  | "capsule_stall"
  | "freedom_pavilion"
  | "daily_ritual"
  | "soft_beat"
  | "outfitter"
  | "studio"
  | "arcade"
  | "travel_map"
  | "gallery"
  | "settings"
  | "market"
  | "scar_spectacle"
  | "day2_echo"
  | "share_card";

export type AbandonReason =
  | "user_exit"
  | "minigame_leave"
  | "dialogue_skip"
  | "voyage_cancel"
  | "structure_exit"
  | "visibility_hidden";

export type ProgressionMilestoneId =
  | "onboarding_done"
  | "tutorial_done"
  | "cove_change"
  | "paycheck_change"
  | "harbor_freedom"
  | "credit_ordeal"
  | "first_island"
  | "first_quest"
  | "first_minigame_clear";

export type DecisionDomain = "dialogue" | "irreversible" | "board" | "shop" | "ritual";

export type SystemId =
  | "weather"
  | "ledger"
  | "soft_beat"
  | "scar_spectacle"
  | "day2_echo"
  | "organ"
  | "family_room"
  | "talk"
  | "plinth"
  | "capsule"
  | "freedom";

/** Runtime allowlists — reject unknown enums at the edge. */
export const CORE_LOOP_PHASES: readonly CoreLoopPhase[] = [
  "take",
  "harbor_felt",
  "soft_beat",
  "quest_clear",
  "board_clear",
  "ritual",
] as const;

export const FEATURE_IDS: readonly FeatureId[] = [
  "memory_plinth",
  "family_room",
  "capsule_stall",
  "freedom_pavilion",
  "daily_ritual",
  "soft_beat",
  "outfitter",
  "studio",
  "arcade",
  "travel_map",
  "gallery",
  "settings",
  "market",
  "scar_spectacle",
  "day2_echo",
  "share_card",
] as const;

export const SYSTEM_IDS: readonly SystemId[] = [
  "weather",
  "ledger",
  "soft_beat",
  "scar_spectacle",
  "day2_echo",
  "organ",
  "family_room",
  "talk",
  "plinth",
  "capsule",
  "freedom",
] as const;

export type GameplayPayloadByEvent = {
  session_heartbeat: { tick: number; visible: boolean };
  session_ended: { reason: SessionEndReason; durationMs?: number };
  core_loop_cycle: {
    phase: CoreLoopPhase;
    islandId?: string;
    cycleIndex?: number;
    refId?: string;
  };
  location_outcome: {
    locationKind: LocationKind;
    locationId: string;
    outcome: LocationOutcome;
    islandId?: string;
    durationMs?: number;
  };
  resource_delta: {
    resource: ResourceId;
    delta: number;
    reason: ResourceReason;
    balanceAfter?: number;
    islandId?: string;
  };
  strategy_selected: {
    domain: StrategyDomain;
    strategyId: string;
    contextId?: string;
    islandId?: string;
  };
  feature_used: {
    feature: FeatureId;
    action?: "open" | "close" | "peek" | "claim" | "share";
    islandId?: string;
  };
  abandon_point: {
    surface: string;
    reason: AbandonReason;
    islandId?: string;
    featureId?: FeatureId;
    elapsedMsAtAbandon?: number;
  };
  progression_milestone: {
    milestone: ProgressionMilestoneId;
    islandId?: string;
    questId?: string;
  };
  decision_made: {
    domain: DecisionDomain;
    decisionId: string;
    contextId?: string;
    islandId?: string;
  };
  retry_attempt: {
    context: "minigame" | "quest" | "dialogue" | "other";
    targetId: string;
    attempt: number;
    islandId?: string;
  };
  system_interacted: {
    system: SystemId;
    action?: string;
    refId?: string;
    islandId?: string;
  };
  harbor_purchase: {
    kind: string;
    price: number;
    itemId?: string;
  };
};

export function isFeatureId(v: string): v is FeatureId {
  return (FEATURE_IDS as readonly string[]).includes(v);
}

export function isSystemId(v: string): v is SystemId {
  return (SYSTEM_IDS as readonly string[]).includes(v);
}

/** Map Harbor hub modal ids → stable feature ids. */
export function featureFromHubModal(
  modal: string | null | undefined,
): FeatureId | null {
  switch (modal) {
    case "memory":
      return "memory_plinth";
    case "family":
      return "family_room";
    case "capsule":
      return "capsule_stall";
    case "pavilion":
      return "freedom_pavilion";
    case "ritual":
      return "daily_ritual";
    case "outfitter":
      return "outfitter";
    case "gallery":
      return "gallery";
    case "settings":
      return "settings";
    case "market":
      return "market";
    case "studio_stele":
      return "studio";
    default:
      return null;
  }
}
