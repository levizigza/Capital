import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Pillar 15 a11y craft contracts", () => {
  it("interior Soft Beat beacon respects reduced motion", () => {
    const interior = readFileSync(
      join(__dirname, "MoneyStructureInteriorView.tsx"),
      "utf8",
    );
    expect(interior).toMatch(/prefersReducedMotion/);
    expect(interior).toMatch(/interior-soft-beat-beacon/);
    expect(interior).toMatch(/reduced \? 0 :/);
  });

  it("share lower-third honors Settings high-contrast", () => {
    const share = readFileSync(
      join(__dirname, "../views/HarborFeltShareOverlay.tsx"),
      "utf8",
    );
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(share).toMatch(/highContrast/);
    expect(share).toMatch(/data-high-contrast/);
    expect(hub).toMatch(/highContrast=\{a11y\.highContrast\}/);
  });

  it("map + shore use Settings-aware prefersReducedMotion", () => {
    const map = readFileSync(join(__dirname, "ArchipelagoMap3D.tsx"), "utf8");
    const shore = readFileSync(join(__dirname, "WalkableIslandExplore.tsx"), "utf8");
    expect(map).toMatch(/prefersReducedMotion\(\)/);
    expect(map).not.toMatch(/matchMedia\?\.\(\"\(prefers-reduced-motion/);
    expect(shore).toMatch(/prefersReducedMotion\(\)/);
  });
});

describe("Pillar 14 shore failsafe", () => {
  it("skips hung Canvas and offers flat hotspot shore", () => {
    const shore = readFileSync(join(__dirname, "WalkableIslandExplore.tsx"), "utf8");
    expect(shore).toMatch(/SHORE_3D_FAIL_KEY/);
    expect(shore).toMatch(/island-shore-flat/);
    expect(shore).toMatch(/shore-flat-hotspot-/);
    expect(shore).toMatch(/HARBOR_HARD_FAILSAFE_MS/);
  });
});
