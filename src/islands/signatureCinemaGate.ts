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
  /** Castle Grounds unfinished — keep tutorial before scar cinema */
  guidedComplete?: boolean;
}): boolean {
  if (!opts.plazaReady) return false;
  if (opts.talkOpen || opts.hubModal) return false;
  if (opts.spectacleOpen || opts.feltShareOpen) return false;
  if (opts.guidedComplete === false) return false;
  return true;
}
