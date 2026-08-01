import type { Page } from "@playwright/test";

/**
 * Wait for the QA bridge after boot — resilient to SW controllerchange reloads
 * that destroy the execution context mid-poll.
 */
export async function waitForQaReady(page: Page, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown;
  while (Date.now() < deadline) {
    try {
      const ok = await page.evaluate(() => Boolean(window.__QA__?.ready));
      if (ok) return;
    } catch (err) {
      lastErr = err;
      // Navigation / context destroyed — wait for the next document.
      await page.waitForLoadState("domcontentloaded").catch(() => {});
    }
    await page.waitForTimeout(200);
  }
  throw new Error(
    `QA bridge never became ready within ${timeoutMs}ms${
      lastErr instanceof Error ? ` (last: ${lastErr.message})` : ""
    }`,
  );
}

/** Kill SW before app scripts so preview e2e is not flaked by controllerchange. */
export async function killServiceWorkerForE2e(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("capital_kill_serviceWorker", "1");
    } catch {
      /* ignore */
    }
  });
}
