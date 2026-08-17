import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pattern library honesty gate — ship Hold until every Gap/Thin/Hold is closed.
 */
describe("Capital Pattern Library honesty bar", () => {
  const root = join(__dirname, "../..");
  const path = join(root, "docs/capital-pattern-library.md");

  it("exists and does not claim false 100% ship", () => {
    expect(existsSync(path)).toBe(true);
    const body = readFileSync(path, "utf8");
    expect(body).toMatch(/Pass K/);
    expect(body).toMatch(/Ship iconic vs library\?\*\* \*\*Hold\*\*/);
    expect(body).not.toMatch(/Ship verdict \(Pass I.*100% Pass/);
  });

  it("requires individual rows 1–100 (no range lumps)", () => {
    const body = readFileSync(path, "utf8");
    expect(body).not.toMatch(/\|\s*\d+\s*[–-]\s*\d+\s*\|/);
    const nums = new Set<number>();
    for (const m of body.matchAll(/^\|\s*(\d+)\s*\|/gm)) {
      nums.add(Number(m[1]));
    }
    expect([...nums].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
  });

  it("keeps #94 Hold until real non-designer proof", () => {
    const body = readFileSync(path, "utf8");
    expect(body).toMatch(/94 \| Test with non-designers \| \*\*Hold\*\*/);
    const human = readFileSync(join(root, "docs/pattern-human-playtest.md"), "utf8");
    expect(human).toMatch(/Current:\s*\n\s*\n`HUMAN_PLAYTEST: PENDING`/);
  });

  it("keeps Soft Beat exit + fail organ evidence available", () => {
    expect(existsSync(join(root, "scripts/cold-structure-soft-beat-exit.mjs"))).toBe(true);
    const fail = readFileSync(join(root, "src/islands/minigameFail.ts"), "utf8");
    expect(fail).toMatch(/organVerbChip|Still learning/);
  });
});
