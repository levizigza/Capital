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

/** Map view: hub center (%). */
export const MAP_HUB = { x: 50, y: 54 };

/** Map view: outer ring ellipse radii (%). */
export const MAP_RING_RX = 38;
export const MAP_RING_RY = 34;

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
};

export function resolveHubIsland(islands: IslandDefinition[]): IslandDefinition {
  return (
    islands.find((i) => i.id === HUB_ISLAND_ID) ||
    islands.find((i) => i.id === LEGACY_HUB_ISLAND_ID) ||
    islands[0]!
  );
}

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
  };

  // Prefer Coincraft Cove as the first outer pin (first painting).
  const outerIslands = islands
    .filter((i) => !isHubIslandId(i.id) && i.id !== hubIsland.id)
    .slice()
    .sort((a, b) => {
      if (a.id === "coincraft_cove") return -1;
      if (b.id === "coincraft_cove") return 1;
      if (a.id === "paycheck_peninsula") return -1;
      if (b.id === "paycheck_peninsula") return 1;
      return a.name.localeCompare(b.name);
    });
  const count = Math.max(1, outerIslands.length);
  const startAngle = -Math.PI / 2;

  const outer: ArchipelagoNode[] = outerIslands.map((island, index) => {
    const angle = startAngle + (index / count) * Math.PI * 2;
    const theme = getIslandTheme(island.id, island.themeId);
    const mapX = MAP_HUB.x + Math.cos(angle) * MAP_RING_RX;
    const mapY = MAP_HUB.y + Math.sin(angle) * MAP_RING_RY;
    const worldX = Math.sin(angle) * ARCHIPELAGO_WORLD_RADIUS;
    const worldY = -Math.cos(angle) * ARCHIPELAGO_WORLD_RADIUS;

    return {
      island,
      isHub: false,
      mapX,
      mapY,
      worldX,
      worldY,
      angle,
      themeAccent: theme.accent,
      galapagos: getGalapagosProfile(island.id),
    };
  });

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
