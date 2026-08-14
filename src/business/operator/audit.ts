/**
 * Append-only auditable execution state.
 */

import type {
  ExecutionRecord,
  OperatorPhase,
  OperatorRequest,
  OperatorResult,
  PhaseLog,
  PhaseStatus,
} from "./types";

function newAuditId(): string {
  return `audit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class ExecutionAudit {
  readonly record: ExecutionRecord;

  constructor(request: OperatorRequest, auditId?: string) {
    const at = nowIso();
    this.record = {
      schema_version: "1",
      audit_id: auditId ?? newAuditId(),
      request: structuredClone(request),
      phases: [],
      result: null,
      created_at: at,
      updated_at: at,
    };
  }

  log(
    phase: OperatorPhase,
    status: PhaseStatus,
    detail?: string,
    data?: Record<string, unknown>,
  ): PhaseLog {
    const entry: PhaseLog = {
      phase,
      status,
      at: nowIso(),
      detail,
      data,
    };
    this.record.phases.push(entry);
    this.record.updated_at = entry.at;
    return entry;
  }

  complete(result: OperatorResult): void {
    this.record.result = structuredClone(result);
    this.record.updated_at = nowIso();
    this.log("complete", result.status === "failed" ? "error" : "ok", result.summary);
  }

  snapshot(): ExecutionRecord {
    return structuredClone(this.record);
  }
}

export type AuditStore = {
  save: (record: ExecutionRecord) => void;
  get: (auditId: string) => ExecutionRecord | null;
  list: () => ExecutionRecord[];
};

export function createInMemoryAuditStore(): AuditStore {
  const map = new Map<string, ExecutionRecord>();
  return {
    save(record) {
      map.set(record.audit_id, structuredClone(record));
    },
    get(auditId) {
      const r = map.get(auditId);
      return r ? structuredClone(r) : null;
    },
    list() {
      return [...map.values()].map((r) => structuredClone(r));
    },
  };
}
