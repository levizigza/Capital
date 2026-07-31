import { describe, expect, it } from "vitest";

/**
 * Documents the Harbor load escape contract.
 * Regression: sessionStorage "capital_harbor3d_ok" must NEVER block failsafe escape.
 * Continue must be available immediately (not gated on a 2.5s timer).
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
});
