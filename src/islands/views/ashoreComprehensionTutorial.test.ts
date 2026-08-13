import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ASHORE_SPINE_PAINTING_PLACES,
  ASHORE_TEACH_STEP_COUNT,
} from "./AshoreComprehensionTutorial";

describe("Ashore comprehension tutorial (iconic chambers)", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const teach = readFileSync(
    join(__dirname, "AshoreComprehensionTutorial.tsx"),
    "utf8",
  );
  const pad = readFileSync(
    join(__dirname, "../world3d/VoyagerWalkPracticeStage.tsx"),
    "utf8",
  );
  const show = readFileSync(join(__dirname, "AshoreTeachShowcases.tsx"), "utf8");

  it("boots title → cast → teach → carpet and passes the Voyager", () => {
    expect(app).toMatch(/bootPhase.*"teach"/);
    expect(app).toMatch(/AshoreComprehensionTutorial/);
    expect(app).toMatch(/character=\{bootCharacter/);
    expect(app).toMatch(/setBootPhase\("teach"\)/);
    expect(app).toMatch(/setBootPhase\("carpet"\)/);
  });

  it("expands into one-idea chambers with body prove for walk/talk", () => {
    expect(ASHORE_TEACH_STEP_COUNT).toBeGreaterThanOrEqual(12);
    expect(teach).toMatch(/VoyagerWalkPracticeStage/);
    expect(teach).toMatch(/"fantasy"/);
    expect(teach).toMatch(/"walk"/);
    expect(teach).toMatch(/"talk"/);
    expect(teach).toMatch(/"harbor"/);
    expect(teach).toMatch(/"carpet"/);
    expect(teach).toMatch(/"cove"/);
    expect(teach).toMatch(/"paycheck"/);
    expect(teach).toMatch(/"credit"/);
    expect(teach).toMatch(/"return_scar"/);
    expect(teach).toMatch(/"enter"/);
    expect(teach).toMatch(/"share"/);
    expect(teach).toMatch(/"ready"/);
    expect(teach).toMatch(/MURAL_THESIS/);
    expect(teach).toMatch(/ashore-comprehension-tutorial/);
    expect(pad).toMatch(/VoyagerMesh/);
    expect(pad).toMatch(/mergeWalkIntent|stepWalkVelocity/);
    expect(pad).toMatch(/onClaimMarker/);
    expect(pad).toMatch(/Piggy/);
  });

  it("gives each spine painting its own lesson chamber", () => {
    expect(ASHORE_SPINE_PAINTING_PLACES).toEqual([
      "Harbor Haven",
      "Coincraft Cove",
      "Paycheck Peninsula",
      "Credit Kingdom",
    ]);
    expect(teach).toMatch(/PAINTING_LESSONS/);
    expect(teach).toMatch(/PaintingLessonShowcase/);
    expect(teach).toMatch(/First painting · first game/);
    expect(teach).toMatch(/Second painting · payday pressure/);
    expect(teach).toMatch(/Third painting · interest gravity/);
    expect(teach).toMatch(/ashore-teach-route/);
    expect(show).toMatch(/Jar before treat/);
    expect(show).toMatch(/Umbrella before glitter/);
    expect(show).toMatch(/Waited the spiral/);
    expect(show).toMatch(/Practice the Take/);
    expect(show).toMatch(/Keeper Kira/);
    expect(show).toMatch(/Vendor Vee/);
    expect(show).toMatch(/Rex the Collector/);
  });

  it("showcases Harbor, Carpet, Plinth return, Enter, and Share as dedicated visuals", () => {
    expect(teach).toMatch(/HarborHomeShowcase/);
    expect(teach).toMatch(/CarpetDockShowcase/);
    expect(teach).toMatch(/ReturnScarShowcase/);
    expect(teach).toMatch(/EnterStructuresShowcase/);
    expect(teach).toMatch(/ShareCardShowcase/);
    expect(teach).toMatch(/ReadyCarpetShowcase/);
    expect(teach).not.toMatch(/ashore-fantasy-paintings/);
    expect(show).toMatch(/ashore-harbor-showcase/);
    expect(show).toMatch(/ashore-carpet-showcase/);
    expect(show).toMatch(/ashore-painting-lesson/);
    expect(show).toMatch(/ashore-return-showcase/);
    expect(show).toMatch(/ashore-enter-showcase/);
    expect(show).toMatch(/ashore-share-showcase/);
    expect(show).toMatch(/drawMemoryPlinthSilhouette/);
    expect(show).toMatch(/Soft Beat peeks/);
    expect(show).toMatch(/Arcade pads/);
  });

  it("keeps opening music bed and organ stingers", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
    expect(teach).toMatch(/playOrganSfx/);
  });

  it("uses Leave · Esc and prove gates — not SaaS Skip / collect-all", () => {
    expect(teach).toMatch(/Leave · Esc/);
    expect(teach).toMatch(/pointerSafeActivate/);
    expect(teach).toMatch(/Practice one Take fork|Light all three|Board Cove first/);
    expect(teach).not.toMatch(/Visit all four/);
    expect(teach).not.toMatch(/Light all six/);
    expect(teach).not.toMatch(/>\s*Skip\s*</);
  });
});
