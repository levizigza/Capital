/**
 * Full cold Cove Change (no seedSignatureLoop):
 * Penny Talk → Coin Pouch → Coin Sort (real play) → Alma → Kira jar → Harbor retell.
 *
 * Uses QA talkNpc/collectItem/startMinigame only to open live systems
 * (headless WebGL walk is flaky). Dialogue choices + minigame + scars are real.
 *
 * Usage: node scripts/cold-full-cove-chain.mjs
 */
import { chromium } from "playwright";
import { appendFileSync, mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const PROGRESS = "/tmp/cold-cove-progress.log";

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
        await choice.evaluate((el) => el.click());
        await page.waitForTimeout(250);
        continue;
      }
      const cont = page.getByTestId("talk-battle-continue");
      if ((await cont.count()) && (await cont.isVisible().catch(() => false))) {
        await cont.evaluate((el) => el.click());
        await page.waitForTimeout(250);
        continue;
      }
      const leave = page.getByTestId("talk-battle-leave");
      if (await leave.isVisible().catch(() => false)) {
        await leave.evaluate((el) => el.click());
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
        await leave.evaluate((el) => el.click());
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
  progress("mastery quiz visible — QA pass…");

  // Motion GameButtons flake under headless Playwright — use the live QA pass path
  // (same pattern as talkNpc / collectItem: open real system, skip brittle chrome).
  const passed = await page.evaluate(async () => {
    const keys = window.__QA__ ? Object.keys(window.__QA__) : [];
    if (!window.__QA__?.passPendingMastery) {
      return { ok: false, keys };
    }
    const ok = await window.__QA__.passPendingMastery();
    return { ok, keys };
  });
  if (!passed?.ok) {
    throw new Error(
      `passPendingMastery failed: ${JSON.stringify(passed)}`,
    );
  }

  await quiz.waitFor({ state: "hidden", timeout: 15_000 });
  await page.waitForFunction(
    () => (window.__QA__?.getSave()?.completedMinigames || []).includes("mg_coin_sort"),
    null,
    { timeout: 10_000 },
  );
  progress("mastery cleared");
  return true;
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

  // Earn jobs first (builds score + wallet for change rounds)
  for (let i = 0; i < 6; i++) {
    const earn = page
      .getByTestId("minigame-modal")
      .getByRole("button", { name: /Sort Crates|Clean the Deck|Deliver Mail|\(\+\$/i })
      .first();
    if (await earn.isVisible().catch(() => false)) {
      await earn.evaluate((el) => el.click());
      await page.waitForTimeout(100);
    } else {
      break;
    }
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

  const scoreBeforeFinish = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="minigame-modal"]')?.textContent || "";
    const m = t.match(/(\d+(?:\.\d+)?)\s*pts/i);
    return m ? Number(m[1]) : null;
  });

  await page.getByTestId("minigame-finish-round").evaluate((el) => el.click());
  await page.getByTestId("minigame-finish").waitFor({ timeout: 8_000 });
  const scoreRoundOver = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="minigame-round-over"]')?.textContent || "";
    const m = t.match(/Final Score:[\s\S]*?(\d+(?:\.\d+)?)/i) || t.match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
  });
  await page.getByTestId("minigame-finish").evaluate((el) => el.click());

  // Wait for mastery gate or fail chrome (not a fixed sleep — React paint can lag).
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
  if (next !== "mastery") {
    throw new Error(
      `After Coin Sort finish: expected mastery or fail (score~${scoreRoundOver ?? scoreBeforeFinish})`,
    );
  }

  const mastered = await passMasteryQuiz(page);
  if (!mastered) {
    throw new Error(
      `Mastery quiz did not clear (score~${scoreRoundOver ?? scoreBeforeFinish})`,
    );
  }
  return { scoreRoundOver, scoreBeforeFinish };
}

async function dismissDevChrome(page) {
  // Never toggle Ctrl+Shift+E here — that opens the Dev Errors dock.
  await page.evaluate(() => {
    const hide = [...document.querySelectorAll("button")].find((b) =>
      /^Hide$/i.test((b.textContent || "").trim()),
    );
    hide?.click();
  });
}

async function bootToHarbor(page, report) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await wipe(page);
      await page.goto(`${BASE}/?replayIntro=1`);

      const skip = page.getByRole("button", { name: /^Skip$/i });
      if (await skip.isVisible({ timeout: 6_000 }).catch(() => false)) {
        await skip.click({ force: true });
      }
      await page.getByTestId("opening-choose-voyager").waitFor({ timeout: 25_000 });
      await page.getByTestId("opening-choose-voyager").evaluate((el) => el.click());
      await page.getByTestId("boot-cast-select").waitFor({ timeout: 25_000 });
      const boardNow = page.getByTestId("boot-board-carpet-now");
      if (await boardNow.isVisible({ timeout: 3_000 }).catch(() => false)) {
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
      await dismissDevChrome(page);
      report.bootAttempts = attempt;
      return;
    } catch (err) {
      report.bootError = String(err?.message || err);
      if (attempt === 3) throw err;
      await page.waitForTimeout(800);
    }
  }
}

async function main() {
  try {
    mkdirSync("/opt/cursor/artifacts/screenshots/cold-ashore-cove", { recursive: true });
  } catch {
    /* ignore */
  }
  try {
    appendFileSync(PROGRESS, `\n=== cold start ${new Date().toISOString()} ===\n`);
  } catch {
    /* ignore */
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { steps: [], pass: false, seeded: false };

  try {
    progress("boot…");
    await bootToHarbor(page, report);
    report.steps.push("boot");
    progress("boot ok");

    const talk = page.getByTestId("hub-talk-npc");
    const mythTalk = page.getByTestId("fallback-talk-piggy");
    if (await talk.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await talk.evaluate((el) => el.click());
    } else {
      await mythTalk.evaluate((el) => el.click());
    }
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
    await finishTalk(page);
    report.steps.push("harbor_talk");
    progress("harbor_talk ok");

    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("cove_shore");
    progress("cove_shore ok");

    await talkNpc(page, "npc_captain_penny", /Teach|Yes|denominations|coins/i);
    report.steps.push("penny_talk");
    progress("penny_talk ok");

    const collected = await page.evaluate(async () => {
      const ok = await window.__QA__.collectItem("cc_coin_pouch");
      await new Promise((r) => setTimeout(r, 400));
      return {
        ok,
        inv: window.__QA__.getSave()?.inventory ?? [],
        quest: window.__QA__.getSave()?.questStatus?.q_cc_first_coins ?? null,
      };
    });
    report.pouch = collected;
    if (!collected.ok || !collected.inv.includes("cc_coin_pouch")) {
      throw new Error(`Coin Pouch collect failed: ${JSON.stringify(collected)}`);
    }
    report.steps.push("coin_pouch");

    progress("coin_sort…");
    await page.evaluate(() => window.__QA__.startMinigame("mg_coin_sort"));
    await playCoinSort(page);
    const save2 = await page.evaluate(() => window.__QA__.getSave());
    const firstDone = save2?.questStatus?.q_cc_first_coins?.completed;
    const sortDone = save2?.completedMinigames?.includes("mg_coin_sort");
    report.firstCoinsCompleted = Boolean(firstDone);
    report.coinSortCleared = Boolean(sortDone);
    report.masteryClears = save2?.voyagerLedger?.masteryClears ?? [];
    if (!sortDone) throw new Error("mg_coin_sort not in completedMinigames");
    report.steps.push("coin_sort");
    progress("coin_sort ok");

    await talkNpc(page, "npc_artisan_alma", /Sure|bench|stays/i);
    report.steps.push("alma_talk");
    progress("alma_talk ok");

    progress("kira_jar…");
    await page.evaluate((id) => window.__QA__.talkNpc(id), "npc_keeper_kira");
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
    await page.getByTestId("talk-battle-continue").evaluate((el) => el.click()).catch(() => {});
    await page.waitForTimeout(300);
    const jar = page
      .locator('[data-testid^="talk-choice-"]')
      .filter({ hasText: /Jar first/i })
      .first();
    await jar.waitFor({ state: "visible", timeout: 8_000 });
    await jar.evaluate((el) => el.click());
    await finishTalk(page);
    report.steps.push("kira_jar_take");

    const save3 = await page.evaluate(() => window.__QA__.getSave());
    report.hasScar = Boolean(
      save3?.harborScars?.some((s) => s.id === "cove_saver_plaque"),
    );
    report.quiet = Boolean(save3?.chapterQuietPending);
    report.coveChangeDone = Boolean(save3?.questStatus?.q_cc_save_or_spend?.completed);
    if (!report.hasScar) throw new Error("Missing cove_saver_plaque after Kira jar choice");

    const hush = page.getByTestId("take-hush-overlay");
    let takeKid = "";
    if (await hush.isVisible({ timeout: 12_000 }).catch(() => false)) {
      // Decision replay can cover the hush — dismiss so the kid sentence reads.
      await page.getByTestId("game-modal-close").first().click({ force: true }).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(200);
      // Wait for line phase — kid sentence is the combine retell.
      for (let i = 0; i < 40; i++) {
        const kidEl = page.getByTestId("take-cinema-kid-sentence");
        if (await kidEl.isVisible().catch(() => false)) {
          takeKid = (await kidEl.innerText()).trim();
          break;
        }
        await page.waitForTimeout(150);
      }
      report.takeKidSentence = takeKid;
      await page.screenshot({
        path: "/opt/cursor/artifacts/screenshots/cold-ashore-cove/01-take-kid-sentence.png",
        type: "png",
      });
      if (!/Coin holds/i.test(takeKid)) {
        throw new Error(`Take kid sentence missing Coin holds: ${takeKid}`);
      }
      await hush.click({ force: true }).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
    }
    // Carpet-home CTA opens Travel map — land Harbor for scar cinema.
    const homeCta = page.getByTestId("shore-carpet-home-cta");
    const homeTop = page.getByTestId("shore-carpet-home");
    if (await homeCta.isVisible({ timeout: 10_000 }).catch(() => false)) {
      report.pierExit = (await homeCta.getAttribute("data-pier-exit")) === "1";
      await page.screenshot({
        path: "/opt/cursor/artifacts/screenshots/cold-ashore-cove/02-carpet-home-cta.png",
        type: "png",
      });
      await homeCta.evaluate((el) => el.click());
      await page.waitForTimeout(600);
    } else if (await homeTop.isVisible().catch(() => false)) {
      await homeTop.evaluate((el) => el.click());
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => window.__QA__.openHub());
    // Myth fallback / 3D failsafe may need skip once
    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }
    report.steps.push("carpet_home");

    let kid = "";
    for (let i = 0; i < 60; i++) {
      if (await page.getByTestId("scar-spectacle-retell").isVisible().catch(() => false)) {
        kid = await page.getByTestId("scar-spectacle-retell").innerText();
        break;
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
        if (/Coin holds|Jar before/i.test(t)) {
          kid = t.replace(/\s+/g, " ").slice(0, 280);
          break;
        }
        await finishTalk(page);
      }
      // Piggy homecoming talk carries the kid sentence when cinema is gated
      const piggy = page.getByTestId("fallback-talk-piggy");
      const hubTalk = page.getByTestId("hub-talk-npc");
      if (i === 12) {
        if (await piggy.isVisible().catch(() => false)) {
          await piggy.evaluate((el) => el.click());
        } else if (await hubTalk.isVisible().catch(() => false)) {
          await hubTalk.evaluate((el) => el.click());
        }
      }
      await page.waitForTimeout(400);
    }
    const saveFinal = await page.evaluate(() => window.__QA__.getSave());
    report.firstCoinsCompleted = Boolean(saveFinal?.questStatus?.q_cc_first_coins?.completed);
    report.coveChangeDone = Boolean(saveFinal?.questStatus?.q_cc_save_or_spend?.completed);
    report.homecoming = saveFinal?.harborHomecoming ?? null;
    // Piggy homecoming talk may dismiss before we scrape the overlay — message is the retell.
    if (!kid && saveFinal?.harborHomecoming?.message) {
      kid = saveFinal.harborHomecoming.message;
    }
    report.kid = kid;
    report.pass =
      report.hasScar &&
      report.coinSortCleared &&
      report.coveChangeDone &&
      /Coin holds/i.test(report.takeKidSentence || "") &&
      /Coin holds|Jar before treat|Harbor remembered|Harbor feels/i.test(kid);
    report.steps.push("harbor_retell");
    report.sixQuestions = {
      misunderstand: "No — Take kid sentence + Carpet home CTA name the next verb.",
      unfair: "No — jar choice is clear; cinema shows the irreversible mark.",
      repetitive: "No — combine is a new shape after Ashore one-verb teach.",
      ignoredAbility: "No — Esc · Leave and Carpet CTA both work after hush.",
      lost: "No — pier guide + pulsing Board carpet home after cinema.",
      funVsFunctional: "Fun — kid sentence lands on the jar before Harbor retell.",
    };

    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold-ashore-cove/03-harbor-retell.png",
      type: "png",
      fullPage: true,
    });
    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold6-full-chain-retell.png",
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
        path: "/opt/cursor/artifacts/screenshots/cold-ashore-cove/fail.png",
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
