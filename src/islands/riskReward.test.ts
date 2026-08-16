import { describe, expect, it } from "vitest";
import { createDefaultIslandSave } from "./save";
import { createDefaultVoyagerLedger, ensureLedger, netCashflow } from "./voyagerLedger";
import {
  TAKE_LIABILITY_BY_SCAR,
  applyScarLedgerResidue,
  applySoftBeatPaydown,
  bankInterestCoins,
  resolveLiabilityTrapChoice,
  softBeatRecoveryOffer,
  toLiabilityTrapOffer,
} from "./riskReward";
import { harborPriceMultiplier, harborWeatherMood } from "./harborWeather";
import type { IslandSaveV1 } from "./types";

function withLedger(salary: number, living: number, scars: IslandSaveV1["harborScars"] = []): IslandSaveV1 {
  const ledger = createDefaultVoyagerLedger();
  return {
    ...createDefaultIslandSave(),
    harborScars: scars,
    voyagerLedger: {
      ...ledger,
      salaryIncome: salary,
      livingExpenses: living,
    },
  };
}

describe("riskReward relationships", () => {
  it("spender/haste scars write monthly exposure; saver scars do not", () => {
    const spend = applyScarLedgerResidue(createDefaultVoyagerLedger(), "cove_spender_plaque");
    expect(spend.holdings.some((h) => h.id === "liability_treat_habit")).toBe(true);
    expect(netCashflow(spend)).toBe(netCashflow(createDefaultVoyagerLedger()) - 5);

    const save = applyScarLedgerResidue(createDefaultVoyagerLedger(), "cove_saver_plaque");
    expect(save.holdings).toHaveLength(0);

    const haste = applyScarLedgerResidue(createDefaultVoyagerLedger(), "credit_haste_plaque");
    expect(haste.holdings[0]?.id).toBe(TAKE_LIABILITY_BY_SCAR.credit_haste_plaque.id);
  });

  it("scar residue is idempotent", () => {
    const once = applyScarLedgerResidue(createDefaultVoyagerLedger(), "pp_spender_plaque");
    const twice = applyScarLedgerResidue(once, "pp_spender_plaque");
    expect(twice.holdings.filter((h) => h.id === "liability_glitter_drip")).toHaveLength(1);
  });

  it("liability trap borrow raises cash now and −$/mo; buyout and walk refuse the holding", () => {
    const trap = toLiabilityTrapOffer({
      id: "liability_snack_tab",
      name: "Snack Tab",
      kind: "liability",
      monthlyAmount: 8,
      icon: "🍬",
    });
    const borrow = resolveLiabilityTrapChoice(createDefaultVoyagerLedger(), trap, "borrow", 0);
    expect(borrow.ok).toBe(true);
    expect(borrow.coins).toBe(16);
    expect(borrow.ledger.holdings.some((h) => h.id === "liability_snack_tab")).toBe(true);

    const buyout = resolveLiabilityTrapChoice(createDefaultVoyagerLedger(), trap, "buyout", 100);
    expect(buyout.ok).toBe(true);
    expect(buyout.coins).toBe(-trap.buyoutCost);
    expect(buyout.ledger.holdings).toHaveLength(0);

    const walk = resolveLiabilityTrapChoice(createDefaultVoyagerLedger(), trap, "walk", 100);
    expect(walk.ok).toBe(true);
    expect(walk.coins).toBe(-8);
    expect(walk.ledger.holdings).toHaveLength(0);
  });

  it("Soft Beat paydown clears liability but leaves scars for the caller", () => {
    let save = createDefaultIslandSave();
    save = {
      ...save,
      harborScars: [
        {
          id: "credit_haste_plaque",
          islandId: "credit_kingdom",
          label: "Haste fed the spiral",
          kind: "plaza_prop",
          createdAt: new Date().toISOString(),
        },
      ],
      voyagerLedger: applyScarLedgerResidue(save.voyagerLedger, "credit_haste_plaque"),
    };
    const offer = softBeatRecoveryOffer(save, "battlement");
    expect(offer?.holdingId).toBe("liability_haste_interest");
    const paid = applySoftBeatPaydown(save, offer!.holdingId, 200);
    expect(paid.ok).toBe(true);
    expect(ensureLedger(paid.save.voyagerLedger).holdings).toHaveLength(0);
    expect(paid.save.harborScars?.some((s) => s.id === "credit_haste_plaque")).toBe(true);
  });

  it("Island Bank interest requires assets on the ledger", () => {
    expect(bankInterestCoins(createDefaultVoyagerLedger()).coins).toBe(0);
    const withAsset = applyScarLedgerResidue(createDefaultVoyagerLedger(), "cove_spender_plaque");
    // spender adds liability — still no assets
    expect(bankInterestCoins(withAsset).coins).toBe(0);
    const rich = {
      ...createDefaultVoyagerLedger(),
      holdings: [
        {
          id: "asset_savings_jar",
          name: "Interest Jar",
          kind: "asset" as const,
          monthlyAmount: 5,
          icon: "🫙",
          purchaseCost: 20,
        },
      ],
    };
    expect(bankInterestCoins(rich).coins).toBeGreaterThan(0);
  });

  it("storm marks up Harbor prices instead of subsidizing shops", () => {
    const storm = withLedger(5, 40);
    expect(harborWeatherMood(storm)).toBe("storm");
    expect(harborPriceMultiplier(storm)).toBeGreaterThan(1);
    const boom = withLedger(80, 10);
    expect(harborWeatherMood(boom)).toBe("boom");
    expect(harborPriceMultiplier(boom)).toBeGreaterThan(1);
  });
});
