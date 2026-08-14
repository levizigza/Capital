/**
 * Capital business economics — types.
 * No fabricated accounting: absent inputs yield null derived fields.
 */

/** ISO calendar day or period key (YYYY-MM or YYYY-MM-DD). */
export type EconomicsPeriodId = string;

/** Currency amounts in major units (e.g. USD). Never invent defaults. */
export type Money = number;

export type EconomicsInputs = {
  /** Gross bookings / charged revenue before refunds */
  grossRevenue: Money | null;
  refunds: Money | null;
  /** Processor / platform fees on payments */
  paymentFees: Money | null;
  /** LLM/API variable delivery cost */
  aiApiVariableCost: Money | null;
  /** Hosting / bandwidth / CDN variable cost */
  hostingVariableCost: Money | null;
  /** Other COGS-like delivery (support tools metered, etc.) */
  otherDeliveryCost: Money | null;
  /** Acquisition expense for the period (paid marketing) */
  marketingSpend: Money | null;
  fixedOperatingExpense: Money | null;
  /** Ending cash (or period cash balance) */
  cashBalance: Money | null;
  /** Paying (or revenue-generating) customers in period — for ARPU */
  payingCustomers: number | null;
  /** Newly acquired customers in period — for CAC */
  newCustomers: number | null;
  /** Visitors or trials that could convert — for conversion */
  acquisitionFunnelEntries: number | null;
  /** Conversions (purchases / activations) in period */
  conversions: number | null;
  /**
   * Retention rate 0–1 for the cohort/period definition you choose.
   * Engine does not invent this from gameplay analytics.
   */
  retentionRate: number | null;
  /**
   * Churn rate 0–1. If null and retentionRate set, may derive as 1 - retention.
   */
  churnRate: number | null;
};

export type EconomicsDerived = {
  netRevenue: Money | null;
  variableDeliveryCost: Money | null;
  grossProfit: Money | null;
  contributionProfit: Money | null;
  operatingProfit: Money | null;
  /** Net revenue / paying customers */
  arpu: Money | null;
  /** conversions / acquisitionFunnelEntries */
  conversionRate: number | null;
  retentionRate: number | null;
  churnRate: number | null;
  /** marketingSpend / newCustomers */
  cac: Money | null;
  /**
   * Simple subscription-style LTV = ARPU / churnRate when churn > 0.
   * Null if churn unknown or zero (infinite not fabricated as a number).
   */
  ltv: Money | null;
  /** LTV / CAC when both positive */
  ltvToCac: number | null;
  /**
   * Periods to recover CAC from contribution profit per paying customer.
   * contributionPerCustomer = contributionProfit / payingCustomers
   * payback = CAC / contributionPerCustomer
   */
  cacPaybackPeriods: number | null;
  cashBalance: Money | null;
};

export type EconomicsNullReason = {
  field: keyof EconomicsDerived;
  reason: string;
};

export type EconomicsSnapshot = {
  periodId: EconomicsPeriodId;
  recordedAt: string;
  inputs: EconomicsInputs;
  derived: EconomicsDerived;
  nullReasons: EconomicsNullReason[];
  /** Multi-objective health — not revenue-only */
  alerts: EconomicsAlert[];
};

export type EconomicsAlertSeverity = "info" | "warning" | "critical";

export type EconomicsAlert = {
  id: string;
  severity: EconomicsAlertSeverity;
  metric: string;
  message: string;
  /** Observed value when known */
  value: number | null;
  threshold: number | null;
};

export type EconomicsThresholds = {
  /** Contribution margin = contributionProfit / netRevenue; alert if below */
  minContributionMargin: number;
  /** Operating margin = operatingProfit / netRevenue */
  minOperatingMargin: number;
  /** Gross margin = grossProfit / netRevenue */
  minGrossMargin: number;
  /** LTV:CAC minimum */
  minLtvToCac: number;
  /** Max CAC payback periods */
  maxCacPaybackPeriods: number;
  /** Min retention rate 0–1 */
  minRetentionRate: number;
  /** Max churn rate 0–1 */
  maxChurnRate: number;
  /** Alert if period net revenue MoM change below this (fraction, e.g. -0.2) */
  maxNetRevenueDecline: number;
  /** Alert if contribution profit MoM change below this */
  maxContributionDecline: number;
  /** Alert if cash below this absolute floor (null = skip) */
  minCashBalance: Money | null;
  /** Alert if refunds / grossRevenue above this */
  maxRefundRate: number;
};

/** Default thresholds — policy knobs, not accounting data. */
export const DEFAULT_ECONOMICS_THRESHOLDS: EconomicsThresholds = {
  minContributionMargin: 0.2,
  minOperatingMargin: 0,
  minGrossMargin: 0.4,
  minLtvToCac: 3,
  maxCacPaybackPeriods: 12,
  minRetentionRate: 0.2,
  maxChurnRate: 0.8,
  maxNetRevenueDecline: -0.2,
  maxContributionDecline: -0.2,
  minCashBalance: null,
  maxRefundRate: 0.15,
};
