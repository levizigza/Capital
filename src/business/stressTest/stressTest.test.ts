import { describe, expect, it } from "vitest";
import {
  DEMAND_MULTIPLIER,
  RESPONSE_PRIORITY_ORDER,
  STRESS_SCENARIOS,
  BusinessStressTestEngine,
  computeAllImpacts,
  runStressTest,
} from "./index";
import type { StressBaselineInputs } from "./types";

const sampleBaseline: StressBaselineInputs = {
  gross_revenue: 100_000,
  refunds: 5_000,
  other_variable_delivery: 8_000,
  payment_fees: 3_000,
  ai_api_expense: 4_000,
  hosting_expense: 2_000,
  marketing_spend: 20_000,
  fixed_costs: 25_000,
  cash: 200_000,
  customers: 2_000,
  new_customers: 200,
  retention_rate: 0.85,
  cac: null,
  ltv: null,
  currency: "USD",
};

describe("scenarios", () => {
  it("defines BASELINE and demand-down 20/40/60", () => {
    expect(STRESS_SCENARIOS).toEqual([
      "BASELINE",
      "DEMAND_DOWN_20",
      "DEMAND_DOWN_40",
      "DEMAND_DOWN_60",
    ]);
    expect(DEMAND_MULTIPLIER.BASELINE).toBe(1);
    expect(DEMAND_MULTIPLIER.DEMAND_DOWN_20).toBe(0.8);
    expect(DEMAND_MULTIPLIER.DEMAND_DOWN_40).toBe(0.6);
    expect(DEMAND_MULTIPLIER.DEMAND_DOWN_60).toBe(0.4);
  });
});

describe("impacts", () => {
  it("calculates all required impact fields per scenario", () => {
    const impacts = computeAllImpacts(sampleBaseline);
    expect(impacts).toHaveLength(4);
    for (const s of impacts) {
      expect(s.revenue).not.toBeNull();
      expect(s.gross_profit).not.toBeNull();
      expect(s.contribution_profit).not.toBeNull();
      expect(s.cash).not.toBeNull();
      expect(s.ai_api_expense).not.toBeNull();
      expect(s.marketing).not.toBeNull();
      expect(s.fixed_costs).toBe(25_000);
      expect(s.customer_retention).not.toBeNull();
      expect(s.cac).not.toBeNull();
      // payback may or may not exist depending on contribution
      expect(s).toHaveProperty("payback_months");
      expect(s).toHaveProperty("runway_months");
    }
    const base = impacts[0]!;
    const down60 = impacts[3]!;
    expect(down60.revenue!).toBeLessThan(base.revenue!);
    expect(down60.demand_multiplier).toBe(0.4);
    expect(down60.ai_api_expense).toBeCloseTo(4_000 * 0.4, 5);
    expect(down60.customer_retention!).toBeLessThan(base.customer_retention!);
  });

  it("leaves UNKNOWN nulls without inventing", () => {
    const impacts = computeAllImpacts({
      ...sampleBaseline,
      gross_revenue: null,
      cac: null,
      new_customers: null,
      marketing_spend: null,
    });
    expect(impacts[0]?.revenue).toBeNull();
    expect(impacts[0]?.notes.some((n) => /UNKNOWN/i.test(n))).toBe(true);
  });
});

describe("responses", () => {
  it("emits priorities 1..9 in order", () => {
    const report = runStressTest(sampleBaseline);
    expect(RESPONSE_PRIORITY_ORDER).toHaveLength(9);
    const kinds = report.responses
      .filter((r) => !r.blocked)
      .map((r) => r.kind);
    // First occurrence of each priority kind follows order
    let last = -1;
    for (const k of RESPONSE_PRIORITY_ORDER) {
      const idx = kinds.indexOf(k);
      expect(idx).toBeGreaterThan(last);
      last = idx;
    }
    expect(report.responses[0]?.kind).toBe("protect_customer_value");
    expect(report.policy).toBe("no_indiscriminate_core_product_cuts");
  });

  it("blocks indiscriminate core-product cuts without long-term consequences", () => {
    const report = runStressTest(sampleBaseline, {
      include_indiscriminate_core_cut_attempt: true,
    });
    const blocked = report.responses.filter((r) => r.blocked);
    expect(blocked.length).toBeGreaterThan(0);
    expect(blocked[0]?.block_reason).toMatch(/long-term consequences/i);
    expect(blocked[0]?.touches_core_product).toBe(true);
    expect(blocked[0]?.long_term_consequences).toBeNull();
  });

  it("allows core-touching recommendation only with disclosed consequences", () => {
    const report = runStressTest(sampleBaseline, {
      core_cut_with_consequences: {
        title: "Defer non-signature island polish (keep Soft Beat)",
        rationale: "Pause secondary island cosmetics eng to preserve cash",
        long_term_consequences:
          "Delayed secondary content may slow map breadth perception, but signature Cove→Paycheck→Credit loop remains; recovery path is re-enabling polish after runway stabilizes.",
      },
    });
    const disclosed = report.responses.find((r) =>
      r.title.includes("Defer non-signature"),
    );
    expect(disclosed?.blocked).toBe(false);
    expect(disclosed?.long_term_consequences).toMatch(/signature/i);
  });
});

describe("BusinessStressTestEngine", () => {
  it("returns a full report", () => {
    const eng = new BusinessStressTestEngine();
    const report = eng.run(sampleBaseline);
    expect(report.impacts).toHaveLength(4);
    expect(report.responses.length).toBeGreaterThanOrEqual(9);
  });
});
