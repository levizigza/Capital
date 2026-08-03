/**
 * Harbor Castle Grounds — guided intro helpers.
 * Re-exports story bible guided API for hub views.
 */

export {
  ASHORE_LEGACY_GATE_STEPS,
  ASHORE_VOYAGE_STEP,
  HARBOR_KEEPER_MASCOT_ID,
  HUB_GUIDED_STEPS,
  advanceHubGuided,
  createDefaultHubGuidedIntro,
  getHubGuidedStep,
  isHubGuidedComplete,
  normalizeHubGuidedIntro,
  type HubGuidedEvent,
  type HubGuidedIntroState,
  type HubGuidedStepId,
} from "./storyBible";
