/**
 * Wave 1 — first-meet Harbor law.
 * Until Piggy is talked to, chrome and fallback must sell one verb: Talk.
 * Deepen: quiet homecoming after a Take uses the same Piggy-presence law
 * (not a tutorial checklist / stall dashboard).
 *
 * Ashore redesign: see harborAshore.ts / docs/harbor-ashore.md.
 */

import type { HubGuidedIntroState } from "./story/storyBible";
import { resolveAshoreCarpetBoot } from "./harborAshore";

export type HarborFallbackMode = "myth_meet" | "myth_travel" | "utility";

/**
 * Carpet opening ceremony → Harbor plaza.
 * Mid-lap → keep (normalized). Else → meet_guide and clear quiet homecoming
 * so it cannot steal first-meet.
 */
export function resolveCarpetBootGuidedIntro(prev: {
  hubGuidedIntro?: HubGuidedIntroState | null;
  harborHomecoming?: { quietPending?: boolean } | null;
}): { hubGuidedIntro: HubGuidedIntroState; clearQuietPending: boolean } {
  return resolveAshoreCarpetBoot(prev);
}

/** Castle Grounds step where Piggy is the only job. */
export function isFirstMeetStep(stepId?: string | null): boolean {
  return stepId === "meet_guide";
}

/**
 * Quiet Harbor after carpet home — Piggy presence beat, not stall grid.
 * Mirror first-meet chrome until Talk Battle with Piggy.
 */
export function isQuietHomecoming(opts: {
  needsPiggyWelcome?: boolean;
  quietPending?: boolean;
}): boolean {
  return Boolean(opts.needsPiggyWelcome && opts.quietPending);
}

/** One job on the plaza: Piggy (first meet or quiet homecoming). */
export function isPiggyPresenceBeat(opts: {
  firstMeet?: boolean;
  quietHomecoming?: boolean;
}): boolean {
  return Boolean(opts.firstMeet || opts.quietHomecoming);
}

/**
 * Pulse ids — "guide" must reach the 3D Piggy ring (never strip it).
 * Hotspot meshes ignore unknown ids; Piggy checks === "guide".
 */
export function resolvePulseHotspotId(
  pulse?: string | null,
): string | null {
  return pulse ?? null;
}

/** Which quick-path composition to show when 3D cannot run. */
export function harborFallbackMode(opts: {
  firstMeet: boolean;
  castleActive: boolean;
  quietHomecoming?: boolean;
}): HarborFallbackMode {
  if (opts.firstMeet || opts.quietHomecoming) return "myth_meet";
  if (opts.castleActive) return "myth_travel";
  return "utility";
}

/** Hotspot ids allowed on the myth fallback (never a settings dashboard). */
export function mythFallbackActions(mode: HarborFallbackMode): {
  talkPiggy: boolean;
  carpet: boolean;
  bank: boolean;
} {
  if (mode === "myth_meet") return { talkPiggy: true, carpet: false, bank: false };
  if (mode === "myth_travel") return { talkPiggy: false, carpet: true, bank: false };
  return { talkPiggy: true, carpet: true, bank: true };
}
