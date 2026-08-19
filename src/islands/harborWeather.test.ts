import { describe, expect, it } from "vitest";
import {
  harborPriceMultiplier,
  harborWeatherMood,
  scaleHarborPrice,
  skyIntentFromCashflow,
  feedbackLoopLine,
} from "./harborWeather";
import { createDefaultVoyagerLedger } from "./voyagerLedger";
import type { IslandSaveV1 } from "./types";

function withLedger(
  salary: number,
  living: number,
  scars: IslandSaveV1["harborScars"] = [],
): IslandSaveV1 {
  const ledger = createDefaultVoyagerLedger();
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    harborScars: scars,
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
  });

  it("names the haste→fog→prices feedback loop (#66)", () => {
    const looped = withLedger(5, 40, [
      {
        id: "credit_haste_plaque",
        label: "Haste",
        kind: "plaque",
        createdAt: "2026-08-01",
      },
    ]);
    expect(harborWeatherMood(looped)).toBe("storm");
    expect(feedbackLoopLine(looped)).toMatch(/Loop closed/);
    expect(feedbackLoopLine(withLedger(80, 10))).toBeNull();
  });

  it("plaza weather is CF-authoritative — macro recession phase does not override CF sky", () => {
    const healthy = withLedger(80, 10);
    const withMacro = {
      ...healthy,
      economyState: {
        phase: "recession" as const,
        turnsInPhase: 1,
        totalTurns: 99,
        phaseHistory: [],
      },
    };
    expect(harborWeatherMood(withMacro)).toBe(harborWeatherMood(healthy));
    expect(harborWeatherMood(withMacro)).toBe("boom");
  });
});
