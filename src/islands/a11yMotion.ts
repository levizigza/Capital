/**
 * Shared reduced-motion probe — OS preference for spine overlays / 3D hush.
 * Settings `reducedMotion` should OR this when gating app chrome.
 */

export function systemPrefersReducedMotion(): boolean {
  try {
    const mm = (globalThis as { matchMedia?: typeof window.matchMedia }).matchMedia;
    return Boolean(mm?.("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

/** Amplitude scale for always-on plaza life (fountain, flags, coins). */
export function plazaLifeAmp(): number {
  return systemPrefersReducedMotion() ? 0.22 : 1;
}

/** Time scale for cinematic overlays (shorter under reduce). */
export function cinemaTimeScale(): number {
  return systemPrefersReducedMotion() ? 0.55 : 1;
}
