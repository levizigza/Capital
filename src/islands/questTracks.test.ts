import { describe, expect, it } from "vitest";
import { nextIncompleteObjective, islandMainQuestsComplete } from "./chapterLoop";
import { partitionIslandQuests, questTrack } from "./questTracks";
import type { IslandDefinition, IslandSaveV1 } from "./types";
import { createDefaultIslandSave } from "./save";

const island = {
  id: "test_isle",
  name: "Test Isle",
  icon: "🏝️",
  description: "",
  startAreaId: "a1",
  areas: [{ id: "a1", name: "A", description: "", icon: "📍" }],
  npcs: [{ id: "npc_a", name: "Ally", icon: "🙂", areaId: "a1", dialogueGraphId: "d1" }],
  items: [],
  dialogues: [],
  quests: [
    {
      id: "q_main",
      title: "Main Path",
      description: "Spine",
      track: "main" as const,
      objectives: [{ type: "talkToNpc" as const, npcId: "npc_a" }],
    },
    {
      id: "q_side",
      title: "Side Path",
      description: "Optional",
      track: "side" as const,
      objectives: [{ type: "talkToNpc" as const, npcId: "npc_a" }],
    },
  ],
  minigames: [],
} as IslandDefinition;

describe("questTracks", () => {
  it("defaults missing track to main", () => {
    expect(questTrack({})).toBe("main");
    expect(questTrack({ track: "side" })).toBe("side");
  });

  it("partitions main vs side", () => {
    const { main, side } = partitionIslandQuests(island.quests);
    expect(main.map((q) => q.id)).toEqual(["q_main"]);
    expect(side.map((q) => q.id)).toEqual(["q_side"]);
  });
});

describe("nextIncompleteObjective prefers main", () => {
  it("points at main before side when both unstarted", () => {
    const save = createDefaultIslandSave() as IslandSaveV1;
    const next = nextIncompleteObjective(island, save);
    expect(next?.questId).toBe("q_main");
    expect(next?.track).toBe("main");
  });

  it("falls back to side when main is complete", () => {
    const save = createDefaultIslandSave() as IslandSaveV1;
    save.questStatus = {
      q_main: {
        started: true,
        completed: true,
        completedObjectives: ["talk:npc_a"],
      },
    };
    const next = nextIncompleteObjective(island, save);
    expect(next?.questId).toBe("q_side");
    expect(next?.track).toBe("side");
  });

  it("treats island main complete even if side remains", () => {
    const save = createDefaultIslandSave() as IslandSaveV1;
    save.questStatus = {
      q_main: {
        started: true,
        completed: true,
        completedObjectives: ["talk:npc_a"],
      },
    };
    expect(islandMainQuestsComplete(island, save)).toBe(true);
  });
});
