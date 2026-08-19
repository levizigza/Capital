/**
 * Prioritized stress responses with core-product guardrails.
 */

import type {
  ScenarioImpact,
  StressResponse,
  StressResponse as SR,
} from "./types";
import { RESPONSE_PRIORITY_ORDER } from "./types";

const CORE_PRODUCT =
  "Harbor signature loop (Cove Change → Soft Beat → Plinth → share → Piggy) / Cove→Paycheck→Credit";

function ev(impacts: ScenarioImpact[], line: (s: ScenarioImpact) => string | null): string[] {
  return impacts
    .map(line)
    .filter((x): x is string => Boolean(x));
}

function fmt(n: number | null, prefix = ""): string {
  if (n == null) return "UNKNOWN";
  return `${prefix}${n}`;
}

/**
 * Build responses in fixed priority order 1..9.
 * Indiscriminate core-product cuts without long-term consequences are blocked.
 */
export function generateStressResponses(
  impacts: ScenarioImpact[],
  opts: {
    /** If true, include a blocked example of an indiscriminate core cut */
    include_indiscriminate_core_cut_attempt?: boolean;
    /** Optional proposed core cut with disclosed consequences (allowed through) */
    core_cut_with_consequences?: {
      title: string;
      rationale: string;
      long_term_consequences: string;
    } | null;
  } = {},
): StressResponse[] {
  const worst = impacts.find((i) => i.scenario === "DEMAND_DOWN_60") ?? impacts[impacts.length - 1]!;
  const baseline = impacts.find((i) => i.scenario === "BASELINE") ?? impacts[0]!;
  const responses: StressResponse[] = [];

  const add = (partial: Omit<SR, "priority"> & { kind: SR["kind"] }) => {
    const priority = RESPONSE_PRIORITY_ORDER.indexOf(partial.kind) + 1;
    responses.push({ ...partial, priority });
  };

  add({
    kind: "protect_customer_value",
    title: "Protect customer value in the core experience",
    rationale:
      "Under demand shock, keep delivering the Harbor teach moments that create trust — do not hollow out what customers pay for.",
    evidence: ev(impacts, (s) =>
      s.customer_retention != null
        ? `${s.scenario}: retention=${s.customer_retention}`
        : `${s.scenario}: retention UNKNOWN`,
    ),
    touches_core_product: true,
    long_term_consequences:
      "Cutting signature teach quality to save short-term cost risks permanent trust loss and weaker word-of-mouth, lengthening recovery after demand returns.",
    blocked: false,
  });

  add({
    kind: "protect_retention",
    title: "Protect retention before buying more demand",
    rationale:
      "Retention decline under stress amplifies revenue loss; diagnosis and onboarding/product fixes outrank new acquisition.",
    evidence: [
      `BASELINE retention=${fmt(baseline.customer_retention)}`,
      `DEMAND_DOWN_60 retention=${fmt(worst.customer_retention)}`,
      `DEMAND_DOWN_60 revenue=${fmt(worst.revenue)} contribution=${fmt(worst.contribution_profit)}`,
    ],
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  add({
    kind: "cut_non_essential_variable_waste",
    title: "Cut non-essential variable waste (AI/API & delivery sprawl)",
    rationale:
      "Trim redundant AI calls, unused tooling spend, and non-critical variable delivery — not the systems that power core play.",
    evidence: ev(impacts, (s) =>
      s.ai_api_expense != null
        ? `${s.scenario}: ai_api_expense=${s.ai_api_expense}`
        : null,
    ),
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  add({
    kind: "cut_weak_acquisition",
    title: "Cut weak acquisition channels",
    rationale:
      "Pause channels with poor CAC/payback under stress; keep only sources that still clear contribution hurdles.",
    evidence: [
      ...ev(impacts, (s) =>
        s.cac != null ? `${s.scenario}: CAC=${s.cac} payback=${fmt(s.payback_months)}` : null,
      ),
      ...ev(impacts, (s) =>
        s.marketing != null ? `${s.scenario}: marketing=${s.marketing}` : null,
      ),
    ],
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  // Priority 5 — non-core tools/features (allowed). Indiscriminate core cut handled separately.
  add({
    kind: "remove_non_core_tools_features",
    title: "Remove non-core tools/features only",
    rationale:
      "Deprecate peripheral admin experiments and non-signature surfaces. Core Cove→Paycheck→Credit loop stays intact.",
    evidence: [
      `Core product protected: ${CORE_PRODUCT}`,
      `Worst-case operating_profit=${fmt(worst.operating_profit)} runway_months=${fmt(worst.runway_months)}`,
    ],
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  if (opts.include_indiscriminate_core_cut_attempt) {
    add({
      kind: "remove_non_core_tools_features",
      title: "Indiscriminate cut: remove Soft Beat / Plinth signature moments",
      rationale: "Slash core spectacle to save eng/AI cost immediately.",
      evidence: [`Would reduce short-term ai_api_expense/hosting under ${worst.scenario}`],
      touches_core_product: true,
      long_term_consequences: null, // missing → blocked
      blocked: true,
      block_reason:
        "Indiscriminate core-product cut blocked — must explain long-term consequences before recommending damage to Harbor signature loop",
    });
  }

  if (opts.core_cut_with_consequences) {
    const c = opts.core_cut_with_consequences;
    add({
      kind: "remove_non_core_tools_features",
      title: c.title,
      rationale: c.rationale,
      evidence: [`Disclosed core impact under ${worst.scenario}`],
      touches_core_product: true,
      long_term_consequences: c.long_term_consequences,
      blocked: false,
    });
  }

  add({
    kind: "renegotiate_fixed_expenses",
    title: "Renegotiate fixed expenses",
    rationale:
      "Seek lower SaaS/seat/vendor fixed costs; fixed lines do not fall automatically with demand.",
    evidence: ev(impacts, (s) =>
      s.fixed_costs != null ? `${s.scenario}: fixed_costs=${s.fixed_costs} (unscaled)` : null,
    ),
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  add({
    kind: "narrow_focus_highest_contribution",
    title: "Narrow focus to highest-contribution customer/product",
    rationale:
      "Double down on ICP segments and product paths with strongest contribution; pause low-contribution sprawl.",
    evidence: [
      `BASELINE contribution=${fmt(baseline.contribution_profit)}`,
      `DEMAND_DOWN_60 contribution=${fmt(worst.contribution_profit)}`,
    ],
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  add({
    kind: "preserve_cash",
    title: "Preserve cash / extend runway",
    rationale:
      "Sequence spend cuts and collections to protect cash when operating profit turns negative.",
    evidence: [
      `DEMAND_DOWN_60 cash=${fmt(worst.cash)} runway_months=${fmt(worst.runway_months)} operating=${fmt(worst.operating_profit)}`,
    ],
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  add({
    kind: "identify_strategic_opportunities",
    title: "Identify strategically attractive opportunities",
    rationale:
      "After defense: note counter-cyclical content, partnerships, or pricing tests that improve contribution without harming core value.",
    evidence: [
      `Stress spread revenue BASELINE=${fmt(baseline.revenue)} → DOWN60=${fmt(worst.revenue)}`,
    ],
    touches_core_product: false,
    long_term_consequences: null,
    blocked: false,
  });

  return responses.sort((a, b) => a.priority - b.priority);
}

/**
 * Guard: any core-touching cut without long_term_consequences must be blocked.
 */
export function assertCoreCutGuard(responses: StressResponse[]): void {
  for (const r of responses) {
    if (r.touches_core_product && /cut|remove|slash|kill/i.test(r.title + r.rationale)) {
      if (!r.long_term_consequences?.trim() && !r.blocked) {
        throw new Error(
          `Core-product damaging recommendation must be blocked or include long_term_consequences: ${r.title}`,
        );
      }
    }
  }
}
