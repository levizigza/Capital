/**
 * Title voice — Capital brand kit for every threshold.
 * Brand → Fortune Archipelago → organ/place → diegetic verb.
 * If a string still works after deleting “Capital” and “Fortune,” rewrite it.
 */

import type { MoneyOrganId } from "./moneyOrgans";
import { MONEY_ORGANS } from "./moneyOrgans";
import type { MoneyStructureTheme } from "./moneyStructures";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";
import { FORTUNE_ARCHIPELAGO_NAME } from "./spineArchipelago";

export const CAPITAL_BRAND = "Capital";
export const MONEY_IS_ALIVE = "Money is alive";
export const MONEY_IS_ALIVE_HERE = "Money is alive here.";
export const BOARD_MONEY_CARPET = "Board the Money Carpet";
export { FORTUNE_ARCHIPELAGO_NAME };

/** Short spine chips — Harbor · Cove · Paycheck · Credit */
export function spineShortName(islandId: string | null | undefined): string {
  if (islandId === HARBOR_HAVEN_ID) return "Harbor";
  if (islandId === COVE_ISLAND_ID) return "Cove";
  if (islandId === PAYCHECK_PENINSULA_ID) return "Paycheck";
  if (islandId === CREDIT_KINGDOM_ID) return "Credit";
  return "Harbor";
}

export function capitalOrganEyebrow(organ: MoneyOrganId | null | undefined): string {
  const name = organ ? MONEY_ORGANS[organ].name : "Memory";
  return `${CAPITAL_BRAND} · ${name}`;
}

export type ArriveKind = "carpet_land" | "structure_enter" | "painting_portal";

/** WorldArriveOverlay eyebrow — never “World opening” / “Money is a machine”. */
export function arriveEyebrow(
  islandId: string,
  kind: ArriveKind,
  organId?: MoneyOrganId | null,
): string {
  if (kind === "structure_enter") {
    return capitalOrganEyebrow(organId ?? organIdForIsland(islandId));
  }
  if (islandId === HARBOR_HAVEN_ID) return `${CAPITAL_BRAND} · Harbor`;
  return FORTUNE_ARCHIPELAGO_NAME;
}

function organIdForIsland(islandId: string): MoneyOrganId {
  if (islandId === COVE_ISLAND_ID) return "coin";
  if (islandId === PAYCHECK_PENINSULA_ID) return "clock";
  if (islandId === CREDIT_KINGDOM_ID) return "spiral";
  if (islandId === HARBOR_HAVEN_ID) return "memory";
  return "memory";
}

/** Harbor load veil — myth, not a spinner. */
export const HARBOR_LOADING_HINT = `Harbor Haven · your plaza is waking up…`;
export const HARBOR_LOADING_SLOW = `${CAPITAL_BRAND} · enter anytime — Piggy is waiting`;
/** Ashore law on the veil — Talk → Carpet → Cove (Outfitter is discovery, not a gate). */
export const HARBOR_LOADING_ASHORE =
  "How to play: Talk to Piggy · Board the Money Carpet · Coincraft Cove.";
export const ENTER_HARBOR_HAVEN = "Enter Harbor Haven";

/** Carpet dock / leave / map. */
export const CARPET_DOCK_HEADLINE = BOARD_MONEY_CARPET;
export const CARPET_LAUNCH_CTA = BOARD_MONEY_CARPET;
export const CARPET_BACK_TO_HARBOR = "Harbor Haven";
export const CARPET_DOCK_FLIGHT = "Dock · Harbor";
export const LEAVE_ARCHIPELAGO = "Leave Fortune Archipelago";
export const TRAVEL_MAP_BACK = "Harbor";
export const SHORE_TO_HARBOR = "Harbor Haven";
export const SHORE_MONEY_CARPET = "Money Carpet";

/** Soft Beat / structure HUD. */
export function softBeatEyebrow(organ: MoneyOrganId): string {
  return `Quiet · ${MONEY_ORGANS[organ].name}`;
}

export function structureHudEyebrow(organ: MoneyOrganId): string {
  return capitalOrganEyebrow(organ);
}

/** Diegetic exit — out the slot / vault / chute / spiral. */
export function titleStructureExitLabel(theme: MoneyStructureTheme): string {
  if (theme === "bank") return "Close the vault";
  if (theme === "tower") return "Down the paycheck chute";
  if (theme === "keep") return "Out the interest spiral";
  return "Out the coin slot";
}

export function titleStructureReturnLabel(theme: MoneyStructureTheme): string {
  if (theme === "bank") return "Return · Memory plaza";
  if (theme === "tower") return "Return · Clock shore";
  if (theme === "keep") return "Return · Spiral shore";
  return "Return · Coin shore";
}

/** Structure near-CTA uses entryVerb when available. */
export function structureEnterCta(entryVerb: string, fallbackName: string): string {
  const v = entryVerb.trim();
  if (v.length > 0) return v;
  return `Enter · ${fallbackName}`;
}

export function structurePartCta(entryPiece: string, label: string): string {
  const piece = entryPiece.trim();
  if (piece.length > 0) return `Open · ${label}`;
  return `Open · ${label}`;
}

export const SHARE_CARD_HEADLINE = `${CAPITAL_BRAND} · Harbor felt that`;
export const SPECTACLE_FOOTER = "Plinth glowing · Money is alive";
export const DOCUMENT_TITLE = `${CAPITAL_BRAND} · ${FORTUNE_ARCHIPELAGO_NAME}`;
export const DOCUMENT_DESCRIPTION =
  "Money is alive here. Board the Money Carpet through Fortune Archipelago.";

/** Approach badge — place first, not debug morph %. */
export function carpetApproachBadge(islandName: string, decadeLabel?: string | null): {
  eyebrow: string;
  title: string;
} {
  return {
    eyebrow: `Approaching · ${islandName}`,
    title: decadeLabel ? decadeLabel : MONEY_IS_ALIVE,
  };
}
