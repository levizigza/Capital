import type { NodeStatus } from "./types";
import type { Blackboard } from "./blackboard";

/**
 * Behavior node — Unity Behavior node contract.
 * tick() returns Success | Failure | Running (same vocabulary as Unity).
 */
export interface BehaviorNode {
  readonly name: string;
  /** Called before first tick / after reset */
  onStart?(bb: Blackboard): void;
  tick(bb: Blackboard, dt: number): NodeStatus;
  /** Called when the node finishes or is aborted */
  onEnd?(bb: Blackboard): void;
  reset(): void;
}

export abstract class ActionNode implements BehaviorNode {
  abstract readonly name: string;
  private started = false;

  onStart(_bb: Blackboard): void {}
  abstract tick(bb: Blackboard, dt: number): NodeStatus;
  onEnd(_bb: Blackboard): void {}

  /** Framework helper — ensures onStart once per run */
  run(bb: Blackboard, dt: number): NodeStatus {
    if (!this.started) {
      this.onStart(bb);
      this.started = true;
    }
    const status = this.tick(bb, dt);
    if (status !== "Running") {
      this.onEnd(bb);
      this.started = false;
    }
    return status;
  }

  reset(): void {
    this.started = false;
  }

  // BehaviorNode.tick delegates through run for leaf actions when composed
  // Composites call child.tick directly after managing start — so leaves use run via wrapper
}
