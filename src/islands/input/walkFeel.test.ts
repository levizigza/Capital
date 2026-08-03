import { describe, expect, it } from "vitest";
import {
  WALK_SPEED,
  WALK_STOP_EPS,
  stepWalkVelocity,
} from "./walkFeel";

describe("walk feel — readable stop", () => {
  it("snaps to cruise speed when forward is held", () => {
    const { vel, moving } = stepWalkVelocity(
      { x: 0, z: 0 },
      { forward: 1, yaw: 0, dt: 1 / 60 },
    );
    expect(moving).toBe(true);
    expect(vel.z).toBeCloseTo(WALK_SPEED, 5);
    expect(vel.x).toBeCloseTo(0, 5);
  });

  it("coasts then rests when input releases (not ice-slide)", () => {
    let state = stepWalkVelocity(
      { x: 0, z: 0 },
      { forward: 1, yaw: 0, dt: 1 / 60 },
    );
    // Release — after ~0.35s should be fully stopped
    for (let i = 0; i < 24; i++) {
      state = stepWalkVelocity(state.vel, { forward: 0, yaw: 0, dt: 1 / 60 });
    }
    expect(state.moving).toBe(false);
    expect(Math.hypot(state.vel.x, state.vel.z)).toBeLessThan(WALK_STOP_EPS);
  });

  it("flags justStopped on the frame rest locks in", () => {
    let state = stepWalkVelocity(
      { x: 0, z: 0 },
      { forward: 1, yaw: 0, dt: 1 / 60 },
    );
    let saw = false;
    for (let i = 0; i < 30; i++) {
      state = stepWalkVelocity(state.vel, { forward: 0, yaw: 0, dt: 1 / 60 });
      if (state.justStopped) saw = true;
    }
    expect(saw).toBe(true);
  });
});
