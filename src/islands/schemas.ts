import { z } from "zod";

/** Text that is either a plain string or per-profile variants object. */
const ProfileTextSchema = z.union([
  z.string(),
  z.object({
    explorer: z.string().optional(),
    apprentice: z.string().optional(),
    strategist: z.string().optional(),
  }),
]);

/** Number that is either a plain number or per-profile variants object. */
const ProfileNumberSchema = z.union([
  z.number(),
  z.object({
    explorer: z.number().optional(),
    apprentice: z.number().optional(),
    strategist: z.number().optional(),
  }),
]);

export const DialogueEffectSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("startQuest"), questId: z.string() }),
  z.object({ type: z.literal("completeQuest"), questId: z.string() }),
  z.object({ type: z.literal("giveItem"), itemId: z.string() }),
  z.object({ type: z.literal("startMinigame"), minigameId: z.string() }),
]);

export const DialogueChoiceSchema = z.object({
  id: z.string(),
  text: ProfileTextSchema,
  nextNodeId: z.string().optional(),
  effects: z.array(DialogueEffectSchema).optional(),
  requiresItems: z.array(z.string()).optional(),
});

export const DialogueNodeSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  text: ProfileTextSchema,
  choices: z.array(DialogueChoiceSchema).optional(),
  end: z.boolean().optional(),
});

export const DialogueGraphSchema = z.object({
  id: z.string(),
  startNodeId: z.string(),
  nodes: z.array(DialogueNodeSchema),
});

export const QuestObjectiveSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("talkToNpc"), npcId: z.string() }),
  z.object({ type: z.literal("collectItem"), itemId: z.string() }),
  z.object({ type: z.literal("completeMinigame"), minigameId: z.string(), scoreThreshold: ProfileNumberSchema.optional() }),
]);

export const IslandQuestSchema = z.object({
  id: z.string(),
  title: ProfileTextSchema,
  description: ProfileTextSchema,
  hint: ProfileTextSchema.optional(),
  objectives: z.array(QuestObjectiveSchema),
  rewards: z
    .object({
      coins: z.number().optional(),
      xp: z.number().optional(),
      items: z.array(z.string()).optional(),
    })
    .optional(),
});

export const IslandItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  location: z.object({ areaId: z.string() }),
});

export const IslandNpcSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  areaId: z.string(),
  dialogueGraphId: z.string(),
  tagline: z.string().optional(),
  mascotId: z.string().optional(),
});

export const IslandAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  connections: z.array(z.string()).optional(),
  requiredItems: z.array(z.string()).optional(),
});

export const MinigameModuleRefSchema = z.object({
  id: z.string(),
  config: z.record(z.unknown()),
});

export const IslandMinigameSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  componentId: z.string(),
  areaId: z.string().optional(),
  modules: z.array(MinigameModuleRefSchema).optional(),
  genre: z.string().optional(),
  complexity: z.enum(["easy", "medium", "hard"]).optional(),
  visualShell: z.string().optional(),
  estimatedMinutes: z.number().optional(),
  homage: z.string().optional(),
});

export const ContentProvenanceSchema = z.object({
  learning_objectives: z.array(z.string()),
  mechanics_used: z.array(z.string()),
  originality_notes: z.string(),
  forbidden_references: z.array(z.string()),
});

export const IslandDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  themeId: z.string().optional(),
  requiredItems: z.array(z.string()).optional(),
  provenance: ContentProvenanceSchema.optional(),
  areas: z.array(IslandAreaSchema),
  npcs: z.array(IslandNpcSchema),
  items: z.array(IslandItemSchema),
  quests: z.array(IslandQuestSchema),
  dialogues: z.array(DialogueGraphSchema),
  minigames: z.array(IslandMinigameSchema).optional(),
});

export const IslandsContentSchema = z.object({
  version: z.string(),
  islands: z.array(IslandDefinitionSchema),
});
