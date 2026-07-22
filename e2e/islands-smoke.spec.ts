import { test, expect } from "@playwright/test";

/**
 * Islands smoke test — full navigation path + save/load persistence.
 * Requires VITE_ISLANDS=1 and VITE_QA=1 (set in playwright.config.ts webServer.env).
 */
test.describe("Islands smoke", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const defaults = {
        name: "QA Tester",
        level: 1,
        xp: 0,
        totalCoins: 0,
        gamesCompleted: 0,
        achievements: [] as string[],
        currentStreak: 0,
        skillsUnlocked: [] as string[],
        preferredMode: null,
        archetype: { primary: "navigator", secondary: "strategist", completedQuiz: true },
        preferences: { difficulty: "adaptive", gameTypes: [] as string[], playTime: "medium" },
      };
      const raw = localStorage.getItem("kv_user-profile");
      const parsed = raw ? JSON.parse(raw) : {};
      const profile = {
        ...defaults,
        ...parsed,
        preferences: { ...defaults.preferences, ...parsed.preferences },
        archetype: { ...defaults.archetype, ...parsed.archetype, completedQuiz: true },
      };
      localStorage.setItem("kv_user-profile", JSON.stringify(profile));
    });
  });

  test("launch → hub → map → island → quest → minigame → save/load", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");

    // Hub visible once save loads
    await expect(page.getByTestId("hub-travel-map")).toBeVisible({ timeout: 60_000 });
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false), {
      timeout: 15_000,
    }).toBe(true);
    await page.getByTestId("hub-travel-map").click();

    // Caribbean archipelago map — hub in center, outer resorts in a ring
    await expect(page.getByTestId("island-pin-coincraft_cove")).toBeVisible();
    await expect(page.getByTestId("island-pin-financial_assets")).toBeVisible();

    // Enter hub island via QA (POV sailing is manual)
    await page.evaluate(() => window.__QA__?.enterIsland("coincraft_cove"));

    // Island party board
    await expect.poll(async () => page.evaluate(() => window.__QA__?.getView())).toBe("island");
    await expect(page.getByText("Coincraft Cove")).toBeVisible();
    await expect(page.getByTestId("island-party-board")).toBeVisible();

    // Minigame via QA bridge
    await page.evaluate(() => window.__QA__?.startMinigame("mg_coin_sort"));
    await expect(page.getByTestId("minigame-modal")).toBeVisible();
    await expect(page.getByText("Coin Sort Challenge")).toBeVisible();

    // Interact with earn/spend module
    const earnBtn = page.getByRole("button", { name: /Sort Crates|Earn/i }).first();
    if (await earnBtn.isVisible()) {
      await earnBtn.click();
    }

    await page.getByTestId("minigame-close").click();

    // Persist save with island progress
    await page.evaluate(async () => {
      const qa = window.__QA__;
      if (!qa) throw new Error("QA bridge missing");
      await qa.persistSave();
    });

    const saveBeforeReload = await page.evaluate(() => window.__QA__?.getSave());
    expect(saveBeforeReload?.currentIslandId).toBe("coincraft_cove");

    // Reload and verify save restored
    await page.reload();
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false)).toBe(true);

    const saveAfterReload = await page.evaluate(() => window.__QA__?.getSave());
    expect(saveAfterReload?.currentIslandId).toBe("coincraft_cove");
  });
});
