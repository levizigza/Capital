/**
 * Hub vs chapter island IDs.
 * Harbor Haven (3D plaza) ≠ Coincraft Cove (Island 1 Story Circle).
 * Legacy saves used coincraft_cove as the hub — migrate on load.
 */

export const HARBOR_HAVEN_ID = "harbor_haven";
/** @deprecated Prefer HARBOR_HAVEN_ID — kept for migration / analytics aliases */
export const LEGACY_HUB_ISLAND_ID = "coincraft_cove";
export const COVE_ISLAND_ID = "coincraft_cove";
/** Island 2 — unlocked after Cove save/spend chapter */
export const PAYCHECK_PENINSULA_ID = "paycheck_peninsula";
/** Cove “Take” quest that triggers Harbor Return/Change */
export const COVE_CHANGE_QUEST_ID = "q_cc_save_or_spend";

export const HUB_ISLAND_ID = HARBOR_HAVEN_ID;

export function isHubIslandId(id: string | null | undefined): boolean {
  return id === HARBOR_HAVEN_ID || id === LEGACY_HUB_ISLAND_ID;
}

export function normalizeHubIslandId(id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  if (id === LEGACY_HUB_ISLAND_ID) return HARBOR_HAVEN_ID;
  return id;
}
