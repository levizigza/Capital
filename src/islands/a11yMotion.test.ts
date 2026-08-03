import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import {
  cinemaFlashAmp,
  cinemaTimeScale,
  plazaLifeAmp,
  prefersReducedMotion,
  syncReducedMotionSetting,
  systemPrefersReducedMotion,
} from "./a11yMotion";

describe("a11yMotion", () => {
  beforeEach(() => {
    syncReducedMotionSetting(false);
  });

  afterEach(() => {
    syncReducedMotionSetting(false);
    vi.unstubAllGlobals();
  });

  it("reports system reduced motion and scales cinema/plaza life", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
      })),
    );
    expect(systemPrefersReducedMotion()).toBe(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(cinemaTimeScale()).toBeLessThan(1);
    expect(plazaLifeAmp()).toBeLessThan(1);
    expect(cinemaFlashAmp()).toBe(0);
  });

  it("keeps full motion when OS prefers none and Settings is off", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
      })),
    );
    expect(systemPrefersReducedMotion()).toBe(false);
    expect(prefersReducedMotion()).toBe(false);
    expect(cinemaTimeScale()).toBe(1);
    expect(plazaLifeAmp()).toBe(1);
    expect(cinemaFlashAmp()).toBe(1);
  });

  it("Pillar 15 — Settings reduced motion quiets cinema even when OS is full", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
      })),
    );
    syncReducedMotionSetting(true);
    expect(systemPrefersReducedMotion()).toBe(false);
    expect(prefersReducedMotion()).toBe(true);
    expect(cinemaTimeScale()).toBeLessThan(1);
    expect(cinemaFlashAmp()).toBe(0);
  });
});
