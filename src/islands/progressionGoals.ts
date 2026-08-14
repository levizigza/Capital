/**
 * Nested progression goals — short / medium / long that overlap.
 * Every keep goal must create a new decision (see docs/GAME_DESIGN_PROGRESSION.md).
 * Number-only ladders (XP, wealth rank, ritual streak) are not goals here.
 */

import type { IslandSaveV1 } from "./types";
import { hasCompletedCoveChange } from "./chapterLoop";
import {
  BOSS_ISLAND_ID,
  BOSS_MASTERY_REQUIRED,
  bossUnlockProgress,
  hasHarborFreedom,
} from "./progressGates";
import { ensureLedger, HARBOR_ESCAPE_STREAK, HARBOR_ESCAPE_TARGET, netCashflow } from "./voyagerLedger";
import { PAYCHECK_CHANGE_QUEST_ID, CREDIT_ORDEAL_QUEST_ID } from "./islandIds";
import { CARPET_PROGRESSION_CAP_ID } from "./boats";

export { CARPET_PROGRESSION_CAP_ID };

export type ProgressionCategory =
  | "player_skill"
  | "player_knowledge"
  | "capabilities"
  | "access"
  | "resources"
  | "status"
  | "collection"
  | "world_state"
  | "social_reputation";

export type GoalHorizon = "short" | "medium" | "long";

export type ProgressionGoalDef = {
  id: string;
  horizon: GoalHorizon;
  category: ProgressionCategory;
  title: string;
  /** Coin Bag whisper — place + verb, not a meter. */
  tip: string;
  /** What new decision this unlock creates — if none, do not ship as a goal. */
  newDecision: string;
  /** Other goal ids this nests with. */
  overlaps: string[];
  done: (save: IslandSaveV1) => boolean;
  /** Relevant enough to show before done (default: !done). */
  available?: (save: IslandSaveV1) => boolean;
};

export const PROGRESSION_GOALS: ProgressionGoalDef[] = [
  {
    id: "short_cove_take",
    horizon: "short",
    category: "world_state",
    title: "Cove Take",
    tip: "Coincraft Cove — make the irreversible Take",
    newDecision: "Jar before treat vs spend now — Harbor will plaque what you chose.",
    overlaps: ["medium_freedom", "long_credit"],
    done: (s) => hasCompletedCoveChange(s),
  },
  {
    id: "short_paycheck_take",
    horizon: "short",
    category: "world_state",
    title: "Paycheck Take",
    tip: "Paycheck Peninsula — protect or spend the rainy-day Take",
    newDecision: "Shield the reserve vs spend it — Clock scar opens the next retell.",
    overlaps: ["medium_freedom", "long_credit"],
    done: (s) => Boolean(s.questStatus[PAYCHECK_CHANGE_QUEST_ID]?.completed),
    available: (s) => hasCompletedCoveChange(s),
  },
  {
    id: "medium_freedom",
    horizon: "medium",
    category: "resources",
    title: "Freedom Seal",
    tip: "Grow cashflow — Freedom Seal after strong Pay Days",
    newDecision: "Buy ledger deals vs pouch vanity; sustain $30+/mo across Pay Days.",
    overlaps: ["short_cove_take", "short_paycheck_take", "long_credit"],
    done: (s) => hasHarborFreedom(s),
    available: (s) => hasCompletedCoveChange(s),
  },
  {
    id: "long_credit",
    horizon: "long",
    category: "access",
    title: "Credit Ordeal",
    tip: "Freedom + mastery quizzes — then Credit Kingdom",
    newDecision: "Study and clear mastery before sailing into The Debt Collector’s storm.",
    overlaps: ["medium_freedom", "short_paycheck_take"],
    done: (s) => Boolean(s.questStatus[CREDIT_ORDEAL_QUEST_ID]?.completed),
    available: (s) => hasHarborFreedom(s) || bossUnlockProgress(s).mastery > 0,
  },
];

export type NestedProgressionGoals = {
  short: ProgressionGoalDef | null;
  medium: ProgressionGoalDef | null;
  long: ProgressionGoalDef | null;
};

function isAvailable(goal: ProgressionGoalDef, save: IslandSaveV1): boolean {
  if (goal.done(save)) return false;
  if (goal.available) return goal.available(save);
  return true;
}

/** One active goal per horizon — prefers spine Takes over Soft Beat chrome. */
export function nestedProgressionGoals(save: IslandSaveV1): NestedProgressionGoals {
  const pick = (horizon: GoalHorizon, preferIds: string[]): ProgressionGoalDef | null => {
    const pool = PROGRESSION_GOALS.filter((g) => g.horizon === horizon && isAvailable(g, save));
    for (const id of preferIds) {
      const hit = pool.find((g) => g.id === id);
      if (hit) return hit;
    }
    return pool[0] ?? null;
  };

  return {
    short: pick("short", ["short_cove_take", "short_paycheck_take"]),
    medium: pick("medium", ["medium_freedom"]),
    long: pick("long", ["long_credit"]),
  };
}

/**
 * Single whisper for Coin Bag — short owns attention; else medium; else long.
 * Never a checklist of three meters.
 */
export function primaryProgressionTip(save: IslandSaveV1): string | null {
  const nest = nestedProgressionGoals(save);
  const primary = nest.short ?? nest.medium ?? nest.long;
  return primary?.tip ?? null;
}

/** Freedom chase blurb when medium is active — resources decision, not XP. */
export function mediumFreedomDetail(save: IslandSaveV1): string | null {
  if (hasHarborFreedom(save)) return null;
  const ledger = ensureLedger(save.voyagerLedger);
  const cf = netCashflow(ledger);
  if (cf < HARBOR_ESCAPE_TARGET && ledger.positivePaydayStreak === 0) {
    return `Aim for $${HARBOR_ESCAPE_TARGET}+ /mo cashflow, then ${HARBOR_ESCAPE_STREAK} Pay Days.`;
  }
  return `Seal chase · ${ledger.positivePaydayStreak}/${HARBOR_ESCAPE_STREAK} Pay Days (need $${HARBOR_ESCAPE_TARGET}+ /mo).`;
}

export function creditUnlockDetail(save: IslandSaveV1): string | null {
  if (save.questStatus[CREDIT_ORDEAL_QUEST_ID]?.completed) return null;
  const prog = bossUnlockProgress(save);
  if (prog.unlocked) return `Credit Kingdom open — sail ${BOSS_ISLAND_ID.replace("_", " ")}.`;
  const parts: string[] = [];
  if (!prog.escaped) parts.push("Freedom Seal");
  if (prog.mastery < prog.needed) {
    parts.push(`${prog.mastery}/${BOSS_MASTERY_REQUIRED} mastery clears`);
  }
  return parts.length ? `Need ${parts.join(" + ")}` : null;
}

/** Systems audited as number-only — keep math if needed, never as player goals. */
export const DEMOTED_NUMBER_PROGRESSION = [
  "xp_level",
  "skill_stats_hud",
  "wealth_rank_ladder",
  "carpet_past_fortune_flyer",
  "ritual_streak_counter",
  "weekly_challenge_percent",
  "party_seal_race_as_gate",
  "companions_as_progress",
  "economy_phase_widget",
] as const;
