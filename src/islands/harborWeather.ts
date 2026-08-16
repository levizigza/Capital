/**
 * Harbor world reactivity — cashflow → sky mood + shop prices.
 */

import { netCashflow, ensureLedger } from "./voyagerLedger";
import type { IslandSaveV1 } from "./types";
import type { SkyMode } from "./world3d/ledgerlight";

export type HarborWeatherMood = "boom" | "fair" | "tight" | "storm";

export function harborCashflow(save: IslandSaveV1): number {
  return netCashflow(ensureLedger(save.voyagerLedger));
}

export function harborWeatherMood(save: IslandSaveV1): HarborWeatherMood {
  const cf = harborCashflow(save);
  const hasteScar = (save.harborScars ?? []).some((s) => s.id.includes("haste") || s.id.includes("risk"));
  if (hasteScar && cf < 20) return "storm";
  if (cf >= 40) return "boom";
  if (cf >= 15) return "fair";
  if (cf >= 0) return "tight";
  return "storm";
}

/** Sky intent driven by ledger health (mixed with director elsewhere). */
export function skyIntentFromCashflow(cashflow: number, failPressure = 0): SkyMode | null {
  if (failPressure >= 2) return "day";
  if (cashflow >= 40) return "day";
  if (cashflow >= 15) return "sunset";
  if (cashflow >= 0) return "sunset";
  return "night";
}

/**
 * Soft price multiplier from cashflow.
 * Storm / tight mark up shops — interest weather costs, it does not subsidize.
 * Boom can still mark up slightly when flush.
 * @see docs/GAME_DESIGN_RISK_REWARD.md
 */
export function harborPriceMultiplier(save: IslandSaveV1): number {
  const mood = harborWeatherMood(save);
  switch (mood) {
    case "boom":
      return 1.08;
    case "fair":
      return 1;
    case "tight":
      return 1.06;
    case "storm":
      return 1.15;
  }
}

export function scaleHarborPrice(base: number, save: IslandSaveV1): number {
  return Math.max(1, Math.round(base * harborPriceMultiplier(save)));
}

export function weatherCoachLine(mood: HarborWeatherMood): string {
  switch (mood) {
    case "boom":
      return "Harbor lights feel bright — cashflow is strong. Shops charge a little more.";
    case "fair":
      return "Fair weather on the plaza. Prices are steady.";
    case "tight":
      return "Sky’s a bit grey. Interest pressure nudges prices up — rebuild cashflow.";
    case "storm":
      return "Fog hugs the dock. Interest weather marks up the plaza — earn or wait it out.";
  }
}

/** Fog density hint for 3D (near/far). */
export function weatherFogParams(mood: HarborWeatherMood): { near: number; far: number } {
  switch (mood) {
    case "boom":
      return { near: 40, far: 120 };
    case "fair":
      return { near: 28, far: 95 };
    case "tight":
      return { near: 18, far: 70 };
    case "storm":
      return { near: 8, far: 45 };
  }
}
