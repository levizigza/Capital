import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  biasDealsForStance,
  composePaydayMultiplier,
  resolveDay2WeatherChain,
  resolveOrganPaydayChain,
  resolveStanceDealChain,
} from "../systemInteractions";
import { day2WeatherLaw, harborWeatherMood } from "../harborWeather";
import { HARBOR_DEALS } from "../voyagerLedger";
import { createDefaultVoyagerLedger } from "../voyagerLedger";
import type { IslandSaveV1 } from "../types";
import { shouldOpenInteractionChainsPrototype } from "./InteractionChainsPrototype";

describe("System interaction matrix — multiplicative chains", () => {
  const matrix = readFileSync(join(__dirname, "../../../SYSTEM_INTERACTION_MATRIX.md"), "utf8");
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const proto = readFileSync(join(__dirname, "InteractionChainsPrototype.tsx"), "utf8");
  const islands = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");

  it("documents matrix tags and A→B→C→A priority", () => {
    expect(matrix).toMatch(/NO · \*\*CURRENT\*\*|Tags: \*\*NO\*\*/);
    expect(matrix).toMatch(/CURRENT/);
    expect(matrix).toMatch(/POTENTIAL/);
    expect(matrix).toMatch(/DANGEROUS/);
    expect(matrix).toMatch(/\bNO\b/);
    expect(matrix).toMatch(/Organ→PayDay→Weather→SoftBeat|Organ scar stains Pay Day/);
    expect(matrix).toMatch(/Stance → Deals|Stance biases deals/);
    expect(matrix).toMatch(/Day-2 → Weather|Day2→Weather/);
    expect(matrix).toMatch(/\?interact=1/);
  });

  it("chain 1: organ scar stains Pay Day under weather", () => {
    const coin = resolveOrganPaydayChain({ organ: "coin", cashflow: 20 });
    const spiral = resolveOrganPaydayChain({ organ: "spiral", cashflow: 20 });
    expect(coin.paydayMult).toBeGreaterThan(spiral.paydayMult);
    expect(coin.steps).toHaveLength(4);
    expect(coin.feedback.length).toBeGreaterThan(10);
    expect(composePaydayMultiplier({ weatherMood: "fair", organStain: "coin" })).toBe(1.08);
  });

  it("chain 2: stance biases deal order without new SKUs", () => {
    const deals = HARBOR_DEALS.filter((d) => d.kind === "asset") as typeof HARBOR_DEALS;
    const saver = biasDealsForStance(deals as never, { saver: 3, spender: 0, risk: 0 });
    expect(saver[0]?.name.toLowerCase()).toMatch(/jar|interest/);
    const chain = resolveStanceDealChain({
      stance: { saver: 2, spender: 0, risk: 0 },
      cashflow: 15,
      dealPicked: "asset_first",
    });
    expect(chain.cashflowDelta).toBeGreaterThan(0);
    expect(chain.strategy.toLowerCase()).toMatch(/deal|take/);
  });

  it("chain 3: day-2 echo overrides weather from organ", () => {
    expect(day2WeatherLaw("spiral")).toBe("storm");
    const chain = resolveDay2WeatherChain({ organ: "spiral", cashflow: 40 });
    expect(chain.weather).toBe("storm");
    expect(chain.steps[0]?.system).toMatch(/Day-2/i);

    const save: IslandSaveV1 = {
      version: "1",
      updatedAt: new Date().toISOString(),
      inventory: [],
      questStatus: {},
      completedMinigames: [],
      discovered: { npcs: [], items: [], areas: [], islands: [] },
      voyagerLedger: { ...createDefaultVoyagerLedger(), salaryIncome: 80, livingExpenses: 10 },
      harborScars: [
        {
          id: "credit_haste_plaque",
          islandId: "credit_kingdom",
          choiceId: "haste",
          label: "Haste fed the spiral",
          kind: "plaque",
          createdAt: new Date().toISOString(),
        },
      ],
      harborRitual: {
        lastDayKey: "2026-08-14",
        streak: 1,
        today: {
          rumorId: "scar_echo_credit_haste",
          echoSurpriseSeen: false,
        },
      },
    };
    expect(harborWeatherMood(save)).toBe("storm");
  });

  it("wires ?interact=1 prototype and live Pay Day composition", () => {
    expect(app).toMatch(/shouldOpenInteractionChainsPrototype/);
    expect(app).toMatch(/InteractionChainsPrototype/);
    expect(proto).toMatch(/interact-chain-organ/);
    expect(proto).toMatch(/interact-feedback/);
    expect(islands).toMatch(/composePaydayMultiplier/);
    expect(typeof shouldOpenInteractionChainsPrototype).toBe("function");
    expect(shouldOpenInteractionChainsPrototype()).toBe(false);
  });
});
