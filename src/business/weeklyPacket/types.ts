/**
 * Weekly Executive Packet — types.
 */

export const PACKET_SECTIONS = [
  "WHAT_HAPPENED",
  "CUSTOMER_TRUTH",
  "PRODUCT_TRUTH",
  "DEMAND",
  "REVENUE",
  "CONTRIBUTION_PROFIT",
  "CASH",
  "RETENTION",
  "SALES_PIPELINE",
  "EXPERIMENT_RESULTS",
  "AGENT_PERFORMANCE",
  "FAILURES",
  "RISKS",
  "OPPORTUNITIES",
  "DECISIONS_REQUIRED_FROM_FOUNDER",
  "AUTOMATIC_ACTIONS_PLANNED_FOR_NEXT_WEEK",
] as const;

export type PacketSectionId = (typeof PACKET_SECTIONS)[number];

export type PacketBullet = {
  text: string;
  /** Source system / URI — optional but preferred */
  evidence_ref?: string;
};

export type MetricLine = {
  label: string;
  /** null = UNKNOWN */
  value: number | string | null;
  unit?: string;
  note?: string;
};

export type PacketSection = {
  id: PacketSectionId;
  title: string;
  summary: string;
  bullets: PacketBullet[];
  metrics: MetricLine[];
  /** True if section lacks enough data */
  incomplete: boolean;
};

/**
 * Required fields for every founder-judgment recommendation.
 */
export type FounderDecisionRequest = {
  id: string;
  title: string;
  recommendation: string;
  evidence: string[];
  expected_upside: string;
  /** Dollar or narrative cost; numeric when known */
  cost: number | null;
  cost_note: string;
  /** 0..1 */
  confidence: number;
  reversibility: string;
  worst_case: string;
  alternative: string;
  /** Optional risk tier hint */
  urgency?: "low" | "medium" | "high" | "critical";
};

export type AutomaticAction = {
  id: string;
  action: string;
  owner: string;
  scheduled_for: string;
  /** Must not require founder judgment mid-flight */
  requires_founder: false;
  evidence_ref?: string;
};

/** Typed weekly inputs from operational systems (all optional / nullable). */
export type WeeklyPacketInputs = {
  week_id: string;
  week_start: string;
  week_end: string;
  generated_for: string;

  what_happened?: string[];
  customer_truth?: {
    themes?: string[];
    verbatim_samples?: string[];
    evidence_refs?: string[];
    open_severity?: string | null;
  };
  product_truth?: {
    shipped?: string[];
    frictions?: string[];
    signature_loop_health?: string | null;
    evidence_refs?: string[];
  };
  demand?: {
    traffic?: number | null;
    signups?: number | null;
    activation?: number | null;
    note?: string;
  };
  revenue?: {
    gross?: number | null;
    net?: number | null;
    currency?: string;
    note?: string;
  };
  contribution_profit?: {
    value?: number | null;
    currency?: string;
    note?: string;
  };
  cash?: {
    balance?: number | null;
    runway_months?: number | null;
    currency?: string;
    note?: string;
  };
  retention?: {
    day_7?: number | null;
    day_30?: number | null;
    paid?: number | null;
    anomalies?: string[];
  };
  sales_pipeline?: {
    leads?: number | null;
    qualified?: number | null;
    meetings?: number | null;
    offers?: number | null;
    paid?: number | null;
    note?: string;
  };
  experiments?: {
    completed?: { id: string; result: string; evidence_ref?: string }[];
    in_flight?: string[];
  };
  agent_performance?: {
    workers?: {
      id: string;
      completion_rate?: number | null;
      cost_per_task?: number | null;
      escalations?: number | null;
    }[];
    note?: string;
  };
  failures?: string[];
  risks?: string[];
  opportunities?: string[];
  founder_decisions?: FounderDecisionRequest[];
  automatic_actions?: AutomaticAction[];
};

export type WeeklyExecutivePacket = {
  schema_version: "1";
  purpose: "founder_company_health_without_touring_every_system";
  week_id: string;
  week_start: string;
  week_end: string;
  generated_at: string;
  generated_for: string;
  sections: PacketSection[];
  founder_decisions: FounderDecisionRequest[];
  automatic_actions: AutomaticAction[];
  /** Sections that were UNKNOWN / incomplete */
  incomplete_sections: PacketSectionId[];
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
