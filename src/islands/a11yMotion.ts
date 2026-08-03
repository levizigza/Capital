/**
 * Shared reduced-motion probe — OS preference OR Settings → Reduced motion.
 * Signature cinema, plaza life, juice, and organ flashes all read this.
 */

/** Settings toggle — synced from load/persist accessibility. */
let settingsReducedMotion = false;

/** Call whenever AccessibilitySettings.reducedMotion changes. */
export function syncReducedMotionSetting(enabled: boolean): void {
  settingsReducedMotion = Boolean(enabled);
}

/** OS `prefers-reduced-motion: reduce` only. */
export function systemPrefersReducedMotion(): boolean {
  try {
    const mm = (globalThis as { matchMedia?: typeof window.matchMedia }).matchMedia;
    return Boolean(mm?.("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

/**
 * Pillar 15 — effective reduce for the signature loop.
 * Settings OR OS so a Settings toggle still quiets Take / Plinth / juice.
 */
export function prefersReducedMotion(): boolean {
  return systemPrefersReducedMotion() || settingsReducedMotion;
}

/** Amplitude scale for always-on plaza life (fountain, flags, coins). */
export function plazaLifeAmp(): number {
  return prefersReducedMotion() ? 0.22 : 1;
}

/** Time scale for cinematic overlays (shorter under reduce). */
export function cinemaTimeScale(): number {
  return prefersReducedMotion() ? 0.55 : 1;
}

/**
 * Take mark / Plinth spectacle strobe amplitude.
 * Near-static under reduce so flashes never blind the beat.
 */
export function cinemaFlashAmp(): number {
  return prefersReducedMotion() ? 0 : 1;
}
