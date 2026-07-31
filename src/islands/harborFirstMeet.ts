/**
 * Wave 1 — first-meet Harbor law.
 * Until Piggy is talked to, chrome and fallback must sell one verb: Talk.
 */

export type HarborFallbackMode = "myth_meet" | "myth_travel" | "utility";

/** Castle Grounds step where Piggy is the only job. */
export function isFirstMeetStep(stepId?: string | null): boolean {
  return stepId === "meet_guide";
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
}): HarborFallbackMode {
  if (opts.firstMeet) return "myth_meet";
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
