/**
 * Compose a full economics snapshot from inputs — never fabricates missing values.
 */

import {
  calcArpu,
  calcCac,
  calcCacPaybackPeriods,
  calcContributionProfit,
  calcConversionRate,
  calcGrossProfit,
  calcLtv,
  calcLtvToCac,
  calcNetRevenue,
  calcOperatingProfit,
  calcVariableDeliveryCost,
  resolveChurnRate,
  resolveRetentionRate,
} from "./equations";
import { evaluateEconomicsAlerts } from "./thresholds";
import type {
  EconomicsDerived,
  EconomicsInputs,
  EconomicsNullReason,
  EconomicsPeriodId,
  EconomicsSnapshot,
  EconomicsThresholds,
} from "./types";
import { DEFAULT_ECONOMICS_THRESHOLDS } from "./types";

export function emptyEconomicsInputs(): EconomicsInputs {
  return {
    grossRevenue: null,
    refunds: null,
    paymentFees: null,
    aiApiVariableCost: null,
    hostingVariableCost: null,
    otherDeliveryCost: null,
    marketingSpend: null,
    fixedOperatingExpense: null,
    cashBalance: null,
    payingCustomers: null,
    newCustomers: null,
    acquisitionFunnelEntries: null,
    conversions: null,
    retentionRate: null,
    churnRate: null,
  };
}

function reason(
  field: keyof EconomicsDerived,
  message: string,
  value: number | null,
  reasons: EconomicsNullReason[],
): void {
  if (value === null) reasons.push({ field, reason: message });
}

export function computeEconomicsSnapshot(opts: {
  periodId: EconomicsPeriodId;
  inputs: EconomicsInputs;
  thresholds?: EconomicsThresholds;
  prior?: EconomicsSnapshot | null;
  recordedAt?: string;
}): EconomicsSnapshot {
  const inputs = opts.inputs;
  const nullReasons: EconomicsNullReason[] = [];

  const netRevenue = calcNetRevenue(inputs.grossRevenue, inputs.refunds);
  reason("netRevenue", "Requires grossRevenue and refunds", netRevenue, nullReasons);

  const variableDeliveryCost = calcVariableDeliveryCost(
    inputs.paymentFees,
    inputs.aiApiVariableCost,
    inputs.hostingVariableCost,
    inputs.otherDeliveryCost,
  );
  reason(
    "variableDeliveryCost",
    "Requires paymentFees, aiApiVariableCost, hostingVariableCost, otherDeliveryCost",
    variableDeliveryCost,
    nullReasons,
  );

  const grossProfit = calcGrossProfit(netRevenue, variableDeliveryCost);
  reason("grossProfit", "Requires netRevenue and variableDeliveryCost", grossProfit, nullReasons);

  const contributionProfit = calcContributionProfit(grossProfit, inputs.marketingSpend);
  reason(
    "contributionProfit",
    "Requires grossProfit and marketingSpend (acquisition expense)",
    contributionProfit,
    nullReasons,
  );

  const operatingProfit = calcOperatingProfit(
    contributionProfit,
    inputs.fixedOperatingExpense,
  );
  reason(
    "operatingProfit",
    "Requires contributionProfit and fixedOperatingExpense",
    operatingProfit,
    nullReasons,
  );

  const arpu = calcArpu(netRevenue, inputs.payingCustomers);
  reason("arpu", "Requires netRevenue and payingCustomers > 0", arpu, nullReasons);

  const conversionRate = calcConversionRate(
    inputs.conversions,
    inputs.acquisitionFunnelEntries,
  );
  reason(
    "conversionRate",
    "Requires conversions and acquisitionFunnelEntries > 0",
    conversionRate,
    nullReasons,
  );

  const retentionRate = resolveRetentionRate(inputs.retentionRate, inputs.churnRate);
  reason(
    "retentionRate",
    "Requires retentionRate or derivable churnRate",
    retentionRate,
    nullReasons,
  );

  const churnRate = resolveChurnRate(inputs.churnRate, inputs.retentionRate);
  reason(
    "churnRate",
    "Requires churnRate or derivable retentionRate",
    churnRate,
    nullReasons,
  );

  const cac = calcCac(inputs.marketingSpend, inputs.newCustomers);
  reason("cac", "Requires marketingSpend and newCustomers > 0", cac, nullReasons);

  const ltv = calcLtv(arpu, churnRate);
  reason("ltv", "Requires arpu and churnRate > 0 (churn=0 does not invent finite LTV)", ltv, nullReasons);

  const ltvToCac = calcLtvToCac(ltv, cac);
  reason("ltvToCac", "Requires ltv and cac > 0", ltvToCac, nullReasons);

  const cacPaybackPeriods = calcCacPaybackPeriods(
    cac,
    contributionProfit,
    inputs.payingCustomers,
  );
  reason(
    "cacPaybackPeriods",
    "Requires cac, contributionProfit, payingCustomers > 0, and positive contribution per customer",
    cacPaybackPeriods,
    nullReasons,
  );

  const cashBalance = inputs.cashBalance;
  if (cashBalance === null) {
    nullReasons.push({
      field: "cashBalance",
      reason: "cashBalance input not provided — not fabricated",
    });
  }

  const derived: EconomicsDerived = {
    netRevenue,
    variableDeliveryCost,
    grossProfit,
    contributionProfit,
    operatingProfit,
    arpu,
    conversionRate,
    retentionRate,
    churnRate,
    cac,
    ltv,
    ltvToCac,
    cacPaybackPeriods,
    cashBalance,
  };

  const thresholds = opts.thresholds ?? DEFAULT_ECONOMICS_THRESHOLDS;
  const alerts = evaluateEconomicsAlerts({
    inputs,
    derived,
    thresholds,
    prior: opts.prior ?? null,
  });

  return {
    periodId: opts.periodId,
    recordedAt: opts.recordedAt ?? new Date().toISOString(),
    inputs: { ...inputs },
    derived,
    nullReasons,
    alerts,
  };
}
