/**
 * User research recruitment planning store.
 * Does not send outreach. Does not store PII.
 */

export type SegmentId =
  | "S1_families_6_11"
  | "S2_homeschool"
  | "S3_youth_org_cu"
  | "S4_teachers"
  | "S5_teens"
  | "S6_grandparents"
  | "S7_solo_adults";

export type RoundId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type GateStatus =
  | "A1_READY_TO_RECRUIT"
  | "LOCKED"
  | "UNLOCKED"
  | "HALTED";

export interface ResearchRound {
  id: RoundId;
  segmentId: SegmentId;
  priority: "P0" | "P1" | "P2";
  targetCompletesPerCohort: number;
  objectiveIds: string[];
  incentiveUsd: { min: number; max: number };
  channels: string[];
  channelBiases: string[];
  autoContact: false;
}

export interface RecruitmentCandidate {
  id: string;
  community: string;
  whyRelevant: string;
  segmentIds: SegmentId[];
  source: string;
  publicContactMethod: string;
  confidence: "low" | "low_med" | "med" | "med_high" | "high";
  potentialBias: string;
  outreachApproach: string;
}

export const RESEARCH_ROUNDS: ResearchRound[] = [
  {
    id: "A",
    segmentId: "S1_families_6_11",
    priority: "P0",
    targetCompletesPerCohort: 4,
    objectiveIds: ["IH-1", "IH-2", "IH-3", "IH-8"],
    incentiveUsd: { min: 25, max: 40 },
    channels: ["r/Parenting", "r/daddit", "r/Mommit", "library programs", "PTA", "warm network"],
    channelBiases: [
      "Reddit: US tech-comfortable opinionated",
      "Library: geo-bound lower gaming affinity",
      "Warm network: social desirability — cap 25%",
    ],
    autoContact: false,
  },
  {
    id: "B",
    segmentId: "S2_homeschool",
    priority: "P0",
    targetCompletesPerCohort: 3,
    objectiveIds: ["IH-4"],
    incentiveUsd: { min: 30, max: 40 },
    channels: ["homeschool FB groups", "co-ops", "r/homeschool"],
    channelBiases: ["Deal-seeking WTP downward bias", "Secular vs religious mix needed"],
    autoContact: false,
  },
  {
    id: "C",
    segmentId: "S4_teachers",
    priority: "P1",
    targetCompletesPerCohort: 3,
    objectiveIds: ["IH-5"],
    incentiveUsd: { min: 40, max: 40 },
    channels: ["NGPF", "Jump$tart", "r/Teachers"],
    channelBiases: ["NGPF free-curriculum loyalty"],
    autoContact: false,
  },
  {
    id: "D",
    segmentId: "S3_youth_org_cu",
    priority: "P1",
    targetCompletesPerCohort: 3,
    objectiveIds: ["institutional_buy_path"],
    incentiveUsd: { min: 40, max: 40 },
    channels: ["Jump$tart state", "CU youth-ed pages", "after-school nonprofits"],
    channelBiases: ["Grant-cycle and brand-safe skew"],
    autoContact: false,
  },
  {
    id: "E",
    segmentId: "S5_teens",
    priority: "P2",
    targetCompletesPerCohort: 3,
    objectiveIds: ["IH-6"],
    incentiveUsd: { min: 50, max: 50 },
    channels: ["parent snowball", "teacher-gated clubs"],
    channelBiases: ["No cold DMs to minors", "high-achiever skew"],
    autoContact: false,
  },
  {
    id: "F",
    segmentId: "S7_solo_adults",
    priority: "P2",
    targetCompletesPerCohort: 3,
    objectiveIds: ["IH-7"],
    incentiveUsd: { min: 25, max: 25 },
    channels: ["r/personalfinance", "indie game Discords"],
    channelBiases: ["Spreadsheet mindset", "gamer aesthetic"],
    autoContact: false,
  },
  {
    id: "G",
    segmentId: "S6_grandparents",
    priority: "P2",
    targetCompletesPerCohort: 3,
    objectiveIds: ["gift_jtbd"],
    incentiveUsd: { min: 25, max: 25 },
    channels: ["library senior/family", "parent snowball"],
    channelBiases: ["Snowball mirrors parent taste"],
    autoContact: false,
  },
];

export const RECRUITMENT_CANDIDATES: RecruitmentCandidate[] = [
  {
    id: "reddit_parenting",
    community: "r/Parenting",
    whyRelevant: "Allowance and kids-money threads are common",
    segmentIds: ["S1_families_6_11"],
    source: "Reddit",
    publicContactMethod: "Mod-aware research post + screener link",
    confidence: "high",
    potentialBias: "US-heavy, online-native, strong allowance opinions",
    outreachApproach: "Human posts; no cold DMs; state incentive + privacy",
  },
  {
    id: "reddit_daddit",
    community: "r/daddit",
    whyRelevant: "Fathers discussing practical kid logistics",
    segmentIds: ["S1_families_6_11"],
    source: "Reddit",
    publicContactMethod: "Research post per subreddit rules",
    confidence: "med_high",
    potentialBias: "Dad-skew",
    outreachApproach: "Human post; soft tone",
  },
  {
    id: "library_family",
    community: "Local public library family programs",
    whyRelevant: "Caregivers in learning mode; socioeconomic mix",
    segmentIds: ["S1_families_6_11", "S6_grandparents"],
    source: "Local organization",
    publicContactMethod: "Program coordinator email on library site",
    confidence: "med",
    potentialBias: "Geography-bound; lower gaming affinity",
    outreachApproach: "Human asks to share flyer",
  },
  {
    id: "fb_secular_homeschool",
    community: "Secular Homeschool Families (Facebook)",
    whyRelevant: "Parents actively shopping life-skills content",
    segmentIds: ["S2_homeschool"],
    source: "Facebook group",
    publicContactMethod: "Admin-approved group post only",
    confidence: "med_high",
    potentialBias: "Secular curriculum shoppers",
    outreachApproach: "Request admin approval; screener link; no scraping",
  },
  {
    id: "ngpf_teachers",
    community: "Next Gen Personal Finance teacher community",
    whyRelevant: "Teachers already delivering personal finance",
    segmentIds: ["S4_teachers"],
    source: "ngpf.org",
    publicContactMethod: "Public PD / community norms on site",
    confidence: "high",
    potentialBias: "Loyal to free curriculum; skeptical of paid",
    outreachApproach: "Human recruit after A/B unlock; engagement framing",
  },
  {
    id: "jumpstart_coalition",
    community: "Jump$tart Coalition (national + state)",
    whyRelevant: "Fin-lit educators and institutional partners",
    segmentIds: ["S4_teachers", "S3_youth_org_cu"],
    source: "jumpstart.org / state affiliates",
    publicContactMethod: "Public org emails (e.g. info@jumpstart.org) / state contact pages",
    confidence: "med_high",
    potentialBias: "Institutional pace; partner politics",
    outreachApproach: "Human research invite — not product blast",
  },
  {
    id: "cu_youth_ed",
    community: "Credit union youth financial education programs",
    whyRelevant: "Program owners with possible seat budgets",
    segmentIds: ["S3_youth_org_cu"],
    source: "CU / foundation public sites",
    publicContactMethod: "Published community/contact emails",
    confidence: "med",
    potentialBias: "Brand-safe content preference",
    outreachApproach: "Human email to youth-ed role after unlock",
  },
  {
    id: "parent_teen_snowball",
    community: "Round A parents → teen pairs",
    whyRelevant: "Ethical path to teens; no cold minor contact",
    segmentIds: ["S5_teens"],
    source: "Prior cohort re-contact (parents only)",
    publicContactMethod: "Re-contact parents who opted into follow-ups",
    confidence: "med",
    potentialBias: "Capital-friendly families",
    outreachApproach: "Only after E unlock; guardian present",
  },
  {
    id: "reddit_pf",
    community: "r/personalfinance",
    whyRelevant: "Adults who try and abandon money tools",
    segmentIds: ["S7_solo_adults"],
    source: "Reddit",
    publicContactMethod: "Research post",
    confidence: "med",
    potentialBias: "Spreadsheet / FIRE mindset",
    outreachApproach: "Tone-falsifier framing after unlock",
  },
  {
    id: "warm_network",
    community: "Founder / team warm network",
    whyRelevant: "Fast trust for first sessions",
    segmentIds: ["S1_families_6_11", "S2_homeschool"],
    source: "Existing networks",
    publicContactMethod: "Personal human message",
    confidence: "high",
    potentialBias: "Social desirability — cap ≤25% of cohort",
    outreachApproach: "Quota-capped fills only",
  },
];

/** Fields forbidden in screener intake. */
export const FORBIDDEN_SCREENER_FIELDS = [
  "ssn",
  "government_id",
  "exact_street_address",
  "income",
  "bank_balance",
  "child_legal_name",
  "school_student_id",
  "precise_geolocation",
] as const;

export const ALLOWED_SCREENER_FIELDS = [
  "preferred_name_or_alias",
  "scheduling_contact",
  "timezone_coarse",
  "round_id",
  "screener_answers",
  "adult_age_band",
  "child_age_band",
  "consent",
] as const;

export interface StopGateState {
  status: GateStatus;
  activeCohort: string;
  agentContactsSent: number;
  nextCohortAutoStart: false;
}

export const INITIAL_STOP_GATE: StopGateState = {
  status: "A1_READY_TO_RECRUIT",
  activeCohort: "A1",
  agentContactsSent: 0,
  nextCohortAutoStart: false,
};

export function assertNoAutoContact(rounds = RESEARCH_ROUNDS): void {
  for (const r of rounds) {
    if (r.autoContact !== false) {
      throw new Error(`Round ${r.id} must set autoContact: false`);
    }
  }
}

export function p0Rounds(rounds = RESEARCH_ROUNDS): ResearchRound[] {
  return rounds.filter((r) => r.priority === "P0");
}

export function candidatesForSegment(
  segmentId: SegmentId,
  candidates = RECRUITMENT_CANDIDATES,
): RecruitmentCandidate[] {
  return candidates.filter((c) => c.segmentIds.includes(segmentId));
}

/**
 * After a cohort completes, gate locks. Next recruit requires human unlock.
 */
export function lockAfterCohort(completedCohortId: string): StopGateState {
  return {
    status: "LOCKED",
    activeCohort: completedCohortId,
    agentContactsSent: 0,
    nextCohortAutoStart: false,
  };
}

export function unlockNextCohort(
  nextCohortId: string,
  unlockedBy: string,
): StopGateState & { unlockedBy: string } {
  if (!unlockedBy.trim()) {
    throw new Error("Human reviewer id required to unlock");
  }
  return {
    status: "UNLOCKED",
    activeCohort: nextCohortId,
    agentContactsSent: 0,
    nextCohortAutoStart: false,
    unlockedBy,
  };
}
