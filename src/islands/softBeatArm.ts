/**
 * Soft Beat arm — lookout peek briefly arms the next living Talk / Take foreshadow.
 * Multiplicative organ chemistry without new islands (pattern library #12 / #74).
 */

import type { SoftBeatKind } from "../views/SoftBeatOverlay";

let armed: SoftBeatKind | null = null;
let armedAtMs = 0;

/** Soft Beat arm lasts ~3 minutes of play — then cools. */
const ARM_TTL_MS = 3 * 60 * 1000;

export function armSoftBeat(kind: SoftBeatKind): void {
  armed = kind;
  armedAtMs = Date.now();
}

export function peekSoftBeatArm(): SoftBeatKind | null {
  if (!armed) return null;
  if (Date.now() - armedAtMs > ARM_TTL_MS) {
    armed = null;
    return null;
  }
  return armed;
}

export function consumeSoftBeatArm(): SoftBeatKind | null {
  const next = peekSoftBeatArm();
  armed = null;
  armedAtMs = 0;
  return next;
}

export function softBeatArmWhisper(kind: SoftBeatKind | null): string | null {
  if (!kind) return null;
  if (kind === "lookout") return "Lid Lookout armed — next Talk carries Coin hush";
  if (kind === "umbrella") return "Umbrella Loft armed — next Talk carries Clock shelter";
  if (kind === "battlement") return "Battlement armed — next Talk carries Spiral wait";
  return "Teller armed — next Talk carries Memory keep";
}

/**
 * Burn the arm only on Take / digression stakes — not plaza gossip chit-chat.
 * Effects: setIrreversible (spine Take) or addScar (digression / plaque).
 */
export function softBeatArmConsumesOnChoice(opts: {
  effects?: ReadonlyArray<{ type: string }> | null;
}): boolean {
  const effects = opts.effects ?? [];
  return effects.some((e) => e.type === "setIrreversible" || e.type === "addScar");
}

/** Append organ chemistry to Take / digression choice rows while armed. */
export function softBeatArmChoiceSuffix(
  kind: SoftBeatKind | null,
  effects?: ReadonlyArray<{ type: string }> | null,
): string | null {
  if (!kind || !softBeatArmConsumesOnChoice({ effects })) return null;
  if (kind === "lookout") return " · Coin hush still armed";
  if (kind === "umbrella") return " · Clock shelter still armed";
  if (kind === "battlement") return " · Spiral wait still armed";
  return " · Memory keep still armed";
}

/** Last Soft Beat spent on a Take/digression — signature loop still names it. */
let lastConsumed: SoftBeatKind | null = null;

export function noteSoftBeatConsumed(kind: SoftBeatKind): void {
  lastConsumed = kind;
}

export function peekLastConsumedSoftBeat(): SoftBeatKind | null {
  return lastConsumed;
}

export function clearLastConsumedSoftBeat(): void {
  lastConsumed = null;
}

/** Take hush / spectacle lower-third — Soft Beat chemistry after burn. */
export function softBeatSpentHushLine(kind: SoftBeatKind | null): string | null {
  if (!kind) return null;
  if (kind === "lookout") return "Lid Lookout still on you — Coin hush rides this Take.";
  if (kind === "umbrella") return "Umbrella Loft still on you — Clock shelter rides this Take.";
  if (kind === "battlement") return "Battlement still on you — Spiral wait rides this Take.";
  return "Teller Window still on you — Memory keep rides this Take.";
}
