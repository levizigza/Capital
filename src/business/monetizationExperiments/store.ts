/**
 * Monetization experiments — learn what customers pay for and why.
 * Does not maximize theoretical price. Does not deploy all models at once.
 */

export type PaymentStructure =
  | "founding_user"
  | "paid_pilot"
  | "one_time"
  | "monthly"
  | "annual"
  | "institutional_pilot";

export type RejectionReason =
  | "NO_NEED"
  | "LOW_TRUST"
  | "WRONG_CUSTOMER"
  | "WRONG_OFFER"
  | "PRICE_TOO_HIGH"
  | "UNCLEAR_VALUE"
  | "NO_URGENCY";

export type Conversion =
  | "paid"
  | "committed_pilot"
  | "declined"
  | "deferred";

export type ExperimentPhase = 0 | 1 | 2 | 3 | 4 | 5;

export interface OfferHypothesis {
  id: string;
  customer: string;
  problem: string;
  promisedOutcome: string;
  whatTheyReceive: string;
  timeToValue: string;
  /** Experimental hypothesis only — not official storefront price */
  priceHypothesis: string;
  paymentStructure: PaymentStructure;
  riskReduction: string;
  whyDifferent: string;
  deployPhase: ExperimentPhase;
  status: "next" | "queued" | "parked" | "active" | "completed" | "not_offered";
}

export interface OfferExposure {
  id: string;
  offerId: string;
  offerShown: boolean;
  segment: string;
  price: string;
  paymentStructure: PaymentStructure;
  conversion: Conversion;
  rejectionReason: RejectionReason | null;
  retention: string | null;
  refund: boolean;
  usageActivated: boolean;
  grossMarginEst: string | null;
  notes: string;
  /** Evidence required before PRICE_TOO_HIGH */
  priceTooHighEvidence?: {
    outcomeUnderstood: boolean;
    comparedAlternatives: boolean;
    affirmedNeedButAskedLower: boolean;
  };
}

export const OFFER_HYPOTHESES: OfferHypothesis[] = [
  {
    id: "OFFER_FOUNDING_FAMILY",
    customer: "S1 parent of child ~7–10, co-play willing",
    problem: "Hard to teach money choices without lectures or kid debit rails",
    promisedOutcome:
      "Child completes one irreversible money choice; family can retell what changed",
    whatTheyReceive:
      "Founding household license to Harbor+Cove spine; optional office hours; early-supporter opt-in",
    timeToValue: "≤1 session to Take → Harbor felt",
    priceHypothesis: "$29 one-time founding",
    paymentStructure: "founding_user",
    riskReduction: "14-day refund if Cove Take not reachable; no auto-renew",
    whyDifferent: "Adventure + felt consequence — not an allowance app",
    deployPhase: 1,
    status: "next",
  },
  {
    id: "OFFER_FAMILY_ONETIME",
    customer: "S1 families who dislike subscriptions",
    problem: "Money-teaching friction; hate recurring kids-app charges",
    promisedOutcome: "Own the shipped base adventure path",
    whatTheyReceive: "Perpetual base license; expansions separate later",
    timeToValue: "≤1 session",
    priceHypothesis: "$39–49 one-time",
    paymentStructure: "one_time",
    riskReduction: "7–14 day refund; clear inclusions list",
    whyDifferent: "Premium base without pay-to-win learning skips",
    deployPhase: 2,
    status: "queued",
  },
  {
    id: "OFFER_FAMILY_ANNUAL",
    customer: "S1/S2 households wanting ongoing access",
    problem: "Need returnable practice over a year",
    promisedOutcome: "12 months access to base + spine updates",
    whatTheyReceive: "Annual access; shipped updates",
    timeToValue: "≤1 session",
    priceHypothesis: "$36–60 / year",
    paymentStructure: "annual",
    riskReduction: "14-day refund; no multi-year lock",
    whyDifferent: "Continuity for day-2 / next islands without selling power",
    deployPhase: 2,
    status: "queued",
  },
  {
    id: "OFFER_FAMILY_MONTHLY",
    customer: "Cashflow-sensitive S1",
    problem: "Same problem; can’t float annual",
    promisedOutcome: "Month-to-month access to base adventure",
    whatTheyReceive: "Monthly access; same shipped scope",
    timeToValue: "≤1 session",
    priceHypothesis: "$5–8 / month",
    paymentStructure: "monthly",
    riskReduction: "Cancel anytime",
    whyDifferent: "Lower entry cash — only if evidence demands",
    deployPhase: 4,
    status: "parked",
  },
  {
    id: "OFFER_CU_PAID_PILOT",
    customer: "CU youth-ed / library program buyer",
    problem: "Engagement beyond worksheets for youth money programs",
    promisedOutcome: "N sessions complete signature loop + written learnings",
    whatTheyReceive: "Time-boxed licenses; kickoff; summary; no custom LMS",
    timeToValue: "First session within 2 weeks",
    priceHypothesis: "$500–2,500 fixed pilot",
    paymentStructure: "paid_pilot",
    deployPhase: 3,
    status: "queued",
    riskReduction: "Written success criteria; scope cap",
    whyDifferent: "Complements branch/account programs",
  },
  {
    id: "OFFER_HOMESCHOOL_UNIT",
    customer: "Homeschool parent planning a money unit",
    problem: "Need a finishable money/life-skills unit",
    promisedOutcome: "Completable adventure unit with retellable choice",
    whatTheyReceive: "Base game + lightweight unit checklist wrap",
    timeToValue: "1–3 sessions",
    priceHypothesis: "$29–45 one-time",
    paymentStructure: "one_time",
    riskReduction: "Refund if checklist not completable in 14 days",
    whyDifferent: "Playable unit vs workbook-only",
    deployPhase: 2,
    status: "queued",
  },
];

export const REJECTION_REASONS: RejectionReason[] = [
  "NO_NEED",
  "LOW_TRUST",
  "WRONG_CUSTOMER",
  "WRONG_OFFER",
  "PRICE_TOO_HIGH",
  "UNCLEAR_VALUE",
  "NO_URGENCY",
];

/** In-memory exposure log — start empty. */
export const EXPOSURE_LOG: OfferExposure[] = [];

export function offersForPhase(phase: ExperimentPhase): OfferHypothesis[] {
  return OFFER_HYPOTHESES.filter((o) => o.deployPhase === phase);
}

export function activeConsumerOfferIds(offers = OFFER_HYPOTHESES): string[] {
  return offers.filter((o) => o.status === "active" || o.status === "next").map((o) => o.id);
}

/**
 * Enforce: do not run founding + annual (or multiple consumer paid structures) as active together.
 */
export function assertSingleConsumerPriceTest(activeIds: string[]): void {
  const consumer = OFFER_HYPOTHESES.filter(
    (o) =>
      activeIds.includes(o.id) &&
      (o.paymentStructure === "founding_user" ||
        o.paymentStructure === "one_time" ||
        o.paymentStructure === "monthly" ||
        o.paymentStructure === "annual"),
  );
  if (consumer.length > 1) {
    throw new Error(
      `Multiple consumer offers active: ${consumer.map((c) => c.id).join(", ")} — confounds price learning`,
    );
  }
}

export function canCodePriceTooHigh(evidence: {
  outcomeUnderstood: boolean;
  comparedAlternatives: boolean;
  affirmedNeedButAskedLower: boolean;
}): boolean {
  return (
    (evidence.outcomeUnderstood && evidence.affirmedNeedButAskedLower) ||
    (evidence.outcomeUnderstood && evidence.comparedAlternatives)
  );
}

export function assignRejectionReason(
  conversion: Conversion,
  proposed: RejectionReason | null,
  evidence?: OfferExposure["priceTooHighEvidence"],
): RejectionReason | null {
  if (conversion === "paid" || conversion === "committed_pilot") return null;
  if (conversion === "deferred") return proposed ?? "NO_URGENCY";
  if (!proposed) {
    throw new Error("Declined exposures require a rejection_reason");
  }
  if (proposed === "PRICE_TOO_HIGH") {
    if (!evidence || !canCodePriceTooHigh(evidence)) {
      throw new Error(
        "PRICE_TOO_HIGH requires evidence (understood value + alternatives or ask-lower with need) — a bare no is not enough",
      );
    }
  }
  return proposed;
}

export function logExposure(
  exposure: OfferExposure,
  log: OfferExposure[] = EXPOSURE_LOG,
): OfferExposure[] {
  if (exposure.conversion === "declined" || exposure.conversion === "deferred") {
    exposure.rejectionReason = assignRejectionReason(
      exposure.conversion,
      exposure.rejectionReason,
      exposure.priceTooHighEvidence,
    );
  }
  log.push(exposure);
  return log;
}

export function rejectionBreakdown(log: OfferExposure[] = EXPOSURE_LOG): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of log) {
    if (!e.rejectionReason) continue;
    out[e.rejectionReason] = (out[e.rejectionReason] ?? 0) + 1;
  }
  return out;
}

export function nextOfferToRun(offers = OFFER_HYPOTHESES): OfferHypothesis {
  const next = offers.find((o) => o.status === "next");
  if (!next) throw new Error("No offer marked next");
  return next;
}
