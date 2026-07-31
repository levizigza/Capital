import { describe, expect, it } from "vitest";
import { structureShell } from "./structureInteriorTheme";

describe("structure interior never-void", () => {
  it("exposes readable shell colors for every Money Structure theme", () => {
    for (const theme of ["jar", "bank", "tower", "keep"] as const) {
      const shell = structureShell(theme);
      expect(shell.bg.startsWith("#")).toBe(true);
      expect(shell.wallOp).toBeGreaterThanOrEqual(0.45);
      expect(shell.accent.startsWith("#")).toBe(true);
    }
  });
});
