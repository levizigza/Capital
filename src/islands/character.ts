/**
 * Capital Voyager — the player's identity across Fortune Archipelago.
 *
 * On Harbor Haven and while sailing, this home look is always shown.
 * Landing on an era island remaps the same Voyager into that decade's art language.
 *
 * Cast is the Money Mascots — bills, coins, vaults, rockets, series leads —
 * not humans. Built for a kids financial-literacy game: wacky, readable, original.
 */

import {
  getMascot,
  moneyCastAsBases,
  resolveMascotId,
  type MoneyMascotId,
} from "./moneyCast";

export type CapitalCharacter = {
  name: string;
  /** Money-mascot id (or legacy Outfitter base id). */
  base: string;
  color: string;
  accessory: string;
  companion: string;
  /** Lower-half tint (Outfitter pants layer). */
  pants?: string;
  /** Active look preset id from castLooks (optional). */
  lookId?: string;
};

export type CharacterOption = { id: string; emoji: string; label: string };

/** Outfitter bodies = the full Money Mascot cast. */
export const CHARACTER_BASES: CharacterOption[] = moneyCastAsBases();

export const CHARACTER_COLORS: { id: string; hex: string; label: string }[] = [
  { id: "tide", hex: "#0ea5e9", label: "Tide" },
  { id: "marigold", hex: "#f4a629", label: "Marigold" },
  { id: "seafoam", hex: "#2dd4bf", label: "Seafoam" },
  { id: "ink", hex: "#1e3a5f", label: "Deep Ink" },
  { id: "coral", hex: "#fb7185", label: "Coral" },
  { id: "ledger", hex: "#a78bfa", label: "Ledger Violet" },
  /** Cashwell Capital series green — frock-coat forest */
  { id: "cashwell", hex: "#14532d", label: "Cashwell Green" },
  /** Cashmere Couture — black couture coat */
  { id: "cashmere", hex: "#0a0a0a", label: "Cashmere Black" },
  /** Peso Pedro — charro green */
  { id: "peso", hex: "#166534", label: "Peso Green" },
  /** Fortuna Fernanda — emerald bolero */
  { id: "fortuna", hex: "#047857", label: "Fortuna Emerald" },
  /** Billionaire Bao — quiet-luxury forest */
  { id: "bao", hex: "#052e16", label: "Bao Forest" },
  /** Jade Fortune — deep jade gown */
  { id: "jade", hex: "#065f46", label: "Jade Green" },
  /** Sultan Stacks — palace emerald kaftan */
  { id: "sultan", hex: "#064e3b", label: "Sultan Emerald" },
  /** Dinar Dahlia — radiant emerald gown */
  { id: "dahlia", hex: "#0b3d2e", label: "Dahlia Emerald" },
  /** Mansa Moneybaggs — kingdom emerald robe */
  { id: "mansa", hex: "#1b4332", label: "Mansa Emerald" },
  /** Kandake Kash — onyx gown with forest cape */
  { id: "kandake", hex: "#0f1412", label: "Kandake Onyx" },
  /** Moneybagg Bro — street-empire black */
  { id: "moneybagg", hex: "#171717", label: "Moneybagg Black" },
  /** Mula Mami — street-glamour black */
  { id: "mula", hex: "#1c1917", label: "Mula Black" },
  /** The Debt Collector — weathered obligation stone */
  { id: "obligation", hex: "#3f3f46", label: "Obligation Stone" },
];

/** Snapchat-style gear / clothing layers (procedural meshes on VoyagerMesh). */
export const CHARACTER_ACCESSORIES: CharacterOption[] = [
  { id: "none", emoji: "", label: "Bare" },
  { id: "cap", emoji: "🎩", label: "Top Hat" },
  { id: "goggles", emoji: "🧐", label: "Gold Monocle" },
  { id: "bandana", emoji: "🎀", label: "Bow Tie" },
  { id: "headset", emoji: "🎧", label: "Signal Phones" },
  { id: "lantern", emoji: "✨", label: "Sparkle Stamp" },
  { id: "cape", emoji: "🦸", label: "Fortune Cape" },
  { id: "scarf", emoji: "🧣", label: "Ledger Scarf" },
  { id: "vest", emoji: "🦺", label: "Market Vest" },
  { id: "sash", emoji: "🎗️", label: "Seal Sash" },
];

/** Outfitter category rail — Snapchat-style layers over the live 3D body.
 *  Body pick happens on the Street Fighter select grid; this rail customizes the pick. */
export type OutfitCategoryId = "looks" | "coat" | "pants" | "gear" | "tech";

export const OUTFIT_CATEGORIES: { id: OutfitCategoryId; label: string; hint: string }[] = [
  { id: "looks", label: "Looks", hint: "Signature outfits for this character" },
  { id: "coat", label: "Shirt", hint: "Coat / shirt tint for the upper body" },
  { id: "pants", label: "Pants", hint: "Lower-half color" },
  { id: "gear", label: "Accessories", hint: "Hats, capes, vests, sashes…" },
  { id: "tech", label: "Electronics", hint: "Signal Phones, monocle, sparkle stamp…" },
];

export const CHARACTER_COMPANIONS: CharacterOption[] = [
  { id: "none", emoji: "", label: "Solo" },
  { id: "tortoise", emoji: "🐢", label: "Slow Coin" },
  { id: "finch", emoji: "🐦", label: "Penny Finch" },
  { id: "iguana", emoji: "💎", label: "Gem Buddy" },
  { id: "otter", emoji: "🦦", label: "Cash Otter" },
  { id: "crab", emoji: "🦀", label: "Crab Accountant" },
];

export const DEFAULT_CHARACTER: CapitalCharacter = {
  name: "",
  base: "dollar_dash",
  color: "seafoam",
  accessory: "none",
  companion: "none",
  pants: "ink",
  lookId: "sheet",
};

/** Starter look before the Harbor shop — Dollar Dash, no gear, no pet. */
export const BASE_VOYAGER: CapitalCharacter = {
  name: "Voyager",
  base: "dollar_dash",
  color: "seafoam",
  accessory: "none",
  companion: "none",
  pants: "ink",
  lookId: "sheet",
};

export function baseEmoji(id: string): string {
  return getMascot(id).emoji;
}

export function colorHex(id: string): string {
  if (id.startsWith("#")) return id;
  return CHARACTER_COLORS.find((b) => b.id === id)?.hex ?? "#0ea5e9";
}

export function accessoryEmoji(id: string): string {
  return CHARACTER_ACCESSORIES.find((a) => a.id === id)?.emoji ?? "";
}

export function companionEmoji(id: string): string {
  return CHARACTER_COMPANIONS.find((c) => c.id === id)?.emoji ?? "";
}

/**
 * Procedural money body families used by VoyagerMesh.
 * One silhouette family can cover several cast members via glyph/tint.
 */
export type MoneyForm =
  | "bill"
  | "coin"
  | "ledger"
  | "wave"
  | "piggy"
  | "signal"
  | "scroll"
  | "ancient"
  | "currency"
  | "stack"
  | "bag"
  | "vault"
  | "receipt"
  | "card"
  | "wallet"
  | "coupon"
  | "ingot"
  | "calc"
  | "cloud"
  | "chest"
  | "safe"
  | "chart"
  | "jar"
  | "crypto"
  | "certificate"
  | "loan"
  | "rocket"
  | "star"
  | "shopbag"
  | "shield"
  | "clipboard"
  | "globe"
  | "hourglass";

export function moneyFormFromBase(base?: string | null): MoneyForm {
  return getMascot(base).form;
}

export function moneyGlyphFromBase(base?: string | null): string | undefined {
  return getMascot(base).glyph;
}

export function resolveCharacterMascotId(base?: string | null): MoneyMascotId {
  return resolveMascotId(base);
}

/**
 * Landing on an era shore remaps the same Voyager into that island's decade gear.
 * Identity (base + coat color) stays; accessory / pants / companion flip to the era.
 */
const ERA_VOYAGER_GEAR: Record<
  string,
  { accessory: string; pants?: string; companion?: string }
> = {
  "capital-default": { accessory: "none" },
  "era-1960s": { accessory: "goggles", pants: "ink", companion: "none" },
  "era-1970s": { accessory: "headset", pants: "seafoam", companion: "crab" },
  "era-1980s": { accessory: "cape", pants: "ledger", companion: "none" },
  "era-1990s": { accessory: "cap", pants: "coral", companion: "finch" },
  "era-2000s": { accessory: "goggles", pants: "marigold", companion: "iguana" },
  "era-2010s": { accessory: "scarf", pants: "ink", companion: "tortoise" },
  "era-2020s": { accessory: "sash", pants: "ledger", companion: "otter" },
};

export function voyagerForIslandStyle(
  character: CapitalCharacter,
  animationStyle?: string | null,
): CapitalCharacter {
  if (!animationStyle || animationStyle === "capital-default") {
    return character;
  }
  const gear = ERA_VOYAGER_GEAR[animationStyle] ?? ERA_VOYAGER_GEAR["era-1990s"]!;
  return {
    ...character,
    accessory: gear.accessory,
    pants: gear.pants ?? character.pants,
    companion: gear.companion ?? character.companion,
  };
}
