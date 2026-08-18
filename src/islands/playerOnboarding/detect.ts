import type { IslandSaveV1 } from "../types";
import { hasCompletedCoveChange } from "../chapterLoop";
import { isHubGuidedComplete } from "../story/storyBible";
import type { PlayerOnboardingMode } from "./types";

/** Absence before we treat the player as “returning” (not a same-day reload). */
export const RETURNING_ABSENCE_MS = 72 * 60 * 60 * 1000;

export function hasMeaningfulProgress(save: IslandSaveV1): boolean {
  if (save.onboardingComplete) return true;
  if (isHubGuidedComplete(save.hubGuidedIntro)) return true;
  if ((save.harborScars?.length ?? 0) > 0) return true;
  if (hasCompletedCoveChange(save)) return true;
  if (Object.values(save.questStatus ?? {}).some((q) => q.started || q.completed)) return true;
  if ((save.discovered?.islands?.length ?? 0) > 1) return true;
  return Boolean(save.character);
}

function resolveLastActiveMs(save: IslandSaveV1): number {
  const po = save.playerOnboarding?.lastActiveAt;
  if (po) {
    const t = Date.parse(po);
    if (!Number.isNaN(t)) return t;
  }
  const updated = Date.parse(save.updatedAt ?? "");
  return Number.isNaN(updated) ? 0 : updated;
}

export function isReturningAfterAbsence(
  save: IslandSaveV1,
  nowMs = Date.now(),
): boolean {
  if (!save.onboardingComplete || !save.character) return false;
  if (!hasMeaningfulProgress(save)) return false;
  const last = resolveLastActiveMs(save);
  if (last <= 0) return false;
  return nowMs - last >= RETURNING_ABSENCE_MS;
}

/**
 * Resolve onboarding mode for this session.
 * Returning only when absence threshold is met — same-day reloads stay new/experienced.
 */
export function detectPlayerOnboardingMode(
  save: IslandSaveV1,
  nowMs = Date.now(),
): PlayerOnboardingMode {
  if (isReturningAfterAbsence(save, nowMs)) return "returning";
  if (save.playerOnboarding?.declaredMode === "experienced") return "experienced";
  return "new";
}

export function shouldShowReturningBriefing(
  save: IslandSaveV1,
  nowMs = Date.now(),
): boolean {
  if (!isReturningAfterAbsence(save, nowMs)) return false;
  try {
    const seen = sessionStorage.getItem("capital_returning_briefing_seen");
    if (seen === String(performance.timeOrigin)) return false;
  } catch {
    /* ignore */
  }
  return true;
}

export function markReturningBriefingSeenSession(): void {
  try {
    sessionStorage.setItem("capital_returning_briefing_seen", String(performance.timeOrigin));
  } catch {
    /* ignore */
  }
}
