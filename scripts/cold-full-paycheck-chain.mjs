/**
 * Paycheck Change cold chain (Independent Transfer):
 * Seed post-Cove unlock → Paycheck shore → Vee stall Take (no budget class) →
 * Harbor retell of what Clock kept.
 *
 * Usage: node scripts/cold-full-paycheck-chain.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

async function wipe(page) {
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
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

async function playBudgetSplit(page) {
  await page.getByTestId("minigame-modal").waitFor({ timeout: 15_000 });
  await page
    .locator('[data-testid^="budget-expense-"]')
    .first()
    .waitFor({ state: "visible", timeout: 20_000 });

  // Known expense → bucket map (matches BudgetSplitterGame EXPENSES)
  const placements = [
    ["e1", "needs"],
    ["e2", "needs"],
    ["e3", "wants"],
    ["e4", "savings"],
    ["e5", "needs"],
    ["e6", "wants"],
    ["e7", "savings"],
    ["e8", "wants"],
  ];
  for (const [eid, bucket] of placements) {
    const expense = page.getByTestId(`budget-expense-${eid}`);
    if (!(await expense.isVisible().catch(() => false))) continue;
    await expense.evaluate((el) => el.click());
    await page.waitForTimeout(50);
    await page.getByTestId(`budget-bucket-${bucket}`).evaluate((el) => el.click());
    await page.waitForTimeout(70);
  }
  const seal = page.getByTestId("budget-seal");
  await seal.waitFor({ state: "visible", timeout: 8_000 });
  await seal.evaluate((el) => el.click());
  await page.waitForTimeout(400);
  const why = page.getByTestId("budget-why");
  if (await why.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await why.evaluate((el) => el.click());
  }
  const cont = page.getByTestId("insight-continue");
  if (await cont.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await cont.evaluate((el) => el.click());
  } else {
    await page.getByRole("button", { name: /Continue/i }).evaluate((el) => el.click()).catch(() => {});
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
      await window.__QA__.enterIsland("paycheck_peninsula");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("paycheck_shore");

    await page.evaluate((id) => window.__QA__.talkNpc(id), "npc_vendor_vee");
    await page.getByTestId("talk-battle-screen").waitFor({ timeout: 15_000 });
    await page.getByTestId("talk-battle-continue").evaluate((el) => el.click()).catch(() => {});
    await page.waitForTimeout(280);
    const protect = page
      .locator('[data-testid^="talk-choice-"]')
      .filter({ hasText: /Umbrella before glitter/i })
      .first();
    await protect.waitFor({ state: "visible", timeout: 8_000 });
    await protect.evaluate((el) => el.click());
    await finishTalk(page);
    report.steps.push("vee_protect_take");

    const save3 = await page.evaluate(() => window.__QA__.getSave());
    report.hasScar = Boolean(save3?.harborScars?.some((s) => s.id === "pp_protector_plaque"));
    report.paycheckDone = Boolean(save3?.questStatus?.q_pp_rainy_day?.completed);
    report.homecoming = save3?.harborHomecoming?.message ?? null;
    if (!report.hasScar) throw new Error("Missing pp_protector_plaque");
    if (!report.paycheckDone) throw new Error("q_pp_rainy_day not completed");

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
      if (/Clock shelters|Clock kept the loft|rain gossip/i.test(kid)) break;
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
        if (/Clock shelters|Clock kept the loft|Umbrella before|rain gossip/i.test(t)) {
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
      // Refresh homecoming message if spectacle is gated by plaza
      const msg = await page.evaluate(
        () => window.__QA__.getSave()?.harborHomecoming?.message || "",
      );
      if (/Clock shelters|Clock kept the loft|rain gossip/i.test(msg)) kid = msg;
      await page.waitForTimeout(350);
    }
    report.kid = kid;
    report.pass =
      report.hasScar &&
      report.paycheckDone &&
      /Clock kept the loft|rain gossip|Clock shelters|Umbrella before glitter/i.test(kid);

    await page.screenshot({
      path: "/opt/cursor/artifacts/screenshots/cold-paycheck-retell.png",
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
        path: "/opt/cursor/artifacts/screenshots/cold-paycheck-fail.png",
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
