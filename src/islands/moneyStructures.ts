/**
 * Money Structures — Astro-style landmarks: enter the machine, each part is a world.
 * Cove: Giant Coin Jar · Harbor: Ledger Bank
 */

import { COVE_ISLAND_ID, HARBOR_HAVEN_ID, PAYCHECK_PENINSULA_ID } from "./islandIds";
import { shoreXZ } from "./world3d/ledgerlight";

export type MoneyStructureTheme = "jar" | "bank";

export type MoneyStructurePart = {
  id: string;
  label: string;
  icon: string;
  /** Short line on the pad */
  blurb: string;
  /** Creative piece that opens the world (GPU / cork / spring…) */
  entryPiece: string;
  position: [number, number, number];
  /** Dive into this minigame (island content id) */
  minigameId?: string;
  /** Soft beat with no minigame dive */
  softBeat?: "lookout" | "ledger";
};

export type MoneyStructureDef = {
  id: string;
  islandId: string;
  name: string;
  /** Shore / plaza hotspot label */
  exteriorLabel: string;
  icon: string;
  theme: MoneyStructureTheme;
  /** Enter verb on HUD */
  entryVerb: string;
  entryHint: string;
  /** Transition title while entering */
  enterTransition: string;
  /** Shore / plaza position */
  shorePosition: [number, number, number];
  parts: MoneyStructurePart[];
  /** Interior exit pad */
  exitPosition: [number, number, number];
};

/** Giant Coin Jar — squeeze through the slot, play the money guts. */
export const COVE_COIN_JAR: MoneyStructureDef = {
  id: "cove_coin_jar",
  islandId: COVE_ISLAND_ID,
  name: "Giant Coin Jar",
  exteriorLabel: "Giant Coin Jar",
  icon: "🫙",
  theme: "jar",
  entryVerb: "Squeeze through the coin slot",
  entryHint: "Walk into the glowing slot — the Jar opens like a toy world.",
  enterTransition: "Squeezing through the coin slot…",
  shorePosition: shoreXZ(0, -6.5, 0),
  exitPosition: [0, 0, 8],
  parts: [
    {
      id: "cork_vault",
      label: "Cork Vault",
      icon: "🪵",
      blurb: "Pop the cork — vault rooms wait inside.",
      entryPiece: "Glowing cork stopper",
      position: [-4.2, 0, -2.5],
      minigameId: "mg_treasure_vault",
    },
    {
      id: "coin_spring",
      label: "Coin Spring",
      icon: "🌀",
      blurb: "The coil that flings coins — dive the arcade.",
      entryPiece: "Copper spring coil",
      position: [4.2, 0, -2.2],
      minigameId: "mg_coin_catcher",
    },
    {
      id: "lid_lookout",
      label: "Lid Lookout",
      icon: "👁️",
      blurb: "Climb the lid — Cove looks tiny from up here.",
      entryPiece: "Screw-top lid hatch",
      position: [0, 0, -6.2],
      softBeat: "lookout",
    },
  ],
};

/** Ledger Bank — brass vault door opens the plaza's money machine. */
export const HARBOR_LEDGER_BANK: MoneyStructureDef = {
  id: "harbor_ledger_bank",
  islandId: HARBOR_HAVEN_ID,
  name: "Ledger Bank",
  exteriorLabel: "Ledger Bank",
  icon: "🏦",
  theme: "bank",
  entryVerb: "Step through the brass vault door",
  entryHint: "The vault door swings — stamp, teller, and safe each open a world.",
  enterTransition: "Vault door swinging open…",
  shorePosition: [3.8, 0, 5.2],
  exitPosition: [0, 0, 8],
  parts: [
    {
      id: "vault_safe",
      label: "Safe Heart",
      icon: "🔐",
      blurb: "Spin the dial — the safe's rooms unfold.",
      entryPiece: "Spinning vault dial",
      position: [-4.2, 0, -2.5],
      minigameId: "mg_treasure_vault",
    },
    {
      id: "stamp_press",
      label: "Payday Stamp",
      icon: "📮",
      blurb: "The press that prints pay stubs — inbox storms inside.",
      entryPiece: "Brass stamp press",
      position: [4.2, 0, -2.2],
      minigameId: "mg_inbox_storm",
    },
    {
      id: "teller_window",
      label: "Teller Window",
      icon: "🪟",
      blurb: "Lean on the marble — Harbor's ledger hums under glass.",
      entryPiece: "Marble teller counter",
      position: [0, 0, -6.2],
      softBeat: "ledger",
    },
  ],
};

const BY_ISLAND: Record<string, MoneyStructureDef> = {
  [COVE_ISLAND_ID]: COVE_COIN_JAR,
  [HARBOR_HAVEN_ID]: HARBOR_LEDGER_BANK,
};

export function moneyStructureForIsland(islandId: string): MoneyStructureDef | null {
  return BY_ISLAND[islandId] ?? null;
}

export function moneyStructurePart(
  structure: MoneyStructureDef,
  partId: string,
): MoneyStructurePart | undefined {
  return structure.parts.find((p) => p.id === partId);
}

/** Island whose content owns a structure minigame (for cross-island launches). */
export function hostIslandForStructureMinigame(minigameId: string): string | null {
  if (minigameId.startsWith("mg_") && minigameId.includes("inbox")) return PAYCHECK_PENINSULA_ID;
  if (minigameId === "mg_treasure_vault" || minigameId === "mg_coin_catcher") return COVE_ISLAND_ID;
  if (minigameId.startsWith("mg_budget") || minigameId.startsWith("mg_price")) {
    return PAYCHECK_PENINSULA_ID;
  }
  return COVE_ISLAND_ID;
}
