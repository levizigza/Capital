import { describe, expect, it } from "vitest";
import {
  COLD_SIGNATURE_BUNDLE,
  OBSERVATIONAL_TESTS,
  assertFindingEvidence,
  assertTasksAreGoals,
  findingHasEvidence,
  testById,
} from "./store";

describe("usabilityResearch", () => {
  it("defines 13 observational tests with full fields", () => {
    expect(OBSERVATIONAL_TESTS).toHaveLength(13);
    for (const t of OBSERVATIONAL_TESTS) {
      expect(t.researchQuestion.length).toBeGreaterThan(10);
      expect(t.task.length).toBeGreaterThan(10);
      expect(t.successCondition.length).toBeGreaterThan(5);
      expect(t.failureCondition.length).toBeGreaterThan(5);
      expect(t.observableSignals.length).toBeGreaterThan(0);
    }
  });

  it("keeps participant tasks goal-shaped (no click scripts)", () => {
    expect(() => assertTasksAreGoals()).not.toThrow();
    const ut02 = testById("UT-02");
    expect(ut02.task.toLowerCase()).not.toContain("click");
    expect(ut02.task.toLowerCase()).not.toMatch(/press e/);
  });

  it("cold signature bundle covers iconic path accomplishments", () => {
    expect(COLD_SIGNATURE_BUNDLE).toContain("UT-03");
    expect(COLD_SIGNATURE_BUNDLE).toContain("UT-05");
    expect(COLD_SIGNATURE_BUNDLE).toContain("UT-06");
    expect(COLD_SIGNATURE_BUNDLE).toContain("UT-09");
  });

  it("rejects findings without evidence", () => {
    expect(
      findingHasEvidence({
        id: "F-001",
        class: "CRITICAL_BLOCKER",
        testIds: ["UT-01"],
        participantIds: [],
        evidenceRefs: [],
        confidence: "low",
        summary: "x",
        recommendation: "needs_more_evidence",
      }),
    ).toBe(false);

    expect(() =>
      assertFindingEvidence({
        id: "F-002",
        class: "DELIGHT",
        testIds: ["UT-05"],
        participantIds: ["P-A1-01"],
        evidenceRefs: ["E-001"],
        confidence: "med",
        summary: "Lean-in during Plinth spectacle",
        recommendation: "no_change",
      }),
    ).not.toThrow();
  });
});
