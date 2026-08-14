import { describe, expect, it } from "vitest";
import {
  calcArpu,
  calcCac,
  calcCacPaybackPeriods,
  calcContributionProfit,
  calcConversionRate,
  calcChurnFromRetention,
  calcGrossProfit,
  calcLtv,
  calcLtvToCac,
  calcMargin,
  calcNetRevenue,
  calcOperatingProfit,
  calcPeriodChange,
  calcRefundRate,
  calcVariableDeliveryCost,
  resolveChurnRate,
  resolveRetentionRate,
} from "./equations";

describe("economics equations", () => {
  describe("calcNetRevenue", () => {
    it("Net Revenue = Gross Revenue − Refunds", () => {
      expect(calcNetRevenue(1000, 50)).toBe(950);
    });
    it("returns null when either input missing (no fabrication)", () => {
      expect(calcNetRevenue(null, 50)).toBeNull();
      expect(calcNetRevenue(1000, null)).toBeNull();
    });
  });

  describe("calcVariableDeliveryCost", () => {
    it("sums payment + AI/API + hosting + other delivery", () => {
      expect(calcVariableDeliveryCost(30, 40, 20, 10)).toBe(100);
    });
    it("returns null if any component missing", () => {
      expect(calcVariableDeliveryCost(30, null, 20, 10)).toBeNull();
    });
  });

  describe("calcGrossProfit", () => {
    it("Gross Profit = Net Revenue − Variable Delivery Cost", () => {
      expect(calcGrossProfit(950, 100)).toBe(850);
    });
    it("returns null when incomplete", () => {
      expect(calcGrossProfit(null, 100)).toBeNull();
    });
  });

  describe("calcContributionProfit", () => {
    it("Contribution Profit = Gross Profit − Acquisition Expense", () => {
      expect(calcContributionProfit(850, 200)).toBe(650);
    });
    it("returns null when incomplete", () => {
      expect(calcContributionProfit(850, null)).toBeNull();
    });
  });

  describe("calcOperatingProfit", () => {
    it("Operating Profit = Contribution Profit − Fixed Operating Expense", () => {
      expect(calcOperatingProfit(650, 300)).toBe(350);
    });
    it("returns null when incomplete", () => {
      expect(calcOperatingProfit(null, 300)).toBeNull();
    });
  });

  describe("calcArpu", () => {
    it("ARPU = Net Revenue / Paying Customers", () => {
      expect(calcArpu(950, 10)).toBe(95);
    });
    it("returns null when customers ≤ 0 or missing", () => {
      expect(calcArpu(950, 0)).toBeNull();
      expect(calcArpu(950, null)).toBeNull();
    });
  });

  describe("calcConversionRate", () => {
    it("conversion = conversions / funnel entries", () => {
      expect(calcConversionRate(25, 100)).toBe(0.25);
    });
    it("returns null when funnel empty or missing", () => {
      expect(calcConversionRate(25, 0)).toBeNull();
      expect(calcConversionRate(null, 100)).toBeNull();
    });
  });

  describe("calcCac", () => {
    it("CAC = Marketing Spend / New Customers", () => {
      expect(calcCac(200, 4)).toBe(50);
    });
    it("returns null when newCustomers ≤ 0", () => {
      expect(calcCac(200, 0)).toBeNull();
    });
  });

  describe("churn / retention resolution", () => {
    it("churnFromRetention = 1 − retention", () => {
      expect(calcChurnFromRetention(0.8)).toBeCloseTo(0.2);
    });
    it("resolveChurn prefers explicit churn", () => {
      expect(resolveChurnRate(0.3, 0.9)).toBe(0.3);
    });
    it("resolveChurn derives from retention when churn null", () => {
      expect(resolveChurnRate(null, 0.75)).toBeCloseTo(0.25);
    });
    it("resolveRetention derives from churn when retention null", () => {
      expect(resolveRetentionRate(null, 0.4)).toBeCloseTo(0.6);
    });
    it("rejects out-of-range rates", () => {
      expect(resolveChurnRate(1.5, null)).toBeNull();
      expect(resolveRetentionRate(-0.1, null)).toBeNull();
    });
  });

  describe("calcLtv", () => {
    it("LTV = ARPU / churnRate", () => {
      expect(calcLtv(95, 0.2)).toBeCloseTo(475);
    });
    it("does not invent finite LTV when churn is 0", () => {
      expect(calcLtv(95, 0)).toBeNull();
    });
  });

  describe("calcLtvToCac", () => {
    it("LTV:CAC ratio", () => {
      expect(calcLtvToCac(475, 50)).toBeCloseTo(9.5);
    });
    it("null when cac ≤ 0", () => {
      expect(calcLtvToCac(475, 0)).toBeNull();
    });
  });

  describe("calcCacPaybackPeriods", () => {
    it("CAC / (contributionProfit / payingCustomers)", () => {
      // contrib 650 / 10 customers = 65 per; CAC 50 → payback 50/65
      expect(calcCacPaybackPeriods(50, 650, 10)).toBeCloseTo(50 / 65);
    });
    it("null when contribution per customer ≤ 0", () => {
      expect(calcCacPaybackPeriods(50, -10, 10)).toBeNull();
      expect(calcCacPaybackPeriods(50, 0, 10)).toBeNull();
    });
  });

  describe("calcMargin / refund / period change", () => {
    it("margin = part / base", () => {
      expect(calcMargin(400, 1000)).toBe(0.4);
    });
    it("refund rate = refunds / gross", () => {
      expect(calcRefundRate(50, 1000)).toBe(0.05);
    });
    it("period change = (current - prior) / |prior|", () => {
      expect(calcPeriodChange(800, 1000)).toBeCloseTo(-0.2);
    });
    it("period change null when prior is 0", () => {
      expect(calcPeriodChange(100, 0)).toBeNull();
    });
  });
});
