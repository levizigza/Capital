import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IslandDefinition, QuestObjective, QuestStatus } from "../types";

// ---------------------------------------------------------------------------
// QuestSandbox — simulate completing objectives + show state changes
// ---------------------------------------------------------------------------

function objectiveKey(obj: QuestObjective): string {
  if (obj.type === "talkToNpc") return `talkToNpc:${obj.npcId}`;
  if (obj.type === "collectItem") return `collectItem:${obj.itemId}`;
  return `completeMinigame:${obj.minigameId}`;
}

function objectiveLabel(obj: QuestObjective): string {
  if (obj.type === "talkToNpc") return `Talk to ${obj.npcId}`;
  if (obj.type === "collectItem") return `Collect ${obj.itemId}`;
  return `Complete minigame ${obj.minigameId}`;
}

type Props = { island: IslandDefinition };

export default function QuestSandbox({ island }: Props) {
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
    island.quests[0]?.id ?? null,
  );
  const [questState, setQuestState] = useState<QuestStatus>({
    started: false,
    completed: false,
    completedObjectives: [],
  });
  const [log, setLog] = useState<string[]>([]);

  const quest = island.quests.find((q) => q.id === selectedQuestId);

  const resetQuest = useCallback((qId: string) => {
    setSelectedQuestId(qId);
    setQuestState({ started: false, completed: false, completedObjectives: [] });
    setLog([]);
  }, []);

  const startQuest = () => {
    setQuestState((prev) => ({
      ...prev,
      started: true,
      startedAt: new Date().toISOString(),
    }));
    setLog((prev) => [...prev, `▶ Quest started: "${quest?.title}"`]);
  };

  const completeObjective = (obj: QuestObjective, idx: number) => {
    const key = objectiveKey(obj);
    if (questState.completedObjectives.includes(key)) return;

    const newCompleted = [...questState.completedObjectives, key];
    const allDone = quest
      ? quest.objectives.every((o) => newCompleted.includes(objectiveKey(o)))
      : false;

    setQuestState((prev) => ({
      ...prev,
      completedObjectives: newCompleted,
      completed: allDone,
      completedAt: allDone ? new Date().toISOString() : prev.completedAt,
    }));

    setLog((prev) => [
      ...prev,
      `✅ Objective ${idx + 1} completed: ${objectiveLabel(obj)}`,
      ...(allDone
        ? [
            `🎉 Quest complete! "${quest?.title}"`,
            ...(quest?.rewards
              ? [
                  `   Rewards:${quest.rewards.coins ? ` ${quest.rewards.coins} coins` : ""}${quest.rewards.xp ? ` ${quest.rewards.xp} XP` : ""}${quest.rewards.items?.length ? ` Items: ${quest.rewards.items.join(", ")}` : ""}`,
                ]
              : []),
          ]
        : [
            `   Progress: ${newCompleted.length}/${quest?.objectives.length} objectives`,
          ]),
    ]);
  };

  const completeAll = () => {
    if (!quest) return;
    quest.objectives.forEach((obj, i) => {
      const key = objectiveKey(obj);
      if (!questState.completedObjectives.includes(key)) {
        completeObjective(obj, i);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Quest selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold">Quest:</span>
        {island.quests.map((q) => (
          <Button
            key={q.id}
            size="sm"
            variant={selectedQuestId === q.id ? "default" : "outline"}
            className="text-xs"
            onClick={() => resetQuest(q.id)}
          >
            📜 {q.title}
          </Button>
        ))}
      </div>

      {quest && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quest info + controls */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="font-bold text-sm">{quest.title}</div>
                <div className="text-xs font-mono text-muted-foreground">{quest.id}</div>
                <div className="text-xs text-muted-foreground mt-1">{quest.description}</div>
                {quest.hint && (
                  <div className="text-xs text-blue-700 italic mt-1">💡 {quest.hint}</div>
                )}
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={
                    questState.completed
                      ? "default"
                      : questState.started
                        ? "outline"
                        : "secondary"
                  }
                >
                  {questState.completed
                    ? "✅ Completed"
                    : questState.started
                      ? "🔄 In Progress"
                      : "⏸ Not Started"}
                </Badge>
                {!questState.started && (
                  <Button size="sm" onClick={startQuest} className="text-xs">
                    ▶ Start Quest
                  </Button>
                )}
                {questState.started && !questState.completed && (
                  <Button size="sm" variant="outline" onClick={completeAll} className="text-xs">
                    ⚡ Complete All
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetQuest(quest.id)}
                  className="text-xs"
                >
                  ↩️ Reset
                </Button>
              </div>

              {/* Objectives */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Objectives
                </div>
                {quest.objectives.map((obj, i) => {
                  const key = objectiveKey(obj);
                  const done = questState.completedObjectives.includes(key);
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border transition-colors ${
                        done
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <span className="font-mono text-[10px] flex-shrink-0">
                        {done ? "✅" : `${i + 1}.`}
                      </span>
                      <span className="flex-1">{objectiveLabel(obj)}</span>
                      {questState.started && !done && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[10px] h-6 px-2"
                          onClick={() => completeObjective(obj, i)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rewards */}
              {quest.rewards && (
                <div className="text-xs">
                  <span className="font-bold text-gray-500">Rewards: </span>
                  {quest.rewards.coins ? (
                    <Badge variant="secondary" className="mr-1">
                      🪙 {quest.rewards.coins}
                    </Badge>
                  ) : null}
                  {quest.rewards.xp ? (
                    <Badge variant="secondary" className="mr-1">
                      ✨ {quest.rewards.xp} XP
                    </Badge>
                  ) : null}
                  {quest.rewards.items?.map((id) => (
                    <Badge key={id} variant="secondary" className="mr-1">
                      📦 {id}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* State log */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="font-bold text-sm">State Changes Log</div>
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {log.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-4 text-center">
                    Start the quest to see state changes.
                  </div>
                ) : (
                  log.map((entry, i) => (
                    <div
                      key={i}
                      className={`text-xs rounded px-2 py-1 font-mono ${
                        entry.startsWith("🎉")
                          ? "bg-green-50 text-green-800 font-bold"
                          : entry.startsWith("✅")
                            ? "bg-blue-50 text-blue-800"
                            : entry.startsWith("▶")
                              ? "bg-purple-50 text-purple-800"
                              : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {entry}
                    </div>
                  ))
                )}
              </div>

              {/* Raw state */}
              <details className="text-xs">
                <summary className="cursor-pointer font-bold text-gray-500">
                  Raw QuestStatus JSON
                </summary>
                <pre className="bg-gray-900 text-green-300 rounded p-2 mt-1 text-[10px] overflow-x-auto">
                  {JSON.stringify(questState, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      )}

      {!quest && (
        <div className="text-center py-8 text-muted-foreground">
          No quests defined for this island.
        </div>
      )}
    </div>
  );
}
