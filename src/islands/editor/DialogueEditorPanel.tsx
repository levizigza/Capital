import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type {
  DialogueChoice,
  DialogueEffect,
  DialogueGraph,
  DialogueNode,
  IslandDefinition,
} from "../types";
import { resolveProfileText } from "../learningProfile";
import {
  createBranchNode,
  islandReferenceIds,
  nextChoiceId,
  validateIslandDefinition,
} from "./editorUtils";

type Props = {
  island: IslandDefinition;
  onApply: (island: IslandDefinition) => void;
};

export default function DialogueEditorPanel({ island, onApply }: Props) {
  const refs = useMemo(() => islandReferenceIds(island), [island]);
  const [draft, setDraft] = useState<IslandDefinition>(island);
  const [graphId, setGraphId] = useState(island.dialogues[0]?.id ?? "");
  const [nodeId, setNodeId] = useState(island.dialogues[0]?.startNodeId ?? "");

  useEffect(() => {
    setDraft(island);
    setGraphId(island.dialogues[0]?.id ?? "");
    setNodeId(island.dialogues[0]?.startNodeId ?? "");
  }, [island]);

  const issues = useMemo(() => validateIslandDefinition(draft), [draft]);
  const errors = issues.filter((i) => i.level === "error");

  const graph = draft.dialogues.find((g) => g.id === graphId);
  const node = graph?.nodes.find((n) => n.id === nodeId);

  const syncIsland = useCallback((next: IslandDefinition) => {
    setDraft(next);
  }, []);

  const updateGraph = (updater: (g: DialogueGraph) => DialogueGraph) => {
    if (!graph) return;
    syncIsland({
      ...draft,
      dialogues: draft.dialogues.map((g) => (g.id === graphId ? updater(g) : g)),
    });
  };

  const updateNode = (updater: (n: DialogueNode) => DialogueNode) => {
    if (!graph || !node) return;
    updateGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) => (n.id === nodeId ? updater(n) : n)),
    }));
  };

  const handleApply = () => {
    if (errors.length === 0) onApply(draft);
  };

  const addNode = () => {
    if (!graph) return;
    const npc = island.npcs.find((n) => n.dialogueGraphId === graphId);
    const newNode = createBranchNode(
      graphId,
      graph.nodes,
      npc?.name ?? "NPC",
      "New dialogue line."
    );
    updateGraph((g) => ({ ...g, nodes: [...g.nodes, newNode] }));
    setNodeId(newNode.id);
  };

  const addQuestBranch = () => {
    if (!graph || !node) return;
    const npc = island.npcs.find((n) => n.dialogueGraphId === graphId);
    const newNode = createBranchNode(
      graphId,
      graph.nodes,
      npc?.name ?? node.speaker,
      "Branch outcome — edit me."
    );
    const questId = draft.quests[draft.quests.length - 1]?.id;
    const choiceId = nextChoiceId(node.id, node.choices);
    const choice: DialogueChoice = {
      id: choiceId,
      text: "New quest branch",
      nextNodeId: newNode.id,
      effects: questId ? [{ type: "startQuest", questId }] : undefined,
    };

    updateGraph((g) => ({
      ...g,
      nodes: g.nodes
        .map((n) => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            end: false,
            choices: [...(n.choices ?? []), choice],
          };
        })
        .concat(newNode),
    }));
    setNodeId(newNode.id);
  };

  const addChoice = () => {
    if (!node) return;
    const choiceId = nextChoiceId(node.id, node.choices);
    updateNode((n) => ({
      ...n,
      end: false,
      choices: [
        ...(n.choices ?? []),
        { id: choiceId, text: "New choice", nextNodeId: graph?.startNodeId },
      ],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Edit dialogue nodes, choices, and branch effects — apply to hot-reload in-game.
        </div>
        <Button size="sm" onClick={handleApply} disabled={errors.length > 0}>
          ⚡ Apply & Hot-Reload
        </Button>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {errors.slice(0, 5).map((e, i) => (
            <div key={i}>
              {e.path}: {e.message}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs font-bold text-green-700">✅ References valid</div>
      )}

      <div className="flex flex-wrap gap-2">
        <label className="text-xs font-bold">
          Graph{" "}
          <select
            className="ml-1 rounded border px-2 py-1 font-mono text-xs"
            value={graphId}
            onChange={(e) => {
              const g = draft.dialogues.find((d) => d.id === e.target.value);
              setGraphId(e.target.value);
              setNodeId(g?.startNodeId ?? "");
            }}
          >
            {draft.dialogues.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Node{" "}
          <select
            className="ml-1 rounded border px-2 py-1 font-mono text-xs"
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
          >
            {(graph?.nodes ?? []).map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} {n.end ? "[END]" : ""}
              </option>
            ))}
          </select>
        </label>
        <Button size="sm" variant="outline" className="text-xs" onClick={addNode}>
          + Node
        </Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={addQuestBranch}>
          + Quest branch
        </Button>
      </div>

      {node && graph ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="text-sm font-bold">Node: {node.id}</div>
              <label className="block text-xs">
                Speaker
                <select
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={node.speaker}
                  onChange={(e) => updateNode((n) => ({ ...n, speaker: e.target.value }))}
                >
                  {island.npcs.map((n) => (
                    <option key={n.id} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                  <option value={node.speaker}>{node.speaker} (custom)</option>
                </select>
              </label>
              <label className="block text-xs">
                Text
                <textarea
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  rows={4}
                  value={typeof node.text === "string" ? node.text : JSON.stringify(node.text)}
                  onChange={(e) => updateNode((n) => ({ ...n, text: e.target.value }))}
                />
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!!node.end}
                  onChange={(e) =>
                    updateNode((n) => ({
                      ...n,
                      end: e.target.checked,
                      choices: e.target.checked ? undefined : n.choices ?? [],
                    }))
                  }
                />
                End node (no choices)
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">Choices ({node.choices?.length ?? 0})</div>
                {!node.end && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={addChoice}>
                    + Choice
                  </Button>
                )}
              </div>
              {(node.choices ?? []).map((choice, ci) => (
                <ChoiceEditor
                  key={choice.id}
                  choice={choice}
                  nodeIds={graph.nodes.map((n) => n.id)}
                  refs={refs}
                  onChange={(next) =>
                    updateNode((n) => ({
                      ...n,
                      choices: (n.choices ?? []).map((c, i) => (i === ci ? next : c)),
                    }))
                  }
                  onRemove={() =>
                    updateNode((n) => ({
                      ...n,
                      choices: (n.choices ?? []).filter((_, i) => i !== ci),
                    }))
                  }
                />
              ))}
              {node.end && (
                <div className="text-xs text-muted-foreground italic">End node — no choices.</div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <details className="text-xs">
        <summary className="cursor-pointer font-bold text-gray-500">Graph map</summary>
        <pre className="mt-2 overflow-auto rounded bg-gray-900 p-2 text-[10px] text-green-300">
          {graph?.nodes
            .map((n) => {
              const outs =
                n.choices?.map((c) => `${c.id}→${c.nextNodeId ?? "?"}`).join(", ") ?? (n.end ? "END" : "?");
              return `${n.id} [${n.speaker}]: ${outs}`;
            })
            .join("\n")}
        </pre>
      </details>
    </div>
  );
}

function ChoiceEditor({
  choice,
  nodeIds,
  refs,
  onChange,
  onRemove,
}: {
  choice: DialogueChoice;
  nodeIds: string[];
  refs: ReturnType<typeof islandReferenceIds>;
  onChange: (c: DialogueChoice) => void;
  onRemove: () => void;
}) {
  const addEffect = (type: DialogueEffect["type"]) => {
    let effect: DialogueEffect;
    switch (type) {
      case "startQuest":
        effect = { type, questId: refs.questIds[0] ?? "" };
        break;
      case "completeQuest":
        effect = { type, questId: refs.questIds[0] ?? "" };
        break;
      case "giveItem":
        effect = { type, itemId: refs.itemIds[0] ?? "" };
        break;
      case "startMinigame":
        effect = { type, minigameId: refs.minigameIds[0] ?? "" };
        break;
    }
    onChange({ ...choice, effects: [...(choice.effects ?? []), effect] });
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-2 space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1 text-xs"
          value={resolveProfileText(choice.text, "apprentice")}
          onChange={(e) => onChange({ ...choice, text: e.target.value })}
          placeholder="Choice label"
        />
        <Button size="sm" variant="ghost" className="text-xs h-8" onClick={onRemove}>
          ✕
        </Button>
      </div>
      <label className="block text-[10px]">
        Next node
        <select
          className="mt-0.5 w-full rounded border px-1 py-1 font-mono"
          value={choice.nextNodeId ?? ""}
          onChange={(e) => onChange({ ...choice, nextNodeId: e.target.value || undefined })}
        >
          <option value="">— none —</option>
          {nodeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-1">
        {(choice.effects ?? []).map((eff, ei) => (
          <EffectRow
            key={ei}
            effect={eff}
            refs={refs}
            onChange={(next) => {
              const effects = [...(choice.effects ?? [])];
              effects[ei] = next;
              onChange({ ...choice, effects });
            }}
            onRemove={() =>
              onChange({ ...choice, effects: (choice.effects ?? []).filter((_, i) => i !== ei) })
            }
          />
        ))}
        <div className="flex flex-wrap gap-1">
          {(["startQuest", "giveItem", "completeQuest", "startMinigame"] as const).map((t) => (
            <Button key={t} size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => addEffect(t)}>
              + {t}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EffectRow({
  effect,
  refs,
  onChange,
  onRemove,
}: {
  effect: DialogueEffect;
  refs: ReturnType<typeof islandReferenceIds>;
  onChange: (e: DialogueEffect) => void;
  onRemove: () => void;
}) {
  const idOptions =
    effect.type === "startQuest" || effect.type === "completeQuest"
      ? refs.questIds
      : effect.type === "giveItem"
        ? refs.itemIds
        : refs.minigameIds;

  const idKey =
    effect.type === "startQuest" || effect.type === "completeQuest"
      ? "questId"
      : effect.type === "giveItem"
        ? "itemId"
        : "minigameId";

  const value = (effect as Record<string, string>)[idKey];
  const invalid = value && !idOptions.includes(value);

  return (
    <div className="flex items-center gap-1 text-[10px]">
      <Badge variant="secondary">{effect.type}</Badge>
      <select
        className={`flex-1 rounded border px-1 py-0.5 font-mono ${invalid ? "border-red-400" : ""}`}
        value={value}
        onChange={(e) => onChange({ ...effect, [idKey]: e.target.value } as DialogueEffect)}
      >
        {idOptions.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      {invalid ? <span className="text-red-600">invalid</span> : null}
      <button type="button" className="text-red-500" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}
