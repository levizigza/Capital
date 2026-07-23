/**
 * Adaptive Coach — practical offline “AI” for Coin Bag tips.
 *
 * Weighted logistic-style scoring over save signals (fails, skills, cashflow,
 * learning profile). Not a neural net — honest heuristics that feel smart.
 */

import type { CoinBagBuddyTip } from "../story/coinBagBuddy";
import type { IslandSaveV1 } from "../types";
import type { LearningProfileId } from "../learningProfile";
import { PROFILES, loadLearningProfile } from "../learningProfile";
import { createDefaultSkillStats } from "../skillStats";
import { ensureLedger, netCashflow } from "../voyagerLedger";
import { getQuestFailedAttempts } from "../settings";
import { tickWorldDirector, lowestSkillFocus } from "./worldDirector";
import { WB, worldBlackboard } from "./worldBlackboard";
import type { EcosystemMotionMode } from "../islandCulture";

export type AdaptiveCoachContext = {
  save: IslandSaveV1;
  profileId?: LearningProfileId;
  idleSeconds?: number;
  ecosystemMotion?: EcosystemMotionMode | null;
  guidedActive?: boolean;
  /** When true, keep structural tips (near store / tutorial) and only enrich coach line */
  structuralTip?: CoinBagBuddyTip | null;
};

type ScoredNudge = {
  id: string;
  score: number;
  tip: CoinBagBuddyTip;
};

function totalFailPressure(save: IslandSaveV1): number {
  const ids = Object.keys(save.questStatus ?? {});
  let sum = 0;
  for (const qid of ids) sum += getQuestFailedAttempts(qid);
  // Cap so one disaster quest doesn't drown everything
  return Math.min(8, sum);
}

function scoreNudges(ctx: AdaptiveCoachContext): ScoredNudge[] {
  const profileId = ctx.profileId ?? loadLearningProfile();
  const profile = PROFILES[profileId];
  const skills = ctx.save.skillStats ?? createDefaultSkillStats();
  const ledger = ensureLedger(ctx.save.voyagerLedger);
  const cashflow = netCashflow(ledger);
  const fails = totalFailPressure(ctx.save);
  const focus = lowestSkillFocus(skills.current);
  const hintBias = profile.hintFrequency; // 0–2

  const director = tickWorldDirector({
    idleSeconds: ctx.idleSeconds ?? 0,
    failPressure: fails,
    cashflow,
    lowestSkill: focus,
    ecosystemMotion: ctx.ecosystemMotion,
    guidedActive: ctx.guidedActive,
  });

  const nudges: ScoredNudge[] = [];

  // Soft-lock from director
  if (director.softlockNudge) {
    nudges.push({
      id: "softlock",
      score: 9 + hintBias,
      tip: {
        tip: "Need a nudge? Door, local, or dock",
        coach: director.softlockNudge,
      },
    });
  }

  if (director.adaptiveFocus === "stuck" || fails >= 2) {
    nudges.push({
      id: "stuck",
      score: 8 + fails * 0.4 + hintBias,
      tip: {
        tip: "Slow down — try a smaller step",
        coach:
          hintBias >= 2
            ? "I’m Coin Bag. Skip hard minigames once, talk to a local, or open Practice."
            : "Failures teach. Re-read the quest tip, then one clean attempt.",
      },
    });
  }

  if (director.adaptiveFocus === "cashflow" || cashflow < 12) {
    nudges.push({
      id: "cashflow",
      score: 6 + (cashflow < 5 ? 2 : 0) + hintBias * 0.5,
      tip: {
        tip: "Grow monthly cashflow",
        coach: `Ledger net ≈ ${Math.round(cashflow)}. Pay Day streaks beat pouch luck — hunt deals, cut liabilities.`,
      },
    });
  }

  if (director.adaptiveFocus === "resilience") {
    nudges.push({
      id: "resilience",
      score: 5.5 + hintBias * 0.3,
      tip: {
        tip: "Build a buffer habit",
        coach: "Resilience is low — keep an emergency pouch before big spends.",
      },
    });
  }
  if (director.adaptiveFocus === "discipline") {
    nudges.push({
      id: "discipline",
      score: 5.5 + hintBias * 0.3,
      tip: {
        tip: "Stick the budget once",
        coach: "Discipline is soft — pay the bill in full when you can; skip the impulse stall.",
      },
    });
  }
  if (director.adaptiveFocus === "foresight") {
    nudges.push({
      id: "foresight",
      score: 5.5 + hintBias * 0.3,
      tip: {
        tip: "Plan one step ahead",
        coach: "Foresight needs reps — check the next quest reward before you spend.",
      },
    });
  }

  if (director.adaptiveFocus === "explore") {
    nudges.push({
      id: "explore",
      score: 3 + hintBias,
      tip: {
        tip: "Wander with purpose",
        coach: "I’m pointing the next good beat — shop, talk, or sail when you’re ready.",
      },
    });
  }

  // Strategists get quieter adaptive tips unless pressure is real
  if (hintBias === 0) {
    for (const n of nudges) {
      if (n.id !== "softlock" && n.id !== "stuck") n.score *= 0.55;
    }
  }

  return nudges.sort((a, b) => b.score - a.score);
}

/**
 * Merge adaptive coaching with a structural tip (tutorial / near door).
 * Structural always wins the short tip line; adaptive may enrich coach copy.
 */
export function resolveAdaptiveBuddyTip(ctx: AdaptiveCoachContext): CoinBagBuddyTip {
  const structural = ctx.structuralTip;
  const ranked = scoreNudges(ctx);
  const best = ranked[0];

  if (structural) {
    // Near store / tutorial / homecoming — keep the verb; optionally append coach wisdom
    if (best && best.score >= 7 && best.id === "stuck") {
      return {
        ...structural,
        coach: `${structural.coach ?? structural.tip} · ${best.tip.coach}`,
      };
    }
    return structural;
  }

  if (best && best.score >= 4.5) {
    worldBlackboard.set(WB.coachTip, best.tip.tip);
    worldBlackboard.set(WB.coachCoach, best.tip.coach ?? "");
    return best.tip;
  }

  return {
    tip: "I’m with you — next good step",
    coach: "Talk, shop, practice, or sail. I’ll adapt when you struggle.",
  };
}

/** Total fail pressure helper for HUD / director */
export function getFailPressure(save: IslandSaveV1): number {
  return totalFailPressure(save);
}
