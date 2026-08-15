import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDashboard } from "../generate-dashboard.mjs";

describe("first revenue dashboard", () => {
  it("surfaces hypothesis, zeros, and open founder escalations", () => {
    const { markdown, counts, openEscalationIds } = buildDashboard({
      ledger: {
        people: [],
        currency: "USD",
      },
      state: {
        activeHypothesis: {
          id: "S1_families_6_11",
          label: "Families with kids ~6–11",
          whyStrongest: "signature loop",
          status: "hypothesis",
          confidence: "low",
        },
        nextExperiment: {
          id: "EXP_INTERVIEW_5_S1",
          title: "Five interviews",
        },
        currentStep: "FIND",
        steps: {
          IDENTIFY: { status: "complete" },
          FIND: { status: "blocked_founder" },
        },
        learning: {},
        hardRules: ["Do not spam"],
        founderEscalations: [
          {
            id: "ESC_FIND_WARM_LIST",
            status: "open",
            summary: "Need list",
            decisionNeeded: "Who to contact?",
          },
        ],
        paymentPath: { preferred: "stripe_checkout_test", liveAllowed: false },
        activationDefinition: "Cove Take",
        retentionDefinition: "D7 return",
        approvedOfferId: null,
      },
    });

    assert.equal(counts.PAID, 0);
    assert.equal(counts.RETAINED, 0);
    assert.ok(markdown.includes("Families with kids ~6–11"));
    assert.ok(markdown.includes("EXP_INTERVIEW_5_S1"));
    assert.ok(markdown.includes("ESC_FIND_WARM_LIST"));
    assert.ok(markdown.includes("paying retained customers"));
    assert.deepEqual(openEscalationIds, ["ESC_FIND_WARM_LIST"]);
    assert.equal(markdown.includes("10,000 visitors"), false);
  });

  it("counts interviews and payments from ledger people", () => {
    const { counts, revenue } = buildDashboard({
      ledger: {
        people: [
          {
            id: "1",
            segmentId: "S1",
            sourceId: "src",
            stages: { INTERVIEWED: true, USER_TEST: true, QUALIFIED: true },
          },
          {
            id: "2",
            segmentId: "S1",
            sourceId: "src",
            stages: { PAID: true, ACTIVATED: true, RETAINED: true },
            revenueUsd: 29,
          },
        ],
      },
      state: {
        activeHypothesis: {
          id: "S1",
          label: "S1",
          whyStrongest: "x",
          status: "hypothesis",
          confidence: "low",
        },
        nextExperiment: { id: "E", title: "T" },
        steps: {},
        learning: { topPain: "allowance fights" },
        hardRules: [],
        founderEscalations: [],
        paymentPath: { preferred: "stripe_checkout_test", liveAllowed: false },
        activationDefinition: "a",
        retentionDefinition: "b",
      },
    });
    assert.equal(counts.INTERVIEWED, 1);
    assert.equal(counts.USER_TEST, 1);
    assert.equal(counts.PAID, 1);
    assert.equal(counts.RETAINED, 1);
    assert.equal(revenue, 29);
  });
});
