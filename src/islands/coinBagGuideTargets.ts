/**
 * Resolve where Coin Bag should POINT (never race ahead).
 * Used by Harbor plaza + island shores so the bunny always leads.
 */

import type { IslandDefinition, IslandSaveV1, QuestObjective } from "./types";
import { nextIncompleteObjective, objectiveKey } from "./chapterLoop";
import type { ShoreHotspot } from "./islandShoreLayout";

export type GuideLookAt = [number, number, number];

function hotspotForObjective(
  obj: QuestObjective | undefined,
  hotspots: ShoreHotspot[],
): GuideLookAt | null {
  if (!obj) return null;
  if (obj.type === "talkToNpc") {
    return hotspots.find((h) => h.kind === "npc" && h.refId === obj.npcId)?.position ?? null;
  }
  if (obj.type === "collectItem") {
    return hotspots.find((h) => h.kind === "item" && h.refId === obj.itemId)?.position ?? null;
  }
  if (obj.type === "completeMinigame") {
    return (
      hotspots.find((h) => h.kind === "play_pad" && h.minigameId === obj.minigameId)?.position ??
      null
    );
  }
  return null;
}

/**
 * Next shore world point for Coin Bag to point at.
 * Prefers Main Quest objective pads; falls back to journal / pier.
 */
export function resolveShoreGuideLookAt(
  island: IslandDefinition,
  save: IslandSaveV1,
  hotspots: ShoreHotspot[],
): GuideLookAt | null {
  const pier = hotspots.find((h) => h.kind === "pier")?.position ?? null;
  const journal = hotspots.find((h) => h.kind === "journal")?.position ?? null;

  const next = nextIncompleteObjective(island, save, { preferTrack: "main" });
  if (!next) return pier;

  const quest = island.quests.find((q) => q.id === next.questId);
  if (!quest) return journal ?? pier;

  const status = save.questStatus[quest.id];
  if (!status?.started) {
    const first = quest.objectives[0];
    return hotspotForObjective(first, hotspots) ?? journal ?? pier;
  }

  const have = status.completedObjectives || [];
  const obj = quest.objectives.find((o) => !have.includes(objectiveKey(o)));
  return hotspotForObjective(obj, hotspots) ?? journal ?? pier;
}

/** Harbor free-roam / guided look-at from hotspot id or Piggy default. */
export function resolveHarborGuideLookAt(opts: {
  highlight?: string | null;
  hotspots: { id: string; position: GuideLookAt }[];
  piggyPos?: GuideLookAt;
  homecomingPending?: boolean;
  nearStoreId?: string | null;
  pointPavilion?: boolean;
  defaultId?: string;
}): GuideLookAt | null {
  const piggy = opts.piggyPos ?? ([4.8, 0, -4] as GuideLookAt);
  const find = (id: string) => opts.hotspots.find((h) => h.id === id)?.position ?? null;

  if (opts.highlight) {
    if (opts.highlight === "guide") return piggy;
    if (opts.highlight === "practice") {
      return find("practice") ?? ([0, 0, 2.5] as GuideLookAt);
    }
    return find(opts.highlight) ?? ([0, 0, -6] as GuideLookAt);
  }

  if (opts.homecomingPending) return piggy;
  if (opts.nearStoreId) return find(opts.nearStoreId);
  if (opts.pointPavilion) return find("pavilion") ?? piggy;
  return find(opts.defaultId ?? "travel") ?? piggy;
}
