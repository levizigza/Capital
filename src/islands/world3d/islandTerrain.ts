/**
 * Seeded radial heightfield islands — stylized low-poly silhouettes
 * (shore → grass → rock) without franchise art.
 */

import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";

export type IslandDetail = "far" | "near";

export type PropInstance = {
  kind: "palm" | "tree" | "rock" | "grass" | "bush";
  position: [number, number, number];
  scale: number;
  rotationY: number;
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value noise on a lattice — good enough for island blobs. */
function valueNoise2D(x: number, z: number, seedSalt: number) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);

  const g = (ix: number, iz: number) => {
    let h = (ix * 374761393 + iz * 668265263 + seedSalt) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return h / 4294967296;
  };

  const n00 = g(x0, z0);
  const n10 = g(x0 + 1, z0);
  const n01 = g(x0, z0 + 1);
  const n11 = g(x0 + 1, z0 + 1);
  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;
  return nx0 * (1 - sz) + nx1 * sz;
}

function fbm(x: number, z: number, octaves: number, seedSalt: number) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise2D(x * freq, z * freq, seedSalt + i * 1013) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [number, number, number];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export type IslandTerrainResult = {
  geometry: THREE.BufferGeometry;
  props: PropInstance[];
  /** Approximate walkable radius on XZ */
  radius: number;
  peakY: number;
};

/**
 * Build a disc-ish island mesh with vertex colors (shore / land / rock).
 */
export function buildIslandTerrain(
  seed: string,
  look: EraLook3D,
  detail: IslandDetail = "near",
): IslandTerrainResult {
  const seedNum = hashSeed(seed);
  const rng = mulberry32(seedNum);
  const ox = (seedNum % 1000) / 17;
  const oz = (hashSeed(seed + "z") % 1000) / 19;
  const salt = seedNum;

  const segments = detail === "near" ? 64 : 28;
  const radius = 3.4 + rng() * 0.9;
  const heightScale = 1.35 + rng() * 0.55;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const shore = hexToRgb(look.shore);
  const land = hexToRgb(look.land);
  const rock = hexToRgb(look.shading === "neon" ? look.accent : "#6b7280");
  // Darken rock toward ink for cliff bands
  const cliff: [number, number, number] = [
    rock[0] * 0.55 + 0.1,
    rock[1] * 0.55 + 0.1,
    rock[2] * 0.55 + 0.12,
  ];

  const heights: number[][] = [];
  let peakY = 0;

  for (let iz = 0; iz <= segments; iz++) {
    heights[iz] = [];
    for (let ix = 0; ix <= segments; ix++) {
      const u = ix / segments;
      const v = iz / segments;
      const x = (u - 0.5) * 2 * radius;
      const z = (v - 0.5) * 2 * radius;
      const dist = Math.hypot(x, z) / radius;

      // Soft irregular coastline
      const coastNoise = fbm(x * 0.55 + ox, z * 0.55 + oz, 3, salt);
      const edge = 0.72 + coastNoise * 0.22;
      const falloff = Math.max(0, 1 - Math.pow(Math.min(1, dist / edge), 2.4));

      const hills = fbm(x * 0.9 + ox, z * 0.9 + oz, 4, salt + 7);
      const ridge = fbm(x * 1.8 + ox * 2, z * 1.8 + oz * 2, 2, salt + 13);
      let h = falloff * (0.15 + hills * heightScale + ridge * 0.35);

      // Central plateau bump
      const center = Math.max(0, 1 - dist * 1.6);
      h += center * center * 0.55 * falloff;

      if (dist > edge * 0.98) h *= 0.15;
      if (dist > 1.05) h = -0.08;

      heights[iz]![ix] = h;
      if (h > peakY) peakY = h;
    }
  }

  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const u = ix / segments;
      const v = iz / segments;
      const x = (u - 0.5) * 2 * radius;
      const z = (v - 0.5) * 2 * radius;
      const y = heights[iz]![ix]!;
      positions.push(x, y, z);

      const dist = Math.hypot(x, z) / radius;
      let col: [number, number, number];
      if (y < 0.08 || dist > 0.78) {
        col = shore;
      } else if (y > peakY * 0.62 && dist < 0.45) {
        col = lerpColor(land, cliff, 0.35);
      } else if (y > 0.55 && dist > 0.5) {
        col = lerpColor(land, cliff, 0.55);
      } else {
        const tint = fbm(x + ox, z + oz, 2, salt + 21);
        col = lerpColor(land, shore, tint * 0.12);
      }
      // Era neon / wire punch
      if (look.shading === "neon") {
        col = lerpColor(col, hexToRgb(look.accent), 0.25);
      }
      colors.push(col[0], col[1], col[2]);
    }
  }

  const stride = segments + 1;
  for (let iz = 0; iz < segments; iz++) {
    for (let ix = 0; ix < segments; ix++) {
      const a = iz * stride + ix;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const props: PropInstance[] = [];
  if (detail === "near") {
    const attempts = 48;
    for (let i = 0; i < attempts; i++) {
      const ang = rng() * Math.PI * 2;
      const r = (0.25 + rng() * 0.55) * radius;
      const px = Math.cos(ang) * r;
      const pz = Math.sin(ang) * r;
      // Sample height from nearest grid
      const u = (px / (2 * radius) + 0.5) * segments;
      const v = (pz / (2 * radius) + 0.5) * segments;
      const ix = Math.max(0, Math.min(segments, Math.round(u)));
      const iz = Math.max(0, Math.min(segments, Math.round(v)));
      const py = heights[iz]![ix]!;
      if (py < 0.18) continue;
      const roll = rng();
      let kind: PropInstance["kind"];
      if (roll < 0.28) kind = "palm";
      else if (roll < 0.48) kind = "tree";
      else if (roll < 0.68) kind = "rock";
      else if (roll < 0.85) kind = "bush";
      else kind = "grass";
      props.push({
        kind,
        position: [px, py, pz],
        scale: 0.65 + rng() * 0.7,
        rotationY: rng() * Math.PI * 2,
      });
    }
  }

  return { geometry, props, radius, peakY };
}

/** Deterministic seed helper for island ids / positions. */
export function islandSeedFromId(id: string, salt = ""): string {
  return `${id}:${salt}`;
}
