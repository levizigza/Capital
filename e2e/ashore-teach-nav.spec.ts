import { test, expect } from "@playwright/test";

/**
 * Iconic Ashore — poke living money (in-world); room morphs to Walk (no Continue homework).
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

test.describe("Iconic Ashore seed chamber", () => {
  test("full-bleed 3D chamber; poke auto-morphs to Walk", async ({ page }) => {
    await bootToTeach(page);

    const teach = page.getByTestId("ashore-comprehension-tutorial");
    await expect(teach).toHaveAttribute("data-teach-step", "fantasy");
    await expect(teach).toHaveAttribute("data-iconic", "seed-chamber");
    await expect(page.getByTestId("ashore-iconic-title")).toContainText(/Money is alive here/i);

    const pad = page.getByTestId("voyager-walk-practice");
    await expect(pad).toBeVisible();
    await expect(pad).toHaveAttribute("data-practice-mode", "fantasy");

    const padBox = await pad.boundingBox();
    const vp = page.viewportSize();
    expect(padBox).toBeTruthy();
    expect(vp).toBeTruthy();
    // Full-bleed: practice stage fills most of the viewport
    expect(padBox!.height).toBeGreaterThan(vp!.height * 0.7);
    expect(padBox!.width).toBeGreaterThan(vp!.width * 0.7);

    await expect(page.getByTestId("ashore-fantasy-toys")).toHaveAttribute(
      "data-spectacle",
      "1",
    );
    await page.getByTestId("ashore-fantasy-toy-memory").evaluate((el) => {
      (el as HTMLElement).click();
    });

    await expect(teach).toHaveAttribute("data-teach-step", "walk", { timeout: 8_000 });
    await expect(pad).toHaveAttribute("data-practice-mode", "walk");
    await expect(page.getByTestId("ashore-teach-gate")).toBeVisible();
    await expect(page.getByTestId("ashore-teach-skip")).toContainText(/Leave/i);
  });
});
