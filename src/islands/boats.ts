/**
 * Boat tiers — the more coins you earn, the bigger the vessel.
 * A homage to sailing between islands in the old Flash / Poptropica era.
 */

export type BoatTier = {
  id: string;
  minCoins: number;
  emoji: string;
  label: string;
  /** Display scale multiplier for the boat on the voyage map */
  scale: number;
};

export const BOAT_TIERS: BoatTier[] = [
  { id: "paddle", minCoins: 0, emoji: "🛶", label: "Paddle boat", scale: 0.7 },
  { id: "rowboat", minCoins: 100, emoji: "🚣", label: "Rowboat", scale: 0.85 },
  { id: "sailboat", minCoins: 500, emoji: "⛵", label: "Sailboat", scale: 1 },
  { id: "speedboat", minCoins: 2_000, emoji: "🚤", label: "Speedboat", scale: 1.15 },
  { id: "yacht", minCoins: 10_000, emoji: "🛥️", label: "Yacht", scale: 1.35 },
  { id: "mega", minCoins: 50_000, emoji: "🛳️", label: "Mega yacht", scale: 1.6 },
];

export function getBoatTier(totalCoins: number): BoatTier {
  let tier = BOAT_TIERS[0];
  for (const t of BOAT_TIERS) {
    if (totalCoins >= t.minCoins) tier = t;
  }
  return tier;
}

export function nextBoatTier(totalCoins: number): BoatTier | null {
  const idx = BOAT_TIERS.findIndex((t) => t.id === getBoatTier(totalCoins).id);
  return BOAT_TIERS[idx + 1] ?? null;
}
