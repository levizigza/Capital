/**
 * Customer Discovery store — keeps FACTS separate from HYPOTHESES.
 * Harbor gameplay must not import this for runtime UX.
 */

export type EvidenceKind = "fact" | "hypothesis";

export type SegmentId =
  | "S1_families_6_11"
  | "S2_homeschool"
  | "S3_youth_org_cu"
  | "S4_teachers"
  | "S5_teens"
  | "S6_grandparents"
  | "S7_solo_adults"
  | "S8_coaches";

export type ScoreDimension =
  | "pain"
  | "frequency"
  | "current_solution_gap"
  | "cost_of_problem"
  | "urgency"
  | "ability_to_pay"
  | "reachability"
  | "product_fit";

/** 1–5 ordinal scores used in docs/customer-discovery/SEGMENT_SCORECARDS.md */
export type DimScore = 1 | 2 | 3 | 4 | 5;

export interface DiscoveryClaim {
  id: string;
  kind: EvidenceKind;
  text: string;
  /** Repo paths or “external-unverified” */
  sources: string[];
  segmentIds?: SegmentId[];
}

export interface SegmentScorecard {
  id: SegmentId;
  label: string;
  scores: Record<ScoreDimension, DimScore>;
  composite: number;
  confidence: "low" | "low_med" | "med" | "high";
  provisionalRank: number;
}

export const SCORE_WEIGHTS: Record<ScoreDimension, number> = {
  pain: 15,
  frequency: 10,
  current_solution_gap: 10,
  cost_of_problem: 15,
  urgency: 10,
  ability_to_pay: 15,
  reachability: 10,
  product_fit: 15,
};

export function compositeFromScores(scores: Record<ScoreDimension, DimScore>): number {
  let sum = 0;
  for (const dim of Object.keys(SCORE_WEIGHTS) as ScoreDimension[]) {
    sum += (SCORE_WEIGHTS[dim] * scores[dim]) / 5;
  }
  return Math.round(sum);
}

/** Seed claims — facts only when repo-backed; everything else hypothesis. */
export const SEED_CLAIMS: DiscoveryClaim[] = [
  {
    id: "F-PRODUCT-SPINE",
    kind: "fact",
    text: "Capital’s iconic spine is Cove → Paycheck → Credit with Harbor hub; signature Take → hush → Plinth → share → Piggy.",
    sources: ["docs/iconic-path.md", ".cursor/rules/iconic-freeze.mdc"],
  },
  {
    id: "F-DESIGN-SEGMENTS-NAMED",
    kind: "fact",
    text: "Design docs name segments Families 6–11, Teens, Teachers, Solo adults — as targets, not validated customers.",
    sources: ["docs/game-pillars.md"],
    segmentIds: [
      "S1_families_6_11",
      "S5_teens",
      "S4_teachers",
      "S7_solo_adults",
    ],
  },
  {
    id: "F-PRICING-IS-HYPOTHESIS-IN-DOCS",
    kind: "fact",
    text: "Paid model is explicitly labeled hypothesis: premium base + expansion DLC; never pay-to-win.",
    sources: ["docs/game-pillars.md"],
  },
  {
    id: "F-NO-VOC-CORPUS",
    kind: "fact",
    text: "No archived primary customer interview corpus or WTP study exists in-repo.",
    sources: ["docs/customer-discovery/VERIFIED_FACTS.md"],
  },
  {
    id: "F-PARENT-DATA-GATED",
    kind: "fact",
    text: "Parent access to student data is denied until verified parent↔child links exist.",
    sources: ["docs/security/runbook.md", "docs/security/threat-model.md"],
    segmentIds: ["S1_families_6_11", "S4_teachers"],
  },
  {
    id: "H-SEG-01",
    kind: "hypothesis",
    text: "Primary buyer is a parent of kids 6–11 seeking safe co-play money habits.",
    sources: ["docs/game-pillars.md", "docs/customer-discovery/HYPOTHESES.md"],
    segmentIds: ["S1_families_6_11"],
  },
  {
    id: "H-COMP-03",
    kind: "hypothesis",
    text: "Parents who want debit cards will not switch from Greenlight-class products to Capital alone.",
    sources: ["docs/customer-discovery/HYPOTHESES.md"],
    segmentIds: ["S1_families_6_11"],
  },
  {
    id: "H-FIT-04",
    kind: "hypothesis",
    text: "Classroom JTBD fails until session timers, class codes, standards map, and school privacy story exist.",
    sources: ["docs/customer-discovery/HYPOTHESES.md"],
    segmentIds: ["S4_teachers"],
  },
  {
    id: "H-FIT-05",
    kind: "hypothesis",
    text: "Solo adults bounce on mascot/fantasy tone.",
    sources: ["docs/customer-discovery/HYPOTHESES.md"],
    segmentIds: ["S7_solo_adults"],
  },
];

export const SEED_SCORECARDS: SegmentScorecard[] = [
  {
    id: "S2_homeschool",
    label: "Homeschool parents",
    scores: {
      pain: 4,
      frequency: 4,
      current_solution_gap: 4,
      cost_of_problem: 3,
      urgency: 4,
      ability_to_pay: 4,
      reachability: 4,
      product_fit: 3,
    },
    composite: 74,
    confidence: "low",
    provisionalRank: 1,
  },
  {
    id: "S1_families_6_11",
    label: "Parents + kids 6–11 (co-play)",
    scores: {
      pain: 4,
      frequency: 4,
      current_solution_gap: 4,
      cost_of_problem: 3,
      urgency: 3,
      ability_to_pay: 4,
      reachability: 3,
      product_fit: 4,
    },
    composite: 73,
    confidence: "low_med",
    provisionalRank: 2,
  },
  {
    id: "S3_youth_org_cu",
    label: "Youth orgs / CU education",
    scores: {
      pain: 4,
      frequency: 3,
      current_solution_gap: 3,
      cost_of_problem: 3,
      urgency: 3,
      ability_to_pay: 4,
      reachability: 3,
      product_fit: 2,
    },
    composite: 63,
    confidence: "low",
    provisionalRank: 3,
  },
  {
    id: "S7_solo_adults",
    label: "Solo adults 18–35",
    scores: {
      pain: 3,
      frequency: 4,
      current_solution_gap: 2,
      cost_of_problem: 4,
      urgency: 3,
      ability_to_pay: 3,
      reachability: 3,
      product_fit: 2,
    },
    composite: 60,
    confidence: "low",
    provisionalRank: 4,
  },
  {
    id: "S6_grandparents",
    label: "Grandparents (gift)",
    scores: {
      pain: 3,
      frequency: 2,
      current_solution_gap: 3,
      cost_of_problem: 2,
      urgency: 4,
      ability_to_pay: 4,
      reachability: 2,
      product_fit: 3,
    },
    composite: 58,
    confidence: "low",
    provisionalRank: 5,
  },
  {
    id: "S4_teachers",
    label: "Teachers grades 3–8",
    scores: {
      pain: 4,
      frequency: 3,
      current_solution_gap: 3,
      cost_of_problem: 3,
      urgency: 3,
      ability_to_pay: 2,
      reachability: 3,
      product_fit: 2,
    },
    composite: 57,
    confidence: "low",
    provisionalRank: 6,
  },
  {
    id: "S5_teens",
    label: "Teens 12–17 self-directed",
    scores: {
      pain: 3,
      frequency: 3,
      current_solution_gap: 3,
      cost_of_problem: 3,
      urgency: 3,
      ability_to_pay: 2,
      reachability: 2,
      product_fit: 3,
    },
    composite: 55,
    confidence: "low",
    provisionalRank: 7,
  },
  {
    id: "S8_coaches",
    label: "Financial coaches",
    scores: {
      pain: 3,
      frequency: 3,
      current_solution_gap: 3,
      cost_of_problem: 2,
      urgency: 2,
      ability_to_pay: 3,
      reachability: 2,
      product_fit: 2,
    },
    composite: 50,
    confidence: "low",
    provisionalRank: 8,
  },
];

/** Near-term GTM filter: product_fit must be ≥ 3 (addresses problem with shipped Capital). */
export const PRODUCT_FIT_GATE: DimScore = 3;

export function fitGatedLead(
  scorecards = SEED_SCORECARDS,
  minFit: DimScore = PRODUCT_FIT_GATE,
): SegmentScorecard {
  const eligible = scorecards
    .filter((s) => s.scores.product_fit >= minFit)
    .sort((a, b) => b.composite - a.composite || a.provisionalRank - b.provisionalRank);
  if (!eligible.length) throw new Error("No segments pass product_fit gate");
  return eligible[0]!;
}

export function claimsByKind(kind: EvidenceKind, claims = SEED_CLAIMS): DiscoveryClaim[] {
  return claims.filter((c) => c.kind === kind);
}

export function assertCompositesMatch(scorecards = SEED_SCORECARDS): void {
  for (const card of scorecards) {
    const computed = compositeFromScores(card.scores);
    if (computed !== card.composite) {
      throw new Error(`${card.id}: composite ${card.composite} != computed ${computed}`);
    }
  }
}

export function provisionalLead(scorecards = SEED_SCORECARDS): SegmentScorecard {
  return [...scorecards].sort((a, b) => a.provisionalRank - b.provisionalRank)[0]!;
}
