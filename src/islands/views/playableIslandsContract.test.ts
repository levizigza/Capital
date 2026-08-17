import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mythFallbackActions } from "../harborFirstMeet";

/**
 * Playability gate — island press / Harbor Enter must never soft-lock.
 */
describe("playable islands contract", () => {
  it("myth_meet still offers Carpet so Talk cannot soft-lock travel", () => {
    expect(mythFallbackActions("myth_meet").carpet).toBe(true);
    expect(mythFallbackActions("myth_meet").talkPiggy).toBe(true);
  });

  it("Harbor loading HUD does not cover Enter Harbor Haven", () => {
    const hub = readFileSync(join(__dirname, "HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/hideHudForHarborLoad/);
    expect(hub).toMatch(/!plazaReady/);
  });

  it("travel map current island returns home instead of a dead disabled pin", () => {
    const travel = readFileSync(join(__dirname, "TravelMapView.tsx"), "utf8");
    expect(travel).toMatch(/islandId === currentId/);
    expect(travel).toMatch(/onBack\(\)/);
    expect(travel).not.toMatch(/disabled=\{locked \|\| here\}/);
  });

  it("archipelago map uses its own fail key and keeps a named flat Seed map", () => {
    const map = readFileSync(
      join(__dirname, "../world3d/ArchipelagoMap3D.tsx"),
      "utf8",
    );
    const flat = readFileSync(
      join(__dirname, "../world3d/FlatArchipelagoMap.tsx"),
      "utf8",
    );
    expect(map).toMatch(/ARCHIPELAGO_MAP_3D_FAIL_KEY/);
    expect(map).toMatch(/FlatArchipelagoMap/);
    expect(flat).toMatch(/archipelago-map-flat/);
    expect(flat).toMatch(/flat-map-island-/);
    expect(flat).toMatch(/map-island-label-/);
  });

  it("shore explore never soft-locks behind endless loading veil", () => {
    const shore = readFileSync(
      join(__dirname, "../world3d/WalkableIslandExplore.tsx"),
      "utf8",
    );
    expect(shore).toMatch(/island-shore-loading/);
    expect(shore).toMatch(/Enter shore now/);
    expect(shore).toMatch(/setReady\(true\)/);
    expect(shore).toMatch(/failsafe/);
  });

  it("Credit Spiral lock names mastery progress for navigability", () => {
    const gates = readFileSync(join(__dirname, "../progressGates.ts"), "utf8");
    expect(gates).toMatch(/Spiral locked — mastery/);
    expect(gates).toMatch(/Earn Freedom Seal/);
  });
});
