import {
  CONCEPT_PHASES,
  CONCEPT_PROGRESS_VERSION,
  type ConceptPhase,
  type ConceptProgressState,
  type ConceptRuntimeEntry,
} from "./types";

function isPhase(v: unknown): v is ConceptPhase {
  return typeof v === "string" && (CONCEPT_PHASES as readonly string[]).includes(v);
}

function emptyEntry(now: string): ConceptRuntimeEntry {
  return {
    phase: "LOCKED",
    attempts: 0,
    failures: 0,
    hintsUsed: 0,
    lastTransitionAt: now,
  };
}

/**
 * Recover from missing / corrupt conceptProgress blobs.
 * Unknown concept ids are dropped; unknown phases → LOCKED.
 */
export function normalizeConceptProgress(
  raw: unknown,
  knownIds: ReadonlySet<string>,
  now = new Date().toISOString(),
): ConceptProgressState {
  if (!raw || typeof raw !== "object") {
    return { version: CONCEPT_PROGRESS_VERSION, concepts: {} };
  }
  const obj = raw as Record<string, unknown>;
  const conceptsIn =
    obj.concepts && typeof obj.concepts === "object"
      ? (obj.concepts as Record<string, unknown>)
      : {};
  const concepts: Record<string, ConceptRuntimeEntry> = {};
  for (const [id, entry] of Object.entries(conceptsIn)) {
    if (!knownIds.has(id)) continue;
    if (!entry || typeof entry !== "object") {
      concepts[id] = emptyEntry(now);
      continue;
    }
    const e = entry as Record<string, unknown>;
    const phase = isPhase(e.phase) ? e.phase : "LOCKED";
    concepts[id] = {
      phase,
      attempts: typeof e.attempts === "number" && e.attempts >= 0 ? Math.floor(e.attempts) : 0,
      failures: typeof e.failures === "number" && e.failures >= 0 ? Math.floor(e.failures) : 0,
      hintsUsed: typeof e.hintsUsed === "number" && e.hintsUsed >= 0 ? Math.floor(e.hintsUsed) : 0,
      guidedEnteredAt: typeof e.guidedEnteredAt === "string" ? e.guidedEnteredAt : undefined,
      masteredAt: typeof e.masteredAt === "string" ? e.masteredAt : undefined,
      lastTransitionAt:
        typeof e.lastTransitionAt === "string" ? e.lastTransitionAt : now,
    };
  }
  return { version: CONCEPT_PROGRESS_VERSION, concepts };
}

export function createEmptyConceptProgress(): ConceptProgressState {
  return { version: CONCEPT_PROGRESS_VERSION, concepts: {} };
}
