/**
 * Cold Ashore Chamber-00 → Carpet → Harbor first meet.
 * Real mouse clicks. Quality gate for tutorial craft.
 *
 * Usage: node scripts/cold-ashore-full-teach.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const SHOT = "/opt/cursor/artifacts/screenshots/cold-ashore-full";
mkdirSync(SHOT, { recursive: true });

const steps = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => steps.push({ pageerror: e.message }));

async function shot(name) {
  await page.screenshot({ path: `${SHOT}/${name}.png` });
}

try {
  await page.goto(`${BASE}/?replayIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const skip = page.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }

  await page.getByTestId("opening-choose-voyager").waitFor({ state: "visible", timeout: 20_000 });
  await page.getByTestId("opening-choose-voyager").click({ timeout: 8_000 });
  steps.push("title_mouse");
  await shot("01-cast");

  await page.getByTestId("boot-board-carpet-now").click({ timeout: 8_000 });
  await page.locator('[data-teach-mode="chamber-00"][data-teach-step="fantasy"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
  if ((await page.getByTestId("voyager-walk-practice").count()) > 0) {
    throw new Error("Fantasy still mounts WebGL practice pad");
  }
  steps.push("fantasy");
  await shot("02-fantasy");

  await page.getByTestId("ashore-fantasy-toy-memory").click();
  await page.getByTestId("ashore-teach-continue").click();
  await page.locator('[data-teach-step="walk"]').waitFor({ state: "visible", timeout: 10_000 });
  steps.push("walk");
  await shot("03-walk");

  await page.getByTestId("ashore-walk-claim-right").click({ force: true });
  await page.getByTestId("ashore-walk-claim-left").click({ force: true });
  await page.getByTestId("ashore-walk-claim-forward").click({ force: true });

  await page.locator('[data-teach-step="talk"]').waitFor({ state: "visible", timeout: 15_000 });
  steps.push("talk");
  await shot("04-talk");

  await page.getByTestId("ashore-talk-approach").click({ force: true });
  await page.getByTestId("ashore-teach-talk").click({ force: true });

  await page.locator('[data-teach-step="dock"]').waitFor({ state: "visible", timeout: 15_000 });
  steps.push("dock");
  await shot("05-dock");

  await page.getByTestId("ashore-carpet-board-cove").click({ timeout: 8_000 });
  await page.getByTestId("ashore-teach-continue").click();
  await page.locator('[data-teach-step="ready"]').waitFor({ state: "visible", timeout: 10_000 });
  steps.push("ready");
  await shot("06-ready");

  await page.getByTestId("ashore-teach-continue").click();
  await page.waitForTimeout(2500);
  await shot("07-after-launch");

  const skip3d = page.getByTestId("harbor-skip-3d");
  if (await skip3d.isVisible({ timeout: 12_000 }).catch(() => false)) {
    await skip3d.click({ force: true });
    steps.push("skip3d");
  }

  await page.waitForTimeout(2500);
  await shot("08-harbor");

  const quietVisible = await page.getByTestId("harbor-quiet-chip").isVisible().catch(() => false);
  const teachGone = (await page.getByTestId("ashore-comprehension-tutorial").count()) === 0;
  const castGone = (await page.getByTestId("boot-cast-select").count()) === 0;
  if (!teachGone || !castGone) {
    throw new Error("Boot overlays still mounted on Harbor");
  }

  const presence = await page.getByTestId("harbor-piggy-presence").isVisible().catch(() => false);
  const coachCount = await page.getByTestId("castle-grounds-coach").count();
  const ambushTalk = await page.getByTestId("hub-talk-npc").isVisible().catch(() => false);
  if (!presence) throw new Error("Expected harbor-piggy-presence on first meet");
  if (coachCount > 0) throw new Error("Castle coach must not stack on meet_guide");
  if (ambushTalk) throw new Error("Talk CTA must not ambush before near Piggy");

  console.log(
    JSON.stringify(
      {
        pass: true,
        steps,
        harbor: {
          quietChip: quietVisible,
          teachGone,
          castGone,
          presence,
          coachMuted: coachCount === 0,
          noAmbushTalk: !ambushTalk,
        },
      },
      null,
      2,
    ),
  );
} catch (e) {
  await shot("FAIL");
  console.error(JSON.stringify({ pass: false, error: String(e), steps }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
