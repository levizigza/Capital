/**
 * Money Structures — Astro-style landmarks: enter the machine, each part is a world.
 * Cove Jar · Harbor Bank · Paycheck Payroll Tower · Credit Interest Keep
 */

import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";
import { shoreXZ } from "./world3d/ledgerlight";

export type MoneyStructureTheme = "jar" | "bank" | "tower" | "keep";

export type MoneyStructurePart = {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  entryPiece: string;
  position: [number, number, number];
  minigameId?: string;
  softBeat?: "lookout" | "ledger" | "umbrella" | "battlement";
};

export type MoneyStructureDef = {
  id: string;
  islandId: string;
  name: string;
  exteriorLabel: string;
  icon: string;
  theme: MoneyStructureTheme;
  entryVerb: string;
  entryHint: string;
  enterTransition: string;
  shorePosition: [number, number, number];
  parts: MoneyStructurePart[];
  exitPosition: [number, number, number];
};

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

/** Payroll Tower — climb the check chute into the paycheck machine. */
export const PAYCHECK_PAYROLL_TOWER: MoneyStructureDef = {
  id: "paycheck_payroll_tower",
  islandId: PAYCHECK_PENINSULA_ID,
  name: "Payroll Tower",
  exteriorLabel: "Payroll Tower",
  icon: "🏢",
  theme: "tower",
  entryVerb: "Climb the glowing paycheck chute",
  entryHint: "The chute sucks you up — clock, press, and umbrella loft each open a world.",
  enterTransition: "Riding the paycheck chute…",
  shorePosition: shoreXZ(0, -7.2, 0),
  exitPosition: [0, 0, 8],
  parts: [
    {
      id: "budget_press",
      label: "Bucket Press",
      icon: "📊",
      blurb: "Needs · Wants · Savings — the press that sorts a paycheck.",
      entryPiece: "Three-bucket stamp press",
      position: [-4.2, 0, -2.5],
      minigameId: "mg_budget_split",
    },
    {
      id: "time_clock",
      label: "Time Clock",
      icon: "🕒",
      blurb: "Punch in — the inbox storm starts on the hour.",
      entryPiece: "Neon time-clock dial",
      position: [4.2, 0, -2.2],
      minigameId: "mg_inbox_storm",
    },
    {
      id: "umbrella_loft",
      label: "Umbrella Loft",
      icon: "☂️",
      blurb: "Rainy-day loft — look out over Main Street before the surprise.",
      entryPiece: "Folded umbrella hatch",
      position: [0, 0, -6.2],
      softBeat: "umbrella",
    },
  ],
};

/** Interest Keep — spiral through the gate into Credit's storm machine. */
export const CREDIT_INTEREST_KEEP: MoneyStructureDef = {
  id: "credit_interest_keep",
  islandId: CREDIT_KINGDOM_ID,
  name: "Interest Keep",
  exteriorLabel: "Interest Keep",
  icon: "🏰",
  theme: "keep",
  entryVerb: "Spiral through the interest gate",
  entryHint: "The spiral pulls you in — anvil, dispatch, and battlement each open a world.",
  enterTransition: "Spiraling through the interest gate…",
  shorePosition: shoreXZ(0, -6.8, 0),
  exitPosition: [0, 0, 8],
  parts: [
    {
      id: "debt_anvil",
      label: "Debt Anvil",
      icon: "⚖️",
      blurb: "Hammer payments across debts before interest compounds.",
      entryPiece: "Glowing debt anvil",
      position: [-4.2, 0, -2.5],
      minigameId: "mg_ck_budget_balancer",
    },
    {
      id: "dispatch_hatch",
      label: "Dispatch Hatch",
      icon: "📨",
      blurb: "APR letters, late fees, rebuild paths — open the inbox storm.",
      entryPiece: "Rusted dispatch hatch",
      position: [4.2, 0, -2.2],
      minigameId: "mg_ck_inbox_credit",
    },
    {
      id: "score_battlement",
      label: "Score Battlement",
      icon: "📡",
      blurb: "Stand the wall — utilization vs on-time history, quiet before the storm.",
      entryPiece: "Battlement signal post",
      position: [0, 0, -6.2],
      softBeat: "battlement",
    },
  ],
};

const BY_ISLAND: Record<string, MoneyStructureDef> = {
  [COVE_ISLAND_ID]: COVE_COIN_JAR,
  [HARBOR_HAVEN_ID]: HARBOR_LEDGER_BANK,
  [PAYCHECK_PENINSULA_ID]: PAYCHECK_PAYROLL_TOWER,
  [CREDIT_KINGDOM_ID]: CREDIT_INTEREST_KEEP,
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

export function hostIslandForStructureMinigame(minigameId: string): string | null {
  if (minigameId === "mg_treasure_vault" || minigameId === "mg_coin_catcher") return COVE_ISLAND_ID;
  if (minigameId.startsWith("mg_ck_")) return CREDIT_KINGDOM_ID;
  if (
    minigameId === "mg_inbox_storm" ||
    minigameId === "mg_budget_split" ||
    minigameId.startsWith("mg_price") ||
    minigameId === "mg_treasure_hunt"
  ) {
    return PAYCHECK_PENINSULA_ID;
  }
  return COVE_ISLAND_ID;
}

export function structureExitLabel(theme: MoneyStructureTheme): string {
  if (theme === "bank") return "Exit Bank";
  if (theme === "tower") return "Exit Tower";
  if (theme === "keep") return "Exit Keep";
  return "Exit Jar";
}

export function structureReturnLabel(theme: MoneyStructureTheme): string {
  if (theme === "bank") return "Step back to Harbor";
  if (theme === "tower") return "Slide back to Peninsula";
  if (theme === "keep") return "Climb back to Credit";
  return "Squeeze back to Cove";
}
