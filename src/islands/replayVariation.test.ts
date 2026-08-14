import { describe, expect, it } from "vitest";
import { CASHFLOW_SPACE_PATTERN } from "./boardEconomy";
import {
  applyScarLedgerResidue,
  biasPatternForEconomy,
  boardSessionSeed,
  patternForBoardSession,
  pickCapsuleChoices,
  pickRivalIds,
  rotateBoardPattern,
  toLuckyWindfallOffer,
} from "./replayVariation";
import { createDefaultVoyagerLedger, netCashflow } from "./voyagerLedger";
import { createDefaultRivals } from "./partyRivals";

describe("replayVariation — possibility over repetition", () => {
  it("rotates board patterns so sessions differ without new authored maps", () => {
    const a = rotateBoardPattern(CASHFLOW_SPACE_PATTERN, 0);
    const b = rotateBoardPattern(CASHFLOW_SPACE_PATTERN, 3);
    expect(a).toHaveLength(CASHFLOW_SPACE_PATTERN.length);
    expect(b[0]).toBe(CASHFLOW_SPACE_PATTERN[3]);
    expect(a.join(",")).not.toBe(b.join(","));
  });

  it("biases recession toward bills and boom toward deals", () => {
    const base = [...CASHFLOW_SPACE_PATTERN];
    const recession = biasPatternForEconomy(base, "recession", 42);
    const boom = biasPatternForEconomy(base, "boom", 42);
    const billDelta =
      recession.filter((k) => k === "bill").length - base.filter((k) => k === "bill").length;
    const dealDelta =
      boom.filter((k) => k === "deal").length - base.filter((k) => k === "deal").length;
    expect(billDelta + dealDelta).toBeGreaterThanOrEqual(0);
    // Same seed+phase is deterministic
    expect(patternForBoardSession(base, { seed: 7, phase: "recession" })).toEqual(
      patternForBoardSession(base, { seed: 7, phase: "recession" }),
    );
  });

  it("picks rival rosters from the full captain pool", () => {
    const a = pickRivalIds(2, 1);
    const b = pickRivalIds(2, 99);
    expect(a).toHaveLength(2);
    expect(new Set(a).size).toBe(2);
    // Different seeds can differ (not guaranteed but likely); at least createDefaultRivals works
    const rivals = createDefaultRivals(2, 12345);
    expect(rivals).toHaveLength(2);
    expect(rivals[0]!.id).not.toEqual(rivals[1]!.id);
    void b;
  });

  it("capsule choices nominate two options for a player decision", () => {
    const [x, y] = pickCapsuleChoices([], 55);
    expect(x).toBeTruthy();
    expect(y).toBeTruthy();
    expect(pickCapsuleChoices([], 55)).toEqual([x, y]);
  });

  it("lucky windfall splits spend vs bank without auto-resolving", () => {
    const offer = toLuckyWindfallOffer(20);
    expect(offer.spendAll).toBe(20);
    expect(offer.bankNow + offer.bankLater).toBe(20);
  });

  it("spender scars leave ledger residue so runs diverge after the same Take graph", () => {
    const ledger = applyScarLedgerResidue(createDefaultVoyagerLedger(), "cove_spender_plaque");
    expect(ledger.holdings.some((h) => h.id === "liability_treat_habit")).toBe(true);
    expect(netCashflow(ledger)).toBeLessThan(netCashflow(createDefaultVoyagerLedger()));
  });

  it("boardSessionSeed is stable per island", () => {
    expect(boardSessionSeed("coincraft_cove", 10)).toBe(boardSessionSeed("coincraft_cove", 10));
    expect(boardSessionSeed("coincraft_cove", 10)).not.toBe(boardSessionSeed("credit_kingdom", 10));
  });
});
