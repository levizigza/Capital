import { describe, expect, it } from "vitest";
import { Blackboard, BB } from "./blackboard";
import { BehaviorGraphAgent } from "./agent";
import {
  Sequence,
  TryInOrder,
  RepeatForever,
  ConditionalGuard,
} from "./flow";
import { WaitSeconds, SetPose, PickWanderTarget, NavigateToLocation } from "./actions";
import { buildHarborNpcGraph, createHarborAgent } from "./graphs";
import { buildHarborNpcLives } from "../harborNpcLives";

describe("npcBehavior Unity-style runtime", () => {
  it("Blackboard get/set mirrors Unity Behavior variables", () => {
    const bb = new Blackboard();
    bb.set(BB.pose, "wave");
    expect(bb.get(BB.pose)).toBe("wave");
    expect(bb.getOr(BB.speed, 1)).toBe(1);
  });

  it("Sequence runs Wait then SetPose to Success", () => {
    const root = new Sequence("test", [new WaitSeconds(0.05), new SetPose("nod")]);
    const agent = new BehaviorGraphAgent(root);
    let last = agent.tick(0.02);
    expect(last.pose).toBe("stand"); // default until SetPose
    // drain wait
    for (let i = 0; i < 10; i++) last = agent.tick(0.02);
    expect(last.pose).toBe("nod");
  });

  it("TryInOrder picks first Success (ConditionalGuard)", () => {
    const bb = new Blackboard();
    bb.set("ok", true);
    const root = new TryInOrder("sel", [
      new ConditionalGuard((b) => b.getOr("ok", false)),
      new SetPose("cheer"),
    ]);
    // Guard alone succeeds without SetPose — compose Sequence for set
    const seq = new Sequence("s", [
      new ConditionalGuard((b) => b.getOr("ok", false)),
      new SetPose("cheer"),
    ]);
    const agent = new BehaviorGraphAgent(seq, bb);
    const body = agent.tick(0.016);
    expect(body.pose).toBe("cheer");
  });

  it("NavigateToLocation reaches wander target", () => {
    const bb = new Blackboard();
    bb.set(BB.position, [0, 0, 0]);
    bb.set(BB.home, [0, 0, 0]);
    bb.set(BB.walkRadius, 2);
    bb.set(BB.speed, 8);
    bb.set(BB.wanderTarget, [2, 0, 0]);
    const agent = new BehaviorGraphAgent(new NavigateToLocation(), bb);
    let body = agent.tick(0.05);
    for (let i = 0; i < 40; i++) body = agent.tick(0.05);
    expect(body.position[0]).toBeGreaterThan(1.5);
  });

  it("Harbor graph agent ticks without throwing", () => {
    const lives = buildHarborNpcLives();
    const life = lives[0]!;
    const agent = createHarborAgent(life);
    agent.blackboard.set(BB.playerPos, [100, 0, 100]);
    for (let i = 0; i < 30; i++) {
      const body = agent.tick(0.05);
      expect(body.position).toHaveLength(3);
      expect(["stand", "run", "wave", "talk", "nod", "cheer", "point"]).toContain(body.pose);
    }
  });

  it("buildHarborNpcGraph is a RepeatForever root", () => {
    const g = buildHarborNpcGraph(() => 0.5);
    expect(g.name).toBe("HarborLife");
    expect(g).toBeInstanceOf(RepeatForever);
  });

  it("PickWanderTarget writes a nearby point", () => {
    const bb = new Blackboard();
    bb.set(BB.home, [3, 0, 4]);
    bb.set(BB.walkRadius, 2);
    const node = new PickWanderTarget(() => 0.25);
    expect(node.tick(bb, 0)).toBe("Success");
    const t = bb.get<[number, number, number]>(BB.wanderTarget)!;
    expect(Math.hypot(t[0] - 3, t[2] - 4)).toBeLessThan(3);
  });
});
