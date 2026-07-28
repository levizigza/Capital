import type { ClientHealthSnapshot } from "./types";
import { computeErrorBudget } from "./errorBudget";
import { allKillSwitchStates } from "./flags";
import { getVitals } from "./vitals";
import { sessionIsErrorFree } from "./telemetry";

declare const __CAPITAL_BUILD_ID__: string | undefined;

export function getBuildId(): string {
  try {
    if (typeof __CAPITAL_BUILD_ID__ !== "undefined" && __CAPITAL_BUILD_ID__) {
      return __CAPITAL_BUILD_ID__;
    }
  } catch {
    /* ignore */
  }
  return (import.meta.env.VITE_BUILD_ID as string | undefined) ?? "dev";
}

export function getAppVersion(): string {
  return (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "0.0.0-dev";
}

/** Client-side readiness — mirrors future /healthz for API tiers. */
export function getClientHealth(): ClientHealthSnapshot {
  const budget = computeErrorBudget();
  const kills = allKillSwitchStates();
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  const swControlled =
    typeof navigator !== "undefined" &&
    !!navigator.serviceWorker?.controller;

  let status: ClientHealthSnapshot["status"] = "ok";
  if (!online || budget.policy === "incident") status = "degraded";
  if (budget.errorCount >= 5) status = "down";

  return {
    status,
    version: getAppVersion(),
    buildId: getBuildId(),
    online,
    swControlled,
    errorFreeSession: sessionIsErrorFree(),
    budgetBurnPct: budget.burnPct,
    vitals: getVitals(),
    killSwitches: kills,
    checkedAt: new Date().toISOString(),
  };
}

/** Expose for QA / Ops console: window.__CAPITAL_HEALTH__ */
export function exposeHealthGlobal(): void {
  try {
    (window as unknown as { __CAPITAL_HEALTH__?: () => ClientHealthSnapshot }).__CAPITAL_HEALTH__ =
      getClientHealth;
  } catch {
    /* ignore */
  }
}
