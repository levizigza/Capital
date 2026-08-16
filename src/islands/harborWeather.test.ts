import { describe, expect, it } from "vitest";
import {
  harborPriceMultiplier,
  harborWeatherMood,
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
  it("maps cashflow to weather; storm/tight cost more at shops", () => {
    expect(harborWeatherMood(withLedger(80, 10))).toBe("boom");
    expect(harborPriceMultiplier(withLedger(80, 10))).toBeGreaterThan(1);
    expect(harborWeatherMood(withLedger(5, 40))).toBe("storm");
    expect(scaleHarborPrice(100, withLedger(5, 40))).toBeGreaterThan(100);
    expect(harborWeatherMood(withLedger(40, 20))).toBe("fair");
    expect(harborPriceMultiplier(withLedger(40, 20))).toBe(1);
    expect(skyIntentFromCashflow(-5)).toBe("night");
    expect(skyIntentFromCashflow(50)).toBe("day");
  });
});
