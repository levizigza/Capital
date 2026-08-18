import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { digressionScarGaps, digressionShelfTotal, digressionShelfRows } from "../digressionShelf";
import {
  armSoftBeat,
  peekSoftBeatArm,
  softBeatArmWhisper,
  softBeatArmConsumesOnChoice,
  softBeatArmChoiceSuffix,
  consumeSoftBeatArm,
} from "../softBeatArm";
import { minigameFailCopy } from "../minigameFail";
import { attachCoinBagHorizons } from "./coinBagBuddy";
import type { IslandSaveV1 } from "../types";

describe("capital pattern library contracts", () => {
  const lib = readFileSync(
    join(__dirname, "../../../docs/capital-pattern-library.md"),
    "utf8",
  );

  it("locks the pattern library bar and honest ship Hold", () => {
    expect(lib).toMatch(/Second-to-second/);
    expect(lib).toMatch(/Failure contains information/);
    expect(lib).toMatch(/Multiplicative/);
    expect(lib).toMatch(/Opportunity cost visible/);
    expect(lib).toMatch(/Instrumentation now/);
    expect(lib).toMatch(/Ship iconic vs library\?\*\* \*\*Hold\*\*/);
    expect(lib).toMatch(/Pass L/);
    expect(lib).not.toMatch(/Ship verdict \(Pass I.*100% Pass/);
  });

  it("lists every pattern 1–100 as its own row (no range lumps)", () => {
    expect(lib).not.toMatch(/\|\s*\d+\s*[–-]\s*\d+\s*\|/);
    const nums = new Set<number>();
    for (const m of lib.matchAll(/^\|\s*(\d+)\s*\|/gm)) {
      nums.add(Number(m[1]));
    }
    for (let i = 1; i <= 100; i++) {
      expect(nums.has(i), `missing individual row for pattern ${i}`).toBe(true);
    }
    expect(nums.size).toBe(100);
  });

  it("feedback loop + bounded ritual pick are real (#66 / #70)", () => {
    const weather = readFileSync(join(__dirname, "../harborWeather.ts"), "utf8");
    expect(weather).toMatch(/feedbackLoopLine/);
    const ritual = readFileSync(join(__dirname, "../harborRitual.ts"), "utf8");
    expect(ritual).toMatch(/boundedIndexFromKey/);
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/feedbackLoopLine/);
  });

  it("VibeCode invent tip is real (not Capsule shop lie)", () => {
    const buddy = readFileSync(join(__dirname, "coinBagBuddy.ts"), "utf8");
    expect(buddy).toMatch(/VibeCode — invent a level/);
    expect(buddy).not.toMatch(/Capsule Studio is your toy box/);
  });

  it("dwell_stuck arms while stuck on screen", () => {
    const track = readFileSync(
      join(__dirname, "../analytics/screenTracking.ts"),
      "utf8",
    );
    expect(track).toMatch(/armDwellStuckWatch/);
    expect(track).toMatch(/whileStuck: true/);
  });

  it("Family digression_pair challenge exists for local coop", () => {
    const fam = readFileSync(join(__dirname, "../familyRoom.ts"), "utf8");
    expect(fam).toMatch(/digression_pair/);
    expect(fam).toMatch(/maybeCompleteDigressionPairChallenge/);
  });

  it("weather literacy reaches Coin Bag on tight/storm", () => {
    const buddy = readFileSync(join(__dirname, "coinBagBuddy.ts"), "utf8");
    expect(buddy).toMatch(/weatherLiteracy/);
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/weatherLiteracy/);
    expect(hub).toMatch(/harborWeatherMood/);
  });

  it("Soft Beat arms the next living Talk (multiplicative chemistry)", () => {
    armSoftBeat("lookout");
    expect(peekSoftBeatArm()).toBe("lookout");
    expect(softBeatArmWhisper("lookout")).toMatch(/Coin/);
    expect(softBeatArmConsumesOnChoice({ effects: [{ type: "setIrreversible" }] })).toBe(true);
    expect(softBeatArmConsumesOnChoice({ effects: [{ type: "addScar" }] })).toBe(true);
    expect(softBeatArmConsumesOnChoice({ effects: [{ type: "giveItem" }] })).toBe(false);
    expect(softBeatArmChoiceSuffix("battlement", [{ type: "setIrreversible" }])).toMatch(/Spiral/);
    expect(softBeatArmChoiceSuffix("battlement", [{ type: "giveItem" }])).toBeNull();
    consumeSoftBeatArm();
  });

  it("Inbox Storm fills a digression myth shelf slot", () => {
    const one = {
      harborScars: [{ id: "pp_inbox_storm", label: "Cleared the Inbox Storm" }],
    } as unknown as IslandSaveV1;
    const rows = digressionShelfRows(one);
    expect(rows.some((r) => r.label.includes("Inbox Storm") && r.filled)).toBe(true);
    expect(digressionScarGaps(one)).toBe(digressionShelfTotal() - 1);
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

  it("Soft Beat arm whisper reaches shore Coin Bag", () => {
    const shore = readFileSync(join(__dirname, "../views/IslandShoreView.tsx"), "utf8");
    expect(shore).toMatch(/softBeatArmWhisper|peekSoftBeatArm/);
  });

  it("Plinth shows digression myth shelf with empty slots", () => {
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/digression-myth-shelf/);
    expect(hub).toMatch(/digression-slot-empty/);
  });

  it("fail overlay plays organ SFX", () => {
    const fail = readFileSync(join(__dirname, "../views/MinigameFailOverlay.tsx"), "utf8");
    expect(fail).toMatch(/playOrganSfx/);
  });

  it("structure toys poke with juice", () => {
    const toys = readFileSync(
      join(__dirname, "../world3d/StructureInteriorToys.tsx"),
      "utf8",
    );
    expect(toys).toMatch(/pokeOrgan/);
    expect(toys).toMatch(/triggerJuice\("accept"\)/);
  });

  it("Inbox Storm clear scars Harbor", () => {
    const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/pp_inbox_storm/);
    expect(app).toMatch(/mg_inbox_storm/);
    const shelf = readFileSync(join(__dirname, "../digressionShelf.ts"), "utf8");
    expect(shelf).toMatch(/pp_inbox_storm/);
  });

  it("Paycheck tip fork foreshadows opportunity cost", () => {
    const pay = readFileSync(
      join(__dirname, "../content/paycheck-peninsula.islands.json"),
      "utf8",
    );
    expect(pay).toMatch(/quieter Main Street/);
    expect(pay).toMatch(/louder tip-jar weather/);
  });

  it("Soft Beat arm burns only on Take or digression stakes", () => {
    const arm = readFileSync(join(__dirname, "../softBeatArm.ts"), "utf8");
    expect(arm).toMatch(/softBeatArmConsumesOnChoice/);
    expect(arm).toMatch(/softBeatArmChoiceSuffix/);
    const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/softBeatArmConsumesOnChoice/);
    const talk = readFileSync(join(__dirname, "../views/TalkBattleScreen.tsx"), "utf8");
    expect(talk).toMatch(/softBeatArmChoiceSuffix/);
  });

  it("mastery fail routes through organ fail overlay", () => {
    const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/handleMasteryFailed/);
    expect(app).toMatch(/pendingMinigameFail/);
    const start = app.indexOf("const handleMasteryFailed");
    const failBlock = app.slice(start, start + 2_400);
    expect(failBlock).toMatch(/minigameFailCopy/);
    expect(failBlock).not.toMatch(/setActiveMinigameId\(mgId\)/);
  });

  it("Credit haste Take has soft-fail flavor parity", () => {
    const fail = readFileSync(join(__dirname, "../minigameFail.ts"), "utf8");
    expect(fail).toMatch(/credit_borrow_vs_wait/);
    expect(fail).toMatch(/borrow/);
  });

  it("digression scars never arm Take hush / carpet cinema", () => {
    const mem = readFileSync(join(__dirname, "../worldMemory.ts"), "utf8");
    expect(mem).toMatch(/scarTriggersChapterQuiet/);
    expect(mem).toMatch(/isDigressionScar/);
  });

  it("Soft Beat spend rides Take hush after consume", () => {
    const shore = readFileSync(join(__dirname, "../views/IslandShoreView.tsx"), "utf8");
    expect(shore).toMatch(/softBeatSpentHushLine/);
    expect(shore).toMatch(/peekLastConsumedSoftBeat/);
    const arm = readFileSync(join(__dirname, "../softBeatArm.ts"), "utf8");
    expect(arm).toMatch(/noteSoftBeatConsumed/);
  });

  it("Soft Beat trail shelves peeks for longevity", () => {
    const arm = readFileSync(join(__dirname, "../softBeatArm.ts"), "utf8");
    expect(arm).toMatch(/noteSoftBeatTrail/);
    expect(arm).toMatch(/readSoftBeatTrail/);
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/soft-beat-trail-shelf/);
    const soft = readFileSync(join(__dirname, "../views/SoftBeatOverlay.tsx"), "utf8");
    expect(soft).toMatch(/noteSoftBeatTrail/);
  });
});
