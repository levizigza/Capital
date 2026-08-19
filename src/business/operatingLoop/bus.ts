/**
 * In-process event bus for cross-lane handoffs.
 */

import type { HandoffKind, LoopEvent } from "./types";

export type EventHandler = (event: LoopEvent) => void | Promise<void>;

export class OperatingLoopBus {
  private handlers = new Map<HandoffKind | "*", Set<EventHandler>>();
  private log: LoopEvent[] = [];

  subscribe(kind: HandoffKind | "*", handler: EventHandler): () => void {
    const set = this.handlers.get(kind) ?? new Set();
    set.add(handler);
    this.handlers.set(kind, set);
    return () => set.delete(handler);
  }

  async publish(event: LoopEvent): Promise<void> {
    this.log.push(structuredClone(event));
    const specific = this.handlers.get(event.kind);
    const all = this.handlers.get("*");
    const list = [...(specific ? [...specific] : []), ...(all ? [...all] : [])];
    for (const h of list) {
      await Promise.resolve(h(event));
    }
  }

  history(traceId?: string): LoopEvent[] {
    return this.log
      .filter((e) => !traceId || e.trace_id === traceId)
      .map((e) => structuredClone(e));
  }

  clear(): void {
    this.log = [];
  }
}
