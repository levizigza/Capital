/**
 * Deterministic task classification & mode selection.
 */

import { inferTouchedDomains } from "./protected";
import type {
  Classification,
  ExecutionMode,
  OperatorObservation,
  ProtectedDomain,
  TaskClass,
} from "./types";

function pickTaskClass(
  observation: OperatorObservation,
  touched: ProtectedDomain[],
): { task_class: TaskClass; mode: ExecutionMode; rationale: string } {
  const signal = observation.signal.trim();
  const tags = (observation.tags ?? []).map((t) => t.toLowerCase());

  if (!signal) {
    return {
      task_class: "unknown",
      mode: "none",
      rationale: "Empty observation — nothing to do",
    };
  }

  if (touched.length > 0) {
    return {
      task_class: "propose_protected_change",
      mode: "deterministic",
      rationale: `Touches protected domain(s): ${touched.join(", ")} — propose only; require approval`,
    };
  }

  if (tags.includes("metrics") || /\bmetric(s)?\b/i.test(signal) || /\bKPI\b/.test(signal)) {
    return {
      task_class: "operational_metrics",
      mode: "deterministic",
      rationale: "Metrics/KPI signal → deterministic metrics workflow",
    };
  }

  if (
    tags.includes("workflow") ||
    tags.includes("playbook") ||
    /\b(runbook|playbook|workflow)\b/i.test(signal)
  ) {
    return {
      task_class: "run_deterministic_workflow",
      mode: "deterministic",
      rationale: "Named playbook/workflow → deterministic path",
    };
  }

  if (
    tags.includes("ai") ||
    tags.includes("reason") ||
    /\b(brainstorm|reason about|analyze|draft)\b/i.test(signal)
  ) {
    return {
      task_class: "request_ai_reasoning",
      mode: "ai_reasoning",
      rationale: "Open-ended analysis → AI reasoning (results stay non-canonical)",
    };
  }

  if (tags.includes("summarize") || /\b(summarize|what do we know|status)\b/i.test(signal)) {
    return {
      task_class: "retrieve_and_summarize",
      mode: "deterministic",
      rationale: "Status/summarize → retrieve context deterministically",
    };
  }

  // Default: observe / light retrieve — never jump to protected execution
  return {
    task_class: "observe_only",
    mode: "deterministic",
    rationale: "Default observe path — no protected mutation",
  };
}

export function classifyTask(observation: OperatorObservation): Classification {
  const touched = inferTouchedDomains(observation.signal, observation.touches ?? []);
  const picked = pickTaskClass(observation, touched);
  return {
    task_class: picked.task_class,
    mode: picked.mode,
    rationale: picked.rationale,
    touched_domains: touched,
  };
}

export function resolveMode(
  classification: Classification,
  forceMode?: ExecutionMode | null,
): ExecutionMode {
  if (forceMode) return forceMode;
  return classification.mode;
}
