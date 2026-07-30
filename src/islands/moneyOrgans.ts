/**
 * Mural thesis — Capital’s irreducible metaphor (Asobi-grade binding law).
 *
 * Astro Playroom: you are inside the PS5; worlds are console organs; bots are its people.
 * Capital: you are inside living money; islands are money organs; mascots are its temperaments.
 *
 * If a feature cannot name its organ + suit verb, it does not ship on the spine.
 */

import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";

/** The four organs of living money on the frozen triangle + Harbor. */
export type MoneyOrganId = "memory" | "coin" | "clock" | "spiral";

export type MoneyOrgan = {
  id: MoneyOrganId;
  islandId: string;
  /** One-word mural name */
  name: string;
  /** Astro parallel */
  asobiParallel: string;
  /** Player-facing metaphor */
  metaphor: string;
  /** Verb suit — introduce → develop → twist → conclude on this island */
  suit: string;
  verbs: [string, string, string];
  /** Must-feel after one cold session */
  mustFeel: string;
  /** Ground / path motif for shore craft */
  pathMotif: "coin" | "tick" | "spiral" | "ledger";
  accentHint: string;
};

export const MONEY_ORGANS: Record<MoneyOrganId, MoneyOrgan> = {
  memory: {
    id: "memory",
    islandId: HARBOR_HAVEN_ID,
    name: "Memory",
    asobiParallel: "CPU Plaza — Ordinary World hub",
    metaphor: "The Ledger — money that remembers what you did",
    suit: "Remember",
    verbs: ["Walk", "Talk", "Return"],
    mustFeel: "Home changed because of a choice you made elsewhere",
    pathMotif: "ledger",
    accentHint: "#f59e0b",
  },
  coin: {
    id: "coin",
    islandId: COVE_ISLAND_ID,
    name: "Coin",
    asobiParallel: "A themed planet with one toy suit",
    metaphor: "The Coin — saving as holding; Take as irreversible",
    suit: "Hold",
    verbs: ["Hold", "Take", "Hush"],
    mustFeel: "You took something you cannot put back — Harbor felt it",
    pathMotif: "coin",
    accentHint: "#fbbf24",
  },
  clock: {
    id: "clock",
    islandId: PAYCHECK_PENINSULA_ID,
    name: "Clock",
    asobiParallel: "A themed planet with one toy suit",
    metaphor: "The Clock — earning as timed pressure; rainy-day loft",
    suit: "Earn",
    verbs: ["Earn", "Stamp", "Shelter"],
    mustFeel: "Payday rhythm vs keeping something dry for later",
    pathMotif: "tick",
    accentHint: "#38bdf8",
  },
  spiral: {
    id: "spiral",
    islandId: CREDIT_KINGDOM_ID,
    name: "Spiral",
    asobiParallel: "A themed planet with one toy suit",
    metaphor: "The Spiral — interest as gravity; power with a price",
    suit: "Borrow",
    verbs: ["Borrow", "Weigh", "Withstand"],
    mustFeel: "Debt pulls — on-time history beats haste",
    pathMotif: "spiral",
    accentHint: "#a78bfa",
  },
};

const BY_ISLAND: Record<string, MoneyOrganId> = {
  [HARBOR_HAVEN_ID]: "memory",
  [COVE_ISLAND_ID]: "coin",
  [PAYCHECK_PENINSULA_ID]: "clock",
  [CREDIT_KINGDOM_ID]: "spiral",
};

export function moneyOrganForIsland(islandId: string | null | undefined): MoneyOrgan | null {
  if (!islandId) return null;
  const id = BY_ISLAND[islandId];
  return id ? MONEY_ORGANS[id] : null;
}

/** Spine islands only — genre side worlds are not money organs. */
export function isMoneyOrganIsland(islandId: string | null | undefined): boolean {
  return moneyOrganForIsland(islandId) != null;
}

export const MURAL_THESIS =
  "You are inside living money. Harbor remembers. Cove holds. Paycheck clocks. Credit spirals.";
