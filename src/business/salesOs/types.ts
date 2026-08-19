/**
 * Lightweight Capital Sales OS — types.
 */

export const LEAD_SOURCES = [
  "organic",
  "content",
  "referral",
  "paid_social",
  "paid_search",
  "partner",
  "outbound",
  "event",
  "unknown",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const ICP_CLASSES = [
  "ideal",
  "adjacent",
  "poor_fit",
  "unknown",
] as const;

export type IcpClass = (typeof ICP_CLASSES)[number];

export const QUALIFICATION_STATES = [
  "unreviewed",
  "qualifying",
  "qualified",
  "disqualified",
] as const;

export type QualificationState = (typeof QUALIFICATION_STATES)[number];

export const PIPELINE_STAGES = [
  "captured",
  "qualified",
  "meeting_demo",
  "offer",
  "paid",
  "lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type Objection = {
  id: string;
  text: string;
  identified_by: "human" | "ai";
  at: string;
  resolved?: boolean;
};

export type OfferShown = {
  offer_id: string;
  /** Catalog / approved offer name — not free-form discount */
  name: string;
  amount: number;
  currency: string;
  shown_at: string;
  /** Must be false unless human-approved discount path */
  discount_applied: boolean;
  approved_discount_id?: string | null;
};

export type ConversionRecord = {
  converted: boolean;
  paid_at: string | null;
  amount: number | null;
};

/** Structured CRM fields AI is allowed to update. */
export const AI_UPDATABLE_FIELDS = [
  "icp_classification",
  "qualification",
  "next_action",
  "objections",
  "last_contact_summary",
  "research_notes",
  "recommended_follow_up",
] as const;

export type AiUpdatableField = (typeof AI_UPDATABLE_FIELDS)[number];

export type Lead = {
  id: string;
  /** lead capture */
  captured_at: string;
  contact_name: string;
  contact_email: string;
  organization?: string;
  lead_source: LeadSource;
  icp_classification: IcpClass;
  qualification: QualificationState;
  pipeline_stage: PipelineStage;
  last_contact: string | null;
  next_action: string | null;
  objections: Objection[];
  offer_shown: OfferShown | null;
  conversion: ConversionRecord;
  lost_reason: string | null;
  expected_value: number;
  currency: string;
  research_notes?: string;
  last_contact_summary?: string;
  recommended_follow_up?: string;
  /** Retention signal post-paid; null unknown */
  retention_rate?: number | null;
  updated_at: string;
};

export type AiAssistAction =
  | "research_leads"
  | "prepare_context"
  | "draft_outreach"
  | "identify_objections"
  | "recommend_follow_up"
  | "summarize_conversations"
  | "update_structured_crm_fields";

export const AI_ALLOWED_ACTIONS: AiAssistAction[] = [
  "research_leads",
  "prepare_context",
  "draft_outreach",
  "identify_objections",
  "recommend_follow_up",
  "summarize_conversations",
  "update_structured_crm_fields",
];

export type AiForbiddenAction =
  | "make_contractual_commitments"
  | "change_official_pricing"
  | "offer_unapproved_discounts"
  | "make_financial_guarantees"
  | "misrepresent_product_capabilities";

export const AI_FORBIDDEN_ACTIONS: AiForbiddenAction[] = [
  "make_contractual_commitments",
  "change_official_pricing",
  "offer_unapproved_discounts",
  "make_financial_guarantees",
  "misrepresent_product_capabilities",
];

export type AiAssistRequest = {
  id: string;
  lead_id: string;
  action: AiAssistAction | AiForbiddenAction;
  actor: string; // usually agent id
  payload: Record<string, unknown>;
  at: string;
};

export type AiAssistResult = {
  request_id: string;
  lead_id: string;
  action: string;
  status: "ok" | "denied" | "error";
  output?: Record<string, unknown>;
  denial_reason?: string;
  at: string;
};

export type SalesEvent = {
  id: string;
  lead_id: string;
  kind: string;
  at: string;
  actor: string;
  detail: string;
  data?: Record<string, unknown>;
};

export type StageConversionMetrics = {
  lead_to_qualified: number;
  qualified_to_meeting: number;
  meeting_to_offer: number;
  offer_to_paid: number;
  counts: {
    captured: number;
    qualified: number;
    meeting_demo: number;
    offer: number;
    paid: number;
    lost: number;
  };
};

export type SourceMetrics = {
  lead_source: LeadSource;
  leads: number;
  paid: number;
  revenue: number;
  spend: number;
  cac: number | null;
  avg_sales_cycle_days: number | null;
  retention_rate: number | null;
};

export type SalesOsSnapshot = {
  schema_version: "1";
  policy: "ai_assist_no_autonomous_commitments";
  leads: Lead[];
  events: SalesEvent[];
  ai_results: AiAssistResult[];
  /** Optional acquisition spend by source for CAC */
  spend_by_source: Partial<Record<LeadSource, number>>;
  updated_at: string;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
