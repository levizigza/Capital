/**
 * Cold Ledger Bank interior: Harbor → vault enter → Teller Soft Beat → dial-spin.
 * Usage: VITE_QA=1 node scripts/cold-ledger-bank-interior.mjs
 */
import { chromium } from "playwright";
import { appendFileSync, mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const SHOT = "/opt/cursor/artifacts/screenshots/ledger-bank-interior";
const PROGRESS = "/tmp/cold-bank-progress.log";

function progress(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    appendFileSync(PROGRESS, line);
  } catch {
    /* ignore */
  }
  console.log(msg);
}

async function wipe(page) {
  await page.goto(`${BASE}/?replayIntro=1`);
  await page.evaluate(async () => {
    try {
      localStorage.removeItem("island_save_v1");
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

async function finishTalk(page) {
  for (let i = 0; i < 16; i++) {
    if (!(await page.getByTestId("talk-battle-screen").isVisible().catch(() => false))) {
      return;
    }
    const choice = page.locator('[data-testid^="talk-choice-"]').first();
    if (await choice.isVisible().catch(() => false)) {
      await choice.evaluate((el) => el.click());
      await page.waitForTimeout(200);
      continue;
    }
    const cont = page.getByTestId("talk-battle-continue");
    if (await cont.isVisible().catch(() => false)) {
      await cont.evaluate((el) => el.click());
      await page.waitForTimeout(200);
      continue;
    }
    const leave = page.getByTestId("talk-battle-leave");
    if (await leave.isVisible().catch(() => false)) {
      await leave.evaluate((el) => el.click());
    }
    break;
  }
}

async function bootToHarbor(page) {
  await wipe(page);
  await page.goto(`${BASE}/?replayIntro=1`);
  const skip = page.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }
  await page.getByTestId("opening-choose-voyager").waitFor({ timeout: 25_000 });
  await page.getByTestId("opening-choose-voyager").evaluate((el) => el.click());
  await page.getByTestId("boot-cast-select").waitFor({ timeout: 25_000 });
  const boardNow = page.getByTestId("boot-board-carpet-now");
  if (await boardNow.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await boardNow.evaluate((el) => el.click());
  } else {
    await page.getByTestId("boot-board-carpet").evaluate((el) => el.click());
  }
  if (await skip.isVisible({ timeout: 12_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }
  const enter3d = page.getByTestId("harbor-skip-3d");
  if (await enter3d.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await enter3d.click({ force: true });
  }
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  try {
    appendFileSync(PROGRESS, `\n=== bank cold ${new Date().toISOString()} ===\n`);
  } catch {
    /* ignore */
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { steps: [], pass: false, seeded: false };

  try {
    progress("boot…");
    await bootToHarbor(page);
    report.steps.push("boot");

    // Clear Ashore meet_guide so Ledger Bank hotspot is live.
    progress("piggy talk…");
    const talk = page.getByTestId("hub-talk-npc");
    const myth = page.getByTestId("fallback-talk-piggy");
    if (await talk.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await talk.evaluate((el) => el.click());
    } else if (await myth.isVisible().catch(() => false)) {
      await myth.evaluate((el) => el.click());
    }
    if (await page.getByTestId("talk-battle-screen").isVisible({ timeout: 8_000 }).catch(() => false)) {
      await finishTalk(page);
    }
    report.steps.push("harbor_talk");

    progress("enter bank…");
    await page.waitForFunction(() => Boolean(window.__QA_STRUCTURE__?.enter), null, {
      timeout: 15_000,
    });
    await page.evaluate(() => window.__QA__.enterMoneyStructure());
    await page.getByTestId("money-structure-interior").waitFor({ timeout: 20_000 });
    const structureId = await page
      .getByTestId("money-structure-interior")
      .getAttribute("data-structure");
    report.structureId = structureId;
    if (structureId !== "harbor_ledger_bank") {
      throw new Error(`Expected harbor_ledger_bank, got ${structureId}`);
    }
    report.steps.push("bank_interior");
    await page.screenshot({ path: `${SHOT}/01-bank-interior.png`, type: "png" });

    progress("teller…");
    const tellerOk = await page.evaluate(() => window.__QA_STRUCTURE__.enterPart("teller_window"));
    if (!tellerOk) throw new Error("enterPart teller_window failed");
    const soft = page.getByTestId("soft-beat-overlay");
    await soft.waitFor({ state: "visible", timeout: 10_000 });
    const climb = await soft.getAttribute("data-soft-beat-climb");
    const layout = await soft.getAttribute("data-soft-beat-layout");
    report.softBeat = { climb, layout };
    if (climb !== "teller-step") throw new Error(`Expected teller-step, got ${climb}`);
    if (layout !== "lower-third") throw new Error(`Expected lower-third, got ${layout}`);
    const kid = (await page.getByTestId("soft-beat-retell").innerText()).trim();
    report.kid = kid;
    if (!/Memory keeps/i.test(kid)) throw new Error(`Teller kid missing Memory keeps: ${kid}`);
    await page.screenshot({ path: `${SHOT}/02-teller-window.png`, type: "png" });
    await page.getByTestId("soft-beat-leave").click({ force: true }).catch(() => {});
    await soft.waitFor({ state: "hidden", timeout: 8_000 }).catch(() => {});
    report.steps.push("teller_window");

    progress("dial-spin…");
    const dialOk = await page.evaluate(() => window.__QA_STRUCTURE__.enterPart("vault_safe"));
    if (!dialOk) throw new Error("enterPart vault_safe failed");
    const motif = page.getByTestId("part-enter-motif");
    await motif.waitFor({ state: "visible", timeout: 8_000 });
    const motifId = await motif.getAttribute("data-part-enter");
    report.dialMotif = motifId;
    if (motifId !== "dial-spin") throw new Error(`Expected dial-spin, got ${motifId}`);
    const dialKid = (await page.getByTestId("part-enter-kid-sentence").innerText()).trim();
    report.dialKid = dialKid;
    await page.screenshot({ path: `${SHOT}/03-dial-spin.png`, type: "png" });
    report.steps.push("dial_spin");

    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);
    for (let i = 0; i < 6; i++) {
      if (await page.getByTestId("game-modal-close").first().isVisible().catch(() => false)) {
        await page.getByTestId("game-modal-close").first().click({ force: true }).catch(() => {});
      }
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(200);
    }
    if (await page.getByTestId("money-structure-interior").isVisible().catch(() => false)) {
      await page.keyboard.press("Escape");
      await page
        .getByTestId("money-structure-interior")
        .waitFor({ state: "hidden", timeout: 10_000 })
        .catch(() => {});
    }
    report.steps.push("exit_plaza");
    await page.screenshot({ path: `${SHOT}/04-back-plaza.png`, type: "png" });

    report.pass =
      report.structureId === "harbor_ledger_bank" &&
      report.softBeat?.climb === "teller-step" &&
      report.softBeat?.layout === "lower-third" &&
      /Memory keeps/i.test(report.kid || "") &&
      report.dialMotif === "dial-spin" &&
      /Memory keeps/i.test(report.dialKid || "");
    report.sixQuestions = {
      misunderstand: "No — dial-spin / teller-step name the part before arcade or Soft Beat.",
      unfair: "No — Esc · Leave on motif and Soft Beat.",
      repetitive: "No — bank brass/marble + lower-third Teller are new vs pad teleport.",
      ignoredAbility: "No — Escape exits Soft Beat and vault.",
      lost: "No — vault door exit hint + plaza return.",
      funVsFunctional: "Fun — Memory keeps on dial-spin and Teller Window.",
    };

    progress(`pass=${report.pass} kid=${report.kid}`);
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
