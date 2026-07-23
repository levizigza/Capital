/**
 * Capital NPC Behavior — TypeScript port of Unity Behavior concepts
 * (com.unity.behavior / needle-mirror), adapted for Fortune Archipelago.
 *
 * We cannot load Unity C# packages into this React/Three web game.
 * Instead we implement the same professional patterns:
 *   Status · Blackboard · Action · Sequence · TryInOrder · Repeat · Conditional · Agent
 *
 * Docs reference: https://docs.unity3d.com/Packages/com.unity.behavior@1.0/manual/node-types.html
 */

export type NodeStatus = "Success" | "Failure" | "Running";

export type NpcPoseId = "stand" | "run" | "wave" | "talk" | "nod" | "cheer" | "point";

export type Vec3 = [number, number, number];
