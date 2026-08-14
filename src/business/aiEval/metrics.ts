/**
 * Aggregate eval metrics from audit trails.
 */

import type { TaskAuditTrail, WorkerMetricSnapshot } from "./types";

function rate(num: number, den: number): number {
  if (den <= 0) return 0;
  return Math.round((num / den) * 1000) / 1000;
}

export function computeWorkerMetrics(
  workerId: string,
  audits: TaskAuditTrail[],
  windowSize?: number,
): WorkerMetricSnapshot {
  const sorted = [...audits]
    .filter((a) => a.worker_id === workerId)
    .sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at));
  const window = windowSize && windowSize > 0 ? sorted.slice(-windowSize) : sorted;

  // Group by task_id — attempts share task
  const byTask = new Map<string, TaskAuditTrail[]>();
  for (const a of window) {
    const list = byTask.get(a.task_id) ?? [];
    list.push(a);
    byTask.set(a.task_id, list);
  }

  const tasks = [...byTask.values()];
  const taskCount = tasks.length;
  let completed = 0;
  let humanCorrected = 0;
  let hallucinated = 0;
  let escalated = 0;
  let retries = 0;
  let toolCalls = 0;
  let toolFails = 0;
  let latencySum = 0;
  let latencyN = 0;
  let tokenSum = 0;
  let costSum = 0;
  let accuracySum = 0;
  let accuracyN = 0;
  let valueSum = 0;

  for (const attempts of tasks) {
    const last = attempts[attempts.length - 1]!;
    if (last.result === "success" || last.result === "partial") completed++;
    if (attempts.some((a) => a.human_corrected)) humanCorrected++;
    if (attempts.some((a) => a.hallucination_flagged)) hallucinated++;
    if (attempts.some((a) => a.result === "escalated" || a.result === "stopped")) {
      // count escalation if any attempt escalated
      if (attempts.some((a) => a.result === "escalated")) escalated++;
    }
    retries += Math.max(0, attempts.length - 1);
    for (const a of attempts) {
      for (const t of a.tools_used) {
        toolCalls++;
        if (!t.ok) toolFails++;
      }
      if (typeof a.latency_ms === "number") {
        latencySum += a.latency_ms;
        latencyN++;
      }
      tokenSum += a.cost.tokens_in + a.cost.tokens_out;
      costSum += a.cost.cost;
      if (typeof a.accuracy === "number") {
        accuracySum += a.accuracy;
        accuracyN++;
      }
      if (typeof a.business_value === "number") valueSum += a.business_value;
    }
  }

  const attemptsTotal = window.length;

  return {
    worker_id: workerId,
    window_size: window.length,
    task_completion_rate: rate(completed, taskCount),
    accuracy: accuracyN ? Math.round((accuracySum / accuracyN) * 1000) / 1000 : null,
    human_correction_rate: rate(humanCorrected, taskCount),
    hallucination_rate: rate(hallucinated, taskCount),
    tool_failure_rate: rate(toolFails, toolCalls),
    retry_rate: rate(retries, Math.max(attemptsTotal, 1)),
    average_latency: latencyN ? Math.round(latencySum / latencyN) : null,
    tokens_per_task: taskCount ? Math.round(tokenSum / taskCount) : null,
    cost_per_task: taskCount ? Math.round((costSum / taskCount) * 10000) / 10000 : null,
    escalation_rate: rate(escalated, taskCount),
    business_value_created: Math.round(valueSum * 100) / 100,
    computed_at: new Date().toISOString(),
  };
}

export function thresholdsBreached(
  metrics: WorkerMetricSnapshot,
  thresholds: {
    max_hallucination_rate: number;
    max_tool_failure_rate: number;
    max_cost_per_task: number;
    max_latency_ms: number;
    max_escalation_rate?: number;
  },
): string[] {
  const breaches: string[] = [];
  if (metrics.hallucination_rate > thresholds.max_hallucination_rate) {
    breaches.push(
      `hallucination_rate ${metrics.hallucination_rate} > ${thresholds.max_hallucination_rate}`,
    );
  }
  if (metrics.tool_failure_rate > thresholds.max_tool_failure_rate) {
    breaches.push(
      `tool_failure_rate ${metrics.tool_failure_rate} > ${thresholds.max_tool_failure_rate}`,
    );
  }
  if (
    metrics.cost_per_task != null &&
    metrics.cost_per_task > thresholds.max_cost_per_task
  ) {
    breaches.push(`cost_per_task ${metrics.cost_per_task} > ${thresholds.max_cost_per_task}`);
  }
  if (
    metrics.average_latency != null &&
    metrics.average_latency > thresholds.max_latency_ms
  ) {
    breaches.push(`average_latency ${metrics.average_latency} > ${thresholds.max_latency_ms}`);
  }
  if (
    thresholds.max_escalation_rate != null &&
    metrics.escalation_rate > thresholds.max_escalation_rate
  ) {
    breaches.push(
      `escalation_rate ${metrics.escalation_rate} > ${thresholds.max_escalation_rate}`,
    );
  }
  return breaches;
}
