import { describe, expect, it } from "vitest";
import { SHORE_WORLD_SCALE, shoreScale, shoreXZ } from "./ledgerlight";
import { shoreAnchorsForCulture } from "../islandCulture";

describe("ledgerlight shore scale", () => {
  it("expands shores beyond the old cramped plaza", () => {
    expect(SHORE_WORLD_SCALE).toBeGreaterThanOrEqual(1.75);
    expect(shoreScale(14)).toBeGreaterThan(24);
  });

  it("scales culture anchors with the world", () => {
    const culture = {
      id: "test",
      cultureName: "Test",
      vibe: "test",
      layout: "plaza" as const,
      roles: ["cash" as const],
      landmarks: [] as Array<"stall" | "antenna" | "statue" | "garden" | "terminal" | "hut" | "tower">,
      ecosystem: { families: 0, pairs: 0, loners: 0, animals: 0, machines: 0 },
      fauna: "gulls" as const,
    };
    const a = shoreAnchorsForCulture(culture);
    expect(a.pier[2]).toBeCloseTo(11.5 * SHORE_WORLD_SCALE, 5);
    expect(a.padRadius).toBeCloseTo(6.2 * SHORE_WORLD_SCALE, 5);
    expect(shoreXZ(1, 2)[0]).toBeCloseTo(SHORE_WORLD_SCALE, 5);
  });
});
