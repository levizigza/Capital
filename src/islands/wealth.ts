/**
 * Wealth ranks — you start flat broke and climb as you earn coins (points).
 * Thresholds line up with the boat tiers so the two systems tell one story:
 * the richer you get, the bigger your boat and the fancier your rank.
 */
export type WealthRank = {
  id: string;
  min: number;
  emoji: string;
  label: string;
};

export const WEALTH_RANKS: WealthRank[] = [
  { id: "broke", min: 0, emoji: "🥫", label: "Flat broke" },
  { id: "scraping", min: 100, emoji: "🪙", label: "Scraping by" },
  { id: "getting-by", min: 500, emoji: "💵", label: "Getting by" },
  { id: "comfortable", min: 2_000, emoji: "💰", label: "Comfortable" },
  { id: "well-off", min: 10_000, emoji: "🏦", label: "Well-off" },
  { id: "wealthy", min: 50_000, emoji: "💎", label: "Wealthy" },
  { id: "tycoon", min: 200_000, emoji: "👑", label: "Tycoon" },
];

export function getWealthRank(totalCoins: number): WealthRank {
  let rank = WEALTH_RANKS[0];
  for (const r of WEALTH_RANKS) {
    if (totalCoins >= r.min) rank = r;
    else break;
  }
  return rank;
}

export function nextWealthRank(totalCoins: number): WealthRank | null {
  return WEALTH_RANKS.find((r) => r.min > totalCoins) ?? null;
}

/** 0..1 progress from the current rank toward the next one. */
export function wealthProgress(totalCoins: number): number {
  const current = getWealthRank(totalCoins);
  const next = nextWealthRank(totalCoins);
  if (!next) return 1;
  const span = next.min - current.min;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (totalCoins - current.min) / span));
}
