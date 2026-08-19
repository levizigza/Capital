/**
 * Usability analysis — cluster & prioritize session issues.
 * Separates observation / interpretation / recommendation.
 * Refuses to treat n=1 opinion as universal truth.
 */

export type Severity =
  | "CRITICAL_BLOCKER"
  | "MAJOR_FRICTION"
  | "MINOR_FRICTION"
  | "DELIGHT"
  | "OPPORTUNITY"
  | "UNEXPECTED_BEHAVIOR";

export type Confidence = "low" | "med" | "high";

export type AnalysisLayer = "observation" | "interpretation" | "recommendation";

/** One evidenced usability issue (not a vibe). */
export interface UsabilityIssue {
  id: string;
  /** De-identified participant ids who showed the behavior */
  participantsAffected: string[];
  /** Cohort completes used as denominator for frequency */
  cohortCompletes: number;
  severity: Severity;
  tasksAffected: string[];
  evidenceRefs: string[];
  observation: string;
  interpretation: string;
  recommendation: string;
  likelyCause: string;
  confidence: Confidence;
  proposedCorrection: string;
  /** 1–5 scores for prioritization */
  impact: 1 | 2 | 3 | 4 | 5;
  frequencyScore: 1 | 2 | 3 | 4 | 5;
  coreLoopImportance: 1 | 2 | 3 | 4 | 5;
  /** Stated request text if any — may contradict behavior */
  statedRequest?: string;
  behaviorContradictsRequest?: boolean;
  clusterIds?: string[];
}

export type ClusterKind =
  | "repeated_confusion"
  | "repeated_friction"
  | "repeated_delight"
  | "misunderstood_mechanics"
  | "misunderstood_terminology"
  | "onboarding_failures"
  | "features_ignored"
  | "features_unexpectedly_valued"
  | "requests_repeated"
  | "requests_contradict_behavior";

export interface IssueCluster {
  id: string;
  kind: ClusterKind;
  issueIds: string[];
  label: string;
}

export interface AnalysisReportSnapshot {
  reportId: string;
  sessionsCompleted: number;
  participantCompletes: number;
  issues: UsabilityIssue[];
  clusters: IssueCluster[];
  /** Issues sorted by priority desc — empty if no evidence */
  prioritizedFixIds: string[];
  productChangesRecommended: boolean;
  notes: string;
}

/** In-repo corpus until real sessions are filed. */
export const SESSION_CORPUS: UsabilityIssue[] = [];

export function frequencyPercent(issue: UsabilityIssue): number {
  if (issue.cohortCompletes <= 0) return 0;
  return (issue.participantsAffected.length / issue.cohortCompletes) * 100;
}

export function priorityScore(issue: UsabilityIssue): number {
  return issue.impact * issue.frequencyScore * issue.coreLoopImportance;
}

/**
 * Max confidence allowed from participant count alone.
 * n=1 → low; n=2 → med; n≥3 → high (still segment-scoped).
 */
export function maxConfidenceForN(n: number): Confidence {
  if (n <= 1) return "low";
  if (n === 2) return "med";
  return "high";
}

export function assertConfidenceNotOverclaimed(issue: UsabilityIssue): void {
  const max = maxConfidenceForN(issue.participantsAffected.length);
  const rank = { low: 0, med: 1, high: 2 };
  if (rank[issue.confidence] > rank[max]) {
    throw new Error(
      `${issue.id}: confidence ${issue.confidence} exceeds max ${max} for n=${issue.participantsAffected.length}`,
    );
  }
}

export function assertLayersSeparated(issue: UsabilityIssue): void {
  if (!issue.observation.trim()) throw new Error(`${issue.id}: observation required`);
  if (!issue.interpretation.trim()) throw new Error(`${issue.id}: interpretation required`);
  if (!issue.recommendation.trim()) throw new Error(`${issue.id}: recommendation required`);
  if (!issue.evidenceRefs.length) throw new Error(`${issue.id}: evidence required`);
  // Soft check: recommendation must not be copy-pasted as sole "observation"
  if (issue.observation === issue.recommendation) {
    throw new Error(`${issue.id}: observation and recommendation must differ`);
  }
}

export function preferFrictionRemoval(issue: UsabilityIssue): boolean {
  const r = issue.proposedCorrection.toLowerCase();
  const addsFeature =
    /\badd\b.+\b(feature|mode|island|system|dashboard|multiplayer)\b/.test(r) ||
    /\bnew\b.+\b(feature|island|mode)\b/.test(r);
  const removesFriction =
    /\b(clarif|label|contrast|affordance|copy|hint|reduce|simplify|fix|remove friction|discoverab)/i.test(
      r,
    );
  if (addsFeature && !removesFriction) return false;
  return true;
}

export function sortByPriority(issues: UsabilityIssue[]): UsabilityIssue[] {
  return [...issues].sort((a, b) => priorityScore(b) - priorityScore(a));
}

export function clusterRecurring(
  issues: UsabilityIssue[],
  kind: ClusterKind,
  predicate: (i: UsabilityIssue) => boolean,
  label: string,
): IssueCluster | null {
  const matched = issues.filter(
    (i) => predicate(i) && i.participantsAffected.length >= 2,
  );
  if (matched.length === 0) return null;
  return {
    id: `CL-${kind}`,
    kind,
    issueIds: matched.map((i) => i.id),
    label,
  };
}

export function buildClusters(issues: UsabilityIssue[]): IssueCluster[] {
  const out: IssueCluster[] = [];
  const push = (c: IssueCluster | null) => {
    if (c) out.push(c);
  };

  push(
    clusterRecurring(
      issues,
      "repeated_confusion",
      (i) =>
        i.severity === "MAJOR_FRICTION" ||
        i.severity === "CRITICAL_BLOCKER" ||
        /confus/i.test(i.observation),
      "Repeated confusion patterns",
    ),
  );
  push(
    clusterRecurring(
      issues,
      "repeated_friction",
      (i) =>
        i.severity === "MAJOR_FRICTION" || i.severity === "MINOR_FRICTION",
      "Repeated friction",
    ),
  );
  push(
    clusterRecurring(
      issues,
      "repeated_delight",
      (i) => i.severity === "DELIGHT",
      "Repeated delight",
    ),
  );
  push(
    clusterRecurring(
      issues,
      "onboarding_failures",
      (i) => i.tasksAffected.some((t) => t === "UT-01" || t === "UT-02"),
      "Onboarding / first-voyage failures",
    ),
  );
  push(
    clusterRecurring(
      issues,
      "requests_contradict_behavior",
      (i) => i.behaviorContradictsRequest === true,
      "Requests contradicting observed behavior",
    ),
  );

  return out;
}

export function analyzeCorpus(
  issues: UsabilityIssue[] = SESSION_CORPUS,
  meta?: { reportId?: string; notes?: string },
): AnalysisReportSnapshot {
  for (const issue of issues) {
    assertLayersSeparated(issue);
    assertConfidenceNotOverclaimed(issue);
  }

  const prioritized = sortByPriority(
    issues.filter((i) => i.severity !== "DELIGHT"),
  );

  return {
    reportId: meta?.reportId ?? "UR-ANALYSIS-EMPTY",
    sessionsCompleted: issues.length === 0 ? 0 : new Set(issues.flatMap((i) => i.participantsAffected)).size,
    participantCompletes:
      issues.length === 0
        ? 0
        : Math.max(0, ...issues.map((i) => i.cohortCompletes)),
    issues,
    clusters: buildClusters(issues),
    prioritizedFixIds: prioritized.map((i) => i.id),
    productChangesRecommended: prioritized.some(
      (i) => priorityScore(i) >= 40 && i.participantsAffected.length >= 2,
    ),
    notes:
      meta?.notes ??
      (issues.length === 0
        ? "No session corpus — no product changes recommended from usability analysis."
        : "Analysis complete"),
  };
}

/** Frequency score helper from raw counts. */
export function frequencyScoreFromCount(
  affected: number,
  completes: number,
): 1 | 2 | 3 | 4 | 5 {
  if (completes <= 0 || affected <= 0) return 1;
  if (affected === 1) return 1;
  const pct = (affected / completes) * 100;
  if (pct >= 75) return 5;
  if (pct >= 50) return 4;
  if (pct >= 25) return 3;
  return 2;
}
