// ---------------------------------------------------------------------------
// Soft-Skill Stats — RPG-like character stats for financial behaviours
// ---------------------------------------------------------------------------
// Three stats (0–100) track player growth across islands:
//   Resilience  — buffers, emergency fund habits
//   Discipline  — consistency: paying debt, rebalancing, sticking to budgets
//   Foresight   — planning: allocating ahead, diversifying before shocks
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkillStatId = "resilience" | "discipline" | "foresight";

export type SkillStatsMap = Record<SkillStatId, number>;

/** A single recorded change to a skill stat. */
export type SkillStatChange = {
  stat: SkillStatId;
  delta: number;
  reason: string;
  timestamp: string;
};

/** Full skill stats state persisted in the island save. */
export type SkillStatsState = {
  current: SkillStatsMap;
  history: SkillStatChange[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SKILL_STAT_IDS: readonly SkillStatId[] = ["resilience", "discipline", "foresight"] as const;

export const SKILL_STAT_META: Record<SkillStatId, {
  label: string;
  icon: string;
  color: string;
  description: string;
  howToImprove: string;
}> = {
  resilience: {
    label: "Resilience",
    icon: "🛡️",
    color: "#3b82f6",
    description: "Your ability to absorb financial shocks through emergency funds and buffers.",
    howToImprove: "Build emergency funds, keep savings buffers, avoid depleting reserves on wants.",
  },
  discipline: {
    label: "Discipline",
    icon: "⚖️",
    color: "#8b5cf6",
    description: "Your consistency in managing money — paying debts, rebalancing, and budgeting.",
    howToImprove: "Pay bills in full, stick to budgets, avoid repeated overspending or debt spikes.",
  },
  foresight: {
    label: "Foresight",
    icon: "🔭",
    color: "#f59e0b",
    description: "Your planning skill — allocating ahead, diversifying, and anticipating risks.",
    howToImprove: "Plan budgets before spending, diversify investments, save before big expenses.",
  },
};

export const DEFAULT_SKILL_STATS: SkillStatsMap = {
  resilience: 10,
  discipline: 10,
  foresight: 10,
};

const MAX_STAT = 100;
const MIN_STAT = 0;
const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function createDefaultSkillStats(): SkillStatsState {
  return {
    current: { ...DEFAULT_SKILL_STATS },
    history: [],
  };
}

/** Clamp a stat value to [0, 100]. */
function clamp(value: number): number {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, value));
}

/**
 * Apply a set of skill stat changes, returning a new state.
 * Each change is recorded in history (capped at MAX_HISTORY).
 */
export function applySkillChanges(
  state: SkillStatsState,
  changes: SkillStatChange[],
): SkillStatsState {
  if (changes.length === 0) return state;

  const next: SkillStatsMap = { ...state.current };
  for (const ch of changes) {
    if (ch.stat in next) {
      next[ch.stat] = clamp(next[ch.stat] + ch.delta);
    }
  }

  const history = [...state.history, ...changes].slice(-MAX_HISTORY);
  return { current: next, history };
}

// ---------------------------------------------------------------------------
// Mapping from EventEffect skillStats → SkillStatChange[]
// ---------------------------------------------------------------------------

import type { EventEffect } from "@/content/events/types";

/** Well-known skill keys that map to our three RPG stats. */
const SKILL_KEY_MAP: Record<string, SkillStatId> = {
  budget_discipline: "discipline",
  discipline: "discipline",
  debt_management: "discipline",
  negotiation: "foresight",
  planning: "foresight",
  foresight: "foresight",
  diversification: "foresight",
  emergency_fund: "resilience",
  resilience: "resilience",
  savings: "resilience",
};

/**
 * Extract skill stat changes from a list of EventEffects.
 * Maps the `skillStats` effect type's `skill` key to the three RPG stats.
 */
export function extractSkillChanges(
  effects: EventEffect[],
  reason: string,
): SkillStatChange[] {
  const now = new Date().toISOString();
  const changes: SkillStatChange[] = [];

  for (const eff of effects) {
    if (eff.type === "skillStats") {
      const mapped = SKILL_KEY_MAP[eff.skill];
      if (mapped) {
        changes.push({ stat: mapped, delta: eff.delta, reason, timestamp: now });
      }
    }
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Risky-pattern detection — penalty changes
// ---------------------------------------------------------------------------

/**
 * Detect risky patterns from a sequence of recent event effects and produce
 * penalty stat changes. Called periodically (e.g., on minigame completion).
 *
 * Patterns detected:
 *   - Repeated debt increases → Discipline penalty
 *   - Repeated overspending (negative money) → Resilience penalty
 */
export function detectRiskyPatterns(
  recentEffects: EventEffect[][],
): SkillStatChange[] {
  const now = new Date().toISOString();
  const changes: SkillStatChange[] = [];

  let consecutiveDebtIncreases = 0;
  let consecutiveOverspends = 0;

  for (const effects of recentEffects) {
    const hasDebt = effects.some((e) => e.type === "debt" && e.amount > 0);
    const hasOverspend = effects.some((e) => e.type === "money" && e.amount < -15);

    consecutiveDebtIncreases = hasDebt ? consecutiveDebtIncreases + 1 : 0;
    consecutiveOverspends = hasOverspend ? consecutiveOverspends + 1 : 0;
  }

  if (consecutiveDebtIncreases >= 3) {
    changes.push({
      stat: "discipline",
      delta: -3,
      reason: "Repeated debt increases — try paying bills in full",
      timestamp: now,
    });
  }

  if (consecutiveOverspends >= 3) {
    changes.push({
      stat: "resilience",
      delta: -3,
      reason: "Repeated overspending — build a buffer before big expenses",
      timestamp: now,
    });
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Quest completion bonuses — data-driven
// ---------------------------------------------------------------------------

/** Mapping from quest ID patterns to stat bonuses. */
const QUEST_STAT_BONUSES: { pattern: RegExp; stat: SkillStatId; delta: number }[] = [
  { pattern: /budget/i, stat: "discipline", delta: 3 },
  { pattern: /sav/i, stat: "resilience", delta: 3 },
  { pattern: /invest|diversif/i, stat: "foresight", delta: 3 },
  { pattern: /emergency|rainy/i, stat: "resilience", delta: 4 },
  { pattern: /debt|credit/i, stat: "discipline", delta: 3 },
  { pattern: /plan|goal/i, stat: "foresight", delta: 3 },
];

/**
 * Produce skill stat changes for completing a quest.
 * Uses quest id + title to infer which stats to boost.
 */
export function questCompletionBonuses(
  questId: string,
  questTitle: string,
): SkillStatChange[] {
  const now = new Date().toISOString();
  const combined = `${questId} ${questTitle}`;
  const changes: SkillStatChange[] = [];
  const seen = new Set<SkillStatId>();

  for (const rule of QUEST_STAT_BONUSES) {
    if (rule.pattern.test(combined) && !seen.has(rule.stat)) {
      changes.push({
        stat: rule.stat,
        delta: rule.delta,
        reason: `Completed quest: ${questTitle}`,
        timestamp: now,
      });
      seen.add(rule.stat);
    }
  }

  // Fallback: every quest gives +1 discipline for showing up
  if (!seen.has("discipline")) {
    changes.push({
      stat: "discipline",
      delta: 1,
      reason: `Completed quest: ${questTitle}`,
      timestamp: now,
    });
  }

  return changes;
}
