/**
 * Sales CRM + AI assist (allowed actions only).
 */

import {
  AiDeniedError,
  assertAiActionAllowed,
  assertPayloadNotForbidden,
  isAiUpdatableField,
} from "./permissions";
import { metricsBySource, salesCycleDays, stageConversionMetrics } from "./metrics";
import { STAGE_ORDER, SalesOsError, validateLead } from "./validate";
import type {
  AiAssistRequest,
  AiAssistResult,
  AiUpdatableField,
  Lead,
  LeadSource,
  Objection,
  OfferShown,
  PipelineStage,
  SalesEvent,
  SalesOsSnapshot,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export type CaptureLeadInput = {
  id?: string;
  contact_name: string;
  contact_email: string;
  organization?: string;
  lead_source: LeadSource;
  expected_value?: number;
  currency?: string;
};

export class SalesOs {
  private leads = new Map<string, Lead>();
  private events: SalesEvent[] = [];
  private aiResults: AiAssistResult[] = [];
  private spendBySource: Partial<Record<LeadSource, number>> = {};

  captureLead(input: CaptureLeadInput): Lead {
    const at = nowIso();
    const lead: Lead = {
      id: input.id ?? newId("lead"),
      captured_at: at,
      contact_name: input.contact_name.trim(),
      contact_email: input.contact_email.trim().toLowerCase(),
      organization: input.organization,
      lead_source: input.lead_source,
      icp_classification: "unknown",
      qualification: "unreviewed",
      pipeline_stage: "captured",
      last_contact: null,
      next_action: "Review ICP fit",
      objections: [],
      offer_shown: null,
      conversion: { converted: false, paid_at: null, amount: null },
      lost_reason: null,
      expected_value: input.expected_value ?? 0,
      currency: input.currency ?? "USD",
      updated_at: at,
    };
    const v = validateLead(lead);
    if (!v.ok) {
      throw new SalesOsError(v.issues.map((i) => i.message).join("; "), v.issues);
    }
    this.leads.set(lead.id, lead);
    this.log(lead.id, "lead_captured", "system", `Captured from ${lead.lead_source}`);
    return structuredClone(lead);
  }

  getLead(id: string): Lead | null {
    const l = this.leads.get(id);
    return l ? structuredClone(l) : null;
  }

  listLeads(): Lead[] {
    return [...this.leads.values()].map((l) => structuredClone(l));
  }

  /** Human or system CRM field update (broader than AI). */
  updateLead(id: string, patch: Partial<Lead>, actor: string): Lead {
    const lead = this.require(id);
    const next = { ...lead, ...patch, id: lead.id, updated_at: nowIso() };
    // Preserve nested carefully
    if (patch.conversion) next.conversion = { ...lead.conversion, ...patch.conversion };
    if (patch.objections) next.objections = [...patch.objections];
    if (patch.offer_shown !== undefined) next.offer_shown = patch.offer_shown;
    const v = validateLead(next);
    if (!v.ok) {
      throw new SalesOsError(v.issues.map((i) => i.message).join("; "), v.issues);
    }
    this.leads.set(id, next);
    this.log(id, "lead_updated", actor, "CRM fields updated", patch as Record<string, unknown>);
    return structuredClone(next);
  }

  advanceStage(id: string, stage: PipelineStage, actor: string, note?: string): Lead {
    const lead = this.require(id);
    if (stage === "lost") {
      return this.markLost(id, note ?? "unspecified", actor);
    }
    const from = STAGE_ORDER[lead.pipeline_stage] ?? 0;
    const to = STAGE_ORDER[stage] ?? 0;
    if (stage !== "lost" && to < from) {
      throw new SalesOsError(`Cannot move backwards from ${lead.pipeline_stage} to ${stage}`);
    }
    const patch: Partial<Lead> = {
      pipeline_stage: stage,
      last_contact: nowIso(),
    };
    if (stage === "qualified" || to >= 1) {
      if (lead.qualification === "unreviewed" || lead.qualification === "qualifying") {
        patch.qualification = "qualified";
      }
    }
    if (stage === "paid") {
      patch.conversion = {
        converted: true,
        paid_at: nowIso(),
        amount: lead.offer_shown?.amount ?? lead.expected_value,
      };
    }
    const updated = this.updateLead(id, patch, actor);
    this.log(id, "stage_advanced", actor, note ?? `${lead.pipeline_stage} → ${stage}`);
    return updated;
  }

  recordOffer(id: string, offer: OfferShown, actor: string): Lead {
    if (offer.discount_applied && !offer.approved_discount_id) {
      throw new SalesOsError("Unapproved discounts are not allowed");
    }
    const lead = this.updateLead(
      id,
      { offer_shown: offer, pipeline_stage: "offer", last_contact: nowIso() },
      actor,
    );
    this.log(id, "offer_shown", actor, offer.name, offer as unknown as Record<string, unknown>);
    return lead;
  }

  markLost(id: string, reason: string, actor: string): Lead {
    if (!reason.trim()) throw new SalesOsError("lost_reason required");
    const lead = this.updateLead(
      id,
      {
        pipeline_stage: "lost",
        lost_reason: reason.trim(),
        qualification:
          this.require(id).qualification === "qualified"
            ? "disqualified"
            : this.require(id).qualification,
      },
      actor,
    );
    this.log(id, "lost", actor, reason);
    return lead;
  }

  setSpend(source: LeadSource, spend: number): void {
    if (spend < 0) throw new SalesOsError("spend must be ≥0");
    this.spendBySource[source] = spend;
  }

  /**
   * AI assist entrypoint — allowed actions only; forbidden actions denied.
   */
  aiAssist(req: AiAssistRequest): AiAssistResult {
    const at = nowIso();
    try {
      assertAiActionAllowed(req.action);
      assertPayloadNotForbidden(req.payload);
      const lead = this.require(req.lead_id);
      const output = this.runAiAction(lead, req);
      const result: AiAssistResult = {
        request_id: req.id,
        lead_id: req.lead_id,
        action: req.action,
        status: "ok",
        output,
        at,
      };
      this.aiResults.push(result);
      this.log(req.lead_id, `ai:${req.action}`, req.actor, "AI assist ok", output);
      return structuredClone(result);
    } catch (err) {
      const denial =
        err instanceof AiDeniedError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);
      const result: AiAssistResult = {
        request_id: req.id,
        lead_id: req.lead_id,
        action: req.action,
        status: err instanceof AiDeniedError ? "denied" : "error",
        denial_reason: denial,
        at,
      };
      this.aiResults.push(result);
      this.log(req.lead_id, `ai_denied:${req.action}`, req.actor, denial);
      if (err instanceof AiDeniedError) return structuredClone(result);
      throw err;
    }
  }

  private runAiAction(lead: Lead, req: AiAssistRequest): Record<string, unknown> {
    switch (req.action) {
      case "research_leads": {
        const notes = String(req.payload.notes ?? "").trim() || "Research stub";
        this.applyAiFields(lead.id, { research_notes: notes }, req.actor);
        return { research_notes: notes };
      }
      case "prepare_context": {
        const context = {
          lead_id: lead.id,
          icp: lead.icp_classification,
          stage: lead.pipeline_stage,
          objections: lead.objections.map((o) => o.text),
          expected_value: lead.expected_value,
          source: lead.lead_source,
        };
        return { context };
      }
      case "draft_outreach": {
        const draft = String(req.payload.draft ?? "").trim();
        if (!draft) throw new SalesOsError("draft_outreach requires payload.draft");
        assertPayloadNotForbidden({ draft });
        return { draft, disclaimer: "Draft only — human must send; no contractual language" };
      }
      case "identify_objections": {
        const text = String(req.payload.objection ?? "").trim();
        if (!text) throw new SalesOsError("identify_objections requires payload.objection");
        const objection: Objection = {
          id: newId("obj"),
          text,
          identified_by: "ai",
          at: nowIso(),
        };
        const objections = [...lead.objections, objection];
        this.applyAiFields(lead.id, { objections }, req.actor);
        return { objection };
      }
      case "recommend_follow_up": {
        const next = String(req.payload.next_action ?? "").trim();
        if (!next) throw new SalesOsError("recommend_follow_up requires payload.next_action");
        this.applyAiFields(
          lead.id,
          { next_action: next, recommended_follow_up: next },
          req.actor,
        );
        return { next_action: next };
      }
      case "summarize_conversations": {
        const summary = String(req.payload.summary ?? "").trim();
        if (!summary) throw new SalesOsError("summarize_conversations requires payload.summary");
        assertPayloadNotForbidden({ summary });
        this.applyAiFields(
          lead.id,
          { last_contact_summary: summary, last_contact: nowIso() },
          req.actor,
        );
        return { summary };
      }
      case "update_structured_crm_fields": {
        const fields = (req.payload.fields ?? {}) as Record<string, unknown>;
        const allowed: Partial<Record<AiUpdatableField, unknown>> = {};
        for (const [k, v] of Object.entries(fields)) {
          if (!isAiUpdatableField(k)) {
            throw new AiDeniedError(
              "update_structured_crm_fields",
              `AI cannot update field “${k}” — not in structured CRM allowlist`,
            );
          }
          allowed[k] = v;
        }
        assertPayloadNotForbidden(allowed as Record<string, unknown>);
        this.applyAiFields(lead.id, allowed, req.actor);
        return { updated: Object.keys(allowed) };
      }
      default:
        throw new AiDeniedError(String(req.action), "Action not implemented");
    }
  }

  private applyAiFields(
    id: string,
    fields: Partial<Lead> | Partial<Record<AiUpdatableField, unknown>>,
    actor: string,
  ): void {
    const lead = this.require(id);
    const patch: Partial<Lead> = { updated_at: nowIso() };
    for (const [k, v] of Object.entries(fields)) {
      if (k === "objections" && Array.isArray(v)) {
        patch.objections = v as Objection[];
      } else if (k === "icp_classification" && typeof v === "string") {
        patch.icp_classification = v as Lead["icp_classification"];
      } else if (k === "qualification" && typeof v === "string") {
        patch.qualification = v as Lead["qualification"];
      } else if (k === "next_action" && typeof v === "string") {
        patch.next_action = v;
      } else if (k === "last_contact_summary" && typeof v === "string") {
        patch.last_contact_summary = v;
      } else if (k === "research_notes" && typeof v === "string") {
        patch.research_notes = v;
      } else if (k === "recommended_follow_up" && typeof v === "string") {
        patch.recommended_follow_up = v;
      } else if (k === "last_contact" && typeof v === "string") {
        patch.last_contact = v;
      }
    }
    // AI must not set pricing/offer/conversion via this path
    const next = { ...lead, ...patch };
    const v = validateLead(next);
    if (!v.ok) throw new SalesOsError(v.issues.map((i) => i.message).join("; "), v.issues);
    this.leads.set(id, next);
    this.log(id, "ai_crm_update", actor, "structured fields", patch as Record<string, unknown>);
  }

  measurement() {
    const leads = this.listLeads();
    return {
      stage_conversions: stageConversionMetrics(leads),
      by_source: metricsBySource(leads, this.spendBySource),
      sales_cycles_days: leads
        .map((l) => ({ lead_id: l.id, days: salesCycleDays(l) }))
        .filter((x) => x.days != null),
    };
  }

  listEvents(): SalesEvent[] {
    return this.events.map((e) => structuredClone(e));
  }

  listAiResults(): AiAssistResult[] {
    return this.aiResults.map((r) => structuredClone(r));
  }

  serialize(): SalesOsSnapshot {
    return {
      schema_version: "1",
      policy: "ai_assist_no_autonomous_commitments",
      leads: this.listLeads(),
      events: this.listEvents(),
      ai_results: this.listAiResults(),
      spend_by_source: { ...this.spendBySource },
      updated_at: nowIso(),
    };
  }

  hydrate(snap: SalesOsSnapshot): void {
    this.leads.clear();
    for (const l of snap.leads) this.leads.set(l.id, structuredClone(l));
    this.events = snap.events.map((e) => structuredClone(e));
    this.aiResults = snap.ai_results.map((r) => structuredClone(r));
    this.spendBySource = { ...snap.spend_by_source };
  }

  private require(id: string): Lead {
    const l = this.leads.get(id);
    if (!l) throw new SalesOsError(`Unknown lead ${id}`);
    return l;
  }

  private log(
    leadId: string,
    kind: string,
    actor: string,
    detail: string,
    data?: Record<string, unknown>,
  ): void {
    this.events.push({
      id: newId("evt"),
      lead_id: leadId,
      kind,
      at: nowIso(),
      actor,
      detail,
      data,
    });
  }
}
