import { test, expect } from "@playwright/test";

/**
 * Street Fighter coin board → 3D customize → carpet.
 * Locks the dock/tab hit path that GUI agents sometimes miss.
 */
test.describe("Street Fighter cast select", () => {
  test("12 coins, customize tabs, and board carpet", async ({ page }) => {
    await page.goto("/?replayIntro=1");
    await page.getByRole("button", { name: /^Skip$/i }).click({ force: true });
    await page.getByTestId("opening-choose-voyager").click({ force: true });
    await expect(page.getByTestId("boot-cast-select")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("sf-coin-count")).toHaveText("12");

    await page.getByTestId("boot-customize-look").click();
    await expect(page.getByTestId("boot-cast-select")).toHaveAttribute("data-stage", "look");
    await expect(page.getByTestId("character-creator-snap")).toBeVisible();

    await page.getByTestId("outfit-tab-coat").click();
    await expect(page.getByTestId("outfit-tab-coat")).toHaveAttribute("aria-selected", "true");

    const chip = page.locator('[data-testid^="outfit-chip-"]').nth(2);
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
