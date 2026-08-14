/**
 * Validation — insights need evidence; assets need originating insights.
 */

import type {
  ContentAsset,
  ProductInsight,
  ValidationIssue,
} from "./types";
import { ASSET_KINDS, INSIGHT_KINDS } from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

function nonEmpty(s: unknown, min = 1): boolean {
  return typeof s === "string" && s.trim().length >= min;
}

export function validateInsight(
  insight: ProductInsight,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!nonEmpty(insight.id, 3)) issues.push(issue("id", "required", "id required"));
  if (!(INSIGHT_KINDS as readonly string[]).includes(insight.kind)) {
    issues.push(issue("kind", "enum", `kind must be one of ${INSIGHT_KINDS.join(", ")}`));
  }
  if (!nonEmpty(insight.title, 4)) issues.push(issue("title", "required", "title required"));
  if (!nonEmpty(insight.summary, 12)) {
    issues.push(issue("summary", "required", "summary must be concrete (≥12 chars)"));
  }
  if (!Array.isArray(insight.evidence_refs) || insight.evidence_refs.length < 1) {
    issues.push(
      issue("evidence_refs", "required", "≥1 evidence_refs — no unsourced insights"),
    );
  } else {
    for (const [i, r] of insight.evidence_refs.entries()) {
      if (!nonEmpty(r, 2)) {
        issues.push(issue(`evidence_refs[${i}]`, "invalid", "evidence ref required"));
      }
    }
  }
  // Reject obvious generic filler posing as insight
  if (/^\s*(synergy|leverage|disrupt|general tips?)\b/i.test(insight.summary)) {
    issues.push(
      issue("summary", "generic_forbidden", "Generic marketing filler is not a product insight"),
    );
  }
  if (insight.kind === "anonymized_behavior_pattern") {
    if (/\b(name|email|phone|ssn|@)\b/i.test(insight.summary + (insight.anonymized_detail ?? ""))) {
      issues.push(
        issue("anonymized_detail", "pii_risk", "Behavior patterns must stay anonymized (no PII cues)"),
      );
    }
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export function validateAsset(
  asset: ContentAsset,
  knownInsightIds?: Set<string>,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!nonEmpty(asset.id, 3)) issues.push(issue("id", "required", "id required"));
  if (!(ASSET_KINDS as readonly string[]).includes(asset.kind)) {
    issues.push(issue("kind", "enum", `kind must be one of ${ASSET_KINDS.join(", ")}`));
  }
  if (!nonEmpty(asset.title, 4)) issues.push(issue("title", "required", "title required"));
  if (!nonEmpty(asset.concept, 12)) issues.push(issue("concept", "required", "concept required"));
  if (!nonEmpty(asset.hook, 4)) issues.push(issue("hook", "required", "hook required"));
  if (!Array.isArray(asset.originating_insight_ids) || asset.originating_insight_ids.length < 1) {
    issues.push(
      issue(
        "originating_insight_ids",
        "required",
        "Every asset must reference ≥1 originating product/customer insight",
      ),
    );
  } else if (knownInsightIds) {
    for (const id of asset.originating_insight_ids) {
      if (!knownInsightIds.has(id)) {
        issues.push(
          issue("originating_insight_ids", "unknown_insight", `Unknown insight id: ${id}`),
        );
      }
    }
  }
  if (!nonEmpty(asset.insight_lineage, 8)) {
    issues.push(
      issue("insight_lineage", "required", "insight_lineage required (explain the learning)"),
    );
  }
  if (!nonEmpty(asset.acquisition_source, 2)) {
    issues.push(issue("acquisition_source", "required", "acquisition_source required"));
  }
  if (!nonEmpty(asset.generated_by, 2)) {
    issues.push(issue("generated_by", "required", "generated_by required"));
  }
  // Ban orphan generic concepts
  if (/generic ai content|random tips|filler post/i.test(asset.concept)) {
    issues.push(
      issue("concept", "generic_forbidden", "Generic AI content without product learning is forbidden"),
    );
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class ProductContentError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "ProductContentError";
    this.issues = issues;
  }
}
