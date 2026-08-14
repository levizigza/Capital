/**
 * Configurable AI agent policies for Harbor economy sim.
 * Decisions only — no auto-rebalance of game rules.
 */

import type { DealOffer } from "../voyagerLedger";
import { dealPurchaseCost, netCashflow, type VoyagerLedger } from "../voyagerLedger";
import type { AgentStrategyId } from "./types";
import type { Rng } from "./rng";

export type AgentView = {
  coins: number;
  ledger: VoyagerLedger;
  seals: number;
  turn: number;
  maxTurns: number;
  cashflow: number;
};

export type ShopOption =
  | { kind: "carpet"; price: number; tierId: string }
  | { kind: "capsule"; price: number; itemId: string }
  | { kind: "plaza"; price: number }
  | { kind: "none" };

export type AgentPolicy = {
  id: AgentStrategyId;
  /** Probability of clearing a minigame (after base rate is applied by runner). */
  minigameBias: (rng: Rng, view: AgentView) => number;
  shouldAcceptDeal: (offer: DealOffer, view: AgentView, rng: Rng) => boolean;
  shouldBuySeal: (cost: number, view: AgentView, rng: Rng) => boolean;
  pickShop: (options: ShopOption[], view: AgentView, rng: Rng) => ShopOption;
};

function roi(offer: DealOffer): number {
  const cost = Math.max(1, offer.purchaseCost);
  return offer.monthlyAmount / cost;
}

function bufferOk(view: AgentView, spend: number, keep: number): boolean {
  return view.coins - spend >= keep;
}

const POLICIES: Record<AgentStrategyId, AgentPolicy> = {
  conservative: {
    id: "conservative",
    minigameBias: () => 0.72,
    shouldAcceptDeal: (offer, view) => {
      if (offer.kind !== "asset") return false;
      if (!bufferOk(view, offer.purchaseCost, 25)) return false;
      return offer.purchaseCost <= 25 || roi(offer) >= 0.2;
    },
    shouldBuySeal: (cost, view) => bufferOk(view, cost, 40) && view.cashflow >= 20,
    pickShop: (options, view) => {
      const cheap = options.find((o) => o.kind !== "none" && o.price <= 50 && view.coins - o.price >= 30);
      return cheap ?? { kind: "none" };
    },
  },

  aggressive: {
    id: "aggressive",
    minigameBias: () => 0.55,
    shouldAcceptDeal: (offer, view) =>
      offer.kind === "asset" && view.coins >= offer.purchaseCost,
    shouldBuySeal: (cost, view) => view.coins >= cost,
    pickShop: (options, view, rng) => {
      const buys = options.filter((o) => o.kind !== "none" && view.coins >= o.price);
      if (buys.length === 0) return { kind: "none" };
      return buys[Math.floor(rng() * buys.length)]!;
    },
  },

  random: {
    id: "random",
    minigameBias: () => 0.65,
    shouldAcceptDeal: (offer, view, rng) =>
      offer.kind === "asset" && view.coins >= offer.purchaseCost && rng() < 0.5,
    shouldBuySeal: (cost, view, rng) => view.coins >= cost && rng() < 0.5,
    pickShop: (options, view, rng) => {
      const buys = options.filter((o) => o.kind !== "none" && view.coins >= o.price);
      const pool = [...buys, { kind: "none" as const }];
      return pool[Math.floor(rng() * pool.length)]!;
    },
  },

  optimizer: {
    id: "optimizer",
    minigameBias: () => 0.7,
    shouldAcceptDeal: (offer, view) => {
      if (offer.kind !== "asset") return false;
      if (view.coins < offer.purchaseCost) return false;
      const cf = view.cashflow;
      const after = cf + offer.monthlyAmount;
      // Prefer deals that cross or defend the Freedom CF target.
      if (cf < 30 && after >= 30) return bufferOk(view, offer.purchaseCost, 10);
      if (roi(offer) >= 0.22 && bufferOk(view, offer.purchaseCost, 15)) return true;
      return false;
    },
    shouldBuySeal: (cost, view) => view.cashflow >= 30 && bufferOk(view, cost, 20),
    pickShop: (options, view) => {
      // Spend only after Freedom path is secure.
      if (view.cashflow < 30) return { kind: "none" };
      const carpet = options.find((o) => o.kind === "carpet" && view.coins >= o.price);
      return carpet ?? { kind: "none" };
    },
  },

  collector: {
    id: "collector",
    minigameBias: () => 0.68,
    shouldAcceptDeal: (offer, view) =>
      offer.kind === "asset" &&
      offer.purchaseCost <= 25 &&
      bufferOk(view, offer.purchaseCost, 20),
    shouldBuySeal: (cost, view) => view.coins >= cost,
    pickShop: (options, view) => {
      const capsule = options.find((o) => o.kind === "capsule" && view.coins >= o.price);
      return capsule ?? { kind: "none" };
    },
  },

  long_term_investor: {
    id: "long_term_investor",
    minigameBias: () => 0.7,
    shouldAcceptDeal: (offer, view) => {
      if (offer.kind !== "asset") return false;
      if (view.coins < offer.purchaseCost) return false;
      // Jar + booth path to Freedom CF.
      return roi(offer) >= 0.2 || offer.monthlyAmount >= 10;
    },
    shouldBuySeal: (cost, view) =>
      view.ledger.harborEscaped && bufferOk(view, cost, 30),
    pickShop: (options, view) => {
      if (!view.ledger.harborEscaped) return { kind: "none" };
      const plaza = options.find((o) => o.kind === "plaza" && view.coins >= o.price);
      const carpet = options.find((o) => o.kind === "carpet" && view.coins >= o.price);
      return plaza ?? carpet ?? { kind: "none" };
    },
  },

  short_term_trader: {
    id: "short_term_trader",
    minigameBias: () => 0.6,
    shouldAcceptDeal: (offer, view) => {
      if (offer.kind !== "asset") return false;
      // Prefer quick payback; skip expensive lemonade-like costs when thin.
      return offer.purchaseCost <= 30 && view.coins >= offer.purchaseCost + 5;
    },
    shouldBuySeal: (cost, view, rng) => view.coins >= cost + 15 && rng() < 0.35,
    pickShop: (options, view) => {
      const magnet = options.find(
        (o) => o.kind === "capsule" && o.itemId === "coin_magnet" && view.coins >= o.price,
      );
      return magnet ?? { kind: "none" };
    },
  },

  resource_hoarder: {
    id: "resource_hoarder",
    minigameBias: () => 0.75,
    shouldAcceptDeal: (offer, view) => {
      if (offer.kind !== "asset") return false;
      // Only spend when pouch is fat OR Freedom is otherwise impossible in time.
      if (view.coins < 90 && view.cashflow >= 20) return false;
      if (view.cashflow < 30 && offer.monthlyAmount >= 5 && view.coins >= offer.purchaseCost) {
        return view.coins >= 70 || view.turn > view.maxTurns * 0.6;
      }
      return false;
    },
    shouldBuySeal: () => false,
    pickShop: () => ({ kind: "none" }),
  },

  balanced: {
    id: "balanced",
    minigameBias: () => 0.68,
    shouldAcceptDeal: (offer, view) => {
      if (offer.kind !== "asset") return false;
      if (!bufferOk(view, offer.purchaseCost, 20)) return false;
      return roi(offer) >= 0.18 || (view.cashflow < 30 && offer.monthlyAmount >= 5);
    },
    shouldBuySeal: (cost, view, rng) =>
      bufferOk(view, cost, 25) && (view.cashflow >= 25 || rng() < 0.3),
    pickShop: (options, view, rng) => {
      if (view.coins < 60) return { kind: "none" };
      const buys = options.filter((o) => o.kind !== "none" && view.coins - o.price >= 20);
      if (buys.length === 0 || rng() < 0.5) return { kind: "none" };
      return buys[0]!;
    },
  },
};

export function getAgentPolicy(id: AgentStrategyId): AgentPolicy {
  return POLICIES[id];
}

export function offerCost(offer: DealOffer): number {
  return dealPurchaseCost(offer);
}

export function viewFrom(
  coins: number,
  ledger: VoyagerLedger,
  seals: number,
  turn: number,
  maxTurns: number,
): AgentView {
  return {
    coins,
    ledger,
    seals,
    turn,
    maxTurns,
    cashflow: netCashflow(ledger),
  };
}
