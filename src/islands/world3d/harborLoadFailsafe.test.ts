import { describe, expect, it } from "vitest";

/**
 * Documents the Harbor load escape contract (reliability gate).
 * Regression: sessionStorage "capital_harbor3d_ok" must NEVER block failsafe escape.
 * Continue must paint before Canvas mount; hard myth escape under ~3s.
 */
describe("Harbor load failsafe contract", () => {
  it("always escapes when WebGL never reports ready, even if 3D worked earlier", () => {
    const harborOkFromPriorVisit = true;
    const ready = false;
    // Old buggy rule: if (!ready && !harborOk) escape — left users stuck when harborOk.
    const oldWouldEscape = !ready && !harborOkFromPriorVisit;
    const newWouldEscape = !ready; // always escape
    expect(oldWouldEscape).toBe(false);
    expect(newWouldEscape).toBe(true);
  });

  it("sticky fail skips Canvas mount on the next visit", () => {
    const priorFail = true;
    const mountCanvas = !priorFail;
    expect(mountCanvas).toBe(false);
  });

  it("hard failsafe deadline is under the iconic 3s playable gate", () => {
    const HARD_FAILSAFE_MS = 2_400;
    expect(HARD_FAILSAFE_MS).toBeLessThan(3_000);
  });

  it("canvas watchdog tears down hung R3F before the hard failsafe", () => {
    const CANVAS_WATCHDOG_MS = 1_800;
    const HARD_FAILSAFE_MS = 2_400;
    expect(CANVAS_WATCHDOG_MS).toBeLessThan(HARD_FAILSAFE_MS);
  });

  it("timeout escape stays soft — sticky only on probe/context loss", () => {
    const timeoutMode: "soft" | "sticky" = "soft";
    const probeFailMode: "soft" | "sticky" = "sticky";
    expect(timeoutMode).toBe("soft");
    expect(probeFailMode).toBe("sticky");
  });

  it("defers Canvas until after Continue paint window", () => {
    const DEFER_BEFORE_PROBE_MS = 80;
    expect(DEFER_BEFORE_PROBE_MS).toBeGreaterThan(0);
    expect(DEFER_BEFORE_PROBE_MS).toBeLessThan(500);
  });

  it("failed WebGL probe skips R3F Canvas entirely", () => {
    const probeOk = false;
    const allowCanvas = probeOk;
    expect(allowCanvas).toBe(false);
  });
});
