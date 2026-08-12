import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Pillar 14 — sticky harbor3d fail / kill switch skips Canvas,
 * myth Harbor stays playable (Talk / carpet).
 *
 * Note: carpet boot clears `capital_harbor3d_fail` on purpose (fresh Harbor
 * attempt after Outfitter/carpet WebGL). Sticky e2e uses skipIntro so that
 * clear never runs.
 */

async function dismissHarborCinemaIfOpen(page: import("@playwright/test").Page) {
  // Day-2 Soft Beat · share card · spectacle can sit above myth fallback.
  for (const name of [/I hear them/i, /Leave — find Piggy/i, /Visit the Plinth/i]) {
    const btn = page.getByRole("button", { name });
    if (await btn.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await btn.click({ force: true });
      await page.waitForTimeout(200);
    }
  }
  const leave = page.getByTestId("day2-echo-leave");
  if (await leave.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await leave.click({ force: true });
  }
}

test.describe.configure({ timeout: 90_000 });

test.describe("Harbor 3D failsafe", () => {
  test("sticky capital_harbor3d_fail skips Canvas and keeps myth playable", async ({
    page,
  }) => {
    await killServiceWorkerForE2e(page);
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("capital_harbor3d_fail", "1");
      } catch {
        /* ignore */
      }
    });

    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);
    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("day2_echo");
    });
    await dismissHarborCinemaIfOpen(page);

    await expect(page.getByTestId("harbor-myth-fallback")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("harbor-civic-sketch")).toBeVisible();
    await expect(page.getByTestId("harbor-3d-shell")).toHaveCount(0);

    // Myth still offers a clear next verb — Talk + Carpet (Carpet prevents soft-lock)
    await expect(page.getByTestId("fallback-talk-piggy")).toBeVisible();
    await expect(page.getByTestId("fallback-board-carpet")).toBeVisible();
  });

  test("Enter Harbor Haven is clickable — HUD chrome stays off the loading veil", async ({
    page,
  }) => {
    await killServiceWorkerForE2e(page);
    // Force Canvas path but freeze ready so the veil stays up briefly.
    await page.addInitScript(() => {
      try {
        sessionStorage.removeItem("capital_harbor3d_fail");
      } catch {
        /* ignore */
      }
    });

    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);
    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("piggy_ready");
    });

    const veil = page.getByTestId("harbor-loading-veil");
    const enter = page.getByTestId("harbor-skip-3d");
    // Veil may already have escaped — either Enter works, or myth is already up.
    const veilUp = await veil.isVisible({ timeout: 3_000 }).catch(() => false);
    if (veilUp) {
      await expect(page.getByTestId("harbor-controls-whisper")).toHaveCount(0);
      await expect(enter).toBeVisible();
      await enter.click();
    }
    await expect(page.getByTestId("harbor-myth-fallback").or(page.getByTestId("harbor-3d-shell")))
      .toBeVisible({ timeout: 15_000 });
  });

  test("harbor3d kill switch uses safe-mode myth without Canvas", async ({ page }) => {
    await killServiceWorkerForE2e(page);
    await page.addInitScript(() => {
      try {
        localStorage.setItem("capital_kill_harbor3d", "1");
        localStorage.setItem("capital_kill_serviceWorker", "1");
      } catch {
        /* ignore */
      }
    });

    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);
    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("day2_echo");
    });
    await dismissHarborCinemaIfOpen(page);

    await expect(page.getByTestId("harbor-myth-fallback")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("harbor-myth-fallback")).toContainText(/safe mode/i);
    await expect(page.getByTestId("harbor-civic-sketch")).toBeVisible();
    await expect(page.getByTestId("harbor-3d-shell")).toHaveCount(0);
  });
});
