import React, { useState, useMemo } from "react";
import { X } from "@phosphor-icons/react";
import {
  loadAllDecks,
  simulateDraws,
  type SimulationResult,
} from "@/content/events/engine";
import { createDefaultGameState } from "@/mechanics/engine";
import type { GameState } from "@/mechanics/types";
import type { EventDeck } from "@/content/events/types";

// ---------------------------------------------------------------------------
// ScenarioDeckSimulator — Dev-only tool
// ---------------------------------------------------------------------------
// Lets developers pick a deck, tweak mock game state, run N simulated draws,
// and inspect the distribution + which events were excluded by triggers.
// ---------------------------------------------------------------------------

const DEFAULT_SIM_COUNT = 50;

export default function ScenarioDeckSimulator({ onClose }: { onClose: () => void }) {
  const allDecks = useMemo(() => loadAllDecks(), []);
  const deckIds = Object.keys(allDecks);

  const [selectedDeckId, setSelectedDeckId] = useState(deckIds[0] ?? "");
  const [simCount, setSimCount] = useState(DEFAULT_SIM_COUNT);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Editable mock game state
  const [mockState, setMockState] = useState<GameState>(createDefaultGameState({ money: 50, score: 0 }));

  const selectedDeck: EventDeck | undefined = allDecks[selectedDeckId];

  const runSimulation = () => {
    if (!selectedDeck) return;
    const sim = simulateDraws(selectedDeck, mockState, simCount);
    setResult(sim);
  };

  const updateMock = (key: keyof GameState, value: unknown) => {
    setMockState((prev) => ({ ...prev, [key]: value }));
    setResult(null); // clear stale results
  };

  const updateCounter = (key: string, value: number) => {
    setMockState((prev) => ({
      ...prev,
      counters: { ...prev.counters, [key]: value },
    }));
    setResult(null);
  };

  const updateFlag = (key: string, value: boolean) => {
    setMockState((prev) => ({
      ...prev,
      flags: { ...prev.flags, [key]: value },
    }));
    setResult(null);
  };

  // Collect all unique trigger keys across the selected deck for the editor
  const triggerKeys = useMemo(() => {
    if (!selectedDeck) return { counters: [] as string[], flags: [] as string[] };
    const counters = new Set<string>();
    const flags = new Set<string>();
    for (const event of selectedDeck.events) {
      for (const trigger of event.triggers) {
        if (trigger.type === "minCounter" || trigger.type === "maxCounter") {
          counters.add(trigger.key);
        }
        if (trigger.type === "hasFlag") {
          flags.add(trigger.key);
        }
      }
    }
    return { counters: [...counters], flags: [...flags] };
  }, [selectedDeck]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">🎲 Scenario Deck Simulator</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Deck selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deck</label>
            <select
              value={selectedDeckId}
              onChange={(e) => { setSelectedDeckId(e.target.value); setResult(null); }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {deckIds.map((id) => (
                <option key={id} value={id}>{allDecks[id].displayName} ({allDecks[id].events.length} events)</option>
              ))}
            </select>
          </div>

          {/* Mock state editor */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mock Game State</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Field label="Money" value={mockState.money} onChange={(v) => updateMock("money", v)} />
              <Field label="Score" value={mockState.score} onChange={(v) => updateMock("score", v)} />
              <Field label="Turn" value={mockState.turn} onChange={(v) => updateMock("turn", v)} />
              <div>
                <label className="text-xs text-gray-500">Difficulty</label>
                <select
                  value={mockState.difficulty}
                  onChange={(e) => updateMock("difficulty", e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            {/* Counter editors */}
            {triggerKeys.counters.length > 0 && (
              <div>
                <h4 className="text-xs text-gray-500 mt-2">Counters</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {triggerKeys.counters.map((key) => (
                    <Field
                      key={key}
                      label={key}
                      value={mockState.counters[key] ?? 0}
                      onChange={(v) => updateCounter(key, v)}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Flag editors */}
            {triggerKeys.flags.length > 0 && (
              <div>
                <h4 className="text-xs text-gray-500 mt-2">Flags</h4>
                <div className="flex flex-wrap gap-2">
                  {triggerKeys.flags.map((key) => (
                    <label key={key} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border">
                      <input
                        type="checkbox"
                        checked={mockState.flags[key] ?? false}
                        onChange={(e) => updateFlag(key, e.target.checked)}
                      />
                      {key}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Run controls */}
          <div className="flex items-center gap-3">
            <Field label="Draws" value={simCount} onChange={setSimCount} />
            <button
              onClick={runSimulation}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors mt-4"
            >
              Simulate {simCount} Draws
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Distribution */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">
                  Distribution ({result.totalDraws} draws, {result.draws.length} unique events)
                </h3>
                <div className="space-y-1">
                  {result.draws.map((d) => {
                    const pct = ((d.count / result.totalDraws) * 100).toFixed(1);
                    return (
                      <div key={d.eventId} className="flex items-center gap-2 text-sm">
                        <div className="w-40 truncate font-medium text-gray-800" title={d.eventId}>
                          {d.title}
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-20 text-right text-xs text-gray-500">
                          {d.count} ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Excluded events */}
              {result.excluded.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-red-600 mb-2">
                    Excluded Events ({result.excluded.length})
                  </h3>
                  <div className="space-y-2">
                    {result.excluded.map((ex) => (
                      <div key={ex.eventId} className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs">
                        <div className="font-semibold text-red-800">{ex.title} <span className="text-red-400">({ex.eventId})</span></div>
                        <ul className="mt-1 space-y-0.5">
                          {ex.reasons.map((r, i) => (
                            <li key={i} className="text-red-600">• {r}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small reusable numeric field
// ---------------------------------------------------------------------------
function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}
