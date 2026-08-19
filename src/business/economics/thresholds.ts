/**
 * Deterioration alerts — multi-objective (not revenue-alone).
 */

import {
  calcMargin,
  calcPeriodChange,
  calcRefundRate,
} from "./equations";
import type {
  EconomicsAlert,
  EconomicsDerived,
  EconomicsInputs,
  EconomicsSnapshot,
  EconomicsThresholds,
} from "./types";

export function evaluateEconomicsAlerts(opts: {
  inputs: EconomicsInputs;
  derived: EconomicsDerived;
  thresholds: EconomicsThresholds;
  prior: EconomicsSnapshot | null;
}): EconomicsAlert[] {
  const { inputs, derived, thresholds, prior } = opts;
  const alerts: EconomicsAlert[] = [];

  const push = (alert: EconomicsAlert) => alerts.push(alert);

  const grossMargin = calcMargin(derived.grossProfit, derived.netRevenue);
  if (grossMargin !== null && grossMargin < thresholds.minGrossMargin) {
    push({
      id: "gross_margin_low",
      severity: grossMargin < thresholds.minGrossMargin / 2 ? "critical" : "warning",
      metric: "grossMargin",
      message: `Gross margin ${pct(grossMargin)} below floor ${pct(thresholds.minGrossMargin)}`,
      value: grossMargin,
      threshold: thresholds.minGrossMargin,
    });
  }

  const contributionMargin = calcMargin(derived.contributionProfit, derived.netRevenue);
  if (contributionMargin !== null && contributionMargin < thresholds.minContributionMargin) {
    push({
      id: "contribution_margin_low",
      severity: "warning",
      metric: "contributionMargin",
      message: `Contribution margin ${pct(contributionMargin)} below floor ${pct(thresholds.minContributionMargin)}`,
      value: contributionMargin,
      threshold: thresholds.minContributionMargin,
    });
  }

  const operatingMargin = calcMargin(derived.operatingProfit, derived.netRevenue);
  if (operatingMargin !== null && operatingMargin < thresholds.minOperatingMargin) {
    push({
      id: "operating_margin_low",
      severity: operatingMargin < 0 ? "critical" : "warning",
      metric: "operatingMargin",
      message: `Operating margin ${pct(operatingMargin)} below floor ${pct(thresholds.minOperatingMargin)}`,
      value: operatingMargin,
      threshold: thresholds.minOperatingMargin,
    });
  }

  if (derived.ltvToCac !== null && derived.ltvToCac < thresholds.minLtvToCac) {
    push({
      id: "ltv_cac_low",
      severity: derived.ltvToCac < 1 ? "critical" : "warning",
      metric: "ltvToCac",
      message: `LTV:CAC ${derived.ltvToCac.toFixed(2)} below floor ${thresholds.minLtvToCac}`,
      value: derived.ltvToCac,
      threshold: thresholds.minLtvToCac,
    });
  }

  if (
    derived.cacPaybackPeriods !== null &&
    derived.cacPaybackPeriods > thresholds.maxCacPaybackPeriods
  ) {
    push({
      id: "cac_payback_slow",
      severity: "warning",
      metric: "cacPaybackPeriods",
      message: `CAC payback ${derived.cacPaybackPeriods.toFixed(1)} periods exceeds max ${thresholds.maxCacPaybackPeriods}`,
      value: derived.cacPaybackPeriods,
      threshold: thresholds.maxCacPaybackPeriods,
    });
  }

  if (derived.retentionRate !== null && derived.retentionRate < thresholds.minRetentionRate) {
    push({
      id: "retention_low",
      severity: "warning",
      metric: "retentionRate",
      message: `Retention ${pct(derived.retentionRate)} below floor ${pct(thresholds.minRetentionRate)}`,
      value: derived.retentionRate,
      threshold: thresholds.minRetentionRate,
    });
  }

  if (derived.churnRate !== null && derived.churnRate > thresholds.maxChurnRate) {
    push({
      id: "churn_high",
      severity: "critical",
      metric: "churnRate",
      message: `Churn ${pct(derived.churnRate)} above ceiling ${pct(thresholds.maxChurnRate)}`,
      value: derived.churnRate,
      threshold: thresholds.maxChurnRate,
    });
  }

  const refundRate = calcRefundRate(inputs.refunds, inputs.grossRevenue);
  if (refundRate !== null && refundRate > thresholds.maxRefundRate) {
    push({
      id: "refund_rate_high",
      severity: "warning",
      metric: "refundRate",
      message: `Refund rate ${pct(refundRate)} above ceiling ${pct(thresholds.maxRefundRate)}`,
      value: refundRate,
      threshold: thresholds.maxRefundRate,
    });
  }

  if (
    thresholds.minCashBalance !== null &&
    derived.cashBalance !== null &&
    derived.cashBalance < thresholds.minCashBalance
  ) {
    push({
      id: "cash_low",
      severity: "critical",
      metric: "cashBalance",
      message: `Cash ${derived.cashBalance} below floor ${thresholds.minCashBalance}`,
      value: derived.cashBalance,
      threshold: thresholds.minCashBalance,
    });
  }

  // Trend deterioration vs prior period — contribution & net revenue, not revenue alone
  if (prior) {
    const netChange = calcPeriodChange(derived.netRevenue, prior.derived.netRevenue);
    if (netChange !== null && netChange < thresholds.maxNetRevenueDecline) {
      push({
        id: "net_revenue_decline",
        severity: "warning",
        metric: "netRevenueChange",
        message: `Net revenue change ${pct(netChange)} worse than ${pct(thresholds.maxNetRevenueDecline)}`,
        value: netChange,
        threshold: thresholds.maxNetRevenueDecline,
      });
    }

    const contribChange = calcPeriodChange(
      derived.contributionProfit,
      prior.derived.contributionProfit,
    );
    if (contribChange !== null && contribChange < thresholds.maxContributionDecline) {
      push({
        id: "contribution_decline",
        severity: "critical",
        metric: "contributionProfitChange",
        message: `Contribution profit change ${pct(contribChange)} worse than ${pct(thresholds.maxContributionDecline)} — do not celebrate revenue alone`,
        value: contribChange,
        threshold: thresholds.maxContributionDecline,
      });
    }

    // Revenue up but contribution down → explicit anti-revenue-only alert
    const revUp =
      derived.netRevenue !== null &&
      prior.derived.netRevenue !== null &&
      derived.netRevenue > prior.derived.netRevenue;
    const contribDown =
      derived.contributionProfit !== null &&
      prior.derived.contributionProfit !== null &&
      derived.contributionProfit < prior.derived.contributionProfit;
    if (revUp && contribDown) {
      push({
        id: "revenue_up_contribution_down",
        severity: "critical",
        metric: "multiObjective",
        message:
          "Net revenue rose while contribution profit fell — do not optimize for revenue alone",
        value: null,
        threshold: null,
      });
    }
  }

  return alerts;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
