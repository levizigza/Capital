import { test, expect } from "@playwright/test";

/**
 * Islands smoke test — full navigation path + save/load persistence.
 * Requires VITE_ISLANDS=1 and VITE_QA=1 (set in playwright.config.ts webServer.env).
 *
 * Post-v37: Harbor Haven is the hub; islands dock into walkable shore explore.
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

  test("launch → hub → map → Cove shore explore → journal → save/load", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");

    // Harbor Haven visible once save loads
    await expect(page.getByTestId("hub-travel-map")).toBeVisible({ timeout: 60_000 });
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false), {
      timeout: 15_000,
    }).toBe(true);
    await expect(page.getByTestId("hub-leave-islands")).toBeVisible();
    await page.getByTestId("hub-travel-map").click();

    // Archipelago map — Harbor hub + Cove as first painting
    await expect(page.getByTestId("island-pin-harbor_haven")).toBeVisible();
    await expect(page.getByTestId("island-pin-coincraft_cove")).toBeVisible();
    await expect(page.getByTestId("island-pin-financial_assets")).toBeVisible();

    // Enter Cove via QA — docks onto walkable shore (not chapter menu)
    await page.evaluate(() => window.__QA__?.enterIsland("coincraft_cove"));

    await expect.poll(async () => page.evaluate(() => window.__QA__?.getView())).toBe("explore");
    await expect(page.getByTestId("island-shore-view")).toBeVisible();
    await expect(page.getByText("Coincraft Cove")).toBeVisible();
    await expect(page.getByTestId("coin-bag-buddy-hud")).toBeVisible();

    // Minigame via QA bridge
    await page.evaluate(() => window.__QA__?.startMinigame("mg_coin_sort"));
    await expect(page.getByTestId("minigame-modal")).toBeVisible();
    await expect(page.getByText("Coin Sort Challenge")).toBeVisible();

    const earnBtn = page.getByRole("button", { name: /Sort Crates|Earn/i }).first();
    if (await earnBtn.isVisible()) {
      await earnBtn.click();
    }

    await page.getByTestId("minigame-close").click();

    // Persist save with Cove shore progress
    await page.evaluate(async () => {
      const qa = window.__QA__;
      if (!qa) throw new Error("QA bridge missing");
      await qa.persistSave();
    });

    const saveBeforeReload = await page.evaluate(() => window.__QA__?.getSave());
    expect(saveBeforeReload?.currentIslandId).toBe("coincraft_cove");

    // Reload and verify Cove shore session survives migrate
    await page.reload();
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false)).toBe(true);

    const saveAfterReload = await page.evaluate(() => window.__QA__?.getSave());
    expect(saveAfterReload?.currentIslandId).toBe("coincraft_cove");
    await expect.poll(async () => page.evaluate(() => window.__QA__?.getView())).toBe("explore");
  });
});
