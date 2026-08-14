/**
 * Lead / CRM validation.
 */

import type { Lead, ValidationIssue } from "./types";
import {
  ICP_CLASSES,
  LEAD_SOURCES,
  PIPELINE_STAGES,
  QUALIFICATION_STATES,
} from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

export function validateLead(
  lead: Lead,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!lead.id?.trim() || lead.id.trim().length < 3) {
    issues.push(issue("id", "required", "id required"));
  }
  if (!lead.captured_at?.trim()) {
    issues.push(issue("captured_at", "required", "captured_at required"));
  }
  if (!lead.contact_name?.trim()) {
    issues.push(issue("contact_name", "required", "contact_name required"));
  }
  if (!lead.contact_email?.trim() || !lead.contact_email.includes("@")) {
    issues.push(issue("contact_email", "invalid", "contact_email required"));
  }
  if (!(LEAD_SOURCES as readonly string[]).includes(lead.lead_source)) {
    issues.push(issue("lead_source", "enum", "invalid lead_source"));
  }
  if (!(ICP_CLASSES as readonly string[]).includes(lead.icp_classification)) {
    issues.push(issue("icp_classification", "enum", "invalid icp_classification"));
  }
  if (!(QUALIFICATION_STATES as readonly string[]).includes(lead.qualification)) {
    issues.push(issue("qualification", "enum", "invalid qualification"));
  }
  if (!(PIPELINE_STAGES as readonly string[]).includes(lead.pipeline_stage)) {
    issues.push(issue("pipeline_stage", "enum", "invalid pipeline_stage"));
  }
  if (typeof lead.expected_value !== "number" || lead.expected_value < 0) {
    issues.push(issue("expected_value", "invalid", "expected_value must be ≥0"));
  }
  if (lead.pipeline_stage === "lost" && !lead.lost_reason?.trim()) {
    issues.push(issue("lost_reason", "required", "lost_reason required when lost"));
  }
  if (lead.pipeline_stage === "paid" && !lead.conversion.converted) {
    issues.push(issue("conversion", "invalid", "paid stage requires conversion.converted"));
  }
  if (lead.offer_shown?.discount_applied && !lead.offer_shown.approved_discount_id) {
    issues.push(
      issue(
        "offer_shown",
        "unapproved_discount",
        "discount_applied requires approved_discount_id",
      ),
    );
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class SalesOsError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "SalesOsError";
    this.issues = issues;
  }
}

/** Allowed forward transitions (lost allowed from any open stage). */
export const STAGE_ORDER: Record<string, number> = {
  captured: 0,
  qualified: 1,
  meeting_demo: 2,
  offer: 3,
  paid: 4,
  lost: 99,
};
