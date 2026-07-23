/**
 * Shore layout — culture-shaped plaza pads (SM64 painting rooms with local flavor).
 */

import type { IslandDefinition } from "./types";
import { isKinestheticComponent, partyDashIdForIsland } from "./partyPlayStyle";
import {
  getIslandCulture,
  shoreAnchorsForCulture,
  castForIslandNpc,
} from "./islandCulture";

export type ShoreHotspotKind =
  | "pier"
  | "party_board"
  | "journal"
  | "npc"
  | "play_pad"
  | "item";

export type ShoreHotspot = {
  id: string;
  kind: ShoreHotspotKind;
  label: string;
  icon: string;
  position: [number, number, number];
  refId?: string;
  minigameId?: string;
  subtitle?: string;
  /** Resolved mascot for NPC pads */
  mascotId?: string;
};

function ringPos(
  index: number,
  total: number,
  radius: number,
  angle0: number,
  y = 0,
): [number, number, number] {
  const ang = angle0 + (index / Math.max(1, total)) * Math.PI * 2;
  return [Math.cos(ang) * radius, y, Math.sin(ang) * radius];
}

function clusterPos(
  index: number,
  total: number,
  radius: number,
  angle0: number,
): [number, number, number] {
  const groups = Math.max(2, Math.ceil(total / 2));
  const g = index % groups;
  const inG = Math.floor(index / groups);
  const ang = angle0 + (g / groups) * Math.PI * 2;
  const r = radius - inG * 1.1;
  return [Math.cos(ang) * r, 0, Math.sin(ang) * r];
}

/**
 * Build walkable shore hotspots shaped by island culture.
 */
export function buildShoreHotspots(island: IslandDefinition): ShoreHotspot[] {
  const culture = getIslandCulture(island);
  const a = shoreAnchorsForCulture(culture);
  const spots: ShoreHotspot[] = [];

  spots.push({
    id: "pier",
    kind: "pier",
    label: "Money Carpet Pier",
    icon: "🪄",
    position: a.pier,
    subtitle: "Float home or voyage onward",
  });

  spots.push({
    id: "party_board",
    kind: "party_board",
    label: "Fortune Party Plaza",
    icon: "🎲",
    position: a.party,
    subtitle: "Optional tomfoolery — never required",
  });

  spots.push({
    id: "journal",
    kind: "journal",
    label: "Quest Journal",
    icon: "📜",
    position: a.journal,
    subtitle: "Quests, bag, and chapter notes",
  });

  const games = island.minigames ?? [];
  const kinesthetic = games.filter((g) => isKinestheticComponent(g.componentId));
  const needsDash = kinesthetic.length === 0;

  const padGames = needsDash
    ? [
        {
          id: partyDashIdForIsland(island.id),
          name: `${island.name} Painting Arena`,
          icon: "🖼️",
          componentId: "PartyArenaMinigame",
          description: "Dive the painting — 3D action world.",
        },
        ...kinesthetic,
      ]
    : kinesthetic;

  const pads = padGames.slice(0, 4);
  pads.forEach((g, i) => {
    const pos = a.npcCluster
      ? clusterPos(i, Math.max(pads.length, 3), a.padRadius, a.npcAngle0)
      : ringPos(i, Math.max(pads.length, 3), a.padRadius, a.npcAngle0);
    spots.push({
      id: `play_${g.id}`,
      kind: "play_pad",
      label: g.name,
      icon: g.icon || "🖼️",
      position: [pos[0]!, 0, Math.min(pos[2]!, a.pier[2]! - 3)],
      refId: g.id,
      minigameId: g.id,
      subtitle: "Painting portal — dive into a 3D game world",
    });
  });

  const npcs = island.npcs.slice(0, 6);
  npcs.forEach((npc, i) => {
    const pos = a.npcCluster
      ? clusterPos(i, Math.max(npcs.length, 4), a.npcRadius, a.npcAngle0 + 0.35)
      : ringPos(i, Math.max(npcs.length, 4), a.npcRadius, a.npcAngle0 + 0.35);
    const mascot = castForIslandNpc(island, npc.id, npc.mascotId);
    spots.push({
      id: `npc_${npc.id}`,
      kind: "npc",
      label: npc.name,
      icon: npc.icon || mascot.emoji || "💬",
      position: pos,
      refId: npc.id,
      mascotId: mascot.id,
      subtitle: `${culture.cultureName} · Talk`,
    });
  });

  const items = (island.items ?? []).filter((it) => it.location?.areaId).slice(0, 3);
  items.forEach((item, i) => {
    const pos = ringPos(i + 0.5, 4, a.itemRadius, a.npcAngle0);
    spots.push({
      id: `item_${item.id}`,
      kind: "item",
      label: item.name,
      icon: item.icon || "📦",
      position: [pos[0]! * 0.85, 0, Math.max(pos[2]!, 2.2)],
      refId: item.id,
      subtitle: "Pick up",
    });
  });

  return spots;
}

export function islandNeedsPartyDash(island: IslandDefinition): boolean {
  const games = island.minigames ?? [];
  return !games.some((g) => isKinestheticComponent(g.componentId));
}

export function describeShoreGame(componentId: string): string {
  void componentId;
  return "Movement game";
}
