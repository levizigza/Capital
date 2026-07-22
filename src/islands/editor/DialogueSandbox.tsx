import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { IslandDefinition } from "../types";
import { resolveProfileText } from "../learningProfile";

// ---------------------------------------------------------------------------
// DialogueSandbox — interactive dialogue branch tester
// ---------------------------------------------------------------------------

type Props = { island: IslandDefinition };

export default function DialogueSandbox({ island }: Props) {
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(
    island.dialogues[0]?.id ?? null,
  );
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { nodeId: string; speaker: string; text: string; choiceLabel?: string }[]
  >([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [effectsLog, setEffectsLog] = useState<string[]>([]);

  const graph = island.dialogues.find((g) => g.id === selectedGraphId);
  const currentNode = graph?.nodes.find((n) => n.id === currentNodeId);

  const startDialogue = useCallback(
    (gId: string) => {
      const g = island.dialogues.find((d) => d.id === gId);
      if (!g) return;
      setSelectedGraphId(gId);
      setCurrentNodeId(g.startNodeId);
      setHistory([]);
      setInventory([]);
      setEffectsLog([]);
      const startNode = g.nodes.find((n) => n.id === g.startNodeId);
      if (startNode) {
        const text =
          typeof startNode.text === "string"
            ? startNode.text
            : JSON.stringify(startNode.text);
        setHistory([{ nodeId: startNode.id, speaker: startNode.speaker, text }]);
      }
    },
    [island],
  );

  const makeChoice = (choiceIdx: number) => {
    if (!currentNode?.choices?.[choiceIdx]) return;
    const choice = currentNode.choices[choiceIdx];
    const nextId = choice.nextNodeId;

    // Process effects
    for (const eff of choice.effects || []) {
      if (eff.type === "giveItem") {
        setInventory((prev) => [...prev, eff.itemId]);
        setEffectsLog((prev) => [...prev, `📦 Received item: ${eff.itemId}`]);
      }
      if (eff.type === "startQuest") {
        setEffectsLog((prev) => [...prev, `📜 Quest started: ${eff.questId}`]);
      }
      if (eff.type === "completeQuest") {
        setEffectsLog((prev) => [...prev, `✅ Quest completed: ${eff.questId}`]);
      }
      if (eff.type === "startMinigame") {
        setEffectsLog((prev) => [...prev, `🎮 Minigame triggered: ${eff.minigameId}`]);
      }
    }

    if (!nextId) {
      setHistory((prev) => [
        ...prev,
        {
          nodeId: "end",
          speaker: "System",
          text: "[Dialogue ended — no next node]",
          choiceLabel: resolveProfileText(choice.text, "apprentice"),
        },
      ]);
      setCurrentNodeId(null);
      return;
    }

    const nextNode = graph?.nodes.find((n) => n.id === nextId);
    if (!nextNode) {
      setHistory((prev) => [
        ...prev,
        {
          nodeId: "error",
          speaker: "System",
          text: `[ERROR: node "${nextId}" not found]`,
          choiceLabel: resolveProfileText(choice.text, "apprentice"),
        },
      ]);
      setCurrentNodeId(null);
      return;
    }

    const text =
      typeof nextNode.text === "string"
        ? nextNode.text
        : JSON.stringify(nextNode.text);
    setHistory((prev) => [
      ...prev,
      {
        nodeId: nextNode.id,
        speaker: nextNode.speaker,
        text,
        choiceLabel: resolveProfileText(choice.text, "apprentice"),
      },
    ]);
    setCurrentNodeId(nextNode.id);
  };

  return (
    <div className="space-y-4">
      {/* Graph selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold">Dialogue:</span>
        {island.dialogues.map((g) => (
          <Button
            key={g.id}
            size="sm"
            variant={selectedGraphId === g.id ? "default" : "outline"}
            className="text-xs"
            onClick={() => startDialogue(g.id)}
          >
            💬 {g.id} ({g.nodes.length} nodes)
          </Button>
        ))}
      </div>

      {/* State display */}
      <div className="flex gap-4 text-xs">
        {inventory.length > 0 && (
          <div>
            <span className="font-bold">Inventory:</span>{" "}
            {inventory.map((id) => `📦 ${id}`).join(", ")}
          </div>
        )}
        {effectsLog.length > 0 && (
          <div>
            <span className="font-bold">Effects fired:</span> {effectsLog.length}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat log */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Select a dialogue above to start testing.
            </div>
          ) : (
            history.map((entry, i) => (
              <div key={i}>
                {entry.choiceLabel && (
                  <div className="text-right mb-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs rounded-lg px-3 py-1">
                      You: {entry.choiceLabel}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 text-lg">
                    {entry.speaker === "System"
                      ? "⚙️"
                      : island.npcs.find((n) => n.name === entry.speaker)?.icon || "🗣️"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-700">{entry.speaker}</div>
                    <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border">
                      {entry.text}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                      node: {entry.nodeId}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Effects log sidebar */}
        <div className="bg-gray-50 border rounded-xl p-3 text-xs space-y-1 max-h-[500px] overflow-y-auto">
          <div className="font-bold text-gray-600 mb-2">Effects Log</div>
          {effectsLog.length === 0 ? (
            <div className="text-muted-foreground">No effects fired yet.</div>
          ) : (
            effectsLog.map((e, i) => (
              <div key={i} className="bg-white rounded px-2 py-1 border border-gray-200">
                {e}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Choices */}
      {currentNode && !currentNode.end && currentNode.choices && currentNode.choices.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-bold text-gray-500">Your choices:</div>
          {currentNode.choices.map((choice, i) => {
            const hasReqs =
              choice.requiresItems && choice.requiresItems.length > 0;
            const meetsReqs =
              !hasReqs ||
              choice.requiresItems!.every((id) => inventory.includes(id));
            return (
              <button
                key={choice.id}
                onClick={() => meetsReqs && makeChoice(i)}
                disabled={!meetsReqs}
                className={`block w-full text-left text-sm rounded-lg px-4 py-2 border transition-colors ${
                  meetsReqs
                    ? "bg-white hover:bg-blue-50 border-blue-200 text-blue-900 cursor-pointer"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {resolveProfileText(choice.text, "apprentice")}
                {hasReqs && !meetsReqs && (
                  <span className="text-[10px] text-red-500 ml-2">
                    🔒 Requires: {choice.requiresItems!.join(", ")}
                  </span>
                )}
                {choice.effects && choice.effects.length > 0 && (
                  <span className="text-[10px] text-gray-400 ml-2">
                    [{choice.effects.map((e) => e.type).join(", ")}]
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {currentNode?.end && (
        <div className="text-center text-sm font-bold text-green-600 py-2">
          ✅ Dialogue complete (end node reached)
        </div>
      )}
    </div>
  );
}
