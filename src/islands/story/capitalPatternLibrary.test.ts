import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { digressionScarGaps, digressionShelfTotal } from "../digressionShelf";
import { armSoftBeat, peekSoftBeatArm, softBeatArmWhisper } from "../softBeatArm";
import { minigameFailCopy } from "../minigameFail";
import { attachCoinBagHorizons } from "./coinBagBuddy";
import type { IslandSaveV1 } from "../types";

describe("capital pattern library contracts", () => {
  const lib = readFileSync(
    join(__dirname, "../../../docs/capital-pattern-library.md"),
    "utf8",
  );

  it("locks the pattern library bar and ship Hold", () => {
    expect(lib).toMatch(/Second-to-second interaction/);
    expect(lib).toMatch(/Failure contains information/);
    expect(lib).toMatch(/Multiplicative/);
    expect(lib).toMatch(/Opportunity cost visible/);
    expect(lib).toMatch(/Instrumentation now/);
    expect(lib).toMatch(/Ship iconic vs library\?\*\* \| \*\*Hold\*\*/);
  });

  it("Soft Beat arms the next living Talk (multiplicative chemistry)", () => {
    armSoftBeat("lookout");
    expect(peekSoftBeatArm()).toBe("lookout");
    expect(softBeatArmWhisper("lookout")).toMatch(/Coin/);
  });

  it("fail copy names organ verbs for learnable feedback", () => {
    const spiral = minigameFailCopy({
      reason: "objective_not_met",
      minigameName: "Credit Inbox",
      source: "structure",
      organId: "spiral",
      minigameId: "mg_ck_inbox_credit",
    });
    expect(spiral.walkLabel).toMatch(/Stay in the structure/);
    expect(spiral.hint).toMatch(/wait beats haste/i);
  });

  it("Coin Bag attaches Painting · Seal horizons", () => {
    const tip = attachCoinBagHorizons(
      { tip: "Talk to Piggy" },
      {
        nextPaintingHint: "Paycheck Peninsula",
        hasFreedom: true,
        carpetTierLabel: "Skiff",
        creditMastery: { mastery: 1, needed: 3, escaped: true, unlocked: false },
      },
    );
    expect(tip.painting).toMatch(/Paycheck/);
    expect(tip.seal).toMatch(/Spiral|Freedom/);
  });

  it("digression shelf tracks incomplete rumor pairs", () => {
    const empty = { harborScars: [] } as unknown as IslandSaveV1;
    expect(digressionScarGaps(empty)).toBe(digressionShelfTotal());
    const one = {
      harborScars: [{ id: "vf_foundry_rush" }],
    } as unknown as IslandSaveV1;
    expect(digressionScarGaps(one)).toBe(digressionShelfTotal() - 1);
  });

  it("structure abandon stays put — no Harbor remount dump", () => {
    const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/stay: \"structure\"/);
    expect(app).not.toMatch(
      /source === \"structure\"[\s\S]{0,120}setView\(\"home\"\)[\s\S]{0,80}setActiveIslandId\(HUB_ISLAND_ID\)/,
    );
  });

  it("Take rows foreshadow opportunity cost", () => {
    const cove = readFileSync(
      join(__dirname, "../content/coincraft-cove.islands.json"),
      "utf8",
    );
    expect(cove).toMatch(/quieter hush/);
    expect(cove).toMatch(/louder plaza gossip/);
  });

  it("Soft Beat stays until Leave — toy value, not timed dump", () => {
    const soft = readFileSync(join(__dirname, "../views/SoftBeatOverlay.tsx"), "utf8");
    expect(soft).toMatch(/Stay-until-Leave/);
    expect(soft).not.toMatch(/setTimeout\(onDone/);
  });

  it("Talk Battle can show Soft Beat arm foreshadow", () => {
    const talk = readFileSync(join(__dirname, "../views/TalkBattleScreen.tsx"), "utf8");
    expect(talk).toMatch(/talk-soft-beat-arm/);
    expect(talk).toMatch(/softBeatArmWhisper/);
  });

  it("Paycheck tip fork scars Harbor like Cove Shell Want", () => {
    const pay = readFileSync(
      join(__dirname, "../content/paycheck-peninsula.islands.json"),
      "utf8",
    );
    expect(pay).toMatch(/pp_tip_plan/);
    expect(pay).toMatch(/pp_tip_rush/);
    expect(pay).toMatch(/pri_fork/);
  });

  it("deletes write-only affinity meter from recordNpcTalk", () => {
    const mem = readFileSync(join(__dirname, "../worldMemory.ts"), "utf8");
    expect(mem).not.toMatch(/affinity: \(prev\?\.affinity/);
  });

  it("emits dwell_stuck for fun-dropoff telemetry", () => {
    const track = readFileSync(join(__dirname, "../analytics/screenTracking.ts"), "utf8");
    expect(track).toMatch(/dwell_stuck/);
  });
});
