/**
 * Capital Voyager — the player's identity across Fortune Archipelago.
 *
 * On Harbor Haven and while sailing, this home look is always shown.
 * Landing on an era island remaps the same Voyager into that decade's art language.
 *
 * Cast is anthropomorphic money — bills, coins, piggies — not humans.
 * Built for a kids financial-literacy game: wacky, readable, original.
 */

export type CapitalCharacter = {
  name: string;
  base: string;
  color: string;
  accessory: string;
  companion: string;
};

export type CharacterOption = { id: string; emoji: string; label: string };

/** Core money-mascot silhouettes — original cast, not borrowed brands */
export const CHARACTER_BASES: CharacterOption[] = [
  { id: "voyager", emoji: "💵", label: "Bill Buddy" },
  { id: "cartographer", emoji: "🪙", label: "Coin Kid" },
  { id: "ledger_kid", emoji: "📒", label: "Ledger Larry" },
  { id: "tide_ranger", emoji: "💸", label: "Cash Wave" },
  { id: "coin_smith", emoji: "🐷", label: "Piggy Bank" },
  { id: "signal_scout", emoji: "📡", label: "Signal Cent" },
  { id: "quest_adept", emoji: "📜", label: "Scroll Scholar" },
  { id: "ruin_walker", emoji: "⚱️", label: "Ancient Coin" },
];

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
  base: "voyager",
  color: "tide",
  accessory: "none",
  companion: "none",
};

/** Starter look before the Harbor shop — plain Bill Buddy, no gear, no pet. */
export const BASE_VOYAGER: CapitalCharacter = {
  name: "Voyager",
  base: "voyager",
  color: "tide",
  accessory: "none",
  companion: "none",
};

export function baseEmoji(id: string): string {
  return CHARACTER_BASES.find((b) => b.id === id)?.emoji ?? "💵";
}

export function colorHex(id: string): string {
  return CHARACTER_COLORS.find((c) => c.id === id)?.hex ?? "#0ea5e9";
}

export function accessoryEmoji(id: string): string {
  return CHARACTER_ACCESSORIES.find((a) => a.id === id)?.emoji ?? "";
}

export function companionEmoji(id: string): string {
  return CHARACTER_COMPANIONS.find((c) => c.id === id)?.emoji ?? "";
}

/** Which procedural money body to build in 3D. */
export type MoneyForm =
  | "bill"
  | "coin"
  | "ledger"
  | "wave"
  | "piggy"
  | "signal"
  | "scroll"
  | "ancient";

export function moneyFormFromBase(base?: string | null): MoneyForm {
  switch (base) {
    case "cartographer":
      return "coin";
    case "ledger_kid":
      return "ledger";
    case "tide_ranger":
      return "wave";
    case "coin_smith":
      return "piggy";
    case "signal_scout":
      return "signal";
    case "quest_adept":
      return "scroll";
    case "ruin_walker":
      return "ancient";
    case "voyager":
    default:
      return "bill";
  }
}
