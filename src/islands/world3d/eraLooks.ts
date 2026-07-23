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
    skyBottom: "#0a0a0a",
    fog: "#000000",
    fogNear: 18,
    fogFar: 110,
    sea: "#050505",
    land: "#f5f5f5",
    accent: "#ffffff",
    shore: "#aaaaaa",
    sunColor: "#ffffff",
    ambientIntensity: 0.15,
    shading: "vector",
  },
  "era-1970s": {
    id: "era-1970s",
    decade: "1970s",
    skyTop: "#000800",
    skyBottom: "#000000",
    fog: "#001a00",
    fogNear: 20,
    fogFar: 130,
    sea: "#001a00",
    land: "#33ff66",
    accent: "#66ff99",
    shore: "#22aa44",
    sunColor: "#33ff66",
    ambientIntensity: 0.3,
    shading: "wire",
  },
  "era-1980s": {
    id: "era-1980s",
    decade: "1980s",
    skyTop: "#2e1065",
    skyBottom: "#db2777",
    fog: "#6d28d9",
    fogNear: 30,
    fogFar: 170,
    sea: "#0891b2",
    land: "#9333ea",
    accent: "#f0abfc",
    shore: "#22d3ee",
    sunColor: "#f472b6",
    ambientIntensity: 0.42,
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
    skyTop: "#1e3a8a",
    skyBottom: "#86efac",
    fog: "#93c5fd",
    fogNear: 42,
    fogFar: 200,
    sea: "#1e3a5f",
    land: "#166534",
    accent: "#eab308",
    shore: "#365314",
    sunColor: "#fde047",
    ambientIntensity: 0.68,
    shading: "glossy",
  },
  "era-2010s": {
    id: "era-2010s",
    decade: "2010s",
    skyTop: "#78716c",
    skyBottom: "#44403c",
    fog: "#57534e",
    fogNear: 48,
    fogFar: 230,
    sea: "#292524",
    land: "#3f6212",
    accent: "#a8a29e",
    shore: "#a8a29e",
    sunColor: "#e7e5e4",
    ambientIntensity: 0.38,
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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Blend two era looks for carpet approach morph.
 * Shading snaps to destination after halfway so vector/wire read clearly near land.
 */
export function lerpEraLook3D(from: EraLook3D, to: EraLook3D, t: number): EraLook3D {
  const u = Math.max(0, Math.min(1, t));
  return {
    id: u < 0.5 ? from.id : to.id,
    decade: u < 0.55 ? from.decade : to.decade,
    skyTop: lerpHex(from.skyTop, to.skyTop, u),
    skyBottom: lerpHex(from.skyBottom, to.skyBottom, u),
    fog: lerpHex(from.fog, to.fog, u),
    fogNear: lerpNum(from.fogNear, to.fogNear, u),
    fogFar: lerpNum(from.fogFar, to.fogFar, u),
    sea: lerpHex(from.sea, to.sea, u),
    land: lerpHex(from.land, to.land, u),
    accent: lerpHex(from.accent, to.accent, u),
    shore: lerpHex(from.shore, to.shore, u),
    sunColor: lerpHex(from.sunColor, to.sunColor, u),
    ambientIntensity: lerpNum(from.ambientIntensity, to.ambientIntensity, u),
    shading: u < 0.5 ? from.shading : to.shading,
  };
}
