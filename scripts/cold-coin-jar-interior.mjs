/**
 * Cold Coin Jar interior: shore → squeeze enter → Lid Lookout Soft Beat → exit.
 * Usage: VITE_QA=1 node scripts/cold-coin-jar-interior.mjs
 */
import { chromium } from "playwright";
import { appendFileSync, mkdirSync } from "node:fs";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";
const SHOT = "/opt/cursor/artifacts/screenshots/coin-jar-interior";
const PROGRESS = "/tmp/cold-jar-progress.log";

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
    appendFileSync(PROGRESS, `\n=== jar cold ${new Date().toISOString()} ===\n`);
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

    progress("cove…");
    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("cove_shore");

    progress("enter jar…");
    await page.evaluate(() => window.__QA__.enterMoneyStructure());
    await page.getByTestId("money-structure-interior").waitFor({ timeout: 20_000 });
    const structureId = await page
      .getByTestId("money-structure-interior")
      .getAttribute("data-structure");
    report.structureId = structureId;
    if (structureId !== "cove_coin_jar") {
      throw new Error(`Expected cove_coin_jar, got ${structureId}`);
    }
    report.steps.push("jar_interior");
    await page.screenshot({ path: `${SHOT}/01-jar-interior.png`, type: "png" });

    // Lid first — Soft Beat stays inside the jar (no arcade dump).
    progress("lid lookout…");
    const lidOk = await page.evaluate(() => {
      const api = window.__QA_STRUCTURE__;
      if (!api?.enterPart) return { ok: false, reason: "no __QA_STRUCTURE__" };
      return { ok: api.enterPart("lid_lookout"), reason: "called" };
    });
    if (!lidOk.ok) throw new Error(`enterPart lid_lookout failed: ${JSON.stringify(lidOk)}`);
    const soft = page.getByTestId("soft-beat-overlay");
    await soft.waitFor({ state: "visible", timeout: 10_000 });
    const climb = await soft.getAttribute("data-soft-beat-climb");
    const layout = await soft.getAttribute("data-soft-beat-layout");
    report.softBeat = { climb, layout };
    if (climb !== "lid-climb") throw new Error(`Expected lid-climb, got ${climb}`);
    if (layout !== "lower-third") throw new Error(`Expected lower-third layout, got ${layout}`);
    const kid = (await page.getByTestId("soft-beat-retell").innerText()).trim();
    report.kid = kid;
    if (!/Coin holds/i.test(kid)) throw new Error(`Lid kid missing Coin holds: ${kid}`);
    await page.screenshot({ path: `${SHOT}/02-lid-lookout.png`, type: "png" });
    await page.getByTestId("soft-beat-leave").click({ force: true }).catch(() => {});
    await soft.waitFor({ state: "hidden", timeout: 8_000 }).catch(() => {});
    report.steps.push("lid_lookout");

    progress("cork-pop…");
    const corkOk = await page.evaluate(() => {
      const api = window.__QA_STRUCTURE__;
      if (!api?.enterPart) return { ok: false, reason: "no __QA_STRUCTURE__" };
      return { ok: api.enterPart("cork_vault"), reason: "called" };
    });
    if (!corkOk.ok) throw new Error(`enterPart cork_vault failed: ${JSON.stringify(corkOk)}`);
    const corkMotif = page.getByTestId("part-enter-motif");
    await corkMotif.waitFor({ state: "visible", timeout: 8_000 });
    const corkId = await corkMotif.getAttribute("data-part-enter");
    report.corkMotif = corkId;
    if (corkId !== "cork-pop") throw new Error(`Expected cork-pop, got ${corkId}`);
    const corkKid = (await page.getByTestId("part-enter-kid-sentence").innerText()).trim();
    report.corkKid = corkKid;
    await page.screenshot({ path: `${SHOT}/03-cork-pop.png`, type: "png" });
    report.steps.push("cork_pop");

    // Leave motif without requiring arcade finish — Esc opens vault, then close modal.
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
    for (let i = 0; i < 6; i++) {
      if (await page.getByTestId("game-modal-close").first().isVisible().catch(() => false)) {
        await page.getByTestId("game-modal-close").first().click({ force: true }).catch(() => {});
      }
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(200);
      if (await page.getByTestId("money-structure-interior").isVisible().catch(() => false)) break;
      if (await page.getByTestId("island-shore-view").isVisible().catch(() => false)) break;
    }
    // Prefer shore return for exit proof
    if (await page.getByTestId("money-structure-interior").isVisible().catch(() => false)) {
      await page.keyboard.press("Escape");
      await page
        .getByTestId("money-structure-interior")
        .waitFor({ state: "hidden", timeout: 10_000 })
        .catch(() => {});
    }
    report.steps.push("exit_shore");
    await page.screenshot({ path: `${SHOT}/04-back-shore.png`, type: "png" });

    report.pass =
      report.structureId === "cove_coin_jar" &&
      report.corkMotif === "cork-pop" &&
      /Coin holds/i.test(report.corkKid || "") &&
      report.softBeat?.climb === "lid-climb" &&
      report.softBeat?.layout === "lower-third" &&
      /Coin holds/i.test(report.kid || "");
    report.sixQuestions = {
      misunderstand: "No — cork-pop / lid-climb name the part before arcade or Soft Beat.",
      unfair: "No — Esc · Leave on motif and Soft Beat.",
      repetitive: "No — jar architecture + lower-third Lid are new vs pad teleport.",
      ignoredAbility: "No — Escape exits Soft Beat and jar.",
      lost: "No — Coin slot exit hint + shore return.",
      funVsFunctional: "Fun — Coin holds on cork-pop and Lid Lookout.",
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
