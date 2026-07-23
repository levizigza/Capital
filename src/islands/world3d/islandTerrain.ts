/**
 * Seeded radial heightfield islands — stylized low-poly silhouettes
 * (shore → grass → rock) without franchise art.
 */

import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";
import type { BiomePropKind, IslandBiome } from "./islandBiomes";

export type IslandDetail = "far" | "near";

export type PropInstance = {
  kind: BiomePropKind;
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
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [
    number,
    number,
    number,
  ];
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function darken(c: [number, number, number], amt: number): [number, number, number] {
  return [c[0] * (1 - amt), c[1] * (1 - amt), c[2] * (1 - amt)];
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
 * Optional biome reshapes coast elongation, height, and prop species.
 */
export function buildIslandTerrain(
  seed: string,
  look: EraLook3D,
  detail: IslandDetail = "near",
  biome?: IslandBiome | null,
): IslandTerrainResult {
  const seedNum = hashSeed(seed);
  const rng = mulberry32(seedNum);
  const ox = (seedNum % 1000) / 17;
  const oz = (hashSeed(seed + "z") % 1000) / 19;
  const salt = seedNum;

  const segments = detail === "near" ? 88 : 40;
  const radius = 3.45 + rng() * 0.95;
  const heightScale = (1.45 + rng() * 0.65) * (biome?.coast.heightScale ?? 1);
  const elongateX = biome?.coast.elongateX ?? 1;
  const elongateZ = biome?.coast.elongateZ ?? 1;
  const bayAmp = biome?.coast.bayAmp ?? 0.08;
  const peakBias = biome?.coast.peakBias ?? 0.4;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const shore = hexToRgb(look.shore);
  const wetSand = darken(lerpColor(shore, hexToRgb(biome?.rock ?? "#d6b87a"), 0.35), 0.08);
  const land = hexToRgb(look.land);
  const deepGrass = darken(land, 0.22);
  const rock = hexToRgb(biome?.rock ?? (look.shading === "neon" ? look.accent : "#7c746c"));
  const cliff = hexToRgb(biome?.cliff ?? "#57534e");

  const heights: number[][] = [];
  let peakY = 0;

  for (let iz = 0; iz <= segments; iz++) {
    heights[iz] = [];
    for (let ix = 0; ix <= segments; ix++) {
      const u = ix / segments;
      const v = iz / segments;
      const x = (u - 0.5) * 2 * radius * elongateX;
      const z = (v - 0.5) * 2 * radius * elongateZ;
      const dist = Math.hypot(x / elongateX, z / elongateZ) / radius;

      // Soft irregular coastline with bay / headland variation
      const coastNoise = fbm(x * 0.55 + ox, z * 0.55 + oz, 4, salt);
      const bay = fbm(x * 0.25 + ox, z * 0.25 + oz, 2, salt + 3);
      const edge = 0.7 + coastNoise * 0.2 + bay * bayAmp;
      const falloff = Math.max(0, 1 - Math.pow(Math.min(1, dist / edge), 2.55));

      const hills = fbm(x * 0.85 + ox, z * 0.85 + oz, 5, salt + 7);
      const ridge = fbm(x * 1.9 + ox * 2, z * 1.9 + oz * 2, 3, salt + 13);
      const terrace = Math.floor(hills * 4) / 4; // soft stepped plateaus
      let h =
        falloff *
        (0.12 + hills * heightScale * 0.72 + terrace * heightScale * 0.28 + ridge * 0.42);

      // Central plateau bump + secondary ridge
      const center = Math.max(0, 1 - dist * 1.55);
      h += center * center * (0.4 + peakBias * 0.55) * falloff;
      const spur = Math.max(0, 1 - Math.abs(dist - 0.42) * 4.5);
      h += spur * ridge * 0.28 * falloff;

      if (dist > edge * 0.97) h *= 0.18;
      if (dist > 1.04) h = -0.1;

      heights[iz]![ix] = h;
      if (h > peakY) peakY = h;
    }
  }

  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const u = ix / segments;
      const v = iz / segments;
      const x = (u - 0.5) * 2 * radius * elongateX;
      const z = (v - 0.5) * 2 * radius * elongateZ;
      const y = heights[iz]![ix]!;
      positions.push(x, y, z);

      const dist = Math.hypot(x / elongateX, z / elongateZ) / radius;
      const mottled = fbm(x * 1.4 + ox, z * 1.4 + oz, 3, salt + 21);
      let col: [number, number, number];

      if (y < 0.02 || dist > 0.92) {
        col = wetSand;
      } else if (y < 0.12 || dist > 0.78) {
        col = lerpColor(shore, wetSand, mottled * 0.35);
      } else if (y > peakY * 0.68 || (y > 0.7 && dist > 0.48)) {
        col = lerpColor(cliff, rock, mottled * 0.4);
      } else if (y > 0.45 && dist > 0.55) {
        col = lerpColor(deepGrass, cliff, 0.45 + mottled * 0.2);
      } else if (dist < 0.28) {
        col = lerpColor(land, deepGrass, 0.25 + mottled * 0.2);
      } else {
        col = lerpColor(land, shore, mottled * 0.1);
        col = lerpColor(col, deepGrass, mottled * 0.22);
      }

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
    const sampleH = (px: number, pz: number) => {
      const u = (px / (2 * radius * elongateX) + 0.5) * segments;
      const v = (pz / (2 * radius * elongateZ) + 0.5) * segments;
      const ix = Math.max(0, Math.min(segments, Math.round(u)));
      const iz = Math.max(0, Math.min(segments, Math.round(v)));
      return heights[iz]![ix]!;
    };

    const weights = biome?.propWeights;
    const pickKind = (roll: number, dist: number, py: number): BiomePropKind => {
      if (weights) {
        const entries = Object.entries(weights) as [BiomePropKind, number][];
        const total = entries.reduce((s, [, w]) => s + w, 0) || 1;
        let acc = 0;
        const r = roll * total;
        for (const [k, w] of entries) {
          acc += w;
          if (r <= acc) return k;
        }
        return entries[0]?.[0] ?? "rock";
      }
      // Legacy tropical bias
      if (dist > 0.62) {
        if (roll < 0.45) return "palm";
        if (roll < 0.65) return "rock";
        if (roll < 0.82) return "bush";
        return "grass";
      }
      if (py > peakY * 0.55) {
        if (roll < 0.55) return "rock";
        if (roll < 0.75) return "bush";
        return "grass";
      }
      if (dist < 0.35) {
        if (roll < 0.4) return "tree";
        if (roll < 0.6) return "bush";
        if (roll < 0.78) return "grass";
        return "rock";
      }
      if (roll < 0.22) return "palm";
      if (roll < 0.45) return "tree";
      if (roll < 0.62) return "bush";
      if (roll < 0.78) return "rock";
      return "grass";
    };

    const attempts = 78;
    for (let i = 0; i < attempts; i++) {
      const ang = rng() * Math.PI * 2;
      const r = (0.22 + rng() * 0.62) * radius;
      const px = Math.cos(ang) * r * elongateX;
      const pz = Math.sin(ang) * r * elongateZ;
      const py = sampleH(px, pz);
      if (py < 0.14) continue;
      const dist = Math.hypot(px / elongateX, pz / elongateZ) / radius;
      const kind = pickKind(rng(), dist, py);
      if (kind === "hut") continue;
      props.push({
        kind,
        position: [px, py, pz],
        scale: 0.6 + rng() * 0.75,
        rotationY: rng() * Math.PI * 2,
      });
    }

    // Village cottages on the inland plateau (only if biome allows huts)
    const hutWeight = weights?.hut ?? 0.08;
    if (hutWeight > 0.02) {
      const hutCount = 2 + Math.floor(rng() * 3);
      for (let i = 0; i < hutCount; i++) {
        const ang = rng() * Math.PI * 2;
        const r = (0.12 + rng() * 0.28) * radius;
        const px = Math.cos(ang) * r * elongateX;
        const pz = Math.sin(ang) * r * elongateZ;
        const py = sampleH(px, pz);
        if (py < 0.22) continue;
        props.push({
          kind: "hut",
          position: [px, py, pz],
          scale: 0.85 + rng() * 0.35,
          rotationY: rng() * Math.PI * 2,
        });
      }
    }
  }

  return { geometry, props, radius, peakY };
}

/** Deterministic seed helper for island ids / positions. */
export function islandSeedFromId(id: string, salt = ""): string {
  return `${id}:${salt}`;
}
