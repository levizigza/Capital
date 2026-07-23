import type { IslandDefinition, IslandQuest, IslandSaveV1, QuestObjective, QuestTrack } from "./types";
import { COVE_CHANGE_QUEST_ID, COVE_ISLAND_ID, isHubIslandId } from "./islandIds";
import { questTrack } from "./questTracks";

/** Islands with explore/quest chapter content (not the Harbor plaza). */
export function islandHasChapterContent(island: IslandDefinition): boolean {
  if (isHubIslandId(island.id)) return false;
  return (
    (island.areas?.length ?? 0) > 0 &&
    (island.npcs?.length ?? 0) > 0 &&
    (island.quests?.length ?? 0) > 0
  );
}

export function objectiveKey(obj: QuestObjective): string {
  if (obj.type === "talkToNpc") return `talk:${obj.npcId}`;
  if (obj.type === "collectItem") return `item:${obj.itemId}`;
  if (obj.type === "completeMinigame") return `minigame:${obj.minigameId}`;
  return JSON.stringify(obj);
}

export type NextObjective = {
  questId: string;
  questTitle: IslandQuest["title"];
  label: string;
  track: QuestTrack;
};

function objectiveLabel(island: IslandDefinition, obj: QuestObjective): string {
  if (obj.type === "talkToNpc") {
    const npc = island.npcs.find((n) => n.id === obj.npcId);
    return `Talk to ${npc?.name || obj.npcId}`;
  }
  if (obj.type === "collectItem") {
    const item = island.items.find((i) => i.id === obj.itemId);
    return `Collect ${item?.name || obj.itemId}`;
  }
  if (obj.type === "completeMinigame") {
    const mg = island.minigames?.find((m) => m.id === obj.minigameId);
    return `Play ${mg?.name || obj.minigameId}`;
  }
  return "Keep exploring";
}

/** Prefer Main Quest objectives; fall back to Side Quests only when main is clear. */
export function nextIncompleteObjective(
  island: IslandDefinition,
  save: IslandSaveV1,
  opts?: { preferTrack?: QuestTrack | "any" },
): NextObjective | null {
  const prefer = opts?.preferTrack ?? "main";
  const ordered =
    prefer === "any"
      ? island.quests
      : [
          ...island.quests.filter((q) => questTrack(q) === prefer),
          ...island.quests.filter((q) => questTrack(q) !== prefer),
        ];

  for (const q of ordered) {
    const status = save.questStatus[q.id];
    if (!status?.started || status.completed) continue;
    const have = status.completedObjectives || [];
    for (const obj of q.objectives) {
      const key = objectiveKey(obj);
      if (have.includes(key)) continue;
      return {
        questId: q.id,
        questTitle: q.title,
        label: objectiveLabel(island, obj),
        track: questTrack(q),
      };
    }
  }

  const unstartedPool =
    prefer === "any"
      ? island.quests
      : [
          ...island.quests.filter((q) => questTrack(q) === prefer),
          ...island.quests.filter((q) => questTrack(q) !== prefer),
        ];
  const unstarted = unstartedPool.find((q) => !save.questStatus[q.id]?.started);
  if (unstarted) {
    return {
      questId: unstarted.id,
      questTitle: unstarted.title,
      label: `Start: ${typeof unstarted.title === "string" ? unstarted.title : "quest"}`,
      track: questTrack(unstarted),
    };
  }
  return null;
}

/** True when every main-track quest on the island is completed (side may remain). */
export function islandMainQuestsComplete(island: IslandDefinition, save: IslandSaveV1): boolean {
  const mains = island.quests.filter((q) => questTrack(q) === "main");
  if (mains.length === 0) return island.quests.some((q) => save.questStatus[q.id]?.completed);
  return mains.every((q) => save.questStatus[q.id]?.completed);
}

export function hasCompletedCoveChange(save: IslandSaveV1): boolean {
  return Boolean(save.questStatus[COVE_CHANGE_QUEST_ID]?.completed);
}

export function isCoveChapterIsland(islandId: string): boolean {
  return islandId === COVE_ISLAND_ID;
}
