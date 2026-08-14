/**
 * Single headless Harbor grind game using real ledger/board APIs.
 */

import type { IslandDefinition } from "../types";
import { HARBOR_HAVEN_ID } from "../islandIds";
import {
  acceptDeal,
  createDefaultVoyagerLedger,
  ensureLedger,
  netCashflow,
  type DealOffer,
  type VoyagerLedger,
} from "../voyagerLedger";
import {
  buildBoardForIsland,
  computeMinigameReward,
  emptyPartyState,
  resolveMove,
  resolvePassStart,
  resolvePlayerSpace,
  rollDice,
  type PartyIslandState,
} from "../partyBoard";
import { tracksHarborEscape } from "../boardEconomy";
import {
  advanceEconomy,
  createDefaultEconomyState,
  getPhaseModifiers,
  type EconomyState,
} from "../economy";
import { CAPSULE_OFFERS, PLAZA_PASS_PRICE } from "../harborShop";
import { BOAT_TIERS } from "../boats";
import { getAgentPolicy, viewFrom, type ShopOption } from "./agents";
import { createRng, withMathRandom, type Rng } from "./rng";
import type {
  AgentStrategyId,
  MilestoneId,
  SimCondition,
  SimGameResult,
} from "./types";

/** Minimal Harbor stub — enough for cashflow board construction. */
export function simHarborIsland(): IslandDefinition {
  return {
    id: HARBOR_HAVEN_ID,
    name: "Harbor Haven",
    description: "Headless economy sim island stub",
    icon: "⚓",
    themeId: "harbor_haven",
    areas: [],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [
      {
        id: "mg_sim_a",
        name: "Sim Check A",
        description: "Sim",
        icon: "🪙",
        componentId: "ChangeMaking",
      },
      {
        id: "mg_sim_b",
        name: "Sim Check B",
        description: "Sim",
        icon: "📊",
        componentId: "BudgetBuilder",
      },
    ],
  };
}

function applyEconomyBias(state: EconomyState, bias: SimCondition["economyBias"]): EconomyState {
  if (bias === "natural") return state;
  const phase =
    bias === "sticky_boom" ? "boom" : bias === "sticky_recession" ? "recession" : "normal";
  return { ...state, phase, turnsInPhase: 0 };
}

function markMilestone(
  map: Partial<Record<MilestoneId, number>>,
  id: MilestoneId,
  turn: number,
): void {
  if (map[id] == null) map[id] = turn;
}

export function runSimGame(opts: {
  strategy: AgentStrategyId;
  condition: SimCondition;
  seed: number;
}): SimGameResult {
  const rng = createRng(opts.seed);
  const policy = getAgentPolicy(opts.strategy);
  const island = simHarborIsland();
  const board = buildBoardForIsland(island);
  const trackEscape = tracksHarborEscape("harbor_cashflow");

  let coins = opts.condition.startingCoins;
  let xp = 0;
  let ledger: VoyagerLedger = createDefaultVoyagerLedger();
  let party: PartyIslandState = {
    ...emptyPartyState(),
    turnsRemaining: opts.condition.maxTurns,
  };
  let economy = applyEconomyBias(createDefaultEconomyState(), opts.condition.economyBias);

  const milestones: Partial<Record<MilestoneId, number>> = {};
  let dealsAccepted = 0;
  let dealsDeclined = 0;
  let sealsBought = 0;
  let shopSpend = 0;
  let minigameAttempts = 0;
  let minigameSuccesses = 0;
  let scarcityTurns = 0;
  let negativeCfTurns = 0;
  let bankruptTurns = 0;
  let freedomTurn: number | null = null;
  let peakCoins = coins;
  let peakCashflow = netCashflow(ledger);
  let consecutiveNegCf = 0;
  let consecutiveBroke = 0;

  const maxTurns = opts.condition.maxTurns;

  for (let turn = 1; turn <= maxTurns; turn++) {
    const incomeMult =
      opts.condition.economyBias === "natural"
        ? getPhaseModifiers(economy.phase).incomeMultiplier
        : getPhaseModifiers(economy.phase).incomeMultiplier;

    withMathRandom(rng, () => {
      const steps = rollDice();
      const move = resolveMove(board, party.position, steps);
      party = { ...party, position: move.to, turnsPlayed: party.turnsPlayed + 1 };

      if (move.passedStart) {
        // Real pass-start payday, then adjust for macro income multiplier delta.
        const pass = resolvePassStart("harbor_cashflow", ledger);
        if (pass.ledger) ledger = pass.ledger;
        let pay = pass.coins ?? 0;
        if (incomeMult !== 1 && pay !== 0) {
          const adjusted = Math.round(pay * incomeMult) - pay;
          pay += adjusted;
        }
        coins = Math.max(0, coins + pay);
        xp += pass.xp ?? 0;
        if (ledger.harborEscaped && freedomTurn == null) {
          freedomTurn = turn;
          markMilestone(milestones, "harbor_freedom", turn);
        }
      }

      const space = move.space ?? board[move.to]!;
      const view = viewFrom(coins, ledger, party.stars, turn, maxTurns);

      if (space.type === "minigame") {
        minigameAttempts += 1;
        const p =
          opts.condition.minigameBaseSuccess * 0.5 + policy.minigameBias(rng, view) * 0.5;
        const success = rng() < Math.min(0.95, Math.max(0.15, p));
        const score = success ? 30 + Math.floor(rng() * 40) : 5 + Math.floor(rng() * 20);
        if (success) minigameSuccesses += 1;
        const firstClear = minigameSuccesses <= 1;
        const reward = computeMinigameReward(success, score, firstClear, false);
        coins = Math.max(0, coins + reward.coins);
        xp += reward.xp;
        if (reward.starEarned) {
          party = { ...party, stars: party.stars + 1 };
          markMilestone(milestones, "first_seal", turn);
        }
      } else {
        const sealCost = space.type === "seal" ? Math.abs(space.coinReward ?? 20) : 0;
        const wantSeal =
          space.type !== "seal" ||
          policy.shouldBuySeal(
            sealCost,
            viewFrom(coins, ledger, party.stars, turn, maxTurns),
            rng,
          );

        const { next, payload } = resolvePlayerSpace(
          space,
          party,
          // Deny seal affordance when policy declines.
          space.type === "seal" && !wantSeal ? 0 : coins,
          ledger,
          { trackHarborEscape: trackEscape },
        );
        party = next;

        if (payload.pendingDeal) {
          const offer = payload.pendingDeal;
          const accept = policy.shouldAcceptDeal(
            offer,
            viewFrom(coins, ledger, party.stars, turn, maxTurns),
            rng,
          );
          if (accept && coins >= offer.purchaseCost) {
            const bought = acceptDeal(ledger, offer);
            ledger = bought.ledger;
            coins = Math.max(0, coins + bought.coins);
            dealsAccepted += 1;
            markMilestone(milestones, "first_asset", turn);
          } else {
            dealsDeclined += 1;
          }
        } else {
          if (payload.ledger) ledger = payload.ledger;
          coins = Math.max(0, coins + (payload.coins ?? 0));
          xp += payload.xp ?? 0;
          if (payload.star) {
            party = { ...party, stars: party.stars + 1 };
            sealsBought += 1;
            markMilestone(milestones, "first_seal", turn);
          }
        }

        if (ledger.harborEscaped && freedomTurn == null) {
          freedomTurn = turn;
          markMilestone(milestones, "harbor_freedom", turn);
        }
      }

      if (opts.condition.economyBias === "natural") {
        economy = advanceEconomy(economy);
      } else {
        economy = applyEconomyBias(
          { ...economy, totalTurns: economy.totalTurns + 1 },
          opts.condition.economyBias,
        );
      }
    });

    // Shop tick every 5 turns — sinks coins into Harbor upgrades.
    if (turn % 5 === 0) {
      const shopOptions: ShopOption[] = [
        { kind: "none" },
        {
          kind: "carpet",
          price: Math.max(50, Math.round((BOAT_TIERS[1]?.minCoins ?? 100) * 0.35)),
          tierId: BOAT_TIERS[1]?.id ?? "coin_carpet",
        },
        ...CAPSULE_OFFERS.map((o) => ({
          kind: "capsule" as const,
          price: o.price,
          itemId: o.itemId,
        })),
        { kind: "plaza", price: PLAZA_PASS_PRICE },
      ];
      const pick = policy.pickShop(
        shopOptions,
        viewFrom(coins, ledger, party.stars, turn, maxTurns),
        rng,
      );
      if (pick.kind !== "none" && coins >= pick.price) {
        coins -= pick.price;
        shopSpend += pick.price;
        if (pick.kind === "carpet") markMilestone(milestones, "carpet_polish", turn);
        if (pick.kind === "plaza") markMilestone(milestones, "plaza_pass", turn);
      }
    }

    const cf = netCashflow(ledger);
    if (cf >= 30) markMilestone(milestones, "cashflow_30", turn);
    if (ledger.positivePaydayStreak >= 1) markMilestone(milestones, "escape_streak_1", turn);

    peakCoins = Math.max(peakCoins, coins);
    peakCashflow = Math.max(peakCashflow, cf);
    if (coins < 10) scarcityTurns += 1;
    if (cf < 0) {
      negativeCfTurns += 1;
      consecutiveNegCf += 1;
    } else {
      consecutiveNegCf = 0;
    }
    if (coins === 0) {
      bankruptTurns += 1;
      consecutiveBroke += 1;
    } else {
      consecutiveBroke = 0;
    }

    if (freedomTurn != null) break;
  }

  const finalCf = netCashflow(ensureLedger(ledger));
  const assets = ledger.holdings.filter((h) => h.kind === "asset").length;
  const liabilities = ledger.holdings.filter((h) => h.kind === "liability").length;
  const won = Boolean(ledger.harborEscaped);
  const deadlock =
    !won &&
    consecutiveNegCf >= 5 &&
    consecutiveBroke >= 3 &&
    dealsAccepted === 0;
  const collapse = !won && (finalCf <= -15 || (bankruptTurns >= 8 && negativeCfTurns >= 10));
  const runawayLeader =
    won && freedomTurn != null && freedomTurn <= Math.max(8, Math.floor(maxTurns * 0.25));

  return {
    strategy: opts.strategy,
    conditionId: opts.condition.id,
    seed: opts.seed,
    turns: freedomTurn ?? maxTurns,
    won,
    freedomTurn,
    finalCoins: coins,
    finalCashflow: finalCf,
    finalAssets: assets,
    finalLiabilities: liabilities,
    seals: party.stars,
    dealsAccepted,
    dealsDeclined,
    sealsBought,
    shopSpend,
    minigameAttempts,
    minigameSuccesses,
    scarcityTurns,
    negativeCfTurns,
    bankruptTurns,
    deadlock,
    collapse,
    runawayLeader,
    milestoneTurns: milestones,
    peakCoins,
    peakCashflow,
  };
}

/** Expose deal typing for tests */
export type { DealOffer, Rng };
