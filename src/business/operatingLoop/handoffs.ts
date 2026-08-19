/**
 * Critical handoff chain: feedback → VoC → … → marketing insight.
 */

import type {
  BusinessLane,
  HandoffKind,
  HandoffResult,
  LoopEvent,
  LoopTrace,
} from "./types";
import { CRITICAL_CHAIN, HANDOFF_STAGE } from "./types";
import { OperatingLoopBus } from "./bus";
import { aggregateTraceEfficiency } from "./value";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

const LANE_FOR: Record<HandoffKind, BusinessLane> = {
  customer_feedback: "customer_success",
  voc_evidence: "research",
  hypothesis: "research",
  experiment: "product",
  product_change: "product",
  cohort_measurement: "customer_success",
  decision: "operations",
  company_memory: "operations",
  marketing_insight: "marketing",
};

export class HandoffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HandoffError";
  }
}

export type ChainSeed = {
  feedback_summary: string;
  evidence_refs: string[];
  /** Optional economics for efficiency scoring */
  value_estimate?: number | null;
  cost_estimate?: number | null;
  founder_minutes?: number | null;
};

/**
 * Validates and advances one step in the critical chain.
 */
export function acceptHandoff(input: {
  kind: HandoffKind;
  trace_id: string;
  parent_event_id: string | null;
  summary: string;
  evidence_refs: string[];
  payload?: Record<string, unknown>;
  value_estimate?: number | null;
  cost_estimate?: number | null;
  founder_minutes?: number | null;
  /** Prior kinds already in the trace, in order */
  prior_kinds: HandoffKind[];
}): HandoffResult {
  if (!input.evidence_refs?.length) {
    return {
      accepted: false,
      event: null,
      reason: "Handoff rejected — evidence_refs required (no unsourced silo jumps)",
    };
  }
  if (!input.summary.trim()) {
    return { accepted: false, event: null, reason: "Handoff rejected — summary required" };
  }

  const expected = CRITICAL_CHAIN[input.prior_kinds.length];
  if (expected !== input.kind) {
    return {
      accepted: false,
      event: null,
      reason: `Handoff rejected — expected next kind “${expected ?? "∅"}”, got “${input.kind}” (no skipping the loop)`,
    };
  }

  // Parent linkage (except first)
  if (input.prior_kinds.length === 0) {
    if (input.parent_event_id != null) {
      return {
        accepted: false,
        event: null,
        reason: "First handoff must have parent_event_id=null",
      };
    }
  } else if (!input.parent_event_id) {
    return {
      accepted: false,
      event: null,
      reason: "Handoff rejected — parent_event_id required after OBSERVE",
    };
  }

  const event: LoopEvent = {
    id: newId("evt"),
    kind: input.kind,
    stage: HANDOFF_STAGE[input.kind],
    lane: LANE_FOR[input.kind],
    at: nowIso(),
    trace_id: input.trace_id,
    parent_event_id: input.parent_event_id,
    evidence_refs: [...input.evidence_refs],
    summary: input.summary.trim(),
    payload: { ...(input.payload ?? {}) },
    value_estimate: input.value_estimate ?? null,
    cost_estimate: input.cost_estimate ?? null,
    founder_minutes: input.founder_minutes ?? null,
  };

  return { accepted: true, event, reason: `Accepted ${input.kind} @ ${event.stage}` };
}

/**
 * Run the full critical chain with an event bus (integration spine).
 */
export async function runCriticalHandoffChain(
  bus: OperatingLoopBus,
  seed: ChainSeed,
  opts?: {
    /** Override per-step summaries */
    summaries?: Partial<Record<HandoffKind, string>>;
    /** Per-step value/cost/attention for efficiency */
    economics?: Partial<
      Record<
        HandoffKind,
        { value?: number | null; cost?: number | null; founder_minutes?: number | null }
      >
    >;
  },
): Promise<LoopTrace> {
  if (!seed.evidence_refs.length) {
    throw new HandoffError("customer_feedback requires evidence_refs");
  }

  const trace_id = newId("trace");
  const events: LoopEvent[] = [];
  let parent: string | null = null;
  const prior: HandoffKind[] = [];

  const defaultSummaries: Record<HandoffKind, string> = {
    customer_feedback: seed.feedback_summary,
    voc_evidence: `VoC evidence captured for: ${seed.feedback_summary}`,
    hypothesis: `Hypothesis from VoC: addressing feedback improves retention`,
    experiment: `Experiment designed to test hypothesis`,
    product_change: `Product change shipped from experiment learning`,
    cohort_measurement: `Cohort measurement after product change`,
    decision: `Decision from measured outcome (HITL if required)`,
    company_memory: `Remembered in company memory (non-auto-canonical)`,
    marketing_insight: `Marketing insight derived from remembered product/customer truth`,
  };

  for (const kind of CRITICAL_CHAIN) {
    const eco = opts?.economics?.[kind];
    const result = acceptHandoff({
      kind,
      trace_id,
      parent_event_id: parent,
      summary: opts?.summaries?.[kind] ?? defaultSummaries[kind],
      evidence_refs: seed.evidence_refs,
      payload: { chain: "voc_to_marketing" },
      value_estimate: eco?.value ?? seed.value_estimate ?? null,
      cost_estimate: eco?.cost ?? (kind === "customer_feedback" ? seed.cost_estimate : null) ?? null,
      founder_minutes:
        eco?.founder_minutes ??
        (kind === "decision" ? seed.founder_minutes ?? 15 : 0) ??
        null,
      prior_kinds: [...prior],
    });

    if (!result.accepted || !result.event) {
      throw new HandoffError(result.reason);
    }

    await bus.publish(result.event);
    events.push(result.event);
    parent = result.event.id;
    prior.push(kind);
  }

  return {
    trace_id,
    events,
    completed_chain: events.length === CRITICAL_CHAIN.length,
    efficiency: aggregateTraceEfficiency(events),
  };
}

/** Map lane → stages it typically owns (documentation helper for tests). */
export function laneStageParticipation(): Record<BusinessLane, import("./types").LoopStage[]> {
  return {
    product: ["LEARN", "DECIDE", "ACT", "MEASURE"],
    marketing: ["LEARN", "ACT", "MEASURE"],
    sales: ["OBSERVE", "LEARN", "ACT", "MEASURE"],
    customer_success: ["OBSERVE", "LEARN", "MEASURE", "DECIDE"],
    finance: ["MEASURE", "DECIDE", "REMEMBER"],
    research: ["OBSERVE", "LEARN", "ACT", "MEASURE"],
    operations: ["OBSERVE", "DECIDE", "ACT", "REMEMBER"],
    ai_workers: ["LEARN", "ACT", "MEASURE"],
  };
}
