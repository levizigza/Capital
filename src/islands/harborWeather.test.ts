import { describe, expect, it } from "vitest";
import {
  harborPriceMultiplier,
  harborWeatherMood,
  paydayIncomeMultiplier,
  scaleHarborPrice,
  skyIntentFromCashflow,
} from "./harborWeather";
import { createDefaultVoyagerLedger } from "./voyagerLedger";
import type { IslandSaveV1 } from "./types";

function withLedger(salary: number, living: number): IslandSaveV1 {
  const ledger = createDefaultVoyagerLedger();
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    voyagerLedger: {
      ...ledger,
      salaryIncome: salary,
      livingExpenses: living,
    },
  };
}

describe("harborWeather", () => {
  it("maps cashflow to weather and prices", () => {
    expect(harborWeatherMood(withLedger(80, 10))).toBe("boom");
    expect(harborPriceMultiplier(withLedger(80, 10))).toBeGreaterThan(1);
    expect(harborWeatherMood(withLedger(5, 40))).toBe("storm");
    expect(scaleHarborPrice(100, withLedger(5, 40))).toBeLessThan(100);
    expect(skyIntentFromCashflow(-5)).toBe("night");
    expect(skyIntentFromCashflow(50)).toBe("day");
    expect(paydayIncomeMultiplier(harborWeatherMood(withLedger(80, 10)))).toBe(1.1);
  });
});
