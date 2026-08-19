import { describe, expect, it } from "vitest";
import {
  mapLabelOffsetY,
  mapLabelZIndex,
  mapSpineSubtitle,
  mapStructurePin,
} from "./mapIslandLabels";
import { buildArchipelagoLayout } from "../worldMapLayout";
import type { IslandDefinition } from "../types";

const stub = (id: string, name: string): IslandDefinition =>
  ({
    id,
    name,
    themeId: "harbor_haven",
    npcs: [],
    quests: [],
    items: [],
    areas: [],
  }) as IslandDefinition;

describe("mapIslandLabels", () => {
  it("names spine landmarks with era decade + structure pin", () => {
    expect(mapStructurePin("coincraft_cove")).toBe("Jar");
    expect(mapStructurePin("paycheck_peninsula")).toBe("Tower");
    expect(mapSpineSubtitle("paycheck_peninsula", { locked: false, current: false })).toBe(
      "1960s · Vector Dawn · Tower",
    );
    expect(mapSpineSubtitle("coincraft_cove", { locked: false, current: false })).toBe(
      "1990s · Solarpunk Cove · Jar",
    );
    expect(mapSpineSubtitle("paycheck_peninsula", { locked: true, current: false })).toBe(
      "1960s · Vector Dawn · Locked",
    );
  });

  it("lifts crowded north / forward spine nameplates", () => {
    const layout = buildArchipelagoLayout([
      stub("harbor_haven", "Harbor Haven"),
      stub("coincraft_cove", "Coincraft Cove"),
      stub("paycheck_peninsula", "Paycheck Peninsula"),
      stub("credit_kingdom", "Credit Kingdom"),
    ]);
    const pay = layout.outer.find((n) => n.island.id === "paycheck_peninsula")!;
    const cove = layout.outer.find((n) => n.island.id === "coincraft_cove")!;
    expect(mapLabelOffsetY(pay)).toBeGreaterThan(mapLabelOffsetY(cove));
  });

  it("keeps Harbor hub nameplates above spine / side plates", () => {
    expect(mapLabelZIndex("hub")[0]).toBeGreaterThan(mapLabelZIndex("spine")[0]);
    expect(mapLabelZIndex("spine")[0]).toBeGreaterThan(mapLabelZIndex("side")[0]);
  });
});
