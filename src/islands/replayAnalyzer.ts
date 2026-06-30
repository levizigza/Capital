// ---------------------------------------------------------------------------
// Replay Analyzer — personalized causal explanations + highlight selection
// ---------------------------------------------------------------------------
// Analyzes a sequence of decision entries with state snapshots to generate
// cause-effect explanations that reference what the player actually did.
// Also scores entries by impact to select the 3–7 best highlights.
// ---------------------------------------------------------------------------

import type { DecisionEntry, StateSnapshot, DecisionTimeline } from "./decisionTimeline";
import type { EventEffect } from "@/content/events/types";

// ---------------------------------------------------------------------------
// Impact scoring — decides which entries are the most interesting highlights
// ---------------------------------------------------------------------------

function computeImpactScore(
  entry: DecisionEntry,
  index: number,
  allEntries: DecisionEntry[],
): number {
  let score = 0;
  const before = entry.stateBefore;
  const after = entry.stateAfter;

  if (!before || !after) return 1;

  const moneyDelta = after.money - before.money;
  const debtDelta = after.debt - before.debt;
  const scoreDelta = after.score - before.score;

  // Large monetary swings are impactful
  score += Math.min(10, Math.abs(moneyDelta) / 5);

  // Debt changes are always noteworthy
  if (debtDelta !== 0) score += 5 + Math.abs(debtDelta) / 3;

  // High-scoring decisions
  score += Math.min(6, scoreDelta / 3);

  // Close calls: expense when money was low
  if (moneyDelta < 0 && before.money < 30) score += 8;
  if (moneyDelta < 0 && before.money + moneyDelta < 5) score += 6;

  // Turning points: went from positive to zero/debt or recovered from near-zero
  if (before.money > 20 && after.money < 5) score += 10;
  if (before.money < 10 && after.money > 30) score += 8;
  if (before.debt === 0 && after.debt > 0) score += 10;
  if (before.debt > 0 && after.debt === 0) score += 9;

  // Skill changes are noteworthy
  if (entry.skillChanges && entry.skillChanges.length > 0) {
    score += entry.skillChanges.length * 2;
  }

  // First and last decisions always get a boost
  if (index === 0) score += 3;
  if (index === allEntries.length - 1) score += 3;

  return Math.max(1, score);
}

// ---------------------------------------------------------------------------
// Causal explanation generator — references actual player state
// ---------------------------------------------------------------------------

type CausalContext = {
  entry: DecisionEntry;
  index: number;
  allEntries: DecisionEntry[];
};

function generateCausalExplanation(ctx: CausalContext): string {
  const { entry, index, allEntries } = ctx;
  const before = entry.stateBefore;
  const after = entry.stateAfter;

  if (!before || !after) return entry.explanation;

  const parts: string[] = [];
  const moneyDelta = after.money - before.money;
  const debtDelta = after.debt - before.debt;

  // Reference the player's actual choice
  const chose = entry.action.chosenLabel;

  // --- Shock absorption patterns ---
  if (moneyDelta < -10 && before.money > 40) {
    parts.push(
      `You chose "${chose}" and absorbed a $${Math.abs(moneyDelta)} hit because you had $${before.money} saved up.`
    );
  } else if (moneyDelta < -10 && before.money < 20) {
    parts.push(
      `"${chose}" cost $${Math.abs(moneyDelta)} — tough when you only had $${before.money}. A bigger buffer would have softened this.`
    );
  }

  // --- Debt patterns ---
  if (debtDelta > 0 && before.debt === 0) {
    parts.push(
      `This was the decision that put you into debt ($${after.debt}). ${
        before.money < Math.abs(moneyDelta)
          ? "You didn't have enough cash to avoid it."
          : "Paying in full was an option — consider that next time."
      }`
    );
  } else if (debtDelta > 0 && before.debt > 0) {
    parts.push(
      `Debt climbed from $${before.debt} to $${after.debt}. Each time debt stacks, it gets harder to pay off.`
    );
  } else if (before.debt > 0 && after.debt < before.debt) {
    parts.push(
      `You reduced debt from $${before.debt} to $${after.debt}. Paying down debt early saves you from compounding costs.`
    );
  } else if (before.debt > 0 && after.debt === 0) {
    parts.push(
      `You cleared all your debt! That frees up future income for saving and investing.`
    );
  }

  // --- Saving / buffer patterns ---
  if (moneyDelta > 0 && after.money > before.money * 1.3) {
    parts.push(
      `You grew your cash from $${before.money} to $${after.money} — building a buffer that protects against future shocks.`
    );
  }

  // --- Close-call patterns ---
  if (moneyDelta < 0 && after.money >= 0 && after.money < 5 && before.money > 10) {
    parts.push(
      `Close call — you went from $${before.money} down to $${after.money}. One more expense could mean debt.`
    );
  }

  // --- Cross-decision cause-effect chains ---
  if (index > 0) {
    const prev = allEntries[index - 1];
    if (prev.stateAfter && entry.stateBefore) {
      // Previous saving protected against current expense
      const prevMoneyDelta = (prev.stateAfter.money) - (prev.stateBefore?.money ?? 0);
      if (prevMoneyDelta > 10 && moneyDelta < -10 && after.money > 0) {
        parts.push(
          `Your earlier decision to "${prev.action.chosenLabel}" built the buffer that helped you survive this expense.`
        );
      }
      // Previous debt made current situation worse
      if (prev.stateAfter.debt > 0 && debtDelta > 0) {
        parts.push(
          `The debt from "${prev.action.eventTitle}" compounded here — earlier debt makes each new shock worse.`
        );
      }
    }
  }

  // --- Opportunity cost of alternatives ---
  if (entry.alternatives.length > 0 && moneyDelta < -20) {
    parts.push(
      `You passed on "${entry.alternatives[0]}" — which might have cost less but had different trade-offs.`
    );
  }

  // --- Score patterns ---
  const scoreDelta = after.score - before.score;
  if (scoreDelta >= 15) {
    parts.push(
      `This was one of your highest-scoring plays (+${scoreDelta} pts).`
    );
  }

  // Fall back to the event's generic explanation if we couldn't generate anything specific
  if (parts.length === 0) {
    return entry.explanation;
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Story summary — a narrative connecting all the highlights
// ---------------------------------------------------------------------------

function generateStorySummary(highlights: DecisionEntry[]): string {
  if (highlights.length === 0) return "";

  const first = highlights[0];
  const last = highlights[highlights.length - 1];
  const startMoney = first.stateBefore?.money ?? 0;
  const endMoney = last.stateAfter?.money ?? 0;
  const endDebt = last.stateAfter?.debt ?? 0;
  const endScore = last.stateAfter?.score ?? 0;

  const moneyTrend = endMoney > startMoney
    ? `grew your cash from $${startMoney} to $${endMoney}`
    : endMoney < startMoney
      ? `spent down from $${startMoney} to $${endMoney}`
      : `kept your cash steady at $${endMoney}`;

  const debtNote = endDebt > 0
    ? ` You ended with $${endDebt} in debt — something to tackle next time.`
    : "";

  const bigMoves = highlights
    .filter((h) => (h.impactScore ?? 0) >= 8)
    .map((h) => `"${h.action.chosenLabel}" during ${h.action.eventTitle}`);

  const bigMovesNote = bigMoves.length > 0
    ? ` Key moments: ${bigMoves.slice(0, 3).join(", ")}.`
    : "";

  return `Over ${highlights.length} key decisions, you ${moneyTrend} and scored ${endScore} points.${debtNote}${bigMovesNote}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const MIN_HIGHLIGHTS = 3;
const MAX_HIGHLIGHTS = 7;

/**
 * Analyze a raw sequence of decision entries: score them, generate causal
 * explanations, select the best 3–7 highlights, and produce a story summary.
 */
export function analyzeReplay(
  rawEntries: DecisionEntry[],
): { highlights: DecisionEntry[]; storySummary: string } {
  if (rawEntries.length === 0) {
    return { highlights: [], storySummary: "" };
  }

  // Score all entries
  const scored = rawEntries.map((entry, index) => ({
    ...entry,
    impactScore: computeImpactScore(entry, index, rawEntries),
  }));

  // Generate personalized causal explanations
  const withCausal = scored.map((entry, index) => ({
    ...entry,
    causalExplanation: generateCausalExplanation({
      entry,
      index,
      allEntries: scored,
    }),
  }));

  // Select highlights: always include first and last, fill middle by impact score
  const count = Math.min(MAX_HIGHLIGHTS, Math.max(MIN_HIGHLIGHTS, withCausal.length));

  if (withCausal.length <= count) {
    return {
      highlights: withCausal,
      storySummary: generateStorySummary(withCausal),
    };
  }

  const firstEntry = withCausal[0];
  const lastEntry = withCausal[withCausal.length - 1];

  // Score-sort the middle entries and pick the top ones
  const middle = withCausal
    .slice(1, -1)
    .sort((a, b) => (b.impactScore ?? 0) - (a.impactScore ?? 0))
    .slice(0, count - 2);

  // Reassemble in chronological order
  const selected = [firstEntry, ...middle, lastEntry].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return {
    highlights: selected,
    storySummary: generateStorySummary(selected),
  };
}

/**
 * Build a state snapshot from the current game state.
 */
export function snapshotFromGameState(game: {
  money: number;
  score: number;
  turn: number;
  counters: Record<string, number>;
  flags: Record<string, boolean>;
}): StateSnapshot {
  return {
    money: game.money,
    score: game.score,
    turn: game.turn,
    debt: game.counters["debt"] ?? 0,
    counters: { ...game.counters },
    flags: { ...game.flags },
  };
}
