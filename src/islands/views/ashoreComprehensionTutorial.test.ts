import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ASHORE_SPINE_PAINTING_PLACES } from "./AshoreComprehensionTutorial";

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

  it("boots title → cast → teach → carpet and passes the Voyager", () => {
    expect(app).toMatch(/bootPhase.*"teach"/);
    expect(app).toMatch(/AshoreComprehensionTutorial/);
    expect(app).toMatch(/character=\{bootCharacter/);
    expect(app).toMatch(/setBootPhase\("teach"\)/);
    expect(app).toMatch(/setBootPhase\("carpet"\)/);
  });

  it("teaches with visible Voyager walk pad and marker claims", () => {
    expect(teach).toMatch(/VoyagerWalkPracticeStage/);
    expect(teach).toMatch(/walk/);
    expect(teach).toMatch(/talk/);
    expect(teach).toMatch(/loop/);
    expect(teach).toMatch(/organs/);
    expect(teach).toMatch(/toolkit/);
    expect(teach).toMatch(/MURAL_THESIS|MONEY_ORGANS/);
    expect(teach).toMatch(/ashore-comprehension-tutorial/);
    expect(pad).toMatch(/VoyagerMesh/);
    expect(pad).toMatch(/mergeWalkIntent|stepWalkVelocity/);
    expect(pad).toMatch(/onClaimMarker/);
    expect(pad).toMatch(/Piggy/);
  });

  it("shows spine paintings with place names and where to play", () => {
    expect(ASHORE_SPINE_PAINTING_PLACES).toEqual([
      "Harbor Haven",
      "Coincraft Cove",
      "Paycheck Peninsula",
      "Credit Kingdom",
    ]);
    expect(teach).toMatch(/Where the games live/);
    expect(teach).toMatch(/spine-paintings/);
    expect(teach).toMatch(/Play here:/);
    expect(teach).toMatch(/Coincraft Cove/);
    expect(teach).toMatch(/Payroll Tower/);
    expect(teach).toMatch(/Interest Keep/);
    expect(teach).toMatch(/coldOrganKidSentence/);
    expect(teach).toMatch(/ashore-teach-route/);
    expect(teach).toMatch(/Prove one painting/);
  });

  it("showcases in-game looks for loop, paintings, toolkit, and carpet", () => {
    const show = readFileSync(join(__dirname, "AshoreTeachShowcases.tsx"), "utf8");
    expect(teach).toMatch(/AshoreTeachShowcases/);
    expect(teach).toMatch(/LoopBeatShowcase/);
    expect(teach).toMatch(/SpinePaintingPortal/);
    expect(teach).toMatch(/ToolkitVerbShowcase/);
    expect(teach).toMatch(/ReadyCarpetShowcase/);
    expect(teach).toMatch(/ashore-fantasy-paintings/);
    expect(show).toMatch(/ashore-painting-portal/);
    expect(show).toMatch(/ashore-loop-showcase/);
    expect(show).toMatch(/ashore-toolkit-showcase/);
    expect(show).toMatch(/ashore-ready-showcase/);
    expect(show).toMatch(/drawMemoryPlinthSilhouette/);
    expect(show).toMatch(/data-painting-hero/);
    expect(show).toMatch(/Jar before treat/);
  });

  it("keeps opening music bed and organ stingers", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
    expect(teach).toMatch(/playOrganSfx/);
  });

  it("uses Leave · Esc and prove-one gates — not SaaS Skip / collect-all", () => {
    expect(teach).toMatch(/Leave · Esc/);
    expect(teach).toMatch(/pointerSafeActivate/);
    expect(teach).toMatch(/Prove one painting|Light one verb/);
    expect(teach).not.toMatch(/Visit all four/);
    expect(teach).not.toMatch(/Light all six/);
    expect(teach).not.toMatch(/>\s*Skip\s*</);
  });
});
