import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Machine proof — independent transfer surface opens after Cove training.
 * Human ITR still requires cold observer cohort (docs/ftue/INDEPENDENT_TRANSFER_PLAYTEST.md).
 */
test.describe("Independent transfer — Paycheck", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await killServiceWorkerForE2e(page);
    await page.addInitScript(() => {
      const defaults = {
        name: "QA Voyager",
        level: 1,
        xp: 0,
        totalCoins: 40,
        gamesCompleted: 0,
        achievements: [] as string[],
        currentStreak: 0,
        skillsUnlocked: [] as string[],
        preferredMode: null,
        archetype: { primary: "navigator", secondary: "strategist", completedQuiz: true },
        preferences: { difficulty: "adaptive", gameTypes: [] as string[], playTime: "medium" },
      };
      localStorage.setItem("kv_user-profile", JSON.stringify(defaults));
    });
  });

  test("seed opens Paycheck with transfer window and Vee Take previews", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    await page.evaluate(async () => {
      await window.__QA__!.seedIndependentTransfer();
    });

    const state = await page.evaluate(() => {
      const s = window.__QA__!.getSave();
      return {
        island: s?.currentIslandId,
        transferAttempts: s?.conceptProgress?.concepts?.save_vs_spend?.transferAttempts ?? 0,
        rainyStarted: s?.questStatus?.q_pp_rainy_day?.started,
        hasPaycheckTake: Boolean(s?.irreversibleChoices?.paycheck_protect_vs_spend),
      };
    });

    expect(state.island).toBe("paycheck_peninsula");
    expect(state.transferAttempts).toBeGreaterThanOrEqual(1);
    expect(state.rainyStarted).toBe(true);
    expect(state.hasPaycheckTake).toBe(false);

    await page.evaluate(async () => {
      await window.__QA__!.talkNpc("npc_vendor_vee");
    });

    await expect(page.getByTestId("talk-battle-screen")).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(400);
    await page.getByTestId("talk-battle-continue").click();
    await expect(page.getByTestId("talk-choice-vv_protect")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("talk-choice-footprint-vv_protect")).toBeVisible();
  });
});
