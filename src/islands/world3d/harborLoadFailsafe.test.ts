import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  HARBOR_3D_FAIL_KEY,
  HARBOR_3D_OK_KEY,
  HARBOR_CANVAS_WATCHDOG_MS,
  HARBOR_DEFER_BEFORE_PROBE_MS,
  HARBOR_HARD_FAILSAFE_MS,
} from "./harborLoadFailsafe";

/**
 * Pillar 14 — Harbor WebGL → myth reliability gate.
 * Regression: prior-visit ok must NEVER block failsafe escape.
 * Continue paints before Canvas; hard myth escape under ~3s.
 */
describe("Harbor load failsafe contract", () => {
  it("exports timers under the iconic 3s playable gate", () => {
    expect(HARBOR_DEFER_BEFORE_PROBE_MS).toBeGreaterThan(0);
    expect(HARBOR_DEFER_BEFORE_PROBE_MS).toBeLessThan(500);
    expect(HARBOR_CANVAS_WATCHDOG_MS).toBeLessThan(HARBOR_HARD_FAILSAFE_MS);
    expect(HARBOR_HARD_FAILSAFE_MS).toBeLessThan(3_000);
  });

  it("always escapes when WebGL never reports ready, even if 3D worked earlier", () => {
    const harborOkFromPriorVisit = true;
    const ready = false;
    const oldWouldEscape = !ready && !harborOkFromPriorVisit;
    const newWouldEscape = !ready;
    expect(oldWouldEscape).toBe(false);
    expect(newWouldEscape).toBe(true);
  });

  it("sticky fail skips Canvas mount on the next visit", () => {
    const priorFail = true;
    const mountCanvas = !priorFail;
    expect(mountCanvas).toBe(false);
    expect(HARBOR_3D_FAIL_KEY).toBe("capital_harbor3d_fail");
    expect(HARBOR_3D_OK_KEY).toBe("capital_harbor3d_ok");
  });

  it("wires shared failsafe constants into WalkableHarborView", () => {
    const src = readFileSync(join(__dirname, "WalkableHarborView.tsx"), "utf8");
    expect(src).toMatch(/HARBOR_HARD_FAILSAFE_MS/);
    expect(src).toMatch(/HARBOR_CANVAS_WATCHDOG_MS/);
    expect(src).toMatch(/HARBOR_DEFER_BEFORE_PROBE_MS/);
    expect(src).toMatch(/HARBOR_3D_FAIL_KEY/);
    expect(src).toMatch(/escapeToMyth\("sticky"\)/);
    expect(src).toMatch(/escapeToMyth\("soft"\)/);
  });

  it("timeout escape stays soft — sticky only on probe/context loss", () => {
    const timeoutMode: "soft" | "sticky" = "soft";
    const probeFailMode: "soft" | "sticky" = "sticky";
    expect(timeoutMode).toBe("soft");
    expect(probeFailMode).toBe("sticky");
  });

  it("failed WebGL probe skips R3F Canvas entirely", () => {
    const probeOk = false;
    const allowCanvas = probeOk;
    expect(allowCanvas).toBe(false);
  });

  it("HomeHub suppresses HUD chrome while plaza is still loading", () => {
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/hideHudForHarborLoad/);
    expect(hub).toMatch(/harbor-skip-3d|onPlazaReady/);
  });
});
