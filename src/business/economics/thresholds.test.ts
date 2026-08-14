import { describe, expect, it } from "vitest";
import { computeEconomicsSnapshot } from "./compute";
import { evaluateEconomicsAlerts } from "./thresholds";
import {
  DEFAULT_ECONOMICS_THRESHOLDS,
  type EconomicsInputs,
  type EconomicsThresholds,
} from "./types";

const base: EconomicsInputs = {
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

describe("evaluateEconomicsAlerts", () => {
  it("does not alert on a healthy period by default thresholds", () => {
    const snap = computeEconomicsSnapshot({ periodId: "2026-08", inputs: base });
    expect(snap.alerts.filter((a) => a.severity === "critical")).toHaveLength(0);
  });

  it("alerts on high churn / low retention", () => {
    const snap = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: { ...base, retentionRate: 0.05, churnRate: 0.95 },
    });
    expect(snap.alerts.some((a) => a.id === "churn_high")).toBe(true);
    expect(snap.alerts.some((a) => a.id === "retention_low")).toBe(true);
  });

  it("alerts when cash below floor", () => {
    const thresholds: EconomicsThresholds = {
      ...DEFAULT_ECONOMICS_THRESHOLDS,
      minCashBalance: 10_000,
    };
    const snap = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: base,
      thresholds,
    });
    expect(snap.alerts.some((a) => a.id === "cash_low")).toBe(true);
  });

  it("alerts revenue-up contribution-down (anti revenue-only optimization)", () => {
    const prior = computeEconomicsSnapshot({
      periodId: "2026-07",
      inputs: {
        ...base,
        grossRevenue: 800,
        refunds: 0,
        marketingSpend: 50,
      },
    });
    // Higher net revenue but much higher marketing → lower contribution
    const current = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: {
        ...base,
        grossRevenue: 1200,
        refunds: 0,
        marketingSpend: 900,
      },
      prior,
    });
    expect(current.derived.netRevenue!).toBeGreaterThan(prior.derived.netRevenue!);
    expect(current.derived.contributionProfit!).toBeLessThan(
      prior.derived.contributionProfit!,
    );
    expect(current.alerts.some((a) => a.id === "revenue_up_contribution_down")).toBe(true);
  });

  it("evaluateEconomicsAlerts is pure given derived inputs", () => {
    const snap = computeEconomicsSnapshot({ periodId: "2026-08", inputs: base });
    const again = evaluateEconomicsAlerts({
      inputs: snap.inputs,
      derived: snap.derived,
      thresholds: DEFAULT_ECONOMICS_THRESHOLDS,
      prior: null,
    });
    expect(again.map((a) => a.id).sort()).toEqual(snap.alerts.map((a) => a.id).sort());
  });
});
