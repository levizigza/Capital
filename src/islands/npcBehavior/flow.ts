import type { BehaviorNode } from "./node";
import type { Blackboard } from "./blackboard";
import type { NodeStatus } from "./types";

function runChild(child: BehaviorNode, bb: Blackboard, dt: number): NodeStatus {
  // Prefer ActionNode.run if present
  const anyChild = child as BehaviorNode & { run?: (bb: Blackboard, dt: number) => NodeStatus };
  if (typeof anyChild.run === "function") return anyChild.run(bb, dt);
  return child.tick(bb, dt);
}

/** Sequence — Unity Flow/Sequence: run children in order until one fails. */
export class Sequence implements BehaviorNode {
  readonly name: string;
  private index = 0;

  constructor(
    name: string,
    private children: BehaviorNode[],
  ) {
    this.name = name;
  }

  tick(bb: Blackboard, dt: number): NodeStatus {
    while (this.index < this.children.length) {
      const child = this.children[this.index]!;
      const status = runChild(child, bb, dt);
      if (status === "Running") return "Running";
      if (status === "Failure") {
        this.reset();
        return "Failure";
      }
      this.index += 1;
    }
    this.reset();
    return "Success";
  }

  reset(): void {
    this.index = 0;
    for (const c of this.children) c.reset();
  }
}

/** TryInOrder — Unity Flow/Try In Order (selector): first success wins. */
export class TryInOrder implements BehaviorNode {
  readonly name: string;
  private index = 0;

  constructor(
    name: string,
    private children: BehaviorNode[],
  ) {
    this.name = name;
  }

  tick(bb: Blackboard, dt: number): NodeStatus {
    while (this.index < this.children.length) {
      const child = this.children[this.index]!;
      const status = runChild(child, bb, dt);
      if (status === "Running") return "Running";
      if (status === "Success") {
        this.reset();
        return "Success";
      }
      this.index += 1;
    }
    this.reset();
    return "Failure";
  }

  reset(): void {
    this.index = 0;
    for (const c of this.children) c.reset();
  }
}

/** Repeat forever — Unity Flow/Repeat (forever mode). */
export class RepeatForever implements BehaviorNode {
  readonly name: string;

  constructor(
    name: string,
    private child: BehaviorNode,
  ) {
    this.name = name;
  }

  tick(bb: Blackboard, dt: number): NodeStatus {
    const status = runChild(this.child, bb, dt);
    if (status !== "Running") this.child.reset();
    return "Running";
  }

  reset(): void {
    this.child.reset();
  }
}

/** ConditionalBranch — Unity Flow/Conditional Branch. */
export class ConditionalBranch implements BehaviorNode {
  readonly name: string;
  private active: BehaviorNode | null = null;

  constructor(
    name: string,
    private condition: (bb: Blackboard) => boolean,
    private whenTrue: BehaviorNode,
    private whenFalse: BehaviorNode,
  ) {
    this.name = name;
  }

  tick(bb: Blackboard, dt: number): NodeStatus {
    if (!this.active) {
      this.active = this.condition(bb) ? this.whenTrue : this.whenFalse;
    }
    const status = runChild(this.active, bb, dt);
    if (status !== "Running") {
      this.active.reset();
      this.active = null;
    }
    return status;
  }

  reset(): void {
    this.active?.reset();
    this.active = null;
    this.whenTrue.reset();
    this.whenFalse.reset();
  }
}

/** Random — Unity Flow/Random: pick one child per activation. */
export class RandomOne implements BehaviorNode {
  readonly name: string;
  private pick: BehaviorNode | null = null;

  constructor(
    name: string,
    private children: BehaviorNode[],
    private rng: () => number = Math.random,
  ) {
    this.name = name;
  }

  tick(bb: Blackboard, dt: number): NodeStatus {
    if (!this.pick) {
      const i = Math.floor(this.rng() * this.children.length) % this.children.length;
      this.pick = this.children[i] ?? this.children[0]!;
    }
    const status = runChild(this.pick, bb, dt);
    if (status !== "Running") {
      this.pick.reset();
      this.pick = null;
    }
    return status;
  }

  reset(): void {
    this.pick?.reset();
    this.pick = null;
    for (const c of this.children) c.reset();
  }
}

/** ConditionalGuard — Unity Action/Conditional Guard. */
export class ConditionalGuard implements BehaviorNode {
  readonly name = "ConditionalGuard";

  constructor(private condition: (bb: Blackboard) => boolean) {}

  tick(bb: Blackboard, _dt: number): NodeStatus {
    return this.condition(bb) ? "Success" : "Failure";
  }

  reset(): void {}
}
