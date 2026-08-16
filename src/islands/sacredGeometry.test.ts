import { describe, expect, it } from "vitest";
import { PHI, PHI_INV, SEED_SIDE_R, SEED_SPINE_R, TITLE_GOLDEN_TOP } from "./sacredGeometry";

describe("sacredGeometry tokens", () => {
  it("keeps φ relationships stable for title + map compositions", () => {
    expect(PHI).toBeCloseTo(1.6180339887, 8);
    expect(PHI_INV).toBeCloseTo(0.6180339887, 8);
    expect(SEED_SIDE_R / SEED_SPINE_R).toBeCloseTo(PHI, 8);
    expect(TITLE_GOLDEN_TOP).toMatch(/%$/);
  });
});
