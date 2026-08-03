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

test.describe.configure({ timeout: 120_000 });

test.describe("Harbor Haven tutorial opening", () => {
  test("Castle Grounds coach + Talk to Piggy after carpet", async ({ page }) => {
    await bootToHarbor(page);

    const coach = page.getByTestId("castle-grounds-coach");
    const myth = page.getByTestId("harbor-myth-fallback");
    const talk = page.getByTestId("hub-talk-npc");
    const mythTalk = page.getByTestId("fallback-talk-piggy");

    // Ashore redesign: first-meet hides Castle coach (Talk CTA is the only surface).
    // Myth fallback still teaches Talk.
    await expect
      .poll(async () => {
        const talkOk = await talk.isVisible().catch(() => false);
        const mythTalkOk = await mythTalk.isVisible().catch(() => false);
        const presence = await page
          .getByTestId("harbor-piggy-presence")
          .isVisible()
          .catch(() => false);
        const mythOk = await myth.isVisible().catch(() => false);
        return (talkOk || mythTalkOk) && (presence || mythOk);
      }, { timeout: 25_000 })
      .toBe(true);

    // Daily Ritual must not steal first-meet (Memory organ waits for Cove Change).
    await expect(page.getByRole("heading", { name: /Harbor Daily Ritual/i })).toHaveCount(0);

    if (await talk.isVisible().catch(() => false)) {
      await expect(coach).toHaveCount(0);
      await expect(page.getByTestId("harbor-piggy-presence")).toContainText(
        /Talk to Piggy|Piggy’s by the fountain/i,
      );
      await expect(page.getByTestId("harbor-controls-whisper")).toBeVisible();
      await talk.click({ force: true });
    } else {
      await expect(myth).toHaveAttribute("data-fallback-mode", "myth_meet");
      await expect(mythTalk).toBeVisible();
      await mythTalk.click({ force: true });
    }

    // Piggy Talk Battle — not Memory Plinth stealing the beat
    await expect(page.getByTestId("harbor-memory-modal")).toHaveCount(0);
    await expect(page.getByTestId("talk-battle-screen")).toBeVisible({ timeout: 15_000 });
    // Living-money stage — organ chip + Leave, not SaaS Skip / Continue
    await expect(page.getByTestId("talk-battle-organ")).toContainText(/Memory keeps/);
    await expect(page.getByTestId("talk-battle-leave")).toBeVisible();
    await expect(page.getByTestId("talk-battle-continue")).toContainText(/I hear you|Walk on/);
    // meet_guide — Teach Talk only (one verb). Outfitter waits for the next step.
    await expect(page.getByTestId("talk-battle-screen")).toContainText(
      /Welcome to Harbor Haven/i,
    );
    await expect(page.getByTestId("talk-battle-screen")).toContainText(/WASD|walk pad/i);
    await expect(page.getByTestId("talk-battle-screen")).not.toContainText(/Outfitter/i);
    await expect(page.getByTestId("talk-battle-screen")).not.toContainText(
      /Harbor is yours\. Talk to locals/i,
    );

    // Finish Talk (listen → reply → Walk on). Use element.click() so Dev Errors
    // overlays cannot steal Playwright hit-testing; pointerSafeActivate handles it.
    for (let step = 0; step < 8; step++) {
      if (!(await page.getByTestId("talk-battle-screen").isVisible().catch(() => false))) {
        break;
      }
      const choice = page.locator('[data-testid^="talk-choice-"]').first();
      if (await choice.isVisible().catch(() => false)) {
        await choice.evaluate((el) => (el as HTMLElement).click());
        continue;
      }
      const cont = page.getByTestId("talk-battle-continue");
      if (await cont.isVisible().catch(() => false)) {
        await cont.evaluate((el) => (el as HTMLElement).click());
        continue;
      }
      break;
    }
    await expect(page.getByTestId("talk-battle-screen")).toHaveCount(0, {
      timeout: 15_000,
    });

    const hubCarpet = page.getByTestId("hub-travel-map");
    const mythCarpet = page.getByTestId("fallback-board-carpet");
    await expect
      .poll(async () => {
        const hub = await hubCarpet.isVisible().catch(() => false);
        const myth = await mythCarpet.isVisible().catch(() => false);
        return hub || myth;
      }, { timeout: 20_000 })
      .toBe(true);

    if (await hubCarpet.isVisible().catch(() => false)) {
      await hubCarpet.evaluate((el) => (el as HTMLElement).click());
    } else {
      await expect(page.getByTestId("harbor-myth-fallback")).toHaveAttribute(
        "data-fallback-mode",
        "myth_travel",
      );
      await mythCarpet.evaluate((el) => (el as HTMLElement).click());
    }

    // Travel map (strip) or carpet flight — Cove path is open
    await expect
      .poll(async () => {
        const strip = await page
          .getByTestId("archipelago-island-strip")
          .isVisible()
          .catch(() => false);
        const flight = await page
          .getByTestId("carpet-flight-view")
          .isVisible()
          .catch(() => false);
        const boardCta = await page
          .getByTestId("carpet-board-cta")
          .isVisible()
          .catch(() => false);
        return strip || flight || boardCta;
      }, { timeout: 20_000 })
      .toBe(true);
  });
});
