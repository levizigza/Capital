import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  ICONIC_COLD_CHECKLIST,
  ICONIC_E2E_SPECS,
  ICONIC_ITERATION_QUESTIONS,
  ICONIC_PILLAR_CONTRACTS,
  iconicUnitTestPaths,
} from "./iconicCraftCadence";

const root = join(__dirname, "../..");

describe("Iconic craft cadence (Pillar 16)", () => {
  it("asks the six cold-iteration questions", () => {
    expect(ICONIC_ITERATION_QUESTIONS).toHaveLength(6);
    expect(ICONIC_ITERATION_QUESTIONS.join(" ")).toMatch(/misunderstand/i);
    expect(ICONIC_ITERATION_QUESTIONS.join(" ")).toMatch(/unfair/i);
    expect(ICONIC_ITERATION_QUESTIONS.join(" ")).toMatch(/repetitive/i);
    expect(ICONIC_ITERATION_QUESTIONS.join(" ")).toMatch(/ability/i);
    expect(ICONIC_ITERATION_QUESTIONS.join(" ")).toMatch(/lost/i);
    expect(ICONIC_ITERATION_QUESTIONS.join(" ")).toMatch(/fun/i);
  });

  it("maps every cold checklist row to human and/or real guard files", () => {
    expect(ICONIC_COLD_CHECKLIST.length).toBeGreaterThanOrEqual(16);
    for (const row of ICONIC_COLD_CHECKLIST) {
      const humanOk = row.modes.includes("human");
      const hasGuards = row.guards.length > 0;
      expect(
        humanOk || hasGuards,
        `${row.id}: must be human-only or guarded`,
      ).toBe(true);
      for (const g of row.guards) {
        expect(existsSync(join(root, g)), `missing guard for ${row.id}: ${g}`).toBe(
          true,
        );
      }
    }
  });

  it("keeps pillar 7–17 contracts on disk", () => {
    const pillars = ICONIC_PILLAR_CONTRACTS.map((p) => p.pillar);
    for (let n = 7; n <= 17; n++) {
      expect(pillars).toContain(n);
    }
    for (const p of ICONIC_PILLAR_CONTRACTS) {
      expect(p.guards.length).toBeGreaterThan(0);
      for (const g of p.guards) {
        expect(existsSync(join(root, g)), `missing pillar ${p.pillar} guard: ${g}`).toBe(
          true,
        );
      }
    }
  });

  it("lists a non-empty unit gate + signature e2e specs", () => {
    const units = iconicUnitTestPaths();
    expect(units.length).toBeGreaterThanOrEqual(12);
    expect(units).toContain("src/qa/signatureLoop.test.ts");
    expect(units).toContain("src/qa/iconicCraftCadence.test.ts");
    for (const u of units) {
      expect(existsSync(join(root, u)), `unit gate missing: ${u}`).toBe(true);
    }
    for (const spec of ICONIC_E2E_SPECS) {
      expect(existsSync(join(root, spec)), `e2e missing: ${spec}`).toBe(true);
    }
  });

  it("requires automated coverage for signature cinema beats", () => {
    const must = ["cove_take", "spectacle", "share", "day2", "reduced_motion", "corrupt_save"];
    for (const id of must) {
      const row = ICONIC_COLD_CHECKLIST.find((r) => r.id === id);
      expect(row, id).toBeTruthy();
      expect(row!.guards.length).toBeGreaterThan(0);
    }
  });
});
