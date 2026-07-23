import { ActionNode } from "./node";
import type { Blackboard } from "./blackboard";
import { BB } from "./blackboard";
import type { NodeStatus, NpcPoseId, Vec3 } from "./types";

function dist2(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.hypot(dx, dz);
}

function lerpAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** Wait (Seconds) — Unity Delay/Wait */
export class WaitSeconds extends ActionNode {
  readonly name = "WaitSeconds";
  private t = 0;

  constructor(private seconds: number) {
    super();
  }

  onStart(): void {
    this.t = 0;
  }

  tick(_bb: Blackboard, dt: number): NodeStatus {
    this.t += dt;
    return this.t >= this.seconds ? "Success" : "Running";
  }
}

/** Wait (Range) — Unity Delay/Wait Range */
export class WaitRange extends ActionNode {
  readonly name = "WaitRange";
  private t = 0;
  private need = 1;

  constructor(
    private minSec: number,
    private maxSec: number,
    private rng: () => number = Math.random,
  ) {
    super();
  }

  onStart(): void {
    this.t = 0;
    this.need = this.minSec + this.rng() * Math.max(0, this.maxSec - this.minSec);
  }

  tick(_bb: Blackboard, dt: number): NodeStatus {
    this.t += dt;
    return this.t >= this.need ? "Success" : "Running";
  }
}

/** Set Animator-like pose on the Money Mascot */
export class SetPose extends ActionNode {
  readonly name = "SetPose";

  constructor(private pose: NpcPoseId) {
    super();
  }

  tick(bb: Blackboard): NodeStatus {
    bb.set(BB.pose, this.pose);
    return "Success";
  }
}

/** Prefer guided tutorial pose when present (Abort/override style). */
export class ApplyGuidedPose extends ActionNode {
  readonly name = "ApplyGuidedPose";

  tick(bb: Blackboard): NodeStatus {
    const guided = bb.get<NpcPoseId | null>(BB.guidedPose);
    if (guided) {
      bb.set(BB.pose, guided);
      return "Success";
    }
    return "Failure";
  }
}

/** Face / Look At player when near */
export class FacePlayer extends ActionNode {
  readonly name = "FacePlayer";

  tick(bb: Blackboard, dt: number): NodeStatus {
    const self = bb.getOr<Vec3>(BB.position, [0, 0, 0]);
    const player = bb.get<Vec3>(BB.playerPos);
    if (!player) return "Failure";
    const targetYaw = Math.atan2(player[0] - self[0], player[2] - self[2]);
    const yaw = bb.getOr(BB.yaw, 0);
    bb.set(BB.yaw, lerpAngle(yaw, targetYaw, Math.min(1, dt * 4)));
    return "Success";
  }
}

/** Navigate To Location — Unity Navigation (Transform lerp, no NavMesh in web) */
export class NavigateToLocation extends ActionNode {
  readonly name = "NavigateToLocation";

  constructor(private key: string = BB.wanderTarget) {
    super();
  }

  tick(bb: Blackboard, dt: number): NodeStatus {
    const target = bb.get<Vec3>(this.key);
    if (!target) return "Failure";
    const pos = bb.getOr<Vec3>(BB.position, [0, 0, 0]);
    const speed = bb.getOr(BB.speed, 1.6);
    const d = dist2(pos, target);
    if (d < 0.18) {
      bb.set(BB.position, [target[0], 0, target[2]]);
      bb.set(BB.pose, "stand");
      return "Success";
    }
    const step = Math.min(d, speed * dt);
    const nx = pos[0] + ((target[0] - pos[0]) / d) * step;
    const nz = pos[2] + ((target[2] - pos[2]) / d) * step;
    bb.set(BB.position, [nx, 0, nz]);
    bb.set(BB.yaw, Math.atan2(target[0] - pos[0], target[2] - pos[2]));
    bb.set(BB.pose, "run");
    return "Running";
  }
}

/** Pick a wander point near home (Patrol-lite) */
export class PickWanderTarget extends ActionNode {
  readonly name = "PickWanderTarget";

  constructor(private rng: () => number = Math.random) {
    super();
  }

  tick(bb: Blackboard): NodeStatus {
    const home = bb.getOr<Vec3>(BB.home, [0, 0, 0]);
    const radius = bb.getOr(BB.walkRadius, 2.8);
    const ang = this.rng() * Math.PI * 2;
    const r = 0.6 + this.rng() * radius;
    bb.set(BB.wanderTarget, [home[0] + Math.cos(ang) * r, 0, home[2] + Math.sin(ang) * r]);
    return "Success";
  }
}

/** Snap / ease toward schedule slot for the current hour */
export class SetScheduleTarget extends ActionNode {
  readonly name = "SetScheduleTarget";

  tick(bb: Blackboard): NodeStatus {
    const slot = bb.get<Vec3>(BB.scheduleTarget);
    if (!slot) return "Failure";
    bb.set(BB.wanderTarget, slot);
    return "Success";
  }
}

/** Update PlayerNear from blackboard distances */
export class SensePlayer extends ActionNode {
  readonly name = "SensePlayer";

  tick(bb: Blackboard): NodeStatus {
    const self = bb.getOr<Vec3>(BB.position, [0, 0, 0]);
    const player = bb.get<Vec3>(BB.playerPos);
    const radius = bb.getOr(BB.talkRadius, 2.4);
    if (!player) {
      bb.set(BB.playerNear, false);
      return "Success";
    }
    bb.set(BB.playerNear, dist2(self, player) <= radius);
    return "Success";
  }
}

/** Idle sway pose when alone */
export class IdleStand extends ActionNode {
  readonly name = "IdleStand";

  tick(bb: Blackboard): NodeStatus {
    if (!bb.get(BB.guidedPose)) bb.set(BB.pose, "stand");
    return "Success";
  }
}

/** Wave / talk when player is near */
export class GreetPlayer extends ActionNode {
  readonly name = "GreetPlayer";

  tick(bb: Blackboard): NodeStatus {
    bb.set(BB.pose, "wave");
    return "Success";
  }
}
