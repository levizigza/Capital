import type { BehaviorNode } from "./node";
import { Blackboard, readBody, type BodySnapshot } from "./blackboard";

/**
 * BehaviorGraphAgent — Unity BehaviorGraphAgent analogue.
 * Owns a Blackboard + root graph and ticks every frame.
 */
export class BehaviorGraphAgent {
  readonly blackboard: Blackboard;
  private root: BehaviorNode;

  constructor(root: BehaviorNode, blackboard = new Blackboard()) {
    this.root = root;
    this.blackboard = blackboard;
  }

  setRoot(root: BehaviorNode): void {
    this.root.reset();
    this.root = root;
  }

  tick(dt: number): BodySnapshot {
    // Clamp huge hitch frames so Navigate doesn't teleport
    const step = Math.min(0.05, Math.max(0, dt));
    this.root.tick(this.blackboard, step);
    return readBody(this.blackboard);
  }

  reset(): void {
    this.root.reset();
  }
}
