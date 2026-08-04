/**
 * Part-enter motifs — jar cork-pop / spring-fling · bank dial-spin / stamp-press
 * before shared arcade IDs. Soft Beat climbs stay on SoftBeatOverlay.
 */

import type { MoneyStructurePart, MoneyStructureTheme } from "./moneyStructures";
import { coldOrganKidSentence } from "./worldMemory";

export type PartEnterMotifId =
  | "cork-pop"
  | "spring-fling"
  | "lid-climb"
  | "dial-spin"
  | "stamp-press"
  | "teller-step";

export type PartEnterMotif = {
  id: PartEnterMotifId;
  eyebrow: string;
  title: string;
  line: string;
  kidSentence: string;
  durationMs: number;
  /** Organ stinger for the motif overlay */
  organ: "coin" | "memory" | "clock" | "spiral";
};

/** Combine beats before arcade dump — Soft Beat pads return durationMs 0. */
export function resolvePartEnterMotif(
  theme: MoneyStructureTheme,
  part: MoneyStructurePart,
): PartEnterMotif | null {
  if (theme === "jar") {
    if (part.id === "cork_vault") {
      return {
        id: "cork-pop",
        eyebrow: "Coin · Cork Vault",
        title: "Pop the cork",
        line: "Vault rooms wait inside — the Coin holds what you stash.",
        kidSentence: coldOrganKidSentence("coin"),
        durationMs: 1600,
        organ: "coin",
      };
    }
    if (part.id === "coin_spring") {
      return {
        id: "spring-fling",
        eyebrow: "Coin · Coin Spring",
        title: "Coil flings",
        line: "Dive the catcher — coins leap, then settle in the jar.",
        kidSentence: coldOrganKidSentence("coin"),
        durationMs: 1600,
        organ: "coin",
      };
    }
    if (part.softBeat === "lookout") {
      return {
        id: "lid-climb",
        eyebrow: "Coin · Lid Lookout",
        title: "Climb the lid",
        line: "Cove looks tiny from up here.",
        kidSentence: coldOrganKidSentence("coin"),
        durationMs: 0,
        organ: "coin",
      };
    }
  }

  if (theme === "bank") {
    if (part.id === "vault_safe") {
      return {
        id: "dial-spin",
        eyebrow: "Memory · Safe Heart",
        title: "Spin the dial",
        line: "Safe rooms unfold — Memory keeps every jar and stamp.",
        kidSentence: coldOrganKidSentence("memory"),
        durationMs: 1600,
        organ: "memory",
      };
    }
    if (part.id === "stamp_press") {
      return {
        id: "stamp-press",
        eyebrow: "Memory · Payday Stamp",
        title: "Press the stamp",
        line: "Inbox storms wait inside — the ledger remembers the hit.",
        kidSentence: coldOrganKidSentence("memory"),
        durationMs: 1600,
        organ: "memory",
      };
    }
    if (part.softBeat === "ledger") {
      return {
        id: "teller-step",
        eyebrow: "Memory · Teller Window",
        title: "Step to the teller",
        line: "Harbor's ledger hums under glass.",
        kidSentence: coldOrganKidSentence("memory"),
        durationMs: 0,
        organ: "memory",
      };
    }
  }

  return null;
}
