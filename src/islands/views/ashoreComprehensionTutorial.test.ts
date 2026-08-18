import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ASHORE_SPINE_PAINTING_PLACES,
  ASHORE_TEACH_STEP_COUNT,
} from "./AshoreComprehensionTutorial";

describe("Ashore comprehension tutorial (Chamber 00)", () => {
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
    // Experienced checkbox can skip teach → carpet; new players still land on teach.
    expect(app).toMatch(/setBootPhase\(opts\?\.experiencedPlayer \? "carpet" : "teach"\)/);
    expect(app).toMatch(/setBootPhase\("carpet"\)/);
  });

  it("keeps Chamber 00 to five prove-it steps", () => {
    expect(ASHORE_TEACH_STEP_COUNT).toBe(5);
    expect(teach).toMatch(/data-teach-mode="chamber-00"/);
    expect(teach).toMatch(/"fantasy"/);
    expect(teach).toMatch(/"walk"/);
    expect(teach).toMatch(/"talk"/);
    expect(teach).toMatch(/"dock"/);
    expect(teach).toMatch(/"ready"/);
    expect(teach).not.toMatch(/"paycheck"/);
    expect(teach).not.toMatch(/"credit"/);
    expect(teach).not.toMatch(/"return_scar"/);
    expect(teach).not.toMatch(/stepId === "enter"/);
    expect(teach).not.toMatch(/PaintingLessonShowcase/);
    expect(teach).not.toMatch(/ShareCardShowcase/);
    expect(teach).not.toMatch(/EnterStructuresShowcase/);
  });

  it("teaches with visible Voyager walk pad and marker claims", () => {
    expect(teach).toMatch(/VoyagerWalkPracticeStage/);
    expect(teach).toMatch(/MURAL_THESIS/);
    expect(teach).toMatch(/ashore-comprehension-tutorial/);
    expect(pad).toMatch(/VoyagerMesh/);
    expect(pad).toMatch(/mergeWalkIntent|stepWalkVelocity/);
    expect(pad).toMatch(/onClaimMarker/);
    expect(pad).toMatch(/Piggy/);
  });

  it("fantasy pokes organ toys; dock boards Cove; launch names first voyage", () => {
    expect(ASHORE_SPINE_PAINTING_PLACES).toEqual([
      "Harbor Haven",
      "Coincraft Cove",
      "Paycheck Peninsula",
      "Credit Kingdom",
    ]);
    expect(teach).toMatch(/FantasyOrganToys/);
    expect(teach).toMatch(/CarpetDockShowcase/);
    expect(teach).toMatch(/ReadyCarpetShowcase/);
    expect(teach).toMatch(/ashore-teach-route/);
    expect(teach).toMatch(/Harbor, then Cove/);
    expect(show).toMatch(/ashore-fantasy-toys/);
    expect(show).toMatch(/ashore-carpet-showcase/);
    expect(show).toMatch(/ashore-carpet-board-cove/);
    expect(show).toMatch(/ashore-ready-showcase/);
    expect(show).toMatch(/drawMemoryPlinthSilhouette/);
  });

  it("keeps opening music bed and organ stingers", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
    expect(teach).toMatch(/playOrganSfx/);
  });

  it("uses Leave binding and prove gates — not SaaS Skip / collect-all", () => {
    expect(teach).toMatch(/Leave ·/);
    expect(teach).toMatch(/cancelPrompt/);
    expect(teach).toMatch(/pointerSafeActivate/);
    expect(teach).toMatch(/Poke a living-money toy|Board Cove first/);
    expect(teach).not.toMatch(/Visit all four/);
    expect(teach).not.toMatch(/Light all six/);
    expect(teach).not.toMatch(/>\s*Skip\s*</);
  });

  it("keeps Fantasy toys + Continue on a sticky prove dock (no below-fold soft-lock)", () => {
    expect(teach).toMatch(/ashore-teach-prove-dock/);
    expect(teach).toMatch(/ashore-teach-scroll/);
    expect(teach).toMatch(/compactPad/);
    expect(teach).toMatch(/aria-disabled=\{!fantasyDone\}/);
    expect(teach).toMatch(/setToyNudge\(true\)/);
    expect(show).toMatch(/Tap to poke/);
    expect(show).toMatch(/data-nudge/);
  });

  it("uses binding-aware interact via InputManager", () => {
    expect(teach).toMatch(/useInputAction\(\s*["']interact["']/);
    expect(teach).toMatch(/formatMovePhrase/);
  });
});
