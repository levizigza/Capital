/**
 * Pillar 3 — goals / failure: lose with dignity, same place, clearer next verb.
 */

export type MinigameFailReason = "score_below_threshold" | "objective_not_met";

export type MinigameFailCopy = {
  eyebrow: string;
  title: string;
  body: string;
  hint: string;
  retryLabel: string;
  walkLabel: string;
};

export function resolveMinigameFailReason(opts: {
  reportedSuccess: boolean;
  meetsThreshold: boolean;
}): MinigameFailReason {
  if (opts.reportedSuccess && !opts.meetsThreshold) return "score_below_threshold";
  return "objective_not_met";
}

export function minigameFailCopy(opts: {
  reason: MinigameFailReason;
  minigameName: string;
  score?: number;
  scoreThreshold?: number;
  source?: "board" | "arcade" | "dialogue" | "qa" | "structure" | null;
}): MinigameFailCopy {
  const name = opts.minigameName.trim() || "this challenge";
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

  return {
    eyebrow: "Still learning",
    title: "Not a clear — try again",
    body: "Money is alive here. A soft miss still teaches — no shame, just another try.",
    hint: thresholdLine,
    retryLabel: "Retry",
    walkLabel,
  };
}
