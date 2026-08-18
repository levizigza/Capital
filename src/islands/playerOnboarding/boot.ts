import type { IslandSaveV1 } from "../types";

/**
 * Title mural, Street Fighter cast, and Money Carpet play on every full page load.
 * Only App’s QA `?skipIntro=1` + VITE_QA=1 bypasses boot (via shouldPlayCapitalIntroOnBoot).
 * Returning / experienced saves skip Ashore Teach — not the opening.
 */
export function shouldSkipFtueBoot(_save: IslandSaveV1 | null): boolean {
  return false;
}

/** Skip the beach classroom on boot; never skip title, cast, or carpet. */
export function shouldSkipAshoreTeachOnBoot(save: IslandSaveV1 | null): boolean {
  if (!save) return false;
  if (save.playerOnboarding?.declaredMode === "experienced") return true;
  if (save.onboardingComplete && save.character) return true;
  return false;
}

export function resolveBootTeachPhase(save: IslandSaveV1 | null): "teach" | "carpet" {
  return shouldSkipAshoreTeachOnBoot(save) ? "carpet" : "teach";
}
