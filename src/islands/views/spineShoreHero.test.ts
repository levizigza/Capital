import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 0/1 — spine shores lead with organ verb, not genre-city encyclopedia.
 */
describe("spine shore hero fantasy", () => {
  const shore = readFileSync(join(__dirname, "IslandShoreView.tsx"), "utf8");

  it("leads spine shores with organ verb (genre Cast/Machines parked)", () => {
    expect(shore).toMatch(/isSpineTravelId/);
    expect(shore).toMatch(/spineShore/);
    expect(shore).toMatch(/shore-organ-line/);
    expect(shore).toMatch(/living money on this shore/);
    // Genre encyclopedia must not return on spine shores.
    expect(shore).not.toMatch(/Cast:/);
    expect(shore).not.toMatch(/Machines:/);
  });

  it("keeps shore-next-verb organ chip on hero", () => {
    expect(shore).toMatch(/shore-next-verb/);
    expect(shore).toMatch(/organVerbChip/);
  });
});
