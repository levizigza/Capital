/** Coincraft Cove art direction — Island #1 */

export const COINCRAFT_SKIN_CLASS = "skin-coincraft-cove";

export const COINCRAFT_ISLAND_ID = "coincraft_cove";

export type CoincraftNpcId =
  | "npc_captain_penny"
  | "npc_artisan_alma"
  | "npc_keeper_kira"
  | "npc_shelly";

export type CoincraftAreaId = "cc_harbor" | "cc_craft_market" | "cc_savings_lighthouse";

export const COINCRAFT_NPC_IDS = new Set<string>([
  "npc_captain_penny",
  "npc_artisan_alma",
  "npc_keeper_kira",
  "npc_shelly",
]);

export const COINCRAFT_AREA_IDS = new Set<string>([
  "cc_harbor",
  "cc_craft_market",
  "cc_savings_lighthouse",
]);

export function isCoincraftIsland(islandId: string | null | undefined): boolean {
  return islandId === COINCRAFT_ISLAND_ID;
}

export function getCoincraftSkinClass(islandId: string | null | undefined): string | undefined {
  return isCoincraftIsland(islandId) ? COINCRAFT_SKIN_CLASS : undefined;
}

/** When on hub/travel, use Cove skin if save points at Coincraft or no island yet (first-run). */
export function shouldUseCoincraftSkin(
  view: "home" | "travel" | "island" | "voyage" | "arcade" | "studio" | "chapter" | string,
  activeIslandId: string | null,
  savedIslandId: string | null | undefined
): boolean {
  if (view === "island" || view === "chapter") return isCoincraftIsland(activeIslandId);
  // Harbor Haven is its own hub — don't force Cove art on the plaza.
  return false;
}
