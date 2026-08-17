/**
 * Semi-automated cold path: Ashore Talk → Cove → jar CTA → Kira Take → Harbor retell.
 * Usage: VITE_QA=1 node scripts/cold-ashore-cove-retell.mjs
 * Requires app at http://127.0.0.1:5000 with VITE_QA=1 (or DEV).
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

async function wipe(page) {
  await page.goto(`${BASE}/?replayIntro=1`);
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

async function clickTestId(page, id, timeout = 8_000) {
  const loc = page.getByTestId(id);
  await loc.waitFor({ state: "visible", timeout });
  await loc.evaluate((el) => el.click());
}

async function finishTalk(page) {
  for (let i = 0; i < 10; i++) {
    if (!(await page.getByTestId("talk-battle-screen").isVisible().catch(() => false))) {
      return;
    }
    const choice = page.locator('[data-testid^="talk-choice-"]').first();
    if (await choice.isVisible().catch(() => false)) {
      await choice.evaluate((el) => el.click());
      continue;
    }
    const cont = page.getByTestId("talk-battle-continue");
    if (await cont.isVisible().catch(() => false)) {
      await cont.evaluate((el) => el.click());
      continue;
    }
    break;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const report = { steps: [], pass: false };

  try {
    await wipe(page);
    await page.goto(`${BASE}/?replayIntro=1`);

    const skip = page.getByRole("button", { name: /^Skip$/i });
    if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await skip.click({ force: true });
    }

    await page.getByTestId("opening-choose-voyager").waitFor({ timeout: 20_000 });
    await page.getByTestId("opening-choose-voyager").evaluate((el) => el.click());
    await page.getByTestId("boot-cast-select").waitFor({ timeout: 20_000 });

    const boardNow = page.getByTestId("boot-board-carpet-now");
    if (await boardNow.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await boardNow.evaluate((el) => el.click());
    } else {
      await page.getByTestId("boot-board-carpet").evaluate((el) => el.click());
    }
    report.steps.push("boot_carpet");

    // Ashore teach may own the first harbor beat — skip or continue into plaza.
    const ashSkip = page.getByTestId("ashore-teach-skip");
    if (await ashSkip.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await ashSkip.evaluate((el) => el.click());
      report.steps.push("ashore_skip");
    } else {
      const ashCont = page.getByTestId("ashore-teach-continue");
      for (let i = 0; i < 8; i++) {
        if (!(await ashCont.isVisible().catch(() => false))) break;
        await ashCont.evaluate((el) => el.click());
        await page.waitForTimeout(400);
      }
    }

    if (await skip.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await skip.click({ force: true });
    }
    const enter = page.getByTestId("harbor-skip-3d");
    if (await enter.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await enter.click({ force: true });
    }

    // Wait QA (IslandsApp mounts after Ashore dismisses)
    await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, {
      timeout: 45_000,
    });
    report.steps.push("qa_ready");

    // Prefer live Talk CTA; else QA talkNpc so Piggy meet isn't a soft-lock.
    const talk = page.getByTestId("hub-talk-npc");
    const mythTalk = page.getByTestId("fallback-talk-piggy");
    let talked = false;
    for (let i = 0; i < 12 && !talked; i++) {
      await page.keyboard.down("w");
      await page.waitForTimeout(280);
      await page.keyboard.up("w");
      await page.waitForTimeout(120);
      if (await talk.isVisible().catch(() => false)) {
        await talk.evaluate((el) => el.click());
        talked = true;
        break;
      }
    }
    if (!talked && (await mythTalk.isVisible().catch(() => false))) {
      await mythTalk.evaluate((el) => el.click());
      talked = true;
    }
    if (!talked) {
      await page.evaluate(async () => {
        await window.__QA__.talkNpc("piggy_penny");
      });
    }
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 20_000 });
    await finishTalk(page);
    report.steps.push("harbor_talk");

    // Instant Cove dock (avoids flaky 3D map click for this cold script)
    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("cove_shore");

    // Walk toward jar (spawn +Z, jar ~-7) — hold W, poll for Squeeze CTA
    let label = "";
    for (let i = 0; i < 20; i++) {
      await page.keyboard.down("w");
      await page.waitForTimeout(350);
      await page.keyboard.up("w");
      await page.waitForTimeout(150);
      const interact = page.getByTestId("shore-interact");
      if (await interact.isVisible().catch(() => false)) {
        label = (await interact.innerText()).trim();
        if (/squeeze|slot|coin jar/i.test(label)) break;
      }
    }
    report.jarCta = label;
    if (!/squeeze|slot|coin jar/i.test(label)) {
      throw new Error(`Expected jar Squeeze CTA, got: ${label || "(none)"}`);
    }
    await page.getByTestId("shore-interact").evaluate((el) => el.click());
    await page.waitForTimeout(1_200);
    // Interior or enter transition — Escape back if needed
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    report.steps.push("jar_enter_cta");

    // Signature Take via Kira dialogue effects — seed after proving jar CTA,
    // then carpet home for Harbor retell (full Penny→sort is a separate human beat).
    await page.evaluate(async () => {
      await window.__QA__.seedSignatureLoop("spectacle_ready");
    });
    await page.waitForTimeout(800);

    // Ensure on Harbor for spectacle
    const spectacle = page.getByTestId("scar-spectacle");
    const share = page.getByTestId("harbor-felt-share");
    const retell =
      (await spectacle.isVisible({ timeout: 20_000 }).catch(() => false)) ||
      (await share.isVisible({ timeout: 5_000 }).catch(() => false));
    if (!retell) {
      // maybe still on cove hush — open travel / hub
      await page.evaluate(() => window.__QA__?.openHub?.());
      await page.waitForTimeout(1_000);
    }

    let kid = "";
    if (await page.getByTestId("scar-spectacle-retell").isVisible().catch(() => false)) {
      kid = await page.getByTestId("scar-spectacle-retell").innerText();
    }
    if (await page.getByTestId("harbor-felt-retell").isVisible().catch(() => false)) {
      kid = await page.getByTestId("harbor-felt-retell").innerText();
    }
    if (await page.getByTestId("harbor-felt-kid-sentence").isVisible().catch(() => false)) {
      kid += " | " + (await page.getByTestId("harbor-felt-kid-sentence").innerText());
    }
    report.kid = kid;
    report.steps.push("harbor_retell");
    report.pass = /Coin|holds|Harbor|remembered|Jar/i.test(kid) || retell;

    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold5-script-retell.png",
      fullPage: true,
      type: "png",
    });
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exit(1);
  } catch (err) {
    report.error = String(err);
    console.log(JSON.stringify(report, null, 2));
    await page
      .screenshot({
        path: "/opt/cursor/artifacts/screenshots/cold5-script-fail.png",
        fullPage: true,
        type: "png",
      })
      .catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
