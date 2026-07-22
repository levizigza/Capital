/**
 * Voyager Ledger — Cashflow-inspired personal finance engine.
 *
 * Win the grind by improving monthly net cashflow (income − expenses),
 * not by pouch coins alone. Original Capital IP — pedagogy remix only.
 */

export type LedgerHoldingKind = "asset" | "liability";

export type LedgerHolding = {
  id: string;
  name: string;
  kind: LedgerHoldingKind;
  /** Monthly cashflow impact: + for assets, stored as positive magnitude for liabilities */
  monthlyAmount: number;
  icon: string;
  /** One-time pouch cost to acquire (assets / deals) */
  purchaseCost?: number;
};

/** Harbor escape: sustain strong cashflow for several Pay Days in a row */
export const HARBOR_ESCAPE_TARGET = 30;
export const HARBOR_ESCAPE_STREAK = 2;

export type DealOffer = LedgerHolding & { purchaseCost: number };

export type LedgerEvent = {
  id: string;
  ts: string;
  text: string;
  /** Change to coin pouch, if any */
  coinDelta?: number;
  /** Change to reported monthly cashflow, if any */
  cashflowDelta?: number;
};

export type VoyagerLedger = {
  /** Job / paycheck income per month */
  salaryIncome: number;
  /** Baseline living costs per month (needs) */
  livingExpenses: number;
  holdings: LedgerHolding[];
  recentEvents: LedgerEvent[];
  /** Mastery gate ids cleared (all-correct quizzes) */
  masteryClears: string[];
  /** Consecutive Pay Days at/above escape target */
  positivePaydayStreak: number;
  /** True once Harbor Grind escape condition is met */
  harborEscaped: boolean;
};

export function createDefaultVoyagerLedger(): VoyagerLedger {
  return {
    salaryIncome: 40,
    livingExpenses: 25,
    holdings: [],
    recentEvents: [
      {
        id: "boot",
        ts: new Date().toISOString(),
        text: "Harbor Grind begins — grow cashflow to escape paycheck-to-paycheck.",
      },
    ],
    masteryClears: [],
    positivePaydayStreak: 0,
    harborEscaped: false,
  };
}

export function ensureLedger(raw?: VoyagerLedger | null): VoyagerLedger {
  if (!raw) return createDefaultVoyagerLedger();
  return {
    ...createDefaultVoyagerLedger(),
    ...raw,
    holdings: raw.holdings ?? [],
    recentEvents: raw.recentEvents ?? [],
    masteryClears: raw.masteryClears ?? [],
    positivePaydayStreak: raw.positivePaydayStreak ?? 0,
    harborEscaped: raw.harborEscaped ?? false,
  };
}

export function isHarborEscaped(ledger: VoyagerLedger): boolean {
  return ledger.harborEscaped;
}

export function harborEscapeProgress(ledger: VoyagerLedger): {
  target: number;
  streak: number;
  needed: number;
  cashflow: number;
  escaped: boolean;
} {
  const cashflow = netCashflow(ledger);
  return {
    target: HARBOR_ESCAPE_TARGET,
    streak: ledger.positivePaydayStreak,
    needed: HARBOR_ESCAPE_STREAK,
    cashflow,
    escaped: ledger.harborEscaped,
  };
}

export function dealPurchaseCost(holding: LedgerHolding): number {
  if (holding.purchaseCost != null) return holding.purchaseCost;
  if (holding.kind === "liability") return 0;
  return Math.max(15, holding.monthlyAmount * 4);
}

export function assetIncome(ledger: VoyagerLedger): number {
  return ledger.holdings
    .filter((h) => h.kind === "asset")
    .reduce((sum, h) => sum + h.monthlyAmount, 0);
}

export function liabilityExpenses(ledger: VoyagerLedger): number {
  return ledger.holdings
    .filter((h) => h.kind === "liability")
    .reduce((sum, h) => sum + h.monthlyAmount, 0);
}

export function totalIncome(ledger: VoyagerLedger): number {
  return ledger.salaryIncome + assetIncome(ledger);
}

export function totalExpenses(ledger: VoyagerLedger): number {
  return ledger.livingExpenses + liabilityExpenses(ledger);
}

/** The Cashflow north star: money left each month after expenses. */
export function netCashflow(ledger: VoyagerLedger): number {
  return totalIncome(ledger) - totalExpenses(ledger);
}

export function hasMasteryClear(ledger: VoyagerLedger, gateId: string): boolean {
  return ledger.masteryClears.includes(gateId);
}

function pushEvent(ledger: VoyagerLedger, text: string, extra?: Partial<LedgerEvent>): VoyagerLedger {
  const event: LedgerEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(),
    text,
    ...extra,
  };
  return {
    ...ledger,
    recentEvents: [event, ...ledger.recentEvents].slice(0, 12),
  };
}

export function markMasteryClear(ledger: VoyagerLedger, gateId: string): VoyagerLedger {
  if (ledger.masteryClears.includes(gateId)) return ledger;
  return pushEvent(
    {
      ...ledger,
      masteryClears: [...ledger.masteryClears, gateId],
    },
    `Mastery cleared: ${gateId.replace(/_/g, " ")} — all quiz answers correct.`,
  );
}

export function addHolding(ledger: VoyagerLedger, holding: LedgerHolding): VoyagerLedger {
  if (ledger.holdings.some((h) => h.id === holding.id)) return ledger;
  const next = { ...ledger, holdings: [...ledger.holdings, holding] };
  const sign = holding.kind === "asset" ? "+" : "−";
  return pushEvent(
    next,
    `${holding.kind === "asset" ? "Asset" : "Liability"}: ${holding.name} (${sign}$${holding.monthlyAmount}/mo)`,
    { cashflowDelta: holding.kind === "asset" ? holding.monthlyAmount : -holding.monthlyAmount },
  );
}

export function raiseSalary(ledger: VoyagerLedger, amount: number, reason: string): VoyagerLedger {
  const next = { ...ledger, salaryIncome: ledger.salaryIncome + amount };
  return pushEvent(next, reason, { cashflowDelta: amount });
}

export function raiseLivingExpenses(ledger: VoyagerLedger, amount: number, reason: string): VoyagerLedger {
  const next = { ...ledger, livingExpenses: ledger.livingExpenses + amount };
  return pushEvent(next, reason, { cashflowDelta: -amount });
}

/**
 * Apply one month of cashflow to the coin pouch.
 * Boom/recession multipliers can scale the payout.
 */
export function applyPayday(
  ledger: VoyagerLedger,
  incomeMultiplier = 1,
  opts?: { trackHarborEscape?: boolean },
): { ledger: VoyagerLedger; coins: number; escapedNow?: boolean } {
  const trackEscape = opts?.trackHarborEscape ?? false;
  const raw = netCashflow(ledger);
  const coins = Math.round(raw * incomeMultiplier);
  const qualifies = raw >= HARBOR_ESCAPE_TARGET;
  const streak = trackEscape
    ? qualifies
      ? ledger.positivePaydayStreak + 1
      : 0
    : ledger.positivePaydayStreak;

  let next: VoyagerLedger = trackEscape
    ? { ...ledger, positivePaydayStreak: streak }
    : { ...ledger };

  next = pushEvent(
    next,
    coins >= 0
      ? `Pay Day: monthly cashflow credited (+${coins} coins).`
      : `Pay Day shortfall: expenses exceeded income (${coins} coins).`,
    { coinDelta: coins, cashflowDelta: 0 },
  );

  let escapedNow = false;
  if (trackEscape && !next.harborEscaped && streak >= HARBOR_ESCAPE_STREAK) {
    escapedNow = true;
    next = {
      ...pushEvent(
        next,
        `Harbor escape! Cashflow stayed at $${HARBOR_ESCAPE_TARGET}+/mo for ${HARBOR_ESCAPE_STREAK} Pay Days — you’re free of paycheck-to-paycheck.`,
      ),
      harborEscaped: true,
    };
  } else if (trackEscape && !next.harborEscaped && qualifies) {
    next = pushEvent(
      next,
      `Escape streak ${streak}/${HARBOR_ESCAPE_STREAK} — keep cashflow at $${HARBOR_ESCAPE_TARGET}+/mo.`,
    );
  }

  return { ledger: next, coins, escapedNow };
}

export function applyBill(
  ledger: VoyagerLedger,
  amount: number,
  label: string,
): { ledger: VoyagerLedger; coins: number } {
  const coins = -Math.abs(amount);
  return {
    coins,
    ledger: pushEvent(ledger, `Bill due: ${label} (${coins} coins).`, { coinDelta: coins }),
  };
}

/** Starter deal cards for Harbor Grind */
export const HARBOR_DEALS: LedgerHolding[] = [
  {
    id: "asset_shell_booth",
    name: "Shell Craft Booth",
    kind: "asset",
    monthlyAmount: 10,
    icon: "🐚",
    purchaseCost: 40,
  },
  {
    id: "asset_savings_jar",
    name: "Interest Jar",
    kind: "asset",
    monthlyAmount: 5,
    icon: "🫙",
    purchaseCost: 20,
  },
  {
    id: "asset_lemonade_stand",
    name: "Lemonade Stand",
    kind: "asset",
    monthlyAmount: 12,
    icon: "🍋",
    purchaseCost: 48,
  },
  {
    id: "liability_snack_tab",
    name: "Snack Tab",
    kind: "liability",
    monthlyAmount: 8,
    icon: "🍬",
  },
  {
    id: "liability_gadget_loan",
    name: "Gadget Loan",
    kind: "liability",
    monthlyAmount: 12,
    icon: "📱",
  },
];

export function acceptDeal(
  ledger: VoyagerLedger,
  offer: DealOffer,
): { ledger: VoyagerLedger; coins: number } {
  return {
    coins: -Math.abs(offer.purchaseCost),
    ledger: addHolding(ledger, {
      id: offer.id,
      name: offer.name,
      kind: offer.kind,
      monthlyAmount: offer.monthlyAmount,
      icon: offer.icon,
      purchaseCost: offer.purchaseCost,
    }),
  };
}

export function pickRandomDeal(excludeIds: string[] = []): LedgerHolding {
  const pool = HARBOR_DEALS.filter((d) => !excludeIds.includes(d.id));
  const use = pool.length > 0 ? pool : HARBOR_DEALS;
  return use[Math.floor(Math.random() * use.length)]!;
}
