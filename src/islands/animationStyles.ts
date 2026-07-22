/**
 * Era animation languages for Fortune Archipelago.
 *
 * Inspired by seven decades of interactive graphics — not any single franchise.
 * Your Voyager keeps one identity; each island remaps how they look and move.
 * On Harbor Haven (hub) and while sailing, they always return to capital-default.
 */

export type AnimationStyleId =
  | "capital-default"
  | "era-1960s"
  | "era-1970s"
  | "era-1980s"
  | "era-1990s"
  | "era-2000s"
  | "era-2010s"
  | "era-2020s"
  /** @deprecated aliases kept so older content still resolves */
  | "poptropica-sketch"
  | "flash-retro"
  | "miniclip-arcade"
  | "newgrounds-indie"
  | "sketch-future";

export type AnimationStyle = {
  id: AnimationStyleId;
  /** Decade badge on map / HUD */
  eraLabel: string;
  /** Decade year range */
  decade: string;
  /** Player-facing vibe line */
  tagline: string;
  /** CSS class applied to CharacterAvatar + board chrome */
  morphClass: string;
  /** Board / minigame shell class */
  boardSkinClass: string;
  /** How the Voyager is described on this island */
  characterForm: string;
  /** HUD / UI flavor */
  hudFlavor: string;
  /** Financial literacy angle for this art era */
  literacyFocus: string;
};

const ERA_STYLES: Record<string, AnimationStyle> = {
  "capital-default": {
    id: "capital-default",
    eraLabel: "Harbor Haven",
    decade: "Home",
    tagline: "Your true Voyager look — clean, bold, ready to float.",
    morphClass: "char-morph-capital",
    boardSkinClass: "era-board-capital",
    characterForm: "Captain Voyager — coat, satchel, and a friendly companion",
    hudFlavor: "Warm paper HUD · gold seals · tide ink",
    literacyFocus: "How to play · needs vs wants · first savings pouch",
  },
  "era-1960s": {
    id: "era-1960s",
    eraLabel: "Vector Dawn",
    decade: "1960s",
    tagline: "White dots and thin lines on black — oscilloscope skies.",
    morphClass: "char-morph-1960s",
    boardSkinClass: "era-board-1960s",
    characterForm: "A constellation of points — a walking connect-the-dots figure",
    hudFlavor: "Block SCORE text · crosshair stars · dashed mountains",
    literacyFocus: "Simple savings graphs · plotting goals · compound dots",
  },
  "era-1970s": {
    id: "era-1970s",
    eraLabel: "Wireframe Seas",
    decade: "1970s",
    tagline: "Glowing green skeletons of markets — early arcade perspective.",
    morphClass: "char-morph-1970s",
    boardSkinClass: "era-board-1970s",
    characterForm: "A glowing wireframe skiff with a FUEL gauge for cashflow",
    hudFlavor: "Digital FUEL bar · phosphor SCORE · vector cliffs",
    literacyFocus: "Inflation spikes as obstacles · cashflow fuel · early risk",
  },
  "era-1980s": {
    id: "era-1980s",
    eraLabel: "Neon Grid",
    decade: "1980s",
    tagline: "Synth sunsets, neon edges, infinite perspective floors.",
    morphClass: "char-morph-1980s",
    boardSkinClass: "era-board-1980s",
    characterForm: "A chunky neon racer — solid polygons with glowing outlines",
    hudFlavor: "STAGE counters · magenta/cyan chrome · grid plane",
    literacyFocus: "Debt traps on the track · racing toward retirement goals",
  },
  "era-1990s": {
    id: "era-1990s",
    eraLabel: "Low-Poly Coast",
    decade: "1990s",
    tagline: "Chunky polygons, bright carts, heart meters — early 3D joy.",
    morphClass: "char-morph-1990s",
    boardSkinClass: "era-board-1990s",
    characterForm: "A mascot Voyager with visible polygons and a heart meter",
    hudFlavor: "Red heart lives · LAP counters · saturated cartoon fills",
    literacyFocus: "Budget baselines · needs-before-wants kart races",
  },
  "era-2000s": {
    id: "era-2000s",
    eraLabel: "Quest Keep",
    decade: "2000s",
    tagline: "Smoother adventure worlds — gems, gold, expressive companions.",
    morphClass: "char-morph-2000s",
    boardSkinClass: "era-board-2000s",
    characterForm: "An anime-lite adventurer with goggles and a tiny animal guide",
    hudFlavor: "Gold coin + gem counters · soft fantasy lighting",
    literacyFocus: "Diversification as gem types · quest rewards = asset classes",
  },
  "era-2010s": {
    id: "era-2010s",
    eraLabel: "Ruin Realism",
    decade: "2010s",
    tagline: "Cinematic mud, stone, and scale — diegetic objectives only.",
    morphClass: "char-morph-2010s",
    boardSkinClass: "era-board-2010s",
    characterForm: "A realistically proportioned explorer facing the ruins ahead",
    hudFlavor: "Compass · objective toast · minimal diegetic UI",
    literacyFocus: "Recovering credit history artifacts · high-stakes recovery",
  },
  "era-2020s": {
    id: "era-2020s",
    eraLabel: "Painterly Skies",
    decade: "New Gen",
    tagline: "Hand-painted floating isles — art-directed market weather.",
    morphClass: "char-morph-2020s",
    boardSkinClass: "era-board-2020s",
    characterForm: "A stylized Voyager in a flowing cloak under aurora light",
    hudFlavor: "Parchment quest banners · ornate seal frames",
    literacyFocus: "Portfolio weather · modern risk balance · long-horizon goals",
  },
};

/** Legacy Flash-portal names → nearest decade era */
const LEGACY_ALIASES: Record<string, AnimationStyleId> = {
  "poptropica-sketch": "era-1990s",
  "flash-retro": "era-1980s",
  "miniclip-arcade": "era-2000s",
  "newgrounds-indie": "era-2010s",
  "sketch-future": "era-2020s",
};

export const ANIMATION_STYLES: Record<AnimationStyleId, AnimationStyle> = {
  ...(ERA_STYLES as Record<AnimationStyleId, AnimationStyle>),
  "poptropica-sketch": { ...ERA_STYLES["era-1990s"]!, id: "poptropica-sketch" },
  "flash-retro": { ...ERA_STYLES["era-1980s"]!, id: "flash-retro" },
  "miniclip-arcade": { ...ERA_STYLES["era-2000s"]!, id: "miniclip-arcade" },
  "newgrounds-indie": { ...ERA_STYLES["era-2010s"]!, id: "newgrounds-indie" },
  "sketch-future": { ...ERA_STYLES["era-2020s"]!, id: "sketch-future" },
};

export function getAnimationStyle(id?: AnimationStyleId | string): AnimationStyle {
  if (!id) return ERA_STYLES["capital-default"]!;
  if (ERA_STYLES[id]) return ERA_STYLES[id]!;
  const aliased = LEGACY_ALIASES[id];
  if (aliased && ERA_STYLES[aliased]) return ERA_STYLES[aliased]!;
  return ERA_STYLES["capital-default"]!;
}

/** True when the Voyager should show their home look (hub / boat). */
export function isHomeLook(id?: AnimationStyleId | string): boolean {
  return !id || id === "capital-default";
}

export const ERA_ISLAND_ORDER: AnimationStyleId[] = [
  "era-1960s",
  "era-1970s",
  "era-1980s",
  "era-1990s",
  "era-2000s",
  "era-2010s",
  "era-2020s",
];
