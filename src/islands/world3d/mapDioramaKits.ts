/**
 * Travel-map diorama kits — architecture + ecology per genre city.
 * Keeps islands readable as distinct mini-worlds at isometric distance.
 * IP-safe original silhouettes only (see genreWorlds / ip-safe-design).
 */

import type { GenreWorldId } from "../genreWorlds";
import { GENRE_BY_ISLAND } from "../genreWorlds";

export type MapArchStyle =
  | "harbor_cottages"
  | "neon_slabs"
  | "solar_domes"
  | "gene_bulbs"
  | "upload_spires"
  | "orbital_habitats"
  | "scrap_shacks"
  | "ai_terminals";

export type MapEcologyStyle =
  | "meadow_palms"
  | "neon_pylons"
  | "solar_trees"
  | "gene_mangrove"
  | "ice_nodes"
  | "scrap_wrecks"
  | "orbital_dishes"
  | "mind_crystals";

export type MapDioramaKit = {
  arch: MapArchStyle;
  ecology: MapEcologyStyle;
  /** Building count on the plateau */
  buildingCount: number;
  /** Ecology landmark count around the rim */
  ecologyCount: number;
  houseBodies: string[];
  roofAccentFallback: string;
};

const KITS: Record<GenreWorldId | "harbor", MapDioramaKit> = {
  harbor: {
    arch: "harbor_cottages",
    ecology: "meadow_palms",
    buildingCount: 6,
    ecologyCount: 5,
    houseBodies: ["#fef3c7", "#ecfccb", "#e0f2fe", "#ffe4e6"],
    roofAccentFallback: "#ea580c",
  },
  cyberpunk: {
    arch: "neon_slabs",
    ecology: "neon_pylons",
    buildingCount: 8,
    ecologyCount: 6,
    houseBodies: ["#1e1b4b", "#312e81", "#4c1d95", "#0f172a"],
    roofAccentFallback: "#22d3ee",
  },
  solarpunk: {
    arch: "solar_domes",
    ecology: "solar_trees",
    buildingCount: 6,
    ecologyCount: 7,
    houseBodies: ["#ecfccb", "#d9f99d", "#fef9c3", "#bbf7d0"],
    roofAccentFallback: "#16a34a",
  },
  biopunk: {
    arch: "gene_bulbs",
    ecology: "gene_mangrove",
    buildingCount: 5,
    ecologyCount: 7,
    houseBodies: ["#14532d", "#166534", "#052e16", "#064e3b"],
    roofAccentFallback: "#34d399",
  },
  posthuman: {
    arch: "upload_spires",
    ecology: "mind_crystals",
    buildingCount: 5,
    ecologyCount: 6,
    houseBodies: ["#f5f3ff", "#ede9fe", "#e9d5ff", "#ddd6fe"],
    roofAccentFallback: "#a855f7",
  },
  spacefaring: {
    arch: "orbital_habitats",
    ecology: "orbital_dishes",
    buildingCount: 5,
    ecologyCount: 5,
    houseBodies: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b"],
    roofAccentFallback: "#38bdf8",
  },
  post_apocalyptic: {
    arch: "scrap_shacks",
    ecology: "scrap_wrecks",
    buildingCount: 7,
    ecologyCount: 6,
    houseBodies: ["#78716c", "#57534e", "#a8a29e", "#44403c"],
    roofAccentFallback: "#fb923c",
  },
  ai_future: {
    arch: "ai_terminals",
    ecology: "ice_nodes",
    buildingCount: 6,
    ecologyCount: 6,
    houseBodies: ["#0f172a", "#1e293b", "#334155", "#020617"],
    roofAccentFallback: "#e2e8f0",
  },
};

export function getMapDioramaKit(islandId: string): MapDioramaKit {
  if (islandId === "harbor_haven") return KITS.harbor;
  const genre = GENRE_BY_ISLAND[islandId];
  return genre ? KITS[genre] : KITS.harbor;
}
