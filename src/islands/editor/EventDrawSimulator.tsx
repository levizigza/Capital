import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  createDeckState,
  drawFromDeck,
  loadAllDecks,
  resolveChoice,
  simulateDraws,
} from "@/content/events/engine";
import type { EventChoice, ScenarioDeckState, ScenarioEvent } from "@/content/events/types";
import { createDefaultGameState } from "@/mechanics/engine";
import {
  ECONOMY_PHASES,
  ECONOMY_PHASE_CONFIG,
  type EconomyPhase,
} from "@/islands/economy";
import { resolveProfileText } from "@/islands/learningProfile";

type PhaseOption = EconomyPhase | "none";

export default function EventDrawSimulator() {
  const decks = useMemo(() => loadAllDecks(), []);
  const deckIds = Object.keys(decks);
  const [deckId, setDeckId] = useState(deckIds[0] ?? "");
  const [money, setMoney] = useState(100);
  const [turn, setTurn] = useState(1);
  const [drawCount, setDrawCount] = useState(100);
  const [economyPhase, setEconomyPhase] = useState<PhaseOption>("none");
  const [deckState, setDeckState] = useState<ScenarioDeckState | null>(null);
  const [lastDraw, setLastDraw] = useState<ScenarioEvent | null>(null);
  const [lastChoice, setLastChoice] = useState<EventChoice | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const deck = decks[deckId];
  const activePhase: EconomyPhase | undefined = economyPhase === "none" ? undefined : economyPhase;

  const gameState = useMemo(() => {
    return createDefaultGameState({ money, turn });
  }, [money, turn]);

  const simulation = useMemo(() => {
    if (!deck) return null;
    return simulateDraws(deck, gameState, drawCount, undefined, activePhase);
  }, [deck, gameState, drawCount, activePhase]);

  const comparisonSims = useMemo(() => {
    if (!deck) return null;
    return Object.fromEntries(
      ECONOMY_PHASES.map((p) => [p, simulateDraws(deck, gameState, drawCount, undefined, p)])
    ) as Record<EconomyPhase, ReturnType<typeof simulateDraws>>;
  }, [deck, gameState, drawCount]);

  const drawOnce = () => {
    if (!deck) return;
    const state = createDeckState([deckId]);
    const result = drawFromDeck(state, deckId, gameState, undefined, activePhase);
    if (result.event) {
      const nextState: ScenarioDeckState = {
        ...state,
        activeEvent: result.event,
        activeDeckId: deckId,
      };
      setDeckState(nextState);
      setLastDraw(result.event);
      setLastChoice(null);
      const phaseTag = activePhase ? ` [${ECONOMY_PHASE_CONFIG[activePhase].icon} ${activePhase}]` : "";
      setLog((prev) => [
        `🎴 Drew: ${result.event!.title} (${result.event!.id}) — ${result.eligible.length} eligible${phaseTag}`,
        ...prev.slice(0, 19),
      ]);
    } else {
      setLog((prev) => [
        `⚠️ No eligible events (${result.excluded.length} excluded)`,
        ...prev.slice(0, 19),
      ]);
    }
  };

  const pickChoice = (index: number) => {
    if (!lastDraw || !deckState) return;
    const choice = lastDraw.choices[index];
    if (!choice) return;
    const { newDeckState, effects, resolved } = resolveChoice(deckState, index);
    setDeckState(newDeckState);
    setLastChoice(choice);
    setLastDraw(null);
    setLog((prev) => [
      `✅ "${choice.label}" → ${effects.map((e) => e.type).join(", ")}`,
      ...(resolved?.learningNote ? [`💡 ${resolved.learningNote}`] : []),
      ...prev.slice(0, 18),
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Simulate scenario deck draws and choice resolution. Toggle economy phase to see how macro conditions shift event weights.
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-xs font-bold">
          Deck{" "}
          <select
            className="ml-1 rounded border px-2 py-1 font-mono"
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
          >
            {deckIds.map((id) => (
              <option key={id} value={id}>
                {decks[id]?.displayName ?? id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Money{" "}
          <input
            type="number"
            className="ml-1 w-20 rounded border px-2 py-1"
            value={money}
            onChange={(e) => setMoney(Number(e.target.value))}
          />
        </label>
        <label className="text-xs font-bold">
          Turn{" "}
          <input
            type="number"
            className="ml-1 w-16 rounded border px-2 py-1"
            value={turn}
            onChange={(e) => setTurn(Number(e.target.value))}
          />
        </label>
        <label className="text-xs font-bold">
          Economy{" "}
          <select
            className="ml-1 rounded border px-2 py-1"
            value={economyPhase}
            onChange={(e) => setEconomyPhase(e.target.value as PhaseOption)}
          >
            <option value="none">-- None --</option>
            {ECONOMY_PHASES.map((p) => (
              <option key={p} value={p}>
                {ECONOMY_PHASE_CONFIG[p].icon} {ECONOMY_PHASE_CONFIG[p].label}
              </option>
            ))}
          </select>
        </label>
        <Button size="sm" onClick={drawOnce}>
          🎴 Draw once
        </Button>
      </div>

      {activePhase && (
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
          style={{
            backgroundColor: `${ECONOMY_PHASE_CONFIG[activePhase].color}10`,
            borderColor: `${ECONOMY_PHASE_CONFIG[activePhase].color}30`,
            color: ECONOMY_PHASE_CONFIG[activePhase].color,
          }}
        >
          <span className="text-base">{ECONOMY_PHASE_CONFIG[activePhase].icon}</span>
          <span className="font-bold">{ECONOMY_PHASE_CONFIG[activePhase].label} Economy</span>
          <span className="opacity-70">{ECONOMY_PHASE_CONFIG[activePhase].whatItAffects}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="text-sm font-bold">Last draw</div>
            {lastDraw ? (
              <>
                <div className="font-bold">
                  {lastDraw.icon} {resolveProfileText(lastDraw.title, "apprentice")}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resolveProfileText(lastDraw.prompt, "apprentice")}
                </p>
                <div className="flex flex-wrap gap-1">
                  {lastDraw.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-1">
                  {lastDraw.choices.map((c, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs"
                      onClick={() => pickChoice(i)}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
                {lastChoice?.learningNote ? (
                  <div className="text-xs italic text-blue-700">💡 {lastChoice.learningNote}</div>
                ) : null}
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Click Draw once to pull an event.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">
                Weighted simulation
                {activePhase ? ` (${ECONOMY_PHASE_CONFIG[activePhase].icon} ${activePhase})` : ""}
              </div>
              <input
                type="number"
                className="w-20 rounded border px-2 py-1 text-xs"
                value={drawCount}
                onChange={(e) => setDrawCount(Number(e.target.value))}
                title="Number of draws"
              />
            </div>
            {simulation ? (
              <>
                <div className="text-xs text-muted-foreground">{simulation.totalDraws} draws from eligible pool</div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {simulation.draws.map((d) => (
                    <div key={d.eventId} className="flex justify-between text-xs font-mono">
                      <span>{d.title}</span>
                      <span>{d.count} ({Math.round((d.count / simulation.totalDraws) * 100)}%)</span>
                    </div>
                  ))}
                </div>
                {simulation.excluded.length > 0 ? (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-amber-700">
                      {simulation.excluded.length} excluded events
                    </summary>
                    <ul className="mt-1 space-y-1">
                      {simulation.excluded.map((e) => (
                        <li key={e.eventId} className="text-[10px] text-muted-foreground">
                          {e.title}: {e.reasons.join("; ")}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {comparisonSims && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="text-sm font-bold">Economy phase comparison ({drawCount} draws each)</div>
            <div className="grid gap-3 md:grid-cols-3">
              {ECONOMY_PHASES.map((phase) => {
                const sim = comparisonSims[phase];
                const cfg = ECONOMY_PHASE_CONFIG[phase];
                return (
                  <div
                    key={phase}
                    className="rounded-lg border p-2.5"
                    style={{ borderColor: `${cfg.color}40`, backgroundColor: `${cfg.color}06` }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span>{cfg.icon}</span>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-0.5">
                      {sim.draws.map((d) => (
                        <div key={d.eventId} className="flex justify-between text-[10px] font-mono">
                          <span className="truncate mr-1">{d.title}</span>
                          <span className="shrink-0">{Math.round((d.count / sim.totalDraws) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-bold mb-2">Draw log</div>
          <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-xs">
            {log.length === 0 ? (
              <div className="text-muted-foreground">No draws yet.</div>
            ) : (
              log.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
