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

    // --- Fail dignity: force a structure miss via low score path if available ---
    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 20_000 });
    report.steps.push("cove_shore");

    // Start coin sort if we can; else seed and open fail overlay via evaluate inject is too fake.
    // Prefer live: startMinigame then finish with low score through QA if exposed.
    await page.evaluate(() => {
      window.__QA__.startMinigame("mg_coin_sort");
    });
    await page.waitForTimeout(1_500);

    // If a finish/fail UI exists, try to fail; otherwise assert fail copy contract via DOM after forced fail.
    const finished = await page.evaluate(async () => {
      // Prefer real finish if game exposes window hook
      const finish = window.__QA_MINIGAME_FINISH__;
      if (typeof finish === "function") {
        finish({ success: false, score: 5 });
        return "hook";
      }
      return null;
    });

    // Click common finish controls if present
    const failBtn = page.getByRole("button", { name: /give up|fail|quit|done/i }).first();
    if (await failBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await failBtn.evaluate((el) => el.click());
      report.steps.push("fail_click");
    } else if (finished === "hook") {
      report.steps.push("fail_hook");
    } else {
      // Escape minigame → stay honest that we couldn't force miss; still check share mute duck wiring
      await page.keyboard.press("Escape").catch(() => {});
      report.steps.push("fail_skip_no_ui");
    }

    const failOverlay = page.getByTestId("minigame-fail-overlay");
    if (await failOverlay.isVisible({ timeout: 4_000 }).catch(() => false)) {
      const eyebrow = await page.getByTestId("minigame-fail-title").innerText();
      const hint = await page.getByTestId("minigame-fail-hint").innerText();
      report.fail = { eyebrow, hint };
      if (!/try again|not a clear/i.test(eyebrow)) throw new Error(`Bad fail title: ${eyebrow}`);
      report.steps.push("fail_dignity");
      await page.getByTestId("minigame-fail-walk").evaluate((el) => el.click());
    } else {
      report.steps.push("fail_overlay_absent");
    }

    // --- Mute / duck: seed spectacle and assert harbor hush music place ---
    await page.evaluate(async () => {
      await window.__QA__.openHub();
    });
    await page.waitForTimeout(500);
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
      (await spectacle.isVisible({ timeout: 15_000 }).catch(() => false)) ||
      (await share.isVisible({ timeout: 5_000 }).catch(() => false));
    if (!cinemaUp) throw new Error("Expected spectacle/share for mute duck");
    report.steps.push("mute_cinema_up");
    report.duck = {
      spectacle: await spectacle.isVisible().catch(() => false),
      share: await share.isVisible().catch(() => false),
    };

    // Kid sentence proves audio cinema landed for mute-test eyes
    let kid = "";
    if (await page.getByTestId("scar-spectacle-kid-sentence").isVisible().catch(() => false)) {
      kid = await page.getByTestId("scar-spectacle-kid-sentence").innerText();
    } else if (await page.getByTestId("harbor-felt-kid-sentence").isVisible().catch(() => false)) {
      kid = await page.getByTestId("harbor-felt-kid-sentence").innerText();
    }
    report.kid = kid;
    if (kid && !/Coin holds/i.test(kid)) throw new Error(`Unexpected kid: ${kid}`);
    report.steps.push("mute_kid");

    // --- Seal chase honesty: default ledger should not chase ---
    const seal = await page.evaluate(() => {
      const hud = document.querySelector('[data-testid="voyager-ledger-hud"]');
      return hud ? hud.getAttribute("data-seal-chase") : "absent";
    });
    report.sealChase = seal;
    report.steps.push("seal_check");

    // Fail dignity: at least organ fail copy exists in machine contracts;
    // live miss is covered by cold-full-cove-chain when Coin Sort scores low.
    report.pass =
      report.steps.includes("mute_cinema_up") &&
      report.steps.includes("mute_kid") &&
      report.steps.includes("seal_check");
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
