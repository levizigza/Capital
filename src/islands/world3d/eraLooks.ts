/**
 * Era look recipes for 3D islands — mirrors animationStyles decades
 * without cloning any franchise art.
 */

import type { AnimationStyleId } from "../animationStyles";
import { getAnimationStyle } from "../animationStyles";

export type EraLook3D = {
  id: AnimationStyleId;
  decade: string;
  skyTop: string;
  skyBottom: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  sea: string;
  land: string;
  accent: string;
  shore: string;
  sunColor: string;
  ambientIntensity: number;
  /** wireframe / flat / standard shading hint */
  shading: "vector" | "wire" | "neon" | "lowpoly" | "glossy" | "cinematic" | "painterly" | "harbor";
};

const LOOKS: Partial<Record<AnimationStyleId, EraLook3D>> = {
  "capital-default": {
    id: "capital-default",
    decade: "Home",
    skyTop: "#7dd3fc",
    skyBottom: "#fef3c7",
    fog: "#bae6fd",
    fogNear: 40,
    fogFar: 220,
    sea: "#0ea5e9",
    land: "#22c55e",
    accent: "#f4a629",
    shore: "#fde68a",
    sunColor: "#fef08a",
    ambientIntensity: 0.55,
    shading: "harbor",
  },
  "era-1960s": {
    id: "era-1960s",
    decade: "1960s",
    skyTop: "#000000",
    skyBottom: "#111111",
    fog: "#000000",
    fogNear: 30,
    fogFar: 160,
    sea: "#1a1a1a",
    land: "#ffffff",
    accent: "#ffffff",
    shore: "#cccccc",
    sunColor: "#ffffff",
    ambientIntensity: 0.2,
    shading: "vector",
  },
  "era-1970s": {
    id: "era-1970s",
    decade: "1970s",
    skyTop: "#001100",
    skyBottom: "#000000",
    fog: "#002200",
    fogNear: 25,
    fogFar: 150,
    sea: "#003300",
    land: "#33ff66",
    accent: "#66ff99",
    shore: "#22aa44",
    sunColor: "#33ff66",
    ambientIntensity: 0.35,
    shading: "wire",
  },
  "era-1980s": {
    id: "era-1980s",
    decade: "1980s",
    skyTop: "#4c1d95",
    skyBottom: "#f472b6",
    fog: "#7c3aed",
    fogNear: 35,
    fogFar: 180,
    sea: "#22d3ee",
    land: "#a855f7",
    accent: "#f0abfc",
    shore: "#67e8f9",
    sunColor: "#f472b6",
    ambientIntensity: 0.45,
    shading: "neon",
  },
  "era-1990s": {
    id: "era-1990s",
    decade: "1990s",
    skyTop: "#38bdf8",
    skyBottom: "#fde68a",
    fog: "#7dd3fc",
    fogNear: 40,
    fogFar: 200,
    sea: "#0284c7",
    land: "#16a34a",
    accent: "#ea580c",
    shore: "#fcd34d",
    sunColor: "#facc15",
    ambientIntensity: 0.6,
    shading: "lowpoly",
  },
  "era-2000s": {
    id: "era-2000s",
    decade: "2000s",
    skyTop: "#7dd3fc",
    skyBottom: "#fef9c3",
    fog: "#bae6fd",
    fogNear: 45,
    fogFar: 210,
    sea: "#0ea5e9",
    land: "#4ade80",
    accent: "#f59e0b",
    shore: "#fde68a",
    sunColor: "#fde047",
    ambientIntensity: 0.7,
    shading: "glossy",
  },
  "era-2010s": {
    id: "era-2010s",
    decade: "2010s",
    skyTop: "#a8a29e",
    skyBottom: "#57534e",
    fog: "#78716c",
    fogNear: 50,
    fogFar: 240,
    sea: "#44403c",
    land: "#3f6212",
    accent: "#a8a29e",
    shore: "#a8a29e",
    sunColor: "#e7e5e4",
    ambientIntensity: 0.4,
    shading: "cinematic",
  },
  "era-2020s": {
    id: "era-2020s",
    decade: "New Gen",
    skyTop: "#6eb6df",
    skyBottom: "#c5e8c0",
    fog: "#a8d8ef",
    fogNear: 55,
    fogFar: 260,
    sea: "#1a6b8a",
    land: "#3d8b6e",
    accent: "#e8c86a",
    shore: "#f5e6b8",
    sunColor: "#ffe08a",
    ambientIntensity: 0.65,
    shading: "painterly",
  },
};

export function getEraLook3D(styleId?: AnimationStyleId | string): EraLook3D {
  const style = getAnimationStyle(styleId);
  return LOOKS[style.id] ?? LOOKS["capital-default"]!;
}
