import { registerModule } from "../registry";
import type {
  MechanicModule,
  GameState,
  ModuleState,
  ModuleAction,
  ApplyResult,
  ModuleUIModel,
  Effect,
} from "../types";
import {
  createDeckState,
  drawFromDeck,
  resolveChoice,
  getAvailableChoices,
  choiceEffectsToMechanicEffects,
} from "@/content/events/engine";
import type { ScenarioDeckState, ResolvedEvent } from "@/content/events/types";
import {
  loadLearningProfile,
  resolveScenarioEventCopy,
} from "@/islands/learningProfile";
import { mulberry32 } from "@/lib/seededRng";

// ---------------------------------------------------------------------------
// EventDeckModule — Scenario Deck powered
// ---------------------------------------------------------------------------
// Draws scenario events from JSON-defined decks. Each event presents choices
// with effects, filtered by triggers, selected via weighted random draw.
// Config specifies which deck(s) to load and optional tag filters.
// ---------------------------------------------------------------------------

type EventDeckConfig = {
  /** Deck IDs to load (default: all available decks) */
  deckIds?: string[];
  /** Only draw events matching these tags (optional) */
  tags?: string[];
  /** Maximum events the player can resolve per session */
  maxDraws?: number;
  /** Optional seed for deterministic draws (QA / test runs) */
  seed?: number;
};

type EventDeckModuleState = {
  deckState: ScenarioDeckState;
  tags: string[];
  maxDraws: number;
  /** Which deck to draw from (cycles through loaded decks or sticks to one) */
  primaryDeckId: string;
  /** Resolved events for persistence */
  resolvedHistory: ResolvedEvent[];
  /** Base seed for deterministic RNG (QA only) */
  seed?: number;
};

function parseConfig(raw: Record<string, unknown>): EventDeckConfig {
  return {
    deckIds: (raw.deckIds as string[]) ?? undefined,
    tags: (raw.tags as string[]) ?? [],
    maxDraws: (raw.maxDraws as number) ?? 20,
    seed: typeof raw.seed === "number" ? raw.seed : undefined,
  };
}

const EventDeckModule: MechanicModule = {
  id: "EventDeck",
  displayName: "Event Deck",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const deckState = createDeckState(c.deckIds);
    const deckIds = Object.keys(deckState.decks);

    const state: EventDeckModuleState = {
      deckState,
      tags: c.tags ?? [],
      maxDraws: c.maxDraws ?? 20,
      primaryDeckId: deckIds[0] ?? "",
      resolvedHistory: [],
      seed: c.seed,
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as EventDeckModuleState;
    const now = Date.now();

    // --- Draw a new event ---
    if (action.type === "draw") {
      if (state.deckState.activeEvent) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "Resolve the current event first!", variant: "warning" }],
          telemetry: [],
        };
      }
      if (state.deckState.drawCount >= state.maxDraws) {
        return {
          newState: moduleState,
          effects: [
            { type: "showMessage", text: "No more events this session!", variant: "info" },
            { type: "endGame", success: true },
          ],
          telemetry: [],
        };
      }

      const rng =
        state.seed !== undefined
          ? mulberry32(state.seed + state.deckState.drawCount)
          : undefined;

      const profileId = gameState.learningProfileId ?? loadLearningProfile();

      const result = drawFromDeck(
        state.deckState,
        state.primaryDeckId,
        gameState,
        state.tags.length > 0 ? state.tags : undefined,
        gameState.economyPhase,
        rng,
      );

      if (!result.event) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "No eligible events right now.", variant: "info" }],
          telemetry: [{ event: "event_deck.no_eligible", data: { excluded: result.excluded.length }, ts: now }],
        };
      }

      const newDeckState: ScenarioDeckState = {
        ...state.deckState,
        activeEvent: result.event,
        activeDeckId: state.primaryDeckId,
      };
      const newState: EventDeckModuleState = { ...state, deckState: newDeckState };

      const eventCopy = resolveScenarioEventCopy(result.event, profileId);

      return {
        newState: newState as unknown as ModuleState,
        effects: [
          {
            type: "showMessage",
            text: `${result.event.icon ?? "📨"} ${eventCopy.title}`,
            variant: "info",
          },
        ],
        telemetry: [{ event: "event_deck.draw", data: { eventId: result.event.id, eligible: result.eligible.length, excluded: result.excluded.length }, ts: now }],
      };
    }

    // --- Choose an option for the active event ---
    if (action.type === "choose") {
      const choiceIndex = (action.payload?.choiceIndex as number) ?? 0;
      const profileId = gameState.learningProfileId ?? loadLearningProfile();
      const { newDeckState, effects: mechanicEffects, resolved } = resolveChoice(state.deckState, choiceIndex, profileId);

      if (!resolved) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "No active event to resolve.", variant: "warning" }],
          telemetry: [],
        };
      }

      const newState: EventDeckModuleState = {
        ...state,
        deckState: newDeckState,
        resolvedHistory: [...state.resolvedHistory, resolved],
      };

      return {
        newState: newState as unknown as ModuleState,
        effects: [
          ...mechanicEffects,
          { type: "advanceTurn" },
        ],
        telemetry: [{ event: "event_deck.choose", data: { eventId: resolved.eventId, choiceIndex, effectCount: resolved.effects.length }, ts: now }],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as EventDeckModuleState;
    const activeEvent = state.deckState.activeEvent;
    const profileId = gameState.learningProfileId ?? loadLearningProfile();

    const availableChoices = activeEvent
      ? getAvailableChoices(activeEvent, gameState)
      : [];

    const resolvedEvent = activeEvent
      ? resolveScenarioEventCopy(activeEvent, profileId)
      : null;

    return {
      moduleId: "EventDeck",
      label: "Event Deck",
      data: {
        activeEvent: activeEvent && resolvedEvent
          ? {
              id: activeEvent.id,
              title: resolvedEvent.title,
              prompt: resolvedEvent.prompt,
              icon: activeEvent.icon ?? "📨",
              explanation: resolvedEvent.explanation,
              choices: availableChoices.map((c) => ({
                label: c.choice.label,
                index: c.index,
                available: c.available,
                reason: c.reason,
              })),
            }
          : null,
        drawCount: state.deckState.drawCount,
        maxDraws: state.maxDraws,
        resolvedCount: state.resolvedHistory.length,
        hasActiveEvent: !!activeEvent,
      },
      availableActions: activeEvent
        ? availableChoices
            .filter((c) => c.available)
            .map((c) => ({
              type: "choose",
              label: c.choice.label,
              disabled: false,
            }))
        : [
            {
              type: "draw",
              label: "📨 Open Next Event",
              disabled: state.deckState.drawCount >= state.maxDraws,
            },
          ],
    };
  },
};

registerModule(EventDeckModule);
export default EventDeckModule;
