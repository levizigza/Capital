/**
 * Pure financial equations for Capital business economics.
 * Each function is independently unit-tested. No fabricated inputs.
 */

import type { Money } from "./types";

function finite(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Net Revenue = Gross Revenue − Refunds */
export function calcNetRevenue(
  grossRevenue: Money | null,
  refunds: Money | null,
): Money | null {
  if (!finite(grossRevenue) || !finite(refunds)) return null;
  return grossRevenue - refunds;
}

/**
 * Variable Delivery Cost =
 *   Payment Fees + AI/API Variable Cost + Hosting Variable Cost + Other Delivery Cost
 */
export function calcVariableDeliveryCost(
  paymentFees: Money | null,
  aiApiVariableCost: Money | null,
  hostingVariableCost: Money | null,
  otherDeliveryCost: Money | null,
): Money | null {
  if (
    !finite(paymentFees) ||
    !finite(aiApiVariableCost) ||
    !finite(hostingVariableCost) ||
    !finite(otherDeliveryCost)
  ) {
    return null;
  }
  return paymentFees + aiApiVariableCost + hostingVariableCost + otherDeliveryCost;
}

/** Gross Profit = Net Revenue − Variable Delivery Cost */
export function calcGrossProfit(
  netRevenue: Money | null,
  variableDeliveryCost: Money | null,
): Money | null {
  if (!finite(netRevenue) || !finite(variableDeliveryCost)) return null;
  return netRevenue - variableDeliveryCost;
}

/** Contribution Profit = Gross Profit − Acquisition Expense (marketing spend) */
export function calcContributionProfit(
  grossProfit: Money | null,
  acquisitionExpense: Money | null,
): Money | null {
  if (!finite(grossProfit) || !finite(acquisitionExpense)) return null;
  return grossProfit - acquisitionExpense;
}

/** Operating Profit = Contribution Profit − Fixed Operating Expense */
export function calcOperatingProfit(
  contributionProfit: Money | null,
  fixedOperatingExpense: Money | null,
): Money | null {
  if (!finite(contributionProfit) || !finite(fixedOperatingExpense)) return null;
  return contributionProfit - fixedOperatingExpense;
}

/** ARPU = Net Revenue / Paying Customers */
export function calcArpu(
  netRevenue: Money | null,
  payingCustomers: number | null,
): Money | null {
  if (!finite(netRevenue) || !finite(payingCustomers) || payingCustomers <= 0) return null;
  return netRevenue / payingCustomers;
}

/** Conversion rate = Conversions / Funnel entries */
export function calcConversionRate(
  conversions: number | null,
  acquisitionFunnelEntries: number | null,
): number | null {
  if (
    !finite(conversions) ||
    !finite(acquisitionFunnelEntries) ||
    acquisitionFunnelEntries <= 0
  ) {
    return null;
  }
  return conversions / acquisitionFunnelEntries;
}

/** CAC = Marketing Spend / New Customers */
export function calcCac(
  marketingSpend: Money | null,
  newCustomers: number | null,
): Money | null {
  if (!finite(marketingSpend) || !finite(newCustomers) || newCustomers <= 0) return null;
  return marketingSpend / newCustomers;
}

/**
 * Churn from retention when churn not supplied: churn = 1 − retention.
 * Returns null if retention missing or out of [0, 1].
 */
export function calcChurnFromRetention(retentionRate: number | null): number | null {
  if (!finite(retentionRate) || retentionRate < 0 || retentionRate > 1) return null;
  return 1 - retentionRate;
}

/**
 * Resolve churn: prefer explicit churn; else derive from retention.
 */
export function resolveChurnRate(
  churnRate: number | null,
  retentionRate: number | null,
): number | null {
  if (finite(churnRate)) {
    if (churnRate < 0 || churnRate > 1) return null;
    return churnRate;
  }
  return calcChurnFromRetention(retentionRate);
}

/**
 * Resolve retention: prefer explicit retention; else 1 − churn when churn known.
 */
export function resolveRetentionRate(
  retentionRate: number | null,
  churnRate: number | null,
): number | null {
  if (finite(retentionRate)) {
    if (retentionRate < 0 || retentionRate > 1) return null;
    return retentionRate;
  }
  if (finite(churnRate) && churnRate >= 0 && churnRate <= 1) return 1 - churnRate;
  return null;
}

/**
 * LTV = ARPU / churnRate (classic perpetual subscription approximation).
 * Does not invent a finite LTV when churn is 0.
 */
export function calcLtv(arpu: Money | null, churnRate: number | null): Money | null {
  if (!finite(arpu) || !finite(churnRate) || churnRate <= 0) return null;
  return arpu / churnRate;
}

/** LTV:CAC */
export function calcLtvToCac(ltv: Money | null, cac: Money | null): number | null {
  if (!finite(ltv) || !finite(cac) || cac <= 0) return null;
  return ltv / cac;
}

/**
 * CAC payback periods =
 *   CAC / (Contribution Profit / Paying Customers)
 * Null if contribution per customer ≤ 0 (no fabricated “infinite” payback).
 */
export function calcCacPaybackPeriods(
  cac: Money | null,
  contributionProfit: Money | null,
  payingCustomers: number | null,
): number | null {
  if (!finite(cac) || !finite(contributionProfit) || !finite(payingCustomers)) return null;
  if (payingCustomers <= 0) return null;
  const perCustomer = contributionProfit / payingCustomers;
  if (perCustomer <= 0) return null;
  return cac / perCustomer;
}

/** Margin = part / base (null if base ≤ 0 or inputs missing) */
export function calcMargin(part: Money | null, base: Money | null): number | null {
  if (!finite(part) || !finite(base) || base <= 0) return null;
  return part / base;
}

/** Refund rate = refunds / grossRevenue */
export function calcRefundRate(
  refunds: Money | null,
  grossRevenue: Money | null,
): number | null {
  if (!finite(refunds) || !finite(grossRevenue) || grossRevenue <= 0) return null;
  return refunds / grossRevenue;
}

/** Period-over-period change fraction: (current - prior) / |prior| */
export function calcPeriodChange(
  current: Money | null,
  prior: Money | null,
): number | null {
  if (!finite(current) || !finite(prior) || prior === 0) return null;
  return (current - prior) / Math.abs(prior);
}
