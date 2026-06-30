import { test, expect } from "@playwright/test";

/**
 * Islands game-ui kit — no overlapping HUD at 3 viewport buckets.
 * Requires VITE_ISLANDS=1 and app route that mounts Islands (enable via env in playwright.config).
 */
const VIEWPORTS = [
  { name: "compact", width: 390, height: 844 },
  { name: "standard-16-9", width: 1280, height: 720 },
  { name: "tall-4-3", width: 1024, height: 768 },
] as const;

test.describe("Game UI layout", () => {
  for (const vp of VIEWPORTS) {
    test(`hub HUD does not overlap primary CTA @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForTimeout(500);

      const hubCta = page.getByRole("button", { name: /Open Travel Map/i });
      if ((await hubCta.count()) === 0) {
        test.skip(true, "Islands hub not mounted — set VITE_ISLANDS=1");
        return;
      }

      await expect(hubCta).toBeVisible();
      const ctaBox = await hubCta.boundingBox();
      expect(ctaBox).toBeTruthy();
      if (!ctaBox) return;

      const chips = page.locator(".game-hud-chip");
      const count = await chips.count();
      for (let i = 0; i < count; i++) {
        const box = await chips.nth(i).boundingBox();
        if (!box) continue;
        const overlaps =
          ctaBox.x < box.x + box.width &&
          ctaBox.x + ctaBox.width > box.x &&
          ctaBox.y < box.y + box.height &&
          ctaBox.y + ctaBox.height > box.y;
        expect(overlaps, `HUD chip ${i} overlaps travel CTA at ${vp.name}`).toBe(false);
      }
    });
  }
});
