// ---------------------------------------------------------------------------
// Decision Timeline — "Why it happened" replay data model + persistence
// ---------------------------------------------------------------------------
// Captures key decision points during quests/minigames so players can review
// what they chose, what alternatives existed, and why the outcome occurred.
// ---------------------------------------------------------------------------

const TIMELINE_KEY = "decision_timeline_v1";
const MAX_TIMELINES = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Snapshot of player state at the moment a decision was made. */
export type StateSnapshot = {
  money: number;
  score: number;
  turn: number;
  debt: number;
  counters: Record<string, number>;
  flags: Record<string, boolean>;
};

/** A single decision point captured during gameplay. */
export type DecisionEntry = {
  /** ISO timestamp of when the decision was made */
  timestamp: string;
  /** Context: which island/quest/minigame this happened in */
  context: {
    islandId?: string;
    questId?: string;
    minigameId?: string;
    deckId?: string;
  };
  /** What the player chose */
  action: {
    /** The event or action that prompted the decision */
    eventId?: string;
    eventTitle: string;
    eventIcon?: string;
    /** The label of the choice the player made */
    chosenLabel: string;
    /** Index of the choice */
    chosenIndex: number;
  };
  /** What alternatives were available (labels only) */
  alternatives: string[];
  /** Summary of state changes caused by this decision */
  stateDiff: string;
  /** Short causal explanation of why the outcome happened */
  explanation: string;
  /** Personalized causal explanation referencing actual player state */
  causalExplanation?: string;
  /** Optional learning note from content */
  learningNote?: string;
  /** Skill stat changes caused by this decision */
  skillChanges?: import("./skillStats").SkillStatChange[];
  /** Player state snapshot BEFORE this decision was applied */
  stateBefore?: StateSnapshot;
  /** Player state snapshot AFTER this decision was applied */
  stateAfter?: StateSnapshot;
  /** Impact score used for highlight selection (higher = more important) */
  impactScore?: number;
};

/** A complete decision timeline for one quest/minigame session. */
export type DecisionTimeline = {
  id: string;
  /** ISO timestamp of session start */
  startedAt: string;
  /** ISO timestamp of session end */
  completedAt: string;
  /** Context for the whole session */
  context: {
    islandId: string;
    islandName: string;
    questId?: string;
    questTitle?: string;
    minigameId: string;
    minigameName: string;
  };
  /** Whether the player succeeded */
  success: boolean;
  /** Final score */
  score?: number;
  /** The decision entries — 3–7 key highlights selected by impact */
  entries: DecisionEntry[];
  /** Aggregated skill stat changes across the session */
  skillChanges?: import("./skillStats").SkillStatChange[];
  /** Narrative summary connecting the highlights */
  storySummary?: string;
};

// ---------------------------------------------------------------------------
// Persistence — localStorage
// ---------------------------------------------------------------------------

export function loadTimelines(): DecisionTimeline[] {
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    if (raw) return JSON.parse(raw) as DecisionTimeline[];
  } catch { /* ignore */ }
  return [];
}

export function persistTimelines(timelines: DecisionTimeline[]): void {
  try {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(timelines));
  } catch { /* ignore */ }
}

/** Save a new timeline, keeping only the last MAX_TIMELINES. */
export function saveTimeline(timeline: DecisionTimeline): void {
  const existing = loadTimelines();
  const merged = [...existing, timeline].slice(-MAX_TIMELINES);
  persistTimelines(merged);
}

/** Get the most recent timeline (for showing replay after completion). */
export function getLatestTimeline(): DecisionTimeline | null {
  const all = loadTimelines();
  return all.length > 0 ? all[all.length - 1] : null;
}

/** Get timeline by id. */
export function getTimelineById(id: string): DecisionTimeline | null {
  return loadTimelines().find((t) => t.id === id) ?? null;
}

/** Export all timelines as a JSON string (for backup). */
export function exportTimelinesJSON(): string {
  return JSON.stringify(loadTimelines(), null, 2);
}

// ---------------------------------------------------------------------------
// Builder — constructs DecisionEntry from event resolution data
// ---------------------------------------------------------------------------

import type { EventEffect } from "@/content/events/types";

/** Summarise effects into a human-readable state-diff string. */
export function summariseEffects(effects: EventEffect[]): string {
  const parts: string[] = [];
  for (const eff of effects) {
    switch (eff.type) {
      case "money":
        parts.push(eff.amount >= 0 ? `+$${eff.amount}` : `-$${Math.abs(eff.amount)}`);
        break;
      case "debt":
        parts.push(`debt ${eff.amount >= 0 ? "+" : ""}${eff.amount}`);
        break;
      case "score":
        parts.push(`${eff.amount >= 0 ? "+" : ""}${eff.amount} pts`);
        break;
      case "reputation":
        parts.push(`rep ${eff.amount >= 0 ? "+" : ""}${eff.amount}`);
        break;
      case "skillStats":
        parts.push(`${eff.skill} ${eff.delta >= 0 ? "+" : ""}${eff.delta}`);
        break;
      case "counter":
        parts.push(`${eff.key} ${eff.delta >= 0 ? "+" : ""}${eff.delta}`);
        break;
      case "flag":
        parts.push(`${eff.key}=${eff.value}`);
        break;
      case "inventory":
        parts.push(`${eff.action} ${eff.itemId}`);
        break;
      case "questProgress":
        parts.push(`quest progress: ${eff.questId}`);
        break;
    }
  }
  return parts.join(", ") || "no change";
}
