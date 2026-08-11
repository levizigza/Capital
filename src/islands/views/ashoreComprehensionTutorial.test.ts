import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Ashore comprehension tutorial", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const teach = readFileSync(
    join(__dirname, "AshoreComprehensionTutorial.tsx"),
    "utf8",
  );

  it("boots title → cast → teach → carpet", () => {
    expect(app).toMatch(/bootPhase.*"teach"/);
    expect(app).toMatch(/AshoreComprehensionTutorial/);
    expect(app).toMatch(/setBootPhase\("teach"\)/);
    expect(app).toMatch(/setBootPhase\("carpet"\)/);
  });

  it("gates walk right/left/forward and E before Harbor jobs", () => {
    expect(teach).toMatch(/walk_right/);
    expect(teach).toMatch(/walk_left/);
    expect(teach).toMatch(/walk_forward/);
    expect(teach).toMatch(/interact/);
    expect(teach).toMatch(/ArrowRight/);
    expect(teach).toMatch(/KeyE/);
    expect(teach).toMatch(/ashore-comprehension-tutorial/);
    expect(teach).toMatch(/Four living organs|Harbor Haven/);
  });

  it("keeps opening music bed (voyage/opening cue path)", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
  });
});
