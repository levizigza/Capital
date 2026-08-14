/**
 * Task routing — typed contracts.
 */

export type RouteClass =
  | "DETERMINISTIC_WORKFLOW"
  | "AI_ASSISTED_WORKFLOW"
  | "AI_AGENT"
  | "HUMAN_DECISION";

export const ROUTE_CLASSES: RouteClass[] = [
  "DETERMINISTIC_WORKFLOW",
  "AI_ASSISTED_WORKFLOW",
  "AI_AGENT",
  "HUMAN_DECISION",
];

/** Explicit consequence flags — any true → prefer HUMAN_DECISION when severity warrants. */
export type ConsequenceFlags = {
  strategic?: boolean;
  irreversible?: boolean;
  legally_sensitive?: boolean;
  financially_material?: boolean;
  ethically_significant?: boolean;
};

/** Caller-supplied hints that override or strengthen signal detection. */
export type TaskRoutingHints = {
  /** Known playbook / runbook id exists */
  procedure_known?: boolean;
  /** Output is a pure/repeatable calculation */
  calculation_repeatable?: boolean;
  /** Validator or schema can check the output */
  programmatically_validatable?: boolean;
  /** Little contextual judgment required */
  low_judgment?: boolean;
  /** Interpretation / drafting is useful */
  interpretation_useful?: boolean;
  /** Humans or tests will review the output */
  output_reviewable?: boolean;
  /** Task statement is ambiguous */
  ambiguous?: boolean;
  /** Needs genuine multi-step planning */
  multi_step_planning?: boolean;
  /** Tool/API choice depends on evolving intermediate results */
  evolving_tool_choice?: boolean;
  consequences?: ConsequenceFlags;
};

export type IncomingTask = {
  id: string;
  /** Primary task description */
  description: string;
  /** Optional tags from upstream systems */
  tags?: string[];
  hints?: TaskRoutingHints;
};

/** Structured audit of what the router detected. */
export type RoutingSignals = {
  human_consequence: boolean;
  consequence_reasons: string[];
  procedure_known: boolean;
  calculation_repeatable: boolean;
  programmatically_validatable: boolean;
  low_judgment: boolean;
  interpretation_useful: boolean;
  output_reviewable: boolean;
  ambiguous: boolean;
  multi_step_planning: boolean;
  evolving_tool_choice: boolean;
  deterministic_eligible: boolean;
  ai_agent_eligible: boolean;
  ai_assisted_eligible: boolean;
};

export type RoutingDecision = {
  task_id: string;
  route: RouteClass;
  /** Required: human-readable explanation of why this route was chosen */
  reason_for_routing: string;
  signals: RoutingSignals;
  /** Competing routes considered (for edge-case debugging) */
  considered: RouteClass[];
};
