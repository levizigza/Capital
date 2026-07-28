/**
 * Error budget — Google SRE: reliability is a product feature with a budget.
 * Session-local until remote SLI pipeline exists; same math scales upward.
 */

import { SRE_DEFAULTS } from "./types";
import { getSessionErrorCount, sessionIsErrorFree } from "./telemetry";

export type ErrorBudgetSnapshot = {
  /** Fraction of budget remaining (1 = full, 0 = exhausted). */
  remaining: number;
  /** Percent of budget burned this session (0–100+). */
  burnPct: number;
  /** Policy hint for operators / future release gates. */
  policy: "ship_freely" | "caution" | "freeze_risky" | "incident";
  errorFree: boolean;
  errorCount: number;
  /** Target SLO this budget maps to. */
  slo: number;
};

/**
 * Map session error count onto a simple budget.
 * 1 critical/error event ≈ burning through the 1% failure allowance for this window.
 */
export function computeErrorBudget(): ErrorBudgetSnapshot {
  const errors = getSessionErrorCount();
  // First error burns half the session budget; more errors escalate policy.
  const remaining = sessionIsErrorFree() ? 1 : Math.max(0, 1 - errors * 0.5);
  const burnPct = Math.round((1 - remaining) * 100);

  let policy: ErrorBudgetSnapshot["policy"] = "ship_freely";
  if (burnPct >= 100 || errors >= 3) policy = "incident";
  else if (burnPct >= 50 || errors >= 2) policy = "freeze_risky";
  else if (burnPct > 0 || errors >= 1) policy = "caution";

  return {
    remaining,
    burnPct,
    policy,
    errorFree: sessionIsErrorFree(),
    errorCount: errors,
    slo: SRE_DEFAULTS.errorFreeSessionSlo,
  };
}

export function shouldDegradeForBudget(): boolean {
  const b = computeErrorBudget();
  return b.policy === "freeze_risky" || b.policy === "incident";
}
