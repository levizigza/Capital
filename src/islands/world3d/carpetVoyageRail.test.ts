import { describe, expect, it } from "vitest";
import {
  CARPET_ARRIVE_RADIUS,
  RAIL_MAX_MS,
  RAIL_SPEED,
  RAIL_START_DISTANCE,
  distance2d,
  isRailVoyage,
  isWithinArrive,
  railEtaSeconds,
  railStartPose,
} from "./carpetVoyageRail";

describe("carpetVoyageRail", () => {
  it("treats a voyage target as rail mode", () => {
    expect(isRailVoyage("coincraft_cove")).toBe(true);
    expect(isRailVoyage(null)).toBe(false);
    expect(isRailVoyage(undefined)).toBe(false);
  });

  it("places the carpet short of the target, aimed inward", () => {
    const target = { x: 40, z: 30 };
    const pose = railStartPose(target.x, target.z);
    const dist = distance2d(pose.x, pose.z, target.x, target.z);
    expect(dist).toBeCloseTo(RAIL_START_DISTANCE, 5);
    expect(dist).toBeGreaterThan(CARPET_ARRIVE_RADIUS);
    // One rush step should shrink distance
    const nx = pose.x + Math.sin(pose.heading) * RAIL_SPEED * 0.25;
    const nz = pose.z + Math.cos(pose.heading) * RAIL_SPEED * 0.25;
    expect(distance2d(nx, nz, target.x, target.z)).toBeLessThan(dist);
  });

  it("guarantees rail ETA under the iconic 12s budget", () => {
    expect(railEtaSeconds()).toBeLessThan(12);
    expect(RAIL_MAX_MS).toBeLessThanOrEqual(12_000);
  });

  it("detects arrival radius on the target (not a random nearest)", () => {
    expect(isWithinArrive(10, 10, 10, 10 + (CARPET_ARRIVE_RADIUS - 1))).toBe(true);
    expect(isWithinArrive(0, 0, 100, 100)).toBe(false);
  });
});
