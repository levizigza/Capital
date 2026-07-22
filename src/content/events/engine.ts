// ---------------------------------------------------------------------------
// Scenario Deck Engine
// ---------------------------------------------------------------------------
// Loads event decks from JSON, filters by triggers, performs weighted draws,
// and applies choice effects. Fully data-driven — no hardcoded logic.
// ---------------------------------------------------------------------------

import type {
  ScenarioEvent,
  EventDeck,
  EventTrigger,
  EventChoice,
  EventEffect,
  ResolvedEvent,
  ScenarioDeckState,
  TriggerValue,
} from "./types";
import type { GameState, Effect } from "@/mechanics/types";
import {
  resolveProfileNumber,
  resolveProfileText,
  resolveScenarioEventCopy,
  scaleEffectAmount,
  type LearningProfileId,
} from "@/islands/learningProfile";

// ---------------------------------------------------------------------------
// Deck loading — uses Vite's import.meta.glob to discover JSON files
// ---------------------------------------------------------------------------

const deckModules = import.meta.glob<EventDeck>("./*.json", { eager: true, import: "default" });

export function loadAllDecks(): Record<string, EventDeck> {
  const decks: Record<string, EventDeck> = {};
  for (const [_path, deck] of Object.entries(deckModules)) {
    if (deck && deck.deckId) {
      decks[deck.deckId] = deck;
    }
  }
  return decks;
}

export function loadDeckById(deckId: string): EventDeck | undefined {
  const all = loadAllDecks();
  return all[deckId];
}

// ---------------------------------------------------------------------------
// State initialisation
// ---------------------------------------------------------------------------

export function createDeckState(deckIds?: string[]): ScenarioDeckState {
  const allDecks = loadAllDecks();
  const decks: Record<string, EventDeck> = {};
  if (deckIds && deckIds.length > 0) {
    for (const id of deckIds) {
      if (allDecks[id]) decks[id] = allDecks[id];
    }
  } else {
    Object.assign(decks, allDecks);
  }
  return {
    decks,
    activeEvent: null,
    activeDeckId: null,
    history: [],
    drawCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Trigger evaluation
// ---------------------------------------------------------------------------

function resolveTriggerValue(value: TriggerValue, profileId?: LearningProfileId): number {
  if (profileId === undefined) {
    return typeof value === "number" ? value : resolveProfileNumber(value, "apprentice");
  }
  return typeof value === "number" ? value : resolveProfileNumber(value, profileId);
}

export function evaluateTrigger(
  trigger: EventTrigger,
  state: GameState,
  profileId?: LearningProfileId,
): boolean {
  switch (trigger.type) {
    case "minMoney":
      return state.money >= resolveTriggerValue(trigger.value, profileId);
    case "maxMoney":
      return state.money <= resolveTriggerValue(trigger.value, profileId);
    case "minScore":
      return state.score >= resolveTriggerValue(trigger.value, profileId);
    case "hasFlag":
      return (state.flags[trigger.key] ?? false) === trigger.value;
    case "minCounter":
      return (state.counters[trigger.key] ?? 0) >= trigger.value;
    case "maxCounter":
      return (state.counters[trigger.key] ?? 0) <= trigger.value;
    case "minTurn":
      return state.turn >= trigger.value;
    case "maxTurn":
      return state.turn <= trigger.value;
    case "difficulty":
      return state.difficulty === trigger.value;
    case "tag":
      return true; // tag triggers are filtered at the deck/query level, not state level
    default:
      return true;
  }
}

export function allTriggersPass(
  triggers: EventTrigger[],
  state: GameState,
  profileId?: LearningProfileId,
): boolean {
  return triggers.every((t) => evaluateTrigger(t, state, profileId));
}

// ---------------------------------------------------------------------------
// Filtering — returns eligible events + exclusion reasons for dev tool
// ---------------------------------------------------------------------------

export type FilterResult = {
  eligible: ScenarioEvent[];
  excluded: { event: ScenarioEvent; reasons: string[] }[];
};

export function filterEvents(
  events: ScenarioEvent[],
  state: GameState,
  tags?: string[],
): FilterResult {
  const eligible: ScenarioEvent[] = [];
  const excluded: FilterResult["excluded"] = [];

  for (const event of events) {
    const reasons: string[] = [];
    const profileId = state.learningProfileId;

    // Check tag filter
    if (tags && tags.length > 0) {
      const hasMatchingTag = event.tags.some((t) => tags.includes(t));
      if (!hasMatchingTag) {
        reasons.push(`No matching tags (needs one of: ${tags.join(", ")})`);
      }
    }

    // Check triggers
    for (const trigger of event.triggers) {
      if (!evaluateTrigger(trigger, state, profileId)) {
        reasons.push(formatTriggerReason(trigger, state, profileId));
      }
    }

    if (reasons.length === 0) {
      eligible.push(event);
    } else {
      excluded.push({ event, reasons });
    }
  }

  return { eligible, excluded };
}

function formatTriggerReason(trigger: EventTrigger, state: GameState, profileId?: LearningProfileId): string {
  switch (trigger.type) {
    case "minMoney": {
      const need = resolveTriggerValue(trigger.value, profileId);
      return `Needs money ≥ ${need} (has ${state.money})`;
    }
    case "maxMoney": {
      const need = resolveTriggerValue(trigger.value, profileId);
      return `Needs money ≤ ${need} (has ${state.money})`;
    }
    case "minScore": {
      const need = resolveTriggerValue(trigger.value, profileId);
      return `Needs score ≥ ${need} (has ${state.score})`;
    }
    case "hasFlag":
      return `Needs flag "${trigger.key}" = ${trigger.value} (is ${state.flags[trigger.key] ?? "unset"})`;
    case "minCounter":
      return `Needs counter "${trigger.key}" ≥ ${trigger.value} (is ${state.counters[trigger.key] ?? 0})`;
    case "maxCounter":
      return `Needs counter "${trigger.key}" ≤ ${trigger.value} (is ${state.counters[trigger.key] ?? 0})`;
    case "minTurn":
      return `Needs turn ≥ ${trigger.value} (is ${state.turn})`;
    case "maxTurn":
      return `Needs turn ≤ ${trigger.value} (is ${state.turn})`;
    case "difficulty":
      return `Needs difficulty = "${trigger.value}" (is "${state.difficulty}")`;
    default:
      return `Trigger "${trigger.type}" failed`;
  }
}

// ---------------------------------------------------------------------------
// Weighted draw
// ---------------------------------------------------------------------------

import { computeEffectiveWeight, type EconomyPhase } from "@/islands/economy";

export function weightedDraw(
  events: ScenarioEvent[],
  economyPhase?: EconomyPhase,
  rng: () => number = Math.random,
): ScenarioEvent | null {
  if (events.length === 0) return null;

  // Apply economy-phase weight modifiers when a phase is provided
  const weights = economyPhase
    ? events.map((e) => computeEffectiveWeight(e.weight, e.tags, economyPhase))
    : events.map((e) => e.weight);

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng() * totalWeight;

  for (let i = 0; i < events.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return events[i];
  }

  return events[events.length - 1];
}

// ---------------------------------------------------------------------------
// Draw from a specific deck (full pipeline: filter → weighted draw)
// ---------------------------------------------------------------------------

export type DrawResult = {
  event: ScenarioEvent | null;
  deckId: string;
  eligible: ScenarioEvent[];
  excluded: FilterResult["excluded"];
};

export function drawFromDeck(
  deckState: ScenarioDeckState,
  deckId: string,
  gameState: GameState,
  tags?: string[],
  economyPhase?: EconomyPhase,
  rng?: () => number,
): DrawResult {
  const deck = deckState.decks[deckId];
  if (!deck) {
    return { event: null, deckId, eligible: [], excluded: [] };
  }

  const { eligible, excluded } = filterEvents(deck.events, gameState, tags);
  const event = weightedDraw(eligible, economyPhase, rng);

  return { event, deckId, eligible, excluded };
}

// ---------------------------------------------------------------------------
// Apply choice effects → convert to mechanic Effect[] for the engine
// ---------------------------------------------------------------------------

export function choiceEffectsToMechanicEffects(
  effects: EventEffect[],
  profileId?: LearningProfileId,
): Effect[] {
  const result: Effect[] = [];
  const scale = (n: number) => (profileId ? scaleEffectAmount(n, profileId) : n);

  for (const eff of effects) {
    switch (eff.type) {
      case "money":
        if (eff.amount >= 0) {
          result.push({ type: "addMoney", amount: scale(eff.amount) });
        } else {
          result.push({ type: "removeMoney", amount: Math.abs(scale(eff.amount)) });
        }
        break;
      case "debt":
        result.push({ type: "incrementCounter", key: "debt", delta: scale(eff.amount) });
        result.push({ type: "showMessage", text: `Debt changed by $${scale(eff.amount)}`, variant: "warning" });
        break;
      case "reputation":
        result.push({ type: "incrementCounter", key: "reputation", delta: scale(eff.amount) });
        break;
      case "score":
        result.push({ type: "addScore", amount: scale(eff.amount) });
        break;
      case "flag":
        result.push({ type: "setFlag", key: eff.key, value: eff.value });
        break;
      case "counter":
        result.push({ type: "incrementCounter", key: eff.key, delta: scale(eff.delta) });
        break;
      case "skillStats":
        result.push({ type: "incrementCounter", key: `skill_${eff.skill}`, delta: scale(eff.delta) });
        break;
      case "questProgress":
        // Quest progress is handled by the island engine, not the mechanic engine.
        // We emit it as a flag so the minigame layer can pick it up.
        result.push({ type: "setFlag", key: `quest_${eff.questId}_${eff.objectiveId}`, value: true });
        break;
      case "inventory":
        // Inventory is handled by the island save, not the mechanic engine.
        // We emit it as a flag for the minigame layer to interpret.
        result.push({ type: "setFlag", key: `inv_${eff.action}_${eff.itemId}`, value: true });
        break;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Resolve a choice — returns updated deck state + mechanic effects
// ---------------------------------------------------------------------------

export function resolveChoice(
  deckState: ScenarioDeckState,
  choiceIndex: number,
  profileId?: LearningProfileId,
): { newDeckState: ScenarioDeckState; effects: Effect[]; resolved: ResolvedEvent | null } {
  if (!deckState.activeEvent || deckState.activeDeckId === null) {
    return { newDeckState: deckState, effects: [], resolved: null };
  }

  const event = deckState.activeEvent;
  const choice = event.choices[choiceIndex];
  if (!choice) {
    return { newDeckState: deckState, effects: [], resolved: null };
  }

  const mechanicEffects = choiceEffectsToMechanicEffects(choice.effects, profileId);
  const effectiveProfile = profileId ?? "apprentice";
  const copy = resolveScenarioEventCopy(event, effectiveProfile);

  // Add the explanation as a message
  mechanicEffects.push({
    type: "showMessage",
    text: `💡 ${copy.explanation}`,
    variant: "info",
  });

  const resolved: ResolvedEvent = {
    eventId: event.id,
    deckId: deckState.activeDeckId,
    choiceIndex,
    effects: choice.effects,
    timestamp: new Date().toISOString(),
    eventTitle: copy.title,
    eventIcon: event.icon,
    chosenLabel: choice.label,
    alternativeLabels: event.choices
      .filter((_, i) => i !== choiceIndex)
      .map((c) => c.label),
    explanation: copy.explanation,
    learningNote: choice.learningNote,
  };

  const newDeckState: ScenarioDeckState = {
    ...deckState,
    activeEvent: null,
    activeDeckId: null,
    history: [...deckState.history, resolved],
    drawCount: deckState.drawCount + 1,
  };

  return { newDeckState, effects: mechanicEffects, resolved };
}

// ---------------------------------------------------------------------------
// Get available choices (filtered by per-choice triggers)
// ---------------------------------------------------------------------------

export function getAvailableChoices(
  event: ScenarioEvent,
  gameState: GameState,
): { choice: EventChoice; index: number; available: boolean; reason?: string }[] {
  const profileId = gameState.learningProfileId;
  return event.choices.map((choice, index) => {
    if (!choice.triggers || choice.triggers.length === 0) {
      return { choice, index, available: true };
    }
    const passes = allTriggersPass(choice.triggers, gameState, profileId);
    return {
      choice,
      index,
      available: passes,
      reason: passes ? undefined : "Requirements not met",
    };
  });
}

// ---------------------------------------------------------------------------
// Simulate N draws (for dev tool)
// ---------------------------------------------------------------------------

export type SimulationResult = {
  draws: { eventId: string; title: string; count: number }[];
  totalDraws: number;
  excluded: { eventId: string; title: string; reasons: string[] }[];
};

export function simulateDraws(
  deck: EventDeck,
  gameState: GameState,
  n: number,
  tags?: string[],
  economyPhase?: EconomyPhase,
  rng: () => number = Math.random,
): SimulationResult {
  const { eligible, excluded } = filterEvents(deck.events, gameState, tags);

  const counts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const event = weightedDraw(eligible, economyPhase, rng);
    if (event) {
      counts[event.id] = (counts[event.id] || 0) + 1;
    }
  }

  const draws = Object.entries(counts)
    .map(([eventId, count]) => {
      const ev = eligible.find((e) => e.id === eventId);
      const title =
        typeof ev?.title === "string"
          ? ev.title
          : ev?.title
            ? resolveProfileText(ev.title, "apprentice")
            : eventId;
      return { eventId, title, count };
    })
    .sort((a, b) => b.count - a.count);

  return {
    draws,
    totalDraws: n,
    excluded: excluded.map(({ event, reasons }) => ({
      eventId: event.id,
      title:
        typeof event.title === "string"
          ? event.title
          : resolveProfileText(event.title, "apprentice"),
      reasons,
    })),
  };
}
