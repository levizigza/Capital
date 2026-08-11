/**
 * Harbor Ashore — opening tutorial law.
 *
 * Pre-carpet: AshoreComprehensionTutorial (prove WASD / E, Harbor + spine).
 * Harbor land: free walk · Piggy speech bubble · Talk only when player opts in.
 * Voyage: Money Carpet → Cove Take (combine).
 *
 * Design: docs/harbor-ashore.md
 */

import { hasCompletedCoveChange } from "./chapterLoop";
import type { IslandSaveV1 } from "./types";
import {
  ASHORE_LEGACY_GATE_STEPS,
  ASHORE_VOYAGE_STEP,
  createDefaultHubGuidedIntro,
  isHubGuidedComplete,
  normalizeHubGuidedIntro,
  type HubGuidedIntroState,
} from "./story/storyBible";

export {
  ASHORE_LEGACY_GATE_STEPS,
  ASHORE_VOYAGE_STEP,
  normalizeHubGuidedIntro,
};

/**
 * Castle coach — soft tip during first meet / voyage.
 * Never stacks a forced Talk CTA (teach already covered controls).
 */
export function shouldShowCastleCoach(opts: {
  guidedStepId?: string | null;
  /** Quiet homecoming still mutes coach so presence owns the beat */
  quietHomecoming?: boolean;
}): boolean {
  if (!opts.guidedStepId || opts.guidedStepId === "done") return false;
  if (opts.quietHomecoming) return false;
  return true;
}

/** Soft presence — walk first; never a modal Talk ambush. */
export function ashorePresenceLine(opts: { firstMeet: boolean }): string {
  if (opts.firstMeet) {
    return "Piggy’s waving by the fountain — walk over when you’re ready.";
  }
  return "Harbor is quiet. Piggy’s by the fountain when you’re ready.";
}

/**
 * Strip stall grid only on quiet homecoming (scar hush).
 * First meet keeps the plaza walkable after the pre-carpet teach.
 */
export function shouldStripPlazaForPresence(opts: {
  firstMeet?: boolean;
  quietHomecoming?: boolean;
}): boolean {
  return Boolean(opts.quietHomecoming);
}

/** Forced bottom Talk CTA — never on first meet (near-Piggy prompt only). */
export function shouldForceTalkCta(opts: {
  firstMeet?: boolean;
  quietHomecoming?: boolean;
  nearPiggy?: boolean;
}): boolean {
  if (opts.quietHomecoming) return true;
  if (opts.firstMeet) return Boolean(opts.nearPiggy);
  return false;
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
  if (!hasCompletedCoveChange(opts.save)) return false;
  const scars = opts.save.harborScars?.length ?? 0;
  const shown = opts.save.scarSpectacle?.shownForCount ?? 0;
  if (scars > shown) return false;
  const hc = opts.save.harborHomecoming;
  if (hc && !hc.piggyTalked) return false;
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
 * Preserve an in-progress Ashore lap (normalized). Otherwise start meet_guide
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
