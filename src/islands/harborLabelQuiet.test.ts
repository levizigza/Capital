/**
 * First-meet plaza label law — presence hushes billboards; no mirrored Troika flips.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Harbor first-meet labels", () => {
  it("wires piggyPresenceBeat from presence (not stripPlaza)", () => {
    const hub = readFileSync(join(__dirname, "views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/piggyPresenceBeat=\{piggyPresence\}/);
    expect(hub).not.toMatch(/piggyPresenceBeat=\{stripPlaza\}/);
  });

  it("plaza labels only when near/pulsing — no always-on hero billboards", () => {
    const plaza = readFileSync(join(__dirname, "world3d/WalkableHarborView.tsx"), "utf8");
    expect(plaza).toMatch(/!piggyPresenceBeat && \(pulsing \|\| nearby\)/);
    expect(plaza).not.toMatch(/pulsing \|\| nearby \|\| hero/);
    expect(plaza).not.toMatch(/scale=\{\[-1,\s*1,\s*1\]\}/);
  });

  it("Plinth drops empty-shelf Memory billboard and X-flip", () => {
    const plinth = readFileSync(join(__dirname, "world3d/HarborLandmarks.tsx"), "utf8");
    expect(plinth).toMatch(/quietLabels/);
    expect(plinth).not.toMatch(/>\s*Memory\s*</);
    expect(plinth).not.toMatch(/scale=\{\[-1,\s*1,\s*1\]\}/);
  });
});
