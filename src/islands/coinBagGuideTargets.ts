/**
 * Resolve where Coin Bag should POINT (never race ahead).
 * Used by Harbor plaza + island shores so the bunny always leads.
 */

import type { IslandDefinition, IslandSaveV1, QuestObjective } from "./types";
import { nextIncompleteObjective, objectiveKey } from "./chapterLoop";
import type { ShoreHotspot } from "./islandShoreLayout";
import { HARBOR_PIGGY_POS } from "./moneyCast";

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
      hotspots.find((h) => h.kind === "money_structure")?.position ??
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
  const moneyMachine = hotspots.find((h) => h.kind === "money_structure")?.position ?? null;

  // After an irreversible Take — only one verb: carpet home.
  if (save.chapterQuietPending && pier) return pier;

  const anyStarted = Object.values(save.questStatus ?? {}).some((q) => q?.started);
  if (!anyStarted) {
    // First painting: prefer Penny on Cove; else first main objective / any NPC / structure.
    const penny =
      hotspots.find((h) => h.refId === "npc_captain_penny")?.position ??
      hotspots.find((h) => h.id.includes("captain_penny"))?.position ??
      null;
    const firstMain = island.quests.find((q) => q.track === "main")?.objectives[0];
    const firstNpc = hotspots.find((h) => h.kind === "npc")?.position ?? null;
    return (
      penny ??
      hotspotForObjective(firstMain, hotspots) ??
      firstNpc ??
      moneyMachine ??
      journal ??
      pier
    );
  }

  const next = nextIncompleteObjective(island, save, { preferTrack: "main" });
  if (!next) return moneyMachine ?? pier;

  const quest = island.quests.find((q) => q.id === next.questId);
  if (!quest) return journal ?? moneyMachine ?? pier;

  const status = save.questStatus[quest.id];
  if (!status?.started) {
    const first = quest.objectives[0];
    return hotspotForObjective(first, hotspots) ?? moneyMachine ?? journal ?? pier;
  }

  const have = status.completedObjectives || [];
  const obj = quest.objectives.find((o) => !have.includes(objectiveKey(o)));
  return hotspotForObjective(obj, hotspots) ?? moneyMachine ?? journal ?? pier;
}

/** Harbor free-roam / guided look-at from hotspot id or Piggy default. */
export function resolveHarborGuideLookAt(opts: {
  highlight?: string | null;
  hotspots: { id: string; position: GuideLookAt }[];
  piggyPos?: GuideLookAt;
  homecomingPending?: boolean;
  /** After Piggy welcome-back — point Carpet Dock for next painting */
  pointNextPainting?: boolean;
  nearStoreId?: string | null;
  pointPavilion?: boolean;
  /** Scar spectacle / Plinth afterglow — point Memory before Piggy welcome */
  pointMemoryPlinth?: boolean;
  defaultId?: string;
}): GuideLookAt | null {
  const piggy = opts.piggyPos ?? (HARBOR_PIGGY_POS as GuideLookAt);
  const find = (id: string) => opts.hotspots.find((h) => h.id === id)?.position ?? null;

  if (opts.highlight) {
    if (opts.highlight === "guide") return piggy;
    if (opts.highlight === "practice") {
      return find("practice") ?? ([0, 0, 2.5] as GuideLookAt);
    }
    return find(opts.highlight) ?? ([0, 0, -6] as GuideLookAt);
  }

  // Spectacle owns the plaza — Plinth before homecoming Piggy.
  if (opts.pointMemoryPlinth) {
    return find("memory") ?? ([4.0, 0, 1.6] as GuideLookAt);
  }
  if (opts.homecomingPending) return piggy;
  if (opts.pointNextPainting) return find("travel") ?? ([0, 0, 13] as GuideLookAt);
  if (opts.nearStoreId) return find(opts.nearStoreId);
  if (opts.pointPavilion) return find("pavilion") ?? piggy;
  // Free roam: point the plaza Money Structure before the travel dock.
  return find("ledger_bank") ?? find(opts.defaultId ?? "travel") ?? piggy;
}
