import type { IslandSaveV1 } from "../types";

/**
 * Title mural, Street Fighter cast, Ashore Teach, and Money Carpet play on
 * every full page load. Only App’s QA `?skipIntro=1` + VITE_QA=1 bypasses boot.
 * Ashore Teach skips only when the player checks “I've played money games before”
 * on the coin board this session — never because a save already finished it.
 */
export function shouldSkipFtueBoot(_save: IslandSaveV1 | null): boolean {
  return false;
}

/** Save progress never auto-skips the beach classroom. */
export function shouldSkipAshoreTeachOnBoot(_save: IslandSaveV1 | null): boolean {
  return false;
}

export function resolveBootTeachPhase(_save: IslandSaveV1 | null): "teach" | "carpet" {
  return "teach";
}
