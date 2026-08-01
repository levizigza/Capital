import { describe, expect, it } from "vitest";
import { structureShell } from "./structureInteriorTheme";

describe("structure interior never-void", () => {
  it("exposes readable shell colors for every Money Structure theme", () => {
    for (const theme of ["jar", "bank", "tower", "keep"] as const) {
      const shell = structureShell(theme);
      expect(shell.bg.startsWith("#")).toBe(true);
      expect(shell.wallOp).toBeGreaterThanOrEqual(0.45);
      expect(shell.accent.startsWith("#")).toBe(true);
      expect(shell.floor.startsWith("#")).toBe(true);
      expect(shell.exit.startsWith("#")).toBe(true);
      expect(shell.fillLight.startsWith("#")).toBe(true);
    }
  });

  it("keeps Money Structure shells organ-true (exits and fills diverge)", () => {
    const jar = structureShell("jar");
    const tower = structureShell("tower");
    const keep = structureShell("keep");
    const bank = structureShell("bank");
    expect(new Set([jar.exit, tower.exit, keep.exit, bank.exit]).size).toBe(4);
    expect(jar.accent).toBe("#fbbf24");
    expect(tower.accent).toBe("#38bdf8");
    expect(keep.accent).toBe("#a78bfa");
    expect(bank.accent).toBe("#f59e0b");
    expect(jar.floor).not.toBe(tower.floor);
  });
});
