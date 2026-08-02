import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Pillar 14 — sticky harbor3d fail / kill switch skips Canvas,
 * myth Harbor stays playable (Talk / carpet).
 */

async function wipeVault(page: import("@playwright/test").Page) {
  await page.goto("/?replayIntro=1");
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    try {
      await fetch("/_spark/kv", { method: "DELETE" });
    } catch {
      /* ignore */
    }
  });
}

async function boardPastCastSelect(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("opening-choose-voyager")).toBeVisible({ timeout: 20_000 });
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await page.getByTestId("boot-cast-select").count()) break;
    await page.getByTestId("opening-choose-voyager").evaluate((el) => {
      (el as HTMLElement).click();
    });
    try {
      await page.getByTestId("boot-cast-select").waitFor({ state: "visible", timeout: 4_000 });
      break;
    } catch {
      await page.keyboard.press("Enter");
    }
  }
  await expect(page.getByTestId("boot-cast-select")).toBeVisible({ timeout: 20_000 });
  const boardNow = page.getByTestId("boot-board-carpet-now");
  const boardLook = page.getByTestId("boot-board-carpet");
  if (await boardNow.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await boardNow.evaluate((el) => (el as HTMLElement).click());
  } else {
    await boardLook.evaluate((el) => (el as HTMLElement).click());
  }
  await expect(page.getByTestId("boot-cast-select")).toHaveCount(0, { timeout: 20_000 });

  const carpetSkip = page.getByRole("button", { name: /^Skip$/i });
  if (await carpetSkip.isVisible({ timeout: 12_000 }).catch(() => false)) {
    await carpetSkip.click({ force: true });
  }
}

test.describe.configure({ timeout: 90_000 });

test.describe("Harbor 3D failsafe", () => {
  test("sticky capital_harbor3d_fail skips Canvas and keeps myth playable", async ({
    page,
  }) => {
    await killServiceWorkerForE2e(page);
    await wipeVault(page);

    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("capital_harbor3d_fail", "1");
      } catch {
        /* ignore */
      }
    });

    await page.goto("/?replayIntro=1");
    const skip = page.getByRole("button", { name: /^Skip$/i });
    if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await skip.click({ force: true });
    }
    await boardPastCastSelect(page);

    await expect(page.getByTestId("harbor-myth-fallback")).toBeVisible({ timeout: 25_000 });
    await expect(page.getByTestId("harbor-3d-shell")).toHaveCount(0);

    // Myth still offers the Ashore verb
    await expect(
      page.getByTestId("fallback-talk-piggy").or(page.getByTestId("fallback-board-carpet")),
    ).toBeVisible();
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
    const hearThem = page.getByRole("button", { name: /I hear them/i });
    if (await hearThem.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await hearThem.click({ force: true });
    }

    await expect(page.getByTestId("harbor-myth-fallback")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("harbor-myth-fallback")).toContainText(/safe mode/i);
    await expect(page.getByTestId("harbor-3d-shell")).toHaveCount(0);
  });
});
