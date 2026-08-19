/**
 * Operating loop facade — one spine for all lanes.
 */

import { OperatingLoopBus } from "./bus";
import {
  runCriticalHandoffChain,
  type ChainSeed,
} from "./handoffs";
import type { LoopTrace } from "./types";
import { rankByValueEfficiency } from "./value";

export class CapitalOperatingLoop {
  readonly bus = new OperatingLoopBus();

  /** Critical cross-lane chain used as the integration proof. */
  async runCustomerInsightLoop(seed: ChainSeed): Promise<LoopTrace> {
    const valueScale = seed.value_estimate != null ? seed.value_estimate / 50 : 1;
    const costScale = seed.cost_estimate != null ? seed.cost_estimate / 10 : 1;
    const founderScale =
      seed.founder_minutes != null ? seed.founder_minutes / 40 : 1;

    const scale = (
      value: number,
      cost: number,
      founder_minutes: number,
    ) => ({
      value: value * valueScale,
      cost: cost * costScale,
      founder_minutes: founder_minutes * founderScale,
    });

    return runCriticalHandoffChain(this.bus, seed, {
      economics: {
        customer_feedback: scale(10, 1, 5),
        voc_evidence: scale(5, 0.5, 10),
        hypothesis: scale(8, 0.2, 20),
        experiment: scale(15, 5, 30),
        product_change: scale(40, 20, 60),
        cohort_measurement: scale(12, 2, 15),
        decision: scale(25, 1, seed.founder_minutes ?? 45),
        company_memory: scale(6, 0.1, 5),
        marketing_insight: scale(20, 3, 15),
      },
    });
  }

  /**
   * Choose which completed traces deserve founder attention —
   * by value efficiency, never by automation count.
   */
  prioritizeTraces(traces: LoopTrace[]): LoopTrace[] {
    const order = rankByValueEfficiency(traces);
    return order.map((i) => traces[i]!);
  }

  history(traceId?: string) {
    return this.bus.history(traceId);
  }
}
