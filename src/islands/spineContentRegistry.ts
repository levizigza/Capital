/**
 * Pillar 7 — Content inventory vs mural thesis.
 *
 * Law (docs/mural-thesis.md): every spine piece names organ · suit verb · cold-retell word.
 * Era side shores are live on the outer map ring (not main quest); demo Key Cove stays PARKED.
 * Harbor Arcade stays spine-only.
 */

import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";
import type { MoneyOrganId } from "./moneyOrgans";
import { organVerbChip } from "./worldMemory";
import {
  SIDE_SHORE_TRAVEL_IDS,
  SPINE_TRAVEL_IDS,
  type SideShoreTravelId,
} from "./spineArchipelago";

export type ContentLane = "spine" | "side" | "parked";

export type SpineContentKind =
  | "island"
  | "cast"
  | "structure"
  | "structure_part"
  | "quest"
  | "minigame"
  | "surface"
  | "pack";

/** One inventory row — organ · verb · cold-retell (kid word after Harbor return). */
export type SpineContentPiece = {
  id: string;
  kind: SpineContentKind;
  /** Source of truth path (repo-relative). */
  path: string;
  lane: ContentLane;
  /** null when parked — must not ship as spine mythology. */
  organ: MoneyOrganId | null;
  /** Suit / toy verb this piece teaches or rewards. */
  verb: string;
  /** One cold-retell word a kid can say. */
  coldRetell: string;
  notes?: string;
};

/** Still parked off live loader / map — demo Key Cove only. */
export const PARKED_ISLAND_IDS = ["starter_key_cove"] as const;

export type ParkedIslandId = (typeof PARKED_ISLAND_IDS)[number];

/** Eager-glob paths excluded from live `loadIslandsContent` (demo only). */
export const PARKED_CONTENT_PACK_PATHS = new Set(["./demo.islands.json"]);

/** Capital framing for restored era side shores (map + music, not main strip). */
export const SIDE_SHORE_CONTENT: Record<
  SideShoreTravelId,
  { organ: MoneyOrganId; verb: string; coldRetell: string; notes: string }
> = {
  signal_city: {
    organ: "memory",
    verb: "Listen",
    coldRetell: "Memory",
    notes: "Biopunk signal gardens — cue solarpunk_cove",
  },
  venture_foundry: {
    organ: "clock",
    verb: "Build",
    coldRetell: "Clock",
    notes: "Neon foundry pitches — cue neon_sprawl",
  },
  financial_assets: {
    organ: "coin",
    verb: "Trade",
    coldRetell: "Coin",
    notes: "Scrap-coast markets — cue scrap_coast",
  },
  digital_assets: {
    organ: "clock",
    verb: "Scan",
    coldRetell: "Clock",
    notes: "AI undercity ledgers — cue ai_undercity",
  },
  business_assets: {
    organ: "clock",
    verb: "Run",
    coldRetell: "Clock",
    notes: "Orbital keep ops — cue orbital_keep",
  },
  intangibles: {
    organ: "spiral",
    verb: "Name",
    coldRetell: "Spiral",
    notes: "Nocturne void brands — cue nocturne_void",
  },
  future_shores: {
    organ: "memory",
    verb: "Imagine",
    coldRetell: "Memory",
    notes: "Solarpunk horizon — cue solarpunk_cove",
  },
  real_estate: {
    organ: "coin",
    verb: "Place",
    coldRetell: "Coin",
    notes: "Orbital keep lots — cue orbital_keep",
  },
};

export function isParkedIslandId(id: string | null | undefined): boolean {
  return Boolean(id && (PARKED_ISLAND_IDS as readonly string[]).includes(id));
}

export function isSpineContentIslandId(id: string | null | undefined): boolean {
  return Boolean(id && (SPINE_TRAVEL_IDS as readonly string[]).includes(id));
}

export function isSideShoreContentIslandId(id: string | null | undefined): boolean {
  return Boolean(id && (SIDE_SHORE_TRAVEL_IDS as readonly string[]).includes(id));
}

/**
 * Digression minigames still defined on spine island JSON (schema / board toys)
 * but parked out of Harbor Arcade so the live catalog stays organ-pure.
 */
export const PARKED_MINIGAME_IDS = [
  "mg_news_shocks",
  "mg_compound_snowball",
  "mg_pasaran_market",
  "mg_mancala_compound",
  "mg_life_fork",
  /** Credit leftover — Paycheck-shaped categorize; replaced by Score Scanner on Anvil */
  "mg_ck_budget_balancer",
] as const;

export type ParkedMinigameId = (typeof PARKED_MINIGAME_IDS)[number];

export function isParkedMinigameId(id: string | null | undefined): boolean {
  return Boolean(id && (PARKED_MINIGAME_IDS as readonly string[]).includes(id));
}

/**
 * Spine inventory — Harbor cast + Piggy + Coin Bag; Cove / Paycheck / Credit;
 * Structure parts + toys; Outfitter / carpet / share card.
 */
export const SPINE_CONTENT_REGISTRY: SpineContentPiece[] = [
  // —— Organs / islands ——
  {
    id: HARBOR_HAVEN_ID,
    kind: "island",
    path: "src/islands/content/harbor-haven.islands.json",
    lane: "spine",
    organ: "memory",
    verb: "Remember",
    coldRetell: "Memory",
    notes: "Castle Grounds · Plinth proof",
  },
  {
    id: COVE_ISLAND_ID,
    kind: "island",
    path: "src/islands/content/coincraft-cove.islands.json",
    lane: "spine",
    organ: "coin",
    verb: "Hold",
    coldRetell: "Coin",
  },
  {
    id: PAYCHECK_PENINSULA_ID,
    kind: "island",
    path: "src/islands/content/paycheck-peninsula.islands.json",
    lane: "spine",
    organ: "clock",
    verb: "Earn",
    coldRetell: "Clock",
    notes: "Player name must be Paycheck Peninsula — not Dotgraph",
  },
  {
    id: CREDIT_KINGDOM_ID,
    kind: "island",
    path: "src/islands/content/credit-kingdom.islands.json",
    lane: "spine",
    organ: "spiral",
    verb: "Borrow",
    coldRetell: "Spiral",
  },

  // —— Harbor cast + buddies ——
  {
    id: "piggy_penny",
    kind: "cast",
    path: "src/islands/moneyCast.ts",
    lane: "spine",
    organ: "memory",
    verb: "Talk",
    coldRetell: "Memory",
    notes: "Harbor Keeper — owns first meet + homecoming",
  },
  {
    id: "baggy_bucks",
    kind: "cast",
    path: "src/islands/story/coinBagBuddy.ts",
    lane: "spine",
    organ: "memory",
    verb: "Walk",
    coldRetell: "Memory",
    notes: "Coin Bag — next verb pointer",
  },
  {
    id: "series_leads_terrace",
    kind: "cast",
    path: "src/islands/moneyCast.ts",
    lane: "spine",
    organ: "memory",
    verb: "Return",
    coldRetell: "Memory",
    notes: "Tip hats only — never steal Piggy verbs",
  },
  {
    id: "debt_collector",
    kind: "cast",
    path: "src/islands/moneyCast.ts",
    lane: "spine",
    organ: "spiral",
    verb: "Withstand",
    coldRetell: "Spiral",
    notes: "Credit Ordeal villain — never Harbor terrace",
  },

  // —— Money Structures ——
  {
    id: "cove_coin_jar",
    kind: "structure",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "coin",
    verb: "Take",
    coldRetell: "Coin",
  },
  {
    id: "cork_vault",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "coin",
    verb: "Hold",
    coldRetell: "Coin",
  },
  {
    id: "coin_spring",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "coin",
    verb: "Take",
    coldRetell: "Coin",
  },
  {
    id: "lid_lookout",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "coin",
    verb: "Hush",
    coldRetell: "Coin",
  },
  {
    id: "harbor_ledger_bank",
    kind: "structure",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "memory",
    verb: "Remember",
    coldRetell: "Memory",
  },
  {
    id: "vault_safe",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "memory",
    verb: "Hold",
    coldRetell: "Memory",
  },
  {
    id: "stamp_press",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "memory",
    verb: "Stamp",
    coldRetell: "Memory",
  },
  {
    id: "teller_window",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "memory",
    verb: "Talk",
    coldRetell: "Memory",
  },
  {
    id: "paycheck_payroll_tower",
    kind: "structure",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "clock",
    verb: "Earn",
    coldRetell: "Clock",
  },
  {
    id: "budget_press",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "clock",
    verb: "Stamp",
    coldRetell: "Clock",
  },
  {
    id: "time_clock",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "clock",
    verb: "Earn",
    coldRetell: "Clock",
  },
  {
    id: "umbrella_loft",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "clock",
    verb: "Shelter",
    coldRetell: "Clock",
  },
  {
    id: "credit_interest_keep",
    kind: "structure",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "spiral",
    verb: "Borrow",
    coldRetell: "Spiral",
  },
  {
    id: "debt_anvil",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "spiral",
    verb: "Weigh",
    coldRetell: "Spiral",
  },
  {
    id: "dispatch_hatch",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "spiral",
    verb: "Borrow",
    coldRetell: "Spiral",
  },
  {
    id: "score_battlement",
    kind: "structure_part",
    path: "src/islands/moneyStructures.ts",
    lane: "spine",
    organ: "spiral",
    verb: "Withstand",
    coldRetell: "Spiral",
  },

  // —— Chapter Takes (main quests) ——
  {
    id: "q_cc_save_or_spend",
    kind: "quest",
    path: "src/islands/content/coincraft-cove.islands.json",
    lane: "spine",
    organ: "coin",
    verb: "Take",
    coldRetell: "Coin",
    notes: "Jar before treat / Treat before jar",
  },
  {
    id: "q_pp_rainy_day",
    kind: "quest",
    path: "src/islands/content/paycheck-peninsula.islands.json",
    lane: "spine",
    organ: "clock",
    verb: "Shelter",
    coldRetell: "Clock",
    notes: "Umbrella before glitter / Glitter ate the umbrella",
  },
  {
    id: "q_ck_first_recovery",
    kind: "quest",
    path: "src/islands/content/credit-kingdom.islands.json",
    lane: "spine",
    organ: "spiral",
    verb: "Withstand",
    coldRetell: "Spiral",
    notes: "Waited the spiral / Haste fed the spiral",
  },

  // —— Signature minigames on spine ——
  {
    id: "mg_coin_sort",
    kind: "minigame",
    path: "src/islands/content/coincraft-cove.islands.json",
    lane: "spine",
    organ: "coin",
    verb: "Hold",
    coldRetell: "Coin",
    notes: "First Coins quest — denomination hold",
  },
  {
    id: "mg_coin_catcher",
    kind: "minigame",
    path: "src/islands/content/coincraft-cove.islands.json",
    lane: "spine",
    organ: "coin",
    verb: "Take",
    coldRetell: "Coin",
  },
  {
    id: "mg_harbor_safe_memory",
    kind: "minigame",
    path: "src/islands/content/harbor-haven.islands.json",
    lane: "spine",
    organ: "memory",
    verb: "Hold",
    coldRetell: "Memory",
  },
  {
    id: "mg_harbor_ledger_mail",
    kind: "minigame",
    path: "src/islands/content/harbor-haven.islands.json",
    lane: "spine",
    organ: "memory",
    verb: "Stamp",
    coldRetell: "Memory",
  },
  {
    id: "mg_treasure_vault",
    kind: "minigame",
    path: "src/islands/content/coincraft-cove.islands.json",
    lane: "spine",
    organ: "coin",
    verb: "Hold",
    coldRetell: "Coin",
  },
  {
    id: "mg_budget_split",
    kind: "minigame",
    path: "src/islands/content/paycheck-peninsula.islands.json",
    lane: "spine",
    organ: "clock",
    verb: "Stamp",
    coldRetell: "Clock",
  },
  {
    id: "mg_inbox_storm",
    kind: "minigame",
    path: "src/islands/content/paycheck-peninsula.islands.json",
    lane: "spine",
    organ: "clock",
    verb: "Earn",
    coldRetell: "Clock",
  },
  {
    id: "mg_ck_signal",
    kind: "minigame",
    path: "src/islands/content/credit-kingdom.islands.json",
    lane: "spine",
    organ: "spiral",
    verb: "Weigh",
    coldRetell: "Spiral",
  },
  {
    id: "mg_ck_inbox_credit",
    kind: "minigame",
    path: "src/islands/content/credit-kingdom.islands.json",
    lane: "spine",
    organ: "spiral",
    verb: "Borrow",
    coldRetell: "Spiral",
  },

  // —— Surfaces in craft-plan scope ——
  {
    id: "outfitter",
    kind: "surface",
    path: "src/islands/world3d/OutfitterStudioOverlay.tsx",
    lane: "spine",
    organ: "memory",
    verb: "Walk",
    coldRetell: "Memory",
    notes: "Become YOU — Castle Grounds verb",
  },
  {
    id: "money_carpet",
    kind: "surface",
    path: "src/islands/world3d/CarpetFlightView.tsx",
    lane: "spine",
    organ: "memory",
    verb: "Return",
    coldRetell: "Memory",
  },
  {
    id: "harbor_felt_share",
    kind: "surface",
    path: "src/islands/views/HarborFeltShareOverlay.tsx",
    lane: "spine",
    organ: "memory",
    verb: "Remember",
    coldRetell: "Memory",
    notes: "PNG carries organ word from scar",
  },
  {
    id: "memory_plinth",
    kind: "surface",
    path: "src/islands/harborIcon.ts",
    lane: "spine",
    organ: "memory",
    verb: "Remember",
    coldRetell: "Memory",
  },

  // —— Era side shores (live on outer map ring; not main-strip chips) ——
  ...SIDE_SHORE_TRAVEL_IDS.map((id): SpineContentPiece => {
    const meta = SIDE_SHORE_CONTENT[id];
    return {
      id,
      kind: "island",
      path: `src/islands/content/${id.replace(/_/g, "-")}.islands.json`,
      lane: "side",
      organ: meta.organ,
      verb: meta.verb,
      coldRetell: meta.coldRetell,
      notes: meta.notes,
    };
  }),

  // —— Parked demo pack ——
  ...PARKED_ISLAND_IDS.map((id): SpineContentPiece => ({
    id,
    kind: "pack",
    path: "src/islands/content/demo.islands.json",
    lane: "parked",
    organ: null,
    verb: "—",
    coldRetell: "—",
    notes: "Demo Key Cove — stays off Fortune Archipelago map",
  })),

  // —— Parked digression minigames (JSON may remain; Arcade must not lead with them) ——
  ...PARKED_MINIGAME_IDS.map(
    (id): SpineContentPiece => ({
      id,
      kind: "minigame",
      path:
        id.startsWith("mg_ck_")
          ? "src/islands/content/credit-kingdom.islands.json"
          : "src/islands/content/coincraft-cove.islands.json",
      lane: "parked",
      organ: null,
      verb: "—",
      coldRetell: "—",
      notes: "Digression / leftover — parked from Arcade; not organ-primary spine",
    }),
  ),
];

export function spineRegistryPieces(lane?: ContentLane): SpineContentPiece[] {
  if (!lane) return SPINE_CONTENT_REGISTRY;
  return SPINE_CONTENT_REGISTRY.filter((p) => p.lane === lane);
}

/** Spine + side rows must carry organ · verb · cold-retell; parked rows must not pretend to. */
export function assertRegistryMuralLaw(pieces = SPINE_CONTENT_REGISTRY): string[] {
  const errors: string[] = [];
  for (const p of pieces) {
    if (p.lane === "spine" || p.lane === "side") {
      if (!p.organ) errors.push(`${p.id}: ${p.lane} piece missing organ`);
      if (!p.verb || p.verb === "—") errors.push(`${p.id}: ${p.lane} piece missing verb`);
      if (!p.coldRetell || p.coldRetell === "—") {
        errors.push(`${p.id}: ${p.lane} piece missing cold-retell word`);
      }
    } else if (p.organ != null) {
      errors.push(`${p.id}: parked piece must not claim an organ`);
    }
  }
  return errors;
}

/** Side-shore 3D title subtitle — organ · verb (not genre city copy). */
export function sideShoreHudLine(islandId: string): string | null {
  if (!isSideShoreContentIslandId(islandId)) return null;
  const meta = SIDE_SHORE_CONTENT[islandId as SideShoreTravelId];
  return `${organVerbChip(meta.organ)} — ${meta.verb} on this shore`;
}
