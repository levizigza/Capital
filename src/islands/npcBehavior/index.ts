/**
 * Capital NPC Behavior — TypeScript adaptation of Unity Behavior concepts.
 *
 * Inspired by (not a binary dependency — this is a React/Three web game):
 *   https://github.com/Unity-Technologies
 *   https://github.com/needle-mirror/com.unity.behavior
 *   https://docs.unity3d.com/Packages/com.unity.behavior@1.0/manual/node-types.html
 *
 * Patterns ported: Blackboard · Status · Action · Sequence · TryInOrder ·
 * Repeat · Conditional · Wait · Navigate · BehaviorGraphAgent.
 */

export type { NodeStatus, NpcPoseId, Vec3 } from "./types";
export { Blackboard, BB, readBody, type BodySnapshot } from "./blackboard";
export type { BehaviorNode } from "./node";
export { ActionNode } from "./node";
export {
  Sequence,
  TryInOrder,
  RepeatForever,
  ConditionalBranch,
  ConditionalGuard,
  RandomOne,
} from "./flow";
export {
  WaitSeconds,
  WaitRange,
  SetPose,
  NavigateToLocation,
  PickWanderTarget,
  FacePlayer,
  SensePlayer,
  GreetPlayer,
  IdleStand,
  ApplyGuidedPose,
  SetScheduleTarget,
} from "./actions";
export { BehaviorGraphAgent } from "./agent";
export {
  buildHarborNpcGraph,
  buildShoreAmbientGraph,
  createHarborAgent,
  createShoreAmbientAgent,
} from "./graphs";
