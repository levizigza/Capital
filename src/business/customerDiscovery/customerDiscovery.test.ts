import { describe, expect, it } from "vitest";
import {
  SEED_CLAIMS,
  SEED_SCORECARDS,
  assertCompositesMatch,
  claimsByKind,
  compositeFromScores,
  fitGatedLead,
  provisionalLead,
} from "./store";

describe("customerDiscovery store", () => {
  it("keeps facts and hypotheses in separate kinds", () => {
    const facts = claimsByKind("fact");
    const hyps = claimsByKind("hypothesis");
    expect(facts.length).toBeGreaterThan(0);
    expect(hyps.length).toBeGreaterThan(0);
    expect(facts.every((c) => c.kind === "fact")).toBe(true);
    expect(hyps.every((c) => c.kind === "hypothesis")).toBe(true);
    expect(SEED_CLAIMS.some((c) => c.id === "H-SEG-01" && c.kind === "fact")).toBe(false);
  });

  it("refuses to treat design ICP claim as fact", () => {
    const seg01 = SEED_CLAIMS.find((c) => c.id === "H-SEG-01");
    expect(seg01?.kind).toBe("hypothesis");
  });

  it("scorecard composites match weighted formula", () => {
    expect(() => assertCompositesMatch()).not.toThrow();
    const s1 = SEED_SCORECARDS.find((s) => s.id === "S1_families_6_11")!;
    expect(compositeFromScores(s1.scores)).toBe(73);
    const s2 = SEED_SCORECARDS.find((s) => s.id === "S2_homeschool")!;
    expect(compositeFromScores(s2.scores)).toBe(74);
  });

  it("raw provisional lead is S2 by composite — not assumed design ICP", () => {
    const lead = provisionalLead();
    expect(lead.id).toBe("S2_homeschool");
    expect(lead.confidence).toBe("low");
  });

  it("fit-gated pool requires product_fit ≥ 3; S2 still leads on composite", () => {
    const gated = fitGatedLead();
    expect(gated.scores.product_fit).toBeGreaterThanOrEqual(3);
    expect(gated.id).toBe("S2_homeschool");
    const s1 = SEED_SCORECARDS.find((s) => s.id === "S1_families_6_11")!;
    expect(s1.scores.product_fit).toBeGreaterThan(gated.scores.product_fit);
  });

  it("records that VoC corpus absence is a fact", () => {
    const voc = SEED_CLAIMS.find((c) => c.id === "F-NO-VOC-CORPUS");
    expect(voc?.kind).toBe("fact");
  });
});
