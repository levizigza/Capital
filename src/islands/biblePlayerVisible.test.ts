import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BIBLE_RUNTIME_LAWS, BOARD_CASHFLOW_CLAIM_LABEL } from "@/design/designBible";

const hub = readFileSync(join(__dirname, "views/HomeHubView.tsx"), "utf8");
const reward = readFileSync(join(__dirname, "views/PartyRewardOverlay.tsx"), "utf8");
const play = readFileSync(join(__dirname, "views/IslandPlayView.tsx"), "utf8");
const talks = readFileSync(join(__dirname, "story/harborTalks.ts"), "utf8");
const board = readFileSync(join(__dirname, "partyBoard.ts"), "utf8");
const soft = readFileSync(join(__dirname, "views/SoftBeatOverlay.tsx"), "utf8");
const share = readFileSync(join(__dirname, "views/HarborFeltShareOverlay.tsx"), "utf8");

describe("bible player-visible wiring", () => {
  it("gates Arcade/Studio/Ritual magnets until Cove Change", () => {
    expect(BIBLE_RUNTIME_LAWS.demoteSideMagnetsUntilCoveChange).toBe(true);
    expect(hub).toMatch(/sideMagnetsOpen/);
    expect(hub).toMatch(/hasCompletedCoveChange\(save\)/);
  });

  it("hides Islands XP and Board Star chrome from party rewards", () => {
    expect(reward).not.toMatch(/\+\{reward\.xp\} XP/);
    expect(reward).not.toMatch(/Board Star/);
    expect(BIBLE_RUNTIME_LAWS.cutIslandsXpAwards).toBe(true);
  });

  it("Plinth myth shelf is gossip, not collection %", () => {
    expect(BIBLE_RUNTIME_LAWS.mythShelfNotCollectionPct).toBe(true);
    expect(hub).toMatch(/digressionHeardMyths/);
    expect(hub).not.toMatch(/digression-slot-empty/);
  });

  it("hides achievement dashboards on product path", () => {
    expect(BIBLE_RUNTIME_LAWS.hideAchievementDashboardsOnProductPath).toBe(true);
  });

  it("does not mount SkillStatsPanel on island play", () => {
    expect(play).not.toMatch(/LazySkillStatsPanel/);
    expect(play).not.toMatch(/SkillStatsPanel/);
  });

  it("tip Talk has no hollow yes/later fork", () => {
    expect(talks).not.toMatch(/Maybe later!/);
    expect(talks).toMatch(/What do you notice\?/);
  });

  it("party board prizes are Cashflow Claims", () => {
    expect(board).toContain(`label: BOARD_CASHFLOW_CLAIM_LABEL`);
    expect(board).toMatch(/makeBoardCashflowClaim/);
    expect(board).not.toMatch(/label: "Ledger Seal"/);
    expect(BOARD_CASHFLOW_CLAIM_LABEL).toBe("Cashflow Claim");
  });

  it("Soft Beat uses scar vista helper", () => {
    expect(soft).toMatch(/softBeatScarVistaLine/);
  });

  it("share overlay supports local Witness stamps", () => {
    expect(share).toMatch(/onWitness/);
    expect(hub).toMatch(/recordShareWitness/);
    expect(hub).toMatch(/family-challenge-panel/);
  });

  it("Memory Plinth modal drops stance chrome", () => {
    expect(hub).not.toMatch(/stanceLine \?/);
  });

  it("exposes optional mastery digression from island play pads", () => {
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(play).toMatch(/onOpenMasteryDigression/);
    expect(play).toMatch(/Optional digression/);
    expect(app).toMatch(/onOpenMasteryDigression/);
    expect(app).toMatch(/setPendingMastery/);
  });

  it("ships local health dashboard with ITR honesty", () => {
    const analytics = readFileSync(join(__dirname, "analytics/AnalyticsExportView.tsx"), "utf8");
    expect(analytics).toMatch(/health-dashboard/);
    expect(analytics).toMatch(/Local device ITR|not a remote cohort|Local ENGAGEMENT/i);
    expect(analytics).toMatch(/analyzeHealthDashboard/);
  });
});
