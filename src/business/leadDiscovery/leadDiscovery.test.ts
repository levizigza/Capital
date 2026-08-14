import { describe, expect, it } from "vitest";
import {
  QUALIFIED_FLOOR,
  QUALIFIED_LEADS,
  assertLeadsValid,
  primaryIcpLeads,
  rankedLeads,
  totalScore,
} from "./store";

describe("leadDiscovery", () => {
  it("keeps a small high-quality set (≤25 qualified)", () => {
    expect(QUALIFIED_LEADS.length).toBeGreaterThanOrEqual(15);
    expect(QUALIFIED_LEADS.length).toBeLessThanOrEqual(25);
  });

  it("validates scores and forbids auto-contact", () => {
    expect(() => assertLeadsValid()).not.toThrow();
    expect(QUALIFIED_LEADS.every((l) => l.autoContact === false)).toBe(true);
    expect(QUALIFIED_LEADS.every((l) => l.totalScore >= QUALIFIED_FLOOR)).toBe(
      true,
    );
  });

  it("ranks Great Homeschool Conventions first among seed leads", () => {
    const top = rankedLeads()[0]!;
    expect(top.id).toBe("L03");
    expect(totalScore(top.scores)).toBe(88);
  });

  it("prioritizes S1/S2 coverage without inventing personal emails", () => {
    const primary = primaryIcpLeads();
    expect(primary.length).toBeGreaterThan(5);
    for (const lead of QUALIFIED_LEADS) {
      expect(lead.access.toLowerCase()).not.toMatch(/@gmail\.com/);
      expect(lead.who.length).toBeGreaterThan(10);
      expect(lead.problemSignal.length).toBeGreaterThan(10);
    }
  });
});
