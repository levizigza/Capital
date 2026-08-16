import { test, expect } from "@playwright/test";

/**
 * Ashore Teach Chamber 1 must never soft-lock: toys + Continue stay on the
 * sticky prove dock; one poke unlocks Enter the walk chamber.
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

  // Prefer select-stage Continue — never open Customize for this gate.
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

test.describe("Ashore Teach Chamber 1 navigation", () => {
  test("prove dock keeps toys + Continue; poke advances to Walk", async ({ page }) => {
    await bootToTeach(page);

    const teach = page.getByTestId("ashore-comprehension-tutorial");
    await expect(teach).toHaveAttribute("data-teach-step", "fantasy");

    const dock = page.getByTestId("ashore-teach-prove-dock");
    await expect(dock).toBeVisible();
    await expect(page.getByTestId("ashore-fantasy-toys")).toBeVisible();
    await expect(page.getByTestId("ashore-fantasy-toy-memory")).toBeVisible();
    await expect(page.getByTestId("ashore-fantasy-toy-coin")).toBeVisible();

    const continueBtn = page.getByTestId("ashore-teach-continue");
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toHaveAttribute("aria-disabled", "true");
    await expect(continueBtn).toContainText(/Poke a living-money toy/i);

    // Toys + CTA must share the viewport (sticky dock) — not clipped below fold.
    const toyBox = await page.getByTestId("ashore-fantasy-toys").boundingBox();
    const ctaBox = await continueBtn.boundingBox();
    expect(toyBox).toBeTruthy();
    expect(ctaBox).toBeTruthy();
    const vp = page.viewportSize();
    expect(vp).toBeTruthy();
    expect(toyBox!.y + toyBox!.height).toBeLessThanOrEqual(vp!.height + 2);
    expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(vp!.height + 2);

    await page.getByTestId("ashore-fantasy-toy-memory").evaluate((el) => {
      (el as HTMLElement).click();
    });

    await expect(continueBtn).toHaveAttribute("aria-disabled", "false");
    await expect(continueBtn).toContainText(/Enter the walk chamber/i);

    await continueBtn.evaluate((el) => (el as HTMLElement).click());
    await expect(teach).toHaveAttribute("data-teach-step", "walk", { timeout: 8_000 });
    await expect(page.getByTestId("ashore-teach-gate")).toContainText(/rings/i);
  });
});
