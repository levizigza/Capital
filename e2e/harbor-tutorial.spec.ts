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

  // Pre-carpet comprehension teach — Skip proves Esc path; gates covered in unit tests.
  const teach = page.getByTestId("ashore-comprehension-tutorial");
  if (await teach.isVisible({ timeout: 8_000 }).catch(() => false)) {
    const skipTeach = page.getByTestId("ashore-teach-skip");
    if (await skipTeach.isVisible().catch(() => false)) {
      await skipTeach.click({ force: true });
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(teach).toHaveCount(0, { timeout: 10_000 });
  }

  // Carpet opening — Enter Harbor / Skip if present
  const carpetEnter = page.getByTestId("carpet-opening-enter-now");
  if (await carpetEnter.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await carpetEnter.click({ force: true });
  } else {
    const carpetSkip = page.getByTestId("carpet-opening-skip");
    if (await carpetSkip.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await carpetSkip.click({ force: true });
    } else {
      const carpetSkipLegacy = page.getByRole("button", { name: /^Skip/i });
      if (await carpetSkipLegacy.isVisible({ timeout: 4_000 }).catch(() => false)) {
        await carpetSkipLegacy.click({ force: true });
      }
    }
  }

  // Loading veil may appear briefly — Enter is always safe
  const enter = page.getByTestId("harbor-skip-3d");
  if (await enter.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await enter.click({ force: true });
  }
}

test.describe.configure({ timeout: 120_000 });

test.describe("Harbor Haven tutorial opening", () => {
  test("Walk-first Harbor after teach — Piggy tip, no ambush Talk CTA", async ({ page }) => {
    await bootToHarbor(page);

    const myth = page.getByTestId("harbor-myth-fallback");
    const talk = page.getByTestId("hub-talk-npc");
    const mythTalk = page.getByTestId("fallback-talk-piggy");

    // First meet: presence tip visible; Talk CTA only when near Piggy (or myth fallback).
    await expect
      .poll(async () => {
        const presence = await page
          .getByTestId("harbor-piggy-presence")
          .isVisible()
          .catch(() => false);
        const mythOk = await myth.isVisible().catch(() => false);
        const plaza = await page.getByTestId("harbor-plaza").count();
        return (presence || mythOk) && plaza > 0;
      }, { timeout: 25_000 })
      .toBe(true);

    // Ambush guard: spawn must not force Talk unless myth fallback (no WebGL).
    const talkAtSpawn = await talk.isVisible().catch(() => false);
    const mythTalkOk = await mythTalk.isVisible().catch(() => false);
    if (!mythTalkOk) {
      expect(talkAtSpawn).toBe(false);
    }

    // Daily Ritual must not steal first-meet (Memory organ waits for Cove Change).
    await expect(page.getByRole("heading", { name: /Harbor Daily Ritual/i })).toHaveCount(0);

    const presence = page.getByTestId("harbor-piggy-presence");
    if (await presence.isVisible().catch(() => false)) {
      await expect(presence).toContainText(/fountain|Piggy/i);
      await expect(page.getByTestId("harbor-controls-whisper")).toBeVisible();
    }

    // Opt-in Talk: near-Piggy CTA, myth fallback, or QA talkNpc (walk-up path).
    if (await talk.isVisible().catch(() => false)) {
      await talk.evaluate((el) => (el as HTMLElement).click());
    } else if (await mythTalk.isVisible().catch(() => false)) {
      await expect(myth).toHaveAttribute("data-fallback-mode", "myth_meet");
      await mythTalk.evaluate((el) => (el as HTMLElement).click());
    } else {
      await page.waitForFunction(() => Boolean(window.__QA__?.talkNpc), null, {
        timeout: 15_000,
      });
      await page.evaluate(() => window.__QA__!.talkNpc("piggy_penny"));
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
      { timeout: 8_000 },
    );
    await expect(page.getByTestId("talk-battle-screen")).toContainText(/WASD|walk pad/i);
    await expect(page.getByTestId("talk-battle-screen")).not.toContainText(/Outfitter/i);
    await expect(page.getByTestId("talk-battle-screen")).not.toContainText(
      /Harbor is yours\. Talk to locals/i,
    );

    // Finish Talk: listen → reply → Walk on.
    // Use element handles + force clicks — choice nodes remount and defeat auto-wait.
    await page.waitForTimeout(250); // TalkBattle input arm after open
    for (let step = 0; step < 8; step++) {
      if ((await page.getByTestId("talk-battle-screen").count()) === 0) break;
      const cont = await page.$('[data-testid="talk-battle-continue"]');
      if (cont) {
        const label = ((await cont.textContent()) || "").trim();
        await cont.evaluate((el) => (el as HTMLElement).click());
        await page.waitForTimeout(120);
        if (/Walk on/i.test(label)) break;
        continue;
      }
      const choice = await page.$('[data-testid^="talk-choice-"]');
      if (choice) {
        await choice.evaluate((el) => (el as HTMLElement).click());
        await page.waitForTimeout(120);
        continue;
      }
      await page.waitForTimeout(120);
    }
    await expect(page.getByTestId("talk-battle-screen")).toHaveCount(0, {
      timeout: 15_000,
    });

    // Voyage next: Carpet CTA, myth board, or map already open (Ashore → to_dock).
    const hubCarpet = page.getByTestId("hub-travel-map");
    const mythCarpet = page.getByTestId("fallback-board-carpet");
    const onMap = async () => {
      const chip = await page
        .getByTestId("fortune-archipelago-chip")
        .isVisible()
        .catch(() => false);
      const cove = await page
        .getByTestId("island-pin-coincraft_cove")
        .isVisible()
        .catch(() => false);
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
      return chip || cove || strip || flight || boardCta;
    };
    await expect
      .poll(async () => {
        if (await onMap()) return true;
        const hub = await hubCarpet.isVisible().catch(() => false);
        const myth = await mythCarpet.isVisible().catch(() => false);
        return hub || myth;
      }, { timeout: 20_000 })
      .toBe(true);

    if (await onMap()) {
      await expect(page.getByTestId("island-pin-coincraft_cove")).toBeVisible();
      return;
    }
    if (await hubCarpet.isVisible().catch(() => false)) {
      await hubCarpet.evaluate((el) => (el as HTMLElement).click());
    } else if (await mythCarpet.isVisible().catch(() => false)) {
      await expect(page.getByTestId("harbor-myth-fallback")).toHaveAttribute(
        "data-fallback-mode",
        "myth_travel",
      );
      await mythCarpet.evaluate((el) => (el as HTMLElement).click());
    }

    await expect.poll(onMap, { timeout: 20_000 }).toBe(true);
  });
});
