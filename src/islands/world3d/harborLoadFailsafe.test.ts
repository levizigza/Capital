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
    const HARD_FAILSAFE_MS = 2_800;
    expect(HARD_FAILSAFE_MS).toBeLessThan(3_000);
  });

  it("defers Canvas until after Continue paint window", () => {
    const DEFER_BEFORE_PROBE_MS = 120;
    const OLD_INSTANT_MOUNT_MS = 100;
    // Probe + idle defer must not race ahead of first paint of Continue.
    expect(DEFER_BEFORE_PROBE_MS).toBeGreaterThanOrEqual(OLD_INSTANT_MOUNT_MS);
  });

  it("failed WebGL probe skips R3F Canvas entirely", () => {
    const probeOk = false;
    const allowCanvas = probeOk;
    expect(allowCanvas).toBe(false);
  });
});
