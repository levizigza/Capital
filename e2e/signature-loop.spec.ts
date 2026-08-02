import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Cold signature loop — Harbor felt that.
 * Seeds post-Cove-Change save via QA bridge (no full quest grind).
 */
test.describe("Signature loop", () => {
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

  test("spectacle → felt share after seeded Cove Change", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("spectacle_ready");
    });

    const spectacle = page.getByTestId("scar-spectacle");
    await expect(spectacle).toBeVisible({ timeout: 20_000 });
    // World cinema — captions over Plinth (not a modal card).
    await expect(spectacle).toHaveAttribute("data-cinema-phase", /.+/);
    // Cold-retell polish — organ word in the kid sentence (present even during hush).
    await expect(page.getByTestId("scar-spectacle-retell")).toContainText(/Coin|Clock|Spiral|Memory/);
    // Dismiss early if still up; otherwise cinema auto-advances to share (~5.6s).
    if (await spectacle.isVisible()) {
      await spectacle.click({ timeout: 2_000 }).catch(() => {});
    }
    const share = page.getByTestId("harbor-felt-share");
    await expect(share).toBeVisible({ timeout: 12_000 });
    // Plinth freeze-frame — not a settings modal card; live lamp aperture stays open
    await expect(share).toHaveAttribute("data-share-presentation", "plinth-freeze");
    await expect(share).toHaveAttribute("data-plinth-aperture", "live");
    await expect(page.getByTestId("harbor-felt-plinth-aperture")).toBeAttached();
    await expect(page.getByTestId("harbor-felt-retell")).toContainText(
      /Coin holds|Clock shelters|Spiral withstands|Memory keeps/,
    );
    await expect(page.getByTestId("harbor-felt-retell")).toContainText(/Harbor remembered/);
    await expect(page.getByTestId("harbor-felt-newly-true")).toContainText(
      /Paycheck Peninsula|Credit Kingdom|on the Plinth/,
    );
    await expect(page.getByTestId("harbor-felt-download")).toBeVisible();
    await expect(page.getByTestId("harbor-felt-preview")).toBeVisible({ timeout: 10_000 });
    // Dev Errors / PERF chrome can sit over the lower-third CTA in headed CI viewports.
    await page.getByTestId("harbor-felt-keep-walking").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("harbor-felt-share")).toHaveCount(0);
    // Piggy presence — quiet Harbor, not a “Piggy Penny noticed” checklist modal
    await expect(page.getByTestId("harbor-quiet-chip")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("harbor-piggy-presence")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Piggy Penny noticed/i })).toHaveCount(0);
  });

  test("day-2 echo surprise without tutorial", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("day2_echo");
    });

    const echo = page.getByTestId("day2-echo-surprise");
    await expect(echo).toBeVisible({ timeout: 20_000 });
    // Soft Beat cinema over live Plinth — not a centered tutorial card
    await expect(echo).toHaveAttribute("data-echo-presentation", "plinth-cinema");
    // Dev Errors / residual HUD can sit over the lower-third CTA in headed CI.
    await page.getByRole("button", { name: /I hear them/i }).evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("day2-echo-surprise")).toHaveCount(0);
  });

  test("signature trailer captions play", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("piggy_ready");
      window.__QA__!.playSignatureTrailer();
    });

    await expect(page.getByTestId("signature-trailer")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("signature-trailer-caption")).toBeVisible();
    // One Harbor icon — Memory Plinth silhouette in the mute-friendly trailer
    await expect(page.getByTestId("trailer-plinth-icon")).toBeVisible();
    await page.getByTestId("signature-trailer-leave").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("signature-trailer")).toHaveCount(0);
  });
});
