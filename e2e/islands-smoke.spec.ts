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
    await page.goto("/?mode=islands");

    // Hub visible once save loads
    await expect(page.getByTestId("hub-travel-map")).toBeVisible({ timeout: 60_000 });
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false), {
      timeout: 15_000,
    }).toBe(true);
    await page.getByTestId("hub-travel-map").click();

    // Travel map → Coincraft Cove
    await expect(page.getByTestId("island-pin-coincraft_cove")).toBeVisible();
    await page.getByTestId("island-pin-coincraft_cove").click();

    // Island view
    await expect.poll(async () => page.evaluate(() => window.__QA__?.getView())).toBe("island");
    await expect(page.getByText("Coincraft Cove")).toBeVisible();

    // Quest: talk to Captain Penny, start quest
    await page.getByTestId("npc-npc_captain_penny").click();
    await expect(page.getByTestId("dialogue-modal")).toBeVisible();
    await page.getByTestId("dialogue-choice").filter({ hasText: "Teach me about coins!" }).click();
    await page.getByRole("button", { name: "Close" }).click();

    // Verify quest started in save
    await expect
      .poll(async () => {
        const save = await page.evaluate(() => window.__QA__?.getSave());
        return save?.questStatus?.q_cc_first_coins?.started;
      })
      .toBe(true);

    // Collect coin pouch
    await page.getByTestId("item-cc_coin_pouch").click();

    // Minigame via QA bridge (no dialogue trigger for mg_coin_sort in content)
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
    expect(saveBeforeReload?.inventory).toContain("cc_coin_pouch");

    // Reload and verify save restored
    await page.reload();
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false)).toBe(true);

    const saveAfterReload = await page.evaluate(() => window.__QA__?.getSave());
    expect(saveAfterReload?.currentIslandId).toBe("coincraft_cove");
    expect(saveAfterReload?.inventory).toContain("cc_coin_pouch");
    expect(saveAfterReload?.questStatus?.q_cc_first_coins?.started).toBe(true);
  });
});
