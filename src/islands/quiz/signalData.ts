import type { InsightPayload } from "./InsightCard";

export type SignalCategory = "trust" | "trap" | "watch";

export type LivingSignal = {
  id: string;
  label: string;
  emoji: string;
  category: SignalCategory;
  /** Tuning target 0–100 */
  frequency: number;
  insight: InsightPayload;
  consequenceGood: { label: string; amount: number; emoji: string }[];
  consequenceBad: { label: string; amount: number; emoji: string }[];
};

export const LIVING_SIGNALS: LivingSignal[] = [
  {
    id: "util",
    label: "Credit card 85% full",
    emoji: "💳",
    category: "trap",
    frequency: 72,
    insight: {
      headline: "Utilization is a credit score lever",
      story: "Lenders see a maxed-out card as stress — even if you pay on time.",
      systemLesson:
        "Credit scores are algorithms. Utilization (balance ÷ limit) is ~30% of FICO. Under 30% — ideally under 10% — signals control.",
      realWorld: "Paying down before the statement date can lower reported utilization.",
    },
    consequenceGood: [
      { label: "Score stability", amount: 18, emoji: "📈" },
      { label: "Better loan rates", amount: 12, emoji: "🏦" },
    ],
    consequenceBad: [
      { label: "Score drop", amount: -25, emoji: "📉" },
      { label: "Higher APR offers", amount: -15, emoji: "💸" },
    ],
  },
  {
    id: "etf",
    label: "Diversified index fund",
    emoji: "📊",
    category: "trust",
    frequency: 45,
    insight: {
      headline: "Diversification is free lunch-ish",
      story: "One company can fail. Thousands bundled together smooth the ride.",
      systemLesson:
        "Markets pay risk premiums, but concentration risk is optional. Index ETFs spread ownership across the economy — you bet on growth, not one CEO.",
      realWorld: "Broad ETFs like total-market funds hold thousands of stocks for tiny fees.",
    },
    consequenceGood: [
      { label: "Smoother ride", amount: 14, emoji: "🛡️" },
      { label: "Lower fees", amount: 10, emoji: "🪙" },
    ],
    consequenceBad: [
      { label: "Single-stock wipeout", amount: -40, emoji: "💥" },
    ],
  },
  {
    id: "payday",
    label: "400% APR payday loan",
    emoji: "⚠️",
    category: "trap",
    frequency: 88,
    insight: {
      headline: "Predatory math hides in plain sight",
      story: "Quick cash feels like rescue — until the fee spiral starts.",
      systemLesson:
        "APR annualizes cost. Triple-digit APR means the system is designed to trap borrowers in rollovers. Regulators flag these products for a reason.",
      realWorld: "Credit unions and employer advances often offer safer emergency options.",
    },
    consequenceGood: [
      { label: "Avoided debt trap", amount: 30, emoji: "🛟" },
    ],
    consequenceBad: [
      { label: "Rollover fees", amount: -35, emoji: "🌀" },
      { label: "Credit damage", amount: -20, emoji: "💔" },
    ],
  },
  {
    id: "on_time",
    label: "12-month on-time payments",
    emoji: "✅",
    category: "trust",
    frequency: 33,
    insight: {
      headline: "Payment history is king",
      story: "Every on-time payment whispers: 'this person keeps promises.'",
      systemLesson:
        "Credit bureaus log payment history for years. The system rewards consistency more than occasional hero payments.",
    },
    consequenceGood: [
      { label: "Trust score", amount: 22, emoji: "👑" },
      { label: "Unlock better cards", amount: 10, emoji: "🔓" },
    ],
    consequenceBad: [
      { label: "One missed = scar", amount: -30, emoji: "🩹" },
    ],
  },
  {
    id: "bond_yield",
    label: "Bond yields climbing",
    emoji: "🏛️",
    category: "watch",
    frequency: 58,
    insight: {
      headline: "Bonds and rates dance together",
      story: "When yields rise, old bond prices fall — but new bonds pay more.",
      systemLesson:
        "Fixed income prices move inverse to yields. Savers may win while existing bondholders mark losses. It's timing and role in the portfolio.",
    },
    consequenceGood: [
      { label: "Safer income", amount: 8, emoji: "🛡️" },
    ],
    consequenceBad: [
      { label: "Missed stock rally", amount: -12, emoji: "📈" },
    ],
  },
];

export const CATEGORY_ZONES: Record<
  SignalCategory,
  { label: string; emoji: string; color: string }
> = {
  trust: { label: "TRUST", emoji: "✅", color: "border-emerald-400 bg-emerald-950/50" },
  trap: { label: "TRAP", emoji: "☠️", color: "border-red-400 bg-red-950/50" },
  watch: { label: "WATCH", emoji: "👁️", color: "border-amber-400 bg-amber-950/50" },
};
