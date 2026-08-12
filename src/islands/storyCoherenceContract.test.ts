import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MAIN_COURSE } from "./mainCourse";
import { postHomecomingVisualBeats } from "./story/dialogueActionSync";

/**
 * Story coherence pass — one myth Harbor → Cove → Paycheck → Credit.
 * Canon: docs/story-coherence-pass.md
 */
describe("story coherence contract", () => {
  it("keeps player-facing main course titles free of SM64 / n-of-m chrome", () => {
    for (const step of MAIN_COURSE) {
      expect(step.title).not.toMatch(/Castle Grounds|First Painting|Budget Course|Ordeal/);
      expect(step.title).not.toMatch(/\(\d+\/\d+\)/);
    }
    const play = readFileSync(join(__dirname, "views/IslandPlayView.tsx"), "utf8");
    const course = readFileSync(join(__dirname, "views/CourseWorldOverlay.tsx"), "utf8");
    expect(play).not.toMatch(/Main course clear/);
    expect(play).not.toMatch(/Next Main Quest/);
    expect(play).not.toMatch(/courseProg\.(done|total)/);
    expect(course).not.toMatch(/Main Course ·/);
    expect(course).not.toMatch(/Main course painting/);
  });

  it("forbids Clock Take mythology and era-shore primary tips", () => {
    const bag = readFileSync(join(__dirname, "story/coinBagBuddy.ts"), "utf8");
    const sync = readFileSync(join(__dirname, "story/dialogueActionSync.ts"), "utf8");
    const map = readFileSync(join(__dirname, "views/TravelMapView.tsx"), "utf8");
    expect(bag).not.toMatch(/Clock Take/);
    expect(bag).toMatch(/Clock shelters/);
    expect(sync).not.toMatch(/Era shores woke up/);
    expect(sync).not.toMatch(/side shores open/);
    expect(map).not.toMatch(/side shores on map/);
    const pay = postHomecomingVisualBeats("Paycheck Peninsula");
    expect(pay.bagTip).not.toMatch(/side shore/i);
  });

  it("spine shore HUD drops genre canon lead", () => {
    const shore = readFileSync(join(__dirname, "views/IslandShoreView.tsx"), "utf8");
    expect(shore).toMatch(/isSpineContentIslandId/);
    expect(shore).toMatch(/spineShore/);
  });

  it("Soft Beat Memory + side-shore arrive stay one mythology", () => {
    const soft = readFileSync(join(__dirname, "views/SoftBeatOverlay.tsx"), "utf8");
    const arrive = readFileSync(join(__dirname, "views/WorldArriveOverlay.tsx"), "utf8");
    expect(soft).toMatch(/every plaque on the Plinth/);
    expect(soft).not.toMatch(/every jar and stamp/);
    expect(arrive).not.toMatch(/toy diorama/);
    expect(arrive).toMatch(/quiet discovery/);
  });

  it("Paycheck story-circle docs drop Dotgraph Atoll", () => {
    const doc = readFileSync(
      join(__dirname, "../../docs/islands/paycheck-peninsula/story-circle.md"),
      "utf8",
    );
    expect(doc).not.toMatch(/Dotgraph/);
    expect(doc).toMatch(/Paycheck Peninsula/);
  });
});
