/**
 * Progress metaphor — carpet/boat tier ONLY.
 * Wealth ranks used to duplicate boat minCoins thresholds (poor design value).
 * Canon: GAME_DESIGN_COMPLEXITY.md — merge wealth → carpet.
 */

import { BOAT_TIERS, getBoatTier, nextBoatTier, type BoatTier } from "./boats";

/** @deprecated Alias — carpet tier is the single coin-progress label. */
export type WealthRank = {
  id: string;
  min: number;
  emoji: string;
  label: string;
};

function tierAsRank(t: BoatTier): WealthRank {
  return { id: t.id, min: t.minCoins, emoji: t.emoji, label: t.label };
}

/** Same thresholds as BOAT_TIERS — one story for pouch progress. */
export const WEALTH_RANKS: WealthRank[] = BOAT_TIERS.map(tierAsRank);

export function getWealthRank(totalCoins: number): WealthRank {
  return tierAsRank(getBoatTier(totalCoins));
}

export function nextWealthRank(totalCoins: number): WealthRank | null {
  const next = nextBoatTier(totalCoins);
  return next ? tierAsRank(next) : null;
}

/** 0..1 progress from the current carpet tier toward the next one. */
export function wealthProgress(totalCoins: number): number {
  const current = getBoatTier(totalCoins);
  const next = nextBoatTier(totalCoins);
  if (!next) return 1;
  const span = next.minCoins - current.minCoins;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (totalCoins - current.minCoins) / span));
}
