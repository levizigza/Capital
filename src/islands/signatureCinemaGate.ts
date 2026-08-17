/**
 * Signature micro-loop cinema gate — Harbor felt that.
 * Spectacle / share / day-2 must never start under the loading veil.
 */

export function canOpenSignatureCinema(opts: {
  plazaReady: boolean;
  talkOpen?: boolean;
  hubModal?: boolean;
  spectacleOpen?: boolean;
  feltShareOpen?: boolean;
  /** Castle Grounds unfinished — keep voyage coach before scar cinema… */
  guidedComplete?: boolean;
  /** …unless an unshown scar is waiting (Portal twist owns the plaza). */
  unshownScar?: boolean;
}): boolean {
  if (!opts.plazaReady) return false;
  if (opts.talkOpen || opts.hubModal) return false;
  if (opts.spectacleOpen || opts.feltShareOpen) return false;
  if (opts.guidedComplete === false && !opts.unshownScar) return false;
  return true;
}
