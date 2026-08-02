import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Islands smoke test — full navigation path + save/load persistence.
 * Requires VITE_ISLANDS=1 and VITE_QA=1 (set in playwright.config.ts webServer.env).
 *
 * Post-v37: Harbor Haven is the hub; islands dock into walkable shore explore.
 * Wave 4: travel strip is Fortune spine only (Harbor · Cove · Paycheck · Credit).
 */
test.describe("Islands smoke", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await killServiceWorkerForE2e(page);
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
    await waitForQaReady(page);

    // Past Castle Grounds + Piggy quiet chrome so map / leave are available
    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("day2_echo");
    });
    // Day-2 cinema may open — dismiss without blocking the smoke path
    const hearThem = page.getByRole("button", { name: /I hear them/i });
    if (await hearThem.isVisible({ timeout: 5_000 }).catch(() => false)) {
      // Footer HUD can intercept the Soft Beat CTA in CI — force dismiss.
      await hearThem.click({ force: true });
    }

    // Free-roam Harbor: Archipelago map is diegetic at Money Carpet (no always-on chip)
    await expect(page.getByTestId("hub-leave-islands")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("hub-travel-map")).toHaveCount(0);
    await page.evaluate(() => {
      window.__QA__!.openTravel();
    });

    // Fortune spine only — genre packs stay off the strip (Wave 4 freeze)
    await expect(page.getByTestId("island-pin-harbor_haven")).toBeVisible();
    await expect(page.getByTestId("island-pin-coincraft_cove")).toBeVisible();
    await expect(page.getByTestId("island-pin-paycheck_peninsula")).toBeVisible();
    await expect(page.getByTestId("island-pin-credit_kingdom")).toBeVisible();
    await expect(page.getByTestId("island-pin-financial_assets")).toHaveCount(0);
    await expect(page.getByTestId("fortune-archipelago-chip")).toBeVisible();

    // Enter Cove via QA — instant dock onto walkable shore (not chapter menu)
    await page.evaluate(async () => {
      await window.__QA__?.enterIsland("coincraft_cove");
    });

    await expect
      .poll(async () => page.evaluate(() => window.__QA__?.getView()), { timeout: 30_000 })
      .toBe("explore");
    await expect(page.getByTestId("island-shore-view")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Coincraft Cove" })).toBeVisible();
    await expect(page.getByTestId("coin-bag-buddy-hud")).toBeVisible();

    await expect
      .poll(async () => page.evaluate(() => window.__QA__?.getSave()?.currentIslandId), {
        timeout: 15_000,
      })
      .toBe("coincraft_cove");

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

    await expect
      .poll(async () => page.evaluate(() => window.__QA__?.getSave()?.currentIslandId), {
        timeout: 30_000,
      })
      .toBe("coincraft_cove");
    await expect
      .poll(async () => page.evaluate(() => window.__QA__?.getView()), { timeout: 30_000 })
      .toBe("explore");
  });
});
