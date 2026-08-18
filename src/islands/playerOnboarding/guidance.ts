import { shouldShowCastleCoach } from "../harborAshore";
import { getActiveGuidance } from "../conceptProgression";
import type { ActiveGuidance } from "../conceptProgression/engine";
import type { IslandSaveV1 } from "../types";
import type { PlayerOnboardingMode } from "./types";

export function shouldShowCastleCoachForPlayer(
  mode: PlayerOnboardingMode,
  opts: Parameters<typeof shouldShowCastleCoach>[0],
): boolean {
  if (mode === "experienced" || mode === "returning") return false;
  return shouldShowCastleCoach(opts);
}

/** Experienced: only escalated concept hints. Returning: briefing owns reorientation. */
export function getActiveGuidanceForPlayer(
  save: IslandSaveV1,
  mode: PlayerOnboardingMode,
): ActiveGuidance[] {
  const all = getActiveGuidance(save);
  if (mode === "new") return all;
  if (mode === "returning") return [];
  if (mode === "experienced") {
    return all.filter((g) => g.phase === "GUIDED" && g.hintsUsed > 0);
  }
  return all;
}

export function shouldReduceHubPresenceCopy(mode: PlayerOnboardingMode): boolean {
  return mode === "experienced" || mode === "returning";
}

export function shouldSkipAshoreComprehensionTeach(mode: PlayerOnboardingMode): boolean {
  return mode === "experienced";
}
