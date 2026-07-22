import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { IslandDefinition, QuestObjective } from "../types";
import { resolveProfileText } from "../learningProfile";
import { createEmptyQuest, islandReferenceIds, validateIslandDefinition } from "./editorUtils";

type Props = {
  island: IslandDefinition;
  onApply: (island: IslandDefinition) => void;
};

export default function QuestEditorPanel({ island, onApply }: Props) {
  const refs = useMemo(() => islandReferenceIds(island), [island]);
  const [draft, setDraft] = useState<IslandDefinition>(island);
  const [questId, setQuestId] = useState(island.quests[0]?.id ?? "");

  useEffect(() => {
    setDraft(island);
    setQuestId((prev) =>
      island.quests.some((q) => q.id === prev) ? prev : island.quests[0]?.id ?? ""
    );
  }, [island]);

  const quest = draft.quests.find((q) => q.id === questId);
  const issues = useMemo(() => validateIslandDefinition(draft), [draft]);
  const errors = issues.filter((i) => i.level === "error");

  const updateQuests = (quests: IslandDefinition["quests"]) => {
    setDraft({ ...draft, quests });
  };

  const updateQuest = (updater: (q: NonNullable<typeof quest>) => NonNullable<typeof quest>) => {
    if (!quest) return;
    updateQuests(draft.quests.map((q) => (q.id === questId ? updater(q) : q)));
  };

  const addQuest = () => {
    const q = createEmptyQuest(draft);
    updateQuests([...draft.quests, q]);
    setQuestId(q.id);
  };

  const removeQuest = () => {
    if (!quest) return;
    const next = draft.quests.filter((q) => q.id !== questId);
    updateQuests(next);
    setQuestId(next[0]?.id ?? "");
  };

  const addObjective = (type: QuestObjective["type"]) => {
    if (!quest) return;
    let obj: QuestObjective;
    switch (type) {
      case "talkToNpc":
        obj = { type, npcId: refs.npcIds[0] ?? "" };
        break;
      case "collectItem":
        obj = { type, itemId: refs.itemIds[0] ?? "" };
        break;
      case "completeMinigame":
        obj = { type, minigameId: refs.minigameIds[0] ?? "" };
        break;
    }
    updateQuest((q) => ({ ...q, objectives: [...q.objectives, obj] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Create and edit quests + objectives with validated ID pickers.
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addQuest}>
            + New Quest
          </Button>
          <Button size="sm" onClick={() => errors.length === 0 && onApply(draft)} disabled={errors.length > 0}>
            ⚡ Apply & Hot-Reload
          </Button>
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800 max-h-24 overflow-y-auto">
          {errors.map((e, i) => (
            <div key={i}>
              {e.path}: {e.message}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs font-bold text-green-700">✅ All quest references valid</div>
      )}

      <div className="flex flex-wrap gap-2">
        {draft.quests.map((q) => (
          <Button
            key={q.id}
            size="sm"
            variant={q.id === questId ? "default" : "outline"}
            className="text-xs"
            onClick={() => setQuestId(q.id)}
          >
            {resolveProfileText(q.title, "apprentice")}
          </Button>
        ))}
      </div>

      {quest ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">Quest details</div>
                <Button size="sm" variant="ghost" className="text-xs text-red-600" onClick={removeQuest}>
                  Delete quest
                </Button>
              </div>
              <label className="block text-xs">
                ID
                <input
                  className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
                  value={quest.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    updateQuests(
                      draft.quests.map((q) => (q.id === questId ? { ...q, id: newId } : q))
                    );
                    setQuestId(newId);
                  }}
                />
              </label>
              <label className="block text-xs">
                Title
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={resolveProfileText(quest.title, "apprentice")}
                  onChange={(e) => updateQuest((q) => ({ ...q, title: e.target.value }))}
                />
              </label>
              <label className="block text-xs">
                Description
                <textarea
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  rows={2}
                  value={resolveProfileText(quest.description, "apprentice")}
                  onChange={(e) => updateQuest((q) => ({ ...q, description: e.target.value }))}
                />
              </label>
              <label className="block text-xs">
                Hint (wayfinding — name the place)
                <textarea
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  rows={2}
                  value={resolveProfileText(quest.hint, "apprentice")}
                  onChange={(e) => updateQuest((q) => ({ ...q, hint: e.target.value || undefined }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  Coins
                  <input
                    type="number"
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={quest.rewards?.coins ?? 0}
                    onChange={(e) =>
                      updateQuest((q) => ({
                        ...q,
                        rewards: { ...q.rewards, coins: Number(e.target.value) },
                      }))
                    }
                  />
                </label>
                <label className="block text-xs">
                  XP
                  <input
                    type="number"
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={quest.rewards?.xp ?? 0}
                    onChange={(e) =>
                      updateQuest((q) => ({
                        ...q,
                        rewards: { ...q.rewards, xp: Number(e.target.value) },
                      }))
                    }
                  />
                </label>
              </div>
              <label className="block text-xs">
                Reward items
                <select
                  multiple
                  className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs h-20"
                  value={quest.rewards?.items ?? []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                    updateQuest((q) => ({
                      ...q,
                      rewards: { ...q.rewards, items: selected.length ? selected : undefined },
                    }));
                  }}
                >
                  {refs.itemIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">Objectives ({quest.objectives.length})</div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => addObjective("talkToNpc")}>
                    + Talk
                  </Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => addObjective("collectItem")}>
                    + Item
                  </Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => addObjective("completeMinigame")}>
                    + Minigame
                  </Button>
                </div>
              </div>
              {quest.objectives.map((obj, i) => (
                <ObjectiveRow
                  key={i}
                  obj={obj}
                  refs={refs}
                  onChange={(next) =>
                    updateQuest((q) => ({
                      ...q,
                      objectives: q.objectives.map((o, j) => (j === i ? next : o)),
                    }))
                  }
                  onRemove={() =>
                    updateQuest((q) => ({
                      ...q,
                      objectives: q.objectives.filter((_, j) => j !== i),
                    }))
                  }
                  onMoveUp={
                    i > 0
                      ? () =>
                          updateQuest((q) => {
                            const objs = [...q.objectives];
                            [objs[i - 1], objs[i]] = [objs[i], objs[i - 1]];
                            return { ...q, objectives: objs };
                          })
                      : undefined
                  }
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No quests yet — click <strong>+ New Quest</strong> to create one.
        </div>
      )}
    </div>
  );
}

function ObjectiveRow({
  obj,
  refs,
  onChange,
  onRemove,
  onMoveUp,
}: {
  obj: QuestObjective;
  refs: ReturnType<typeof islandReferenceIds>;
  onChange: (o: QuestObjective) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-2 py-2 text-xs">
      <Badge variant="outline">{obj.type}</Badge>
      {obj.type === "talkToNpc" && (
        <select
          className="flex-1 rounded border px-1 py-1 font-mono"
          value={obj.npcId}
          onChange={(e) => onChange({ type: "talkToNpc", npcId: e.target.value })}
        >
          {refs.npcIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      )}
      {obj.type === "collectItem" && (
        <select
          className="flex-1 rounded border px-1 py-1 font-mono"
          value={obj.itemId}
          onChange={(e) => onChange({ type: "collectItem", itemId: e.target.value })}
        >
          {refs.itemIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      )}
      {obj.type === "completeMinigame" && (
        <select
          className="flex-1 rounded border px-1 py-1 font-mono"
          value={obj.minigameId}
          onChange={(e) => onChange({ type: "completeMinigame", minigameId: e.target.value })}
        >
          {refs.minigameIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      )}
      {onMoveUp ? (
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onMoveUp}>
          ↑
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600" onClick={onRemove}>
        ✕
      </Button>
    </div>
  );
}
