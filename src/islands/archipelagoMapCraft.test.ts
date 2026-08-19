import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildArchipelagoLayout,
  getArchipelagoNode,
  MAP_SIDE_RX,
  MAP_SPINE_RX,
} from "./worldMapLayout";
import { ARCHIPELAGO_MAP_SPACING } from "./world3d/ArchipelagoMap3D";
import { PHI, SEED_SIDE_R, SEED_SPINE_R } from "./sacredGeometry";
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

describe("archipelago map sacred geometry + named islands", () => {
  it("uses Seed of Life φ dual-ring (spine nest · side = spine × φ)", () => {
    expect(MAP_SPINE_RX).toBe(SEED_SPINE_R);
    expect(MAP_SIDE_RX).toBeCloseTo(SEED_SPINE_R * PHI, 5);
    expect(MAP_SIDE_RX).toBe(SEED_SIDE_R);
    // Spread scene units so shores read as an archipelago, not a clump.
    expect(ARCHIPELAGO_MAP_SPACING).toBeGreaterThanOrEqual(5);
    expect(ARCHIPELAGO_MAP_SPACING).toBeLessThan(9);
  });

  it("places Harbor at Seed hub with spine inside the side ring", () => {
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
    const spineDist = Math.hypot(spine[0]!.mapX - hub.mapX, spine[0]!.mapY - hub.mapY);
    if (side[0]) {
      const sideDist = Math.hypot(side[0].mapX - hub.mapX, side[0].mapY - hub.mapY);
      expect(spineDist).toBeLessThan(sideDist);
    }
  });

  it("places Coincraft Cove forward-right and Paycheck north on the spine ring", () => {
    const islands = [
      stub("harbor_haven", "Harbor Haven"),
      stub("coincraft_cove", "Coincraft Cove"),
      stub("paycheck_peninsula", "Paycheck Peninsula"),
      stub("credit_kingdom", "Credit Kingdom"),
    ];
    const layout = buildArchipelagoLayout(islands);
    const cove = getArchipelagoNode(layout, "coincraft_cove");
    const paycheck = getArchipelagoNode(layout, "paycheck_peninsula");
    expect(cove?.ring).toBe("spine");
    expect(paycheck?.ring).toBe("spine");
    expect(cove!.mapY).toBeGreaterThan(paycheck!.mapY);
    expect(cove!.mapX).toBeGreaterThan(layout.hub.mapX);
    expect(paycheck!.mapY).toBeLessThan(layout.hub.mapY);
  });

  it("names every island, keeps Seed guides + Harbor start cue", () => {
    const map = readFileSync(join(__dirname, "world3d/ArchipelagoMap3D.tsx"), "utf8");
    const flat = readFileSync(join(__dirname, "world3d/FlatArchipelagoMap.tsx"), "utf8");
    const mesh = readFileSync(join(__dirname, "world3d/DioramaIslandMesh.tsx"), "utf8");
    const travel = readFileSync(join(__dirname, "views/TravelMapView.tsx"), "utf8");
    const opening = readFileSync(join(__dirname, "styles/capital-opening.css"), "utf8");
    expect(mesh).toMatch(/map-island-label/);
    expect(mesh).toMatch(/<Html/);
    expect(map).toMatch(/data-sacred="seed-of-life"/);
    expect(map).toMatch(/SeedOfLifeGuides/);
    expect(map).not.toMatch(/hideLabels/);
    expect(map).toMatch(/harbor-map-start-cue/);
    expect(map).toMatch(/Start at Harbor Haven/);
    expect(map).not.toMatch(/Click here · start/);
    expect(map).toMatch(/FlatArchipelagoMap/);
    expect(map).toMatch(/ARCHIPELAGO_MAP_3D_FAIL_KEY/);
    expect(map).not.toMatch(/HARBOR_3D_FAIL_KEY/);
    expect(flat).toMatch(/map-island-label-/);
    expect(flat).toMatch(/flat-map-island-/);
    expect(flat).toMatch(/Start at Harbor Haven/);
    expect(flat).not.toMatch(/Click here · start/);
    expect(flat).toMatch(/SEED_PETAL_ANGLES/);
    expect(map).toMatch(/mapSpineSubtitle/);
    expect(map).toMatch(/Side shores first/);
    expect(travel).not.toMatch(/archipelago-side-shore-strip/);
    expect(travel).not.toMatch(/HudChip/);
    expect(travel).toMatch(/Spine voyage/);
    expect(travel).toMatch(/archipelago-strip-prev/);
    expect(travel).toMatch(/archipelago-strip-next/);
    expect(opening).toMatch(/Seed of Life/);
  });
});
