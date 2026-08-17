/**
 * Onboarding failure assist — escalate ATTEMPT 1→4 without revealing optimal strategy.
 * Design: docs/ftue/FAILURE_RECOVERY.md
 */

export type FailureKind =
  | "coin_sort_threshold"
  | "mastery_quiz"
  | "earn_spend_insufficient"
  | "ashore_walk"
  | "piggy_bypass"
  | "minigame_abandon"
  | "generic_minigame";

export type AssistChannel =
  | "natural"
  | "fail_hint"
  | "bag"
  | "clear_at"
  | "toast"
  | "touch_pad"
  | "choice_subline";

/** Failed attempts so far (0 = first try still in progress). */
export function assistTierFromAttempts(failedAttempts: number): 1 | 2 | 3 | 4 {
  if (failedAttempts <= 0) return 1;
  if (failedAttempts === 1) return 2;
  if (failedAttempts === 2) return 3;
  return 4;
}

/**
 * Escalating fail-hint lines for Coin Sort / generic threshold misses.
 * Never names optimal pile order or “correct” Take.
 */
export function escalateThresholdHint(opts: {
  tier: 1 | 2 | 3 | 4;
  score?: number;
  scoreThreshold?: number;
  minigameName: string;
  baseLine: string;
}): string {
  const { tier, score, scoreThreshold, minigameName, baseLine } = opts;
  const need =
    scoreThreshold !== undefined
      ? `Need ${scoreThreshold}+ to clear ${minigameName}.`
      : `Clear ${minigameName} when ready.`;
  const scored =
    score !== undefined && scoreThreshold !== undefined
      ? `You scored ${score}. ${need}`
      : need;

  if (tier <= 1) return baseLine;
  if (tier === 2) {
    return `${scored} Watch Clear at — finish the round when you’re ready.`;
  }
  if (tier === 3) {
    return `${scored} Score grows when change matches the ask — wrong piles cost points.`;
  }
  return `${scored} Earn jobs raise the wallet · match change for pts · Finish → See result.`;
}

/** Mastery quiz miss — literacy gate, not another sort run. */
export function escalateMasteryHint(opts: {
  tier: 1 | 2 | 3 | 4;
  minigameName: string;
}): string {
  const { tier, minigameName } = opts;
  if (tier <= 1) {
    return `That run of ${minigameName} mastery didn’t clear yet. Same shore — try again.`;
  }
  if (tier === 2) {
    return `Same shore — the quiz needs every answer right. Your play-pad clear still waits.`;
  }
  if (tier === 3) {
    return `This proves why change matters — not another sort run. Read each prompt once more.`;
  }
  return `Re-read each prompt; Retry opens the quiz again — you won’t redo the whole pad.`;
}

/** EarnSpend broke spend — escalate toast text by insufficient count. */
export function escalateEarnSpendInsufficient(opts: {
  insufficientCount: number;
  wallet: number;
  cost: number;
}): string {
  const tier = assistTierFromAttempts(Math.max(0, opts.insufficientCount - 1));
  if (tier <= 1) return "Not enough money!";
  if (tier === 2) {
    return `Not enough — wallet $${opts.wallet}, needs $${opts.cost}. Jobs add $.`;
  }
  if (tier === 3) return "Earn and spend share one wallet this round — earn first.";
  return "Use an Earn job to raise the wallet, then buy when you can afford it.";
}

export function hintEscalatedPayload(opts: {
  failureKind: FailureKind;
  attempt: number;
  hintLevel: number;
  assistChannel: AssistChannel;
  questId?: string;
  minigameId?: string;
  islandId?: string;
}) {
  return {
    failureKind: opts.failureKind,
    attempt: opts.attempt,
    hintLevel: opts.hintLevel,
    assistChannel: opts.assistChannel,
    questId: opts.questId,
    minigameId: opts.minigameId,
    islandId: opts.islandId,
  };
}

export function masteryAssistQuestId(gateId: string): string {
  return `mastery:${gateId}`;
}
