/**
 * Day-2 Spiral scar echo — Credit Take overnight craft.
 * Usage: node scripts/cold-day2-spiral-echo.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

async function wipe(page) {
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
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
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { organ: "spiral", steps: [], pass: false };

  try {
    await wipe(page);
    await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
    await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
    report.steps.push("boot_qa");

    await page.evaluate(async () => {
      await window.__QA__.seedSignatureLoop("piggy_ready", "spiral");
    });
    await page.waitForTimeout(400);
    report.steps.push("seed_piggy_ready_spiral");

    const before = await page.evaluate(() => {
      const s = window.__QA__.getSave();
      return { scar: s?.harborScars?.at(-1)?.id };
    });
    report.before = before;
    if (!before.scar?.startsWith("credit_")) {
      throw new Error(`Expected Credit scar before overnight, got ${before.scar}`);
    }

    await page.evaluate(() => window.__QA__.prepareDay2Echo());
    await page.waitForTimeout(500);
    report.steps.push("prepare_day2");

    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }

    const echo = page.getByTestId("day2-echo-surprise");
    await echo.waitFor({ state: "visible", timeout: 20_000 });
    report.steps.push("echo_visible");

    const kid = await page.getByTestId("day2-echo-kid-sentence").innerText();
    const retell = await page.getByTestId("day2-echo-retell").innerText();
    report.kid = kid;
    report.retell = retell;

    await page.getByRole("button", { name: /I hear them/i }).evaluate((el) => el.click());
    await echo.waitFor({ state: "hidden", timeout: 10_000 });
    report.steps.push("echo_dismissed");

    report.pass =
      /The Spiral withstands/i.test(kid) &&
      /Spiral withstands|Waited the spiral|wait/i.test(retell);

    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold-day2-spiral-echo.png",
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
        path: "/opt/cursor/artifacts/screenshots/cold-day2-spiral-echo-fail.png",
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
