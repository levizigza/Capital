/**
 * Multiplicative system interactions — A→B→C→A chains without new features.
 * Canon: SYSTEM_INTERACTION_MATRIX.md
 *
 * Three strongest:
 * 1. Organ scar → Pay Day stain → weather → Soft Beat invitation
 * 2. Stance → deal bias → cashflow → weather → Talk
 * 3. Day-2 echo → weather law → Soft Beat / Piggy → next Take pressure
 */

import type { MoneyOrganId } from "./moneyOrgans";
import { organVerbChip } from "./worldMemory";
import type { VoyagerStance } from "./worldMemory";
import { dominantStance } from "./worldMemory";
import type { HarborWeatherMood } from "./harborWeather";
import { day2WeatherLaw, moodFromCashflow, paydayIncomeMultiplier } from "./harborWeather";
import type { DealOffer } from "./voyagerLedger";

export type InteractionChainId = "organ_payday" | "stance_deal" | "day2_weather";

export type ChainStep = {
  system: string;
  effect: string;
};

export type InteractionChainResult = {
  id: InteractionChainId;
  title: string;
  steps: ChainStep[];
  /** Feedback into the first system */
  feedback: string;
  /** Strategy the player can now use */
  strategy: string;
  /** Derived stocks for the prototype HUD */
  weather: HarborWeatherMood;
  paydayMult: number;
  cashflowDelta: number;
  pouchHint: string;
};

/** Chain 1 — organ plaque stains Pay Day (mild). */
export function organPaydayStain(organ: MoneyOrganId): number {
  // Coin holds → slight jar interest; Clock shelters → slight expense ease;
  // Spiral withstands → slight sting until Soft Beat.
  if (organ === "coin") return 1.08;
  if (organ === "clock") return 1.05;
  if (organ === "spiral") return 0.92;
  return 1;
}

/** Compose weather Pay Day mult with organ stain — multiplicative, not additive feature. */
export function composePaydayMultiplier(opts: {
  weatherMood: HarborWeatherMood;
  organStain?: MoneyOrganId | null;
}): number {
  const weather = paydayIncomeMultiplier(opts.weatherMood);
  const organ = opts.organStain ? organPaydayStain(opts.organStain) : 1;
  return Math.round(weather * organ * 1000) / 1000;
}

export function resolveOrganPaydayChain(opts: {
  organ: MoneyOrganId;
  cashflow: number;
  hasteScar?: boolean;
}): InteractionChainResult {
  const weather = moodFromCashflow(opts.cashflow, opts.hasteScar);
  const paydayMult = composePaydayMultiplier({
    weatherMood: weather,
    organStain: opts.organ,
  });
  const verb = organVerbChip(opts.organ);
  return {
    id: "organ_payday",
    title: "Organ → Pay Day → Weather → Soft Beat",
    steps: [
      {
        system: "Take / Plinth",
        effect: `Plaque organ is ${verb} — Harbor still listens.`,
      },
      {
        system: "Ledger Pay Day",
        effect: `Pay Day mult ×${paydayMult} (weather × organ stain).`,
      },
      {
        system: "Harbor weather",
        effect: `Sky mood: ${weather} — shops follow the same fiction.`,
      },
      {
        system: "Soft Beat",
        effect: `Lookout invites a peek at how ${verb} weighs today.`,
      },
    ],
    feedback: "Next Take is made under weather you earned — Soft Beat shows the weight first.",
    strategy: "Choose organ Takes knowing they tint Harbor grind — not only Memory cinema.",
    weather,
    paydayMult,
    cashflowDelta: 0,
    pouchHint: `Next Pay Day scales by ×${paydayMult}`,
  };
}

/** Chain 2 — stance reorders deal desirability (no new SKUs). */
export function biasDealsForStance<T extends Pick<DealOffer, "id" | "kind" | "name">>(
  deals: readonly T[],
  stance?: VoyagerStance | null,
): T[] {
  const dom = dominantStance(stance);
  const score = (d: T): number => {
    const name = d.name.toLowerCase();
    const isAsset = d.kind === "asset";
    if (dom === "saver") {
      if (isAsset && (name.includes("jar") || name.includes("interest"))) return 3;
      if (isAsset) return 2;
      return 0;
    }
    if (dom === "spender") {
      if (!isAsset) return 1;
      if (name.includes("booth") || name.includes("lemonade")) return 3;
      return 2;
    }
    if (dom === "risk") {
      if (!isAsset) return 3;
      return 1;
    }
    return isAsset ? 2 : 1;
  };
  return [...deals].sort((a, b) => score(b) - score(a));
}

export function resolveStanceDealChain(opts: {
  stance: VoyagerStance;
  cashflow: number;
  dealPicked: "asset_first" | "liability_first" | "skip";
}): InteractionChainResult {
  const dom = dominantStance(opts.stance);
  let cashflowDelta = 0;
  let pouchHint = "Pouch unchanged";
  if (opts.dealPicked === "asset_first") {
    cashflowDelta = dom === "saver" ? 8 : 6;
    pouchHint = "−20 pouch → +CF engine (stance-favored asset sang first)";
  } else if (opts.dealPicked === "liability_first") {
    cashflowDelta = dom === "risk" ? -10 : -8;
    pouchHint = "Liability attaches — risk stance heard the trap first";
  } else {
    pouchHint = "Skipped desk — liquidity kept; CF still";
  }
  const nextCf = opts.cashflow + cashflowDelta;
  const weather = moodFromCashflow(nextCf);
  return {
    id: "stance_deal",
    title: "Stance → Deals → Cashflow → Weather → Talk",
    steps: [
      {
        system: "Stance",
        effect: `Dominant stance: ${dom} (from Takes — not a new meter).`,
      },
      {
        system: "Harbor deals",
        effect: "Deal desk reorders — preferred offers sing louder.",
      },
      {
        system: "Ledger",
        effect: `Cashflow ${opts.cashflow} → ${nextCf} (${cashflowDelta >= 0 ? "+" : ""}${cashflowDelta}).`,
      },
      {
        system: "Weather + Piggy",
        effect: `Mood ${weather}. Piggy names how ${dom} choices feel on the plaza.`,
      },
    ],
    feedback: "Talk reinforces stance identity → next Take still authors stance.",
    strategy: "Take forks quietly train which deals Harbor offers first.",
    weather,
    paydayMult: paydayIncomeMultiplier(weather),
    cashflowDelta,
    pouchHint,
  };
}

/** Chain 3 — day-2 echo becomes a one-day weather law. */
export function resolveDay2WeatherChain(opts: {
  organ: MoneyOrganId;
  cashflow: number;
}): InteractionChainResult {
  const weather = day2WeatherLaw(opts.organ);
  const natural = moodFromCashflow(opts.cashflow);
  const paydayMult = composePaydayMultiplier({
    weatherMood: weather,
    organStain: opts.organ,
  });
  const verb = organVerbChip(opts.organ);
  return {
    id: "day2_weather",
    title: "Day-2 → Weather law → Soft Beat → Next Take",
    steps: [
      {
        system: "Day-2 echo",
        effect: `Scar echo forces today’s sky to remember ${verb}.`,
      },
      {
        system: "Weather law",
        effect: `Mood locked ${weather} (natural would be ${natural}).`,
      },
      {
        system: "Soft Beat / Piggy",
        effect: "Lookout + locals name yesterday’s plaque in today’s fog.",
      },
      {
        system: "Next Take pressure",
        effect: "You Choose the next fork under weather you already earned.",
      },
    ],
    feedback: "Next organ Take writes a new stain that will color a future day-2.",
    strategy: "Wait out a storm day, Soft Beat peek, or spend into stained prices — your call.",
    weather,
    paydayMult,
    cashflowDelta: 0,
    pouchHint: `Day-2 Pay Day ×${paydayMult} under ${weather}`,
  };
}

export const INTERACTION_CHAINS: InteractionChainId[] = [
  "organ_payday",
  "stance_deal",
  "day2_weather",
];
