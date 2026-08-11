import { describe, expect, it } from "vitest";
import {
  ARCHIPELAGO_MAP_TRAVEL_IDS,
  FORTUNE_ARCHIPELAGO_NAME,
  SIDE_SHORE_TRAVEL_IDS,
  SPINE_TRAVEL_IDS,
  islandsForArchipelagoMap,
  islandsForSpineTravel,
  isArchipelagoMapTravelId,
  isSideShoreTravelId,
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

  it("keeps main-course strip to Harbor + Cove + Paycheck + Credit", () => {
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

  it("restores era side shores on the full archipelago map", () => {
    expect(SIDE_SHORE_TRAVEL_IDS).toHaveLength(8);
    expect(ARCHIPELAGO_MAP_TRAVEL_IDS).toHaveLength(12);
    const wide = [
      stub("harbor_haven"),
      stub("coincraft_cove"),
      stub("paycheck_peninsula"),
      stub("credit_kingdom"),
      ...SIDE_SHORE_TRAVEL_IDS.map((id) => stub(id)),
      stub("starter_key_cove"),
    ];
    const map = islandsForArchipelagoMap(wide);
    expect(map.map((i) => i.id)).toEqual([...ARCHIPELAGO_MAP_TRAVEL_IDS]);
    expect(map.some((i) => i.id === "starter_key_cove")).toBe(false);
    expect(isSideShoreTravelId("venture_foundry")).toBe(true);
    expect(isArchipelagoMapTravelId("financial_assets")).toBe(true);
  });

  it("recognizes spine vs side ids", () => {
    expect(isSpineTravelId("coincraft_cove")).toBe(true);
    expect(isSpineTravelId("signal_city")).toBe(false);
    expect(isSideShoreTravelId("signal_city")).toBe(true);
  });
});
