/**
 * Harbor Ashore — opening tutorial law.
 *
 * Pre-carpet: AshoreComprehensionTutorial (prove WASD / E, Harbor + spine).
 * Harbor land: free walk · Piggy speech bubble · Talk only when player opts in.
 * Voyage: Money Carpet → Cove Take (combine).
 *
 * Design: docs/harbor-ashore.md · docs/ftue/FTUE_SCAFFOLD_REMOVAL_AUDIT.md
 */

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
 * Castle coach banner — removed as duplicate FTUE chrome.
 * Piggy presence + Coin Bag + proximity Talk / Board Carpet CTA teach the same verbs.
 * See docs/ftue/FTUE_SCAFFOLD_REMOVAL_AUDIT.md
 */
export function shouldShowCastleCoach(opts: {
  guidedStepId?: string | null;
  /** Quiet homecoming still mutes coach so presence owns the beat */
  quietHomecoming?: boolean;
}): boolean {
  void opts;
  return false;
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
 * Daily Ritual — never auto-open as FTUE chrome.
 * Ritual stays a Harbor place players find in freeplay (plaza / Piggy / map).
 * See docs/ftue/FTUE_SCAFFOLD_REMOVAL_AUDIT.md
 */
export function shouldAutoOpenDailyRitual(opts: {
  save: IslandSaveV1;
  guidedActive: boolean;
  anyBlockingOverlay: boolean;
  homecomingPending?: boolean;
}): boolean {
  void opts;
  return false;
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
