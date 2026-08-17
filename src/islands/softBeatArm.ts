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
