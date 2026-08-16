import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildArchipelagoLayout,
  MAP_SIDE_RX,
  MAP_SPINE_RX,
} from "./worldMapLayout";
import { ARCHIPELAGO_MAP_SPACING } from "./world3d/ArchipelagoMap3D";
import type { IslandDefinition } from "./types";

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

describe("archipelago map sacred geometry + labels", () => {
  it("keeps dual-ring radii nested (overlapping dioramas, not a sparse grid)", () => {
    expect(MAP_SPINE_RX).toBeLessThan(20);
    expect(MAP_SIDE_RX).toBeLessThan(28);
    expect(MAP_SIDE_RX / MAP_SPINE_RX).toBeGreaterThan(1.35);
    expect(MAP_SIDE_RX / MAP_SPINE_RX).toBeLessThan(1.9);
    expect(ARCHIPELAGO_MAP_SPACING).toBeLessThan(5);
  });

  it("places Harbor at hub with spine inside the side ring", () => {
    const islands = [
      stub("harbor_haven", "Harbor Haven"),
      stub("coincraft_cove", "Coincraft Cove"),
      stub("paycheck_peninsula", "Paycheck Peninsula"),
      stub("credit_kingdom", "Credit Kingdom"),
      stub("financial_assets", "Assets Atoll"),
    ];
    const { hub, outer } = buildArchipelagoLayout(islands);
    expect(hub.isHub).toBe(true);
    expect(hub.mapX).toBe(50);
    const spine = outer.filter((n) => n.ring === "spine");
    const side = outer.filter((n) => n.ring === "side");
    expect(spine.length).toBeGreaterThan(0);
    const spineDist = Math.hypot(spine[0]!.mapX - 50, spine[0]!.mapY - 54);
    if (side[0]) {
      const sideDist = Math.hypot(side[0].mapX - 50, side[0].mapY - 54);
      expect(spineDist).toBeLessThan(sideDist);
    }
  });

  it("shows HTML island nameplates and Harbor start cue", () => {
    const map = readFileSync(join(__dirname, "world3d/ArchipelagoMap3D.tsx"), "utf8");
    const mesh = readFileSync(join(__dirname, "world3d/DioramaIslandMesh.tsx"), "utf8");
    expect(mesh).toMatch(/map-island-label/);
    expect(mesh).toMatch(/<Html/);
    expect(map).not.toMatch(/hideLabels/);
    expect(map).toMatch(/harbor-map-start-cue/);
    expect(map).toMatch(/Click here/);
    expect(map).toMatch(/Start your journey/);
    expect(map).toMatch(/hasCompletedCoveChange/);
  });
});
