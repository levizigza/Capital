import { test, expect } from "@playwright/test";

/**
 * Iconic Harbor Haven opening — Castle Grounds meet_guide after carpet.
 * Fresh vault: clear storage + wipe local Spark KV so quiet homecoming
 * cannot steal first-meet.
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
    try {
      const dbs = await indexedDB.databases?.();
      if (dbs) {
        await Promise.all(
          dbs
            .filter((d) => d.name)
            .map(
              (d) =>
                new Promise<void>((resolve) => {
                  const req = indexedDB.deleteDatabase(d.name!);
                  req.onsuccess = () => resolve();
                  req.onerror = () => resolve();
                  req.onblocked = () => resolve();
                }),
            ),
        );
      }
    } catch {
      /* ignore */
    }
  });
}

async function bootToHarbor(page: import("@playwright/test").Page) {
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

  // Select stage: skip customize. Look stage: Board Carpet save.
  const boardNow = page.getByTestId("boot-board-carpet-now");
  const boardLook = page.getByTestId("boot-board-carpet");
  if (await boardNow.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await boardNow.evaluate((el) => (el as HTMLElement).click());
  } else {
    await boardLook.evaluate((el) => (el as HTMLElement).click());
  }
  await expect(page.getByTestId("boot-cast-select")).toHaveCount(0, { timeout: 20_000 });

  // Carpet opening — Skip if present
  const carpetSkip = page.getByRole("button", { name: /^Skip$/i });
  if (await carpetSkip.isVisible({ timeout: 12_000 }).catch(() => false)) {
    await carpetSkip.click({ force: true });
  }

  // Loading veil may appear briefly — Enter is always safe
  const enter = page.getByTestId("harbor-skip-3d");
  if (await enter.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await enter.click({ force: true });
  }
}

test.describe.configure({ timeout: 90_000 });

test.describe("Harbor Haven tutorial opening", () => {
  test("Castle Grounds coach + Talk to Piggy after carpet", async ({ page }) => {
    await bootToHarbor(page);

    const coach = page.getByTestId("castle-grounds-coach");
    const myth = page.getByTestId("harbor-myth-fallback");
    const talk = page.getByTestId("hub-talk-npc");
    const mythTalk = page.getByTestId("fallback-talk-piggy");

    // Either 3D plaza with coach, or myth_meet fallback — both teach Talk
    await expect
      .poll(async () => {
        const coachOk = await coach.isVisible().catch(() => false);
        const mythOk = await myth.isVisible().catch(() => false);
        return coachOk || mythOk;
      }, { timeout: 25_000 })
      .toBe(true);

    if (await coach.isVisible().catch(() => false)) {
      await expect(coach).toHaveAttribute("data-guided-step", "meet_guide");
      await expect(coach).toContainText(/Walk · Talk|Castle Grounds/i);
      await expect(page.getByTestId("harbor-piggy-presence")).toBeVisible();
      await expect(page.getByTestId("harbor-controls-whisper")).toBeVisible();
      await expect(talk).toBeVisible();
      await talk.click({ force: true });
    } else {
      await expect(myth).toHaveAttribute("data-fallback-mode", "myth_meet");
      await expect(mythTalk).toBeVisible();
      await mythTalk.click({ force: true });
    }

    // Piggy dialogue opens
    await expect
      .poll(async () => {
        const body = await page.locator("body").innerText();
        return /Piggy Penny|Harbor Haven|Outfitter|Coin Bag/i.test(body);
      }, { timeout: 15_000 })
      .toBe(true);
  });
});
