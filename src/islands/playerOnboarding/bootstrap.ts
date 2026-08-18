import type { IslandSaveV1 } from "../types";
import {
  createDefaultHubGuidedIntro,
  normalizeHubGuidedIntro,
} from "../story/storyBible";
import { PLAYER_ONBOARDING_VERSION } from "./types";

/**
 * Experienced first session — skip redundant shell gates without faking concept mastery.
 * Progression proofs (quests, Takes, transfer tasks) stay intact.
 */
export function applyExperiencedBootstrap(save: IslandSaveV1): IslandSaveV1 {
  const guided = normalizeHubGuidedIntro(save.hubGuidedIntro ?? createDefaultHubGuidedIntro());
  return {
    ...save,
    onboardingComplete: true,
    hubGuidedIntro: {
      ...guided,
      didOutfitter: guided.didOutfitter ?? true,
      didSpendLesson: guided.didSpendLesson ?? true,
      didPractice: guided.didPractice ?? true,
    },
    playerOnboarding: {
      version: PLAYER_ONBOARDING_VERSION,
      ...save.playerOnboarding,
      declaredMode: "experienced",
    },
  };
}

export function declareExperiencedMode(save: IslandSaveV1): IslandSaveV1 {
  return {
    ...save,
    playerOnboarding: {
      version: PLAYER_ONBOARDING_VERSION,
      ...save.playerOnboarding,
      declaredMode: "experienced",
    },
  };
}

export function declareNewPlayerMode(save: IslandSaveV1): IslandSaveV1 {
  return {
    ...save,
    playerOnboarding: {
      version: PLAYER_ONBOARDING_VERSION,
      ...save.playerOnboarding,
      declaredMode: "new",
    },
  };
}

export function markReorientationSeen(save: IslandSaveV1, now = new Date().toISOString()): IslandSaveV1 {
  return {
    ...save,
    playerOnboarding: {
      version: PLAYER_ONBOARDING_VERSION,
      ...save.playerOnboarding,
      reorientationSeenAt: now,
    },
  };
}
