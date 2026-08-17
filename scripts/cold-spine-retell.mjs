/**
 * Spine cold-retell polish:
 * For Coin · Clock · Spiral — seed spectacle → assert kid sentence on
 * spectacle + share. Then Memory via day-2 echo (Coin overnight).
 *
 * Usage: node scripts/cold-spine-retell.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

const ORGANS = [
  {
    id: "coin",
    kid: /The Coin holds/,
    retell: /Jar before treat/,
  },
  {
    id: "clock",
    kid: /The Clock shelters/,
    retell: /Umbrella before glitter/,
  },
  {
    id: "spiral",
    kid: /The Spiral withstands/,
    retell: /Waited the spiral/,
  },
];

async function wipe(page) {
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);
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
  if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await btn.evaluate((el) => el.click()).catch(() => {});
  }
}

async function assertOrganSpectacle(page, organ) {
  await wipe(page);
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  await page.evaluate(async (id) => {
    await window.__QA__.seedSignatureLoop("spectacle_ready", id);
  }, organ.id);
  await skip3d(page);

  const spectacle = page.getByTestId("scar-spectacle");
  await spectacle.waitFor({ state: "visible", timeout: 20_000 });
  // Kid sentence is in the DOM even during hush (sr-only until reveal).
  await page.getByTestId("scar-spectacle-kid-sentence").waitFor({ state: "attached", timeout: 5_000 });
  const kidText = await page.getByTestId("scar-spectacle-kid-sentence").innerText();
  if (!organ.kid.test(kidText)) {
    throw new Error(`${organ.id} spectacle kid mismatch: ${kidText}`);
  }
  const retellText = await page.getByTestId("scar-spectacle-retell").innerText();
  if (!organ.retell.test(retellText)) {
    throw new Error(`${organ.id} spectacle retell mismatch: ${retellText}`);
  }

  await spectacle.click({ force: true }).catch(() => {});
  const share = page.getByTestId("harbor-felt-share");
  await share.waitFor({ state: "visible", timeout: 12_000 });
  const shareKid = await page.getByTestId("harbor-felt-kid-sentence").innerText();
  if (!organ.kid.test(shareKid)) {
    throw new Error(`${organ.id} share kid mismatch: ${shareKid}`);
  }
  await page.getByTestId("harbor-felt-preview").waitFor({ state: "visible", timeout: 10_000 });
  await page.getByTestId("harbor-felt-keep-walking").evaluate((el) => el.click());
  return { organ: organ.id, kid: kidText, shareKid };
}

async function assertMemoryDay2(page) {
  await wipe(page);
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  await page.evaluate(async () => {
    await window.__QA__.seedSignatureLoop("day2_echo", "coin");
  });
  await skip3d(page);
  const echo = page.getByTestId("day2-echo-surprise");
  await echo.waitFor({ state: "visible", timeout: 20_000 });
  const headline = await page.locator('[data-testid="day2-echo-surprise"] h2').innerText();
  if (!/Coin holds|Clock shelters|Spiral withstands|Memory keeps/i.test(headline)) {
    throw new Error(`day2 Memory headline missing: ${headline}`);
  }
  const kid = await page.getByTestId("day2-echo-kid-sentence").innerText();
  if (!/The Coin holds|Memory keeps|The Clock shelters|The Spiral withstands/i.test(kid)) {
    throw new Error(`day2 kid missing organ: ${kid}`);
  }
  return { organ: "memory", headline, kid };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { steps: [], pass: false };

  try {
    for (const organ of ORGANS) {
      const result = await assertOrganSpectacle(page, organ);
      report.steps.push(result);
    }
    report.memory = await assertMemoryDay2(page);
    report.steps.push(report.memory);
    report.pass = report.steps.length === 4;

    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold-spine-retell.png",
      type: "png",
      fullPage: true,
    });
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exit(1);
  } catch (err) {
    report.error = String(err?.stack || err);
    console.log(JSON.stringify(report, null, 2));
    await page
      .screenshot({
        path: "/opt/cursor/artifacts/screenshots/cold-spine-retell-fail.png",
        type: "png",
        fullPage: true,
      })
      .catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
