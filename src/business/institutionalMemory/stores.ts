/**
 * In-memory institutional store with version history + rollback.
 * Persist via serialize / hydrate.
 */

import type {
  InstitutionalMemoryStore as Snapshot,
  MemoryRecord,
  MemoryRef,
  MemoryVersion,
  MemoryWriteRequest,
  PromotionRequest,
  PromotionStage,
  StorageClass,
} from "./types";
import { PROMOTION_LADDER } from "./types";
import { validatePromotion, validateWrite } from "./validate";

export class ValidationError extends Error {
  readonly issues: { field: string; code: string; message: string }[];
  constructor(message: string, issues: { field: string; code: string; message: string }[] = []) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function cloneRefs(refs: MemoryRef[] | undefined): MemoryRef[] {
  return (refs ?? []).map((r) => ({ ...r }));
}

function stageForNewWrite(req: MemoryWriteRequest): PromotionStage | null {
  if (req.stage !== undefined) return req.stage;
  // Ops blobs may start without a ladder stage
  if (
    req.storage_class === "operational_state" ||
    req.storage_class === "metrics" ||
    req.storage_class === "agent_run_history"
  ) {
    return req.from_agent ? "observation" : null;
  }
  if (req.storage_class === "temporary_working_context") return "observation";
  return "observation";
}

function classForStage(stage: PromotionStage, current: StorageClass): StorageClass {
  switch (stage) {
    case "evidence":
      return current === "customer_evidence" ? current : "customer_evidence";
    case "hypothesis":
    case "tested_finding":
      return "experiments";
    case "approved_decision":
      return "decisions";
    case "canonical_policy":
      return "canonical";
    default:
      return current;
  }
}

export class InstitutionalMemory {
  private records = new Map<string, MemoryRecord>();

  write(req: MemoryWriteRequest): MemoryRecord {
    const result = validateWrite(req);
    if (!result.ok) {
      throw new ValidationError(result.issues.map((i) => i.message).join("; "), result.issues);
    }
    if (this.records.has(req.id)) {
      throw new ValidationError(`Record id already exists: ${req.id}`);
    }
    if (req.storage_class === "canonical") {
      throw new ValidationError(
        "Cannot write canonical directly. Promote to canonical_policy with evidence and a human approver.",
      );
    }

    const at = nowIso();
    const stage = stageForNewWrite(req);
    const version: MemoryVersion = {
      version: 1,
      body: req.body,
      stage,
      written_at: at,
      writer: req.writer,
      change_note: req.change_note?.trim() || "create",
      evidence_refs: cloneRefs(req.evidence_refs),
      source_refs: cloneRefs(req.source_refs),
    };

    const record: MemoryRecord = {
      id: req.id.trim(),
      storage_class: req.storage_class,
      title: req.title.trim(),
      body: req.body,
      stage,
      from_agent: req.from_agent,
      evidence_refs: cloneRefs(req.evidence_refs),
      source_refs: cloneRefs(req.source_refs),
      created_at: at,
      updated_at: at,
      expires_at: req.expires_at ?? null,
      versions: [version],
      active: true,
    };
    this.records.set(record.id, record);
    return structuredClone(record);
  }

  get(id: string): MemoryRecord | null {
    const r = this.records.get(id);
    return r ? structuredClone(r) : null;
  }

  listByClass(storageClass: StorageClass): MemoryRecord[] {
    return [...this.records.values()]
      .filter((r) => r.storage_class === storageClass && r.active)
      .map((r) => structuredClone(r));
  }

  listByStage(stage: PromotionStage): MemoryRecord[] {
    return [...this.records.values()]
      .filter((r) => r.stage === stage && r.active)
      .map((r) => structuredClone(r));
  }

  /** Append a version without changing stage (non-canonical only). */
  revise(
    id: string,
    body: string,
    writer: string,
    changeNote: string,
    refs?: { evidence_refs?: MemoryRef[]; source_refs?: MemoryRef[] },
  ): MemoryRecord {
    const record = this.records.get(id);
    if (!record) throw new ValidationError(`Unknown record ${id}`);
    if (!record.active) throw new ValidationError("Cannot revise inactive record");
    if (record.storage_class === "canonical") {
      throw new ValidationError(
        "Canonical records are immutable except via promote/rollback. Draft a change and promote.",
      );
    }
    const at = nowIso();
    const v: MemoryVersion = {
      version: record.versions.length + 1,
      body,
      stage: record.stage,
      written_at: at,
      writer,
      change_note: changeNote,
      evidence_refs: cloneRefs(refs?.evidence_refs ?? record.evidence_refs),
      source_refs: cloneRefs(refs?.source_refs ?? record.source_refs),
    };
    record.versions.push(v);
    record.body = body;
    record.updated_at = at;
    if (refs?.evidence_refs?.length) {
      record.evidence_refs = [...record.evidence_refs, ...cloneRefs(refs.evidence_refs)];
    }
    if (refs?.source_refs?.length) {
      record.source_refs = [...record.source_refs, ...cloneRefs(refs.source_refs)];
    }
    this.records.set(id, record);
    return structuredClone(record);
  }

  promote(req: PromotionRequest): MemoryRecord {
    const record = this.records.get(req.record_id);
    if (!record) throw new ValidationError(`Unknown record ${req.record_id}`);

    const result = validatePromotion(record, req);
    if (!result.ok) {
      throw new ValidationError(result.issues.map((i) => i.message).join("; "), result.issues);
    }

    // Extra gate: approved_decision / canonical need human-looking approver
    if (
      (req.to_stage === "approved_decision" || req.to_stage === "canonical_policy") &&
      req.approver &&
      /^(agent|ai|bot|llm|gpt|claude)/i.test(req.approver.trim())
    ) {
      throw new ValidationError(
        "Human approver required for approved_decision and canonical_policy — AI cannot approve.",
      );
    }

    const at = nowIso();
    const body = req.body ?? record.body;
    const title = req.title ?? record.title;
    const v: MemoryVersion = {
      version: record.versions.length + 1,
      body,
      stage: req.to_stage,
      written_at: at,
      writer: req.writer,
      change_note: req.change_note,
      evidence_refs: cloneRefs(req.evidence_refs),
      source_refs: cloneRefs(req.source_refs),
    };
    record.versions.push(v);
    record.body = body;
    record.title = title;
    record.stage = req.to_stage;
    record.updated_at = at;
    record.evidence_refs = [
      ...record.evidence_refs,
      ...cloneRefs(req.evidence_refs),
    ];
    record.source_refs = [...record.source_refs, ...cloneRefs(req.source_refs)];
    record.storage_class = classForStage(req.to_stage, record.storage_class);
    // Once on the human ladder past observation, strip from_agent auto-trust
    if (req.to_stage !== "observation") {
      record.from_agent = false;
    }

    this.records.set(record.id, record);
    return structuredClone(record);
  }

  /**
   * Roll back to a prior version: appends a new version restoring that body.
   * Canonical rollback requires a human writer (not agent/ai slug).
   */
  rollback(id: string, toVersion: number, writer: string, changeNote?: string): MemoryRecord {
    const record = this.records.get(id);
    if (!record) throw new ValidationError(`Unknown record ${id}`);
    const target = record.versions.find((v) => v.version === toVersion);
    if (!target) throw new ValidationError(`Version ${toVersion} not found on ${id}`);

    if (record.storage_class === "canonical") {
      if (!writer.trim() || /^(agent|ai|bot|llm|gpt|claude)/i.test(writer.trim())) {
        throw new ValidationError("Canonical rollback requires a human writer identity.");
      }
    }

    const at = nowIso();
    const v: MemoryVersion = {
      version: record.versions.length + 1,
      body: target.body,
      stage: target.stage,
      written_at: at,
      writer,
      change_note: changeNote ?? `rollback to v${toVersion}`,
      evidence_refs: cloneRefs(target.evidence_refs),
      source_refs: cloneRefs(target.source_refs),
    };
    record.versions.push(v);
    record.body = target.body;
    record.stage = target.stage;
    record.updated_at = at;
    this.records.set(id, record);
    return structuredClone(record);
  }

  deactivate(id: string, writer: string, note: string): MemoryRecord {
    const record = this.records.get(id);
    if (!record) throw new ValidationError(`Unknown record ${id}`);
    record.active = false;
    record.updated_at = nowIso();
    record.versions.push({
      version: record.versions.length + 1,
      body: record.body,
      stage: record.stage,
      written_at: record.updated_at,
      writer,
      change_note: note || "deactivate",
      evidence_refs: cloneRefs(record.evidence_refs),
      source_refs: cloneRefs(record.source_refs),
    });
    this.records.set(id, record);
    return structuredClone(record);
  }

  purgeExpired(now = new Date()): number {
    let n = 0;
    for (const [id, r] of this.records) {
      if (
        r.storage_class === "temporary_working_context" &&
        r.expires_at &&
        new Date(r.expires_at) <= now
      ) {
        this.records.delete(id);
        n++;
      }
    }
    return n;
  }

  serialize(): Snapshot {
    return {
      schema_version: "1",
      records: [...this.records.values()].map((r) => structuredClone(r)),
    };
  }

  hydrate(snap: Snapshot): void {
    this.records.clear();
    for (const r of snap.records) {
      this.records.set(r.id, structuredClone(r));
    }
  }

  clear(): void {
    this.records.clear();
  }
}

export function currentBody(record: MemoryRecord): string {
  const v = record.versions[record.versions.length - 1];
  return v?.body ?? record.body;
}

export function ladderIndex(stage: PromotionStage): number {
  return PROMOTION_LADDER.indexOf(stage);
}

/** Assert helpers used by callers / tests */
export function assertAgentMayWriteClass(storageClass: StorageClass): void {
  if (storageClass !== "agent_run_history" && storageClass !== "temporary_working_context") {
    throw new ValidationError(
      `Agents may only write agent_run_history or temporary_working_context (got ${storageClass})`,
    );
  }
}

export function isAgentWritableClass(storageClass: StorageClass): boolean {
  return storageClass === "agent_run_history" || storageClass === "temporary_working_context";
}
