import type { IslandSaveV1 } from "../types";
import { buildConceptEvidence } from "./evidence";
import { evalPredicate } from "./predicates";
import { CONCEPT_REGISTRY, getConceptDef, listConceptIds } from "./registry";
import { createEmptyConceptProgress, normalizeConceptProgress } from "./normalize";
import {
  exportConceptTransferMetrics,
  finalizeGuidedMetricsOnReduced,
  finalizeTransferMetricsOnIndependent,
  syncConceptTransferPasses,
} from "./transferMetrics";
import type {
  ConceptDef,
  ConceptPhase,
  ConceptProgressState,
  ConceptRuntimeEntry,
} from "./types";

const TERMINAL_OK: ReadonlySet<ConceptPhase> = new Set([
  "INDEPENDENT",
  "MASTERED",
  "REVIEW_AVAILABLE",
]);

function prereqsSatisfied(
  def: ConceptDef,
  concepts: Record<string, ConceptRuntimeEntry>,
): boolean {
  return def.prerequisites.every((p) => {
    const phase = concepts[p]?.phase;
    return phase === "INDEPENDENT" || phase === "MASTERED" || phase === "REVIEW_AVAILABLE";
  });
}

function ensureEntry(
  concepts: Record<string, ConceptRuntimeEntry>,
  id: string,
  now: string,
): ConceptRuntimeEntry {
  if (!concepts[id]) {
    concepts[id] = {
      phase: "LOCKED",
      attempts: 0,
      failures: 0,
      hintsUsed: 0,
      lastTransitionAt: now,
    };
  }
  return concepts[id]!;
}

function setPhase(entry: ConceptRuntimeEntry, phase: ConceptPhase, now: string): void {
  if (entry.phase === phase) return;
  entry.phase = phase;
  entry.lastTransitionAt = now;
  if (phase === "GUIDED" && !entry.guidedEnteredAt) entry.guidedEnteredAt = now;
  if (phase === "MASTERED") entry.masteredAt = now;
}

/**
 * Pure sync: recompute phases from evidence + registry.
 * Does not mutate hubGuidedIntro or other save systems.
 */
export function applyConceptSync(
  save: IslandSaveV1,
  now = new Date().toISOString(),
): IslandSaveV1 {
  let working = syncConceptTransferPasses(save, now);
  const known = new Set(listConceptIds());
  const progress = normalizeConceptProgress(working.conceptProgress, known, now);
  const concepts = { ...progress.concepts };
  const evidence = buildConceptEvidence(working);

  // Ensure every registry id has an entry
  for (const def of CONCEPT_REGISTRY) {
    ensureEntry(concepts, def.concept_id, now);
  }

  // Pass 1: LOCKED ↔ AVAILABLE from prerequisites (never demote MASTERED)
  for (const def of CONCEPT_REGISTRY) {
    const entry = concepts[def.concept_id]!;
    if (entry.phase === "MASTERED" || entry.phase === "REVIEW_AVAILABLE") continue;
    if (entry.phase === "GUIDED" || entry.phase === "REDUCED_GUIDANCE" || entry.phase === "INDEPENDENT") {
      continue;
    }
    if (prereqsSatisfied(def, concepts)) {
      if (entry.phase === "LOCKED") setPhase(entry, "AVAILABLE", now);
    } else {
      setPhase(entry, "LOCKED", now);
    }
  }

  // Pass 2: advances that require proof
  for (const def of CONCEPT_REGISTRY) {
    const entry = concepts[def.concept_id]!;
    const phase = entry.phase;

    if (phase === "AVAILABLE" && evalPredicate(def.trigger_condition, evidence)) {
      setPhase(entry, "GUIDED", now);
      entry.attempts += 1;
    }

    if (phase === "GUIDED" || entry.phase === "GUIDED") {
      if (evalPredicate(def.failure_condition, evidence)) {
        entry.failures += 1;
        entry.attempts += 1;
        if (
          entry.failures >= def.hint_policy.escalateAfterFailures &&
          entry.hintsUsed < def.hint_policy.maxHints
        ) {
          entry.hintsUsed += 1;
        }
      }
      if (evalPredicate(def.success_condition, evidence)) {
        const updated = finalizeGuidedMetricsOnReduced(entry, now);
        Object.assign(entry, updated);
        setPhase(entry, "REDUCED_GUIDANCE", now);
      }
    }

    if (entry.phase === "REDUCED_GUIDANCE") {
      if (evalPredicate(def.transfer_task, evidence)) {
        const updated = finalizeTransferMetricsOnIndependent(entry, working, def.concept_id, now);
        Object.assign(entry, updated);
        setPhase(entry, "INDEPENDENT", now);
      }
    }

    if (entry.phase === "INDEPENDENT" || entry.phase === "REDUCED_GUIDANCE" || entry.phase === "GUIDED") {
      if (evalPredicate(def.mastery_condition, evidence)) {
        setPhase(entry, "MASTERED", now);
      }
    }

    // REVIEW_AVAILABLE → re-enter GUIDED only when trigger still true and mastery wants review
    if (entry.phase === "REVIEW_AVAILABLE" && evalPredicate(def.trigger_condition, evidence)) {
      setPhase(entry, "GUIDED", now);
      entry.attempts += 1;
    }
  }

  // Pass 3: re-check AVAILABLE for concepts that were locked behind freshly mastered prereqs
  for (const def of CONCEPT_REGISTRY) {
    const entry = concepts[def.concept_id]!;
    if (entry.phase !== "LOCKED") continue;
    if (prereqsSatisfied(def, concepts)) setPhase(entry, "AVAILABLE", now);
    if (entry.phase === "AVAILABLE" && evalPredicate(def.trigger_condition, evidence)) {
      setPhase(entry, "GUIDED", now);
      entry.attempts += 1;
      if (evalPredicate(def.success_condition, evidence)) {
        const updated = finalizeGuidedMetricsOnReduced(entry, now);
        Object.assign(entry, updated);
        setPhase(entry, "REDUCED_GUIDANCE", now);
      }
      if (
        (entry.phase === "REDUCED_GUIDANCE" || entry.phase === "GUIDED") &&
        evalPredicate(def.transfer_task, evidence)
      ) {
        const updated = finalizeTransferMetricsOnIndependent(entry, working, def.concept_id, now);
        Object.assign(entry, updated);
        setPhase(entry, "INDEPENDENT", now);
      }
      if (
        TERMINAL_OK.has(entry.phase) === false &&
        (entry.phase === "INDEPENDENT" ||
          entry.phase === "REDUCED_GUIDANCE" ||
          entry.phase === "GUIDED") &&
        evalPredicate(def.mastery_condition, evidence)
      ) {
        setPhase(entry, "MASTERED", now);
      }
    }
  }

  const next: ConceptProgressState = {
    version: progress.version,
    concepts,
  };

  return { ...working, conceptProgress: next, updatedAt: working.updatedAt };
}

/** Mark a concept for spaced review without wiping mastery timestamp. */
export function markConceptReviewAvailable(
  save: IslandSaveV1,
  conceptId: string,
  now = new Date().toISOString(),
): IslandSaveV1 {
  const known = new Set(listConceptIds());
  if (!known.has(conceptId)) return save;
  const progress = normalizeConceptProgress(save.conceptProgress, known, now);
  const entry = progress.concepts[conceptId] ?? {
    phase: "LOCKED" as ConceptPhase,
    attempts: 0,
    failures: 0,
    hintsUsed: 0,
  };
  if (entry.phase !== "MASTERED" && entry.phase !== "INDEPENDENT") return save;
  entry.phase = "REVIEW_AVAILABLE";
  entry.lastTransitionAt = now;
  return {
    ...save,
    conceptProgress: {
      ...progress,
      concepts: { ...progress.concepts, [conceptId]: entry },
    },
  };
}

export function noteConceptFailure(
  save: IslandSaveV1,
  conceptId: string,
  now = new Date().toISOString(),
): IslandSaveV1 {
  const def = getConceptDef(conceptId);
  if (!def) return save;
  const known = new Set(listConceptIds());
  const progress = normalizeConceptProgress(save.conceptProgress, known, now);
  const entry = ensureEntry(progress.concepts, conceptId, now);
  entry.failures += 1;
  entry.attempts += 1;
  entry.lastTransitionAt = now;
  if (
    entry.failures >= def.hint_policy.escalateAfterFailures &&
    entry.hintsUsed < def.hint_policy.maxHints
  ) {
    entry.hintsUsed += 1;
  }
  return {
    ...save,
    conceptProgress: { ...progress, concepts: { ...progress.concepts, [conceptId]: entry } },
  };
}

export function getConceptPhase(save: IslandSaveV1, conceptId: string): ConceptPhase {
  const known = new Set(listConceptIds());
  const progress = normalizeConceptProgress(save.conceptProgress, known);
  return progress.concepts[conceptId]?.phase ?? "LOCKED";
}

export type ActiveGuidance = {
  concept_id: string;
  phase: ConceptPhase;
  instruction: string;
  attention_target: string;
  practice_task: string;
  hintsUsed: number;
};

export function getActiveGuidance(save: IslandSaveV1): ActiveGuidance[] {
  const known = new Set(listConceptIds());
  const progress = normalizeConceptProgress(save.conceptProgress, known);
  const out: ActiveGuidance[] = [];
  for (const def of CONCEPT_REGISTRY) {
    const entry = progress.concepts[def.concept_id];
    if (!entry) continue;
    if (entry.phase !== "GUIDED" && entry.phase !== "REDUCED_GUIDANCE") continue;
    out.push({
      concept_id: def.concept_id,
      phase: entry.phase,
      instruction: def.instruction,
      attention_target: def.attention_target,
      practice_task: def.practice_task,
      hintsUsed: entry.hintsUsed,
    });
  }
  return out;
}

export function withNormalizedConceptProgress(save: IslandSaveV1): IslandSaveV1 {
  const known = new Set(listConceptIds());
  return {
    ...save,
    conceptProgress: normalizeConceptProgress(save.conceptProgress, known),
  };
}

export function getConceptTransferMetrics(
  save: IslandSaveV1,
  conceptId: string,
): import("./types").ConceptTransferMetrics | null {
  const known = new Set(listConceptIds());
  const progress = normalizeConceptProgress(save.conceptProgress, known);
  const entry = progress.concepts[conceptId];
  if (!entry) return null;
  return exportConceptTransferMetrics(entry, conceptId, save);
}

export { createEmptyConceptProgress };
