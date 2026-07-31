import { describe, expect, it } from "vitest";
import {
  FORTUNE_ARCHIPELAGO_NAME,
  SPINE_TRAVEL_IDS,
  islandsForSpineTravel,
  isSpineTravelId,
} from "./spineArchipelago";
import type { IslandDefinition } from "./types";

function stub(id: string, name = id): IslandDefinition {
  return {
    id,
    name,
    icon: "🏝️",
    description: "",
    themeId: "default",
    areas: [],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
  } as IslandDefinition;
}

describe("spine archipelago freeze", () => {
  it("names the world Fortune Archipelago (not Galápagos)", () => {
    expect(FORTUNE_ARCHIPELAGO_NAME).toBe("Fortune Archipelago");
    expect(FORTUNE_ARCHIPELAGO_NAME).not.toMatch(/Galápagos/i);
  });

  it("keeps travel surface to Harbor + Cove + Paycheck + Credit", () => {
    expect([...SPINE_TRAVEL_IDS]).toEqual([
      "harbor_haven",
      "coincraft_cove",
      "paycheck_peninsula",
      "credit_kingdom",
    ]);
    const wide = [
      stub("harbor_haven", "Harbor"),
      stub("coincraft_cove", "Cove"),
      stub("signal_city"),
      stub("future_shores"),
      stub("paycheck_peninsula", "Paycheck"),
      stub("venture_foundry"),
      stub("credit_kingdom", "Credit"),
    ];
    const spine = islandsForSpineTravel(wide);
    expect(spine.map((i) => i.id)).toEqual([...SPINE_TRAVEL_IDS]);
    expect(spine).toHaveLength(4);
  });

  it("recognizes spine ids only", () => {
    expect(isSpineTravelId("coincraft_cove")).toBe(true);
    expect(isSpineTravelId("signal_city")).toBe(false);
  });
});
