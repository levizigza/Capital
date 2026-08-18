import { test, expect } from "@playwright/test";

/**
 * FTUE-7 Beat 1 (Goal): claim empty Plinth, then Continue advances to Walk.
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

async function bootToTeach(page: import("@playwright/test").Page) {
  await wipeVault(page);
  await page.goto("/?replayIntro=1");

  const skip = page.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }

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

  await expect(page.getByTestId("ashore-comprehension-tutorial")).toBeVisible({
    timeout: 20_000,
  });
}

test.describe("Ashore FTUE-7 Goal beat", () => {
  test("claim Plinth unlocks Continue into Walk", async ({ page }) => {
    await bootToTeach(page);

    const teach = page.getByTestId("ashore-comprehension-tutorial");
    await expect(teach).toHaveAttribute("data-teach-mode", "ftue-7");
    await expect(teach).toHaveAttribute("data-teach-step", "goal");

    const plinth = page.getByTestId("ashore-goal-plinth");
    await expect(plinth).toBeVisible();
    const continueBtn = page.getByTestId("ashore-teach-continue");
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeDisabled();

    await plinth.evaluate((el) => {
      (el as HTMLElement).click();
    });

    await expect(continueBtn).toBeEnabled({ timeout: 5_000 });
    await continueBtn.evaluate((el) => (el as HTMLElement).click());
    await expect(teach).toHaveAttribute("data-teach-step", "walk", { timeout: 8_000 });
    await expect(page.getByTestId("ashore-teach-gate")).toContainText(/rings/i);
  });
});
