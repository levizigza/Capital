import { describe, expect, it } from "vitest";
import {
  CORE_PROBLEM_QUESTIONS,
  EVIDENCE_DB,
  addEvidenceRecord,
  assertCoreQuestionsAreBehavioral,
  assertNoForbiddenQuestion,
  canProposeIcpAmendment,
  evidenceSummary,
  type CustomerEvidenceRecord,
} from "./store";

function sample(over: Partial<CustomerEvidenceRecord> = {}): CustomerEvidenceRecord {
  return {
    interviewId: "I-20260814-01",
    participantId: "P-A1-01",
    segment: "S1_families_6_11",
    channel: "r/Parenting",
    date: "2026-08-14",
    phasesCompleted: "problem_only",
    hypothesesTouched: ["H-SEG-01", "IH-1"],
    problem: {
      pain: "Child meltdown when told toys cost too much",
      frequency: "Almost every weekend store trip",
      urgency: "Starting weekly allowance next month",
      existingAlternatives: ["Cash jar", "Lectures in the car"],
      moneyCurrentlySpent: "$0 on apps; time arguing",
      decisionMaker: "Parent interviewee buys kids apps",
      switchingBarriers: ["Setup time", "Partner skeptical of screens"],
      desiredOutcome: "Fewer checkout fights; kid can wait for goals",
      customerLanguage: ["He acts like money is infinite"],
    },
    observation: "Described last Saturday Target trip in detail.",
    interpretation: "Pain is acute at point of sale, not abstract literacy.",
    recommendation: "none_for_icp",
    ...over,
  };
}

describe("customerEvidence", () => {
  it("starts with empty evidence DB", () => {
    expect(EVIDENCE_DB).toHaveLength(0);
    expect(evidenceSummary().interviewsFiled).toBe(0);
    expect(evidenceSummary().icpUpdatesAllowed).toBe(false);
  });

  it("core questions are behavioral and forbid pitch/WTP leading forms", () => {
    expect(() => assertCoreQuestionsAreBehavioral()).not.toThrow();
    expect(CORE_PROBLEM_QUESTIONS.some((q) => /last time/i.test(q))).toBe(true);
    expect(() => assertNoForbiddenQuestion("Would you use Capital?")).toThrow();
    expect(() => assertNoForbiddenQuestion("Would you pay $10 for this?")).toThrow();
    expect(() => assertNoForbiddenQuestion("Wouldn’t this be useful?")).toThrow();
  });

  it("appends interview evidence with required problem fields", () => {
    const db: CustomerEvidenceRecord[] = [];
    addEvidenceRecord(sample(), db);
    expect(db).toHaveLength(1);
    expect(db[0]!.problem.customerLanguage[0]).toMatch(/infinite/);
  });

  it("rejects ICP amendment from a single interview", () => {
    const db: CustomerEvidenceRecord[] = [];
    addEvidenceRecord(sample(), db);
    const gate = canProposeIcpAmendment({
      segment: "S1_families_6_11",
      evidenceIds: ["I-20260814-01"],
      db,
    });
    expect(gate.ok).toBe(false);
  });

  it("allows ICP proposal only with recurring evidence", () => {
    const db: CustomerEvidenceRecord[] = [];
    for (let i = 1; i <= 3; i++) {
      addEvidenceRecord(
        sample({
          interviewId: `I-20260814-0${i}`,
          participantId: `P-A1-0${i}`,
        }),
        db,
      );
    }
    const gate = canProposeIcpAmendment({
      segment: "S1_families_6_11",
      evidenceIds: ["I-20260814-01", "I-20260814-02", "I-20260814-03"],
      db,
    });
    expect(gate.ok).toBe(true);
  });

  it("keeps problem discovery separable from product reaction", () => {
    const problemOnly = sample({ phasesCompleted: "problem_only" });
    expect(problemOnly.productReaction).toBeUndefined();
    const withProduct = sample({
      interviewId: "I-20260814-99",
      phasesCompleted: "problem_and_product",
      productReaction: {
        whatTheyThoughtItWas: "A kids money game",
        relevantToTheirPain: "partial",
        ignored: ["Family Room"],
        unexpectedlyValued: [],
        volunteeredWtpLanguage: [],
      },
    });
    expect(withProduct.phasesCompleted).toBe("problem_and_product");
  });
});
