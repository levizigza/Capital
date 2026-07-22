/**
 * Money Magic Carpet tiers — earn coins, upgrade your ride between islands.
 * Harbor escape unlocks at least the Fortune flyer look.
 */

import type { IslandSaveV1 } from "./types";
import { hasHarborFreedom } from "./progressGates";

export type BoatTier = {
  id: string;
  minCoins: number;
  emoji: string;
  label: string;
  /** Display scale multiplier on the voyage map */
  scale: number;
};

/** @deprecated Prefer CarpetTier alias — kept for call-site compatibility */
export type CarpetTier = BoatTier;

export const BOAT_TIERS: BoatTier[] = [
  { id: "scrap_rug", minCoins: 0, emoji: "🪄", label: "Threadbare rug", scale: 0.7 },
  { id: "coin_carpet", minCoins: 100, emoji: "✨", label: "Coin carpet", scale: 0.85 },
  { id: "fortune_flyer", minCoins: 500, emoji: "🧞", label: "Fortune flyer", scale: 1 },
  { id: "mint_magic", minCoins: 2_000, emoji: "💰", label: "Mint magic carpet", scale: 1.15 },
  { id: "vault_soar", minCoins: 10_000, emoji: "🏆", label: "Vault soarer", scale: 1.35 },
  { id: "royal_ride", minCoins: 50_000, emoji: "👑", label: "Royal money carpet", scale: 1.6 },
];

export function getBoatTier(totalCoins: number): BoatTier {
  let tier = BOAT_TIERS[0]!;
  for (const t of BOAT_TIERS) {
    if (totalCoins >= t.minCoins) tier = t;
  }
  return tier;
}

/** Carpet tier after applying Harbor freedom unlock (escape reward). */
export function getEffectiveBoatTier(totalCoins: number, save?: IslandSaveV1 | null): BoatTier {
  const base = getBoatTier(totalCoins);
  if (!save || !hasHarborFreedom(save)) return base;
  const unlocked = BOAT_TIERS.find((t) => t.id === "fortune_flyer")!;
  return base.minCoins >= unlocked.minCoins ? base : unlocked;
}

export function nextBoatTier(totalCoins: number): BoatTier | null {
  const idx = BOAT_TIERS.findIndex((t) => t.id === getBoatTier(totalCoins).id);
  return BOAT_TIERS[idx + 1] ?? null;
}
