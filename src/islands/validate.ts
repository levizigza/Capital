import { IslandsContentSchema } from "./schemas";
import type { IslandDefinition, IslandsContent } from "./types";

export type ValidationIssue = {
  level: "error" | "warning";
  islandId: string;
  path: string;
  message: string;
};

/**
 * Validate an IslandsContent blob:
 * 1) Zod schema parse (structure + types)
 * 2) Cross-reference checks (dangling IDs, missing connections, etc.)
 * Returns a flat list of human-readable issues.
 */
export function validateIslandsContent(raw: unknown): {
  parsed: IslandsContent | null;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  // --- Step 1: Zod schema parse ---
  const result = IslandsContentSchema.safeParse(raw);
  if (!result.success) {
    for (const err of result.error.issues) {
      issues.push({
        level: "error",
        islandId: "",
        path: err.path.join("."),
        message: `Schema: ${err.message}`,
      });
    }
    return { parsed: null, issues };
  }

  const content = result.data as IslandsContent;

  // --- Step 2: Cross-reference checks per island ---
  for (const island of content.islands) {
    const ctx = island.id;
    const areaIds = new Set(island.areas.map((a) => a.id));
    const npcIds = new Set(island.npcs.map((n) => n.id));
    const itemIds = new Set(island.items.map((i) => i.id));
    const questIds = new Set(island.quests.map((q) => q.id));
    const dialogueIds = new Set(island.dialogues.map((d) => d.id));
    const minigameIds = new Set((island.minigames || []).map((m) => m.id));

    // Check for duplicate IDs
    checkDuplicates(island.areas.map((a) => a.id), ctx, "areas", issues);
    checkDuplicates(island.npcs.map((n) => n.id), ctx, "npcs", issues);
    checkDuplicates(island.items.map((i) => i.id), ctx, "items", issues);
    checkDuplicates(island.quests.map((q) => q.id), ctx, "quests", issues);
    checkDuplicates(island.dialogues.map((d) => d.id), ctx, "dialogues", issues);

    // Area connections → valid area IDs
    for (const area of island.areas) {
      for (const conn of area.connections || []) {
        if (!areaIds.has(conn)) {
          issues.push({ level: "error", islandId: ctx, path: `area[${area.id}].connections`, message: `Connection "${conn}" is not a valid area ID.` });
        }
      }
      for (const req of area.requiredItems || []) {
        if (!itemIds.has(req)) {
          issues.push({ level: "warning", islandId: ctx, path: `area[${area.id}].requiredItems`, message: `Required item "${req}" is not defined in this island's items. It may come from another island.` });
        }
      }
    }

    // NPC → areaId, dialogueGraphId
    for (const npc of island.npcs) {
      if (!areaIds.has(npc.areaId)) {
        issues.push({ level: "error", islandId: ctx, path: `npc[${npc.id}].areaId`, message: `Area "${npc.areaId}" does not exist.` });
      }
      if (!dialogueIds.has(npc.dialogueGraphId)) {
        issues.push({ level: "error", islandId: ctx, path: `npc[${npc.id}].dialogueGraphId`, message: `Dialogue graph "${npc.dialogueGraphId}" does not exist.` });
      }
    }

    // Item → location.areaId
    for (const item of island.items) {
      if (!areaIds.has(item.location.areaId)) {
        issues.push({ level: "error", islandId: ctx, path: `item[${item.id}].location.areaId`, message: `Area "${item.location.areaId}" does not exist.` });
      }
    }

    // Quest objectives → valid references
    for (const quest of island.quests) {
      for (const obj of quest.objectives) {
        if (obj.type === "talkToNpc" && !npcIds.has(obj.npcId)) {
          issues.push({ level: "error", islandId: ctx, path: `quest[${quest.id}].objective`, message: `NPC "${obj.npcId}" referenced in talkToNpc does not exist.` });
        }
        if (obj.type === "collectItem" && !itemIds.has(obj.itemId)) {
          issues.push({ level: "error", islandId: ctx, path: `quest[${quest.id}].objective`, message: `Item "${obj.itemId}" referenced in collectItem does not exist.` });
        }
        if (obj.type === "completeMinigame" && !minigameIds.has(obj.minigameId)) {
          issues.push({ level: "warning", islandId: ctx, path: `quest[${quest.id}].objective`, message: `Minigame "${obj.minigameId}" referenced in completeMinigame is not defined in this island's minigames array.` });
        }
      }
      // Quest reward items
      for (const rewardItemId of quest.rewards?.items || []) {
        if (!itemIds.has(rewardItemId)) {
          issues.push({ level: "warning", islandId: ctx, path: `quest[${quest.id}].rewards.items`, message: `Reward item "${rewardItemId}" is not defined in this island's items.` });
        }
      }
    }

    // Dialogue graphs → internal consistency
    for (const graph of island.dialogues) {
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      if (!nodeIds.has(graph.startNodeId)) {
        issues.push({ level: "error", islandId: ctx, path: `dialogue[${graph.id}].startNodeId`, message: `Start node "${graph.startNodeId}" does not exist in nodes.` });
      }
      for (const node of graph.nodes) {
        for (const choice of node.choices || []) {
          if (choice.nextNodeId && !nodeIds.has(choice.nextNodeId)) {
            issues.push({ level: "error", islandId: ctx, path: `dialogue[${graph.id}].node[${node.id}].choice[${choice.id}]`, message: `nextNodeId "${choice.nextNodeId}" does not exist.` });
          }
          for (const effect of choice.effects || []) {
            if (effect.type === "startQuest" && !questIds.has(effect.questId)) {
              issues.push({ level: "error", islandId: ctx, path: `dialogue[${graph.id}].node[${node.id}].choice[${choice.id}]`, message: `startQuest references unknown quest "${effect.questId}".` });
            }
            if (effect.type === "giveItem" && !itemIds.has(effect.itemId)) {
              issues.push({ level: "error", islandId: ctx, path: `dialogue[${graph.id}].node[${node.id}].choice[${choice.id}]`, message: `giveItem references unknown item "${effect.itemId}".` });
            }
            if (effect.type === "startMinigame" && !minigameIds.has(effect.minigameId)) {
              issues.push({ level: "warning", islandId: ctx, path: `dialogue[${graph.id}].node[${node.id}].choice[${choice.id}]`, message: `startMinigame references "${effect.minigameId}" which is not in minigames array.` });
            }
          }
          for (const reqItem of choice.requiresItems || []) {
            if (!itemIds.has(reqItem)) {
              issues.push({ level: "warning", islandId: ctx, path: `dialogue[${graph.id}].node[${node.id}].choice[${choice.id}]`, message: `requiresItems references "${reqItem}" not in this island's items.` });
            }
          }
        }
        // Warn if node is neither end nor has choices
        if (!node.end && (!node.choices || node.choices.length === 0)) {
          issues.push({ level: "warning", islandId: ctx, path: `dialogue[${graph.id}].node[${node.id}]`, message: `Node has no choices and is not marked as end. Player will be stuck.` });
        }
      }
    }

    // Minigame → areaId
    for (const mg of island.minigames || []) {
      if (mg.areaId && !areaIds.has(mg.areaId)) {
        issues.push({ level: "error", islandId: ctx, path: `minigame[${mg.id}].areaId`, message: `Area "${mg.areaId}" does not exist.` });
      }
    }

    // Warn: island has no areas
    if (island.areas.length === 0) {
      issues.push({ level: "warning", islandId: ctx, path: "areas", message: "Island has no areas defined." });
    }
  }

  // Check for duplicate island IDs across content
  checkDuplicates(content.islands.map((i) => i.id), "", "islands", issues);

  return { parsed: content, issues };
}

function checkDuplicates(ids: string[], islandId: string, category: string, issues: ValidationIssue[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      issues.push({ level: "error", islandId, path: category, message: `Duplicate ${category} ID: "${id}".` });
    }
    seen.add(id);
  }
}

/**
 * Quick summary stats for an island (for the editor).
 */
export function islandStats(island: IslandDefinition) {
  return {
    areas: island.areas.length,
    npcs: island.npcs.length,
    items: island.items.length,
    quests: island.quests.length,
    dialogues: island.dialogues.length,
    minigames: (island.minigames || []).length,
    dialogueNodes: island.dialogues.reduce((s, g) => s + g.nodes.length, 0),
  };
}
