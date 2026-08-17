/**
 * Cold Soft Beat → structure exit (no plaza/shore remount).
 * Cove Lid Lookout + Harbor Teller Window.
 *
 * Usage: VITE_QA=1 node scripts/cold-structure-soft-beat-exit.mjs
 * Requires app at http://127.0.0.1:5000 with VITE_QA=1 (or DEV).
 */
import { chromium } from "playwright";

const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:5000";

async function wipe(page) {
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`, { waitUntil: "domcontentloaded" });
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

async function bootQa(page) {
  await wipe(page);
  await page.goto(`${BASE}/?mode=islands&skipIntro=1`);
  const ashSkip = page.getByTestId("ashore-teach-skip");
  if (await ashSkip.isVisible({ timeout: 6_000 }).catch(() => false)) {
    await ashSkip.evaluate((el) => el.click());
  }
  await page.waitForFunction(() => Boolean(window.__QA__?.ready), null, { timeout: 40_000 });
  const skip3d = page.getByTestId("harbor-skip-3d");
  if (await skip3d.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await skip3d.click({ force: true });
  }
  await page.evaluate(() => window.__QA__?.openHub?.());
  await page.getByTestId("harbor-home-hub").waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
}

async function softBeatExitCycle(page, {
  islandId,
  hostTestId,
  softBeatKind,
  kidOrgan,
}) {
  const host = page.getByTestId(hostTestId);
  await host.waitFor({ state: "visible", timeout: 20_000 });
  await host.evaluate((el) => {
    el.dataset.coldHost = "1";
  });

  await page.evaluate(async (id) => {
    await window.__QA__.enterMoneyStructure(id);
  }, islandId);

  await page.getByTestId("money-structure-exit").waitFor({ state: "visible", timeout: 15_000 });

  await page.evaluate(() => window.__QA__.enterStructureSoftBeat());
  const soft = page.getByTestId("soft-beat-overlay");
  await soft.waitFor({ state: "visible", timeout: 12_000 });
  const kind = await soft.getAttribute("data-soft-beat");
  if (kind !== softBeatKind) {
    throw new Error(`Expected soft-beat=${softBeatKind}, got ${kind}`);
  }
  const kid = await soft.locator('[data-testid="soft-beat-retell"]').innerText({ timeout: 3_000 });
  if (!new RegExp(kidOrgan, "i").test(kid)) {
    throw new Error(`Soft Beat kid missing ${kidOrgan}: ${kid}`);
  }

  await soft.locator('[data-testid="soft-beat-leave"]').evaluate((el) => el.click());
  await soft.waitFor({ state: "hidden", timeout: 12_000 });

  // Interior still open after Soft Beat leave — then exit without remounting host.
  await page.getByTestId("money-structure-exit").waitFor({ state: "visible", timeout: 8_000 });
  await page.getByTestId("money-structure-exit").evaluate((el) => el.click());
  await page.getByTestId("money-structure-exit").waitFor({ state: "hidden", timeout: 12_000 });

  const stillSameHost = await page.evaluate((tid) => {
    const el = document.querySelector(`[data-testid="${tid}"]`);
    return el instanceof HTMLElement && el.dataset.coldHost === "1";
  }, hostTestId);
  if (!stillSameHost) {
    throw new Error(`${hostTestId} remounted after structure exit`);
  }

  return { softBeatKind: kind, kid, remountFree: true };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = { steps: [], pass: false };

  try {
    await bootQa(page);
    report.steps.push("boot");

    // Cove Lid Lookout Soft Beat → exit shore (plaza host stays).
    await page.evaluate(async () => {
      await window.__QA__.enterIsland("coincraft_cove");
    });
    await page.getByTestId("island-shore-view").waitFor({ timeout: 30_000 });
    report.steps.push("cove_shore");

    report.cove = await softBeatExitCycle(page, {
      islandId: "coincraft_cove",
      hostTestId: "island-shore-view",
      softBeatKind: "lookout",
      kidOrgan: "Coin holds",
    });
    report.steps.push("cove_lid_soft_beat_exit");

    // Harbor Teller Soft Beat → exit plaza (Harbor host stays).
    await page.evaluate(() => window.__QA__.openHub());
    await page.getByTestId("harbor-home-hub").waitFor({ timeout: 20_000 });
    const skip3d = page.getByTestId("harbor-skip-3d");
    if (await skip3d.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skip3d.click({ force: true });
    }
    report.harbor = await softBeatExitCycle(page, {
      islandId: "harbor_haven",
      hostTestId: "harbor-home-hub",
      softBeatKind: "ledger",
      kidOrgan: "Memory keeps|Coin holds",
    });
    report.steps.push("harbor_teller_soft_beat_exit");

    report.pass = Boolean(report.cove?.remountFree && report.harbor?.remountFree);
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exit(1);
  } catch (err) {
    report.error = String(err?.message || err);
    console.log(JSON.stringify(report, null, 2));
    await page
      .screenshot({
        path: "/opt/cursor/artifacts/screenshots/cold-structure-soft-beat-fail.png",
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
