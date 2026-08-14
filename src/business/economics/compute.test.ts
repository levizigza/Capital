import { describe, expect, it } from "vitest";
import { computeEconomicsSnapshot, emptyEconomicsInputs } from "./compute";
import type { EconomicsInputs } from "./types";

const fullInputs: EconomicsInputs = {
  grossRevenue: 1000,
  refunds: 50,
  paymentFees: 30,
  aiApiVariableCost: 40,
  hostingVariableCost: 20,
  otherDeliveryCost: 10,
  marketingSpend: 200,
  fixedOperatingExpense: 300,
  cashBalance: 5000,
  payingCustomers: 10,
  newCustomers: 4,
  acquisitionFunnelEntries: 100,
  conversions: 25,
  retentionRate: 0.8,
  churnRate: null,
};

describe("computeEconomicsSnapshot", () => {
  it("computes the full identity chain from documented equations", () => {
    const snap = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: fullInputs,
      recordedAt: "2026-08-14T00:00:00.000Z",
    });

    // Net 950; variable 100; gross 850; contribution 650; operating 350
    expect(snap.derived.netRevenue).toBe(950);
    expect(snap.derived.variableDeliveryCost).toBe(100);
    expect(snap.derived.grossProfit).toBe(850);
    expect(snap.derived.contributionProfit).toBe(650);
    expect(snap.derived.operatingProfit).toBe(350);
    expect(snap.derived.arpu).toBe(95);
    expect(snap.derived.conversionRate).toBe(0.25);
    expect(snap.derived.retentionRate).toBe(0.8);
    expect(snap.derived.churnRate).toBeCloseTo(0.2);
    expect(snap.derived.cac).toBe(50);
    expect(snap.derived.ltv).toBeCloseTo(475);
    expect(snap.derived.ltvToCac).toBeCloseTo(9.5);
    expect(snap.derived.cacPaybackPeriods).toBeCloseTo(50 / 65);
    expect(snap.derived.cashBalance).toBe(5000);
    expect(snap.nullReasons).toHaveLength(0);
  });

  it("does not fabricate when inputs are empty — all derived null with reasons", () => {
    const snap = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: emptyEconomicsInputs(),
    });
    for (const v of Object.values(snap.derived)) {
      expect(v).toBeNull();
    }
    expect(snap.nullReasons.length).toBeGreaterThan(0);
    expect(snap.nullReasons.some((r) => r.field === "netRevenue")).toBe(true);
  });

  it("tracks cash only when provided", () => {
    const snap = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: { ...fullInputs, cashBalance: null },
    });
    expect(snap.derived.cashBalance).toBeNull();
    expect(snap.nullReasons.some((r) => r.field === "cashBalance")).toBe(true);
  });
});
