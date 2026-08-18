import type { IslandDefinition, IslandQuest, IslandSaveV1, QuestObjective, QuestTrack } from "./types";
import { COVE_CHANGE_QUEST_ID, COVE_ISLAND_ID, PAYCHECK_CHANGE_QUEST_ID, isHubIslandId } from "./islandIds";
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
  return Boolean(save.questStatus?.[COVE_CHANGE_QUEST_ID]?.completed);
}

export function hasCompletedPaycheckChange(save: IslandSaveV1): boolean {
  return Boolean(save.questStatus?.[PAYCHECK_CHANGE_QUEST_ID]?.completed);
}

export function isCoveChapterIsland(islandId: string): boolean {
  return islandId === COVE_ISLAND_ID;
}

/** Synthetic "Why it happened" timeline for Cove Change — shown once on quest clear. */
export function buildCoveChangeReplayTimeline(opts: {
  islandId: string;
  islandName: string;
}): import("./decisionTimeline").DecisionTimeline {
  const now = new Date().toISOString();
  return {
    id: `cove-change-${Date.now()}`,
    startedAt: now,
    completedAt: now,
    context: {
      islandId: opts.islandId,
      islandName: opts.islandName,
      questId: COVE_CHANGE_QUEST_ID,
      questTitle: "Save or Spend?",
      minigameId: "quest_cc_save_or_spend",
      minigameName: "Chapter choice",
    },
    success: true,
    score: 100,
    entries: [
      {
        timestamp: now,
        context: { islandId: opts.islandId, questId: COVE_CHANGE_QUEST_ID },
        action: {
          eventTitle: "Craft bench with Alma",
          chosenLabel: "Cleared brushes; glitter can wait",
          chosenIndex: 0,
        },
        alternatives: ["Walked away"],
        stateDiff: "Quest started",
        explanation:
          "Alma clears the path to the jar Take — Coin Hold, not Paycheck's three payday buckets.",
      },
      {
        timestamp: now,
        context: { islandId: opts.islandId, questId: COVE_CHANGE_QUEST_ID },
        action: {
          eventTitle: "Start a savings jar with Kira",
          chosenLabel: "Collected the savings jar",
          chosenIndex: 0,
        },
        alternatives: ["Spend everything now"],
        stateDiff: "+50 coins, craft badge",
        explanation:
          "Choosing to save — even a little — is the Change beat. Harbor will notice when you fly home.",
      },
    ],
    storySummary:
      "You earned fairly, faced save-or-spend, and returned changed. That's Coincraft Cove's Story Circle.",
  };
}

/** Replay for Paycheck Peninsula rainy-day Take. */
export function buildPaycheckChangeReplayTimeline(opts: {
  islandId: string;
  islandName: string;
  choiceId?: string;
}): import("./decisionTimeline").DecisionTimeline {
  const now = new Date().toISOString();
  const protectedFund = opts.choiceId !== "spend";
  return {
    id: `pp-change-${Date.now()}`,
    startedAt: now,
    completedAt: now,
    context: {
      islandId: opts.islandId,
      islandName: opts.islandName,
      questId: PAYCHECK_CHANGE_QUEST_ID,
      questTitle: "Expect the Unexpected",
      minigameId: "quest_pp_rainy_day",
      minigameName: "Rainy-day Take",
    },
    success: true,
    score: 100,
    entries: [
      {
        timestamp: now,
        context: { islandId: opts.islandId, questId: PAYCHECK_CHANGE_QUEST_ID },
        action: {
          eventTitle: "Vendor Vee's fountain vs glitter",
          chosenLabel: protectedFund
            ? "Umbrella before glitter"
            : "Glitter ate the umbrella",
          chosenIndex: protectedFund ? 0 : 1,
        },
        alternatives: protectedFund
          ? ["Glitter ate the umbrella"]
          : ["Umbrella before glitter"],
        stateDiff: protectedFund ? "Umbrella plaque" : "Glitter plaza mark",
        explanation: protectedFund
          ? "Harbor kept the loft dry. Same world rule as Cove — new stall, new numbers."
          : "Glitter now thins the pouch — Harbor will still remember, and you can rebuild.",
      },
    ],
    storySummary:
      "You faced a new stall without a Cove lecture, picked a price, and Paycheck left a mark on Harbor.",
  };
}
