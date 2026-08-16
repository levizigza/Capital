import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildArchipelagoLayout,
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

describe("archipelago map sacred geometry + declutter", () => {
  it("uses Seed of Life φ dual-ring (spine nest · side = spine × φ)", () => {
    expect(MAP_SPINE_RX).toBe(SEED_SPINE_R);
    expect(MAP_SIDE_RX).toBeCloseTo(SEED_SPINE_R * PHI, 5);
    expect(MAP_SIDE_RX).toBe(SEED_SIDE_R);
    expect(ARCHIPELAGO_MAP_SPACING).toBeLessThan(5);
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

  it("names spine only, quiets side labels, keeps Harbor start cue", () => {
    const map = readFileSync(join(__dirname, "world3d/ArchipelagoMap3D.tsx"), "utf8");
    const mesh = readFileSync(join(__dirname, "world3d/DioramaIslandMesh.tsx"), "utf8");
    const travel = readFileSync(join(__dirname, "views/TravelMapView.tsx"), "utf8");
    const opening = readFileSync(join(__dirname, "styles/capital-opening.css"), "utf8");
    expect(mesh).toMatch(/map-island-label/);
    expect(mesh).toMatch(/<Html/);
    expect(map).toMatch(/data-sacred="seed-of-life"/);
    expect(map).toMatch(/SeedOfLifeGuides/);
    expect(map).toMatch(/hideLabels/);
    expect(map).toMatch(/harbor-map-start-cue/);
    expect(map).toMatch(/Click here · start/);
    expect(map).toMatch(/spineOuter\.map/);
    expect(travel).not.toMatch(/archipelago-side-shore-strip/);
    expect(travel).not.toMatch(/HudChip/);
    expect(travel).toMatch(/Spine voyage/);
    expect(opening).toMatch(/Seed of Life/);
  });
});
