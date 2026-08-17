import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ICONIC_PROOF_BAR_HOLDS_NEEDLE,
  ICONIC_PROOF_BOARDS,
  ICONIC_PROOF_COLD_SCRIPTS,
  ICONIC_PROOF_HARNESS_MAY,
  ICONIC_PROOF_MUST_BE_LIVE,
  ICONIC_PROOF_NOT_SCORED,
  ICONIC_PROOF_SCOPE,
} from "./iconicProofLaw";

const root = join(__dirname, "../..");

describe("Iconic 100% proof law", () => {
  it("scores only the frozen spine", () => {
    expect(ICONIC_PROOF_SCOPE).toMatch(/Harbor/);
    expect(ICONIC_PROOF_SCOPE).toMatch(/Cove/);
    expect(ICONIC_PROOF_SCOPE).toMatch(/Paycheck/);
    expect(ICONIC_PROOF_SCOPE).toMatch(/Credit/);
    expect(ICONIC_PROOF_NOT_SCORED.join(" ")).toMatch(/SIDE SHORE/);
    expect(ICONIC_PROOF_NOT_SCORED.join(" ")).toMatch(/iconic-later/);
  });

  it("keeps every official cold script on disk", () => {
    expect(ICONIC_PROOF_COLD_SCRIPTS.length).toBeGreaterThanOrEqual(9);
    for (const script of ICONIC_PROOF_COLD_SCRIPTS) {
      expect(existsSync(join(root, script)), `missing ${script}`).toBe(true);
    }
  });

  it("names harness vs live so QA is law, not a caveat", () => {
    expect(ICONIC_PROOF_HARNESS_MAY.join(" ")).toMatch(/enterIsland/);
    expect(ICONIC_PROOF_MUST_BE_LIVE.join(" ")).toMatch(/Coin holds/);
    expect(ICONIC_PROOF_MUST_BE_LIVE.join(" ")).toMatch(/money-structure-exit/);
    const bridge = readFileSync(join(root, "src/qa/qaBridge.ts"), "utf8");
    expect(bridge).toMatch(/Official headless harness/);
  });

  it("closes later-list + board asterisks", () => {
    for (const board of ICONIC_PROOF_BOARDS) {
      expect(existsSync(join(root, board)), board).toBe(true);
    }
    const later = readFileSync(join(root, "docs/iconic-later.md"), "utf8");
    expect(later).toContain(ICONIC_PROOF_BAR_HOLDS_NEEDLE);
    expect(later).toMatch(/not a remaining 100% gap/i);

    const full = readFileSync(join(root, "docs/full-game-craft-board.md"), "utf8");
    expect(full).toMatch(/\*\*100%\*\*/);
    expect(full).toMatch(/Official harness/);
    expect(full).not.toMatch(/Honesty: several colds use/);
    expect(full).toMatch(/Pass R/);
  });
});
