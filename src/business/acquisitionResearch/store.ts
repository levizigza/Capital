/**
 * Customer acquisition research — where ICP already spends attention.
 * No paid-first recommendations. No scale without arrive→activate→retain→WTP.
 */

export type ChannelClass =
  | "MANUAL_EARLY"
  | "ORGANIC_SCALABLE"
  | "PAID_SCALABLE"
  | "PARTNERSHIP"
  | "REFERRAL"
  | "PRODUCT_LED";

export type IcpFocus = "S1" | "S2" | "S3" | "S4" | "mixed";

export type Level = "low" | "low_med" | "med" | "med_high" | "high";

export interface ChannelEstimate {
  id: string;
  name: string;
  icp: IcpFocus[];
  class: ChannelClass;
  concentration: Level;
  intent: Level;
  trustRequirement: Level;
  cost: Level;
  timeToTraction: Level;
  manualTestable: boolean;
  scalable: Level;
  competitiveSaturation: Level;
  notes: string;
  /** If true, must not be in first-learning set */
  paidFirstForbidden: boolean;
}

export interface LearningExperiment {
  id: "A" | "B" | "C";
  channelIds: string[];
  name: string;
  icp: IcpFocus;
  channelClass: ChannelClass;
  budgetNote: string;
  durationDays: number;
  successLearning: string;
  scaleAllowed: false;
}

export interface ScaleGate {
  arrive: boolean;
  activate: boolean;
  retain: boolean;
  willingnessToPay: boolean;
}

export function canScale(gate: ScaleGate): boolean {
  return gate.arrive && gate.activate && gate.retain && gate.willingnessToPay;
}

export const CHANNELS: ChannelEstimate[] = [
  {
    id: "reddit_parents",
    name: "r/Parenting · r/AskParents · r/daddit · r/Mommit",
    icp: ["S1"],
    class: "MANUAL_EARLY",
    concentration: "med",
    intent: "med",
    trustRequirement: "high",
    cost: "low",
    timeToTraction: "low",
    manualTestable: true,
    scalable: "low_med",
    competitiveSaturation: "med",
    notes: "Research posts; mod rules; allowance thread spikes",
    paidFirstForbidden: false,
  },
  {
    id: "fb_parent_groups",
    name: "Facebook parenting / allowance groups",
    icp: ["S1"],
    class: "MANUAL_EARLY",
    concentration: "high",
    intent: "med",
    trustRequirement: "high",
    cost: "low",
    timeToTraction: "low",
    manualTestable: true,
    scalable: "med",
    competitiveSaturation: "high",
    notes: "Admin approval required; spam-sensitive",
    paidFirstForbidden: false,
  },
  {
    id: "library_cu_family",
    name: "Libraries & CU Youth Month family programs",
    icp: ["S1"],
    class: "PARTNERSHIP",
    concentration: "high",
    intent: "med_high",
    trustRequirement: "high",
    cost: "low",
    timeToTraction: "med",
    manualTestable: true,
    scalable: "low",
    competitiveSaturation: "low",
    notes: "Money Smart Week / Youth Month seasonality",
    paidFirstForbidden: false,
  },
  {
    id: "homeschool_fb",
    name: "Homeschool Facebook curriculum groups",
    icp: ["S2"],
    class: "MANUAL_EARLY",
    concentration: "high",
    intent: "high",
    trustRequirement: "high",
    cost: "low",
    timeToTraction: "low",
    manualTestable: true,
    scalable: "med",
    competitiveSaturation: "med",
    notes: "Deal-seeking bias on WTP",
    paidFirstForbidden: false,
  },
  {
    id: "ghc_conventions",
    name: "Great Homeschool Conventions / regional expos",
    icp: ["S2"],
    class: "PARTNERSHIP",
    concentration: "high",
    intent: "high",
    trustRequirement: "med_high",
    cost: "med",
    timeToTraction: "med",
    manualTestable: true,
    scalable: "med",
    competitiveSaturation: "med",
    notes: "Research pass before full booth",
    paidFirstForbidden: false,
  },
  {
    id: "search_teach_kids_money",
    name: "Search: teach kids money / allowance alternatives",
    icp: ["S1", "S2"],
    class: "ORGANIC_SCALABLE",
    concentration: "med_high",
    intent: "high",
    trustRequirement: "med",
    cost: "med",
    timeToTraction: "high",
    manualTestable: true,
    scalable: "high",
    competitiveSaturation: "high",
    notes: "Interview searchers first; paid search later",
    paidFirstForbidden: false,
  },
  {
    id: "tiktok_kids_money",
    name: "TikTok / Reels teach-kids-money niche",
    icp: ["S1"],
    class: "ORGANIC_SCALABLE",
    concentration: "med",
    intent: "med",
    trustRequirement: "med",
    cost: "med",
    timeToTraction: "med",
    manualTestable: true,
    scalable: "high",
    competitiveSaturation: "high",
    notes: "Organic only early",
    paidFirstForbidden: false,
  },
  {
    id: "youtube_allowance",
    name: "YouTube allowance / kid money creators",
    icp: ["S1"],
    class: "PARTNERSHIP",
    concentration: "med",
    intent: "med_high",
    trustRequirement: "high",
    cost: "med",
    timeToTraction: "high",
    manualTestable: false,
    scalable: "med",
    competitiveSaturation: "med",
    notes: "Collab path",
    paidFirstForbidden: false,
  },
  {
    id: "podcasts_smart_money_parenting",
    name: "Smart-money / allowance parenting podcasts",
    icp: ["S1"],
    class: "PARTNERSHIP",
    concentration: "med",
    intent: "high",
    trustRequirement: "high",
    cost: "low",
    timeToTraction: "high",
    manualTestable: true,
    scalable: "low",
    competitiveSaturation: "low_med",
    notes: "Guest pitch",
    paidFirstForbidden: false,
  },
  {
    id: "share_png_plinth",
    name: "Product-led Harbor share PNG / Plinth card",
    icp: ["S1", "S2"],
    class: "PRODUCT_LED",
    concentration: "med",
    intent: "high",
    trustRequirement: "low",
    cost: "low",
    timeToTraction: "low",
    manualTestable: true,
    scalable: "high",
    competitiveSaturation: "low",
    notes: "Requires activation first",
    paidFirstForbidden: false,
  },
  {
    id: "warm_referral",
    name: "Warm network & parent referrals",
    icp: ["S1", "S2"],
    class: "REFERRAL",
    concentration: "high",
    intent: "med",
    trustRequirement: "low",
    cost: "low",
    timeToTraction: "low",
    manualTestable: true,
    scalable: "low",
    competitiveSaturation: "low",
    notes: "Cap ≤25% of research cohorts",
    paidFirstForbidden: false,
  },
  {
    id: "paid_social",
    name: "Paid social / UAC",
    icp: ["S1", "S2"],
    class: "PAID_SCALABLE",
    concentration: "low_med",
    intent: "low_med",
    trustRequirement: "low",
    cost: "high",
    timeToTraction: "low",
    manualTestable: true,
    scalable: "high",
    competitiveSaturation: "high",
    notes: "Do not begin here",
    paidFirstForbidden: true,
  },
  {
    id: "ngpf_jumpstart",
    name: "NGPF / Jump$tart educator networks",
    icp: ["S4"],
    class: "PARTNERSHIP",
    concentration: "high",
    intent: "med",
    trustRequirement: "high",
    cost: "low",
    timeToTraction: "med",
    manualTestable: true,
    scalable: "med",
    competitiveSaturation: "med",
    notes: "Adjacent ICP; free-curriculum dynamics",
    paidFirstForbidden: false,
  },
];

/** Cheapest three channels for meaningful learning first. */
export const FIRST_LEARNING_EXPERIMENTS: LearningExperiment[] = [
  {
    id: "A",
    channelIds: ["reddit_parents"],
    name: "Reddit research posts → screener → interviews",
    icp: "S1",
    channelClass: "MANUAL_EARLY",
    budgetNote: "$0 media + interview incentives",
    durationDays: 14,
    successLearning: "≥8 screener passes or ≥4 interviews filed",
    scaleAllowed: false,
  },
  {
    id: "B",
    channelIds: ["library_cu_family"],
    name: "Library or CU family program partnership ask",
    icp: "S1",
    channelClass: "PARTNERSHIP",
    budgetNote: "$0–50 flyers + incentives",
    durationDays: 21,
    successLearning: "≥1 org shares invite and ≥3 parent conversations",
    scaleAllowed: false,
  },
  {
    id: "C",
    channelIds: ["homeschool_fb", "ghc_conventions"],
    name: "Homeschool FB research posts ± GHC research pass",
    icp: "S2",
    channelClass: "MANUAL_EARLY",
    budgetNote: "$0 posts; optional low-cost event pass",
    durationDays: 28,
    successLearning: "≥3 S2 interviews with spend + desired outcome filled",
    scaleAllowed: false,
  },
];

export function firstLearningChannelIds(): string[] {
  return [...new Set(FIRST_LEARNING_EXPERIMENTS.flatMap((e) => e.channelIds))];
}

export function assertNoPaidInFirstLearning(
  experiments = FIRST_LEARNING_EXPERIMENTS,
  channels = CHANNELS,
): void {
  const byId = new Map(channels.map((c) => [c.id, c]));
  for (const exp of experiments) {
    if (exp.scaleAllowed !== false) {
      throw new Error(`${exp.id} must set scaleAllowed: false`);
    }
    for (const id of exp.channelIds) {
      const ch = byId.get(id);
      if (!ch) throw new Error(`Unknown channel ${id}`);
      if (ch.class === "PAID_SCALABLE" || ch.paidFirstForbidden) {
        throw new Error(`Paid/first-forbidden channel in learning set: ${id}`);
      }
      if (ch.cost === "high") {
        throw new Error(`High-cost channel in cheapest learning set: ${id}`);
      }
    }
  }
}

export function channelsByClass(
  cls: ChannelClass,
  channels = CHANNELS,
): ChannelEstimate[] {
  return channels.filter((c) => c.class === cls);
}
