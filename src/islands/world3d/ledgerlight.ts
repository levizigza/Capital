/**
 * Ledgerlight Atmosphere — Capital’s iconic visual identity.
 *
 * Learn from legendary worlds without copying them:
 * - Minecraft taught readable block silhouettes + biomes that feel like places
 * - Zelda BotW taught “refreshing clarity” — people must pop from the land
 * - Journey taught atmosphere as emotion (sky, light, silence)
 *
 * Capital’s own rule: Money People are the focus. Worlds are living ledgers —
 * roomy shores, ecological rhythm, and skies that change the mood of money.
 */

/** Expand cramped plazas into livable shores (~1.9× linear). */
export const SHORE_WORLD_SCALE = 1.9;

export function shoreScale(n: number): number {
  return n * SHORE_WORLD_SCALE;
}

export function shoreXZ(
  x: number,
  z: number,
  y = 0,
): [number, number, number] {
  return [x * SHORE_WORLD_SCALE, y, z * SHORE_WORLD_SCALE];
}

/** Sky drama — Capital’s signature living ceiling. */
export type SkyMode = "day" | "sunset" | "night" | "stars" | "void";

export const SKY_MODE_HINT: Record<SkyMode, string> = {
  day: "Clear ledger light — easy reading, easy walking",
  sunset: "Golden hour — warm decisions before night",
  night: "Cool dusk — stars begin, hush the plaza",
  stars: "Starfield ceiling — wire/vector eras live here",
  void: "Perpetual night — alien ledger, biolum only",
};
