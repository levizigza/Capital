/**
 * Founder Sales Copilot — prep, capture, classify, payment-link requests.
 * Does not replace the founder. Does not call Stripe. Does not auto-discount.
 */

export type SalesClass =
  | "NOT_ICP"
  | "RESEARCH_USER"
  | "QUALIFIED"
  | "PILOT_CANDIDATE"
  | "READY_TO_BUY"
  | "FOLLOW_UP"
  | "LOST";

export type PaymentMechanism =
  | "stripe_payment_link"
  | "stripe_checkout_manual"
  | "manual_invoice"
  | "in_app_billing";

/** Shipped scope the copilot may reference — never invent beyond this. */
export const DELIVERABLE_TRUTHS = [
  "Harbor hub with signature Cove → Paycheck → Credit spine",
  "Irreversible Cove Take → hush → Plinth spectacle → share PNG → Piggy homecoming",
  "Family Room is local-device share, not cloud multiplayer",
  "Adventure money practice — not debit/allowance rails",
  "Classroom class codes / full LMS are not sold as shipped",
  "No pay-to-win currency or paid skip of learning outcomes",
] as const;

export const FORBIDDEN_PROMISES: RegExp[] = [
  /we('ll| will) add multiplayer/i,
  /debit card/i,
  /guaranteed test scores/i,
  /class codes? (are|is) ready/i,
  /district.?wide rollout next week/i,
];

export interface ApprovedSku {
  skuId: string;
  name: string;
  amountCents: number;
  currency: string;
  includes: string;
  active: boolean;
}

/** Empty until founder locks amounts — copilot must not invent. */
export const APPROVED_SKUS: ApprovedSku[] = [];

export interface ApprovedDiscount {
  code: string;
  percentOff?: number;
  amountOffCents?: number;
  whenAllowed: string;
  expires?: string;
}

export const APPROVED_DISCOUNTS: ApprovedDiscount[] = [];

export interface PreCallPrep {
  prospect: string;
  segment: string;
  customerContext: string;
  likelyProblem: string;
  evidence: string[];
  questions: string[];
  possibleObjections: string[];
  pricingHypothesisNote: string;
  callGoal: "learn_only" | "qualify" | "propose_pilot" | "close_if_ready";
}

export interface PostCallCapture {
  problem: string;
  severity: string;
  urgency: string;
  desiredOutcome: string;
  existingSolution: string;
  decisionMaker: string;
  budgetSignals: string;
  objections: string[];
  nextStep: string;
  classification: SalesClass;
}

export interface StripePaymentLinkRequest {
  status: "REQUESTED" | "CREATED" | "SENT" | "PAID" | "CANCELLED";
  requestedAt: string;
  customerNameOrOrg: string;
  customerEmail: string;
  skuId: string;
  amountCents: number;
  currency: string;
  productDescription: string;
  quantity: number;
  allowPromotionCodes: false;
  stripePaymentLinkUrl: string | null;
  note: string;
}

export function assertNoForbiddenPromises(text: string): void {
  for (const re of FORBIDDEN_PROMISES) {
    if (re.test(text)) {
      throw new Error(`Forbidden undeliverable promise: /${re.source}/`);
    }
  }
}

export function assertSkuApproved(skuId: string, skus = APPROVED_SKUS): ApprovedSku {
  const sku = skus.find((s) => s.skuId === skuId && s.active);
  if (!sku) {
    throw new Error(
      `SKU ${skuId} is not on the founder-approved active list — do not invent pricing`,
    );
  }
  return sku;
}

export function assertDiscountAuthorized(
  code: string | null | undefined,
  discounts = APPROVED_DISCOUNTS,
): void {
  if (!code) return;
  const ok = discounts.some((d) => d.code === code);
  if (!ok) {
    throw new Error(`Unauthorized discount: ${code}`);
  }
}

/**
 * Payment mechanism priority when READY_TO_BUY.
 * Prefer Payment Link; never block on unfinished in-app billing.
 */
export function recommendPaymentMechanism(input: {
  classification: SalesClass;
  hasApprovedSku: boolean;
  inAppBillingReady: boolean;
  buyerRequiresInvoice: boolean;
}): PaymentMechanism | null {
  if (input.classification !== "READY_TO_BUY") return null;
  if (input.buyerRequiresInvoice) return "manual_invoice";
  if (input.hasApprovedSku) return "stripe_payment_link";
  if (input.inAppBillingReady) return "in_app_billing";
  return "stripe_checkout_manual";
}

export function createStripePaymentLinkRequest(input: {
  customerNameOrOrg: string;
  customerEmail: string;
  skuId: string;
  quantity?: number;
  productDescription?: string;
  requestedAt?: string;
  skus?: ApprovedSku[];
}): StripePaymentLinkRequest {
  const sku = assertSkuApproved(input.skuId, input.skus ?? APPROVED_SKUS);
  const description = input.productDescription ?? sku.includes;
  assertNoForbiddenPromises(description);
  return {
    status: "REQUESTED",
    requestedAt: input.requestedAt ?? new Date().toISOString(),
    customerNameOrOrg: input.customerNameOrOrg,
    customerEmail: input.customerEmail,
    skuId: sku.skuId,
    amountCents: sku.amountCents,
    currency: sku.currency,
    productDescription: description,
    quantity: input.quantity ?? 1,
    allowPromotionCodes: false,
    stripePaymentLinkUrl: null,
    note: "Founder creates link in Stripe Dashboard or CLI — copilot does not auto-create.",
  };
}

export function classifyAllowsClose(c: SalesClass): boolean {
  return c === "READY_TO_BUY";
}

export function isEarlyDiscoveryOnly(c: SalesClass): boolean {
  return c === "RESEARCH_USER" || c === "NOT_ICP";
}

/** Example prep for a known lead — founder edits before call. */
export const EXAMPLE_PRE_CALL_ROYAL_CU: PreCallPrep = {
  prospect: "Royal Credit Union — School $ense",
  segment: "S3",
  customerContext:
    "CU with ~30 student-run school sites; public 2024–25 kickoff; real student deposits",
  likelyProblem:
    "Need engaging money practice that complements hands-on teller experience without becoming worksheets",
  evidence: [
    "https://www.rcu.org/about-royal/news-events/news-stories/school-sense-kicks-off-2024-2025",
    "lead L04 score 81",
  ],
  questions: [
    "Walk me through what still feels hard for students after School $ense shifts.",
    "What have you already tried for engagement between branch days?",
    "Who decides on new educational tools and how is budget approved?",
    "What would a successful small pilot look like in 30 days?",
  ],
  possibleObjections: [
    "Need real accounts not games",
    "Privacy / student data",
    "Must fit existing School $ense brand",
  ],
  pricingHypothesisNote:
    "Org pilot — founder sets written scope; no SKU $ until approved table filled",
  callGoal: "qualify",
};
