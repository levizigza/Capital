/**
 * Pillar 8 — Cove Take + carpet price + first seal balance sheet.
 * Guards the early-loop earn/spend math so Freedom / polish don't stall or trivialise.
 */
import { describe, expect, it } from "vitest";
import { BOAT_TIERS } from "./boats";
import {
  CARPET_POLISH_MARKUP,
  PLAZA_PASS_PRICE,
  nextPurchasableCarpet,
} from "./harborShop";
import { computeMinigameReward } from "./partyBoard";
import { createDefaultIslandSave } from "./save";
import {
  HARBOR_DEALS,
  HARBOR_ESCAPE_STREAK,
  HARBOR_ESCAPE_TARGET,
  applyPayday,
  createDefaultVoyagerLedger,
  freedomPlazaChip,
  netCashflow,
} from "./voyagerLedger";
import coincraft from "./content/coincraft-cove.islands.json";

const COVE = coincraft.islands[0]!;

function coveMainQuestCoins(): number {
  return (COVE.quests ?? [])
    .filter((q) => (q.track ?? "main") === "main")
    .reduce((sum, q) => sum + (q.rewards?.coins ?? 0), 0);
}

function coinSortThresholds(): { explorer: number; apprentice: number; strategist: number } {
  const obj = COVE.quests
    ?.flatMap((q) => q.objectives ?? [])
    .find((o) => o.type === "completeMinigame" && o.minigameId === "mg_coin_sort");
  const t = obj && "scoreThreshold" in obj ? obj.scoreThreshold : undefined;
  expect(t && typeof t === "object").toBe(true);
  return t as { explorer: number; apprentice: number; strategist: number };
}

describe("Pillar 8 balance sheet — Cove → carpet → first seal", () => {
  it("Cove main-quest earn clears first carpet polish without auto-skipping Fortune", () => {
    const questCoins = coveMainQuestCoins();
    expect(questCoins).toBe(80); // First Coins 30 + Save or Spend 50 (side digressions excluded)

    const firstClear = computeMinigameReward(true, 35, true, false);
    // Typical apprentice clear: ~33 coins (15 + floor(35/4) + 10 first-clear)
    expect(firstClear.coins).toBeGreaterThanOrEqual(25);
    expect(firstClear.coins).toBeLessThanOrEqual(45);

    const postCove = questCoins + firstClear.coins;
    const coinCarpet = BOAT_TIERS.find((t) => t.id === "coin_carpet")!;
    const fortune = BOAT_TIERS.find((t) => t.id === "fortune_flyer")!;
    const polishToCoin = Math.max(50, Math.round(coinCarpet.minCoins * CARPET_POLISH_MARKUP));

    // Soft gate: polish affordable after Cove Change
    expect(postCove).toBeGreaterThanOrEqual(polishToCoin);
    // Not trivial: Cove alone must not buy Fortune flyer polish (175)
    const polishToFortune = Math.max(50, Math.round(fortune.minCoins * CARPET_POLISH_MARKUP));
    expect(postCove).toBeLessThan(polishToFortune);
    expect(polishToFortune).toBe(175);
  });

  it("mg_coin_sort thresholds stay fail→hint→retry friendly (not brick walls)", () => {
    const t = coinSortThresholds();
    expect(t.explorer).toBe(20); // ~2 ChangeMaking corrects @ 15 pts
    expect(t.apprentice).toBe(35);
    expect(t.strategist).toBe(55);
    expect(t.explorer).toBeLessThan(t.apprentice);
    expect(t.apprentice).toBeLessThan(t.strategist);
  });

  it("Cove Take has no pouch debit today (scar-only) — spend path must not brick-wall", () => {
    const kira = COVE.dialogues?.find((d) => d.id === "dlg_keeper_kira");
    const kk1 = kira?.nodes.find((n) => n.id === "kk1");
    const spend = kk1?.choices?.find((c) => c.id === "kk1_spend");
    const save = kk1?.choices?.find((c) => c.id === "kk1_a");
    expect(spend?.effects?.some((e) => e.type === "setIrreversible")).toBe(true);
    expect(save?.effects?.some((e) => e.type === "setIrreversible")).toBe(true);
    // No money effect type on DialogueEffect yet — Take cost is scar/irreversible only.
    expect(JSON.stringify(spend?.effects ?? [])).not.toMatch(/"money"/);
  });

  it("Freedom Seal needs sustained cashflow — not two Pay Days after first deals", () => {
    expect(HARBOR_ESCAPE_TARGET).toBe(30);
    expect(HARBOR_ESCAPE_STREAK).toBeGreaterThanOrEqual(3);

    const base = createDefaultVoyagerLedger();
    expect(netCashflow(base)).toBe(15); // salary 40 − living 25

    const jar = HARBOR_DEALS.find((d) => d.id === "asset_savings_jar")!;
    const shell = HARBOR_DEALS.find((d) => d.id === "asset_shell_booth")!;
    const escapeCost = (jar.purchaseCost ?? 0) + (shell.purchaseCost ?? 0);
    expect(escapeCost).toBe(60); // within post-Cove pouch (~105–120)

    let ledger = {
      ...base,
      holdings: [jar, shell],
    };
    expect(netCashflow(ledger)).toBe(30);

    // Two qualifying Pay Days must NOT unlock Freedom (anti-trivialise).
    for (let i = 0; i < 2; i++) {
      const r = applyPayday(ledger, 1, { trackHarborEscape: true });
      ledger = r.ledger;
      expect(r.escapedNow).toBeFalsy();
    }
    expect(ledger.harborEscaped).toBe(false);

    const third = applyPayday(ledger, 1, { trackHarborEscape: true });
    expect(third.escapedNow).toBe(true);
    expect(third.ledger.harborEscaped).toBe(true);
  });

  it("plaza pass and first Board Star stay soft sinks after Cove", () => {
    expect(PLAZA_PASS_PRICE).toBe(80);
    const sealCost = 20; // partyBoard seal space coinReward
    const postCoveMin = coveMainQuestCoins() + computeMinigameReward(true, 20, true, false).coins;
    expect(postCoveMin).toBeGreaterThanOrEqual(sealCost);
    expect(postCoveMin).toBeGreaterThanOrEqual(PLAZA_PASS_PRICE); // pass is a choice, not a wall
  });

  it("carpet polish helper prices the next tier from current scrap rug", () => {
    const save = createDefaultIslandSave();
    const next = nextPurchasableCarpet(0, save);
    expect(next?.tier.id).toBe("coin_carpet");
    expect(next?.price).toBe(50);
  });

  it("plaza Seal chase chip stays readable after pouch dips into deals", () => {
    const base = createDefaultVoyagerLedger();
    expect(
      freedomPlazaChip({ freed: false, boatLabel: "Threadbare rug", ledger: base }),
    ).toBeNull();

    const afterDeals = {
      ...base,
      holdings: [
        HARBOR_DEALS.find((d) => d.id === "asset_savings_jar")!,
        HARBOR_DEALS.find((d) => d.id === "asset_shell_booth")!,
      ],
    };
    expect(netCashflow(afterDeals)).toBe(30);
    const chase = freedomPlazaChip({
      freed: false,
      boatLabel: "Threadbare rug",
      ledger: afterDeals,
    });
    expect(chase).toMatch(/Seal chase/i);
    expect(chase).toMatch(/0\/3/);

    expect(
      freedomPlazaChip({
        freed: true,
        boatLabel: "Fortune flyer",
        ledger: { ...afterDeals, harborEscaped: true },
      }),
    ).toBe("Freedom Seal · Fortune flyer");
  });
});
