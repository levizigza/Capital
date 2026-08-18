import type { IslandSaveV1 } from "../types";
import { detectPlayerOnboardingMode, isReturningAfterAbsence } from "./detect";

/**
 * Skip title → cast → teach → carpet when the player already has a shell-complete save.
 * Returning players must never replay FTUE because of absence alone.
 */
export function shouldSkipFtueBoot(save: IslandSaveV1 | null): boolean {
  if (!save) return false;
  if (save.onboardingComplete && save.character) return true;
  if (isReturningAfterAbsence(save)) return true;
  const mode = detectPlayerOnboardingMode(save);
  return mode === "returning";
}

export function resolveBootTeachPhase(save: IslandSaveV1 | null): "teach" | "carpet" {
  if (save?.playerOnboarding?.declaredMode === "experienced") return "carpet";
  return "teach";
}
