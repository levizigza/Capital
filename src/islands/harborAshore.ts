/**
 * Harbor Ashore — iconic opening tutorial law (redesign).
 *
 * Patterns: Portal one-verb chambers · HL2 learn-by-doing · Mario safe teach
 * → combine at Cove Take. Daily Ritual is Memory organ — after first scar.
 *
 * Design: docs/harbor-ashore.md
 */

import { hasCompletedCoveChange } from "./chapterLoop";
import type { IslandSaveV1 } from "./types";
import {
  createDefaultHubGuidedIntro,
  isHubGuidedComplete,
  type HubGuidedIntroState,
  type HubGuidedStepId,
} from "./story/storyBible";

/** Steps retired from the critical path — still valid in old saves. */
export const ASHORE_LEGACY_GATE_STEPS: readonly HubGuidedStepId[] = [
  "walk_outfitter",
  "become_you",
  "tiny_spend",
  "practice_optional",
  "first_island",
] as const;

/** Critical path after Talk: voyage to Cove. */
export const ASHORE_VOYAGE_STEP: HubGuidedStepId = "to_dock";

/** Normalize mid-save legacy gates onto the voyage step. */
export function normalizeHubGuidedIntro(
  state?: HubGuidedIntroState | null,
): HubGuidedIntroState {
  const base = state ?? createDefaultHubGuidedIntro();
  if (isHubGuidedComplete(base)) return base;
  if ((ASHORE_LEGACY_GATE_STEPS as readonly string[]).includes(base.step)) {
    return { ...base, step: ASHORE_VOYAGE_STEP };
  }
  return base;
}

/** First viewport: Talk is the only job — coach card would stack the same verb. */
export function shouldShowCastleCoach(opts: {
  guidedStepId?: string | null;
  piggyPresence?: boolean;
}): boolean {
  if (!opts.guidedStepId || opts.guidedStepId === "done") return false;
  if (opts.piggyPresence) return false;
  return true;
}

/** Short presence copy — one job, no essay. */
export function ashorePresenceLine(opts: { firstMeet: boolean }): string {
  if (opts.firstMeet) return "Talk to Piggy Penny — she’s by the fountain.";
  return "Harbor is quiet. Piggy’s by the fountain when you’re ready.";
}

/** Voyage coach — single next verb toward Cove. */
export function ashoreVoyageCoach(): string {
  return "Board the Money Carpet — Coincraft Cove is your first painting.";
}

export function ashoreVoyageVerb(): string {
  return "Board carpet";
}

/**
 * Daily Ritual auto-open — Memory organ after Harbor has something to remember.
 * Never interrupt first-meet, voyage, quiet homecoming, or signature cinema.
 */
export function shouldAutoOpenDailyRitual(opts: {
  save: IslandSaveV1;
  guidedActive: boolean;
  anyBlockingOverlay: boolean;
  homecomingPending?: boolean;
}): boolean {
  const ritual = opts.save.harborRitual;
  if (!ritual || ritual.today.greeted) return false;
  if (opts.anyBlockingOverlay) return false;
  if (opts.homecomingPending) return false;
  if (opts.guidedActive) return false;
  if (!opts.save.hubGuidedIntro?.didDock) return false;
  // Whole-game fit: ritual after Cove Change, not before the signature loop.
  if (!hasCompletedCoveChange(opts.save)) return false;
  // Unshown scars → spectacle owns the plaza (ritual must never race under the lamp).
  const scars = opts.save.harborScars?.length ?? 0;
  const shown = opts.save.scarSpectacle?.shownForCount ?? 0;
  if (scars > shown) return false;
  // Quiet homecoming until Piggy Talk — same chrome hush as first-meet.
  const hc = opts.save.harborHomecoming;
  if (hc && !hc.piggyTalked) return false;
  // Day-2 Soft Beat cinema owns the plaza — never steal with the ritual card.
  if (
    ritual.today.rumorId?.startsWith("scar_echo_") &&
    !ritual.today.echoSurpriseSeen
  ) {
    return false;
  }
  return true;
}

/**
 * Carpet opening ceremony → Harbor plaza.
 * Preserve an in-progress ash ore lap (normalized). Otherwise start meet_guide
 * and clear quiet homecoming so it cannot steal first-meet.
 */
export function resolveAshoreCarpetBoot(prev: {
  hubGuidedIntro?: HubGuidedIntroState | null;
  harborHomecoming?: { quietPending?: boolean } | null;
}): { hubGuidedIntro: HubGuidedIntroState; clearQuietPending: boolean } {
  const midTutorial =
    Boolean(prev.hubGuidedIntro?.step) &&
    !isHubGuidedComplete(prev.hubGuidedIntro);
  const hubGuidedIntro = midTutorial
    ? normalizeHubGuidedIntro(prev.hubGuidedIntro)
    : createDefaultHubGuidedIntro();
  const clearQuietPending =
    hubGuidedIntro.step === "meet_guide" &&
    Boolean(prev.harborHomecoming?.quietPending);
  return { hubGuidedIntro, clearQuietPending };
}
