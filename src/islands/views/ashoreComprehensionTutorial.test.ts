import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

  it("keeps opening music bed and organ stingers", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
    expect(teach).toMatch(/playOrganSfx/);
  });
});
