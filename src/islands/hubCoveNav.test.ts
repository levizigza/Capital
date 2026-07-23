import { describe, expect, it } from "vitest";
import { isHubIslandId, HARBOR_HAVEN_ID, COVE_ISLAND_ID } from "./islandIds";
import { createDefaultIslandSave, migrateIslandSave } from "./save";
import { islandHasChapterContent } from "./chapterLoop";
import type { IslandDefinition } from "./types";

describe("hub vs Cove navigability", () => {
  it("treats only Harbor Haven as the hub at runtime", () => {
    expect(isHubIslandId(HARBOR_HAVEN_ID)).toBe(true);
    expect(isHubIslandId(COVE_ISLAND_ID)).toBe(false);
    expect(isHubIslandId("paycheck_peninsula")).toBe(false);
  });

  it("keeps live Cove chapter sessions on reload", () => {
    const base = createDefaultIslandSave();
    const midChapter = migrateIslandSave({
      ...base,
      currentIslandId: COVE_ISLAND_ID,
      currentAreaId: "cc_harbor",
      questStatus: {
        q_cc_first_coins: {
          started: true,
          completed: false,
          completedObjectives: ["talk:npc_captain_penny"],
        },
      },
      discovered: {
        ...base.discovered,
        islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID],
      },
    });
    expect(midChapter.currentIslandId).toBe(COVE_ISLAND_ID);
    expect(midChapter.currentAreaId).toBe("cc_harbor");
  });

  it("remaps true legacy hub parks (no Cove quests) to Harbor Haven", () => {
    const base = createDefaultIslandSave();
    const legacy = migrateIslandSave({
      ...base,
      currentIslandId: COVE_ISLAND_ID,
      currentAreaId: "cc_harbor",
      questStatus: {},
      discovered: {
        ...base.discovered,
        islands: [COVE_ISLAND_ID],
      },
    });
    expect(legacy.currentIslandId).toBe(HARBOR_HAVEN_ID);
    expect(legacy.discovered.islands).toContain(HARBOR_HAVEN_ID);
  });

  it("recognizes Cove as chapter content", () => {
    const cove = {
      id: COVE_ISLAND_ID,
      name: "Coincraft Cove",
      areas: [{ id: "cc_harbor" }],
      npcs: [{ id: "npc_captain_penny" }],
      quests: [{ id: "q_cc_first_coins" }],
    } as unknown as IslandDefinition;
    const harbor = {
      id: HARBOR_HAVEN_ID,
      name: "Harbor Haven",
      areas: [{ id: "hh_plaza" }],
      npcs: [],
      quests: [],
    } as unknown as IslandDefinition;
    expect(islandHasChapterContent(cove)).toBe(true);
    expect(islandHasChapterContent(harbor)).toBe(false);
  });
});
