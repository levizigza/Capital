import { test, expect } from "@playwright/test";

test("travel map Seed of Life declutter screenshot", async ({ page }) => {
  await page.goto("/?replayIntro=1");
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.goto("/?replayIntro=1");

  const skip = page.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }
  await expect(page.getByTestId("opening-choose-voyager")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("opening-choose-voyager").evaluate((el) => (el as HTMLElement).click());
  await expect(page.getByTestId("boot-cast-select")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("boot-board-carpet-now").evaluate((el) => (el as HTMLElement).click());

  const teach = page.getByTestId("ashore-comprehension-tutorial");
  if (await teach.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await page.getByTestId("ashore-teach-skip").evaluate((el) => (el as HTMLElement).click());
  }

  const carpetEnter = page.getByTestId("carpet-opening-enter-now");
  if (await carpetEnter.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await carpetEnter.click({ force: true });
  } else {
    const carpetSkip = page.getByTestId("carpet-opening-skip");
    if (await carpetSkip.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await carpetSkip.click({ force: true });
    }
  }

  const enter = page.getByTestId("harbor-skip-3d");
  if (await enter.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await enter.click({ force: true });
  }

  await page.waitForFunction(() => Boolean(window.__QA__?.openTravel), null, {
    timeout: 30_000,
  });
  await page.evaluate(() => window.__QA__!.openTravel());

  await expect(page.getByTestId("archipelago-map-3d")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("archipelago-island-strip")).toBeVisible();
  await expect(page.getByTestId("archipelago-side-shore-strip")).toHaveCount(0);
  await expect(page.getByTestId("fortune-archipelago-chip")).toContainText("Fortune Archipelago");

  await page.screenshot({
    path: "/opt/cursor/artifacts/screenshots/archipelago-decluttered.webp",
    type: "png",
  });
});
