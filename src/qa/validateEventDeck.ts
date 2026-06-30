import { z } from "zod";

import type { EventDeck } from "@/content/events/types";

const EventTriggerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("minMoney"), value: z.number() }),
  z.object({ type: z.literal("maxMoney"), value: z.number() }),
  z.object({ type: z.literal("minScore"), value: z.number() }),
  z.object({ type: z.literal("hasFlag"), key: z.string(), value: z.boolean() }),
  z.object({ type: z.literal("minCounter"), key: z.string(), value: z.number() }),
  z.object({ type: z.literal("maxCounter"), key: z.string(), value: z.number() }),
  z.object({ type: z.literal("minTurn"), value: z.number() }),
  z.object({ type: z.literal("maxTurn"), value: z.number() }),
  z.object({ type: z.literal("difficulty"), value: z.enum(["easy", "normal", "hard"]) }),
  z.object({ type: z.literal("tag"), value: z.string() }),
]);

const EventEffectSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("money"), amount: z.number() }),
  z.object({ type: z.literal("debt"), amount: z.number() }),
  z.object({
    type: z.literal("inventory"),
    itemId: z.string(),
    action: z.enum(["add", "remove"]),
  }),
  z.object({ type: z.literal("reputation"), amount: z.number() }),
  z.object({
    type: z.literal("questProgress"),
    questId: z.string(),
    objectiveId: z.string(),
  }),
  z.object({ type: z.literal("skillStats"), skill: z.string(), delta: z.number() }),
  z.object({ type: z.literal("flag"), key: z.string(), value: z.boolean() }),
  z.object({ type: z.literal("counter"), key: z.string(), delta: z.number() }),
  z.object({ type: z.literal("score"), amount: z.number() }),
]);

export const EventDeckSchema = z.object({
  deckId: z.string().min(1),
  displayName: z.string().min(1),
  events: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        prompt: z.string().min(1),
        icon: z.string().optional(),
        triggers: z.array(EventTriggerSchema),
        choices: z
          .array(
            z.object({
              label: z.string().min(1),
              effects: z.array(EventEffectSchema),
              triggers: z.array(EventTriggerSchema).optional(),
              learningNote: z.string().optional(),
            }),
          )
          .min(1),
        explanation: z.string().min(1),
        weight: z.number().positive(),
        tags: z.array(z.string()),
      }),
    )
    .min(1),
});

export type EventDeckValidationIssue = {
  deckId: string;
  path: string;
  message: string;
};

export function validateEventDeck(raw: unknown): {
  parsed: EventDeck | null;
  issues: EventDeckValidationIssue[];
} {
  const issues: EventDeckValidationIssue[] = [];
  const result = EventDeckSchema.safeParse(raw);

  if (!result.success) {
    for (const err of result.error.issues) {
      issues.push({
        deckId: typeof (raw as EventDeck)?.deckId === "string" ? (raw as EventDeck).deckId : "",
        path: err.path.join("."),
        message: err.message,
      });
    }
    return { parsed: null, issues };
  }

  const deck = result.data as EventDeck;
  const eventIds = new Set<string>();

  for (const event of deck.events) {
    if (eventIds.has(event.id)) {
      issues.push({
        deckId: deck.deckId,
        path: `events.${event.id}`,
        message: `Duplicate event id "${event.id}".`,
      });
    }
    eventIds.add(event.id);

    if (event.weight <= 0) {
      issues.push({
        deckId: deck.deckId,
        path: `events.${event.id}.weight`,
        message: "Weight must be positive.",
      });
    }
  }

  return { parsed: deck, issues };
}
