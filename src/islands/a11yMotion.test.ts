import { describe, expect, it, vi, afterEach } from "vitest";
import { cinemaTimeScale, plazaLifeAmp, systemPrefersReducedMotion } from "./a11yMotion";

describe("a11yMotion", () => {
  afterEach(() => {
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
    expect(cinemaTimeScale()).toBeLessThan(1);
    expect(plazaLifeAmp()).toBeLessThan(1);
  });

  it("keeps full motion when OS prefers none", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
      })),
    );
    expect(systemPrefersReducedMotion()).toBe(false);
    expect(cinemaTimeScale()).toBe(1);
    expect(plazaLifeAmp()).toBe(1);
  });
});
