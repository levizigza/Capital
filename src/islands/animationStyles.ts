/**
 * Per-island animation / game-era styles.
 * Your home-base character stays the same — on each island they morph into
 * that world's art language (Poptropica sketch, Flash flat, Miniclip glossy, etc.).
 */

export type AnimationStyleId =
  | "capital-default"
  | "poptropica-sketch"
  | "flash-retro"
  | "miniclip-arcade"
  | "newgrounds-indie"
  | "sketch-future";

export type AnimationStyle = {
  id: AnimationStyleId;
  /** Short badge on the travel map */
  eraLabel: string;
  /** Player-facing description */
  tagline: string;
  /** CSS class applied to CharacterAvatar */
  morphClass: string;
};

export const ANIMATION_STYLES: Record<AnimationStyleId, AnimationStyle> = {
  "capital-default": {
    id: "capital-default",
    eraLabel: "Home base",
    tagline: "Your Capital look — clean and familiar.",
    morphClass: "char-morph-capital",
  },
  "poptropica-sketch": {
    id: "poptropica-sketch",
    eraLabel: "Poptropica",
    tagline: "Thick cartoon outlines and sketchy island adventures.",
    morphClass: "char-morph-poptropica",
  },
  "flash-retro": {
    id: "flash-retro",
    eraLabel: "Flash games",
    tagline: "Bold flat shapes and snappy tween energy.",
    morphClass: "char-morph-flash",
  },
  "miniclip-arcade": {
    id: "miniclip-arcade",
    eraLabel: "Miniclip",
    tagline: "Glossy arcade polish and quick-play fun.",
    morphClass: "char-morph-miniclip",
  },
  "newgrounds-indie": {
    id: "newgrounds-indie",
    eraLabel: "Newgrounds",
    tagline: "Indie edge, experimental vibes, creator culture.",
    morphClass: "char-morph-newgrounds",
  },
  "sketch-future": {
    id: "sketch-future",
    eraLabel: "Kids of the future",
    tagline: "Unfinished shores — carve out games for your era.",
    morphClass: "char-morph-future",
  },
};

export function getAnimationStyle(id?: AnimationStyleId | string): AnimationStyle {
  const key = (id ?? "capital-default") as AnimationStyleId;
  return ANIMATION_STYLES[key] ?? ANIMATION_STYLES["capital-default"];
}
