import type { IslandDefinition, IslandSaveV1 } from "./types";
import { getIslandTheme } from "./themes/islandThemes";
import { getGalapagosProfile, type GalapagosProfile } from "./galapagosIslands";
import { isIslandProgressLocked } from "./progressGates";
import {
  HARBOR_HAVEN_ID,
  HUB_ISLAND_ID,
  isHubIslandId,
  LEGACY_HUB_ISLAND_ID,
} from "./islandIds";
import { SIDE_SHORE_TRAVEL_IDS, SPINE_TRAVEL_IDS } from "./spineArchipelago";
import {
  PHI_INV,
  SEED_HUB,
  SEED_SIDE_R,
  SEED_SPINE_R,
} from "./sacredGeometry";

export {
  HARBOR_HAVEN_ID,
  HUB_ISLAND_ID,
  isHubIslandId,
  LEGACY_HUB_ISLAND_ID,
  COVE_ISLAND_ID,
  PAYCHECK_PENINSULA_ID,
  COVE_CHANGE_QUEST_ID,
} from "./islandIds";

/** World-space radius between hub and outer islands (POV voyage units). */
export const ARCHIPELAGO_WORLD_RADIUS = 920;

/** Inner ring (spine triangle) — closer to Harbor. */
export const SPINE_WORLD_RADIUS = ARCHIPELAGO_WORLD_RADIUS * 0.72;
/** Outer ring (era side shores) — discoverable beyond the spine. */
export const SIDE_SHORE_WORLD_RADIUS = ARCHIPELAGO_WORLD_RADIUS * 1.12;

/** Map view: hub center (%) — Seed of Life. */
export const MAP_HUB = { ...SEED_HUB };

/**
 * Sacred-geometry dual ring (Seed of Life):
 * spine inside · side ring at φ · water gaps between shores (readable rhythm).
 */
export const MAP_SPINE_RX = SEED_SPINE_R;
export const MAP_SPINE_RY = SEED_SPINE_R * PHI_INV;
/** Map view: side-shore outer ring ellipse radii (%). */
export const MAP_SIDE_RX = SEED_SIDE_R;
export const MAP_SIDE_RY = SEED_SIDE_R * PHI_INV;

/** @deprecated Prefer MAP_SPINE_* / MAP_SIDE_* — kept for callers expecting legacy names. */
export const MAP_RING_RX = MAP_SIDE_RX;
export const MAP_RING_RY = MAP_SIDE_RY;

export type ArchipelagoNode = {
  island: IslandDefinition;
  isHub: boolean;
  /** Aerial map position (percent). */
  mapX: number;
  mapY: number;
  /** POV world coordinates (hub at origin). */
  worldX: number;
  worldY: number;
  angle: number;
  themeAccent: string;
  galapagos: GalapagosProfile;
  /** Dual-ring lane for visual rhythm. */
  ring: "hub" | "spine" | "side";
};

export function resolveHubIsland(islands: IslandDefinition[]): IslandDefinition {
  return (
    islands.find((i) => i.id === HUB_ISLAND_ID) ||
    islands.find((i) => i.id === LEGACY_HUB_ISLAND_ID) ||
    islands[0]!
  );
}

function placeRing(
  islands: IslandDefinition[],
  opts: {
    ring: "spine" | "side";
    mapRx: number;
    mapRy: number;
    worldR: number;
    startAngle: number;
  },
): ArchipelagoNode[] {
  const count = Math.max(1, islands.length);
  return islands.map((island, index) => {
    const angle = opts.startAngle + (index / count) * Math.PI * 2;
    const theme = getIslandTheme(island.id, island.themeId);
    return {
      island,
      isHub: false,
      mapX: MAP_HUB.x + Math.cos(angle) * opts.mapRx,
      mapY: MAP_HUB.y + Math.sin(angle) * opts.mapRy,
      worldX: Math.sin(angle) * opts.worldR,
      worldY: -Math.cos(angle) * opts.worldR,
      angle,
      themeAccent: theme.accent,
      galapagos: getGalapagosProfile(island.id),
      ring: opts.ring,
    };
  });
}

/**
 * Dual-ring Fortune Archipelago:
 * Harbor hub · inner spine triangle · outer era side shores.
 */
export function buildArchipelagoLayout(islands: IslandDefinition[]): {
  hub: ArchipelagoNode;
  outer: ArchipelagoNode[];
  all: ArchipelagoNode[];
} {
  const hubIsland = resolveHubIsland(islands);
  const hubTheme = getIslandTheme(hubIsland.id, hubIsland.themeId);

  const hub: ArchipelagoNode = {
    island: hubIsland,
    isHub: true,
    mapX: MAP_HUB.x,
    mapY: MAP_HUB.y,
    worldX: 0,
    worldY: 0,
    angle: 0,
    themeAccent: hubTheme.accent,
    galapagos: getGalapagosProfile(hubIsland.id),
    ring: "hub",
  };

  const byId = new Map(islands.map((i) => [i.id, i]));
  const spineOuter = SPINE_TRAVEL_IDS.map((id) => byId.get(id))
    .filter((i): i is IslandDefinition => Boolean(i) && i.id !== hubIsland.id);

  const sideKnown = SIDE_SHORE_TRAVEL_IDS.map((id) => byId.get(id)).filter(
    (i): i is IslandDefinition => Boolean(i),
  );
  const claimed = new Set([hubIsland.id, ...spineOuter.map((i) => i.id), ...sideKnown.map((i) => i.id)]);
  const sideExtras = islands
    .filter((i) => !claimed.has(i.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sideOuter = [...sideKnown, ...sideExtras];

  const spineNodes = placeRing(spineOuter, {
    ring: "spine",
    mapRx: MAP_SPINE_RX,
    mapRy: MAP_SPINE_RY,
    worldR: SPINE_WORLD_RADIUS,
    startAngle: -Math.PI / 2,
  });
  const sideNodes = placeRing(sideOuter, {
    ring: "side",
    mapRx: MAP_SIDE_RX,
    mapRy: MAP_SIDE_RY,
    worldR: SIDE_SHORE_WORLD_RADIUS,
    // Offset so side shores don't sit directly behind spine chips.
    startAngle: -Math.PI / 2 + Math.PI / 8,
  });

  const outer = [...spineNodes, ...sideNodes];
  return { hub, outer, all: [hub, ...outer] };
}

export function getArchipelagoNode(
  layout: ReturnType<typeof buildArchipelagoLayout>,
  islandId: string,
): ArchipelagoNode | undefined {
  return layout.all.find((n) => n.island.id === islandId);
}

export function isIslandLocked(
  island: IslandDefinition,
  inventory: string[],
  save?: IslandSaveV1,
): boolean {
  if (save) return isIslandProgressLocked(island, save);
  return (island.requiredItems || []).some((id) => !inventory.includes(id));
}
