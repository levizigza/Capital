import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 0/1 — spine shores lead with organ verb, not genre-city encyclopedia.
 */
describe("spine shore hero fantasy", () => {
  const shore = readFileSync(join(__dirname, "IslandShoreView.tsx"), "utf8");

  it("gates genre Cast/Machines behind non-spine shores", () => {
    expect(shore).toMatch(/isSpineTravelId/);
    expect(shore).toMatch(/spineShore/);
    expect(shore).toMatch(/shore-organ-line/);
    expect(shore).toMatch(/living money on this shore/);
    // Genre cast line must sit inside the non-spine branch only.
    const castIdx = shore.indexOf("Cast:");
    const spineBranch = shore.indexOf("spineShore ?");
    expect(castIdx).toBeGreaterThan(spineBranch);
    expect(shore.slice(spineBranch, castIdx)).toMatch(/shore-organ-line/);
  });

  it("keeps shore-next-verb organ chip on hero", () => {
    expect(shore).toMatch(/shore-next-verb/);
    expect(shore).toMatch(/organVerbChip/);
  });
});
