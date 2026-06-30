import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { GameButton, GamePanel } from "@/game-ui";
import type { MinigameProps, SavedEvent } from "../types";
import {
  profileGameOverrides,
  formatProfileMoney,
  formatProfileNumber,
  getProfileDef,
} from "../learningProfile";
import { appendEventHistory } from "../save";
import {
  initSession,
  dispatch,
  getUIModels,
  type SessionState,
  type Effect,
  type ModuleRef,
} from "@/mechanics";
import type { ResolvedEvent } from "@/content/events/types";
import { type DecisionTimeline, type DecisionEntry, type StateSnapshot, summariseEffects } from "../decisionTimeline";
import { extractSkillChanges, detectRiskyPatterns, type SkillStatChange } from "../skillStats";
import { analyzeReplay, snapshotFromGameState } from "../replayAnalyzer";

// ---------------------------------------------------------------------------
// Side-effect: import all modules so they self-register
// ---------------------------------------------------------------------------
import "@/mechanics/modules/EarnSpendModule";
import "@/mechanics/modules/ChangeMakingModule";
import "@/mechanics/modules/EnvelopeBudgetModule";
import "@/mechanics/modules/CalendarCycleModule";
import "@/mechanics/modules/EventDeckModule";
import "@/mechanics/modules/CreditUtilizationModule";
import "@/mechanics/modules/PortfolioDriftModule";
import "@/mechanics/modules/PassiveIncomeModule";

// ---------------------------------------------------------------------------
// ModularMinigame
// ---------------------------------------------------------------------------
// A generic minigame renderer that composes mechanic modules defined in the
// island JSON's minigame.modules[] array. All game logic is data-driven —
// no hardcoded mechanics in this component.
// ---------------------------------------------------------------------------

export default function ModularMinigame({
  minigameId,
  island,
  save,
  difficulty,
  learningProfile,
  onComplete,
  onClose,
}: MinigameProps) {
  const minigameDef = useMemo(
    () => island.minigames?.find((m) => m.id === minigameId),
    [island, minigameId],
  );

  const moduleRefs: ModuleRef[] = useMemo(
    () => (minigameDef?.modules as ModuleRef[] | undefined) ?? [],
    [minigameDef],
  );

  const profileDef = useMemo(() => getProfileDef(learningProfile), [learningProfile]);

  const [session, setSession] = useState<SessionState>(() =>
    initSession(moduleRefs, {
      difficulty,
      economyPhase: save.economyState?.phase,
      ...profileGameOverrides(learningProfile),
    }),
  );
  const [messages, setMessages] = useState<{ text: string; variant: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const sessionStartedAt = useRef(new Date().toISOString());
  const stateSnapshots = useRef<Map<number, { before: StateSnapshot; after: StateSnapshot }>>(new Map());
  const eventDeckDrawCount = useRef(0);

  const uiModels = useMemo(() => getUIModels(session), [session]);

  const handleEffects = useCallback((effects: Effect[]) => {
    for (const effect of effects) {
      if (effect.type === "showMessage") {
        setMessages((prev) => [...prev.slice(-4), { text: effect.text, variant: effect.variant ?? "info" }]);
      }
      if (effect.type === "endGame") {
        setGameOver(true);
      }
    }
  }, []);

  const dispatchAction = useCallback(
    (moduleId: string, actionType: string, payload?: Record<string, unknown>) => {
      if (gameOver) return;

      // Capture state before EventDeck "choose" actions for replay analysis
      const isEventDeckChoice = moduleId === "EventDeck" && actionType === "choose";
      const snapshotBefore = isEventDeckChoice
        ? snapshotFromGameState(session.game)
        : undefined;

      const result = dispatch(session, moduleId, { type: actionType, payload });
      setSession(result.state);
      handleEffects(result.effects);

      if (isEventDeckChoice && snapshotBefore) {
        const idx = eventDeckDrawCount.current++;
        stateSnapshots.current.set(idx, {
          before: snapshotBefore,
          after: snapshotFromGameState(result.state.game),
        });
      }
    },
    [session, gameOver, handleEffects],
  );

  const handleComplete = useCallback(() => {
    // Persist resolved scenario events from any EventDeck modules
    const eventDeckState = session.modules["EventDeck"] as
      | { resolvedHistory?: ResolvedEvent[] }
      | undefined;
    const resolvedHistory = eventDeckState?.resolvedHistory ?? [];

    if (resolvedHistory.length > 0) {
      const saved: SavedEvent[] = resolvedHistory.map((r) => ({
        eventId: r.eventId,
        deckId: r.deckId,
        choiceIndex: r.choiceIndex,
        timestamp: r.timestamp,
      }));
      appendEventHistory(saved).catch(() => {/* best-effort */});
    }

    // Build decision timeline for replay
    let timeline: DecisionTimeline | undefined;
    if (resolvedHistory.length > 0) {
      const allSkillChanges: SkillStatChange[] = [];
      const allEffectSets = resolvedHistory.map((r) => r.effects);

      const entries: DecisionEntry[] = resolvedHistory.map((r, idx) => {
        const skillChanges = extractSkillChanges(r.effects, r.eventTitle ?? r.eventId);
        allSkillChanges.push(...skillChanges);

        const skillDiffParts = skillChanges.map(
          (sc) => `${sc.stat} ${sc.delta >= 0 ? "+" : ""}${sc.delta}`
        );
        const baseDiff = summariseEffects(r.effects);
        const fullDiff = skillDiffParts.length > 0
          ? `${baseDiff}, ${skillDiffParts.join(", ")}`
          : baseDiff;

        // Attach state snapshots captured during gameplay
        const snapshots = stateSnapshots.current.get(idx);

        return {
          timestamp: r.timestamp,
          context: {
            islandId: island.id,
            minigameId,
            deckId: r.deckId,
          },
          action: {
            eventId: r.eventId,
            eventTitle: r.eventTitle ?? r.eventId,
            eventIcon: r.eventIcon,
            chosenLabel: r.chosenLabel ?? `Choice ${r.choiceIndex + 1}`,
            chosenIndex: r.choiceIndex,
          },
          alternatives: r.alternativeLabels ?? [],
          stateDiff: fullDiff,
          explanation: r.explanation ?? "",
          learningNote: r.learningNote,
          skillChanges,
          stateBefore: snapshots?.before,
          stateAfter: snapshots?.after,
        };
      });

      // Detect risky patterns and add penalties
      const riskyPenalties = detectRiskyPatterns(allEffectSets);
      allSkillChanges.push(...riskyPenalties);

      // Run replay analyzer: score entries, generate causal explanations, select highlights
      const { highlights, storySummary } = analyzeReplay(entries);

      timeline = {
        id: `tl_${minigameId}_${Date.now()}`,
        startedAt: sessionStartedAt.current,
        completedAt: new Date().toISOString(),
        context: {
          islandId: island.id,
          islandName: island.name,
          minigameId,
          minigameName: minigameDef?.name ?? minigameId,
        },
        success: true,
        score: session.game.score,
        entries: highlights,
        skillChanges: allSkillChanges,
        storySummary,
      };
    }

    onComplete(true, session.game.score, timeline);
  }, [onComplete, session.game.score, session.modules, island, minigameId, minigameDef]);

  // Auto-dismiss old messages
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => setMessages((prev) => prev.slice(1)), 3000);
    return () => clearTimeout(timer);
  }, [messages]);

  if (!minigameDef || moduleRefs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No mechanic modules configured for this minigame.</p>
        <GameButton variant="secondary" onClick={onClose} className="mt-4">
          Close
        </GameButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {minigameDef.icon} {minigameDef.name}
          </h2>
          <p className="text-sm text-gray-500">{minigameDef.description}</p>
        </div>
        <GameButton variant="ghost" size="sm" onClick={onClose} motionEnabled={false} data-testid="minigame-close">
          ✕ Close
        </GameButton>
      </div>

      {/* Minigame HUD bar */}
      <div className="game-hud-chip flex flex-wrap items-center gap-3 !max-w-none rounded-xl text-sm">
        <span className="font-semibold text-gray-700">
          💰 {formatProfileMoney(session.game.money, learningProfile)}
        </span>
        <span className="font-semibold text-gray-700">
          ⭐ {formatProfileNumber(session.game.score, learningProfile)} pts
        </span>
        <span className="text-gray-500">
          Turn {session.game.turn} / {session.game.maxTurns}
        </span>
        <span
          className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
          title={profileDef.description}
        >
          {profileDef.icon} {profileDef.label}
        </span>
        {profileDef.hudMode === "simplified" ? (
          <span className="text-xs text-gray-500">Easy mode — whole numbers, softer penalties</span>
        ) : profileDef.showForecasts ? (
          <span className="text-xs text-gray-500">APR &amp; compounding enabled</span>
        ) : profileDef.showInterestConcepts ? (
          <span className="text-xs text-gray-500">Interest basics shown</span>
        ) : null}
        <span className="ml-auto text-xs text-gray-400 uppercase">{difficulty}</span>
      </div>

      {/* Messages toast area */}
      {messages.length > 0 && (
        <div className="space-y-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                msg.variant === "success"
                  ? "bg-green-100 text-green-800"
                  : msg.variant === "warning"
                    ? "bg-amber-100 text-amber-800"
                    : msg.variant === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Module panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {uiModels.map((model) => (
          <ModulePanel
            key={model.moduleId}
            model={model}
            onAction={(actionType, payload) => dispatchAction(model.moduleId, actionType, payload)}
            disabled={gameOver}
          />
        ))}
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 Game Complete!</h3>
          <p className="text-green-700 mb-1">
            Final Score: <span className="font-bold">{formatProfileNumber(session.game.score, learningProfile)}</span> pts
          </p>
          <p className="text-green-700 mb-4">
            Money Earned: <span className="font-bold">{formatProfileMoney(session.game.money, learningProfile)}</span>
          </p>
          <GameButton variant="primary" onClick={handleComplete}>
            Finish
          </GameButton>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModulePanel — renders one module's UI model
// ---------------------------------------------------------------------------
import type { ModuleUIModel } from "@/mechanics";
import { CinematicEventPanel } from "../quiz/CinematicEventPanel";

function ModulePanel({
  model,
  onAction,
  disabled,
}: {
  model: ModuleUIModel;
  onAction: (actionType: string, payload?: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const data = model.data as Record<string, unknown>;

  return (
    <GamePanel title={model.label} padding="default" className="!bg-white">
      <div className="-mt-2">

      {/* Data display — render key-value pairs for simple values */}
      <div className="space-y-1 mb-3">
        {Object.entries(data).map(([key, value]) => {
          if (value === null || value === undefined) return null;
          if (typeof value === "object") return null; // skip complex objects in simple view
          return (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              <span className="font-medium text-gray-800">
                {typeof value === "number" ? (key.toLowerCase().includes("cent") ? `${value}¢` : value) : String(value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Render complex data: denominations, coins, etc */}
      {renderComplexData(data, model.moduleId, onAction, disabled)}

      {/* Action buttons — EventDeck uses cinematic panel for choices */}
      {!(model.moduleId === "EventDeck" && data.activeEvent) ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {model.availableActions.map((action) => (
          <GameButton
            key={`${action.type}-${action.label}`}
            size="sm"
            variant={disabled || action.disabled ? "secondary" : "primary"}
            disabled={disabled || action.disabled}
            motionEnabled={false}
            onClick={() => {
              const payload = getActionPayload(model.moduleId, action.type, data, action.label);
              onAction(action.type, payload);
            }}
          >
            {action.label}
          </GameButton>
        ))}
      </div>
      ) : null}
      </div>
    </GamePanel>
  );
}

// ---------------------------------------------------------------------------
// Helpers: extract action payloads from data + render complex data sections
// ---------------------------------------------------------------------------

function getActionPayload(
  moduleId: string,
  actionType: string,
  data: Record<string, unknown>,
  actionLabel?: string,
): Record<string, unknown> | undefined {
  // EarnSpend: pick first available earn/spend option from data
  if (moduleId === "EarnSpend" && actionType === "earn") {
    // The renderer could show individual buttons per option, but for the
    // MVP we cycle through earn options. Actual per-option buttons can be
    // added with a richer renderer layer later.
    return undefined; // will use default in module
  }
  if (moduleId === "EarnSpend" && actionType === "spend") {
    return undefined;
  }

  // ChangeMaking: addCoin picks from denominatons list — handled by
  // per-denomination buttons rendered in renderComplexData
  if (moduleId === "ChangeMaking" && actionType === "addCoin") {
    const denoms = data.denominations as { label: string; value: number }[] | undefined;
    if (denoms && denoms.length > 0) {
      return { label: denoms[0].label, value: denoms[0].value };
    }
  }

  // CreditUtilization: payDown with amount
  if (moduleId === "CreditUtilization" && actionType === "payDown") {
    return { amount: 100 };
  }

  // PortfolioDrift: buy/sell need assetId + amount
  if (moduleId === "PortfolioDrift" && (actionType === "buy" || actionType === "sell")) {
    const classes = data.assetClasses as { id: string }[] | undefined;
    if (classes && classes.length > 0) {
      return { assetId: classes[0].id, amount: 1 };
    }
  }

  // PassiveIncome: buyAsset needs assetId
  if (moduleId === "PassiveIncome" && actionType === "buyAsset") {
    const available = data.availableAssets as { id: string }[] | undefined;
    if (available && available.length > 0) {
      return { assetId: available[0].id };
    }
  }

  // EnvelopeBudget: allocate needs envelopeId + amount
  if (moduleId === "EnvelopeBudget" && actionType === "allocate") {
    const envelopes = data.envelopes as { id: string }[] | undefined;
    if (envelopes && envelopes.length > 0) {
      return { envelopeId: envelopes[0].id, amount: 50 };
    }
  }

  // EventDeck: choose needs choiceIndex — matched by label from availableActions
  if (moduleId === "EventDeck" && actionType === "choose") {
    const activeEvent = data.activeEvent as { choices: { label: string; index: number }[] } | null;
    if (activeEvent) {
      const match = activeEvent.choices.find((c) => c.label === actionLabel);
      if (match) return { choiceIndex: match.index };
      // fallback to first choice
      return { choiceIndex: 0 };
    }
  }

  return undefined;
}

function renderComplexData(
  data: Record<string, unknown>,
  _moduleId: string,
  onAction: (actionType: string, payload?: Record<string, unknown>) => void,
  disabled: boolean,
): React.ReactElement | null {
  const elements: React.ReactElement[] = [];

  // ChangeMaking: show selected coins
  if (data.selectedCoins && Array.isArray(data.selectedCoins)) {
    const coins = data.selectedCoins as { label: string; value: number }[];
    if (coins.length > 0) {
      elements.push(
        <div key="selected-coins" className="text-xs text-gray-500 mt-1">
          <span className="font-medium">Selected: </span>
          {coins.map((c, i) => (
            <span key={i} className="inline-block bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded mr-1 mb-1">
              {c.label} ({c.value}¢)
            </span>
          ))}
        </div>,
      );
    }
  }

  // EnvelopeBudget: show envelopes
  if (data.envelopes && Array.isArray(data.envelopes)) {
    const envs = data.envelopes as { id: string; label: string; icon: string; allocated: number; spent: number; remaining: number }[];
    elements.push(
      <div key="envelopes" className="space-y-1 mt-1">
        {envs.map((env) => (
          <div key={env.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
            <span>{env.icon} {env.label}</span>
            <span className="font-mono">${env.allocated} / spent ${env.spent}</span>
          </div>
        ))}
      </div>,
    );
  }

  // PortfolioDrift: show asset classes with prices
  if (data.assetClasses && Array.isArray(data.assetClasses)) {
    const classes = data.assetClasses as { id: string; label: string; icon?: string; currentPrice: number; held: number }[];
    elements.push(
      <div key="assets" className="space-y-1 mt-1">
        {classes.map((ac) => (
          <div key={ac.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
            <span>{ac.icon ?? "📊"} {ac.label}</span>
            <span className="font-mono">${ac.currentPrice.toFixed(2)} × {ac.held}</span>
          </div>
        ))}
      </div>,
    );
  }

  // EventDeck: cinematic scenario panel
  if (data.activeEvent && typeof data.activeEvent === "object") {
    const evt = data.activeEvent as {
      icon: string;
      title: string;
      prompt: string;
      explanation: string;
      choices: { label: string; index: number }[];
    };
    elements.push(
      <CinematicEventPanel
        key="active-event"
        icon={evt.icon}
        title={evt.title}
        prompt={evt.prompt}
        explanation={evt.explanation}
        choices={evt.choices ?? []}
        disabled={disabled}
        onChoose={(index) => onAction("choose", { choiceIndex: index })}
      />,
    );
  }

  return elements.length > 0 ? <>{elements}</> : null;
}
