import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  briefingReady,
  HARBOR_BRIEFING_CARDS,
  HARBOR_BRIEFING_GOAL,
  requiredBriefingIds,
} from "./harborWorldBriefing";

describe("harbor world briefing", () => {
  it("names Harbor home, Cove first, later spine, and optional side shores", () => {
    expect(HARBOR_BRIEFING_CARDS.map((c) => c.id)).toEqual([
      "harbor_haven",
      "coincraft_cove",
      "paycheck_peninsula",
      "credit_kingdom",
      "side_shores",
    ]);
    expect(requiredBriefingIds()).toEqual(["harbor_haven", "coincraft_cove"]);
    expect(briefingReady([])).toBe(false);
    expect(briefingReady(["harbor_haven"])).toBe(false);
    expect(briefingReady(["harbor_haven", "coincraft_cove"])).toBe(true);
    expect(HARBOR_BRIEFING_GOAL).toMatch(/Harbor keeps/i);
    expect(HARBOR_BRIEFING_CARDS.find((c) => c.id === "side_shores")?.games).toMatch(/Kart|neon|orbital/i);
  });

  it("never maps Cove Take onto Paycheck in Piggy lines", () => {
    const blob = HARBOR_BRIEFING_CARDS.map((c) => `${c.piggyLine} ${c.objective}`).join(" ");
    expect(blob).not.toMatch(/this is the Take/i);
    expect(blob).not.toMatch(/same as Cove|just like Cove|umbrella is jar/i);
    expect(blob).toMatch(/I won't map the answer/i);
  });

  it("overlay is interactive paintings, not a text dump", () => {
    const view = readFileSync(join(__dirname, "views/HarborWorldBriefing.tsx"), "utf8");
    expect(view).toMatch(/harbor-world-briefing/);
    expect(view).toMatch(/harbor-brief-card-\$\{c\.id\}/);
    expect(view).toMatch(/SpinePaintingPortal/);
    expect(view).toMatch(/disabled=\{!ready\}/);
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/HarborWorldBriefing/);
    expect(app).toMatch(/setWorldBriefOpen\(true\)/);
  });
});
