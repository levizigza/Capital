/**
 * Pure impact math for demand-down scenarios.
 * Null inputs → null outputs (UNKNOWN). Never invent.
 */

import type {
  ScenarioImpact,
  StressBaselineInputs,
  StressScenarioId,
} from "./types";
import { DEMAND_MULTIPLIER, STRESS_SCENARIOS } from "./types";

function isNum(v: number | null | undefined): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function mul(a: number | null, m: number): number | null {
  return isNum(a) ? a * m : null;
}

function round(v: number | null, d = 2): number | null {
  if (!isNum(v)) return null;
  const p = 10 ** d;
  return Math.round(v * p) / p;
}

/**
 * Scale demand-sensitive lines; fixed costs stay flat.
 * Retention softens slightly under deeper demand shocks (disclosed model assumption).
 */
export function computeScenarioImpact(
  baseline: StressBaselineInputs,
  scenario: StressScenarioId,
): ScenarioImpact {
  const m = DEMAND_MULTIPLIER[scenario];
  const notes: string[] = [];

  const gross = mul(baseline.gross_revenue, m);
  const refunds = mul(baseline.refunds, m);
  let netRevenue: number | null = null;
  if (isNum(gross) && isNum(refunds)) netRevenue = gross - refunds;
  else if (isNum(gross) && baseline.refunds == null) netRevenue = gross;
  else if (!isNum(baseline.gross_revenue)) {
    notes.push("gross_revenue UNKNOWN — revenue impact incomplete");
  }

  const fees = mul(baseline.payment_fees, m);
  const ai = mul(baseline.ai_api_expense, m);
  const hosting = mul(baseline.hosting_expense, m);
  const otherVar = mul(baseline.other_variable_delivery, m);
  const marketing = mul(baseline.marketing_spend, m);
  const fixed = baseline.fixed_costs;

  const varParts = [fees, ai, hosting, otherVar];
  const knownVars = varParts.filter(isNum);
  const variableDelivery =
    knownVars.length === 0
      ? null
      : knownVars.reduce((a, b) => a + b, 0);
  if (knownVars.length > 0 && knownVars.length < varParts.length) {
    notes.push("variable delivery incomplete — some cost lines UNKNOWN");
  }

  let grossProfit: number | null = null;
  if (isNum(netRevenue) && isNum(variableDelivery)) {
    grossProfit = netRevenue - variableDelivery;
  }

  let contribution: number | null = null;
  if (isNum(netRevenue)) {
    const contribVars = [variableDelivery, marketing].filter(isNum);
    if (contribVars.length === 0) {
      contribution = null;
    } else {
      contribution = netRevenue - contribVars.reduce((a, b) => a + b, 0);
      if (!isNum(variableDelivery) || !isNum(marketing)) {
        notes.push("contribution uses available variable lines only — incomplete inputs");
      }
    }
  }

  const operating =
    isNum(contribution) && isNum(fixed) ? contribution - fixed : null;

  let cash: number | null = null;
  if (isNum(baseline.cash) && isNum(operating)) {
    cash = baseline.cash + operating;
  } else if (isNum(baseline.cash)) {
    cash = baseline.cash;
    notes.push("cash shown without P&L apply — operating profit UNKNOWN");
  }

  let runway: number | null = null;
  if (isNum(cash) && isNum(operating) && operating < 0) {
    runway = round(cash / Math.abs(operating), 2);
  } else if (isNum(operating) && operating >= 0) {
    notes.push("runway n/a while operating profit ≥ 0");
  }

  let retention = baseline.retention_rate;
  if (isNum(retention) && scenario !== "BASELINE") {
    const soft: Record<Exclude<StressScenarioId, "BASELINE">, number> = {
      DEMAND_DOWN_20: 0.98,
      DEMAND_DOWN_40: 0.95,
      DEMAND_DOWN_60: 0.9,
    };
    retention = round(Math.max(0, retention * soft[scenario]), 4);
    notes.push(
      `customer_retention stress-adjusted by model factor for ${scenario} (not a measured fact)`,
    );
  }

  const newCust = mul(baseline.new_customers, m);
  let cac: number | null = null;
  if (isNum(marketing) && isNum(newCust) && newCust > 0) {
    cac = round(marketing / newCust, 2);
  } else if (isNum(baseline.cac)) {
    cac = baseline.cac;
    notes.push("CAC using baseline override — new_customers or marketing incomplete");
  }

  let payback: number | null = null;
  const customers = mul(baseline.customers, m);
  if (
    isNum(cac) &&
    isNum(contribution) &&
    isNum(customers) &&
    customers > 0 &&
    contribution > 0
  ) {
    payback = round(cac / (contribution / customers), 2);
  } else if (isNum(cac)) {
    notes.push("payback UNKNOWN without positive contribution per customer");
  }

  return {
    scenario,
    demand_multiplier: m,
    revenue: round(netRevenue),
    gross_profit: round(grossProfit),
    contribution_profit: round(contribution),
    cash: round(cash),
    runway_months: runway,
    ai_api_expense: round(ai),
    marketing: round(marketing),
    fixed_costs: round(isNum(fixed) ? fixed : null),
    customer_retention: retention,
    cac,
    payback_months: payback,
    operating_profit: round(operating),
    notes,
  };
}

export function computeAllImpacts(baseline: StressBaselineInputs): ScenarioImpact[] {
  return STRESS_SCENARIOS.map((s) => computeScenarioImpact(baseline, s));
}
