import type { AnalyticsEvent } from "../../types";
import { getConceptPhase } from "../../conceptProgression";
import type { IslandSaveV1 } from "../../types";
import { CONCEPT_REGISTRY } from "../../conceptProgression/registry";
import { trackFtue } from "./track";
import { FTUE_EVENT_NAMES } from "./types";

/**
 * Diff concept phases and emit privacy-safe FTUE concept lifecycle events.
 * Does not treat tutorial shell completion as success.
 */
export function trackConceptLifecycleFtue(before: IslandSaveV1, after: IslandSaveV1): void {
  for (const def of CONCEPT_REGISTRY) {
    const id = def.concept_id;
    const was = getConceptPhase(before, id);
    const now = getConceptPhase(after, id);
    const base = { concept_id: id, phase: now };

    const wasAttempts = before.conceptProgress?.concepts[id]?.transferAttempts ?? 0;
    const nowAttempts = after.conceptProgress?.concepts[id]?.transferAttempts ?? 0;
    if (nowAttempts > wasAttempts) {
      // Real analogous surface (Paycheck/Credit land), not guided-shell complete.
      void trackFtue("transfer_started", base);
    }

    if (was === now) continue;

    if (now === "GUIDED" && was !== "GUIDED") {
      void trackFtue("concept_introduced", base);
    }
    if (now === "REDUCED_GUIDANCE" && was === "GUIDED") {
      void trackFtue("concept_practiced", { ...base, guidedSuccess: true });
      void trackFtue("guidance_reduced", base);
    }
    if (now === "INDEPENDENT" && was !== "INDEPENDENT") {
      void trackFtue("transfer_success", base);
      void trackFtue("autonomy_unlocked", { ...base, via: "independent" });
    }
    if (now === "MASTERED" && was !== "MASTERED") {
      void trackFtue("autonomy_unlocked", { ...base, via: "mastered" });
    }
    if (
      (was === "REDUCED_GUIDANCE" || was === "INDEPENDENT") &&
      now === "GUIDED"
    ) {
      void trackFtue("transfer_failure", { ...base, reason: "returned_to_guided" });
    }
  }
}

const FTUE_NAME_SET = new Set<string>(FTUE_EVENT_NAMES);

/** Helper for tests — filter FTUE / learning events from a stream. */
export function isFtueEventName(name: string): boolean {
  return FTUE_NAME_SET.has(name);
}

export function filterFtueEvents(events: AnalyticsEvent[]): AnalyticsEvent[] {
  return events.filter((e) => isFtueEventName(e.name));
}
