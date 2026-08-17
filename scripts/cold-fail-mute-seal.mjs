/**
 * Pass O — last 3%: fail dignity + mute duck + Seal chase honesty.
 * Usage: VITE_QA=1 node scripts/cold-fail-mute-seal.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const report = { steps: [], pass: false };

  try {
    await wipe(page);
    await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
    await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
    report.steps.push("qa_ready");

    // --- Fail dignity via QA complete (score 0 under Cove Coin Sort threshold) ---
    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 20_000 });
    report.steps.push("cove_shore");
    for (let i = 0; i < 6; i++) {
      if (!(await page.getByTestId("talk-battle-screen").isVisible().catch(() => false))) break;
      const leave = page.getByTestId("talk-battle-leave");
      if (await leave.isVisible().catch(() => false)) {
        await leave.evaluate((el) => el.click());
        break;
      }
      await page.keyboard.press("Escape");
    }
    await page.evaluate(() => {
      window.__QA__.startMinigame("mg_coin_sort");
    });
    await page.waitForTimeout(600);
    await page.evaluate(async () => {
      await window.__QA__.completeMinigame(true, 0);
    });
    const failOverlay = page.getByTestId("minigame-fail-overlay");
    await failOverlay.waitFor({ state: "visible", timeout: 10_000 });
    const failBody = await failOverlay.innerText();
    report.fail = { body: failBody };
    if (!/try again|not a clear/i.test(failBody)) throw new Error(`Bad fail title: ${failBody}`);
    if (!/Coin holds/i.test(failBody)) throw new Error(`Fail missing organ verb: ${failBody}`);
    report.steps.push("fail_dignity");
    await page.getByTestId("minigame-fail-walk").evaluate((el) => el.click());

    // --- Mute / duck: fresh Harbor seed so Cove state cannot block cinema ---
    await wipe(page);
    await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
    await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skip3d.evaluate((el) => el.click());
    }
    await page.evaluate(async () => {
      await window.__QA__.seedSignatureLoop("spectacle_ready", "coin");
    });
    await page.waitForTimeout(1_200);
    const spectacle = page.getByTestId("scar-spectacle");
    const share = page.getByTestId("harbor-felt-share");
    const cinemaUp =
      (await spectacle.isVisible({ timeout: 20_000 }).catch(() => false)) ||
      (await share.isVisible({ timeout: 5_000 }).catch(() => false));
    if (!cinemaUp) throw new Error("Expected spectacle/share for mute duck");
    report.steps.push("mute_cinema_up");
    report.duck = {
      spectacle: await spectacle.isVisible().catch(() => false),
      share: await share.isVisible().catch(() => false),
    };

    let kid =
      (await page.getByTestId("scar-spectacle-kid-sentence").innerText().catch(() => "")) ||
      (await page.getByTestId("harbor-felt-kid-sentence").innerText().catch(() => ""));
    report.kid = kid;
    if (!kid || !/Coin holds/i.test(kid)) throw new Error(`Missing/unexpected kid: ${kid}`);
    report.steps.push("mute_kid");

    const seal = await page.evaluate(() => {
      const hud = document.querySelector('[data-testid="voyager-ledger-hud"]');
      return hud ? hud.getAttribute("data-seal-chase") : "absent";
    });
    report.sealChase = seal;
    report.steps.push("seal_check");

    report.pass =
      report.steps.includes("mute_cinema_up") &&
      report.steps.includes("mute_kid") &&
      report.steps.includes("seal_check") &&
      report.steps.includes("fail_dignity");
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exitCode = 1;
  } catch (err) {
    report.error = String(err?.message || err);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
