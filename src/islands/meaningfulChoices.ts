/**
 * Meaningful choices — relationship helpers (not number rebalances).
 * Soft Beat ↔ Pay Day · weather ↔ deal settle · vanity ↔ Freedom streak · stance counsel.
 * See GAME_DESIGN_CHOICES.md.
 */

import type { SoftBeatKind } from "./views/SoftBeatOverlay";
import { moneyOrganForSoftBeat, type MoneyOrganId } from "./moneyOrgans";
import {
  dominantStance,
  ensureStance,
  type VoyagerStance,
} from "./worldMemory";
import {
  acceptDeal,
  applyPayday,
  assetIncome,
  ensureLedger,
  HARBOR_ESCAPE_TARGET,
  netCashflow,
  type DealOffer,
  type VoyagerLedger,
} from "./voyagerLedger";
import {
  harborWeatherMood,
  type HarborWeatherMood,
} from "./harborWeather";
import type { IslandSaveV1 } from "./types";

export type ArmedSoftBeat = {
  kind: SoftBeatKind;
  organId: MoneyOrganId;
  armedAt: string;
};

export type ChoiceDecisionCard = {
  id: string;
  choice: string;
  options: string[];
  known: string;
  unknown: string;
  immediate: string;
  longTerm: string;
  opportunityCost: string;
  counterstrategy: string;
};

/** Machine-readable cards mirroring GAME_DESIGN_CHOICES.md (subset wired in code). */
export const WIRED_DECISION_CARDS: ChoiceDecisionCard[] = [
  {
    id: "soft_beat_vs_arcade",
    choice: "Soft Beat vs structure arcade",
    options: ["Soft Beat hush", "Arcade / minigame"],
    known: "Organ chip; Soft Beat is quiet cinema",
    unknown: "Exact next Pay Day buff",
    immediate: "Soft Beat arms next Pay Day; arcade pays now",
    longTerm: "Armed organ shapes Freedom streak math",
    opportunityCost: "Earn-now vs next-month buff",
    counterstrategy: "Arm Soft Beat before ritual Pay Day when chasing Freedom",
  },
  {
    id: "deal_buy_vs_pass",
    choice: "Deal accept vs pass",
    options: ["Buy asset", "Pass"],
    known: "Cost, +$/mo, pouch, weather mood",
    unknown: "Settle delay; next Debt Trap",
    immediate: "Storm may delay asset income one Pay Day",
    longTerm: "Runway vs cashflow growth",
    opportunityCost: "Coins for capsule/shop vs earlier Freedom",
    counterstrategy: "Pass in storm with thin pouch; buy in fair with runway",
  },
  {
    id: "vanity_vs_freedom",
    choice: "Vanity spend vs Freedom chase",
    options: ["Companion / carpet / plaza pass", "Hold"],
    known: "Price; Freedom chip",
    unknown: "Pay Days until seal",
    immediate: "Vanity resets positive Pay Day streak if not escaped",
    longTerm: "Identity now vs seal later",
    opportunityCost: "Plaza look vs Freedom date",
    counterstrategy: "Polish after Freedom; hold mid-streak",
  },
  {
    id: "debt_trap_vs_capsule",
    choice: "Debt Trap vs Emergency Ledger",
    options: ["Burn capsule buff", "Take liability"],
    known: "Buff icons on board HUD",
    unknown: "Next Collector / Fee Raid",
    immediate: "Buff absorbs trap or liability sticks",
    longTerm: "CF path vs raid vulnerability",
    opportunityCost: "Capsule not available for Collector",
    counterstrategy: "Carry capsule near escape target",
  },
];

export function armSoftBeatForPayDay(
  save: IslandSaveV1,
  kind: SoftBeatKind,
): IslandSaveV1 {
  const organ = moneyOrganForSoftBeat(kind);
  return {
    ...save,
    armedSoftBeat: {
      kind,
      organId: organ.id,
      armedAt: new Date().toISOString(),
    },
  };
}

export function clearArmedSoftBeat(save: IslandSaveV1): IslandSaveV1 {
  if (!save.armedSoftBeat) return save;
  const { armedSoftBeat: _drop, ...rest } = save;
  return rest as IslandSaveV1;
}

/** Vanity Harbor SKUs — pause Freedom streak. Capsules stay strategic. */
export function isVanityHarborPurchase(
  kind: "companion" | "capsule" | "carpet" | "plaza_pass",
): boolean {
  return kind === "companion" || kind === "carpet" || kind === "plaza_pass";
}

export function pauseFreedomStreakForVanity(
  ledger: VoyagerLedger,
): VoyagerLedger {
  const L = ensureLedger(ledger);
  if (L.harborEscaped || L.positivePaydayStreak <= 0) return L;
  return {
    ...L,
    positivePaydayStreak: 0,
    recentEvents: [
      {
        id: `ev_vanity_${Date.now()}`,
        ts: new Date().toISOString(),
        text: "Freedom chase paused — Harbor remembers the polish before the seal.",
      },
      ...L.recentEvents,
    ].slice(0, 12),
  };
}

export function settlePaydaysForDeal(
  mood: HarborWeatherMood,
  stance?: VoyagerStance | null,
): number {
  const dom = dominantStance(stance);
  if (mood === "storm") return 1;
  if (mood === "tight" && dom === "spender") return 1;
  return 0;
}

export function acceptDealWithContext(
  ledger: VoyagerLedger,
  offer: DealOffer,
  opts: { mood: HarborWeatherMood; stance?: VoyagerStance | null },
): { ledger: VoyagerLedger; coins: number; settlingPaydays: number } {
  const settlingPaydays = settlePaydaysForDeal(opts.mood, opts.stance);
  const base = acceptDeal(ledger, offer);
  if (settlingPaydays <= 0) {
    return { ...base, settlingPaydays: 0 };
  }
  const holdings = base.ledger.holdings.map((h) =>
    h.id === offer.id ? { ...h, settlingPaydays } : h,
  );
  return {
    coins: base.coins,
    settlingPaydays,
    ledger: {
      ...base.ledger,
      holdings,
      recentEvents: [
        {
          id: `ev_settle_${Date.now()}`,
          ts: new Date().toISOString(),
          text: `${offer.name} is settling in the ${opts.mood} — income starts after ${settlingPaydays} Pay Day.`,
        },
        ...base.ledger.recentEvents,
      ].slice(0, 12),
    },
  };
}

/** Cashflow that counts this Pay Day (excludes settling assets). */
export function effectiveNetCashflow(ledger: VoyagerLedger): number {
  const L = ensureLedger(ledger);
  const settling = L.holdings
    .filter((h) => h.kind === "asset" && (h.settlingPaydays ?? 0) > 0)
    .reduce((sum, h) => sum + h.monthlyAmount, 0);
  return netCashflow(L) - settling;
}

function tickSettling(ledger: VoyagerLedger): VoyagerLedger {
  const holdings = ledger.holdings.map((h) => {
    const s = h.settlingPaydays ?? 0;
    if (s <= 0) return h;
    const next = s - 1;
    if (next <= 0) {
      const { settlingPaydays: _d, ...rest } = h;
      return rest;
    }
    return { ...h, settlingPaydays: next };
  });
  return { ...ledger, holdings };
}

export type SoftBeatPayDayMods = {
  incomeMultiplier: number;
  floorZero: boolean;
  liabilityDamp: number;
  label: string;
};

export function softBeatPayDayMods(
  armed: ArmedSoftBeat | null | undefined,
  stance?: VoyagerStance | null,
): SoftBeatPayDayMods {
  if (!armed) {
    return { incomeMultiplier: 1, floorZero: false, liabilityDamp: 0, label: "" };
  }
  const dom = dominantStance(stance);
  const affinity =
    (armed.kind === "lookout" && dom === "saver") ||
    (armed.kind === "umbrella" && dom === "saver") ||
    (armed.kind === "battlement" && dom === "risk") ||
    (armed.kind === "ledger" && dom === "balanced")
      ? 1.08
      : 1;

  switch (armed.kind) {
    case "lookout":
      return {
        incomeMultiplier: 1.12 * affinity,
        floorZero: false,
        liabilityDamp: 0,
        label: "Lid Lookout warmed this Pay Day",
      };
    case "umbrella":
      return {
        incomeMultiplier: 1.05 * affinity,
        floorZero: true,
        liabilityDamp: 0,
        label: "Umbrella Loft floored a shortfall",
      };
    case "battlement":
      return {
        incomeMultiplier: 1,
        floorZero: false,
        liabilityDamp: Math.round(4 * affinity),
        label: "Score Battlement eased liability drag",
      };
    case "ledger":
    default:
      return {
        incomeMultiplier: 1.08 * affinity,
        floorZero: false,
        liabilityDamp: 0,
        label: "Teller Window remembered your books",
      };
  }
}

/**
 * Pay Day that honors Soft Beat arm + settling assets + optional escape track.
 * Builds a temporary ledger for math, then ticks settle on the real holdings.
 */
export function applyPaydayWithChoices(
  ledger: VoyagerLedger,
  opts?: {
    trackHarborEscape?: boolean;
    armed?: ArmedSoftBeat | null;
    stance?: VoyagerStance | null;
  },
): { ledger: VoyagerLedger; coins: number; escapedNow?: boolean; buffLabel?: string } {
  const L0 = ensureLedger(ledger);
  const mods = softBeatPayDayMods(opts?.armed, opts?.stance);

  const holdingsForMath = L0.holdings.map((h) => {
    if (h.kind === "asset" && (h.settlingPaydays ?? 0) > 0) {
      return { ...h, monthlyAmount: 0 };
    }
    return h;
  });

  const mathLedger: VoyagerLedger = {
    ...L0,
    holdings: holdingsForMath,
    livingExpenses: Math.max(0, L0.livingExpenses - mods.liabilityDamp),
  };
  const result = applyPayday(mathLedger, mods.incomeMultiplier, {
    trackHarborEscape: opts?.trackHarborEscape,
  });

  let coins = result.coins;
  if (mods.floorZero && coins < 0) coins = 0;

  // Restore real holdings (with settle tick) — keep streak/escape from math result.
  let next: VoyagerLedger = {
    ...result.ledger,
    holdings: tickSettling(L0).holdings,
    livingExpenses: L0.livingExpenses,
    salaryIncome: L0.salaryIncome,
  };

  if (mods.label) {
    const head = next.recentEvents[0];
    if (head) {
      next = {
        ...next,
        recentEvents: [
          { ...head, text: `${head.text} ${mods.label}.`, coinDelta: coins },
          ...next.recentEvents.slice(1),
        ],
      };
    }
  } else if (coins !== result.coins) {
    const head = next.recentEvents[0];
    if (head) {
      next = {
        ...next,
        recentEvents: [{ ...head, coinDelta: coins, text: head.text.replace(/\(.*?coins\)/, `(${coins} coins)`) }, ...next.recentEvents.slice(1)],
      };
    }
  }

  return {
    ledger: next,
    coins,
    escapedNow: result.escapedNow,
    buffLabel: mods.label || undefined,
  };
}

export type DealCounsel = {
  lean: "buy" | "pass" | "either";
  tip: string;
};

export function dealChoiceCounsel(opts: {
  cashflow: number;
  pouch: number;
  cost: number;
  monthly: number;
  mood: HarborWeatherMood;
  stance?: VoyagerStance | null;
  hasEmergencyBuff: boolean;
}): DealCounsel {
  const after = opts.pouch - opts.cost;
  const settle = settlePaydaysForDeal(opts.mood, opts.stance);
  const dom = dominantStance(opts.stance);
  const runwayThin = after < 15;
  const chasing = opts.cashflow < HARBOR_ESCAPE_TARGET;

  if (settle > 0 && runwayThin) {
    return {
      lean: "pass",
      tip: "Fog + thin pouch after buy — pass and wait for fair weather (income settles immediately then).",
    };
  }
  if (settle > 0 && chasing) {
    return {
      lean: "either",
      tip: "Storm settle: this asset won’t pay on the next Pay Day. Pass keeps runway; buy locks the deal.",
    };
  }
  if (runwayThin && !opts.hasEmergencyBuff) {
    return {
      lean: "pass",
      tip: "Pouch would drop below a safe runway with no Emergency Ledger — patience is cashflow too.",
    };
  }
  if (chasing && after >= 15 && settle === 0) {
    return {
      lean: "buy",
      tip: "Fair skies and runway OK — this deal feeds the Freedom chase.",
    };
  }
  if (dom === "saver" && opts.mood !== "boom") {
    return {
      lean: "either",
      tip: "Saver stance: skipping a glitter deal is still a win if the jar can wait.",
    };
  }
  if (!chasing && opts.cashflow >= HARBOR_ESCAPE_TARGET) {
    return {
      lean: "either",
      tip: "Cashflow already seals-ready — buy for surplus or pass to fund plaza polish after Freedom.",
    };
  }
  return {
    lean: "either",
    tip: `+$${opts.monthly}/mo for ${opts.cost} coins — weigh pouch runway against Freedom.`,
  };
}

export function softBeatCounsel(kind: SoftBeatKind, stance?: VoyagerStance | null): string {
  const dom = dominantStance(ensureStance(stance));
  const organ = moneyOrganForSoftBeat(kind).name;
  if (kind === "lookout") {
    return dom === "saver"
      ? `${organ} Soft Beat will warm your next Pay Day — jar-first affinity hums louder.`
      : `${organ} Soft Beat arms the next Pay Day with a coin lift.`;
  }
  if (kind === "umbrella") {
    return `${organ} Soft Beat can floor a shortfall on the next Pay Day — claim ritual after.`;
  }
  if (kind === "battlement") {
    return `${organ} Soft Beat eases liability drag once — useful before a stormy claim.`;
  }
  return `${organ} Soft Beat stamps the books — mild Pay Day lift when you claim.`;
}

export function choicesCounselEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("choices") === "1";
  } catch {
    return false;
  }
}

export function harborChoicesBrief(save: IslandSaveV1): string | null {
  const ledger = ensureLedger(save.voyagerLedger);
  if (ledger.harborEscaped) return null;
  const mood = harborWeatherMood(save);
  const armed = save.armedSoftBeat;
  const parts: string[] = [];
  if (armed) {
    parts.push(`Armed: ${armed.kind} → next Pay Day`);
  } else if (ledger.positivePaydayStreak > 0) {
    parts.push("Soft Beat before Pay Day can protect this streak");
  }
  if (mood === "storm" || mood === "tight") {
    parts.push(`${mood}: new deals may settle one Pay Day`);
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

/** Re-export weather helper for board UI without circular imports in views. */
export function moodForSave(save: IslandSaveV1): HarborWeatherMood {
  return harborWeatherMood(save);
}

export function assetsPaying(ledger: VoyagerLedger): number {
  return assetIncome(ensureLedger(ledger));
}
