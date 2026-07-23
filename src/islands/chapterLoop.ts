import type { IslandDefinition, IslandSaveV1, QuestObjective } from "./types";
import { COVE_CHANGE_QUEST_ID, COVE_ISLAND_ID, isHubIslandId } from "./islandIds";

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

export function nextIncompleteObjective(
  island: IslandDefinition,
  save: IslandSaveV1,
): { questId: string; questTitle: string; label: string } | null {
  for (const q of island.quests) {
    const status = save.questStatus[q.id];
    if (!status?.started || status.completed) continue;
    const have = status.completedObjectives || [];
    for (const obj of q.objectives) {
      const key = objectiveKey(obj);
      if (have.includes(key)) continue;
      let label = "Keep exploring";
      if (obj.type === "talkToNpc") {
        const npc = island.npcs.find((n) => n.id === obj.npcId);
        label = `Talk to ${npc?.name || obj.npcId}`;
      } else if (obj.type === "collectItem") {
        const item = island.items.find((i) => i.id === obj.itemId);
        label = `Collect ${item?.name || obj.itemId}`;
      } else if (obj.type === "completeMinigame") {
        const mg = island.minigames?.find((m) => m.id === obj.minigameId);
        label = `Play ${mg?.name || obj.minigameId}`;
      }
      return { questId: q.id, questTitle: q.title, label };
    }
  }
  const unstarted = island.quests.find((q) => !save.questStatus[q.id]?.started);
  if (unstarted) {
    return {
      questId: unstarted.id,
      questTitle: unstarted.title,
      label: `Start: ${unstarted.title}`,
    };
  }
  return null;
}

export function hasCompletedCoveChange(save: IslandSaveV1): boolean {
  return Boolean(save.questStatus[COVE_CHANGE_QUEST_ID]?.completed);
}

export function isCoveChapterIsland(islandId: string): boolean {
  return islandId === COVE_ISLAND_ID;
}
