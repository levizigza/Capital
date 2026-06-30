import { test, expect } from '@playwright/test';

test.describe('FinanceQuest Pro - navigation smoke test', () => {
  test('mode select → Creative → skip quiz → menu → Budget Maze → exit back to menu', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for mode selection screen (FinanceQuest Pro title)
    await expect(page.getByRole('heading', { name: /FinanceQuest Pro/i })).toBeVisible({
      timeout: 15000,
    });

    // Click Creative Mode
    await page.getByRole('button', { name: /Creative Mode/i }).click();

    // If archetype quiz appears, skip it
    const skipBtn = page.getByRole('button', { name: /Skip Quiz/i });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
    }

    // Should land on Creative menu with "Choose Your Adventure"
    await expect(
      page.getByRole('heading', { name: /Choose Your Adventure/i })
    ).toBeVisible({ timeout: 10000 });

    // Click Budget Maze
    await page.getByRole('button', { name: /Budget Maze/i }).click();

    // Budget Maze loads — look for Exit or game UI
    await expect(
      page.getByRole('button', { name: /Exit|Back to Menu/i })
    ).toBeVisible({ timeout: 8000 });

    // Exit back to Creative menu
    await page.getByRole('button', { name: /Exit|Back to Menu/i }).first().click();

    // Back at menu
    await expect(
      page.getByRole('heading', { name: /Choose Your Adventure/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('mode select → Structured → dashboard loads', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /FinanceQuest Pro/i })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: /Structured Mode/i }).click();

    // Structured mode loads — look for something distinctive (dashboard, tabs, etc.)
    await expect(
      page.locator('text=/Dashboard|Quests|Progress|Tier/i')
    ).toBeVisible({ timeout: 10000 });
  });
});
