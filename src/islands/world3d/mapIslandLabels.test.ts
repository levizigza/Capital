import { describe, expect, it } from "vitest";
import {
  mapLabelOffsetY,
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
      "1960s · Tower",
    );
    expect(mapSpineSubtitle("coincraft_cove", { locked: false, current: false })).toBe(
      "1990s · Jar",
    );
    expect(mapSpineSubtitle("paycheck_peninsula", { locked: true, current: false })).toBe(
      "1960s · Locked",
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
});
