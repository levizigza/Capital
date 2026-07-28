/**
 * Money Structures — Astro-style landmarks: enter the machine, each part is a world.
 * First slice: Coincraft Cove Giant Coin Jar.
 */

import { COVE_ISLAND_ID } from "./islandIds";
import { shoreXZ } from "./world3d/ledgerlight";

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
  softBeat?: "lookout";
};

export type MoneyStructureDef = {
  id: string;
  islandId: string;
  name: string;
  /** Shore hotspot label */
  exteriorLabel: string;
  icon: string;
  /** Enter verb on HUD */
  entryVerb: string;
  entryHint: string;
  /** Shore plaza position */
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
  entryVerb: "Squeeze through the coin slot",
  entryHint: "Walk into the glowing slot — the Jar opens like a toy world.",
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

const BY_ISLAND: Record<string, MoneyStructureDef> = {
  [COVE_ISLAND_ID]: COVE_COIN_JAR,
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
