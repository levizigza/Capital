/**
 * Per-island biomes — every shore must read as a different place.
 * Era lens (decade shading) × biome palette/terrain = unique island DNA.
 * Genre worlds (`genreWorlds.ts`) layer city-culture on top — Harbor meadow stays hub-only.
 */

import type { AnimationStyleId } from "../animationStyles";
import { getIslandTheme } from "../themes/islandThemes";
import { getEraLook3D, type EraLook3D } from "./eraLooks";
import type { SkyMode } from "./ledgerlight";

export type BiomeId =
  | "harbor_meadow"
  | "tropical_lagoon"
  | "scrub_cay"
  | "chalk_lab"
  | "oscilloscope_tundra"
  | "phosphor_mangrove"
  | "synthwave_desert"
  | "obsidian_lava"
  | "kart_savanna"
  | "highland_forest"
  | "auction_mesa"
  | "iron_jungle"
  | "aurora_isles"
  | "mist_cliffs"
  | "nocturne_rift";

export type BiomePropKind =
  | "palm"
  | "tree"
  | "rock"
  | "grass"
  | "bush"
  | "hut"
  | "cactus"
  | "pine"
  | "ice_spire"
  | "mangrove"
  | "fern"
  | "crystal"
  | "dune_grass"
  | "column"
  | "antenna"
  /** Genre-city machines & landmarks */
  | "neon_pylon"
  | "solar_tree"
  | "gene_pod"
  | "wreckage"
  | "orbital_dish"
  | "drone_tower"
  | "upload_spire";

export type GroundShape =
  | "disc"
  | "hex"
  | "elongated"
  | "crescent_fill"
  | "mesa"
  | "floe"
  | "ring"
  | "floating";

export type IslandBiome = {
  id: BiomeId;
  label: string;
  /** Terrain / plaza palette (overrides era land/sea/sky when applied) */
  land: string;
  shore: string;
  sea: string;
  skyTop: string;
  skyBottom: string;
  fog: string;
  cliff: string;
  plaza: string;
  rock: string;
  fogNear?: number;
  fogFar?: number;
  ambientBoost?: number;
  propWeights: Partial<Record<BiomePropKind, number>>;
  coast: {
    elongateX: number;
    elongateZ: number;
    heightScale: number;
    bayAmp: number;
    peakBias: number;
  };
  groundShape: GroundShape;
  pierStyle: "wood" | "ice" | "neon" | "stone" | "rope";
  /** Living sky override — sunsets, star nights, perpetual void */
  skyMode?: SkyMode;
};

const BIOMES: Record<BiomeId, IslandBiome> = {
  harbor_meadow: {
    id: "harbor_meadow",
    label: "Temperate harbor meadow",
    land: "#22c55e",
    shore: "#fde68a",
    sea: "#0ea5e9",
    skyTop: "#7dd3fc",
    skyBottom: "#fef3c7",
    fog: "#bae6fd",
    cliff: "#78716c",
    plaza: "#e7e5e4",
    rock: "#a8a29e",
    propWeights: { palm: 0.15, tree: 0.35, bush: 0.25, grass: 0.15, rock: 0.05, hut: 0.05 },
    coast: { elongateX: 1, elongateZ: 1, heightScale: 1, bayAmp: 0.1, peakBias: 0.4 },
    groundShape: "disc",
    pierStyle: "wood",
  },
  tropical_lagoon: {
    id: "tropical_lagoon",
    label: "Solarpunk canopy lagoon",
    land: "#16a34a",
    shore: "#fcd34d",
    sea: "#06b6d4",
    skyTop: "#38bdf8",
    skyBottom: "#fef08a",
    fog: "#a5f3fc",
    cliff: "#b45309",
    plaza: "#fef3c7",
    rock: "#d6d3d1",
    propWeights: { palm: 0.25, solar_tree: 0.3, bush: 0.15, grass: 0.1, hut: 0.1, rock: 0.1 },
    coast: { elongateX: 1.15, elongateZ: 0.9, heightScale: 0.85, bayAmp: 0.22, peakBias: 0.25 },
    groundShape: "crescent_fill",
    pierStyle: "rope",
    skyMode: "sunset",
  },
  scrub_cay: {
    id: "scrub_cay",
    label: "Solarpunk starter cay",
    land: "#a3e635",
    shore: "#f5d0a9",
    sea: "#38bdf8",
    skyTop: "#fde68a",
    skyBottom: "#fdba74",
    fog: "#fef3c7",
    cliff: "#a8a29e",
    plaza: "#e7e5e4",
    rock: "#d6d3d1",
    propWeights: { dune_grass: 0.25, solar_tree: 0.25, cactus: 0.15, bush: 0.15, rock: 0.15, grass: 0.05 },
    coast: { elongateX: 1.35, elongateZ: 0.7, heightScale: 0.55, bayAmp: 0.05, peakBias: 0.15 },
    groundShape: "elongated",
    pierStyle: "wood",
  },
  chalk_lab: {
    id: "chalk_lab",
    label: "Biopunk chalk lab",
    land: "#e7e5e4",
    shore: "#f5f5f4",
    sea: "#67e8f9",
    skyTop: "#e0f2fe",
    skyBottom: "#f8fafc",
    fog: "#f1f5f9",
    cliff: "#cbd5e1",
    plaza: "#f8fafc",
    rock: "#94a3b8",
    propWeights: { gene_pod: 0.3, crystal: 0.2, antenna: 0.15, rock: 0.2, grass: 0.1, bush: 0.05 },
    coast: { elongateX: 1, elongateZ: 1, heightScale: 0.7, bayAmp: 0.12, peakBias: 0.3 },
    groundShape: "hex",
    pierStyle: "stone",
  },
  oscilloscope_tundra: {
    id: "oscilloscope_tundra",
    label: "AI cognisphere floe",
    land: "#f8fafc",
    shore: "#cbd5e1",
    sea: "#0f172a",
    skyTop: "#020617",
    skyBottom: "#111827",
    fog: "#020617",
    cliff: "#e2e8f0",
    plaza: "#0f172a",
    rock: "#f1f5f9",
    fogNear: 14,
    fogFar: 90,
    ambientBoost: -0.2,
    propWeights: { drone_tower: 0.35, ice_spire: 0.25, crystal: 0.2, antenna: 0.15, rock: 0.05 },
    coast: { elongateX: 1.4, elongateZ: 0.85, heightScale: 1.35, bayAmp: 0.08, peakBias: 0.7 },
    groundShape: "floe",
    pierStyle: "ice",
    skyMode: "night",
  },
  phosphor_mangrove: {
    id: "phosphor_mangrove",
    label: "Biopunk gene mangrove",
    land: "#14532d",
    shore: "#166534",
    sea: "#052e16",
    skyTop: "#022c22",
    skyBottom: "#000000",
    fog: "#052e16",
    cliff: "#14532d",
    plaza: "#052e16",
    rock: "#22c55e",
    fogNear: 16,
    fogFar: 100,
    propWeights: { mangrove: 0.25, gene_pod: 0.3, fern: 0.15, crystal: 0.15, rock: 0.1, bush: 0.05 },
    coast: { elongateX: 1.05, elongateZ: 1.2, heightScale: 0.9, bayAmp: 0.28, peakBias: 0.35 },
    groundShape: "ring",
    pierStyle: "neon",
    skyMode: "night",
  },
  synthwave_desert: {
    id: "synthwave_desert",
    label: "Cyberpunk neon sprawl",
    land: "#c026d3",
    shore: "#22d3ee",
    sea: "#4c1d95",
    skyTop: "#2e1065",
    skyBottom: "#db2777",
    fog: "#6d28d9",
    cliff: "#86198f",
    plaza: "#312e81",
    rock: "#f0abfc",
    propWeights: { neon_pylon: 0.4, antenna: 0.2, cactus: 0.15, crystal: 0.15, rock: 0.1 },
    coast: { elongateX: 1.5, elongateZ: 0.75, heightScale: 0.95, bayAmp: 0.04, peakBias: 0.2 },
    groundShape: "elongated",
    pierStyle: "neon",
    skyMode: "night",
  },
  obsidian_lava: {
    id: "obsidian_lava",
    label: "AI terminal undercity",
    land: "#1c1917",
    shore: "#292524",
    sea: "#064e3b",
    skyTop: "#042f2e",
    skyBottom: "#134e4a",
    fog: "#0f172a",
    cliff: "#44403c",
    plaza: "#0c0a09",
    rock: "#34d399",
    propWeights: { drone_tower: 0.3, crystal: 0.25, antenna: 0.2, rock: 0.15, column: 0.1 },
    coast: { elongateX: 0.95, elongateZ: 1.1, heightScale: 1.4, bayAmp: 0.15, peakBias: 0.85 },
    groundShape: "mesa",
    pierStyle: "stone",
    skyMode: "night",
  },
  kart_savanna: {
    id: "kart_savanna",
    label: "Post-apoc scrap coast",
    land: "#ca8a04",
    shore: "#fbbf24",
    sea: "#0284c7",
    skyTop: "#38bdf8",
    skyBottom: "#fde68a",
    fog: "#7dd3fc",
    cliff: "#a16207",
    plaza: "#fef3c7",
    rock: "#78716c",
    propWeights: { wreckage: 0.35, tree: 0.2, grass: 0.15, bush: 0.1, hut: 0.1, rock: 0.1 },
    coast: { elongateX: 1.25, elongateZ: 0.85, heightScale: 1.05, bayAmp: 0.14, peakBias: 0.45 },
    groundShape: "elongated",
    pierStyle: "wood",
  },
  highland_forest: {
    id: "highland_forest",
    label: "Spacefaring orbital highlands",
    land: "#166534",
    shore: "#365314",
    sea: "#1e3a5f",
    skyTop: "#1e3a8a",
    skyBottom: "#86efac",
    fog: "#bfdbfe",
    cliff: "#44403c",
    plaza: "#d6d3d1",
    rock: "#57534e",
    fogNear: 35,
    fogFar: 160,
    propWeights: { orbital_dish: 0.3, pine: 0.25, fern: 0.15, tree: 0.1, hut: 0.1, rock: 0.1 },
    coast: { elongateX: 0.9, elongateZ: 1.15, heightScale: 1.55, bayAmp: 0.1, peakBias: 0.75 },
    groundShape: "mesa",
    pierStyle: "stone",
  },
  auction_mesa: {
    id: "auction_mesa",
    label: "Space colony deed mesa",
    land: "#c2410c",
    shore: "#fdba74",
    sea: "#0369a1",
    skyTop: "#f97316",
    skyBottom: "#fef3c7",
    fog: "#fed7aa",
    cliff: "#9a3412",
    plaza: "#fef3c7",
    rock: "#78716c",
    propWeights: { orbital_dish: 0.25, cactus: 0.2, dune_grass: 0.2, column: 0.15, rock: 0.1, hut: 0.1 },
    coast: { elongateX: 1.2, elongateZ: 0.8, heightScale: 1.6, bayAmp: 0.06, peakBias: 0.9 },
    groundShape: "mesa",
    pierStyle: "stone",
    skyMode: "sunset",
  },
  iron_jungle: {
    id: "iron_jungle",
    label: "Post-apoc credit ruins",
    land: "#3f6212",
    shore: "#9a3412",
    sea: "#1c1917",
    skyTop: "#1c1917",
    skyBottom: "#44403c",
    fog: "#292524",
    cliff: "#7f1d1d",
    plaza: "#44403c",
    rock: "#a8a29e",
    fogNear: 40,
    fogFar: 180,
    propWeights: { wreckage: 0.3, column: 0.25, fern: 0.2, tree: 0.1, rock: 0.15 },
    coast: { elongateX: 1.05, elongateZ: 1.05, heightScale: 1.25, bayAmp: 0.18, peakBias: 0.55 },
    groundShape: "disc",
    pierStyle: "rope",
    skyMode: "night",
  },
  aurora_isles: {
    id: "aurora_isles",
    label: "Solarpunk sky gardens",
    land: "#4ade80",
    shore: "#f5e6b8",
    sea: "#1a6b8a",
    skyTop: "#1e1b4b",
    skyBottom: "#f472b6",
    fog: "#312e81",
    cliff: "#5b21b6",
    plaza: "#ede9fe",
    rock: "#e8c86a",
    fogNear: 50,
    fogFar: 220,
    propWeights: { solar_tree: 0.3, crystal: 0.2, fern: 0.15, grass: 0.15, bush: 0.1, ice_spire: 0.1 },
    coast: { elongateX: 0.85, elongateZ: 0.85, heightScale: 0.75, bayAmp: 0.2, peakBias: 0.5 },
    groundShape: "floating",
    pierStyle: "neon",
    skyMode: "night",
  },
  mist_cliffs: {
    id: "mist_cliffs",
    label: "Posthuman mind cliffs",
    land: "#e9d5ff",
    shore: "#ddd6fe",
    sea: "#4c1d95",
    skyTop: "#4c1d95",
    skyBottom: "#ddd6fe",
    fog: "#f5f3ff",
    cliff: "#f8fafc",
    plaza: "#faf5ff",
    rock: "#a855f7",
    fogNear: 22,
    fogFar: 110,
    ambientBoost: 0.1,
    propWeights: { upload_spire: 0.35, column: 0.2, crystal: 0.2, pine: 0.1, rock: 0.15 },
    coast: { elongateX: 0.7, elongateZ: 1.45, heightScale: 1.7, bayAmp: 0.12, peakBias: 0.95 },
    groundShape: "elongated",
    pierStyle: "stone",
    skyMode: "sunset",
  },
  /** Perpetual-night alien ledger — biolum ecology, no sun */
  nocturne_rift: {
    id: "nocturne_rift",
    label: "Nocturne rift · alien night",
    land: "#0f172a",
    shore: "#312e81",
    sea: "#020617",
    skyTop: "#020617",
    skyBottom: "#1e1b4b",
    fog: "#0f172a",
    cliff: "#4c1d95",
    plaza: "#1e1b4b",
    rock: "#a78bfa",
    fogNear: 18,
    fogFar: 95,
    ambientBoost: -0.25,
    propWeights: {
      crystal: 0.3,
      upload_spire: 0.2,
      orbital_dish: 0.15,
      ice_spire: 0.15,
      gene_pod: 0.1,
      antenna: 0.1,
    },
    coast: { elongateX: 0.9, elongateZ: 1.15, heightScale: 1.35, bayAmp: 0.22, peakBias: 0.7 },
    groundShape: "ring",
    pierStyle: "neon",
    skyMode: "void",
  },
};

/** One unique biome per island — Harbor meadow is hub-only. */
export const BIOME_BY_ISLAND: Record<string, BiomeId> = {
  harbor_haven: "harbor_meadow",
  coincraft_cove: "tropical_lagoon",
  starter_key_cove: "scrub_cay",
  demo: "chalk_lab",
  paycheck_peninsula: "oscilloscope_tundra",
  signal_city: "phosphor_mangrove",
  venture_foundry: "synthwave_desert",
  digital_assets: "obsidian_lava",
  financial_assets: "kart_savanna",
  business_assets: "highland_forest",
  real_estate: "auction_mesa",
  credit_kingdom: "iron_jungle",
  future_shores: "aurora_isles",
  intangibles: "nocturne_rift",
};

export function getIslandBiome(islandId: string): IslandBiome {
  const id = BIOME_BY_ISLAND[islandId] ?? "scrub_cay";
  return BIOMES[id];
}

export function applyBiomeToLook(era: EraLook3D, biome: IslandBiome): EraLook3D {
  // Era shading stays; geography + palette + sky drama come from biome.
  return {
    ...era,
    skyTop: biome.skyTop,
    skyBottom: biome.skyBottom,
    fog: biome.fog,
    fogNear: biome.fogNear ?? era.fogNear,
    fogFar: biome.fogFar ?? era.fogFar,
    sea: biome.sea,
    land: biome.land,
    shore: biome.shore,
    ambientIntensity: Math.max(
      0.08,
      Math.min(0.95, era.ambientIntensity + (biome.ambientBoost ?? 0)),
    ),
    skyMode: biome.skyMode ?? era.skyMode,
  };
}

/** Era decade lens × island biome — use this for shores, map, flight, arenas. */
export function getIslandLook3D(
  islandId: string,
  styleOverride?: AnimationStyleId | string,
): EraLook3D {
  const theme = getIslandTheme(islandId);
  const era = getEraLook3D(styleOverride ?? theme.animationStyle);
  if (islandId === "harbor_haven") {
    // Hub stays pure capital-default meadow — never biome-warped into a chapter island.
    return era;
  }
  return applyBiomeToLook(era, getIslandBiome(islandId));
}

export function allBiomeIdsUniqueForKnownIslands(): boolean {
  const ids = Object.values(BIOME_BY_ISLAND);
  return new Set(ids).size === ids.length;
}
