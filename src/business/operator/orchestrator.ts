/**
 * Capital Operator — single executive coordinator.
 * Not an autonomous CEO. Protected domains require ApprovalEvent.
 */

import { ExecutionAudit, createInMemoryAuditStore, type AuditStore } from "./audit";
import { classifyTask, resolveMode } from "./classify";
import { evaluateConfidence, mayAutoExecute } from "./confidence";
import {
  createAiReasoningStubHandler,
  createInMemoryContextPort,
  createInMemoryMemoryPort,
  createInMemoryMetricsPort,
  defaultDeterministicHandler,
} from "./ports";
import { approvalBlockReason } from "./protected";
import type {
  BlockedAction,
  ContextPort,
  DelegateResult,
  ExecutedAction,
  MemoryPort,
  MetricsPort,
  OperatorRequest,
  OperatorResult,
  OperatorStatus,
  ProposedAction,
  TaskHandler,
} from "./types";

export type OperatorDeps = {
  context?: ContextPort;
  memory?: MemoryPort;
  metrics?: MetricsPort;
  handlers?: TaskHandler[];
  auditStore?: AuditStore;
};

function pickHandler(
  handlers: TaskHandler[],
  classification: ReturnType<typeof classifyTask>,
): TaskHandler | null {
  return handlers.find((h) => h.supports(classification)) ?? null;
}

export class CapitalOperator {
  private readonly context: ContextPort;
  private readonly memory: MemoryPort;
  private readonly metrics: MetricsPort;
  private readonly handlers: TaskHandler[];
  private readonly auditStore: AuditStore;

  constructor(deps: OperatorDeps = {}) {
    this.context = deps.context ?? createInMemoryContextPort();
    this.memory = deps.memory ?? createInMemoryMemoryPort();
    this.metrics = deps.metrics ?? createInMemoryMetricsPort();
    this.handlers = deps.handlers ?? [
      defaultDeterministicHandler(),
      createAiReasoningStubHandler(),
    ];
    this.auditStore = deps.auditStore ?? createInMemoryAuditStore();
  }

  getAuditStore(): AuditStore {
    return this.auditStore;
  }

  /** Run the full coordination pipeline for one observation. */
  async run(request: OperatorRequest): Promise<OperatorResult> {
    const audit = new ExecutionAudit(request);
    const approvals = request.approvals ?? [];

    try {
      audit.log("observe", "ok", request.observation.signal.slice(0, 200), {
        actor: request.actor,
        tags: request.observation.tags ?? [],
      });

      audit.log("retrieve_context", "started");
      const context = await Promise.resolve(this.context.retrieve(request.observation));
      audit.log("retrieve_context", "ok", undefined, { count: context.length });

      let classification = classifyTask(request.observation);
      audit.log("classify", "ok", classification.rationale, {
        task_class: classification.task_class,
        touched: classification.touched_domains,
      });

      const mode = resolveMode(classification, request.force_mode);
      classification = { ...classification, mode };
      audit.log("determine_mode", "ok", mode);

      let delegate: DelegateResult;
      const handler = pickHandler(this.handlers, classification);
      if (handler && mode !== "none") {
        audit.log("delegate", "started", handler.name);
        delegate = await Promise.resolve(
          handler.run({ request, classification, context }),
        );
        audit.log("delegate", "ok", delegate.summary, { handler: delegate.handler });
        audit.log("collect", "ok", undefined, {
          proposed: delegate.proposed_actions.length,
        });
      } else {
        audit.log("delegate", "skipped", "No handler or mode=none");
        audit.log("collect", "skipped");
        delegate = { handler: "none", summary: "No delegation", proposed_actions: [] };
      }

      const confidence = evaluateConfidence({
        classification,
        delegate,
        contextCount: context.length,
      });
      audit.log("evaluate_confidence", "ok", confidence.rationale, {
        score: confidence.score,
      });

      const proposed = delegate.proposed_actions;
      const executed: ExecutedAction[] = [];
      const blocked: BlockedAction[] = [];
      const hasProtected = proposed.some((a) => a.protected_domain != null);
      const autoOk = mayAutoExecute(confidence, hasProtected);

      audit.log("determine_approval", "ok", undefined, {
        has_protected: hasProtected,
        approval_count: approvals.length,
        auto_ok: autoOk,
      });

      audit.log("execute", "started");
      for (const action of proposed) {
        const approvalGap = approvalBlockReason(action, approvals);
        if (approvalGap) {
          blocked.push({
            action_id: action.id,
            kind: action.kind,
            protected_domain: action.protected_domain,
            reason: approvalGap,
          });
          continue;
        }
        if (!action.protected_domain && !autoOk) {
          blocked.push({
            action_id: action.id,
            kind: action.kind,
            protected_domain: null,
            reason: `Confidence ${confidence.score} below auto-execute floor ${confidence.auto_execute_floor}`,
          });
          continue;
        }
        // Protected + matching approval, or non-protected + confidence OK
        executed.push(this.executeAction(action));
      }
      audit.log(
        "execute",
        blocked.length > 0 && executed.length === 0 ? "blocked" : "ok",
        undefined,
        { executed: executed.length, blocked: blocked.length },
      );

      const status = deriveStatus(executed, blocked, proposed);
      const metricsRecorded: string[] = [];
      const memoryRefs: string[] = [];

      audit.log("record_outcome", "ok", status);

      const metricName = `operator.run.${status}`;
      await Promise.resolve(
        this.metrics.record({
          name: metricName,
          value: 1,
          tags: { task_class: classification.task_class, mode },
        }),
      );
      metricsRecorded.push(metricName);
      await Promise.resolve(
        this.metrics.record({
          name: "operator.confidence",
          value: confidence.score,
          tags: { request_id: request.id },
        }),
      );
      metricsRecorded.push("operator.confidence");
      audit.log("update_metrics", "ok", undefined, { metrics: metricsRecorded });

      const memBody = JSON.stringify({
        status,
        classification,
        confidence,
        executed,
        blocked,
        summary: delegate.summary,
      });
      const memId = await Promise.resolve(
        this.memory.preserve({
          run_id: audit.record.audit_id,
          title: `Operator run ${request.id}`,
          body: memBody,
          from_agent: true,
        }),
      );
      memoryRefs.push(memId);
      audit.log("preserve_memory", "ok", memId);

      const result: OperatorResult = {
        request_id: request.id,
        status,
        classification,
        confidence,
        context_used: context,
        proposed_actions: proposed,
        executed_actions: executed,
        blocked_actions: blocked,
        metrics_recorded: metricsRecorded,
        memory_refs: memoryRefs,
        audit_id: audit.record.audit_id,
        summary: buildSummary(status, classification.task_class, executed, blocked),
      };

      audit.complete(result);
      this.auditStore.save(audit.snapshot());
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      audit.log("complete", "error", message);
      const failed: OperatorResult = {
        request_id: request.id,
        status: "failed",
        classification: {
          task_class: "unknown",
          mode: "none",
          rationale: message,
          touched_domains: [],
        },
        confidence: { score: 0, rationale: "failed", auto_execute_floor: 0.55 },
        context_used: [],
        proposed_actions: [],
        executed_actions: [],
        blocked_actions: [],
        metrics_recorded: [],
        memory_refs: [],
        audit_id: audit.record.audit_id,
        summary: `Operator failed: ${message}`,
      };
      audit.complete(failed);
      this.auditStore.save(audit.snapshot());
      return failed;
    }
  }

  private executeAction(action: ProposedAction): ExecutedAction {
    return {
      action_id: action.id,
      kind: action.kind,
      at: new Date().toISOString(),
      result_summary: `Executed ${action.kind}: ${action.summary}`,
    };
  }
}

function deriveStatus(
  executed: ExecutedAction[],
  blocked: BlockedAction[],
  proposed: ProposedAction[],
): OperatorStatus {
  const blockedProtected = blocked.filter((b) => b.protected_domain != null);
  if (blockedProtected.length > 0) {
    return executed.length === 0 ? "blocked_pending_approval" : "completed_with_proposals";
  }
  if (proposed.some((p) => p.protected_domain) && executed.length === 0) {
    return "blocked_pending_approval";
  }
  if (blocked.length > 0 && executed.length === 0) {
    return "completed_with_proposals";
  }
  return "completed";
}

function buildSummary(
  status: OperatorStatus,
  taskClass: string,
  executed: ExecutedAction[],
  blocked: BlockedAction[],
): string {
  return `${status} · ${taskClass} · executed=${executed.length} · blocked=${blocked.length}`;
}
