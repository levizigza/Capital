/**
 * Pillar 3 — goals / failure: lose with dignity, same place, clearer next verb.
 */

import { moneyOrganForIsland } from "./moneyOrgans";
import { organVerbChip } from "./worldMemory";

export type MinigameFailReason = "score_below_threshold" | "objective_not_met";

export type MinigameFailCopy = {
  eyebrow: string;
  title: string;
  body: string;
  hint: string;
  retryLabel: string;
  walkLabel: string;
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

/** Detect jar/treat or umbrella/glitter Takes for soft-fail parity. */
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
    if (c.choiceId === "save" || c.choiceId === "protect" || c.choiceId === "wait")
      return "save";
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
  /** Spine island — organ verb on the hint so fail names living money. */
  islandId?: string | null;
}): MinigameFailCopy {
  const name = opts.minigameName.trim() || "this challenge";
  const organ = opts.islandId ? moneyOrganForIsland(opts.islandId) : undefined;
  const organLine = organ ? organVerbChip(organ.id) : null;
  const thresholdLine =
    opts.reason === "score_below_threshold" && opts.scoreThreshold !== undefined
      ? `You scored ${opts.score ?? 0}. Need ${opts.scoreThreshold}+ to clear ${name}.`
      : `That run of ${name} didn’t clear the goal yet.`;
  const hint = organLine ? `${organLine} · ${thresholdLine}` : thresholdLine;

  const walkLabel =
    opts.source === "board"
      ? "Back to board"
      : opts.source === "structure"
        ? "Stay in the structure"
        : "Keep walking";

  const spendParity = opts.takeFlavor === "spend";

  return {
    eyebrow: organLine ? `Still learning · ${organLine}` : "Still learning",
    title: "Not a clear — try again",
    body: spendParity
      ? "Treat-first Takes still teach. A soft miss is not shame — same shore, clearer try."
      : "Money is alive here. A soft miss still teaches — no shame, just another try.",
    hint,
    retryLabel: "Retry",
    walkLabel,
  };
}
