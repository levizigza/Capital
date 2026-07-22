/**
 * Capital Voyager — the player's identity across Fortune Archipelago.
 *
 * On Harbor Haven and while sailing, this home look is always shown.
 * Landing on an era island remaps the same Voyager into that decade's art language.
 */

export type CapitalCharacter = {
  name: string;
  base: string;
  color: string;
  accessory: string;
  companion: string;
};

export type CharacterOption = { id: string; emoji: string; label: string };

/** Core Voyager silhouettes — original cast, not borrowed mascots */
export const CHARACTER_BASES: CharacterOption[] = [
  { id: "voyager", emoji: "🧑‍✈️", label: "Voyager" },
  { id: "cartographer", emoji: "🧭", label: "Cartographer" },
  { id: "ledger_kid", emoji: "🧒", label: "Ledger Kid" },
  { id: "tide_ranger", emoji: "🏄", label: "Tide Ranger" },
  { id: "coin_smith", emoji: "🧑‍🔧", label: "Coin-Smith" },
  { id: "signal_scout", emoji: "📡", label: "Signal Scout" },
  { id: "quest_adept", emoji: "🧑‍🎓", label: "Quest Adept" },
  { id: "ruin_walker", emoji: "🥾", label: "Ruin Walker" },
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
  { id: "cap", emoji: "🧢", label: "Dock Cap" },
  { id: "goggles", emoji: "🥽", label: "Quest Goggles" },
  { id: "bandana", emoji: "🎀", label: "Tide Bandana" },
  { id: "headset", emoji: "🎧", label: "Signal Phones" },
  { id: "lantern", emoji: "🏮", label: "Ruin Lantern" },
];

export const CHARACTER_COMPANIONS: CharacterOption[] = [
  { id: "none", emoji: "", label: "Solo" },
  { id: "tortoise", emoji: "🐢", label: "Tortoise" },
  { id: "finch", emoji: "🐦", label: "Finch" },
  { id: "iguana", emoji: "🦎", label: "Iguana" },
  { id: "otter", emoji: "🦦", label: "Otter" },
  { id: "crab", emoji: "🦀", label: "Crab Accountant" },
];

export const DEFAULT_CHARACTER: CapitalCharacter = {
  name: "",
  base: "voyager",
  color: "tide",
  accessory: "none",
  companion: "none",
};

/** Starter look before the Harbor shop — plain Voyager, no gear, no pet. */
export const BASE_VOYAGER: CapitalCharacter = {
  name: "Voyager",
  base: "voyager",
  color: "tide",
  accessory: "none",
  companion: "none",
};

export function baseEmoji(id: string): string {
  return CHARACTER_BASES.find((b) => b.id === id)?.emoji ?? "🧑‍✈️";
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
