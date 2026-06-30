import { describe, expect, it } from "vitest";

import coincraft from "../content/coincraft-cove.islands.json";
import { validateIslandDefinition, createEmptyQuest } from "./editorUtils";
import type { IslandDefinition } from "../types";

const island = (coincraft as { islands: IslandDefinition[] }).islands[0];

describe("validateIslandDefinition", () => {
  it("passes coincraft cove with no errors", () => {
    const errors = validateIslandDefinition(island).filter((i) => i.level === "error");
    expect(errors).toHaveLength(0);
  });

  it("flags invalid npc reference in quest objective", () => {
    const bad: IslandDefinition = {
      ...island,
      quests: [
        {
          ...island.quests[0],
          objectives: [{ type: "talkToNpc", npcId: "npc_does_not_exist" }],
        },
      ],
    };
    const errors = validateIslandDefinition(bad).filter((i) => i.level === "error");
    expect(errors.some((e) => e.message.includes("npc_does_not_exist"))).toBe(true);
  });
});

describe("createEmptyQuest", () => {
  it("creates quest with talk objective using first npc", () => {
    const q = createEmptyQuest(island);
    expect(q.objectives[0].type).toBe("talkToNpc");
    if (q.objectives[0].type === "talkToNpc") {
      expect(island.npcs.map((n) => n.id)).toContain(q.objectives[0].npcId);
    }
  });
});
