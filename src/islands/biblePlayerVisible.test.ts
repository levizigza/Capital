import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BIBLE_RUNTIME_LAWS, BOARD_STAR_LABEL } from "@/design/designBible";

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

  it("hides Islands XP from party reward chrome", () => {
    expect(reward).not.toMatch(/\+\{reward\.xp\} XP/);
    expect(reward).toMatch(/Board Star/);
  });

  it("does not mount SkillStatsPanel on island play", () => {
    expect(play).not.toMatch(/LazySkillStatsPanel/);
    expect(play).not.toMatch(/SkillStatsPanel/);
  });

  it("tip Talk has no hollow yes/later fork", () => {
    expect(talks).not.toMatch(/Maybe later!/);
    expect(talks).toMatch(/What do you notice\?/);
  });

  it("party board prizes are Board Stars", () => {
    expect(board).toContain(`label: "${BOARD_STAR_LABEL}"`);
    expect(board).not.toMatch(/label: "Ledger Seal"/);
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
});
