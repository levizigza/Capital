import { describe, expect, it, vi } from "vitest";
import {
  consumeAshoreTeachResult,
  shouldShowHarborWorldBriefing,
  stashAshoreTeachResult,
} from "./ashoreTeachFlags";

describe("ashoreTeachFlags", () => {
  it("shows Harbor chart only when Ashore was skipped", () => {
    expect(shouldShowHarborWorldBriefing(undefined)).toBe(true);
    expect(shouldShowHarborWorldBriefing("skipped")).toBe(true);
    expect(shouldShowHarborWorldBriefing("complete")).toBe(false);
  });

  it("stashes and consumes boot teach result once", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    stashAshoreTeachResult("complete");
    expect(consumeAshoreTeachResult()).toBe("complete");
    expect(consumeAshoreTeachResult()).toBeUndefined();
    vi.unstubAllGlobals();
  });
});
