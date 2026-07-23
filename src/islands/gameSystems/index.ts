/**
 * Capital game systems — Unity Behavior patterns beyond NPC locomotion.
 *
 * EventChannel · WorldBlackboard · WorldDirector · AdaptiveCoach
 * Inspired by Unity Technologies Behavior package concepts, ported to TS.
 */

export { EventChannel, gameEvents, type GameEventMap } from "./eventChannel";
export {
  WB,
  worldBlackboard,
  syncWorldPlace,
  setSkyIntent,
  getSkyIntent,
  type AdaptiveFocus,
} from "./worldBlackboard";
export {
  tickWorldDirector,
  lowestSkillFocus,
  type DirectorSignals,
  type DirectorDecision,
} from "./worldDirector";
export {
  resolveAdaptiveBuddyTip,
  getFailPressure,
  type AdaptiveCoachContext,
} from "./adaptiveCoach";
