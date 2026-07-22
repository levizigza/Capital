/**
 * Capital Voyager — the player's identity across Fortune Archipelago.
 *
 * On Harbor Haven and while sailing, this home look is always shown.
 * Landing on an era island remaps the same Voyager into that decade's art language.
 *
 * Cast is the 30 Money Mascots — bills, coins, vaults, rockets, and friends —
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
];

export const CHARACTER_ACCESSORIES: CharacterOption[] = [
  { id: "none", emoji: "", label: "None" },
  { id: "cap", emoji: "🎩", label: "Top Hat" },
  { id: "goggles", emoji: "🧐", label: "Gold Monocle" },
  { id: "bandana", emoji: "🎀", label: "Bow Tie" },
  { id: "headset", emoji: "🎧", label: "Signal Phones" },
  { id: "lantern", emoji: "✨", label: "Sparkle Stamp" },
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
};

/** Starter look before the Harbor shop — Dollar Dash, no gear, no pet. */
export const BASE_VOYAGER: CapitalCharacter = {
  name: "Voyager",
  base: "dollar_dash",
  color: "seafoam",
  accessory: "none",
  companion: "none",
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
