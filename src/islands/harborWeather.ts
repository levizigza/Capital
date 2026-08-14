/**
 * Harbor world reactivity — cashflow → sky mood + shop prices.
 */

import { netCashflow, ensureLedger, type VoyagerLedger } from "./voyagerLedger";
import type { IslandSaveV1 } from "./types";
import type { SkyMode } from "./world3d/ledgerlight";

export type HarborWeatherMood = "boom" | "fair" | "tight" | "storm";

export function harborCashflow(save: IslandSaveV1): number {
  return netCashflow(ensureLedger(save.voyagerLedger));
}

/** Mood from cashflow alone — used by board Pay Day without full save. */
export function moodFromCashflow(cf: number, hasteScar = false): HarborWeatherMood {
  if (hasteScar && cf < 20) return "storm";
  if (cf >= 40) return "boom";
  if (cf >= 15) return "fair";
  if (cf >= 0) return "tight";
  return "storm";
}

export function harborWeatherMood(save: IslandSaveV1): HarborWeatherMood {
  const hasteScar = (save.harborScars ?? []).some((s) => s.id.includes("haste") || s.id.includes("risk"));
  return moodFromCashflow(harborCashflow(save), hasteScar);
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
 * Soft price multiplier from cashflow — boom = slight markup, tight = small discount
 * so Harbor feels alive without pay-to-win (never below 0.85 or above 1.15).
 */
export function harborPriceMultiplier(save: IslandSaveV1): number {
  const mood = harborWeatherMood(save);
  switch (mood) {
    case "boom":
      return 1.1;
    case "fair":
      return 1;
    case "tight":
      return 0.92;
    case "storm":
      return 0.85;
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
      return "Sky’s a bit grey. Locals soften prices while cashflow recovers.";
    case "storm":
      return "Fog hugs the dock. Interest storms elsewhere — Harbor cuts prices to help.";
  }
}

/**
 * Soft Pay Day income mult from the SAME weather fiction as shops/sky.
 * Unifies orphan boom/recession multipliers (GAME_DESIGN_COMPLEXITY.md).
 * Mild — creates decisions without spreadsheet realism.
 */
export function paydayIncomeMultiplier(mood: HarborWeatherMood): number {
  switch (mood) {
    case "boom":
      return 1.1;
    case "fair":
      return 1;
    case "tight":
      return 0.95;
    case "storm":
      return 0.9;
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
