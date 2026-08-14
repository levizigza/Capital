/**
 * Metric → design question map.
 * Metrics identify where to investigate — never proof of enjoyment.
 * @see docs/GAME_METRICS.md
 */

import type { AnalyticsEventName } from "../types";

export type MetricInvestigation = {
  /** Stable event name(s) that feed this metric */
  events: AnalyticsEventName[];
  /** Human metric id for docs / dashboards */
  id: string;
  /** Question designers should ask when the number moves */
  question: string;
  /** What a healthy reading suggests to check next — not “players are happy” */
  investigateWhen: string;
};

export const GAME_METRIC_INVESTIGATIONS: MetricInvestigation[] = [
  {
    id: "session_length",
    events: ["session_started", "session_ended", "session_heartbeat"],
    question: "How long do play sessions last, and when do they go idle?",
    investigateWhen:
      "Median duration far below session target, or heartbeats stop mid-loop — check load, confusion, or interrupt points.",
  },
  {
    id: "onboarding_completion",
    events: ["tutorial_started", "tutorial_step", "tutorial_completed", "onboarding_completed"],
    question: "Do new players finish Ashore / Castle Grounds and reach the first quest?",
    investigateWhen:
      "High start / low complete — inspect the last screen_enter and abandon_point before drop.",
  },
  {
    id: "core_loop_repetitions",
    events: ["core_loop_cycle", "quest_completed", "minigame_completed"],
    question: "How often does a player complete a full Take → Harbor → Soft Beat / clear cycle?",
    investigateWhen:
      "Many island_entered but few core_loop_cycle phases — signature loop may not be closing.",
  },
  {
    id: "failure_locations",
    events: ["fail_reason", "location_outcome", "quest_failed_attempt"],
    question: "Where do attempts fail (minigame, Take, voyage, structure)?",
    investigateWhen:
      "Clustered failures at one locationId — review difficulty, teaching, or UI friction there.",
  },
  {
    id: "success_locations",
    events: ["location_outcome", "quest_completed", "minigame_completed", "core_loop_cycle"],
    question: "Where do players succeed, and does success concentrate on the spine?",
    investigateWhen:
      "Success only on side content / never on Cove Change — check gate copy and pathing.",
  },
  {
    id: "resource_flows",
    events: ["resource_delta", "harbor_purchase"],
    question: "How do coins / XP / stars move — earn, spend, consolation?",
    investigateWhen:
      "Large negative deltas without purchases, or zero earn after clears — economy or reward wiring.",
  },
  {
    id: "strategy_selection",
    events: ["strategy_selected", "decision_made", "dialogue_choice"],
    question: "Which forks do players take (save/spend, protect/glitter, wait/borrow)?",
    investigateWhen:
      "One branch dominates >90% — choice may be fake, or teaching steers too hard.",
  },
  {
    id: "feature_usage",
    events: ["feature_used", "system_interacted"],
    question: "Which Harbor / structure features are opened at all?",
    investigateWhen:
      "Feature never opens after unlock — discoverability or dead hotspot.",
  },
  {
    id: "abandonment_points",
    events: ["abandon_point", "screen_exit", "session_ended", "fail_reason"],
    question: "At which surface do players leave or abandon mid-action?",
    investigateWhen:
      "Spikes at one surface — walk that path for blockers, length, or unclear next step.",
  },
  {
    id: "progression_velocity",
    events: ["progression_milestone", "onboarding_completed", "quest_completed", "island_entered"],
    question: "How fast do players reach spine milestones (elapsedMs between marks)?",
    investigateWhen:
      "Long gaps before cove_change / harbor_freedom — pacing, gates, or missing cues.",
  },
  {
    id: "decision_frequency",
    events: ["decision_made", "dialogue_choice", "strategy_selected"],
    question: "How often do players make consequential decisions per session?",
    investigateWhen:
      "Long sessions with near-zero decisions — content may be touristic, not choiceful.",
  },
  {
    id: "retries",
    events: ["minigame_retry", "retry_attempt", "hint_escalated", "difficulty_changed"],
    question: "How many retries before clear, and do hints / difficulty kick in?",
    investigateWhen:
      "High retries without hint_escalated — adaptive help may be silent or late.",
  },
  {
    id: "system_interactions",
    events: ["system_interacted", "feature_used", "core_loop_cycle"],
    question: "Are living systems (Soft Beat, weather, Plinth, Family Room, Talk) touched?",
    investigateWhen:
      "Systems exist in save but never system_interacted — wiring or discoverability gap.",
  },
];

export function metricForEvent(name: AnalyticsEventName): MetricInvestigation[] {
  return GAME_METRIC_INVESTIGATIONS.filter((m) => m.events.includes(name));
}
