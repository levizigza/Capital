import type { IslandDefinition } from "../types";
import { validateIslandsContent, type ValidationIssue } from "../validate";

export function slugId(prefix: string, label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
  return slug ? `${prefix}_${slug}` : `${prefix}_${Date.now()}`;
}

export function nextDialogueNodeId(graphId: string, nodes: { id: string }[]): string {
  const base = graphId.replace(/^dlg_/, "").slice(0, 4) || "n";
  let i = nodes.length + 1;
  let id = `${base}${i}`;
  const ids = new Set(nodes.map((n) => n.id));
  while (ids.has(id)) {
    i++;
    id = `${base}${i}`;
  }
  return id;
}

export function nextChoiceId(nodeId: string, choices: { id: string }[] = []): string {
  const prefix = `${nodeId}_`;
  let i = choices.length + 1;
  let id = `${prefix}c${i}`;
  const ids = new Set(choices.map((c) => c.id));
  while (ids.has(id)) {
    i++;
    id = `${prefix}c${i}`;
  }
  return id;
}

export function validateIslandDefinition(island: IslandDefinition): ValidationIssue[] {
  return validateIslandsContent({ version: "1", islands: [island] }).issues.filter(
    (i) => i.islandId === island.id || i.islandId === ""
  );
}

export function islandReferenceIds(island: IslandDefinition) {
  return {
    areaIds: island.areas.map((a) => a.id),
    npcIds: island.npcs.map((n) => n.id),
    itemIds: island.items.map((i) => i.id),
    questIds: island.quests.map((q) => q.id),
    dialogueIds: island.dialogues.map((d) => d.id),
    minigameIds: (island.minigames ?? []).map((m) => m.id),
    nodeIdsByGraph: Object.fromEntries(
      island.dialogues.map((g) => [g.id, g.nodes.map((n) => n.id)])
    ),
  };
}

export function createEmptyQuest(island: IslandDefinition, title = "New Quest"): IslandDefinition["quests"][0] {
  const id = slugId("q", title);
  const npcId = island.npcs[0]?.id ?? "npc_placeholder";
  return {
    id,
    title,
    description: "Describe what the player must do.",
    hint: island.areas[0] ? `Start at ${island.areas[0].name}.` : undefined,
    objectives: [{ type: "talkToNpc", npcId }],
    rewards: { coins: 10, xp: 20 },
  };
}

export function createBranchNode(
  graphId: string,
  existingNodes: { id: string }[],
  speaker: string,
  text: string
): { id: string; speaker: string; text: string; end: boolean } {
  return {
    id: nextDialogueNodeId(graphId, existingNodes),
    speaker,
    text,
    end: true,
  };
}
