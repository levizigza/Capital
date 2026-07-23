/**
 * Era morph helpers — one Voyager identity, seven graphic lenses.
 * Maps animation decades → dimension mode, minigame shells, approach blend.
 */

import type { AnimationStyleId } from "./animationStyles";
import { getAnimationStyle } from "./animationStyles";
import type { MinigameVisualShell } from "./platform/gameCatalog";
import { getEraLook3D, type EraLook3D } from "./world3d/eraLooks";

/** Early decades read as screen/plane graphics; later decades stay world-3D. */
export type EraDimension = "screen2d" | "world3d";

export function eraDimension(styleId?: AnimationStyleId | string): EraDimension {
  const look = getEraLook3D(styleId);
  if (look.shading === "vector" || look.shading === "wire") return "screen2d";
  return "world3d";
}

/** Default minigame chrome for each decade lens. */
const ERA_SHELL: Record<string, MinigameVisualShell> = {
  "capital-default": "retro",
  "era-1960s": "arcade",
  "era-1970s": "retro",
  "era-1980s": "neon",
  "era-1990s": "arcade",
  "era-2000s": "explore",
  "era-2010s": "broker",
  "era-2020s": "explore",
};

export function shellForEra(styleId?: AnimationStyleId | string): MinigameVisualShell {
  const style = getAnimationStyle(styleId);
  return ERA_SHELL[style.id] ?? "flat";
}

/**
 * Approach blend 0→1 as carpet nears an island.
 * Soft start, then snaps harder into the destination lens in the final stretch.
 */
export function approachBlend(distance: number, startDist = 90, arriveDist = 16): number {
  if (distance <= arriveDist) return 1;
  if (distance >= startDist) return 0;
  const t = 1 - (distance - arriveDist) / (startDist - arriveDist);
  // Smoothstep
  return t * t * (3 - 2 * t);
}

export function eraHudFlavor(styleId?: AnimationStyleId | string): string {
  return getAnimationStyle(styleId).hudFlavor;
}

export function eraCssVars(look: EraLook3D): Record<string, string> {
  return {
    "--era-sky-top": look.skyTop,
    "--era-sky-bottom": look.skyBottom,
    "--era-sea": look.sea,
    "--era-land": look.land,
    "--era-accent": look.accent,
    "--era-shore": look.shore,
    "--era-fog": look.fog,
  };
}
