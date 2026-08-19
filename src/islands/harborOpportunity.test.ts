import { describe, expect, it } from "vitest";
import { createDefaultVoyagerLedger, ensureLedger } from "./voyagerLedger";
import {
  buildHarborOpportunityContext,
  dealPassHint,
  moodFromCashflow,
  pickContextualAssetDeal,
  pickDealPair,
  resolveBoardAssetDeal,
  resolveBoardDealChoices,
  isPassRationalForDeal,
  isWaitRationalForDealPair,
} from "./harborOpportunity";

describe("harborOpportunity — Living Cashflow Commit", () => {
  it("picks smallest deal when liquidity is tight", () => {
    const ledger = ensureLedger({
      ...createDefaultVoyagerLedger(),
      holdings: [],
    });
    const ctx = buildHarborOpportunityContext(ledger, 22, "storm");
    const offer = pickContextualAssetDeal(ctx);
    expect(offer).not.toBeNull();
    expect(offer!.purchaseCost).toBeLessThanOrEqual(25);
  });

  it("pickDealPair returns commit A and B with optional wait hint", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 12, "storm");
    const pair = pickDealPair(ctx);
    expect(pair).not.toBeNull();
    expect(pair!.commitA.purchaseCost).toBeLessThanOrEqual(pair!.commitB.purchaseCost);
    expect(pair!.waitHint).toMatch(/buffer|storm|weather|bill/i);
  });

  it("resolveBoardDealChoices names Living Cashflow Commit with wait option", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 35, "fair");
    const { choices, message } = resolveBoardDealChoices(ctx);
    expect(message).toMatch(/Living Cashflow Commit|Deal on the table|Renewed deal/);
    expect(message).toMatch(/wait/i);
    if (choices && choices.commitA.id !== choices.commitB.id) {
      expect(message).toMatch(/vs/i);
    }
  });

  it("isWaitRationalForDealPair true in storm with low pouch", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 12, "storm");
    const pair = pickDealPair(ctx);
    expect(pair).not.toBeNull();
    expect(isWaitRationalForDealPair(ctx, pair!)).toBe(true);
  });

  it("can pick largest deal in boom weather with buffer and streak", () => {
    const ledger = ensureLedger({
      ...createDefaultVoyagerLedger(),
      holdings: [],
      positivePaydayStreak: 2,
    });
    const ctx = buildHarborOpportunityContext(ledger, 80, "boom");
    const pair = pickDealPair(ctx);
    expect(pair).not.toBeNull();
    expect(pair!.commitB.purchaseCost).toBeGreaterThanOrEqual(40);
  });

  it("is deterministic for the same ledger + pouch + mood", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 35, "fair");
    const a = pickContextualAssetDeal(ctx);
    const b = pickContextualAssetDeal(ctx);
    expect(a?.id).toBe(b?.id);
    expect(a?.purchaseCost).toBe(b?.purchaseCost);
  });

  it("dealPassHint encourages pass when coins are short", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 10, "fair");
    const { offer } = resolveBoardAssetDeal(ctx);
    expect(dealPassHint(ctx, offer)).toMatch(/buffer|earn/i);
  });

  it("dealPassHint names tight weather when pass is rational", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 50, "tight");
    const { offer } = resolveBoardAssetDeal(ctx);
    expect(dealPassHint(ctx, offer)).toMatch(/tight weather|next bill/i);
  });

  it("resolveBoardAssetDeal weaves pass hint into message when relevant", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const ctx = buildHarborOpportunityContext(ledger, 12, "storm");
    const { message } = resolveBoardAssetDeal(ctx);
    expect(message).toMatch(/Deal on the table|Renewed deal/);
    if (message.includes("Pass")) {
      expect(message).toMatch(/buffer|weather|bill/i);
    }
  });

  it("moodFromCashflow maps CF bands to weather moods", () => {
    expect(moodFromCashflow(50)).toBe("boom");
    expect(moodFromCashflow(20)).toBe("fair");
    expect(moodFromCashflow(5)).toBe("tight");
    expect(moodFromCashflow(-5)).toBe("storm");
  });

  it("deal dominance — Pass rational in storm; Accept viable in boom with buffer", () => {
    const ledger = ensureLedger(createDefaultVoyagerLedger());
    const stormCtx = buildHarborOpportunityContext(ledger, 12, "storm");
    const { offer: stormOffer } = resolveBoardAssetDeal(stormCtx);
    expect(isPassRationalForDeal(stormCtx, stormOffer)).toBe(true);

    const boomLedger = ensureLedger({
      ...createDefaultVoyagerLedger(),
      positivePaydayStreak: 2,
    });
    const boomCtx = buildHarborOpportunityContext(boomLedger, 80, "boom");
    const boomPair = pickDealPair(boomCtx);
    expect(boomPair).not.toBeNull();
    expect(boomPair!.commitB.purchaseCost).toBeGreaterThanOrEqual(40);
    expect(boomCtx.pouchCoins).toBeGreaterThanOrEqual(boomPair!.commitB.purchaseCost);
  });
});
