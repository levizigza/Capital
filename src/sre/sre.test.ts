import { describe, expect, it, beforeEach } from "vitest";
import {
  recordSreEvent,
  getSreEvents,
  sessionIsErrorFree,
  computeErrorBudget,
  SRE_DEFAULTS,
  resetSreSessionForTests,
} from "./index";

describe("sre telemetry + error budget", () => {
  beforeEach(() => {
    resetSreSessionForTests();
  });

  it("records golden-signal events into the ring", () => {
    recordSreEvent({
      signal: "latency",
      name: "test.latency",
      severity: "info",
      value: 120,
      unit: "ms",
    });
    const events = getSreEvents();
    expect(events.some((e) => e.name === "test.latency")).toBe(true);
    expect(SRE_DEFAULTS.errorFreeSessionSlo).toBe(0.99);
  });

  it("burns error budget on error severity", () => {
    expect(sessionIsErrorFree()).toBe(true);

    recordSreEvent({
      signal: "errors",
      name: "test.boom",
      severity: "error",
    });

    expect(sessionIsErrorFree()).toBe(false);
    const after = computeErrorBudget();
    expect(after.errorCount).toBeGreaterThanOrEqual(1);
    expect(after.policy).not.toBe("ship_freely");
  });
});
