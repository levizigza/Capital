import { test, expect } from "@playwright/test";

/**
 * Cold signature loop — Harbor felt that.
 * Seeds post-Cove-Change save via QA bridge (no full quest grind).
 */
test.describe("Signature loop", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
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

  test("spectacle → felt share after seeded Cove Change", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false), {
      timeout: 60_000,
    }).toBe(true);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("spectacle_ready");
    });

    await expect(page.getByTestId("scar-spectacle")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("scar-spectacle").click();
    await expect(page.getByTestId("harbor-felt-share")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("harbor-felt-download")).toBeVisible();
    await page.getByRole("button", { name: /Keep walking/i }).click();
    await expect(page.getByTestId("harbor-felt-share")).toHaveCount(0);
  });

  test("day-2 echo surprise without tutorial", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false), {
      timeout: 60_000,
    }).toBe(true);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("day2_echo");
    });

    await expect(page.getByTestId("day2-echo-surprise")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /I hear them/i }).click();
    await expect(page.getByTestId("day2-echo-surprise")).toHaveCount(0);
  });

  test("signature trailer captions play", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await expect.poll(async () => page.evaluate(() => window.__QA__?.ready ?? false), {
      timeout: 60_000,
    }).toBe(true);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("piggy_ready");
      window.__QA__!.playSignatureTrailer();
    });

    await expect(page.getByTestId("signature-trailer")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("signature-trailer-caption")).toBeVisible();
    // One Harbor icon — Memory Plinth silhouette in the mute-friendly trailer
    await expect(page.getByTestId("trailer-plinth-icon")).toBeVisible();
    await page.getByTestId("signature-trailer").click();
    await expect(page.getByTestId("signature-trailer")).toHaveCount(0);
  });
});
