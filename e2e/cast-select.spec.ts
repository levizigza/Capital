import { test, expect } from "@playwright/test";

/**
 * Street Fighter coin board → 3D customize → carpet.
 * Locks the dock/tab hit path that GUI agents sometimes miss.
 */
test.describe("Street Fighter cast select", () => {
  test("12 coins, customize tabs, and board carpet", async ({ page }) => {
    await page.goto("/?replayIntro=1");
    const skip = page.getByRole("button", { name: /^Skip$/i });
    if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await skip.click({ force: true });
    }
    await expect(page.getByTestId("opening-choose-voyager")).toBeVisible({ timeout: 20_000 });
    // Framer motion keeps the CTA "unstable" for Playwright checks — DOM click is reliable.
    // Keep the evaluate body free of TypeScript (it runs in the browser).
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await page.getByTestId("boot-cast-select").count()) break;
      await page.getByTestId("opening-choose-voyager").evaluate((el) => {
        el.click();
      });
      try {
        await page.getByTestId("boot-cast-select").waitFor({ state: "visible", timeout: 4_000 });
        break;
      } catch {
        await page.keyboard.press("Enter");
      }
    }
    await expect(page.getByTestId("boot-cast-select")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("sf-coin-count")).toHaveText("12");

    await page.getByTestId("boot-customize-look").click();
    await expect(page.getByTestId("boot-cast-select")).toHaveAttribute("data-stage", "look");
    await expect(page.getByTestId("character-creator-snap")).toBeVisible();

    await page.getByTestId("outfit-tab-coat").click();
    await expect(page.getByTestId("outfit-tab-coat")).toHaveAttribute("aria-selected", "true");

    const chip = page.locator('[data-testid="outfit-options-grid"] [data-testid^="outfit-chip-"]').nth(2);
    await chip.click();
    await expect(chip).toHaveAttribute("aria-selected", "true");

    await page.getByTestId("outfitter-change-fighter").click();
    await expect(page.getByTestId("boot-cast-select")).toHaveAttribute("data-stage", "select");

    await page.getByTestId("sf-coin-peso_pedro").click();
    await expect(page.getByTestId("boot-cast-select")).toHaveAttribute("data-stage", "look");
    await expect(page.getByTestId("character-creator-snap")).toContainText("Peso Pedro");

    await page.getByTestId("boot-board-carpet").click();
    await expect(page.getByTestId("boot-cast-select")).toHaveCount(0, { timeout: 15_000 });
  });
});
