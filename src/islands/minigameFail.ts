/**
 * Pillar 3 — goals / failure: lose with dignity, same place, clearer next verb.
 */

import { moneyOrganForIsland } from "./moneyOrgans";
import { organVerbChip } from "./worldMemory";
import {
  assistTierFromAttempts,
  escalateMasteryHint,
  escalateThresholdHint,
} from "./onboardingFailureAssist";

export type MinigameFailReason = "score_below_threshold" | "objective_not_met";

export type MinigameFailCopy = {
  eyebrow: string;
  title: string;
  body: string;
  hint: string;
  retryLabel: string;
  walkLabel: string;
  /** Organ underfoot — fail sting + informational audio */
  organId?: "coin" | "clock" | "spiral" | "memory" | null;
};

/** Spend-flavored Takes (treat / glitter) — soft-fail copy must match saver dignity. */
export type TakeFailFlavor = "spend" | "save" | null;

export function resolveMinigameFailReason(opts: {
  reportedSuccess: boolean;
  meetsThreshold: boolean;
}): MinigameFailReason {
  if (opts.reportedSuccess && !opts.meetsThreshold) return "score_below_threshold";
  return "objective_not_met";
}

/** Detect jar/treat, umbrella/glitter, or wait/haste Takes for soft-fail parity. */
export function resolveTakeFailFlavor(opts: {
  irreversibleChoices?: Record<string, { choiceId: string } | undefined> | null;
}): TakeFailFlavor {
  const choices = opts.irreversibleChoices ?? {};
  for (const key of [
    "cove_save_vs_spend",
    "paycheck_protect_vs_spend",
    "credit_borrow_vs_wait",
  ] as const) {
    const c = choices[key];
    if (!c) continue;
    if (c.choiceId === "spend" || c.choiceId === "borrow") return "spend";
    if (c.choiceId === "save" || c.choiceId === "protect" || c.choiceId === "wait") {
      return "save";
    }
  }
  return null;
}

export function minigameFailCopy(opts: {
  reason: MinigameFailReason;
  minigameName: string;
  score?: number;
  scoreThreshold?: number;
  source?: "board" | "arcade" | "dialogue" | "qa" | "structure" | null;
  /** When set, Spend Takes get the same dignity as saver — never a lecture. */
  takeFlavor?: TakeFailFlavor;
  /** Organ underfoot — fail names the living money verb */
  organId?: "coin" | "clock" | "spiral" | "memory" | null;
  /** Spine island — resolves organ when organId omitted */
  islandId?: string | null;
  minigameId?: string | null;
  /** Failed attempts so far (from getHintLevel) — drives ATTEMPT 1–4 assist */
  failedAttempts?: number;
  /** Mastery quiz miss — quiz-only retry path */
  masteryFail?: boolean;
}): MinigameFailCopy {
  const name = opts.minigameName.trim() || "this challenge";
  const tier = assistTierFromAttempts(opts.failedAttempts ?? 0);
  const thresholdLine =
    opts.reason === "score_below_threshold" && opts.scoreThreshold !== undefined
      ? `You scored ${opts.score ?? 0}. Need ${opts.scoreThreshold}+ to clear ${name}.`
      : `That run of ${name} didn’t clear the goal yet.`;

  const walkLabel =
    opts.source === "board"
      ? "Back to board"
      : opts.source === "structure"
        ? "Stay in the structure"
        : "Keep walking";

  const spendParity = opts.takeFlavor === "spend";
  const organ =
    opts.organId ??
    (opts.islandId ? moneyOrganForIsland(opts.islandId)?.id : null) ??
    null;
  const mg = (opts.minigameId ?? "").toLowerCase();

  let organHint = thresholdLine;
  if (opts.masteryFail) {
    organHint = escalateMasteryHint({ tier, minigameName: name });
  } else if (opts.reason === "score_below_threshold") {
    organHint = escalateThresholdHint({
      tier,
      score: opts.score,
      scoreThreshold: opts.scoreThreshold,
      minigameName: name,
      baseLine: thresholdLine,
    });
  } else if (organ === "spiral" || mg.includes("credit") || mg.includes("ck_")) {
    organHint = `${thresholdLine} Spiral tip: wait beats haste — read the signal once more.`;
  } else if (organ === "clock" || mg.includes("paycheck") || mg.includes("inbox")) {
    organHint = `${thresholdLine} Clock tip: shelter first — one quieter choice, then retry.`;
  } else if (organ === "coin" || mg.includes("cove") || mg.includes("coin")) {
    organHint = escalateThresholdHint({
      tier,
      score: opts.score,
      scoreThreshold: opts.scoreThreshold,
      minigameName: name,
      baseLine: `${thresholdLine} Coin tip: jar weight still waits — try the clearer path.`,
    });
  } else if (organ === "memory") {
    organHint = `${thresholdLine} Memory tip: Harbor keeps the miss too — same place, clearer try.`;
  }

  return {
    eyebrow: organ ? `Still learning · ${organVerbChip(organ)}` : "Still learning",
    title: "Not a clear — try again",
    body: spendParity
      ? "Treat-first and haste Takes still teach. A soft miss is not shame — same shore, clearer try."
      : opts.masteryFail
        ? "Money is alive here. A soft miss still teaches — Retry opens the quiz again, not the whole pad."
        : "Money is alive here. A soft miss still teaches — no shame, just another try.",
    hint: organHint,
    retryLabel: opts.masteryFail ? "Retry quiz" : "Retry",
    walkLabel,
    organId: organ ?? null,
  };
}
