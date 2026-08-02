import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 9 — navigability: signature overlays must wire window Esc + Leave.
 */
describe("Overlay navigability contract", () => {
  const dir = __dirname;

  it("exports useOverlayEscape for window-level Esc", () => {
    const src = readFileSync(join(dir, "useOverlayEscape.ts"), "utf8");
    expect(src).toMatch(/addEventListener\("keydown"/);
    expect(src).toMatch(/Escape/);
  });

  it("wires Esc + Leave on HarborFelt share and cinema overlays", () => {
    const share = readFileSync(join(dir, "HarborFeltShareOverlay.tsx"), "utf8");
    const take = readFileSync(join(dir, "TakeHushOverlay.tsx"), "utf8");
    const spectacle = readFileSync(join(dir, "ScarSpectacleOverlay.tsx"), "utf8");
    const soft = readFileSync(join(dir, "SoftBeatOverlay.tsx"), "utf8");
    const trailer = readFileSync(join(dir, "SignatureTrailerOverlay.tsx"), "utf8");
    const day2 = readFileSync(join(dir, "Day2EchoOverlay.tsx"), "utf8");
    const arrive = readFileSync(join(dir, "WorldArriveOverlay.tsx"), "utf8");

    for (const src of [share, take, spectacle, soft, trailer, day2, arrive]) {
      expect(src).toMatch(/useOverlayEscape/);
      expect(src).toMatch(/Esc · Leave/);
    }
    expect(share).toMatch(/data-testid="harbor-felt-keep-walking"/);
    expect(trailer).toMatch(/data-testid="signature-trailer-leave"/);
    expect(day2).toMatch(/data-testid="day2-echo-leave"/);
  });
});

