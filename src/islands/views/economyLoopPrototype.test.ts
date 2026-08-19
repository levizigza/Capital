import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createEconomyStocks,
  ECONOMY_DECISION_PAIRS,
  resolveEconomyDecision,
} from "../economyDynamics";
import { shouldOpenEconomyLoopPrototype } from "./EconomyLoopPrototype";

describe("Economy as dynamic system", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const proto = readFileSync(join(__dirname, "EconomyLoopPrototype.tsx"), "utf8");
  const doc = readFileSync(join(__dirname, "../../../GAME_DESIGN_ECONOMY.md"), "utf8");
  const dyn = readFileSync(join(__dirname, "../economyDynamics.ts"), "utf8");

  it("documents audit dimensions and decision chain", () => {
    expect(doc).toMatch(/sources/i);
    expect(doc).toMatch(/sinks/i);
    expect(doc).toMatch(/scarcity/i);
    expect(doc).toMatch(/opportunity cost/i);
    expect(doc).toMatch(/PLAYER DECISION/);
    expect(doc).toMatch(/MARKET RESPONSE/);
    expect(doc).toMatch(/OTHER ACTOR RESPONSE/);
    expect(doc).toMatch(/Infinite-growth/);
    expect(doc).toMatch(/Dead resources/);
    expect(doc).toMatch(/\?economy=1/);
    expect(doc).toMatch(/Do not increase realism/);
  });

  it("every decision returns opportunity cost + second-order chain", () => {
    const stocks = createEconomyStocks();
    for (const [a, b] of ECONOMY_DECISION_PAIRS) {
      for (const d of [a, b]) {
        const r = resolveEconomyDecision(d.id, stocks);
        expect(r.opportunityCost.length).toBeGreaterThan(8);
        expect(r.direct.label.length).toBeGreaterThan(8);
        expect(r.market.line.length).toBeGreaterThan(8);
        expect(r.actor.line.length).toBeGreaterThan(8);
        expect(r.next.line.length).toBeGreaterThan(8);
        expect(["opportunity", "risk"]).toContain(r.next.kind);
      }
    }
  });

  it("hold vs spend forks leave different futures (not identical markets)", () => {
    const stocks = createEconomyStocks();
    const hold = resolveEconomyDecision("hold_jar", stocks);
    const spend = resolveEconomyDecision("spend_treat", stocks);
    expect(hold.stocks.pouch).not.toBe(spend.stocks.pouch);
    expect(hold.actor.id).not.toBe(spend.actor.id);
    expect(hold.next.kind).not.toBe(spend.next.kind);
  });

  it("buy asset trades liquidity for cashflow engine", () => {
    const stocks = createEconomyStocks();
    const buy = resolveEconomyDecision("buy_asset", stocks);
    const keep = resolveEconomyDecision("keep_liquidity", stocks);
    expect(buy.stocks.cashflow).toBeGreaterThan(keep.stocks.cashflow);
    expect(buy.stocks.pouch).toBeLessThan(keep.stocks.pouch);
  });

  it("wires ?economy=1 prototype without XP chrome", () => {
    expect(app).toMatch(/shouldOpenEconomyLoopPrototype/);
    expect(app).toMatch(/EconomyLoopPrototype/);
    expect(app).toMatch(/showEconomy/);
    expect(proto).toMatch(/economy-consequence-chain/);
    expect(proto).toMatch(/economy-opportunity-cost/);
    expect(proto).not.toMatch(/gainXp|MasteryQuiz/);
    expect(proto).toMatch(/no XP/);
    expect(typeof shouldOpenEconomyLoopPrototype).toBe("function");
    expect(shouldOpenEconomyLoopPrototype()).toBe(false);
    expect(dyn).toMatch(/opportunityCost/);
  });
});
