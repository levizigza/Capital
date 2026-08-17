import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Pillar 2 — Take hush ends as world captions + Carpet cue, not a modal card. */
describe("take hush micro-loop craft", () => {
  it("keeps line phase caption-only (no bordered card chrome)", () => {
    const take = readFileSync(join(__dirname, "TakeHushOverlay.tsx"), "utf8");
    expect(take).toMatch(/take-cinema-line/);
    expect(take).toMatch(/take-cinema-home-cta/);
    expect(take).toMatch(/Carpet home — Harbor felt that/);
    const lineBlock = take.slice(
      take.indexOf('data-testid="take-cinema-line"'),
      take.indexOf("take-cinema-home-cta") + 80,
    );
    expect(lineBlock).not.toMatch(/rounded-2xl border/);
    expect(lineBlock).not.toMatch(/backdrop-blur-md/);
  });

  it("keeps Carpet coach after hush while chapter quiet", () => {
    const shore = readFileSync(join(__dirname, "IslandShoreView.tsx"), "utf8");
    expect(shore).toMatch(/Walk to the pier · board Carpet/);
    expect(shore).toMatch(/shore-carpet-home-cta/);
  });
});
