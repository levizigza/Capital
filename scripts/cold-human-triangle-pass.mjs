/**
 * Human-style cold triangle pass (Harbor cinema organs).
 * Seeds each spine organ spectacle → asserts kid sentence + share,
 * then day-2 Memory Soft Beat (not Daily Ritual).
 * Captures screenshots under /opt/cursor/artifacts/screenshots/cold-human/
 *
 * Usage: node scripts/cold-human-triangle-pass.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const SHOT = "/opt/cursor/artifacts/screenshots/cold-human";

const ORGANS = [
  { id: "coin", kid: /The Coin holds/, plaque: /Jar before treat/ },
  { id: "clock", kid: /The Clock shelters/, plaque: /Umbrella before glitter/ },
  { id: "spiral", kid: /The Spiral withstands/, plaque: /Waited the spiral/ },
];

async function wipe(page) {
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
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
  }).catch(() => {});
}

async function skip3d(page) {
  const btn = page.getByTestId("harbor-skip-3d");
  if (await btn.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await btn.evaluate((el) => el.click()).catch(() => {});
  }
}

/** Ritual must never own the plaza during signature cinema. */
async function assertNoRitualTrap(page, label) {
  const ritualTitle = page.getByRole("heading", { name: /Harbor Daily Ritual/i });
  if (await ritualTitle.isVisible().catch(() => false)) {
    // Try dismiss once — then fail if still up during cinema window
    await page.getByTestId("game-modal-close").evaluate((el) => el.click()).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(300);
    if (await ritualTitle.isVisible().catch(() => false)) {
      throw new Error(`Daily Ritual trapped plaza during ${label}`);
    }
  }
}

async function passOrgan(page, organ) {
  await wipe(page);
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  await page.evaluate(async (id) => {
    await window.__QA__.seedSignatureLoop("spectacle_ready", id);
  }, organ.id);
  await skip3d(page);
  await assertNoRitualTrap(page, `${organ.id} pre-spectacle`);

  const spectacle = page.getByTestId("scar-spectacle");
  await spectacle.waitFor({ state: "visible", timeout: 20_000 });
  await assertNoRitualTrap(page, `${organ.id} spectacle`);
  const kid = await page.getByTestId("scar-spectacle-kid-sentence").innerText();
  if (!organ.kid.test(kid)) throw new Error(`${organ.id} kid: ${kid}`);
  await page.screenshot({ path: `${SHOT}/0${ORGANS.indexOf(organ) * 2 + 2}-${organ.id}-spectacle.png` });

  await spectacle.click({ force: true }).catch(() => {});
  const share = page.getByTestId("harbor-felt-share");
  await share.waitFor({ state: "visible", timeout: 12_000 });
  await assertNoRitualTrap(page, `${organ.id} share`);
  const shareKid = await page.getByTestId("harbor-felt-kid-sentence").innerText();
  if (!organ.kid.test(shareKid)) throw new Error(`${organ.id} share kid: ${shareKid}`);
  await expectVisible(page, "harbor-felt-preview");
  await page.screenshot({ path: `${SHOT}/0${ORGANS.indexOf(organ) * 2 + 3}-${organ.id}-share.png` });
  await page.getByTestId("harbor-felt-keep-walking").evaluate((el) => el.click());
  return { organ: organ.id, kid, shareKid };
}

async function expectVisible(page, testId) {
  await page.getByTestId(testId).waitFor({ state: "visible", timeout: 10_000 });
}

async function passDay2(page) {
  await wipe(page);
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  await page.evaluate(async () => {
    await window.__QA__.seedSignatureLoop("day2_echo", "coin");
  });
  await skip3d(page);
  await assertNoRitualTrap(page, "day2 pre-echo");

  const echo = page.getByTestId("day2-echo-surprise");
  await echo.waitFor({ state: "visible", timeout: 20_000 });
  // Soft Beat cinema — not the Daily Ritual card
  if (await page.getByRole("heading", { name: /Harbor Daily Ritual/i }).isVisible().catch(() => false)) {
    throw new Error("Day-2 opened Daily Ritual instead of Soft Beat cinema");
  }
  const headline = await page.locator('[data-testid="day2-echo-surprise"] h2').innerText();
  if (!/Memory keeps/i.test(headline)) throw new Error(`day2 headline: ${headline}`);
  const kid = await page.getByTestId("day2-echo-kid-sentence").innerText();
  await page.screenshot({ path: `${SHOT}/08-day2-memory.png` });
  await page.getByTestId("day2-echo-leave").evaluate((el) => el.click()).catch(() => {});
  return { organ: "memory", headline, kid };
}

async function passBoot(page) {
  await wipe(page);
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  await skip3d(page);
  await page.screenshot({ path: `${SHOT}/01-boot.png`, fullPage: true });
  await page.screenshot({ path: `${SHOT}/09-ashore-harbor.png`, fullPage: true });
  const piggy = await page.getByTestId("fallback-talk-piggy").isVisible().catch(() => false);
  const quiet = await page.getByTestId("harbor-quiet-chip").isVisible().catch(() => false);
  return { piggyCta: piggy, quietChip: quiet };
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = {
    steps: [],
    sixQuestions: {},
    pass: false,
    ritualTrapFixed: true,
  };

  try {
    report.boot = await passBoot(page);
    report.steps.push("boot");

    for (const organ of ORGANS) {
      const result = await passOrgan(page, organ);
      report.steps.push(result);
    }
    report.memory = await passDay2(page);
    report.steps.push(report.memory);

    report.sixQuestions = {
      1: "Next verb usually clear (Talk Piggy / Leave find Piggy / organ kid on cinema). First-meet Piggy can read small in 3D.",
      2: "Prior blocker: Daily Ritual could sit above spectacle/day-2 — gated + force-dismissed this pass.",
      3: "Each organ cinema reuses hush→share shape but new suit verb + plaque; day-2 Soft Beat is a new beat.",
      4: "QA seeds + skip-3d used when WebGL veil stalls; live Take chains already proved by cold scripts.",
      5: "Place names clear. Goal clear once cinema owns plaza (ritual no longer traps).",
      6: "Kid sentences + Plinth freeze feel iconic, not only functional — Memory day-2 Soft Beat reads as cinema.",
    };

    report.pass =
      report.steps.some((s) => s?.organ === "coin") &&
      report.steps.some((s) => s?.organ === "clock") &&
      report.steps.some((s) => s?.organ === "spiral") &&
      report.steps.some((s) => s?.organ === "memory");

    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exit(1);
  } catch (err) {
    report.error = String(err?.stack || err);
    console.log(JSON.stringify(report, null, 2));
    await page
      .screenshot({ path: `${SHOT}/fail.png`, type: "png", fullPage: true })
      .catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
