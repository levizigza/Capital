import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ASHORE_SPINE_PAINTING_PLACES,
  ASHORE_TEACH_STEP_COUNT,
} from "./AshoreComprehensionTutorial";

describe("Ashore comprehension tutorial (iconic Chamber 00)", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const teach = readFileSync(
    join(__dirname, "AshoreComprehensionTutorial.tsx"),
    "utf8",
  );
  const pad = readFileSync(
    join(__dirname, "../world3d/VoyagerWalkPracticeStage.tsx"),
    "utf8",
  );
  const design = readFileSync(
    join(__dirname, "../../../docs/ashore-teach-design.md"),
    "utf8",
  );
  const criteria = readFileSync(
    join(__dirname, "../../../docs/ashore-iconic-criteria.md"),
    "utf8",
  );

  it("boots title → cast → teach → carpet and passes the Voyager", () => {
    expect(app).toMatch(/bootPhase.*"teach"/);
    expect(app).toMatch(/AshoreComprehensionTutorial/);
    expect(app).toMatch(/character=\{bootCharacter/);
    expect(app).toMatch(/setBootPhase\("teach"\)/);
    expect(app).toMatch(/setBootPhase\("carpet"\)/);
  });

  it("keeps Chamber 00 to five prove-it beats in one seed chamber", () => {
    expect(ASHORE_TEACH_STEP_COUNT).toBe(5);
    expect(teach).toMatch(/data-teach-mode="chamber-00"/);
    expect(teach).toMatch(/data-iconic="seed-chamber"/);
    expect(teach).toMatch(/"fantasy"/);
    expect(teach).toMatch(/"walk"/);
    expect(teach).toMatch(/"talk"/);
    expect(teach).toMatch(/"dock"/);
    expect(teach).toMatch(/"ready"/);
    expect(teach).not.toMatch(/"paycheck"/);
    expect(teach).not.toMatch(/"credit"/);
    expect(teach).not.toMatch(/"return_scar"/);
    expect(teach).not.toMatch(/"enter"/);
    expect(teach).not.toMatch(/PaintingLessonShowcase/);
    expect(teach).not.toMatch(/ShareCardShowcase/);
    expect(teach).not.toMatch(/EnterStructuresShowcase/);
    expect(design).toMatch(/One room, five proves/);
  });

  it("teaches with full-bleed Voyager pad and marker claims", () => {
    expect(teach).toMatch(/VoyagerWalkPracticeStage/);
    expect(teach).toMatch(/ashore-comprehension-tutorial/);
    expect(pad).toMatch(/VoyagerMesh/);
    expect(pad).toMatch(/mergeWalkIntent|stepWalkVelocity/);
    expect(pad).toMatch(/onClaimMarker/);
    expect(pad).toMatch(/Piggy/);
  });

  it("fantasy pokes in-world organ toys; dock boards MoneyCarpet Cove", () => {
    expect(ASHORE_SPINE_PAINTING_PLACES).toEqual([
      "Harbor Haven",
      "Coincraft Cove",
      "Paycheck Peninsula",
      "Credit Kingdom",
    ]);
    expect(teach).not.toMatch(/FantasyOrganToys/);
    expect(teach).not.toMatch(/CarpetDockShowcase/);
    expect(teach).toMatch(/onPokeOrgan/);
    expect(teach).toMatch(/onBoardCove/);
    expect(teach).toMatch(/ashore-teach-route/);
    expect(teach).toMatch(/Coincraft Cove/);
    expect(pad).toMatch(/OrganToyMesh|ORGAN_TOYS/);
    expect(pad).toMatch(/MoneyCarpet/);
    expect(pad).toMatch(/CoveCarpetGate/);
    expect(pad).toMatch(/mode === "fantasy"/);
    expect(pad).toMatch(/mode === "dock"/);
  });

  it("keeps opening music bed and organ stingers", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
    expect(teach).toMatch(/playOrganSfx/);
    expect(pad).toMatch(/playOrganSfx/);
  });

  it("uses Leave · Esc and body proves — not SaaS Skip / collect-all", () => {
    expect(teach).toMatch(/Leave · Esc/);
    expect(teach).toMatch(/pointerSafeActivate/);
    expect(teach).toMatch(/Living money waits|Board the glowing carpet/);
    expect(teach).not.toMatch(/Visit all four/);
    expect(teach).not.toMatch(/Light all six/);
    expect(teach).not.toMatch(/>\s*Skip\s*</);
  });

  it("auto-advances after fantasy poke — invisible FTUE, no homework Continue", () => {
    expect(teach).toMatch(/data-iconic="seed-chamber"/);
    expect(teach).toMatch(/data-sacred="seed-of-life"/);
    expect(teach).toMatch(/fantasyDone/);
    expect(teach).toMatch(/setTimeout\(advance/);
    expect(teach).not.toMatch(/Enter the walk chamber/);
    expect(teach).not.toMatch(/Chamber 1 · Fantasy/);
    expect(teach).not.toMatch(/Seed petals/);
    expect(criteria).toMatch(/Toys in the world/);
  });
});
