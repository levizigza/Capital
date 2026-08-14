/**
 * Business Stress-Test Engine — types.
 */

export const STRESS_SCENARIOS = [
  "BASELINE",
  "DEMAND_DOWN_20",
  "DEMAND_DOWN_40",
  "DEMAND_DOWN_60",
] as const;

export type StressScenarioId = (typeof STRESS_SCENARIOS)[number];

export const DEMAND_MULTIPLIER: Record<StressScenarioId, number> = {
  BASELINE: 1,
  DEMAND_DOWN_20: 0.8,
  DEMAND_DOWN_40: 0.6,
  DEMAND_DOWN_60: 0.4,
};

/**
 * Monthly baseline economics. Use null for UNKNOWN — do not invent.
 */
export type StressBaselineInputs = {
  /** Gross revenue before refunds */
  gross_revenue: number | null;
  refunds: number | null;
  /** COGS-like delivery excluding AI/API & marketing */
  other_variable_delivery: number | null;
  payment_fees: number | null;
  ai_api_expense: number | null;
  hosting_expense: number | null;
  marketing_spend: number | null;
  fixed_costs: number | null;
  /** Cash on hand */
  cash: number | null;
  /** Paying customers (for CAC/retention context) */
  customers: number | null;
  /** New customers acquired in period */
  new_customers: number | null;
  /** Blended retention rate 0..1 */
  retention_rate: number | null;
  /** Optional explicit CAC override; else marketing/new_customers */
  cac: number | null;
  /** Optional LTV for payback; else null */
  ltv: number | null;
  currency?: string;
};

export type ScenarioImpact = {
  scenario: StressScenarioId;
  demand_multiplier: number;
  revenue: number | null;
  gross_profit: number | null;
  contribution_profit: number | null;
  cash: number | null;
  /** Months of runway at contribution burn; null if profitable or unknown */
  runway_months: number | null;
  ai_api_expense: number | null;
  marketing: number | null;
  fixed_costs: number | null;
  customer_retention: number | null;
  cac: number | null;
  /** Months to pay back CAC from contribution margin per customer; null if unknown */
  payback_months: number | null;
  /** Operating profit ≈ contribution − fixed */
  operating_profit: number | null;
  notes: string[];
};

export type ResponsePriority =
  | "protect_customer_value"
  | "protect_retention"
  | "cut_non_essential_variable_waste"
  | "cut_weak_acquisition"
  | "remove_non_core_tools_features"
  | "renegotiate_fixed_expenses"
  | "narrow_focus_highest_contribution"
  | "preserve_cash"
  | "identify_strategic_opportunities";

export const RESPONSE_PRIORITY_ORDER: ResponsePriority[] = [
  "protect_customer_value",
  "protect_retention",
  "cut_non_essential_variable_waste",
  "cut_weak_acquisition",
  "remove_non_core_tools_features",
  "renegotiate_fixed_expenses",
  "narrow_focus_highest_contribution",
  "preserve_cash",
  "identify_strategic_opportunities",
];

export type StressResponse = {
  priority: number; // 1..9
  kind: ResponsePriority;
  title: string;
  rationale: string;
  /** Evidence from scenario impacts */
  evidence: string[];
  /** True if this would touch core Harbor product */
  touches_core_product: boolean;
  /** Required when touches_core_product and proposing a cut */
  long_term_consequences: string | null;
  /** Blocked if core cut without consequences */
  blocked: boolean;
  block_reason?: string;
};

export type StressTestReport = {
  schema_version: "1";
  policy: "no_indiscriminate_core_product_cuts";
  baseline: StressBaselineInputs;
  impacts: ScenarioImpact[];
  responses: StressResponse[];
  generated_at: string;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
