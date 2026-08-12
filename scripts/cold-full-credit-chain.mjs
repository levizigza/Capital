/**
 * Credit Spiral Take cold chain (Spiral withstands):
 * Seed post-Cove unlock → Cleo → Credit Inbox → Rex (talk only) →
 * Score Scanner → Rex Wait Take → Harbor retell.
 *
 * Cove unlock is seeded (piggy_ready); Credit quests + Take are real play.
 * QA enterIsland bypasses boss mastery gate for cold craft proof.
 *
 * Usage: node scripts/cold-full-credit-chain.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

/** Medium difficulty draws first 4 LIVING_SIGNALS (see signalData.ts). */
const SIGNALS = [
  { freq: 72, cat: "trap" },
  { freq: 45, cat: "trust" },
  { freq: 88, cat: "trap" },
  { freq: 33, cat: "trust" },
];

async function wipe(page) {
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    try {
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

async function finishTalk(page) {
  for (let i = 0; i < 20; i++) {
    if (!(await page.getByTestId("talk-battle-screen").isVisible().catch(() => false))) {
      return;
    }
    try {
      const choice = page.locator('[data-testid^="talk-choice-"]').first();
      if ((await choice.count()) && (await choice.isVisible().catch(() => false))) {
        await choice.evaluate((el) => el.click());
        await page.waitForTimeout(220);
        continue;
      }
      const cont = page.getByTestId("talk-battle-continue");
      if ((await cont.count()) && (await cont.isVisible().catch(() => false))) {
        await cont.evaluate((el) => el.click());
        await page.waitForTimeout(220);
        continue;
      }
      const leave = page.getByTestId("talk-battle-leave");
      if (await leave.isVisible().catch(() => false)) {
        await leave.evaluate((el) => el.click());
        await page.waitForTimeout(220);
      }
    } catch {
      await page.waitForTimeout(180);
    }
  }
  await page
    .getByTestId("talk-battle-screen")
    .waitFor({ state: "hidden", timeout: 8_000 })
    .catch(() => {});
}

async function talkNpc(page, npcId, preferChoice) {
  await page.evaluate((id) => window.__QA__.talkNpc(id), npcId);
  await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
  await page.getByTestId("talk-battle-continue").evaluate((el) => el.click()).catch(() => {});
  await page.waitForTimeout(220);
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

async function playCreditInbox(page) {
  await page.getByTestId("minigame-modal").waitFor({ timeout: 15_000 });
  for (let round = 0; round < 3; round++) {
    const draw = page.getByTestId("module-action-EventDeck-draw");
    if (await draw.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await draw.evaluate((el) => el.click());
      await page.waitForTimeout(280);
    }
    const choice = page.getByTestId("event-choice-0");
    if (await choice.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await choice.evaluate((el) => el.click());
      await page.waitForTimeout(280);
    }
  }
  const finishRound = page.getByTestId("minigame-finish-round");
  await finishRound.waitFor({ state: "visible", timeout: 8_000 });
  await finishRound.evaluate((el) => el.click());
  await page.waitForTimeout(300);
  const finish = page.getByTestId("minigame-finish");
  await finish.waitFor({ state: "visible", timeout: 8_000 });
  await finish.evaluate((el) => el.click());
  await page.getByTestId("minigame-modal").waitFor({ state: "hidden", timeout: 12_000 }).catch(() => {});
}

async function playScoreScanner(page) {
  await page.getByTestId("minigame-modal").waitFor({ timeout: 15_000 });
  await page.getByTestId("signal-dial").waitFor({ state: "visible", timeout: 20_000 });

  for (let i = 0; i < SIGNALS.length; i++) {
    const signal = SIGNALS[i];
    if (await page.getByTestId("signal-exit").isVisible().catch(() => false)) break;
    if (!(await page.getByTestId("signal-dial").isVisible({ timeout: 6_000 }).catch(() => false))) {
      break;
    }
    // React controlled input — native setter so onChange fires
    await page.evaluate((freq) => {
      const el = document.querySelector('[data-testid="signal-dial"]');
      if (!el) return;
      const proto = Object.getPrototypeOf(el);
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      desc?.set?.call(el, String(freq));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, signal.freq);
    await page.waitForTimeout(100);
    const lock = page.getByTestId("signal-lock");
    await lock.waitFor({ state: "visible", timeout: 4_000 });
    // Wait until lock enables (dial within ±8 of target)
    await page.waitForFunction(() => {
      const btn = document.querySelector('[data-testid="signal-lock"]');
      return btn && !btn.hasAttribute("disabled") && !btn.getAttribute("aria-disabled");
    }, null, { timeout: 4_000 }).catch(() => {});
    await lock.evaluate((el) => el.click());
    await page.waitForTimeout(650);
    const classify = page.getByTestId(`signal-classify-${signal.cat}`);
    await classify.waitFor({ state: "visible", timeout: 6_000 });
    await classify.evaluate((el) => el.click());
    await page.waitForTimeout(200);
    const deeper = page.getByTestId("signal-decode-deeper");
    if (await deeper.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await deeper.evaluate((el) => el.click());
    }
    const insight = page.getByTestId("insight-continue");
    if (await insight.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await insight.evaluate((el) => el.click());
    }
    await page.waitForTimeout(250);
  }

  const exit = page.getByTestId("signal-exit");
  if (await exit.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await exit.evaluate((el) => el.click());
  } else {
    await page.getByRole("button", { name: /Exit interceptor/i }).evaluate((el) => el.click()).catch(() => {});
  }
  await page.getByTestId("minigame-modal").waitFor({ state: "hidden", timeout: 12_000 }).catch(() => {});
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { steps: [], pass: false, seededCove: true };

  try {
    await wipe(page);
    await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
    await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
    report.steps.push("boot");

    await page.evaluate(async () => {
      await window.__QA__.seedSignatureLoop("piggy_ready");
    });
    report.steps.push("seed_cove_unlock");

    await page.evaluate(async () => {
      await window.__QA__.enterIsland("credit_kingdom");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("credit_shore");

    await talkNpc(page, "npc_credit_cleo_ruins", /Teach me credit|credit recovery/i);
    report.steps.push("cleo_talk");

    await page.evaluate(() => window.__QA__.startMinigame("mg_ck_inbox_credit"));
    await playCreditInbox(page);
    const inbox = await page.evaluate(() => {
      const s = window.__QA__.getSave();
      return {
        inbox: s?.completedMinigames?.includes("mg_ck_inbox_credit"),
        questStarted: s?.questStatus?.q_ck_first_recovery?.started,
      };
    });
    report.inbox = inbox;
    if (!inbox.inbox) throw new Error("mg_ck_inbox_credit not cleared");
    report.steps.push("credit_inbox");

    // Avoid Rex's startMinigame → kinesthetic redirect; talk only, then QA open Scanner.
    await talkNpc(page, "npc_collector_rex", /Not yet/i);
    report.steps.push("rex_talk_practice");
    if (await page.getByTestId("minigame-modal").isVisible().catch(() => false)) {
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(300);
    }

    await page.evaluate(() => window.__QA__.startMinigame("mg_ck_signal"));
    await playScoreScanner(page);
    const scanned = await page.evaluate(() => {
      const s = window.__QA__.getSave();
      return Boolean(s?.completedMinigames?.includes("mg_ck_signal"));
    });
    report.signalClear = scanned;
    if (!scanned) throw new Error("mg_ck_signal not cleared");
    report.steps.push("score_scanner");

    await page.evaluate((id) => window.__QA__.talkNpc(id), "npc_collector_rex");
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
    await page.getByTestId("talk-battle-continue").evaluate((el) => el.click()).catch(() => {});
    await page.waitForTimeout(280);
    const wait = page
      .locator('[data-testid^="talk-choice-"]')
      .filter({ hasText: /Waited the spiral/i })
      .first();
    await wait.waitFor({ state: "visible", timeout: 8_000 });
    await wait.evaluate((el) => el.click());
    await finishTalk(page);
    report.steps.push("rex_wait_take");

    const save3 = await page.evaluate(() => window.__QA__.getSave());
    report.hasScar = Boolean(save3?.harborScars?.some((s) => s.id === "credit_patience_plaque"));
    report.creditDone = Boolean(save3?.questStatus?.q_ck_first_recovery?.completed);
    report.homecoming = save3?.harborHomecoming?.message ?? null;
    if (!report.hasScar) throw new Error("Missing credit_patience_plaque");
    if (!report.creditDone) throw new Error("q_ck_first_recovery not completed");

    const hush = page.getByTestId("take-hush-overlay");
    if (await hush.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await page.waitForTimeout(2_000);
      await hush.click({ force: true }).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
    }
    const homeCta = page.getByTestId("shore-carpet-home-cta");
    if (await homeCta.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await homeCta.evaluate((el) => el.click());
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => window.__QA__.openHub());
    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await skip3d.evaluate((el) => el.click()).catch(() => {});
    }
    report.steps.push("carpet_home");

    let kid = report.homecoming || "";
    for (let i = 0; i < 40; i++) {
      if (/Spiral withstands/i.test(kid)) break;
      if (await page.getByTestId("scar-spectacle-retell").isVisible().catch(() => false)) {
        kid = await page.getByTestId("scar-spectacle-retell").innerText();
        break;
      }
      if (await page.getByTestId("harbor-felt-kid-sentence").isVisible().catch(() => false)) {
        kid = await page.getByTestId("harbor-felt-kid-sentence").innerText();
        break;
      }
      if (await page.getByTestId("talk-battle-screen").isVisible().catch(() => false)) {
        const t = await page.getByTestId("talk-battle-screen").innerText();
        if (/Spiral withstands|Waited the spiral/i.test(t)) {
          kid = t.replace(/\s+/g, " ").slice(0, 280);
          break;
        }
        await finishTalk(page);
      }
      if (i === 10) {
        const piggy = page.getByTestId("fallback-talk-piggy");
        if (await piggy.isVisible().catch(() => false)) {
          await piggy.evaluate((el) => el.click());
        }
      }
      const msg = await page.evaluate(
        () => window.__QA__.getSave()?.harborHomecoming?.message || "",
      );
      if (/Spiral withstands/i.test(msg)) kid = msg;
      await page.waitForTimeout(350);
    }
    report.kid = kid;
    report.pass =
      report.hasScar &&
      report.creditDone &&
      /Spiral withstands|Waited the spiral/i.test(kid);

    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold-credit-retell.png",
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
        path: "/opt/cursor/artifacts/screenshots/cold-credit-fail.png",
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
