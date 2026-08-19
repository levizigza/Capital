import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HARBOR_LOCAL_CAST } from "./moneyCast";
import { familyPlaqueMythLine } from "./familyRoom";
import {
  coldOrganKidSentence,
  coldSpectacleHeadline,
  coldRetellLine,
} from "./worldMemory";

/**
 * Pillar 12 — Story Bible only: one cold sentence per organ;
 * inventing a second mythology fails the pass.
 */
describe("Pillar 12 story cold retell", () => {
  it("locks four organ kid sentences to suit verbs", () => {
    expect(coldOrganKidSentence("coin")).toBe(
      "The Coin holds — save a little; the jar still waits.",
    );
    expect(coldOrganKidSentence("clock")).toBe(
      "The Clock shelters — wait under the umbrella before glitter.",
    );
    expect(coldOrganKidSentence("spiral")).toBe(
      "The Spiral withstands — wait beats haste on the interest wall.",
    );
    expect(coldOrganKidSentence("memory")).toBe(
      "Memory keeps — Harbor remembers your Take on the Plinth.",
    );
  });

  it("keeps spectacle headline + plaque retell + Family myth on one mythology", () => {
    const cove = {
      id: "cove_saver_plaque",
      islandId: "coincraft_cove",
      label: "Jar before treat",
    };
    expect(coldSpectacleHeadline(cove)).toBe("Harbor felt that — jar or treat · Coin holds");
    expect(coldRetellLine(cove)).toMatch(/You chose with the Coin/);
    expect(coldRetellLine(cove)).toMatch(/Jar before treat/);
    expect(familyPlaqueMythLine(cove.label, "coin")).toBe(
      'The Coin holds — Harbor remembered: “Jar before treat.” Local myth — and so do you.',
    );
    // Competing Harmon-as-organ names are bugs
    const spectacleSrc = readFileSync(
      join(__dirname, "worldMemory.ts"),
      "utf8",
    );
    expect(spectacleSrc).not.toMatch(/Harbor felt the Coin Change/);
    expect(spectacleSrc).not.toMatch(/Harbor felt the Clock Take/);
  });

  it("keeps Debt Collector off the Harbor terrace cast", () => {
    expect(HARBOR_LOCAL_CAST.some((s) => s.mascotId === "debt_collector")).toBe(false);
  });

  it("wires kid sentences onto Soft Beat, share, day-2, spectacle, and Piggy homecoming", () => {
    const views = join(__dirname, "views");
    const soft = readFileSync(join(views, "SoftBeatOverlay.tsx"), "utf8");
    const share = readFileSync(join(views, "HarborFeltShareOverlay.tsx"), "utf8");
    const day2 = readFileSync(join(views, "Day2EchoOverlay.tsx"), "utf8");
    const spectacle = readFileSync(join(views, "ScarSpectacleOverlay.tsx"), "utf8");
    const talks = readFileSync(join(__dirname, "story/harborTalks.ts"), "utf8");
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    const recovery = readFileSync(join(__dirname, "ftueQuestRecovery.ts"), "utf8");
    const chapter = readFileSync(join(__dirname, "chapterLoop.ts"), "utf8");
    const homecoming = `${app}\n${recovery}\n${chapter}`;
    expect(soft).toMatch(/coldOrganKidSentence/);
    expect(soft).toMatch(/soft-beat-retell/);
    expect(soft).toMatch(/data-soft-beat-climb/);
    expect(soft).toMatch(/Climb the lid/);
    expect(soft).toMatch(/Climb the loft/);
    expect(soft).toMatch(/Climb the wall/);
    expect(soft).toMatch(/Step to the teller/);
    expect(soft).not.toMatch(/After the Coin Take/);
    // Soft Beat aspiration — structure peek, not Harbor retell / re-Take
    expect(soft).not.toMatch(/Harbor felt that/);
    expect(soft).toMatch(/Not a second Take/);
    expect(share).toMatch(/harbor-felt-kid-sentence/);
    expect(day2).toMatch(/day2-echo-kid-sentence/);
    expect(day2).toMatch(/Still here — \$\{verbChip\} overnight|Still here —.*overnight/);
    expect(day2).toMatch(/organVerbChip/);
    expect(spectacle).toMatch(/scar-spectacle-kid-sentence/);
    expect(spectacle).toMatch(/coldOrganKidSentence/);
    expect(talks).toMatch(/coldOrganKidSentence/);
    expect(homecoming).toMatch(/The Coin holds — save a little|The Coin holds — Harbor felt your Take/);
    expect(homecoming).toMatch(
      /The Clock kept the loft dry|The Clock still names the rain gossip|The Clock shelters — Harbor felt the stamp|The Clock shelters — wait under the umbrella/,
    );
    expect(homecoming).toMatch(
      /The Spiral withstands — wait beats haste|The Spiral withstands — Harbor kept your Ordeal/,
    );
  });
});
