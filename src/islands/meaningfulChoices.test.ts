import { describe, expect, it } from "vitest";
import {
  acceptDealWithContext,
  applyPaydayWithChoices,
  armSoftBeatForPayDay,
  clearArmedSoftBeat,
  dealChoiceCounsel,
  effectiveNetCashflow,
  isVanityHarborPurchase,
  pauseFreedomStreakForVanity,
  settlePaydaysForDeal,
  softBeatPayDayMods,
  WIRED_DECISION_CARDS,
} from "./meaningfulChoices";
import {
  createDefaultVoyagerLedger,
  HARBOR_DEALS,
  netCashflow,
} from "./voyagerLedger";
import { createDefaultIslandSave } from "./save";
import { resolvePlayerSpace, type PartyIslandState } from "./partyBoard";

describe("meaningful choices — relationships", () => {
  it("documents wired decision cards", () => {
    expect(WIRED_DECISION_CARDS.length).toBeGreaterThanOrEqual(4);
    for (const card of WIRED_DECISION_CARDS) {
      expect(card.choice).toBeTruthy();
      expect(card.options.length).toBeGreaterThanOrEqual(2);
      expect(card.counterstrategy).toBeTruthy();
    }
  });

  it("Soft Beat arms next Pay Day with organ multiplier", () => {
    const save = armSoftBeatForPayDay(createDefaultIslandSave(), "lookout");
    expect(save.armedSoftBeat?.kind).toBe("lookout");
    expect(save.armedSoftBeat?.organId).toBe("coin");

    const base = createDefaultVoyagerLedger();
    const plain = applyPaydayWithChoices(base, { trackHarborEscape: false });
    const armed = applyPaydayWithChoices(base, {
      trackHarborEscape: false,
      armed: save.armedSoftBeat,
    });
    expect(armed.coins).toBeGreaterThan(plain.coins);
    expect(armed.buffLabel).toMatch(/Lookout/i);
    expect(clearArmedSoftBeat(save).armedSoftBeat).toBeUndefined();
  });

  it("umbrella Soft Beat floors a shortfall", () => {
    const ledger = {
      ...createDefaultVoyagerLedger(),
      salaryIncome: 10,
      livingExpenses: 40,
    };
    expect(netCashflow(ledger)).toBeLessThan(0);
    const mods = softBeatPayDayMods({
      kind: "umbrella",
      organId: "clock",
      armedAt: new Date().toISOString(),
    });
    expect(mods.floorZero).toBe(true);
    const r = applyPaydayWithChoices(ledger, {
      armed: { kind: "umbrella", organId: "clock", armedAt: "" },
    });
    expect(r.coins).toBe(0);
  });

  it("storm settle delays asset income one Pay Day — pass becomes viable", () => {
    expect(settlePaydaysForDeal("storm")).toBe(1);
    expect(settlePaydaysForDeal("fair")).toBe(0);

    const jar = HARBOR_DEALS.find((d) => d.id === "asset_savings_jar")!;
    const offer = { ...jar, purchaseCost: jar.purchaseCost ?? 20 };
    const bought = acceptDealWithContext(createDefaultVoyagerLedger(), offer, {
      mood: "storm",
    });
    expect(bought.settlingPaydays).toBe(1);
    expect(effectiveNetCashflow(bought.ledger)).toBe(netCashflow(createDefaultVoyagerLedger()));

    const afterOne = applyPaydayWithChoices(bought.ledger);
    expect(afterOne.ledger.holdings.find((h) => h.id === jar.id)?.settlingPaydays).toBeFalsy();
    expect(netCashflow(afterOne.ledger)).toBe(netCashflow(createDefaultVoyagerLedger()) + jar.monthlyAmount);
  });

  it("deal counsel prefers pass when storm + thin pouch", () => {
    const tip = dealChoiceCounsel({
      cashflow: 15,
      pouch: 25,
      cost: 20,
      monthly: 5,
      mood: "storm",
      hasEmergencyBuff: false,
    });
    expect(tip.lean).toBe("pass");
  });

  it("vanity Harbor spend pauses Freedom streak; capsules do not", () => {
    expect(isVanityHarborPurchase("companion")).toBe(true);
    expect(isVanityHarborPurchase("capsule")).toBe(false);

    const chasing = {
      ...createDefaultVoyagerLedger(),
      positivePaydayStreak: 2,
    };
    const paused = pauseFreedomStreakForVanity(chasing);
    expect(paused.positivePaydayStreak).toBe(0);
    expect(paused.recentEvents[0]?.text).toMatch(/paused/i);
  });

  it("Emergency Ledger absorbs Debt Trap instead of attaching liability", () => {
    const state: PartyIslandState = {
      position: 0,
      turnsPlayed: 0,
      stars: 0,
      items: [],
      buffs: { shielded: true },
      rivals: [],
    };
    const space = {
      index: 3,
      type: "liability" as const,
      label: "Debt Trap",
      icon: "📉",
    };
    const { next, payload } = resolvePlayerSpace(space, state, 100, createDefaultVoyagerLedger());
    expect(payload.message).toMatch(/absorbed/i);
    expect(payload.ledger).toBeUndefined();
    expect(next.buffs?.shielded).toBe(false);
  });
});
