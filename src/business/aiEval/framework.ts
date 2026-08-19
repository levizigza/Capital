/**
 * Eval harness — run workers with finite retries; STOP → preserve → document → escalate.
 */

import { computeWorkerMetrics, thresholdsBreached } from "./metrics";
import { AiEvalError, validateWorkerConfig } from "./thresholds";
import type {
  EscalationRecord,
  EvalFrameworkSnapshot,
  FailureDocument,
  FailureThresholds,
  PreservedWorkerState,
  TaskAuditTrail,
  TaskResultStatus,
  WorkerEvalConfig,
  WorkerMetricSnapshot,
} from "./types";
import { DEFAULT_FAILURE_THRESHOLDS } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type WorkerTaskInput = {
  task_id: string;
  input: unknown;
  context_references: string[];
  working_memory?: Record<string, unknown>;
};

export type WorkerAttemptOutcome = {
  outputs: unknown;
  tools_used: TaskAuditTrail["tools_used"];
  actions_taken: TaskAuditTrail["actions_taken"];
  approvals?: TaskAuditTrail["approvals"];
  cost: TaskAuditTrail["cost"];
  result: Exclude<TaskResultStatus, "stopped" | "escalated">;
  error_message?: string | null;
  latency_ms?: number;
  human_corrected?: boolean;
  hallucination_flagged?: boolean;
  accuracy?: number | null;
  business_value?: number | null;
};

export type WorkerExecutor = (
  input: WorkerTaskInput,
  attempt: number,
) => Promise<WorkerAttemptOutcome> | WorkerAttemptOutcome;

export type RunTaskResult = {
  status: TaskResultStatus;
  audits: TaskAuditTrail[];
  escalation: EscalationRecord | null;
  failure: FailureDocument | null;
  preserved: PreservedWorkerState | null;
};

export class AiEvalFramework {
  private configs = new Map<string, WorkerEvalConfig>();
  private audits: TaskAuditTrail[] = [];
  private escalations: EscalationRecord[] = [];
  private failures: FailureDocument[] = [];
  private preserved: PreservedWorkerState[] = [];
  /** Per worker consecutive error streak */
  private consecutiveErrors = new Map<string, number>();
  /** Workers frozen after STOP */
  private stoppedWorkers = new Set<string>();

  registerWorker(config: WorkerEvalConfig): WorkerEvalConfig {
    const merged: WorkerEvalConfig = {
      ...config,
      thresholds: { ...DEFAULT_FAILURE_THRESHOLDS, ...config.thresholds },
    };
    // Re-merge carefully — spread defaults then overrides
    merged.thresholds = { ...DEFAULT_FAILURE_THRESHOLDS, ...config.thresholds };
    const v = validateWorkerConfig(merged);
    if (!v.ok) {
      throw new AiEvalError(v.issues.map((i) => i.message).join("; "), v.issues);
    }
    // Enforce finite retries again
    if (!Number.isFinite(merged.thresholds.max_retries)) {
      throw new AiEvalError("max_retries must be finite — no indefinite retry loops");
    }
    this.configs.set(merged.worker_id, structuredClone(merged));
    return structuredClone(merged);
  }

  getConfig(workerId: string): WorkerEvalConfig | null {
    const c = this.configs.get(workerId);
    return c ? structuredClone(c) : null;
  }

  isStopped(workerId: string): boolean {
    return this.stoppedWorkers.has(workerId);
  }

  /**
   * Execute a task with bounded retries.
   * On exceeding retry or consecutive error limit: STOP → preserve → document → escalate.
   */
  async runTask(workerId: string, task: WorkerTaskInput, executor: WorkerExecutor): Promise<RunTaskResult> {
    const config = this.configs.get(workerId);
    if (!config) throw new AiEvalError(`Unknown worker ${workerId}`);
    if (this.stoppedWorkers.has(workerId)) {
      throw new AiEvalError(
        `Worker ${workerId} is STOPPED — clear escalation before new autonomous runs`,
      );
    }

    const thresholds = config.thresholds;
    const audits: TaskAuditTrail[] = [];
    let consecutive = this.consecutiveErrors.get(workerId) ?? 0;
    const maxAttempts = thresholds.max_retries + 1; // initial try + retries

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const runId = newId("run");
      const started = nowIso();
      let outcome: WorkerAttemptOutcome;
      try {
        outcome = await Promise.resolve(executor(task, attempt));
      } catch (err) {
        outcome = {
          outputs: null,
          tools_used: [],
          actions_taken: [{ kind: "exception", at: nowIso(), detail: String(err) }],
          cost: { tokens_in: 0, tokens_out: 0, cost: 0, currency: "USD" },
          result: "failed",
          error_message: err instanceof Error ? err.message : String(err),
          latency_ms: 0,
        };
      }

      const finished = nowIso();
      const audit: TaskAuditTrail = {
        schema_version: "1",
        run_id: runId,
        worker_id: workerId,
        task_id: task.task_id,
        attempt,
        started_at: started,
        finished_at: finished,
        input: structuredClone(task.input),
        context_references: [...task.context_references],
        tools_used: structuredClone(outcome.tools_used),
        actions_taken: structuredClone(outcome.actions_taken),
        outputs: structuredClone(outcome.outputs),
        approvals: structuredClone(outcome.approvals ?? []),
        cost: structuredClone(outcome.cost),
        result: outcome.result,
        human_corrected: outcome.human_corrected,
        hallucination_flagged: outcome.hallucination_flagged,
        accuracy: outcome.accuracy ?? null,
        business_value: outcome.business_value ?? null,
        error_message: outcome.error_message ?? null,
        latency_ms: outcome.latency_ms ?? null,
      };
      this.audits.push(audit);
      audits.push(structuredClone(audit));

      // Per-task cost/latency hard stop
      if (outcome.cost.cost > thresholds.max_cost_per_task) {
        return this.stopPreserveEscalate({
          config,
          task,
          audits,
          reason: `cost_per_task ${outcome.cost.cost} exceeded max ${thresholds.max_cost_per_task}`,
          consecutive_errors: consecutive + 1,
          lastAudit: audit,
        });
      }
      if (
        typeof outcome.latency_ms === "number" &&
        outcome.latency_ms > thresholds.max_latency_ms
      ) {
        return this.stopPreserveEscalate({
          config,
          task,
          audits,
          reason: `latency_ms ${outcome.latency_ms} exceeded max ${thresholds.max_latency_ms}`,
          consecutive_errors: consecutive + 1,
          lastAudit: audit,
        });
      }

      if (outcome.result === "success" || outcome.result === "partial") {
        this.consecutiveErrors.set(workerId, 0);
        // Rolling metric threshold check after success
        const metrics = this.metricsFor(workerId);
        const breaches = thresholdsBreached(metrics, thresholds);
        if (breaches.length) {
          return this.stopPreserveEscalate({
            config,
            task,
            audits,
            reason: `Metric thresholds breached: ${breaches.join("; ")}`,
            consecutive_errors: 0,
            lastAudit: audit,
          });
        }
        return {
          status: outcome.result,
          audits,
          escalation: null,
          failure: null,
          preserved: null,
        };
      }

      // failed
      consecutive += 1;
      this.consecutiveErrors.set(workerId, consecutive);

      if (consecutive >= thresholds.max_consecutive_errors) {
        return this.stopPreserveEscalate({
          config,
          task,
          audits,
          reason: `max_consecutive_errors ${thresholds.max_consecutive_errors} exceeded`,
          consecutive_errors: consecutive,
          lastAudit: audit,
        });
      }

      if (attempt >= maxAttempts) {
        return this.stopPreserveEscalate({
          config,
          task,
          audits,
          reason: `max_retries ${thresholds.max_retries} exceeded (attempts=${attempt})`,
          consecutive_errors: consecutive,
          lastAudit: audit,
        });
      }
      // else retry — bounded by loop
    }

    // Unreachable if maxAttempts ≥ 1, but satisfy types / safety
    throw new AiEvalError("Retry loop exited unexpectedly — refusing indefinite retry");
  }

  private stopPreserveEscalate(args: {
    config: WorkerEvalConfig;
    task: WorkerTaskInput;
    audits: TaskAuditTrail[];
    reason: string;
    consecutive_errors: number;
    lastAudit: TaskAuditTrail;
  }): RunTaskResult {
    const { config, task, audits, reason, consecutive_errors, lastAudit } = args;
    const workerId = config.worker_id;

    // 1. STOP
    this.stoppedWorkers.add(workerId);

    // Mark last audit as stopped if still failed
    const stoppedAudit: TaskAuditTrail = {
      ...lastAudit,
      result: "stopped",
      actions_taken: [
        ...lastAudit.actions_taken,
        { kind: "stop", at: nowIso(), detail: reason },
      ],
    };
    // Update stored audit
    const idx = this.audits.findIndex((a) => a.run_id === lastAudit.run_id);
    if (idx >= 0) this.audits[idx] = stoppedAudit;
    const auditsOut = audits.map((a) =>
      a.run_id === lastAudit.run_id ? structuredClone(stoppedAudit) : a,
    );

    // 2. Preserve state
    const preserved: PreservedWorkerState = {
      id: newId("state"),
      worker_id: workerId,
      task_id: task.task_id,
      frozen_at: nowIso(),
      last_audit: structuredClone(stoppedAudit),
      working_memory: structuredClone(task.working_memory ?? {}),
    };
    this.preserved.push(preserved);

    // 3. Document failure
    const failure: FailureDocument = {
      id: newId("fail"),
      worker_id: workerId,
      task_id: task.task_id,
      run_id: stoppedAudit.run_id,
      reason,
      attempts: auditsOut.length,
      consecutive_errors,
      thresholds: structuredClone(config.thresholds),
      audit_run_ids: auditsOut.map((a) => a.run_id),
      created_at: nowIso(),
    };
    this.failures.push(failure);

    // 4. Escalate
    const escalation: EscalationRecord = {
      id: newId("esc"),
      worker_id: workerId,
      task_id: task.task_id,
      run_id: stoppedAudit.run_id,
      reason,
      escalation_target: config.escalation_target,
      preserved_state_ref: preserved.id,
      failure_doc_id: failure.id,
      at: nowIso(),
    };
    // Patch last audit result to escalated for metrics
    const escalatedAudit: TaskAuditTrail = {
      ...stoppedAudit,
      result: "escalated",
      actions_taken: [
        ...stoppedAudit.actions_taken,
        {
          kind: "escalate",
          at: escalation.at,
          detail: `Escalated to ${config.escalation_target}`,
        },
      ],
    };
    if (idx >= 0) this.audits[idx] = escalatedAudit;
    const finalAudits = auditsOut.map((a) =>
      a.run_id === lastAudit.run_id ? structuredClone(escalatedAudit) : a,
    );
    this.escalations.push(escalation);

    return {
      status: "escalated",
      audits: finalAudits,
      escalation: structuredClone(escalation),
      failure: structuredClone(failure),
      preserved: structuredClone(preserved),
    };
  }

  /** Human clears STOP after reviewing escalation. */
  clearStop(workerId: string, reviewer: string): void {
    if (!reviewer.trim() || /^(agent|ai|bot|gpt|claude)/i.test(reviewer)) {
      throw new AiEvalError("clearStop requires a human reviewer");
    }
    this.stoppedWorkers.delete(workerId);
    this.consecutiveErrors.set(workerId, 0);
  }

  metricsFor(workerId: string): WorkerMetricSnapshot {
    const cfg = this.configs.get(workerId);
    const window = cfg?.thresholds.rolling_window;
    return computeWorkerMetrics(workerId, this.audits, window);
  }

  listAudits(workerId?: string): TaskAuditTrail[] {
    return this.audits
      .filter((a) => !workerId || a.worker_id === workerId)
      .map((a) => structuredClone(a));
  }

  listEscalations(): EscalationRecord[] {
    return this.escalations.map((e) => structuredClone(e));
  }

  listFailures(): FailureDocument[] {
    return this.failures.map((f) => structuredClone(f));
  }

  serialize(): EvalFrameworkSnapshot {
    return {
      schema_version: "1",
      policy: "no_indefinite_retry_stop_preserve_escalate",
      configs: [...this.configs.values()].map((c) => structuredClone(c)),
      audits: this.listAudits(),
      escalations: this.listEscalations(),
      failures: this.listFailures(),
      preserved: this.preserved.map((p) => structuredClone(p)),
      updated_at: nowIso(),
    };
  }

  hydrate(snap: EvalFrameworkSnapshot): void {
    this.configs.clear();
    for (const c of snap.configs) this.configs.set(c.worker_id, structuredClone(c));
    this.audits = snap.audits.map((a) => structuredClone(a));
    this.escalations = snap.escalations.map((e) => structuredClone(e));
    this.failures = snap.failures.map((f) => structuredClone(f));
    this.preserved = snap.preserved.map((p) => structuredClone(p));
    this.stoppedWorkers.clear();
    this.consecutiveErrors.clear();
  }
}

export type { FailureThresholds };
