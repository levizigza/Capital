import { describe, expect, it } from "vitest";
import {
  SESSION_CORPUS,
  analyzeCorpus,
  assertConfidenceNotOverclaimed,
  assertLayersSeparated,
  frequencyScoreFromCount,
  maxConfidenceForN,
  preferFrictionRemoval,
  priorityScore,
  sortByPriority,
  type UsabilityIssue,
} from "./store";

function sampleIssue(over: Partial<UsabilityIssue> = {}): UsabilityIssue {
  return {
    id: "I-001",
    participantsAffected: ["P-A1-01", "P-A1-02"],
    cohortCompletes: 4,
    severity: "MAJOR_FRICTION",
    tasksAffected: ["UT-01"],
    evidenceRefs: ["E-001", "E-002"],
    observation: "Two participants stood still >20s then opened Settings first.",
    interpretation: "Likely seeking a quest list / menu chrome.",
    recommendation: "Strengthen guide silhouette and Talk affordance before utility chrome.",
    likelyCause: "Utility chrome competes with guide during first orient",
    confidence: "med",
    proposedCorrection: "Clarify Talk affordance; reduce early utility salience",
    impact: 4,
    frequencyScore: 3,
    coreLoopImportance: 4,
    ...over,
  };
}

describe("usabilityAnalysis", () => {
  it("has empty session corpus — no invented participants", () => {
    expect(SESSION_CORPUS).toHaveLength(0);
    const snap = analyzeCorpus();
    expect(snap.sessionsCompleted).toBe(0);
    expect(snap.productChangesRecommended).toBe(false);
    expect(snap.prioritizedFixIds).toHaveLength(0);
  });

  it("separates layers and requires evidence", () => {
    expect(() => assertLayersSeparated(sampleIssue())).not.toThrow();
    expect(() =>
      assertLayersSeparated(
        sampleIssue({ observation: "", evidenceRefs: ["E-1"] }),
      ),
    ).toThrow(/observation/);
    expect(() =>
      assertLayersSeparated(
        sampleIssue({
          observation: "same",
          recommendation: "same",
        }),
      ),
    ).toThrow(/must differ/);
  });

  it("refuses high confidence from a single participant", () => {
    expect(maxConfidenceForN(1)).toBe("low");
    expect(() =>
      assertConfidenceNotOverclaimed(
        sampleIssue({
          participantsAffected: ["P-A1-01"],
          confidence: "high",
        }),
      ),
    ).toThrow(/confidence/);
  });

  it("priority = impact × frequency × core-loop importance", () => {
    const issue = sampleIssue({
      impact: 5,
      frequencyScore: 4,
      coreLoopImportance: 5,
    });
    expect(priorityScore(issue)).toBe(100);
    const sorted = sortByPriority([
      sampleIssue({ id: "low", impact: 1, frequencyScore: 1, coreLoopImportance: 1 }),
      issue,
    ]);
    expect(sorted[0]!.id).toBe("I-001");
  });

  it("frequency score bands match prioritization doc", () => {
    expect(frequencyScoreFromCount(1, 4)).toBe(1);
    expect(frequencyScoreFromCount(2, 4)).toBe(4); // 50% → band 4
    expect(frequencyScoreFromCount(2, 10)).toBe(2); // 20% → band 2
    expect(frequencyScoreFromCount(3, 4)).toBe(4);
    expect(frequencyScoreFromCount(4, 4)).toBe(5);
  });

  it("prefers friction removal over new feature builds", () => {
    expect(
      preferFrictionRemoval(
        sampleIssue({
          proposedCorrection: "Clarify Carpet affordance copy",
        }),
      ),
    ).toBe(true);
    expect(
      preferFrictionRemoval(
        sampleIssue({
          proposedCorrection: "Add new multiplayer island mode",
        }),
      ),
    ).toBe(false);
  });

  it("does not recommend product changes from n=1 even if severe", () => {
    const onlyOne = sampleIssue({
      id: "I-solo",
      participantsAffected: ["P-A1-01"],
      confidence: "low",
      impact: 5,
      frequencyScore: 1,
      coreLoopImportance: 5,
    });
    const snap = analyzeCorpus([onlyOne]);
    expect(snap.productChangesRecommended).toBe(false);
    expect(priorityScore(onlyOne)).toBe(25);
  });
});
