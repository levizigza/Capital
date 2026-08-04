/**
 * Part-enter motifs — jar-true cork-pop / spring-fling before shared arcade IDs.
 * Soft Beat lid-climb stays on SoftBeatOverlay.
 */

import type { MoneyStructurePart, MoneyStructureTheme } from "./moneyStructures";
import { coldOrganKidSentence } from "./worldMemory";

export type PartEnterMotifId = "cork-pop" | "spring-fling" | "lid-climb";

export type PartEnterMotif = {
  id: PartEnterMotifId;
  eyebrow: string;
  title: string;
  line: string;
  kidSentence: string;
  durationMs: number;
};

/** Jar pads get a combine beat; other themes enter straight into the part world. */
export function resolvePartEnterMotif(
  theme: MoneyStructureTheme,
  part: MoneyStructurePart,
): PartEnterMotif | null {
  if (theme !== "jar") return null;
  if (part.id === "cork_vault") {
    return {
      id: "cork-pop",
      eyebrow: "Coin · Cork Vault",
      title: "Pop the cork",
      line: "Vault rooms wait inside — the Coin holds what you stash.",
      kidSentence: coldOrganKidSentence("coin"),
      durationMs: 1600,
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
    };
  }
  return null;
}
