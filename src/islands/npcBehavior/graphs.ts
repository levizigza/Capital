import { Blackboard, BB } from "./blackboard";
import { BehaviorGraphAgent } from "./agent";
import {
  ApplyGuidedPose,
  FacePlayer,
  GreetPlayer,
  IdleStand,
  NavigateToLocation,
  PickWanderTarget,
  SensePlayer,
  SetPose,
  SetScheduleTarget,
  WaitRange,
  WaitSeconds,
} from "./actions";
import {
  ConditionalBranch,
  ConditionalGuard,
  RandomOne,
  RepeatForever,
  Sequence,
  TryInOrder,
} from "./flow";
import type { BehaviorNode } from "./node";
import type { NpcPoseId, Vec3 } from "./types";
import type { HarborNpcLife } from "../harborNpcLives";
import { currentHarborHour, harborNpcPose } from "../harborNpcLives";
import type { AmbientResident } from "../islandCulture";

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Harbor local graph — Unity-style:
 * Repeat forever → Sense → (Guided override | Near player greet | Schedule navigate | Wander idle)
 */
export function buildHarborNpcGraph(rng: () => number): BehaviorNode {
  const greetBranch = new Sequence("GreetPlayerSeq", [
    new ConditionalGuard((bb) => bb.getOr(BB.playerNear, false)),
    new FacePlayer(),
    new GreetPlayer(),
    new WaitSeconds(1.4),
  ]);

  const scheduleWalk = new Sequence("ScheduleWalk", [
    new SetScheduleTarget(),
    new NavigateToLocation(BB.wanderTarget),
    new IdleStand(),
    new WaitRange(2.5, 5.5, rng),
  ]);

  const wander = new Sequence("WanderPlaza", [
    new PickWanderTarget(rng),
    new NavigateToLocation(),
    new RandomOne(
      "IdleEmote",
      [new SetPose("stand"), new SetPose("nod"), new SetPose("talk")],
      rng,
    ),
    new WaitRange(1.8, 4.2, rng),
  ]);

  const freeRoam = new TryInOrder("FreeRoam", [greetBranch, scheduleWalk, wander]);

  const guided = new Sequence("GuidedOverride", [
    new ApplyGuidedPose(),
    new FacePlayer(),
    new WaitSeconds(0.4),
  ]);

  return new RepeatForever(
    "HarborLife",
    new Sequence("HarborTick", [
      new SensePlayer(),
      new TryInOrder("Priority", [guided, freeRoam]),
    ]),
  );
}

/**
 * Shore ambient graph — quieter wander + rare wave when player close.
 */
export function buildShoreAmbientGraph(rng: () => number): BehaviorNode {
  const greet = new Sequence("AmbientGreet", [
    new ConditionalGuard((bb) => bb.getOr(BB.playerNear, false)),
    new FacePlayer(),
    new GreetPlayer(),
    new WaitSeconds(1.1),
  ]);

  const wander = new Sequence("AmbientWander", [
    new PickWanderTarget(rng),
    new NavigateToLocation(),
    new IdleStand(),
    new WaitRange(2.2, 6, rng),
  ]);

  const linger = new Sequence("AmbientLinger", [
    new IdleStand(),
    new WaitRange(3, 7, rng),
  ]);

  return new RepeatForever(
    "ShoreLife",
    new Sequence("ShoreTick", [
      new SensePlayer(),
      new ConditionalBranch(
        "Near?",
        (bb) => bb.getOr(BB.playerNear, false),
        greet,
        new RandomOne("RoamOrLinger", [wander, linger], rng),
      ),
    ]),
  );
}

/**
 * Static harbor / shore — hold post, greet when near, no wander.
 * Used for tableau keepers so mixed ecosystems feel authored.
 */
export function buildStaticKeeperGraph(rng: () => number): BehaviorNode {
  const greetBranch = new Sequence("StaticGreet", [
    new ConditionalGuard((bb) => bb.getOr(BB.playerNear, false)),
    new FacePlayer(),
    new GreetPlayer(),
    new WaitSeconds(1.4),
  ]);

  const stay = new Sequence("HoldPost", [
    new IdleStand(),
    new WaitRange(3.5, 7, rng),
  ]);

  const guided = new Sequence("GuidedOverride", [
    new ApplyGuidedPose(),
    new FacePlayer(),
    new WaitSeconds(0.4),
  ]);

  return new RepeatForever(
    "StaticKeeper",
    new Sequence("StaticTick", [
      new SensePlayer(),
      new TryInOrder("StaticPriority", [guided, greetBranch, stay]),
    ]),
  );
}

export function createHarborAgent(
  life: HarborNpcLife,
  opts?: { guidedPose?: NpcPoseId | null; talkRadius?: number },
): BehaviorGraphAgent {
  const hour = currentHarborHour();
  const pose = harborNpcPose(life, hour);
  const rng = mulberry32(hashStr(`${life.mascotId}:${hour}`));
  const bb = new Blackboard();
  bb.set(BB.position, [...pose.position] as Vec3);
  bb.set(BB.home, [...life.home] as Vec3);
  bb.set(BB.scheduleTarget, [...pose.position] as Vec3);
  bb.set(BB.yaw, pose.yaw);
  bb.set(BB.pose, "stand" as NpcPoseId);
  bb.set(BB.line, pose.line);
  bb.set(BB.name, pose.name);
  bb.set(BB.walkRadius, life.motion === "static" ? 0.15 : 2.6);
  bb.set(BB.speed, life.motion === "static" ? 0.4 : 1.55);
  bb.set(BB.talkRadius, opts?.talkRadius ?? 2.4);
  bb.set(BB.guidedPose, opts?.guidedPose ?? null);
  bb.set(BB.seed, life.mascotId);
  const root =
    life.motion === "static" ? buildStaticKeeperGraph(rng) : buildHarborNpcGraph(rng);
  return new BehaviorGraphAgent(root, bb);
}

export function createShoreAmbientAgent(
  resident: AmbientResident,
  opts?: { walkRadius?: number; talkRadius?: number },
): BehaviorGraphAgent {
  const rng = mulberry32(hashStr(resident.id));
  const bb = new Blackboard();
  const home = [...resident.position] as Vec3;
  bb.set(BB.position, home);
  bb.set(BB.home, home);
  bb.set(BB.yaw, resident.yaw);
  bb.set(BB.pose, "stand" as NpcPoseId);
  bb.set(BB.line, "");
  bb.set(BB.name, resident.id);
  bb.set(BB.walkRadius, opts?.walkRadius ?? 2.2);
  bb.set(BB.speed, resident.social === "animal" || resident.social === "machine" ? 1.1 : 1.35);
  bb.set(BB.talkRadius, opts?.talkRadius ?? 2.2);
  bb.set(BB.guidedPose, null);
  bb.set(BB.seed, resident.id);
  const root =
    resident.motion === "static"
      ? buildStaticKeeperGraph(rng)
      : buildShoreAmbientGraph(rng);
  return new BehaviorGraphAgent(root, bb);
}
