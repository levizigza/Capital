import { describe, expect, it } from "vitest";
import {
  assistTierFromAttempts,
  escalateEarnSpendInsufficient,
  escalateMasteryHint,
  escalateThresholdHint,
  hintEscalatedPayload,
  masteryAssistQuestId,
} from "./onboardingFailureAssist";
import { minigameFailCopy } from "./minigameFail";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { advanceHubGuided, createDefaultHubGuidedIntro } from "./story/storyBible";

describe("onboarding failure assist", () => {
  it("maps attempts to tiers 1–4 without skipping", () => {
    expect(assistTierFromAttempts(0)).toBe(1);
    expect(assistTierFromAttempts(1)).toBe(2);
    expect(assistTierFromAttempts(2)).toBe(3);
    expect(assistTierFromAttempts(5)).toBe(4);
  });

  it("escalates Coin Sort hints without revealing pile order", () => {
    const t2 = escalateThresholdHint({
      tier: 2,
      score: 10,
      scoreThreshold: 35,
      minigameName: "Coin Sort",
      baseLine: "base",
    });
    expect(t2).toMatch(/Clear at|Need 35/);
    expect(t2.toLowerCase()).not.toMatch(/quarter first|pick the|optimal/);

    const t4 = escalateThresholdHint({
      tier: 4,
      score: 10,
      scoreThreshold: 35,
      minigameName: "Coin Sort",
      baseLine: "base",
    });
    expect(t4).toMatch(/Earn jobs|Finish/);
    expect(t4.toLowerCase()).not.toMatch(/always jar|save is correct/);
  });

  it("mastery hints preserve quiz-only retry framing", () => {
    expect(escalateMasteryHint({ tier: 4, minigameName: "Coin Sort mastery" })).toMatch(
      /quiz again|won’t redo|won't redo/i,
    );
    const copy = minigameFailCopy({
      reason: "objective_not_met",
      minigameName: "Coin Sort mastery",
      masteryFail: true,
      failedAttempts: 2,
    });
    expect(copy.retryLabel).toMatch(/quiz/i);
    expect(copy.hint.toLowerCase()).toMatch(/why change|prompt|quiz/);
  });

  it("EarnSpend insufficient escalates conceptually", () => {
    expect(escalateEarnSpendInsufficient({ insufficientCount: 1, wallet: 0, cost: 15 })).toBe(
      "Not enough money!",
    );
    expect(
      escalateEarnSpendInsufficient({ insufficientCount: 3, wallet: 5, cost: 15 }),
    ).toMatch(/share one wallet/i);
  });

  it("hint payload names failure cause + channel", () => {
    expect(
      hintEscalatedPayload({
        failureKind: "coin_sort_threshold",
        attempt: 2,
        hintLevel: 2,
        assistChannel: "fail_hint",
        questId: "q_cc_first_coins",
      }),
    ).toMatchObject({
      failureKind: "coin_sort_threshold",
      assistChannel: "fail_hint",
      attempt: 2,
    });
    expect(masteryAssistQuestId("gate_coin_sort")).toBe("mastery:gate_coin_sort");
  });

  it("Piggy Talk sets didMeetGuide; map bypass leaves it false", () => {
    let g = createDefaultHubGuidedIntro();
    g = advanceHubGuided(g, "talked_guide");
    expect(g.didMeetGuide).toBe(true);

    let bypass = createDefaultHubGuidedIntro();
    bypass = advanceHubGuided(bypass, "opened_map");
    expect(bypass.step).toBe("done");
    expect(bypass.didMeetGuide).toBeFalsy();
    expect(bypass.didDock).toBe(true);
  });

  it("talked_guide requires didMeetGuide flag from advanceHubGuided", () => {
    const g = advanceHubGuided(createDefaultHubGuidedIntro(), "talked_guide");
    expect(g.didMeetGuide).toBe(true);
    expect(g.step).toBe("to_dock");
  });

  it("failure recovery doc + wires exist", () => {
    const doc = readFileSync(join(__dirname, "../../docs/ftue/FAILURE_RECOVERY.md"), "utf8");
    expect(doc).toMatch(/ATTEMPT 1/);
    expect(doc).toMatch(/WHAT HAPPENED|WHAT/);
    expect(doc).toMatch(/quest_failed_attempt/);

    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/masteryRetry/);
    expect(app).toMatch(/quizOnly/);
    expect(app).toMatch(/piggy_bypassed/);

    const ashore = readFileSync(join(__dirname, "views/AshoreComprehensionTutorial.tsx"), "utf8");
    expect(ashore).toMatch(/FtueSessionTracker|tutorial_step|ftue_step/);
    expect(ashore).toMatch(/data-teach-mode="ftue-7"/);
  });
});
