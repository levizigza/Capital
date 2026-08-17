/**
 * Cold path: Chamber-00 Ashore → Harbor Talk → Cove Penny → Sort → Kira Take → Harbor retell.
 * Prefer real mouse for Ashore; QA helpers for Cove walk flakiness (same as cold-full-cove-chain).
 *
 * Usage: VITE_QA=1 node scripts/cold-ashore-cove-retell.mjs
 * Requires app at http://127.0.0.1:5000 with VITE_QA=1.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const SHOT = "/opt/cursor/artifacts/screenshots/cold-ashore-cove-retell";
mkdirSync(SHOT, { recursive: true });

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

async function finishTalk(page) {
  for (let i = 0; i < 20; i++) {
    if (!(await page.getByTestId("talk-battle-screen").isVisible().catch(() => false))) {
      return;
    }
    try {
      const choice = page.locator('[data-testid^="talk-choice-"]').first();
      if ((await choice.count()) && (await choice.isVisible().catch(() => false))) {
        await choice.click({ force: true, timeout: 3_000 });
        await page.waitForTimeout(250);
        continue;
      }
      const cont = page.getByTestId("talk-battle-continue");
      if ((await cont.count()) && (await cont.isVisible().catch(() => false))) {
        await cont.click({ force: true, timeout: 3_000 });
        await page.waitForTimeout(250);
        continue;
      }
      const leave = page.getByTestId("talk-battle-leave");
      if (await leave.isVisible().catch(() => false)) {
        await leave.click({ force: true, timeout: 3_000 });
        await page.waitForTimeout(250);
      }
    } catch {
      await page.waitForTimeout(200);
      continue;
    }
  }
  await page
    .getByTestId("talk-battle-screen")
    .waitFor({ state: "hidden", timeout: 8_000 })
    .catch(async () => {
      const leave = page.getByTestId("talk-battle-leave");
      if (await leave.isVisible().catch(() => false)) {
        await leave.click({ force: true });
      }
    });
}

async function talkNpc(page, npcId, preferChoice) {
  await page.evaluate((id) => window.__QA__.talkNpc(id), npcId);
  await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
  await page.getByTestId("talk-battle-continue").evaluate((el) => el.click()).catch(() => {});
  await page.waitForTimeout(250);
  if (preferChoice) {
    const choice = page
      .locator('[data-testid^="talk-choice-"]')
      .filter({ hasText: preferChoice })
      .first();
    if (await choice.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await choice.evaluate((el) => el.click());
    } else {
      const any = page.locator('[data-testid^="talk-choice-"]').first();
      if (await any.isVisible().catch(() => false)) await any.evaluate((el) => el.click());
    }
  }
  await finishTalk(page);
}

async function passMasteryQuiz(page) {
  const quiz = page.getByTestId("mastery-quiz");
  await quiz.waitFor({ state: "visible", timeout: 12_000 });

  // gate_coin_sort: correctIndex is 1 for q1/q2/q3 — click via Playwright so React state updates.
  for (const qid of ["q1", "q2", "q3"]) {
    await page.getByTestId(`mastery-choice-${qid}-1`).click({ force: true });
    await page.waitForTimeout(80);
  }
  await page.waitForFunction(() => {
    const sub = document.querySelector('[data-testid="mastery-quiz-submit"]');
    return sub instanceof HTMLButtonElement && !sub.disabled;
  }, null, { timeout: 5_000 });

  await page.getByTestId("mastery-quiz-submit").click({ force: true });
  await page.waitForFunction(
    () => {
      const quizEl = document.querySelector('[data-testid="mastery-quiz"]');
      if (!quizEl) return true;
      return /All correct|block unlocked/i.test(quizEl.textContent || "");
    },
    null,
    { timeout: 8_000 },
  );
  await page.waitForFunction(
    () => (window.__QA__?.getSave()?.completedMinigames || []).includes("mg_coin_sort"),
    null,
    { timeout: 12_000 },
  );
  // Modal may keep quiz briefly — wait for modal or quiz to clear.
  await page
    .getByTestId("mastery-quiz")
    .waitFor({ state: "hidden", timeout: 15_000 })
    .catch(() => {});
  await page
    .getByTestId("minigame-modal")
    .waitFor({ state: "hidden", timeout: 15_000 })
    .catch(() => {});
}

async function playCoinSort(page) {
  if (await page.getByTestId("talk-battle-screen").isVisible().catch(() => false)) {
    await finishTalk(page);
  }
  await page.getByTestId("minigame-modal").waitFor({ timeout: 15_000 });
  await page
    .getByTestId("minigame-modal")
    .getByRole("button", { name: /Finish round|Sort Crates|Submit/i })
    .first()
    .waitFor({ state: "visible", timeout: 25_000 });

  for (let i = 0; i < 6; i++) {
    const earn = page
      .getByTestId("minigame-modal")
      .getByRole("button", { name: /Sort Crates|Clean the Deck|Deliver Mail|\(\+\$/i })
      .first();
    if (await earn.isVisible().catch(() => false)) {
      await earn.evaluate((el) => el.click());
      await page.waitForTimeout(100);
    } else break;
  }

  for (let round = 0; round < 10; round++) {
    const body = await page.locator("[data-testid='minigame-modal']").innerText();
    const tm =
      body.match(/Target\s*Cents[\s\S]*?(\d+)\s*¢/i) ||
      body.match(/Target\s*Cents[\s\S]*?(\d+)/i);
    const target = tm ? Number(tm[1]) : null;
    if (target == null || Number.isNaN(target)) break;

    let left = target;
    const modal = page.getByTestId("minigame-modal");
    for (const c of [
      { name: /Quarter \(25/i, v: 25 },
      { name: /Dime \(10/i, v: 10 },
      { name: /Nickel \(5/i, v: 5 },
      { name: /Penny \(1/i, v: 1 },
    ]) {
      while (left >= c.v) {
        const btn = modal.getByRole("button", { name: c.name });
        if (!(await btn.isVisible().catch(() => false))) break;
        await btn.evaluate((el) => el.click());
        left -= c.v;
        await page.waitForTimeout(25);
      }
    }
    const submit = modal.getByRole("button", { name: /^Submit$/i });
    if (await submit.isVisible().catch(() => false)) {
      await submit.evaluate((el) => el.click());
      await page.waitForTimeout(160);
    }
    const scoreLine = await modal.innerText();
    const sm = scoreLine.match(/(\d+(?:\.\d+)?)\s*pts/i);
    if (sm && Number(sm[1]) >= 35) break;
  }

  await page.getByTestId("minigame-finish-round").evaluate((el) => el.click());
  await page.getByTestId("minigame-finish").waitFor({ timeout: 8_000 });
  await page.getByTestId("minigame-finish").evaluate((el) => el.click());

  let next = "none";
  for (let i = 0; i < 40; i++) {
    if (await page.getByTestId("mastery-quiz").isVisible().catch(() => false)) {
      next = "mastery";
      break;
    }
    if (await page.getByTestId("minigame-fail-retry").isVisible().catch(() => false)) {
      next = "fail";
      break;
    }
    await page.waitForTimeout(250);
  }
  if (next === "fail") {
    await page.getByTestId("minigame-fail-retry").evaluate((el) => el.click());
    await page.waitForTimeout(500);
    return playCoinSort(page);
  }
  if (next !== "mastery") throw new Error("After Coin Sort: expected mastery or fail");
  await passMasteryQuiz(page);
}

async function runAshore(page, report) {
  await wipe(page);
  await page.goto(`${BASE}/?replayIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const skip = page.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await skip.click({ force: true });
  }

  await page.getByTestId("opening-choose-voyager").waitFor({ state: "visible", timeout: 20_000 });
  await page.getByTestId("opening-choose-voyager").click({ timeout: 8_000 });
  report.steps.push("title");

  await page.getByTestId("boot-board-carpet-now").click({ timeout: 8_000 });
  await page.locator('[data-teach-mode="chamber-00"][data-teach-step="fantasy"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await page.getByTestId("ashore-fantasy-toy-memory").click();
  await page.getByTestId("ashore-teach-continue").click();
  report.steps.push("fantasy");

  await page.locator('[data-teach-step="walk"]').waitFor({ state: "visible", timeout: 10_000 });
  await page.getByTestId("ashore-walk-claim-right").click({ force: true });
  await page.getByTestId("ashore-walk-claim-left").click({ force: true });
  await page.getByTestId("ashore-walk-claim-forward").click({ force: true });
  report.steps.push("walk");

  await page.locator('[data-teach-step="talk"]').waitFor({ state: "visible", timeout: 15_000 });
  await page.getByTestId("ashore-talk-approach").click({ force: true });
  await page.getByTestId("ashore-teach-talk").click({ force: true });
  report.steps.push("talk");

  await page.locator('[data-teach-step="dock"]').waitFor({ state: "visible", timeout: 15_000 });
  await page.getByTestId("ashore-carpet-board-cove").click({ timeout: 8_000 });
  await page.getByTestId("ashore-teach-continue").click();
  await page.locator('[data-teach-step="ready"]').waitFor({ state: "visible", timeout: 10_000 });
  await page.getByTestId("ashore-teach-continue").click();
  report.steps.push("ashore_launch");

  await page.waitForTimeout(2500);
  const skip3d = page.getByTestId("harbor-skip-3d");
  if (await skip3d.isVisible({ timeout: 12_000 }).catch(() => false)) {
    await skip3d.click({ force: true });
  }
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  report.steps.push("harbor");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { steps: [], pass: false };

  try {
    await runAshore(page, report);

    const talk = page.getByTestId("hub-talk-npc");
    const mythTalk = page.getByTestId("fallback-talk-piggy");
    if (await talk.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await talk.evaluate((el) => el.click());
    } else if (await mythTalk.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await mythTalk.evaluate((el) => el.click());
    } else {
      await page.evaluate(() => window.__QA__.talkNpc("piggy_penny"));
    }
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
    await finishTalk(page);
    report.steps.push("harbor_talk");

    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("cove_shore");

    await talkNpc(page, "npc_captain_penny", /Teach|Yes|denominations|coins/i);
    report.steps.push("penny");

    const collected = await page.evaluate(async () => {
      const ok = await window.__QA__.collectItem("cc_coin_pouch");
      await new Promise((r) => setTimeout(r, 400));
      return { ok, inv: window.__QA__.getSave()?.inventory ?? [] };
    });
    if (!collected.ok || !collected.inv.includes("cc_coin_pouch")) {
      throw new Error(`Coin Pouch failed: ${JSON.stringify(collected)}`);
    }
    report.steps.push("pouch");

    await page.evaluate(() => window.__QA__.startMinigame("mg_coin_sort"));
    await playCoinSort(page);
    report.steps.push("coin_sort");

    // Critical path is Kira — Alma is optional tip (not required).
    // Dismiss any leftover talk/modal from mastery.
    if (await page.getByTestId("talk-battle-screen").isVisible().catch(() => false)) {
      await finishTalk(page);
    }
    await page
      .getByTestId("minigame-modal")
      .waitFor({ state: "hidden", timeout: 10_000 })
      .catch(() => {});

    await page.evaluate((id) => window.__QA__.talkNpc(id), "npc_keeper_kira");
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
    await page.getByTestId("talk-battle-continue").click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    const jar = page
      .locator('[data-testid^="talk-choice-"]')
      .filter({ hasText: /Jar before treat/i })
      .first();
    await jar.waitFor({ state: "visible", timeout: 10_000 });
    await jar.click({ force: true });
    await finishTalk(page);
    report.steps.push("kira_take");

    const save3 = await page.evaluate(() => window.__QA__.getSave());
    report.hasScar = Boolean(save3?.harborScars?.some((s) => s.id === "cove_saver_plaque"));
    if (!report.hasScar) throw new Error("Missing cove_saver_plaque after Kira");

    const hush = page.getByTestId("take-hush-overlay");
    if (await hush.isVisible({ timeout: 12_000 }).catch(() => false)) {
      await page.waitForTimeout(2_200);
      await hush.click({ force: true }).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
    }
    const homeCta = page.getByTestId("shore-carpet-home-cta");
    const homeTop = page.getByTestId("shore-carpet-home");
    if (await homeCta.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await homeCta.evaluate((el) => el.click());
    } else if (await homeTop.isVisible().catch(() => false)) {
      await homeTop.evaluate((el) => el.click());
    }
    await page.evaluate(() => window.__QA__.openHub());
    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }
    report.steps.push("carpet_home");

    let kid = "";
    let sawSpectacle = false;
    for (let i = 0; i < 60; i++) {
      if (await page.getByTestId("scar-spectacle-retell").isVisible().catch(() => false)) {
        kid = await page.getByTestId("scar-spectacle-retell").innerText();
        sawSpectacle = true;
        break;
      }
      if (await page.getByTestId("scar-spectacle").isVisible().catch(() => false)) {
        sawSpectacle = true;
        const retell = page.getByTestId("scar-spectacle-retell");
        if (await retell.isVisible().catch(() => false)) {
          kid = await retell.innerText();
          break;
        }
      }
      if (await page.getByTestId("harbor-felt-retell").isVisible().catch(() => false)) {
        kid = await page.getByTestId("harbor-felt-retell").innerText();
        break;
      }
      if (await page.getByTestId("harbor-felt-kid-sentence").isVisible().catch(() => false)) {
        kid = await page.getByTestId("harbor-felt-kid-sentence").innerText();
        break;
      }
      if (await page.getByTestId("talk-battle-screen").isVisible().catch(() => false)) {
        const t = await page.getByTestId("talk-battle-screen").innerText();
        if (/Coin holds|Jar before|Harbor remembered/i.test(t)) {
          kid = t.replace(/\s+/g, " ").slice(0, 280);
          break;
        }
        await finishTalk(page);
      }
      if (i === 12) {
        const piggy = page.getByTestId("fallback-talk-piggy");
        const hubTalk = page.getByTestId("hub-talk-npc");
        if (await piggy.isVisible().catch(() => false)) await piggy.evaluate((el) => el.click());
        else if (await hubTalk.isVisible().catch(() => false))
          await hubTalk.evaluate((el) => el.click());
      }
      await page.waitForTimeout(400);
    }
    const saveFinal = await page.evaluate(() => window.__QA__.getSave());
    if (!kid && saveFinal?.harborHomecoming?.message) {
      kid = saveFinal.harborHomecoming.message;
    }
    report.kid = kid;
    report.sawSpectacle = sawSpectacle;
    report.coveChangeDone = Boolean(saveFinal?.questStatus?.q_cc_save_or_spend?.completed);
    report.pass =
      report.hasScar &&
      report.coveChangeDone &&
      /Coin holds|Jar before treat|Harbor remembered|Harbor feels/i.test(kid);
    report.steps.push("harbor_retell");

    await page.screenshot({ path: `${SHOT}/retell.png`, fullPage: true, type: "png" });
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exit(1);
  } catch (err) {
    report.error = String(err?.stack || err);
    console.log(JSON.stringify(report, null, 2));
    await page
      .screenshot({ path: `${SHOT}/fail.png`, fullPage: true, type: "png" })
      .catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
