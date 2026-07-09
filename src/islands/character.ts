/**
 * Capital character — a lightweight, kid-friendly avatar the player builds
 * on the home island before branching out to the world's islands.
 */

export type CapitalCharacter = {
  name: string;
  base: string;
  color: string;
  accessory: string;
  companion: string;
};

export type CharacterOption = { id: string; emoji: string; label: string };

export const CHARACTER_BASES: CharacterOption[] = [
  { id: "explorer", emoji: "🧑", label: "Explorer" },
  { id: "kid", emoji: "🧒", label: "Kid" },
  { id: "astro", emoji: "🧑‍🚀", label: "Astronaut" },
  { id: "hero", emoji: "🦸", label: "Hero" },
  { id: "artist", emoji: "🧑‍🎤", label: "Star" },
  { id: "scientist", emoji: "🧑‍🔬", label: "Inventor" },
  { id: "ranger", emoji: "🧝", label: "Ranger" },
  { id: "detective", emoji: "🕵️", label: "Detective" },
];

export const CHARACTER_COLORS: { id: string; hex: string; label: string }[] = [
  { id: "sky", hex: "#38bdf8", label: "Sky" },
  { id: "grape", hex: "#a78bfa", label: "Grape" },
  { id: "coral", hex: "#fb7185", label: "Coral" },
  { id: "mint", hex: "#34d399", label: "Mint" },
  { id: "gold", hex: "#fbbf24", label: "Gold" },
  { id: "flame", hex: "#f97316", label: "Flame" },
];

export const CHARACTER_ACCESSORIES: CharacterOption[] = [
  { id: "none", emoji: "", label: "None" },
  { id: "cap", emoji: "🧢", label: "Cap" },
  { id: "tophat", emoji: "🎩", label: "Top hat" },
  { id: "crown", emoji: "👑", label: "Crown" },
  { id: "shades", emoji: "🕶️", label: "Shades" },
  { id: "headphones", emoji: "🎧", label: "Headphones" },
];

export const CHARACTER_COMPANIONS: CharacterOption[] = [
  { id: "none", emoji: "", label: "Solo" },
  { id: "dog", emoji: "🐶", label: "Pup" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "parrot", emoji: "🦜", label: "Parrot" },
  { id: "turtle", emoji: "🐢", label: "Turtle" },
  { id: "fox", emoji: "🦊", label: "Fox" },
];

export const DEFAULT_CHARACTER: CapitalCharacter = {
  name: "",
  base: "explorer",
  color: "sky",
  accessory: "none",
  companion: "none",
};

export function baseEmoji(id: string): string {
  return CHARACTER_BASES.find((b) => b.id === id)?.emoji ?? "🧑";
}

export function colorHex(id: string): string {
  return CHARACTER_COLORS.find((c) => c.id === id)?.hex ?? "#38bdf8";
}

export function accessoryEmoji(id: string): string {
  return CHARACTER_ACCESSORIES.find((a) => a.id === id)?.emoji ?? "";
}

export function companionEmoji(id: string): string {
  return CHARACTER_COMPANIONS.find((c) => c.id === id)?.emoji ?? "";
}
