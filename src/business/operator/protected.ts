/**
 * Protected-domain gates for the Capital Operator.
 */

import type { ApprovalEvent, ProposedAction, ProtectedDomain } from "./types";
import { PROTECTED_DOMAINS } from "./types";

const AGENT_APPROVER = /^(agent|ai|bot|llm|gpt|claude)/i;

export function isProtectedDomain(v: unknown): v is ProtectedDomain {
  return typeof v === "string" && (PROTECTED_DOMAINS as string[]).includes(v);
}

/** Obvious non-human approver slugs are rejected. */
export function isHumanApprover(approver: string): boolean {
  const a = approver.trim();
  if (!a) return false;
  return !AGENT_APPROVER.test(a);
}

export function findMatchingApproval(
  action: ProposedAction,
  approvals: ApprovalEvent[],
): ApprovalEvent | null {
  if (!action.protected_domain) return null;
  return (
    approvals.find(
      (a) =>
        a.domain === action.protected_domain &&
        a.action_id === action.id &&
        isHumanApprover(a.approver) &&
        a.note.trim().length >= 4,
    ) ?? null
  );
}

/**
 * Returns null if the action may execute; otherwise a block reason.
 */
export function approvalBlockReason(
  action: ProposedAction,
  approvals: ApprovalEvent[],
): string | null {
  if (!action.protected_domain) return null;
  const match = findMatchingApproval(action, approvals);
  if (!match) {
    return `Protected domain “${action.protected_domain}” requires an ApprovalEvent for action ${action.id}`;
  }
  return null;
}

/** Keyword → domain hints for classification (deterministic, conservative). */
const DOMAIN_HINTS: { domain: ProtectedDomain; patterns: RegExp[] }[] = [
  {
    domain: "company_mission",
    patterns: [/\bmission\b/i, /\bconstitution\b/i, /\bnorth\s*star\b/i],
  },
  {
    domain: "pricing_strategy",
    patterns: [/\bpric(e|ing)\b/i, /\bdiscount\b/i, /\bplan\s*tier\b/i, /\bARPU\b/],
  },
  {
    domain: "production_financial_transactions",
    patterns: [/\bcharge\b/i, /\bpayout\b/i, /\brefund\b/i, /\bstripe\b/i, /\bwire\b/i],
  },
  {
    domain: "legal_commitments",
    patterns: [/\bcontract\b/i, /\blegal\b/i, /\bToS\b/, /\bterms of service\b/i],
  },
  {
    domain: "customer_privacy_policy",
    patterns: [/\bprivacy\b/i, /\bGDPR\b/i, /\bdata retention\b/i, /\bPII\b/],
  },
  {
    domain: "production_deployments",
    patterns: [/\bdeploy\b/i, /\bproduction\b/i, /\bship to prod\b/i, /\brelease\b/i],
  },
  {
    domain: "high_impact_public_communications",
    patterns: [/\bpress\b/i, /\bpublic (post|launch|announce)/i, /\bbrand statement\b/i],
  },
  {
    domain: "irreversible_strategic_decisions",
    patterns: [/\bpivot\b/i, /\bkill (the )?product\b/i, /\bacqui(re|sition)\b/i, /\bshut down\b/i],
  },
];

export function inferTouchedDomains(
  signal: string,
  explicit: ProtectedDomain[] = [],
): ProtectedDomain[] {
  const found = new Set<ProtectedDomain>(explicit);
  for (const { domain, patterns } of DOMAIN_HINTS) {
    if (patterns.some((p) => p.test(signal))) found.add(domain);
  }
  return [...found];
}
