import { describe, expect, it } from "vitest";
import { resolveShoreGuideLookAt, resolveHarborGuideLookAt } from "./coinBagGuideTargets";
import type { IslandDefinition, IslandSaveV1 } from "./types";
import type { ShoreHotspot } from "./islandShoreLayout";
import { createDefaultIslandSave } from "./save";

const hotspots: ShoreHotspot[] = [
  { id: "pier", kind: "pier", label: "Pier", icon: "🪄", position: [0, 0, 10] },
  { id: "journal", kind: "journal", label: "Journal", icon: "📜", position: [2, 0, 2] },
  {
    id: "npc_npc_a",
    kind: "npc",
    label: "Ally",
    icon: "💬",
    position: [5, 0, -2],
    refId: "npc_a",
  },
  {
    id: "play_mg_x",
    kind: "play_pad",
    label: "Pad",
    icon: "🖼️",
    position: [-4, 0, -3],
    minigameId: "mg_x",
  },
];

const island = {
  id: "test",
  name: "Test",
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
      title: "Main",
      description: "Go",
      track: "main" as const,
      objectives: [
        { type: "talkToNpc" as const, npcId: "npc_a" },
        { type: "completeMinigame" as const, minigameId: "mg_x" },
      ],
    },
  ],
  minigames: [],
} as IslandDefinition;

describe("resolveShoreGuideLookAt", () => {
  it("points at first NPC when quest unstarted", () => {
    const save = createDefaultIslandSave() as IslandSaveV1;
    const at = resolveShoreGuideLookAt(island, save, hotspots);
    expect(at).toEqual([5, 0, -2]);
  });

  it("points at play pad after talk objective done", () => {
    const save = createDefaultIslandSave() as IslandSaveV1;
    save.questStatus = {
      q_main: {
        started: true,
        completed: false,
        completedObjectives: ["talk:npc_a"],
      },
    };
    const at = resolveShoreGuideLookAt(island, save, hotspots);
    expect(at).toEqual([-4, 0, -3]);
  });

  it("points at pier when chapter clear", () => {
    const save = createDefaultIslandSave() as IslandSaveV1;
    save.questStatus = {
      q_main: {
        started: true,
        completed: true,
        completedObjectives: ["talk:npc_a", "minigame:mg_x"],
      },
    };
    const at = resolveShoreGuideLookAt(island, save, hotspots);
    expect(at).toEqual([0, 0, 10]);
  });
});

describe("resolveHarborGuideLookAt", () => {
  const spots = [
    { id: "travel", position: [0, 0, 13] as [number, number, number] },
    { id: "outfitter", position: [0, 0, -8] as [number, number, number] },
    { id: "pavilion", position: [-4.5, 0, -9.5] as [number, number, number] },
  ];

  it("uses guided highlight first", () => {
    expect(resolveHarborGuideLookAt({ highlight: "outfitter", hotspots: spots })).toEqual([
      0, 0, -8,
    ]);
  });

  it("defaults to travel / carpet dock", () => {
    expect(resolveHarborGuideLookAt({ hotspots: spots })).toEqual([0, 0, 13]);
  });

  it("points pavilion when asked", () => {
    expect(resolveHarborGuideLookAt({ hotspots: spots, pointPavilion: true })).toEqual([
      -4.5, 0, -9.5,
    ]);
  });
});
