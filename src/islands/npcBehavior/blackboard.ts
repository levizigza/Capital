import type { NpcPoseId, Vec3 } from "./types";

/**
 * Blackboard — Unity Behavior graph memory.
 * Agents read/write shared state (player pos, schedule slot, pose, line…).
 */
export class Blackboard {
  private vars = new Map<string, unknown>();

  set<T>(name: string, value: T): void {
    this.vars.set(name, value);
  }

  get<T>(name: string): T | undefined {
    return this.vars.get(name) as T | undefined;
  }

  getOr<T>(name: string, fallback: T): T {
    return this.vars.has(name) ? (this.vars.get(name) as T) : fallback;
  }

  has(name: string): boolean {
    return this.vars.has(name);
  }
}

/** Standard keys used by Capital NPC graphs */
export const BB = {
  position: "SelfPosition",
  yaw: "SelfYaw",
  pose: "SelfPose",
  home: "HomePosition",
  scheduleTarget: "ScheduleTarget",
  wanderTarget: "WanderTarget",
  playerPos: "PlayerPosition",
  playerNear: "PlayerNear",
  talkRadius: "TalkRadius",
  line: "CurrentLine",
  name: "DisplayName",
  walkRadius: "WalkRadius",
  speed: "MoveSpeed",
  guidedPose: "GuidedPose",
  seed: "AgentSeed",
} as const;

export type BodySnapshot = {
  position: Vec3;
  yaw: number;
  pose: NpcPoseId;
  line: string;
  name: string;
};

export function readBody(bb: Blackboard): BodySnapshot {
  return {
    position: bb.getOr<Vec3>(BB.position, [0, 0, 0]),
    yaw: bb.getOr(BB.yaw, 0),
    pose: bb.getOr<NpcPoseId>(BB.pose, "stand"),
    line: bb.getOr(BB.line, ""),
    name: bb.getOr(BB.name, "Local"),
  };
}
