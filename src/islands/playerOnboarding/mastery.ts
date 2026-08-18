import type { IslandSaveV1 } from "../types";
import { getConceptPhase } from "../conceptProgression";
import type { ConceptPhase } from "../conceptProgression";

const MASTERY_PHASES: ReadonlySet<ConceptPhase> = new Set([
  "INDEPENDENT",
  "MASTERED",
  "REVIEW_AVAILABLE",
]);

/**
 * Tutorial shell — title/cast/teach/carpet + hub guided intro flags.
 * Does NOT imply concept mastery.
 */
export function isTutorialShellComplete(save: IslandSaveV1): boolean {
  return Boolean(save.onboardingComplete);
}

/** Concept reached independent proof or mastery gate. */
export function isConceptMastered(save: IslandSaveV1, conceptId: string): boolean {
  const phase = getConceptPhase(save, conceptId);
  return phase === "MASTERED" || phase === "INDEPENDENT" || phase === "REVIEW_AVAILABLE";
}

/** Any concept past GUIDED — player has durable skill signal separate from FTUE flags. */
export function hasConceptSkillSignal(save: IslandSaveV1, conceptId: string): boolean {
  return MASTERY_PHASES.has(getConceptPhase(save, conceptId));
}

export function listMasteredConceptIds(save: IslandSaveV1): string[] {
  const concepts = save.conceptProgress?.concepts ?? {};
  return Object.entries(concepts)
    .filter(([, entry]) => entry && MASTERY_PHASES.has(entry.phase))
    .map(([id]) => id);
}
