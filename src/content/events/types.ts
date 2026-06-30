// ---------------------------------------------------------------------------
// Scenario Deck — Event Types
// ---------------------------------------------------------------------------
// All event content is data-driven via JSON. These types define the schema
// for event cards, triggers, choices, and effects.
// ---------------------------------------------------------------------------

import type { ProfileNumber, ProfileText } from "@/islands/learningProfile";

/** Numeric trigger threshold — plain number or per-profile variant. */
export type TriggerValue = number | ProfileNumber;

/** A condition that must be true for an event to be eligible. */
export type EventTrigger =
  | { type: "minMoney"; value: TriggerValue }
  | { type: "maxMoney"; value: TriggerValue }
  | { type: "minScore"; value: TriggerValue }
  | { type: "hasFlag"; key: string; value: boolean }
  | { type: "minCounter"; key: string; value: number }
  | { type: "maxCounter"; key: string; value: number }
  | { type: "minTurn"; value: number }
  | { type: "maxTurn"; value: number }
  | { type: "difficulty"; value: "easy" | "normal" | "hard" }
  | { type: "tag"; value: string };

/** An effect produced by choosing an option. */
export type EventEffect =
  | { type: "money"; amount: number }
  | { type: "debt"; amount: number }
  | { type: "inventory"; itemId: string; action: "add" | "remove" }
  | { type: "reputation"; amount: number }
  | { type: "questProgress"; questId: string; objectiveId: string }
  | { type: "skillStats"; skill: string; delta: number }
  | { type: "flag"; key: string; value: boolean }
  | { type: "counter"; key: string; delta: number }
  | { type: "score"; amount: number };

/** A choice the player can make when an event fires. */
export type EventChoice = {
  label: string;
  effects: EventEffect[];
  /** Optional condition: choice only appears if triggers pass */
  triggers?: EventTrigger[];
  /** Optional learning note shown in the "Why it happened" replay */
  learningNote?: string;
};

/** A single scenario event card. */
export type ScenarioEvent = {
  id: string;
  title: ProfileText;
  prompt: ProfileText;
  icon?: string;
  triggers: EventTrigger[];
  choices: EventChoice[];
  explanation: ProfileText;
  weight: number;
  tags: string[];
};

/** A named event deck loaded from a JSON file. */
export type EventDeck = {
  deckId: string;
  displayName: string;
  events: ScenarioEvent[];
};

/** An event that was drawn and resolved — stored in save for replay/audit. */
export type ResolvedEvent = {
  eventId: string;
  deckId: string;
  choiceIndex: number;
  effects: EventEffect[];
  timestamp: string;
  /** Replay-friendly fields (populated by resolveChoice) */
  eventTitle?: string;
  eventIcon?: string;
  chosenLabel?: string;
  alternativeLabels?: string[];
  explanation?: string;
  learningNote?: string;
};

/** State tracked by the scenario deck engine at runtime. */
export type ScenarioDeckState = {
  /** All loaded decks keyed by deckId */
  decks: Record<string, EventDeck>;
  /** The currently presented event (null = none active) */
  activeEvent: ScenarioEvent | null;
  activeDeckId: string | null;
  /** Events resolved this session */
  history: ResolvedEvent[];
  /** Total draws this session */
  drawCount: number;
};
