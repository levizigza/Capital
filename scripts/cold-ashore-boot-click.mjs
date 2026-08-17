/**
 * Cold boot: real mouse clicks through Title → Cast → Ashore Fantasy.
 * Fails if the title CTA is still animation-unstable (the old bob soft-lock).
 *
 * Usage: node scripts/cold-ashore-boot-click.mjs
 * Requires: http://127.0.0.1:5000 with VITE_QA=1
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const SHOT = "/opt/cursor/artifacts/screenshots/cold-ashore-boot";

mkdirSync(SHOT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await page.goto(`${BASE}/?replayIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const skip = page.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }

  await page.getByTestId("opening-choose-voyager").waitFor({ state: "visible", timeout: 20_000 });
  await page.screenshot({ path: `${SHOT}/01-title.png` });

  // Real mouse — no evaluate. This is the bug users hit.
  await page.getByTestId("opening-choose-voyager").click({ timeout: 8_000 });
  await page.getByTestId("boot-cast-select").waitFor({ state: "visible", timeout: 15_000 });
  await page.screenshot({ path: `${SHOT}/02-cast.png` });

  await page.getByTestId("boot-board-carpet-now").click({ timeout: 8_000 });
  await page.locator('[data-teach-mode="chamber-00"]').waitFor({ state: "visible", timeout: 15_000 });
  await page.screenshot({ path: `${SHOT}/03-ashore-fantasy.png` });

  await page.getByTestId("ashore-fantasy-toy-memory").click({ force: true });
  await page.waitForTimeout(400);
  await page.getByTestId("ashore-teach-continue").click({ timeout: 5_000 });
  await page.waitForTimeout(600);
  const step = await page.locator("[data-teach-step]").getAttribute("data-teach-step");
  if (step !== "walk") {
    throw new Error(`Expected walk chamber, got ${step}`);
  }
  await page.screenshot({ path: `${SHOT}/04-walk.png` });

  // Keyboard path: reload title and Enter (window listener — no focus required).
  await page.goto(`${BASE}/?replayIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const skip2 = page.getByRole("button", { name: /^Skip$/i });
  if (await skip2.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await skip2.click({ force: true });
  }
  await page.getByTestId("opening-choose-voyager").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  await page.getByTestId("boot-cast-select").waitFor({ state: "visible", timeout: 15_000 });

  console.log(
    JSON.stringify(
      {
        pass: true,
        titleMouseClick: true,
        titleKeyboardEnter: true,
        castContinue: true,
        ashoreFantasy: true,
        walkChamber: true,
      },
      null,
      2,
    ),
  );
} catch (e) {
  await page.screenshot({ path: `${SHOT}/FAIL.png` }).catch(() => {});
  console.error(JSON.stringify({ pass: false, error: String(e) }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
