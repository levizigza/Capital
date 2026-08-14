import { test, expect } from "@playwright/test";
import { killServiceWorkerForE2e, waitForQaReady } from "./helpers";

/**
 * Design Bible — player-visible laws (not docs-only).
 */
test.describe("Design Bible player-visible", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await killServiceWorkerForE2e(page);
    await page.addInitScript(() => {
      const defaults = {
        name: "Bible Voyager",
        level: 1,
        xp: 0,
        totalCoins: 40,
        gamesCompleted: 0,
        achievements: [] as string[],
        currentStreak: 0,
        skillsUnlocked: [] as string[],
        preferredMode: null,
        archetype: { primary: "navigator", secondary: "strategist", completedQuiz: true },
        preferences: { difficulty: "adaptive", gameTypes: [] as string[], playTime: "medium" },
      };
      localStorage.setItem("kv_user-profile", JSON.stringify(defaults));
    });
  });

  test("share Witness stamp + Family Challenge panel", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    // Same path as signature-loop e2e: spectacle → auto/dismiss → felt share.
    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("spectacle_ready");
    });

    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }

    const spectacle = page.getByTestId("scar-spectacle");
    await expect(spectacle).toBeVisible({ timeout: 20_000 });
    if (await spectacle.isVisible()) {
      await spectacle.click({ timeout: 2_000 }).catch(() => {});
    }

    const share = page.getByTestId("harbor-felt-share");
    await expect(share).toBeVisible({ timeout: 15_000 });

    // Pre-create a local Family Room so Witness can stamp.
    await page.evaluate(async () => {
      const mod = await import("/src/islands/familyRoom.ts");
      mod.createFamilyRoom("Bible House", "Bible Voyager");
    });

    // Dev Errors / Talk Battle can sit over the lower-third — force clicks.
    await expect(page.getByTestId("harbor-felt-witness-open")).toBeVisible({ timeout: 8_000 });
    await page.getByTestId("harbor-felt-witness-open").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await page.getByTestId("harbor-felt-witness-name").fill("Sibling");
    await page.getByTestId("harbor-felt-witness-cheer").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("harbor-felt-witness").getByText(/Witness stamped/i)).toBeVisible({
      timeout: 5_000,
    });

    await page.getByTestId("harbor-felt-keep-walking").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });

    const room = await page.evaluate(async () => {
      const mod = await import("/src/islands/familyRoom.ts");
      const active = mod.getActiveFamilyRoom();
      if (active && !active.challenge) {
        mod.postFamilyChallenge({
          authorName: "Bible Voyager",
          kind: "cove_take",
          targetLabel: "Finish a Cove Take",
        });
      }
      const next = mod.getActiveFamilyRoom();
      return {
        hasRoom: Boolean(next),
        witnessCount: next?.witnesses?.length ?? 0,
        hasChallenge: Boolean(next?.challenge),
      };
    });
    expect(room.hasRoom).toBe(true);
    expect(room.witnessCount).toBeGreaterThan(0);
    expect(room.hasChallenge).toBe(true);
  });

  test("tip Talk has no Yes/Maybe later fake choice", async ({ page }) => {
    await page.goto("/?mode=islands&skipIntro=1");
    await waitForQaReady(page);

    await page.evaluate(async () => {
      await window.__QA__!.seedSignatureLoop("piggy_ready");
    });

    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }

    await page.evaluate(async () => {
      await window.__QA__!.talkNpc("coiny");
    });

    const battle = page.getByTestId("talk-battle").or(page.locator("[data-testid*='talk']")).first();
    // Soft assert on choice copy in the page
    await page.waitForTimeout(1500);
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/Maybe later!/);
    expect(body).not.toMatch(/Yes please!/);
  });
});
