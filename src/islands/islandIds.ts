/**
 * Hub vs chapter island IDs.
 * Harbor Haven (3D plaza) ≠ Coincraft Cove (Island 1 Story Circle).
 * Legacy saves used coincraft_cove as the hub — migrate on load only.
 */

export const HARBOR_HAVEN_ID = "harbor_haven";
/** Pre-v34 hub id — Cove is now Island 1, not the hub. */
export const LEGACY_HUB_ISLAND_ID = "coincraft_cove";
export const COVE_ISLAND_ID = "coincraft_cove";
/** Island 2 — unlocked after Cove save/spend chapter */
export const PAYCHECK_PENINSULA_ID = "paycheck_peninsula";
/** Cove “Take” quest that triggers Harbor Return/Change */
export const COVE_CHANGE_QUEST_ID = "q_cc_save_or_spend";

export const HUB_ISLAND_ID = HARBOR_HAVEN_ID;

/** True only for the live Harbor plaza — never treat Cove as hub at runtime. */
export function isHubIslandId(id: string | null | undefined): boolean {
  return id === HARBOR_HAVEN_ID;
}

/** True if this id was ever used as the hub (Harbor or legacy Cove-as-hub). */
export function isLegacyOrCurrentHubId(id: string | null | undefined): boolean {
  return id === HARBOR_HAVEN_ID || id === LEGACY_HUB_ISLAND_ID;
}
