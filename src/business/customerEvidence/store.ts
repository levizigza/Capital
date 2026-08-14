/**
 * Customer Evidence database — problem-interview records.
 * Does not pitch Capital. Does not mutate canonical ICP.
 */

export type SegmentId =
  | "S1_families_6_11"
  | "S2_homeschool"
  | "S3_youth_org_cu"
  | "S4_teachers"
  | "S5_teens"
  | "S6_grandparents"
  | "S7_solo_adults"
  | "S8_coaches";

export type InterviewPhase = "problem_only" | "problem_and_product";

export interface ProblemFields {
  pain: string;
  frequency: string;
  urgency: string;
  existingAlternatives: string[];
  moneyCurrentlySpent: string;
  decisionMaker: string;
  switchingBarriers: string[];
  desiredOutcome: string;
  customerLanguage: string[];
}

export interface ProductReactionFields {
  whatTheyThoughtItWas: string;
  relevantToTheirPain: "yes" | "partial" | "no" | "unclear";
  ignored: string[];
  unexpectedlyValued: string[];
  /** Only if participant volunteered — never from anchored price questions */
  volunteeredWtpLanguage: string[];
}

export interface CustomerEvidenceRecord {
  interviewId: string;
  participantId: string;
  segment: SegmentId;
  channel: string;
  date: string;
  phasesCompleted: InterviewPhase;
  hypothesesTouched: string[];
  problem: ProblemFields;
  productReaction?: ProductReactionFields;
  /** Analyst layers — keep separate from customer words */
  observation: string;
  interpretation: string;
  /** Must not rewrite ICP here */
  recommendation: "none_for_icp" | "flag_for_evidence_review";
}

/** Leading / pitch questions that must never appear in guides or live scripts. */
export const FORBIDDEN_INTERVIEW_QUESTIONS: RegExp[] = [
  /would you use capital/i,
  /wouldn'?t this be useful/i,
  /would you pay \$?\d+/i,
  /would you pay \$10/i,
  /do you love this/i,
  /most parents love/i,
];

export const CORE_PROBLEM_QUESTIONS = [
  "Tell me about the last time this happened.",
  "What did you do?",
  "What was difficult?",
  "What have you already tried?",
  "What did that cost?",
  "What happens if you don’t solve it?",
  "How often does this happen?",
  "Have you ever paid for something that solves this?",
] as const;

/** In-repo evidence corpus — append via addEvidenceRecord after interviews. */
export const EVIDENCE_DB: CustomerEvidenceRecord[] = [];

export function assertNoForbiddenQuestion(text: string): void {
  for (const re of FORBIDDEN_INTERVIEW_QUESTIONS) {
    if (re.test(text)) {
      throw new Error(`Forbidden leading/pitch question detected: /${re.source}/`);
    }
  }
}

export function assertCoreQuestionsAreBehavioral(): void {
  for (const q of CORE_PROBLEM_QUESTIONS) {
    assertNoForbiddenQuestion(q);
  }
}

export function assertProblemFieldsPresent(problem: ProblemFields): void {
  const required: (keyof ProblemFields)[] = [
    "pain",
    "frequency",
    "urgency",
    "moneyCurrentlySpent",
    "decisionMaker",
    "desiredOutcome",
  ];
  for (const key of required) {
    const v = problem[key];
    if (typeof v === "string" && !v.trim()) {
      throw new Error(`problem.${key} required`);
    }
  }
  if (!problem.existingAlternatives.length) {
    throw new Error("problem.existingAlternatives requires at least one entry (use \"none\" if truly none)");
  }
  if (!problem.customerLanguage.length) {
    throw new Error("problem.customerLanguage requires at least one verbatim quote");
  }
}

export function addEvidenceRecord(
  record: CustomerEvidenceRecord,
  db: CustomerEvidenceRecord[] = EVIDENCE_DB,
): CustomerEvidenceRecord[] {
  assertProblemFieldsPresent(record.problem);
  assertNoForbiddenQuestion(record.observation);
  assertNoForbiddenQuestion(record.interpretation);
  if (record.recommendation === undefined) {
    throw new Error("recommendation required");
  }
  if (db.some((r) => r.interviewId === record.interviewId)) {
    throw new Error(`Duplicate interviewId ${record.interviewId}`);
  }
  db.push(record);
  return db;
}

export interface IcpAmendmentProposal {
  id: string;
  segment: SegmentId;
  claim: string;
  evidenceIds: string[];
  status: "draft" | "rejected" | "accepted_by_human";
}

/**
 * Recurrence gate: ≥3 evidence records in same segment with overlapping pain theme,
 * or ≥50% of cohort when cohortSize ≥ 4.
 */
export function canProposeIcpAmendment(input: {
  segment: SegmentId;
  evidenceIds: string[];
  cohortSize?: number;
  db?: CustomerEvidenceRecord[];
}): { ok: true } | { ok: false; reason: string } {
  const db = input.db ?? EVIDENCE_DB;
  const records = db.filter(
    (r) => r.segment === input.segment && input.evidenceIds.includes(r.interviewId),
  );
  if (records.length < input.evidenceIds.length) {
    return { ok: false, reason: "One or more evidence ids missing from DB" };
  }
  if (records.length === 0) {
    return { ok: false, reason: "No evidence" };
  }
  if (records.length === 1) {
    return { ok: false, reason: "Single interview cannot update ICP" };
  }
  const cohort = input.cohortSize ?? 0;
  if (records.length >= 3) return { ok: true };
  if (cohort >= 4 && records.length / cohort >= 0.5) return { ok: true };
  return {
    ok: false,
    reason: "Need ≥3 records or ≥50% of a cohort with n≥4",
  };
}

export function countBySegment(db: CustomerEvidenceRecord[] = EVIDENCE_DB): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of db) {
    out[r.segment] = (out[r.segment] ?? 0) + 1;
  }
  return out;
}

export function evidenceSummary(db: CustomerEvidenceRecord[] = EVIDENCE_DB) {
  return {
    interviewsFiled: db.length,
    problemOnly: db.filter((r) => r.phasesCompleted === "problem_only").length,
    problemAndProduct: db.filter((r) => r.phasesCompleted === "problem_and_product").length,
    bySegment: countBySegment(db),
    icpUpdatesAllowed: false as const,
  };
}
