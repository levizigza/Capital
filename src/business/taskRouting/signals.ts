/**
 * Deterministic signal extraction from task text + hints.
 */

import type {
  ConsequenceFlags,
  IncomingTask,
  RoutingSignals,
  TaskRoutingHints,
} from "./types";

function textOf(task: IncomingTask): string {
  return `${task.description} ${(task.tags ?? []).join(" ")}`.trim();
}

function hint(h: TaskRoutingHints | undefined, key: keyof TaskRoutingHints): boolean {
  if (!h) return false;
  const v = h[key];
  return v === true;
}

function anyConsequence(flags: ConsequenceFlags | undefined): string[] {
  if (!flags) return [];
  const out: string[] = [];
  if (flags.strategic) out.push("strategic");
  if (flags.irreversible) out.push("irreversible");
  if (flags.legally_sensitive) out.push("legally_sensitive");
  if (flags.financially_material) out.push("financially_material");
  if (flags.ethically_significant) out.push("ethically_significant");
  return out;
}

const CONSEQUENCE_PATTERNS: { reason: string; patterns: RegExp[] }[] = [
  {
    reason: "strategic",
    patterns: [
      /\b(strategy|strategic|pivot|north\s*star|company mission)\b/i,
      /\b(kill|sunset) (the )?product\b/i,
      /\bmarket (exit|entry)\b/i,
    ],
  },
  {
    reason: "irreversible",
    patterns: [
      /\birreversible\b/i,
      /\bcannot undo\b/i,
      /\bpermanent(ly)?\b/i,
      /\bdelete all (user|customer) data\b/i,
    ],
  },
  {
    reason: "legally_sensitive",
    patterns: [
      /\b(legal|lawsuit|attorney|counsel)\b/i,
      /\b(contract|ToS|terms of service|NDA)\b/i,
      /\b(compliance|GDPR|COPPA|regulation)\b/i,
    ],
  },
  {
    reason: "financially_material",
    patterns: [
      /\b(material (revenue|cost|loss)|P&L impact)\b/i,
      /\b(production )?(charge|payout|wire|invoice) (customers|users)?\b/i,
      /\b(change|set|raise|cut) pric(e|ing)\b/i,
      /\b(refund all|mass refund)\b/i,
      /\b(budget|capex|opex) (approval|commit)/i,
    ],
  },
  {
    reason: "ethically_significant",
    patterns: [
      /\bethic(al|s)?\b/i,
      /\b(child(ren)?|minor)s?\b/i,
      /\b(discriminat|exploit|dark pattern)\b/i,
      /\bprivacy policy\b/i,
      /\bsurveillance\b/i,
    ],
  },
];

const DETERMINISTIC_PATTERNS = {
  procedure: [
    /\b(runbook|playbook|sop|checklist|procedure)\b/i,
    /\bfollow (the )?(steps|procedure|script)\b/i,
    /\bknown (workflow|procedure)\b/i,
  ],
  calculation: [
    /\b(calculat|compute|sum|aggregate|formula)\b/i,
    /\b(unit economics|gross margin|contribution margin|payback)\b/i,
    /\b(reconcile|ledger math)\b/i,
  ],
  validatable: [
    /\b(schema|assert|validate|unit.?test|checksum|invariant)\b/i,
    /\bprogrammatic(ally)?\b/i,
  ],
  lowJudgment: [
    /\b(template|fill.?in|copy.?paste|mechanical)\b/i,
    /\bno (judgment|discretion) (needed|required)\b/i,
  ],
};

const AI_ASSISTED_PATTERNS = {
  interpretation: [
    /\b(draft|summarize|rewrite|interpret|triage|classify feedback)\b/i,
    /\b(suggest|recommend|brainstorm)\b/i,
    /\b(tone|wording|copy edit)\b/i,
  ],
  reviewable: [
    /\b(review|human.?in.?the.?loop|approve before|validate output)\b/i,
    /\bdraft for review\b/i,
  ],
};

const AI_AGENT_PATTERNS = {
  ambiguous: [
    /\b(ambiguous|unclear|not sure|figure out|investigate)\b/i,
    /\b(why is|root cause|something.?s wrong)\b/i,
    /\b(open.?ended|explore)\b/i,
  ],
  multiStep: [
    /\bmulti[-\s]?step\b/i,
    /\b(plan|planning|roadmap of actions)\b/i,
    /\b(then|after that).{0,40}\b(then|next)\b/i,
    /\borchestrat(e|ion)\b/i,
  ],
  evolvingTools: [
    /\b(depending on (what|results|findings)|tool choice)\b/i,
    /\b(may need to (call|use|switch) )\b/i,
    /\bevolv(e|ing) context\b/i,
    /\badapt(ive)? (tools|next step)\b/i,
  ],
};

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

export function extractSignals(task: IncomingTask): RoutingSignals {
  const text = textOf(task);
  const h = task.hints;
  const tags = (task.tags ?? []).map((t) => t.toLowerCase());

  const consequence_reasons = [
    ...anyConsequence(h?.consequences),
    ...CONSEQUENCE_PATTERNS.filter((c) => matchesAny(text, c.patterns)).map((c) => c.reason),
  ];
  // de-dupe
  const consequenceUnique = [...new Set(consequence_reasons)];

  const procedure_known =
    hint(h, "procedure_known") ||
    tags.includes("runbook") ||
    tags.includes("playbook") ||
    matchesAny(text, DETERMINISTIC_PATTERNS.procedure);

  const calculation_repeatable =
    hint(h, "calculation_repeatable") ||
    tags.includes("calc") ||
    tags.includes("formula") ||
    matchesAny(text, DETERMINISTIC_PATTERNS.calculation);

  const programmatically_validatable =
    hint(h, "programmatically_validatable") ||
    tags.includes("validate") ||
    matchesAny(text, DETERMINISTIC_PATTERNS.validatable);

  const low_judgment =
    hint(h, "low_judgment") ||
    tags.includes("mechanical") ||
    matchesAny(text, DETERMINISTIC_PATTERNS.lowJudgment) ||
    // Calculations and known procedures imply low judgment unless contradicted
    ((calculation_repeatable || procedure_known) &&
      !hint(h, "interpretation_useful") &&
      !matchesAny(text, AI_ASSISTED_PATTERNS.interpretation));

  const interpretation_useful =
    hint(h, "interpretation_useful") ||
    tags.includes("draft") ||
    tags.includes("summarize") ||
    matchesAny(text, AI_ASSISTED_PATTERNS.interpretation);

  const output_reviewable =
    hint(h, "output_reviewable") ||
    tags.includes("review") ||
    matchesAny(text, AI_ASSISTED_PATTERNS.reviewable) ||
    // Drafts are reviewable by default
    interpretation_useful;

  const ambiguous =
    hint(h, "ambiguous") ||
    tags.includes("ambiguous") ||
    matchesAny(text, AI_AGENT_PATTERNS.ambiguous);

  const multi_step_planning =
    hint(h, "multi_step_planning") ||
    tags.includes("multi-step") ||
    tags.includes("multistep") ||
    matchesAny(text, AI_AGENT_PATTERNS.multiStep);

  const evolving_tool_choice =
    hint(h, "evolving_tool_choice") ||
    tags.includes("adaptive-tools") ||
    matchesAny(text, AI_AGENT_PATTERNS.evolvingTools);

  const human_consequence = consequenceUnique.length > 0;

  // Deterministic: known procedure OR repeatable calc, validatable (or calc), low judgment
  const deterministic_eligible =
    low_judgment &&
    (procedure_known || calculation_repeatable) &&
    (programmatically_validatable || calculation_repeatable);

  const ai_agent_eligible = ambiguous && multi_step_planning && evolving_tool_choice;

  const ai_assisted_eligible = interpretation_useful && output_reviewable;

  return {
    human_consequence,
    consequence_reasons: consequenceUnique,
    procedure_known,
    calculation_repeatable,
    programmatically_validatable,
    low_judgment,
    interpretation_useful,
    output_reviewable,
    ambiguous,
    multi_step_planning,
    evolving_tool_choice,
    deterministic_eligible,
    ai_agent_eligible,
    ai_assisted_eligible,
  };
}
