import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  countStages,
  conversionLadder,
  biggestConstraint,
  strongestSource,
  recommendExperiment,
  scoreAcquisitionQuality,
  metricsForSource,
  allSourceMetrics,
} from "../src/metrics.js";

describe("lifecycle conversions", () => {
  it("counts stages and ladder rates", () => {
    const people = [
      {
        id: "a",
        segmentId: "S1",
        sourceId: "src",
        stages: { DISCOVERED: true, CONTACTED: true, REPLIED: true },
      },
      {
        id: "b",
        segmentId: "S1",
        sourceId: "src",
        stages: { DISCOVERED: true, CONTACTED: true },
      },
    ];
    const counts = countStages(people);
    assert.equal(counts.DISCOVERED, 2);
    assert.equal(counts.CONTACTED, 2);
    assert.equal(counts.REPLIED, 1);
    const steps = conversionLadder(counts);
    const replied = steps.find((s) => s.to === "REPLIED");
    assert.equal(replied.rate, 0.5);
  });
});

describe("north-star ranking", () => {
  it("prefers 100 visitors with 10 retained over 10k with zero", () => {
    const megaEmpty = scoreAcquisitionQuality({
      visitors: 10000,
      retainedPaying: 0,
    });
    const smallRetained = scoreAcquisitionQuality({
      visitors: 100,
      retainedPaying: 10,
    });
    assert.ok(smallRetained > megaEmpty);
  });
});

describe("constraint + single experiment", () => {
  it("empty ledger constrains discovery and recommends interviews", () => {
    const counts = countStages([]);
    const steps = conversionLadder(counts);
    const constraint = biggestConstraint(counts, steps);
    assert.equal(constraint.stage, "DISCOVERED");
    const exp = recommendExperiment({ counts, constraint });
    assert.equal(exp.id, "EXP_INTERVIEW_5_S1");
  });

  it("does not crown a strongest source on all zeros", () => {
    const metrics = allSourceMetrics({
      people: [],
      sources: [{ id: "a", label: "A" }],
      costs: [],
      offers: [],
    });
    assert.equal(strongestSource(metrics), null);
  });
});

describe("source economics", () => {
  it("computes CPL CAC rev/customer when data exists", () => {
    const ledger = {
      variableCostPerPaidUsd: 2,
      people: [
        {
          id: "1",
          segmentId: "S1",
          sourceId: "ads",
          offerId: "OFFER_FOUNDING_FAMILY",
          stages: {
            DISCOVERED: true,
            PAID: true,
            ACTIVATED: true,
            RETAINED: true,
          },
          revenueUsd: 29,
        },
        {
          id: "2",
          segmentId: "S1",
          sourceId: "ads",
          stages: { DISCOVERED: true },
        },
      ],
      sources: [{ id: "ads", label: "Ads" }],
      costs: [{ sourceId: "ads", weekOf: "2026-08-11", amountUsd: 50 }],
      offers: [],
    };
    const m = metricsForSource(ledger, "ads");
    assert.equal(m.prospects, 2);
    assert.equal(m.payments, 1);
    assert.equal(m.retention, 1);
    assert.equal(m.costPerLead, 25);
    assert.equal(m.cac, 50);
    assert.equal(m.revenuePerCustomer, 29);
    assert.equal(m.grossProfit, 27);
    assert.equal(m.contributionProfit, -23);
  });
});
