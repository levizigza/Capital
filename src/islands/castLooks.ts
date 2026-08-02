/**
 * Street Fighter–style cast select + per-character look presets.
 * Playable roster = series leads + Harbor guides + a few classic mascots.
 * The Debt Collector stays unplayable (Ordeal villain only).
 */

import {
  SERIES_LEAD_MASCOT_IDS,
  getMascot,
  isEndgameVillainMascot,
  type MoneyMascotId,
} from "./moneyCast";
import type { CapitalCharacter } from "./character";

export type CharacterLookPreset = {
  id: string;
  label: string;
  color: string;
  accessory: string;
  /** Lower-half tint id from CHARACTER_COLORS */
  pants: string;
};

/** Bodies shown on the Outfitter fighter-select grid (ordered). */
export const PLAYABLE_SELECT_CAST: readonly MoneyMascotId[] = [
  ...SERIES_LEAD_MASCOT_IDS,
  "piggy_penny",
  "dollar_dash",
  "coiny",
  "budget_bot",
  "vault_vince",
  "goldie_bar",
  "baggy_bucks",
] as const;

export function isPlayableSelectCast(id: string | null | undefined): boolean {
  return Boolean(id && (PLAYABLE_SELECT_CAST as readonly string[]).includes(id));
}

const CLASSIC_LOOKS: CharacterLookPreset[] = [
  { id: "sheet", label: "Classic", color: "seafoam", accessory: "none", pants: "ink" },
  { id: "bright", label: "Bright tide", color: "tide", accessory: "cap", pants: "seafoam" },
  { id: "night", label: "Night ledger", color: "ink", accessory: "cape", pants: "ink" },
];

/** Alternate outfits per playable body — sheet look first. */
export const LOOK_PRESETS_BY_BASE: Record<string, CharacterLookPreset[]> = {
  cashwell: [
    { id: "sheet", label: "Sheet classic", color: "cashwell", accessory: "cap", pants: "ink" },
    { id: "gala", label: "Gala gold", color: "marigold", accessory: "sash", pants: "cashwell" },
    { id: "night", label: "Night market", color: "ink", accessory: "cape", pants: "ink" },
  ],
  cashmere: [
    { id: "sheet", label: "Couture black", color: "cashmere", accessory: "cape", pants: "ink" },
    { id: "runway", label: "Runway gold", color: "marigold", accessory: "cape", pants: "cashmere" },
    { id: "soft", label: "Soft ledger", color: "ledger", accessory: "scarf", pants: "ink" },
  ],
  peso_pedro: [
    { id: "sheet", label: "Fiesta green", color: "peso", accessory: "cap", pants: "ink" },
    { id: "parade", label: "Parade gold", color: "marigold", accessory: "sash", pants: "peso" },
    { id: "night", label: "Night charro", color: "ink", accessory: "cap", pants: "ink" },
  ],
  fortuna_fernanda: [
    { id: "sheet", label: "Emerald rose", color: "fortuna", accessory: "cape", pants: "ink" },
    { id: "coral", label: "Coral fiesta", color: "coral", accessory: "cape", pants: "fortuna" },
    { id: "gala", label: "Gala gold", color: "marigold", accessory: "sash", pants: "ink" },
  ],
  billionaire_bao: [
    { id: "sheet", label: "Quiet forest", color: "bao", accessory: "vest", pants: "ink" },
    { id: "ink", label: "Boardroom ink", color: "ink", accessory: "vest", pants: "bao" },
    { id: "gold", label: "Compound gold", color: "marigold", accessory: "sash", pants: "ink" },
  ],
  jade_fortune: [
    { id: "sheet", label: "Jade gown", color: "jade", accessory: "cape", pants: "ink" },
    { id: "heirloom", label: "Heirloom black", color: "cashmere", accessory: "cape", pants: "jade" },
    { id: "bloom", label: "Bloom gold", color: "marigold", accessory: "lantern", pants: "ink" },
  ],
  sultan_stacks: [
    { id: "sheet", label: "Palace emerald", color: "sultan", accessory: "cap", pants: "ink" },
    { id: "cream", label: "Cream court", color: "marigold", accessory: "cap", pants: "sultan" },
    { id: "night", label: "Night keep", color: "ink", accessory: "cape", pants: "ink" },
  ],
  dinar_dahlia: [
    { id: "sheet", label: "Radiant emerald", color: "dahlia", accessory: "cape", pants: "ink" },
    { id: "ruby", label: "Ruby gala", color: "coral", accessory: "cape", pants: "dahlia" },
    { id: "gold", label: "Dinar gold", color: "marigold", accessory: "sash", pants: "ink" },
  ],
  mansa_moneybaggs: [
    { id: "sheet", label: "Kingdom emerald", color: "mansa", accessory: "cap", pants: "ink" },
    { id: "sun", label: "Sunburst gold", color: "marigold", accessory: "cap", pants: "mansa" },
    { id: "caravan", label: "Caravan night", color: "ink", accessory: "cape", pants: "ink" },
  ],
  kandake_kash: [
    { id: "sheet", label: "Onyx crown", color: "kandake", accessory: "cape", pants: "ink" },
    { id: "forest", label: "Forest cape", color: "mansa", accessory: "cape", pants: "kandake" },
    { id: "gold", label: "Kash gold", color: "marigold", accessory: "sash", pants: "ink" },
  ],
  moneybagg_bro: [
    { id: "sheet", label: "Street empire", color: "moneybagg", accessory: "vest", pants: "ink" },
    { id: "neon", label: "Neon hustle", color: "tide", accessory: "headset", pants: "moneybagg" },
    { id: "gold", label: "Executive gold", color: "marigold", accessory: "vest", pants: "ink" },
  ],
  mula_mami: [
    { id: "sheet", label: "Boss glam", color: "mula", accessory: "vest", pants: "ink" },
    { id: "coral", label: "Hot coral", color: "coral", accessory: "cape", pants: "mula" },
    { id: "gold", label: "Bankroll gold", color: "marigold", accessory: "sash", pants: "ink" },
  ],
  piggy_penny: [
    { id: "sheet", label: "Harbor keeper", color: "coral", accessory: "none", pants: "ink" },
    { id: "formal", label: "Seal sash", color: "seafoam", accessory: "sash", pants: "ink" },
    { id: "night", label: "Quiet night", color: "ink", accessory: "scarf", pants: "ink" },
  ],
  dollar_dash: CLASSIC_LOOKS,
  coiny: [
    { id: "sheet", label: "Classic coin", color: "marigold", accessory: "none", pants: "ink" },
    { id: "bright", label: "Bright tide", color: "tide", accessory: "cap", pants: "seafoam" },
    { id: "spark", label: "Sparkle", color: "seafoam", accessory: "lantern", pants: "ink" },
  ],
  budget_bot: [
    { id: "sheet", label: "Ledger bot", color: "tide", accessory: "headset", pants: "ink" },
    { id: "calc", label: "Calc mode", color: "ink", accessory: "goggles", pants: "tide" },
    { id: "soft", label: "Soft plan", color: "seafoam", accessory: "scarf", pants: "ink" },
  ],
  vault_vince: [
    { id: "sheet", label: "Vault steel", color: "ink", accessory: "none", pants: "ink" },
    { id: "brass", label: "Brass lock", color: "marigold", accessory: "vest", pants: "ink" },
    { id: "secure", label: "Secure sash", color: "seafoam", accessory: "sash", pants: "ink" },
  ],
  goldie_bar: [
    { id: "sheet", label: "Ingot gleam", color: "marigold", accessory: "none", pants: "ink" },
    { id: "mint", label: "Mint bar", color: "seafoam", accessory: "cap", pants: "ink" },
    { id: "reserve", label: "Reserve cape", color: "ink", accessory: "cape", pants: "marigold" },
  ],
  baggy_bucks: [
    { id: "sheet", label: "Coin bag", color: "marigold", accessory: "none", pants: "ink" },
    { id: "guide", label: "Path buddy", color: "seafoam", accessory: "bandana", pants: "ink" },
    { id: "night", label: "Night hop", color: "ink", accessory: "lantern", pants: "ink" },
  ],
};

export function lookPresetsForBase(base: string): CharacterLookPreset[] {
  if (isEndgameVillainMascot(base)) return [];
  return LOOK_PRESETS_BY_BASE[base] ?? CLASSIC_LOOKS;
}

/** Sheet / first preset — applied when a fighter is picked. */
export function sheetLookForBase(base: string, name = ""): CapitalCharacter {
  const mascot = getMascot(base);
  const preset = lookPresetsForBase(base)[0];
  return {
    name: name || mascot.name,
    base: mascot.id,
    color: preset?.color ?? mascot.color,
    accessory: preset?.accessory ?? mascot.accessory,
    pants: preset?.pants ?? "ink",
    companion: "none",
    lookId: preset?.id ?? "sheet",
  };
}

export function applyLookPreset(
  draft: CapitalCharacter,
  preset: CharacterLookPreset,
): CapitalCharacter {
  return {
    ...draft,
    color: preset.color,
    accessory: preset.accessory,
    pants: preset.pants,
    lookId: preset.id,
  };
}

/** Gear worn on the body (hats, wraps, belts). */
export const GEAR_ACCESSORY_IDS = [
  "none",
  "cap",
  "bandana",
  "cape",
  "scarf",
  "vest",
  "sash",
] as const;

/** Electronics / gadgets layer. */
export const TECH_ACCESSORY_IDS = ["none", "headset", "goggles", "lantern"] as const;
