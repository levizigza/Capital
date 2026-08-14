/**
 * Validation for institutional memory writes & promotions.
 */

import {
  AGENT_WRITABLE_CLASSES,
  PROMOTION_LADDER,
  STORAGE_CLASSES,
  type MemoryRecord,
  type MemoryRef,
  type MemoryValidationIssue,
  type MemoryWriteRequest,
  type PromotionRequest,
  type PromotionStage,
  type StorageClass,
} from "./types";

function issue(field: string, code: string, message: string): MemoryValidationIssue {
  return { field, code, message };
}

export function isStorageClass(v: unknown): v is StorageClass {
  return typeof v === "string" && (STORAGE_CLASSES as string[]).includes(v);
}

export function isPromotionStage(v: unknown): v is PromotionStage {
  return typeof v === "string" && (PROMOTION_LADDER as string[]).includes(v);
}

export function nextStage(current: PromotionStage | null): PromotionStage | null {
  if (current == null) return "observation";
  const i = PROMOTION_LADDER.indexOf(current);
  if (i < 0 || i >= PROMOTION_LADDER.length - 1) return null;
  return PROMOTION_LADDER[i + 1]!;
}

export function refsOk(refs: MemoryRef[] | undefined, min = 0): boolean {
  if (!refs) return min === 0;
  if (refs.length < min) return false;
  return refs.every((r) => typeof r.ref === "string" && r.ref.trim().length >= 2);
}

/**
 * Agents may only write agent_run_history or temporary_working_context.
 * Never canonical (or other truth classes) directly.
 */
export function validateWrite(
  req: MemoryWriteRequest,
): { ok: true } | { ok: false; issues: MemoryValidationIssue[] } {
  const issues: MemoryValidationIssue[] = [];

  if (!req.id || req.id.trim().length < 3) {
    issues.push(issue("id", "required", "id required (slug, ≥3 chars)"));
  }
  if (!isStorageClass(req.storage_class)) {
    issues.push(issue("storage_class", "enum", `Must be one of ${STORAGE_CLASSES.join(", ")}`));
  }
  if (!req.title?.trim()) issues.push(issue("title", "required", "title required"));
  if (!req.body?.trim()) issues.push(issue("body", "required", "body required"));
  if (!req.writer?.trim()) issues.push(issue("writer", "required", "writer required"));

  if (req.from_agent) {
    if (!AGENT_WRITABLE_CLASSES.includes(req.storage_class)) {
      issues.push(
        issue(
          "storage_class",
          "agent_forbidden",
          "Generated AI/agent output cannot write to this class — use agent_run_history or temporary_working_context, then promote with evidence",
        ),
      );
    }
    if (req.storage_class === "canonical") {
      issues.push(
        issue(
          "storage_class",
          "no_auto_canonical",
          "Never allow generated AI output to automatically become canonical truth",
        ),
      );
    }
  }

  if (req.storage_class === "canonical" && req.from_agent) {
    issues.push(
      issue("from_agent", "no_auto_canonical", "Canonical writes cannot be from_agent=true"),
    );
  }

  if (req.storage_class === "temporary_working_context" && !req.expires_at) {
    issues.push(
      issue(
        "expires_at",
        "required",
        "temporary_working_context requires expires_at (TTL)",
      ),
    );
  }

  if (req.evidence_refs && !refsOk(req.evidence_refs)) {
    issues.push(issue("evidence_refs", "invalid", "evidence_refs entries need non-empty ref"));
  }
  if (req.source_refs && !refsOk(req.source_refs)) {
    issues.push(issue("source_refs", "invalid", "source_refs entries need non-empty ref"));
  }

  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

/**
 * Promotion must advance exactly one ladder step and carry evidence/source refs.
 */
export function validatePromotion(
  record: MemoryRecord,
  req: PromotionRequest,
): { ok: true } | { ok: false; issues: MemoryValidationIssue[] } {
  const issues: MemoryValidationIssue[] = [];

  if (!record.active) {
    issues.push(issue("record", "inactive", "Cannot promote inactive record"));
  }

  if (record.from_agent && record.storage_class === "agent_run_history") {
    // Allowed to start ladder only at observation with human writer
    if (req.to_stage !== "observation" && record.stage == null) {
      issues.push(
        issue(
          "to_stage",
          "agent_start",
          "Agent-sourced records must enter the ladder at observation first",
        ),
      );
    }
  }

  const expected = nextStage(record.stage);
  if (expected == null) {
    issues.push(
      issue("to_stage", "terminal", "Record is already at canonical_policy (or invalid stage)"),
    );
  } else if (req.to_stage !== expected) {
    issues.push(
      issue(
        "to_stage",
        "skip_forbidden",
        `Must promote to next stage “${expected}” (got “${req.to_stage}”) — no skipping`,
      ),
    );
  }

  // Evidence required from evidence stage onward
  const needsEvidence: PromotionStage[] = [
    "evidence",
    "tested_finding",
    "approved_decision",
    "canonical_policy",
  ];
  if (needsEvidence.includes(req.to_stage) && !refsOk(req.evidence_refs, 1)) {
    issues.push(
      issue(
        "evidence_refs",
        "required",
        `Promotion to ${req.to_stage} requires ≥1 evidence_refs`,
      ),
    );
  }

  const needsSource: PromotionStage[] = [
    "hypothesis",
    "tested_finding",
    "approved_decision",
    "canonical_policy",
  ];
  if (needsSource.includes(req.to_stage) && !refsOk(req.source_refs, 1)) {
    issues.push(
      issue("source_refs", "required", `Promotion to ${req.to_stage} requires ≥1 source_refs`),
    );
  }

  if (
    (req.to_stage === "approved_decision" || req.to_stage === "canonical_policy") &&
    !req.approver?.trim()
  ) {
    issues.push(
      issue(
        "approver",
        "required",
        "Human approver id required for approved_decision and canonical_policy",
      ),
    );
  }

  // Approver must not be an obvious agent slug when promoting to canonical
  if (
    req.to_stage === "canonical_policy" &&
    req.approver &&
    /^(agent|ai|bot|llm|gpt|claude)/i.test(req.approver.trim())
  ) {
    issues.push(
      issue(
        "approver",
        "human_required",
        "approver must be a human id — AI cannot approve canonical policy",
      ),
    );
  }

  if (!req.change_note?.trim() || req.change_note.trim().length < 8) {
    issues.push(issue("change_note", "required", "change_note required (≥8 chars)"));
  }

  if (!req.writer?.trim()) {
    issues.push(issue("writer", "required", "writer required"));
  }

  if (issues.length) return { ok: false, issues };
  return { ok: true };
}
