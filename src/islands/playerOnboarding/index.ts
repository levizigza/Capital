export type {
  PlayerOnboardingMode,
  PlayerOnboardingState,
  ReturningBriefing,
  ReturningBriefingRefresher,
  ReturningBriefingSection,
} from "./types";
export { PLAYER_ONBOARDING_VERSION } from "./types";

export {
  detectPlayerOnboardingMode,
  hasMeaningfulProgress,
  isReturningAfterAbsence,
  shouldShowReturningBriefing,
  markReturningBriefingSeenSession,
  RETURNING_ABSENCE_MS,
} from "./detect";

export {
  isTutorialShellComplete,
  isConceptMastered,
  hasConceptSkillSignal,
  listMasteredConceptIds,
} from "./mastery";

export {
  shouldShowCastleCoachForPlayer,
  getActiveGuidanceForPlayer,
  shouldReduceHubPresenceCopy,
  shouldSkipAshoreComprehensionTeach,
} from "./guidance";

export { buildReturningBriefing, syncSystemsSeenAt } from "./briefing";

export {
  applyExperiencedBootstrap,
  declareExperiencedMode,
  declareNewPlayerMode,
  markReorientationSeen,
} from "./bootstrap";

export { shouldSkipFtueBoot, resolveBootTeachPhase } from "./boot";
