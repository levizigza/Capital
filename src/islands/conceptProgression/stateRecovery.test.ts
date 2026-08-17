import { describe, expect, it } from "vitest";
import type { IslandSaveV1 } from "../types";
import { createDefaultVoyagerLedger } from "../voyagerLedger";
import {
  normalizeConceptProgress,
  applyConceptSync,
  getConceptPhase,
  listConceptIds,
  CONCEPT_PROGRESS_VERSION,
} from "./index";

function baseSave(over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    voyagerLedger: createDefaultVoyagerLedger(),
    ...over,
  };
}

describe("concept progress state recovery", () => {
  const known = new Set(listConceptIds());

  it("missing conceptProgress becomes empty v1", () => {
    const n = normalizeConceptProgress(undefined, known);
    expect(n.version).toBe(CONCEPT_PROGRESS_VERSION);
    expect(n.concepts).toEqual({});
  });

  it("drops unknown concept ids", () => {
    const n = normalizeConceptProgress(
      {
        version: 1,
        concepts: {
          not_a_real_concept: {
            phase: "MASTERED",
            attempts: 9,
            failures: 0,
            hintsUsed: 0,
          },
          earn_then_decide: {
            phase: "GUIDED",
            attempts: 1,
            failures: 0,
            hintsUsed: 0,
          },
        },
      },
      known,
    );
    expect(n.concepts.not_a_real_concept).toBeUndefined();
    expect(n.concepts.earn_then_decide?.phase).toBe("GUIDED");
  });

  it("unknown phase strings recover to LOCKED", () => {
    const n = normalizeConceptProgress(
      {
        version: 99,
        concepts: {
          cashflow: {
            phase: "WIZARD",
            attempts: -3,
            failures: "nope",
            hintsUsed: null,
          },
        },
      },
      known,
    );
    expect(n.version).toBe(CONCEPT_PROGRESS_VERSION);
    expect(n.concepts.cashflow?.phase).toBe("LOCKED");
    expect(n.concepts.cashflow?.attempts).toBe(0);
    expect(n.concepts.cashflow?.failures).toBe(0);
  });

  it("MASTERED survives sync even if prereqs look unmet", () => {
    const save = applyConceptSync(
      baseSave({
        conceptProgress: {
          version: 1,
          concepts: {
            cashflow: {
              phase: "MASTERED",
              attempts: 2,
              failures: 0,
              hintsUsed: 1,
              masteredAt: "2026-01-01T00:00:00.000Z",
            },
          },
        },
      }),
    );
    expect(getConceptPhase(save, "cashflow")).toBe("MASTERED");
    expect(save.conceptProgress?.concepts.cashflow?.masteredAt).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("corrupt concepts object yields empty map then sync seeds entries", () => {
    const save = applyConceptSync(
      baseSave({
        conceptProgress: { version: 1, concepts: "broken" as never },
      }),
    );
    expect(save.conceptProgress?.version).toBe(1);
    // Zero-prereq concepts become AVAILABLE; others stay LOCKED.
    expect(["LOCKED", "AVAILABLE"]).toContain(getConceptPhase(save, "money_is_alive"));
    expect(getConceptPhase(save, "cashflow")).toBe("LOCKED");
  });

  it("null entry for a known id recovers to LOCKED shell", () => {
    const n = normalizeConceptProgress(
      {
        version: 1,
        concepts: { irreversible_take: null },
      },
      known,
    );
    expect(n.concepts.irreversible_take?.phase).toBe("LOCKED");
  });
});
