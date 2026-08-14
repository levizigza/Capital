/**
 * Route every incoming task to exactly one RouteClass with reason_for_routing.
 */

import { extractSignals } from "./signals";
import type { IncomingTask, RouteClass, RoutingDecision, RoutingSignals } from "./types";

function reasonHuman(signals: RoutingSignals): string {
  const kinds = signals.consequence_reasons.join(", ") || "elevated consequence";
  return (
    `HUMAN_DECISION: consequences are ${kinds}. ` +
    `Strategic/irreversible/legal/financial/ethical tasks require a human decision event — ` +
    `not autonomous workflow or agent execution.`
  );
}

function reasonDeterministic(signals: RoutingSignals): string {
  const parts: string[] = [];
  if (signals.procedure_known) parts.push("procedure is known");
  if (signals.calculation_repeatable) parts.push("calculation is repeatable");
  if (signals.programmatically_validatable) parts.push("output can be validated programmatically");
  if (signals.low_judgment) parts.push("little contextual judgment required");
  return (
    `DETERMINISTIC_WORKFLOW: ${parts.join("; ") || "deterministic criteria met"}. ` +
    `Prefer a fixed playbook over AI.`
  );
}

function reasonAgent(signals: RoutingSignals): string {
  return (
    `AI_AGENT: task is ambiguous (${signals.ambiguous}), ` +
    `multi-step planning is necessary (${signals.multi_step_planning}), ` +
    `and tool choice depends on evolving context (${signals.evolving_tool_choice}). ` +
    `Use a scoped agent only for this case.`
  );
}

function reasonAssisted(signals: RoutingSignals, fallback: boolean): string {
  if (fallback) {
    return (
      `AI_ASSISTED_WORKFLOW: residual interpretive task — not a clear deterministic playbook, ` +
      `not a full AI-agent case (need ambiguity + multi-step planning + evolving tool choice), ` +
      `and no human-consequence gate. Interpretation may help; keep output reviewable.`
    );
  }
  const parts: string[] = [];
  if (signals.interpretation_useful) parts.push("interpretation is useful");
  if (signals.output_reviewable) parts.push("output can still be reviewed or validated");
  return `AI_ASSISTED_WORKFLOW: ${parts.join("; ")}.`;
}

/**
 * Classify an incoming task.
 * Priority: HUMAN_DECISION → DETERMINISTIC → AI_AGENT → AI_ASSISTED.
 */
export function routeTask(task: IncomingTask): RoutingDecision {
  if (!task.id?.trim()) {
    throw new Error("IncomingTask.id is required");
  }

  const signals = extractSignals(task);
  const considered: RouteClass[] = [
    "HUMAN_DECISION",
    "DETERMINISTIC_WORKFLOW",
    "AI_AGENT",
    "AI_ASSISTED_WORKFLOW",
  ];

  // Empty description: still route safely — assisted with explicit reason
  if (!task.description?.trim() && !(task.tags?.length) && !task.hints) {
    return {
      task_id: task.id,
      route: "AI_ASSISTED_WORKFLOW",
      reason_for_routing:
        "AI_ASSISTED_WORKFLOW: empty task description — cannot claim a known procedure or agent plan; " +
        "request clarification via assisted workflow, do not auto-execute.",
      signals,
      considered,
    };
  }

  if (signals.human_consequence) {
    return {
      task_id: task.id,
      route: "HUMAN_DECISION",
      reason_for_routing: reasonHuman(signals),
      signals,
      considered,
    };
  }

  if (signals.deterministic_eligible) {
    return {
      task_id: task.id,
      route: "DETERMINISTIC_WORKFLOW",
      reason_for_routing: reasonDeterministic(signals),
      signals,
      considered,
    };
  }

  if (signals.ai_agent_eligible) {
    return {
      task_id: task.id,
      route: "AI_AGENT",
      reason_for_routing: reasonAgent(signals),
      signals,
      considered,
    };
  }

  if (signals.ai_assisted_eligible) {
    return {
      task_id: task.id,
      route: "AI_ASSISTED_WORKFLOW",
      reason_for_routing: reasonAssisted(signals, false),
      signals,
      considered,
    };
  }

  // Default residual
  return {
    task_id: task.id,
    route: "AI_ASSISTED_WORKFLOW",
    reason_for_routing: reasonAssisted(signals, true),
    signals,
    considered,
  };
}

export function assertRouteClass(v: string): asserts v is RouteClass {
  if (
    v !== "DETERMINISTIC_WORKFLOW" &&
    v !== "AI_ASSISTED_WORKFLOW" &&
    v !== "AI_AGENT" &&
    v !== "HUMAN_DECISION"
  ) {
    throw new Error(`Invalid RouteClass: ${v}`);
  }
}
