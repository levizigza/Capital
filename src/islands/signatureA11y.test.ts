import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 15 — prefers-reduced-motion full signature loop.
 * No Settings-blind OS-only probes; organ mark / Plinth strobes damp via cinemaFlashAmp.
 */
describe("Signature loop accessibility", () => {
  const views = join(__dirname, "views");
  const world3d = join(__dirname, "world3d");

  it("cinema overlays use prefersReducedMotion (Settings OR OS)", () => {
    for (const file of [
      "TakeHushOverlay.tsx",
      "ScarSpectacleOverlay.tsx",
      "SoftBeatOverlay.tsx",
      "SignatureTrailerOverlay.tsx",
    ]) {
      const src = readFileSync(join(views, file), "utf8");
      expect(src).toMatch(/prefersReducedMotion/);
      expect(src).not.toMatch(/matchMedia\?\.\("\(prefers-reduced-motion/);
    }
  });

  it("organ Take landmarks + Plinth damp flash via cinemaFlashAmp", () => {
    for (const file of [
      "CoinJarLandmark.tsx",
      "PayrollTowerLandmark.tsx",
      "InterestKeepLandmark.tsx",
      "HarborLandmarks.tsx",
    ]) {
      const src = readFileSync(join(world3d, file), "utf8");
      expect(src).toMatch(/cinemaFlashAmp|prefersReducedMotion/);
    }
    const jar = readFileSync(join(world3d, "CoinJarLandmark.tsx"), "utf8");
    expect(jar).toMatch(/cinemaFlashAmp/);
    // Mark strobe must scale with flash amp (not raw sin(t*10) alone)
    expect(jar).toMatch(/flash \*/);
  });

  it("juice imports shared prefersReducedMotion and skips bounce under reduce", () => {
    const juice = readFileSync(join(__dirname, "../juice/triggerJuice.ts"), "utf8");
    expect(juice).toMatch(/from "@\/islands\/a11yMotion"/);
    expect(juice).toMatch(/prefersReducedMotion\(\)/);
    expect(juice).toMatch(/bounceTarget[\s\S]*prefersReducedMotion/);
  });
});
