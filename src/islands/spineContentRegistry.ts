/**
 * Pillar 7 — Content inventory vs mural thesis.
 *
 * Law (docs/mural-thesis.md): every spine piece names organ · suit verb · cold-retell word.
 * Orphan islands / genre-city packs stay on disk but are PARKED — not live in Arcade / enter.
 */

import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";
import type { MoneyOrganId } from "./moneyOrgans";
import { SPINE_TRAVEL_IDS } from "./spineArchipelago";

export type ContentLane = "spine" | "parked";

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

/** Genre / asset / demo islands — loadable JSON may remain; live path must not. */
export const PARKED_ISLAND_IDS = [
  "signal_city",
  "venture_foundry",
  "financial_assets",
  "digital_assets",
  "business_assets",
  "intangibles",
  "future_shores",
  "real_estate",
  "starter_key_cove",
] as const;

export type ParkedIslandId = (typeof PARKED_ISLAND_IDS)[number];

/** Eager-glob paths excluded from live `loadIslandsContent` (plus parked island filter). */
export const PARKED_CONTENT_PACK_PATHS = new Set([
  "./demo.islands.json",
  "./signal-city.islands.json",
  "./venture-foundry.islands.json",
  "./financial-assets.islands.json",
  "./digital-assets.islands.json",
  "./business-assets.islands.json",
  "./intangibles.islands.json",
  "./future-shores.islands.json",
  "./real-estate.islands.json",
]);

export function isParkedIslandId(id: string | null | undefined): boolean {
  return Boolean(id && (PARKED_ISLAND_IDS as readonly string[]).includes(id));
}

export function isSpineContentIslandId(id: string | null | undefined): boolean {
  return Boolean(id && (SPINE_TRAVEL_IDS as readonly string[]).includes(id));
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
    id: "mg_coin_catcher",
    kind: "minigame",
    path: "src/islands/content/coincraft-cove.islands.json",
    lane: "spine",
    organ: "coin",
    verb: "Take",
    coldRetell: "Coin",
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

  // —— Parked orphan packs (genre / asset / demo) ——
  ...PARKED_ISLAND_IDS.map((id): SpineContentPiece => {
    const packPath =
      id === "starter_key_cove"
        ? "src/islands/content/demo.islands.json"
        : `src/islands/content/${id.replace(/_/g, "-")}.islands.json`;
    return {
      id,
      kind: "pack",
      path: packPath,
      lane: "parked",
      organ: null,
      verb: "—",
      coldRetell: "—",
      notes: "Off Cove→Paycheck→Credit+Harbor spine — parked for Pillar 7",
    };
  }),
];

export function spineRegistryPieces(lane?: ContentLane): SpineContentPiece[] {
  if (!lane) return SPINE_CONTENT_REGISTRY;
  return SPINE_CONTENT_REGISTRY.filter((p) => p.lane === lane);
}

/** Spine rows must carry organ · verb · cold-retell; parked rows must not pretend to. */
export function assertRegistryMuralLaw(pieces = SPINE_CONTENT_REGISTRY): string[] {
  const errors: string[] = [];
  for (const p of pieces) {
    if (p.lane === "spine") {
      if (!p.organ) errors.push(`${p.id}: spine piece missing organ`);
      if (!p.verb || p.verb === "—") errors.push(`${p.id}: spine piece missing verb`);
      if (!p.coldRetell || p.coldRetell === "—") {
        errors.push(`${p.id}: spine piece missing cold-retell word`);
      }
    } else if (p.organ != null) {
      errors.push(`${p.id}: parked piece must not claim an organ`);
    }
  }
  return errors;
}
