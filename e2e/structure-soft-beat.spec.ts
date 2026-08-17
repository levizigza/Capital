import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Soft Beat → structure exit must not remount Harbor plaza or shore.
 * Guards iconicCraftCadence structure_exit.
 */
test.describe("Money Structure Soft Beat exit", () => {
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

  test("Cove Lid Soft Beat then exit keeps shore mounted", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    await page.evaluate(async () => {
      await window.__QA__!.enterIsland("coincraft_cove");
    });
    const shore = page.getByTestId("island-shore-view");
    await expect(shore).toBeVisible({ timeout: 30_000 });
    await shore.evaluate((el) => {
      (el as HTMLElement).dataset.coldHost = "1";
    });

    await page.evaluate(async () => {
      await window.__QA__!.enterMoneyStructure("coincraft_cove");
    });
    await expect(page.getByTestId("money-structure-exit")).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() => window.__QA__!.enterStructureSoftBeat());
    const soft = page.getByTestId("soft-beat-overlay");
    await expect(soft).toBeVisible({ timeout: 12_000 });
    await expect(soft).toHaveAttribute("data-soft-beat", "lookout");
    await expect(page.getByTestId("soft-beat-retell")).toContainText(/Coin holds/i);

    await page.getByTestId("soft-beat-leave").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(soft).toBeHidden({ timeout: 12_000 });

    await page.getByTestId("money-structure-exit").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("money-structure-exit")).toBeHidden({ timeout: 12_000 });
    await expect(shore).toHaveAttribute("data-cold-host", "1");
  });

  test("Harbor Teller Soft Beat then exit keeps plaza mounted", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    const ashSkip = page.getByTestId("ashore-teach-skip");
    if (await ashSkip.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await ashSkip.evaluate((el) => (el as HTMLButtonElement).click());
    }
    await waitForQaReady(page);
    await page.evaluate(() => window.__QA__!.openHub());
    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }

    const hub = page.getByTestId("harbor-home-hub");
    await expect(hub).toBeVisible({ timeout: 20_000 });
    await hub.evaluate((el) => {
      (el as HTMLElement).dataset.coldHost = "1";
    });

    await page.evaluate(async () => {
      await window.__QA__!.enterMoneyStructure("harbor_haven");
    });
    await expect(page.getByTestId("money-structure-exit")).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() => window.__QA__!.enterStructureSoftBeat());
    const soft = page.getByTestId("soft-beat-overlay");
    await expect(soft).toBeVisible({ timeout: 12_000 });
    await expect(soft).toHaveAttribute("data-soft-beat", "ledger");
    await expect(soft.getByTestId("soft-beat-retell")).toContainText(/Memory keeps|Coin holds/i);

    await soft.getByTestId("soft-beat-leave").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(soft).toBeHidden({ timeout: 12_000 });

    await page.getByTestId("money-structure-exit").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("money-structure-exit")).toBeHidden({ timeout: 12_000 });
    await expect(hub).toHaveAttribute("data-cold-host", "1");
  });
});
