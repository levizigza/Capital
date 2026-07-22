/**
 * Board economy modes — keep Harbor grind, era cashflow, and party boards coherent.
 *
 * Rules:
 * - Harbor (coincraft_cove) alone tracks Harbor escape streak.
 * - Era islands with minigames share the Voyager Ledger cashflow loop,
 *   but never unlock Harbor escape.
 * - capital-default / empty islands stay on classic party spaces.
 */

import type { AnimationStyleId } from "./animationStyles";
import { getAnimationStyle } from "./animationStyles";
import type { IslandDefinition } from "./types";
import { getIslandTheme } from "./themes/islandThemes";
import { HUB_ISLAND_ID } from "./worldMapLayout";

export type BoardEconomyMode = "harbor_cashflow" | "era_cashflow" | "party";

/** Space kinds used in board patterns (mirrors partyBoard.BoardSpaceType cashflow subset + party). */
export type BoardPatternKind =
  | "minigame"
  | "bill"
  | "deal"
  | "payday"
  | "liability"
  | "seal"
  | "capsule"
  | "collector"
  | "event"
  | "coins"
  | "bank"
  | "lucky"
  | "raid";

export function getBoardEconomyMode(island: IslandDefinition): BoardEconomyMode {
  if (island.id === HUB_ISLAND_ID) return "harbor_cashflow";

  const theme = getIslandTheme(island.id, island.themeId);
  const style = getAnimationStyle(theme.animationStyle);
  if (style.id === "capital-default") return "party";
  if ((island.minigames?.length ?? 0) === 0) return "party";
  return "era_cashflow";
}

export function tracksHarborEscape(mode: BoardEconomyMode): boolean {
  return mode === "harbor_cashflow";
}

export function usesCashflowPassStart(mode: BoardEconomyMode): boolean {
  return mode === "harbor_cashflow" || mode === "era_cashflow";
}

/** Shared cashflow grind loop (Harbor + eras). */
export const CASHFLOW_SPACE_PATTERN: BoardPatternKind[] = [
  "minigame",
  "bill",
  "deal",
  "minigame",
  "payday",
  "liability",
  "minigame",
  "bill",
  "seal",
  "deal",
  "minigame",
  "collector",
  "payday",
  "capsule",
  "event",
];

/** Classic party loop for non-era / empty islands. */
export const PARTY_SPACE_PATTERN: BoardPatternKind[] = [
  "minigame",
  "coins",
  "capsule",
  "minigame",
  "bank",
  "lucky",
  "minigame",
  "raid",
  "seal",
  "event",
  "minigame",
  "collector",
  "coins",
  "capsule",
  "event",
];

export type SpaceFlavor = {
  startLabel: string;
  startIcon: string;
  startEvent: string;
  paydayLabel: string;
  paydayIcon: string;
  paydayEvent: string;
  billLabel: string;
  billEvent: string;
  dealLabel: string;
  dealEvent: string;
  liabilityLabel: string;
  liabilityEvent: string;
};

const HARBOR_FLAVOR: SpaceFlavor = {
  startLabel: "Pay Day",
  startIcon: "💵",
  startEvent: "Pass Pay Day to collect your monthly cashflow (income − expenses)!",
  paydayLabel: "Pay Day",
  paydayIcon: "💵",
  paydayEvent: "Monthly cashflow hits your pouch (income − expenses).",
  billLabel: "Bills",
  billEvent: "A living cost comes due — pay from your pouch.",
  dealLabel: "Deal",
  dealEvent: "A small income asset opportunity appears!",
  liabilityLabel: "Debt Trap",
  liabilityEvent: "A liability tries to latch onto your ledger.",
};

const ERA_FLAVORS: Partial<Record<AnimationStyleId, SpaceFlavor>> = {
  "era-1960s": {
    startLabel: "SCORE",
    startIcon: "⬜",
    startEvent: "Pass SCORE to plot this month’s cashflow onto the vector graph!",
    paydayLabel: "SCORE",
    paydayIcon: "⬜",
    paydayEvent: "Vector SCORE updates — income minus expenses plotted as dots.",
    billLabel: "Dot Tax",
    billEvent: "A dashed tax line deducts from your pouch.",
    dealLabel: "Plot Deal",
    dealEvent: "Connect a new income line on the savings graph!",
    liabilityLabel: "Noise Spike",
    liabilityEvent: "Oscilloscope noise — a liability blip hits your ledger.",
  },
  "era-1970s": {
    startLabel: "FUEL",
    startIcon: "🟢",
    startEvent: "Pass FUEL to top up cashflow for the phosphor skiff!",
    paydayLabel: "FUEL",
    paydayIcon: "🟢",
    paydayEvent: "Cashflow fuel credited — keep the wireframe skiff alight.",
    billLabel: "Spike Bill",
    billEvent: "An inflation spike drains pouch fuel.",
    dealLabel: "Beacon Deal",
    dealEvent: "A green beacon offers recurring income fuel.",
    liabilityLabel: "Drain Trap",
    liabilityEvent: "A drain circuit attaches — monthly fuel loss.",
  },
  "era-1980s": {
    startLabel: "STAGE",
    startIcon: "🌆",
    startEvent: "Pass STAGE to collect neon cashflow for the next lap!",
    paydayLabel: "STAGE",
    paydayIcon: "🌆",
    paydayEvent: "Stage clear payout — monthly neon cashflow hits the pouch.",
    billLabel: "Toll Gate",
    billEvent: "A neon toll gate charges your pouch.",
    dealLabel: "Power-Up Deal",
    dealEvent: "A glowing power-up adds monthly income!",
    liabilityLabel: "Debt Trap",
    liabilityEvent: "A debt trap on the grid latches onto your ledger.",
  },
  "era-1990s": {
    startLabel: "LAP",
    startIcon: "🏁",
    startEvent: "Pass LAP to bank this month’s budget cashflow!",
    paydayLabel: "LAP",
    paydayIcon: "❤️",
    paydayEvent: "Lap complete — budget cashflow fills the heart meter.",
    billLabel: "Pit Stop",
    billEvent: "Pit-stop costs come due from your pouch.",
    dealLabel: "Kart Deal",
    dealEvent: "A chunky kart franchise deal adds monthly coins!",
    liabilityLabel: "Banana Debt",
    liabilityEvent: "Banana peel debt — a liability slows your cashflow.",
  },
  "era-2000s": {
    startLabel: "Quest Pay",
    startIcon: "💎",
    startEvent: "Pass Quest Pay to collect gem-typed cashflow!",
    paydayLabel: "Quest Pay",
    paydayIcon: "💎",
    paydayEvent: "Quest reward — diversified income minus expenses.",
    billLabel: "Inn Fee",
    billEvent: "An inn fee comes due — pay from your pouch.",
    dealLabel: "Gem Deal",
    dealEvent: "A new gem type asset adds monthly income!",
    liabilityLabel: "Cursed Relic",
    liabilityEvent: "A cursed relic liability drains monthly gold.",
  },
  "era-2010s": {
    startLabel: "Resupply",
    startIcon: "🧭",
    startEvent: "Pass Resupply to settle cinematic monthly cashflow.",
    paydayLabel: "Resupply",
    paydayIcon: "🧭",
    paydayEvent: "Field resupply — net cashflow credited to the pouch.",
    billLabel: "Ration Cost",
    billEvent: "Ration costs come due in the ruins.",
    dealLabel: "Cache Deal",
    dealEvent: "A supply cache becomes a recurring income asset.",
    liabilityLabel: "Ruin Debt",
    liabilityEvent: "Ruin debt — a liability scars your ledger.",
  },
  "era-2020s": {
    startLabel: "Weather Pay",
    startIcon: "🌤️",
    startEvent: "Pass Weather Pay to settle portfolio-weather cashflow!",
    paydayLabel: "Weather Pay",
    paydayIcon: "🌤️",
    paydayEvent: "Market weather settles — monthly cashflow credited.",
    billLabel: "Storm Bill",
    billEvent: "A squall of expenses hits the pouch.",
    dealLabel: "Aurora Deal",
    dealEvent: "An aurora asset adds painterly monthly income!",
    liabilityLabel: "Fog Liability",
    liabilityEvent: "Fog liability — monthly expenses thicken.",
  },
};

export function getSpaceFlavor(
  mode: BoardEconomyMode,
  animationStyle?: AnimationStyleId | string,
): SpaceFlavor {
  if (mode === "harbor_cashflow") return HARBOR_FLAVOR;
  if (mode === "era_cashflow") {
    const style = getAnimationStyle(animationStyle);
    return ERA_FLAVORS[style.id] ?? {
      ...HARBOR_FLAVOR,
      startLabel: "Era Pay",
      startEvent: "Pass start to collect this island’s monthly cashflow!",
    };
  }
  return {
    startLabel: "Harbor",
    startIcon: "🏁",
    startEvent: "Pass Harbor to collect a small dividend (salary day)!",
    paydayLabel: "Pay Day",
    paydayIcon: "💵",
    paydayEvent: "Monthly cashflow hits your pouch.",
    billLabel: "Bills",
    billEvent: "A bill comes due.",
    dealLabel: "Deal",
    dealEvent: "A deal appears.",
    liabilityLabel: "Debt Trap",
    liabilityEvent: "A liability appears.",
  };
}
