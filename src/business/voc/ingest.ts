/**
 * VoC ingest + annotation validation.
 * Refuses invented severity/sentiment; requires quote⊆evidence when text present.
 */

import type {
  VocAnnotation,
  VocEvidence,
  VocExtractKind,
  VocSourceType,
  VocStore,
  VocValidationIssue,
} from "./types";

const SOURCE_TYPES: VocSourceType[] = [
  "interview",
  "support",
  "review",
  "survey",
  "sales_objection",
  "feature_request",
  "cancellation",
  "forum",
];

const KINDS: VocExtractKind[] = [
  "pain_point",
  "desired_outcome",
  "objection",
  "alternative_used",
  "switching_trigger",
  "delight",
  "retention_driver",
  "churn_driver",
  "customer_language",
  "feature_request",
  "pricing_signal",
  "retention_signal",
];

function issue(field: string, code: string, message: string): VocValidationIssue {
  return { field, code, message };
}

export function createEmptyVocStore(): VocStore {
  return { schema_version: "1", evidence: [], annotations: [] };
}

export function validateEvidence(
  e: Partial<VocEvidence>,
): { ok: true; evidence: VocEvidence } | { ok: false; issues: VocValidationIssue[] } {
  const issues: VocValidationIssue[] = [];
  if (!e.id || e.id.trim().length < 3) {
    issues.push(issue("id", "required", "evidence id required"));
  }
  if (!e.source_type || !SOURCE_TYPES.includes(e.source_type)) {
    issues.push(issue("source_type", "enum", `source_type must be one of ${SOURCE_TYPES.join(", ")}`));
  }
  if (!e.evidence_uri || e.evidence_uri.trim().length < 3) {
    issues.push(
      issue("evidence_uri", "required", "evidence_uri required — preserve link to original source"),
    );
  }
  if (!e.captured_at || !/^\d{4}-\d{2}-\d{2}/.test(e.captured_at)) {
    issues.push(issue("captured_at", "format", "captured_at must be ISO date (YYYY-MM-DD…)"));
  }
  if (issues.length) return { ok: false, issues };

  return {
    ok: true,
    evidence: {
      id: e.id!.trim(),
      source_type: e.source_type!,
      evidence_uri: e.evidence_uri!.trim(),
      captured_at: e.captured_at!,
      raw_text: e.raw_text?.trim() ? e.raw_text.trim() : null,
      customer_segment: e.customer_segment?.trim() || null,
      ingest_notes: e.ingest_notes?.trim() || null,
    },
  };
}

/**
 * Annotate only with verbatim quotes. Does not invent sentiment.
 * If raw_text exists, quote must be a substring (case-sensitive after normalize whitespace option).
 */
export function validateAnnotation(
  a: Partial<VocAnnotation>,
  evidence: VocEvidence | undefined,
): { ok: true; annotation: VocAnnotation } | { ok: false; issues: VocValidationIssue[] } {
  const issues: VocValidationIssue[] = [];
  if (!a.id || a.id.trim().length < 3) issues.push(issue("id", "required", "annotation id required"));
  if (!a.evidence_id) issues.push(issue("evidence_id", "required", "evidence_id required"));
  if (!evidence) {
    issues.push(issue("evidence_id", "missing_evidence", "annotation must reference ingested evidence"));
  }
  if (!a.kind || !KINDS.includes(a.kind)) {
    issues.push(issue("kind", "enum", `kind must be one of ${KINDS.join(", ")}`));
  }
  if (!a.label || a.label.trim().length < 2) {
    issues.push(issue("label", "required", "label required for aggregation (human-assigned)"));
  }
  if (!a.quote || a.quote.trim().length < 3) {
    issues.push(issue("quote", "required", "verbatim quote required — do not invent customer language"));
  }

  if (a.severity != null) {
    if (![1, 2, 3, 4, 5].includes(a.severity as number)) {
      issues.push(issue("severity", "range", "severity must be 1–5 or null"));
    }
    if (a.severity_source !== "human") {
      issues.push(
        issue(
          "severity_source",
          "human_only",
          "severity only allowed when severity_source is human — never invent severity",
        ),
      );
    }
  } else if (a.severity_source != null && a.severity_source !== "human") {
    issues.push(issue("severity_source", "invalid", "severity_source must be human or null"));
  }

  if (evidence?.raw_text && a.quote) {
    const hay = evidence.raw_text;
    const needle = a.quote.trim();
    if (!hay.includes(needle)) {
      issues.push(
        issue(
          "quote",
          "not_in_evidence",
          "quote must appear verbatim in evidence.raw_text when raw_text is stored",
        ),
      );
    }
  }

  if (issues.length) return { ok: false, issues };

  return {
    ok: true,
    annotation: {
      id: a.id!.trim(),
      evidence_id: a.evidence_id!.trim(),
      kind: a.kind!,
      label: a.label!.trim(),
      quote: a.quote!.trim(),
      severity: a.severity ?? null,
      severity_source: a.severity != null ? "human" : null,
      created_at: a.created_at ?? new Date().toISOString(),
    },
  };
}

export function ingestEvidence(
  store: VocStore,
  partial: Partial<VocEvidence>,
): { store: VocStore; evidence: VocEvidence } | { store: VocStore; issues: VocValidationIssue[] } {
  const v = validateEvidence(partial);
  if (!v.ok) return { store, issues: v.issues };
  if (store.evidence.some((e) => e.id === v.evidence.id)) {
    return {
      store,
      issues: [issue("id", "duplicate", `evidence id already exists: ${v.evidence.id}`)],
    };
  }
  return {
    store: { ...store, evidence: [...store.evidence, v.evidence] },
    evidence: v.evidence,
  };
}

export function addAnnotation(
  store: VocStore,
  partial: Partial<VocAnnotation>,
): { store: VocStore; annotation: VocAnnotation } | { store: VocStore; issues: VocValidationIssue[] } {
  const evidence = store.evidence.find((e) => e.id === partial.evidence_id);
  const v = validateAnnotation(partial, evidence);
  if (!v.ok) return { store, issues: v.issues };
  if (store.annotations.some((a) => a.id === v.annotation.id)) {
    return {
      store,
      issues: [issue("id", "duplicate", `annotation id already exists: ${v.annotation.id}`)],
    };
  }
  return {
    store: { ...store, annotations: [...store.annotations, v.annotation] },
    annotation: v.annotation,
  };
}

export function serializeVocStore(store: VocStore): string {
  return JSON.stringify(store, null, 2);
}

export function parseVocStore(raw: string): VocStore | null {
  try {
    const p = JSON.parse(raw) as VocStore;
    if (p?.schema_version !== "1" || !Array.isArray(p.evidence) || !Array.isArray(p.annotations)) {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}
