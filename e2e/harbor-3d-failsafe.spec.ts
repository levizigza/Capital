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

async function dismissDay2IfOpen(page: import("@playwright/test").Page) {
  const hearThem = page.getByRole("button", { name: /I hear them/i });
  if (await hearThem.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await hearThem.click({ force: true });
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
    await dismissDay2IfOpen(page);

    await expect(page.getByTestId("harbor-myth-fallback")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("harbor-3d-shell")).toHaveCount(0);

    // Myth still offers a clear next verb (roam may show Talk + Carpet together)
    await expect(page.getByTestId("fallback-talk-piggy")).toBeVisible();
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
    await dismissDay2IfOpen(page);

    await expect(page.getByTestId("harbor-myth-fallback")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("harbor-myth-fallback")).toContainText(/safe mode/i);
    await expect(page.getByTestId("harbor-3d-shell")).toHaveCount(0);
  });
});
