/**
 * Shore layout — Mario 64–style plaza pads derived from island content.
 * Dock lands here: walk, talk, play pads, optional party board — never an instant quiz.
 */

import type { IslandDefinition } from "./types";
import { isKinestheticComponent, partyDashIdForIsland, partyPlayKind } from "./partyPlayStyle";

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
  /** For npc / play_pad / item */
  refId?: string;
  /** Kinesthetic lead for this pad */
  minigameId?: string;
  subtitle?: string;
};

function ringPos(index: number, total: number, radius: number, y = 0): [number, number, number] {
  const ang = -Math.PI / 2 + (index / Math.max(1, total)) * Math.PI * 2;
  return [Math.cos(ang) * radius, y, Math.sin(ang) * radius];
}

/**
 * Build walkable shore hotspots for any chapter island.
 * Always includes pier + journal + party board; play pads prefer kinesthetic games.
 */
export function buildShoreHotspots(island: IslandDefinition): ShoreHotspot[] {
  const spots: ShoreHotspot[] = [];

  spots.push({
    id: "pier",
    kind: "pier",
    label: "Money Carpet Pier",
    icon: "🪄",
    position: [0, 0, 11.5],
    subtitle: "Float home or voyage onward",
  });

  spots.push({
    id: "party_board",
    kind: "party_board",
    label: "Fortune Party Plaza",
    icon: "🎲",
    position: [-8.5, 0, -2],
    subtitle: "Optional Mario Party–style board",
  });

  spots.push({
    id: "journal",
    kind: "journal",
    label: "Quest Journal",
    icon: "📜",
    position: [8.5, 0, -2],
    subtitle: "Quests, bag, and chapter notes",
  });

  const games = island.minigames ?? [];
  const kinesthetic = games.filter((g) => isKinestheticComponent(g.componentId));
  const needsDash = kinesthetic.length === 0;

  const padGames = needsDash
    ? [
        {
          id: partyDashIdForIsland(island.id),
          name: `${island.name} Party Dash`,
          icon: "🏃",
          componentId: "PartyDashMinigame",
          description: "Kinesthetic warm-up — move, catch, dodge. Quiz comes after.",
        },
        ...kinesthetic,
      ]
    : kinesthetic;

  // Cap play pads so the plaza stays readable (Mario Party boards aren’t crowded).
  const pads = padGames.slice(0, 4);
  pads.forEach((g, i) => {
    const pos = ringPos(i, Math.max(pads.length, 3), 6.2);
    // Keep pads on the north half so pier stays clear
    const x = pos[0]!;
    const z = Math.min(pos[2]!, -1.5);
    spots.push({
      id: `play_${g.id}`,
      kind: "play_pad",
      label: g.name,
      icon: g.icon || "🕹️",
      position: [x, 0, z],
      refId: g.id,
      minigameId: g.id,
      subtitle: "Play first — mastery quiz after you clear it",
    });
  });

  // NPCs around the outer ring (talk first, immerse)
  const npcs = island.npcs.slice(0, 6);
  npcs.forEach((npc, i) => {
    const pos = ringPos(i, Math.max(npcs.length, 4), 9.2);
    spots.push({
      id: `npc_${npc.id}`,
      kind: "npc",
      label: npc.name,
      icon: npc.icon || "💬",
      position: [pos[0]!, 0, pos[2]!],
      refId: npc.id,
      subtitle: "Talk",
    });
  });

  // A few ground items as collect pads
  const items = (island.items ?? []).filter((it) => it.location?.areaId).slice(0, 3);
  items.forEach((item, i) => {
    const pos = ringPos(i + 0.5, 4, 4.4);
    spots.push({
      id: `item_${item.id}`,
      kind: "item",
      label: item.name,
      icon: item.icon || "📦",
      position: [pos[0]! * 0.7, 0, Math.max(pos[2]!, 2.5)],
      refId: item.id,
      subtitle: "Pick up",
    });
  });

  return spots;
}

/** True when this island should inject a runtime Party Dash minigame def. */
export function islandNeedsPartyDash(island: IslandDefinition): boolean {
  const games = island.minigames ?? [];
  return !games.some((g) => isKinestheticComponent(g.componentId));
}

export function describeShoreGame(componentId: string): string {
  const kind = partyPlayKind(componentId);
  if (kind === "kinesthetic") return "Movement game";
  if (kind === "quiz") return "Mastery quiz (after play)";
  return "Strategy challenge";
}
