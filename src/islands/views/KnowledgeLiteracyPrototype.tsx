/**
 * Knowledge literacy prototype — FAIL → UNDERSTAND → ADAPT → RETRY → MASTER.
 * Isolated: no map, XP, Freedom Seal, quizzes, or Ashore glossary.
 * Open with ?knowledge=1
 *
 * Canon: GAME_DESIGN_KNOWLEDGE.md
 */

import { useCallback, useEffect, useState } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import { MONEY_ORGANS, type MoneyOrganId } from "../moneyOrgans";
import { organVerbChip } from "../worldMemory";
import { triggerJuice } from "@/juice";
import { pointerSafeActivate } from "../pointerSafeClick";
import { GameButton } from "@/game-ui";
import {
  assertNoStrategySpoiler,
  discoveryById,
  failHypothesisFor,
  type KnowledgeDiscoveryId,
} from "../knowledgeProgression";

type TrialChoice = {
  id: string;
  label: string;
  /** Correct enough to ink the discovery — never labeled “optimal” in UI. */
  advances: boolean;
};

type Trial = {
  id: string;
  tierLabel: string;
  organ: MoneyOrganId;
  prompt: string;
  discovery: KnowledgeDiscoveryId;
  failSource: "double_take" | "soft_beat" | "soft_lock" | null;
  choices: TrialChoice[];
};

const TRIALS: Trial[] = [
  {
    id: "basic_commit",
    tierLabel: "Basic rules",
    organ: "coin",
    prompt: "The Coin is listening. You already Chose once — the jar sealed.",
    discovery: "commit_sticks",
    failSource: "double_take",
    choices: [
      { id: "rewrite", label: "Take again — rewrite the plaque", advances: false },
      { id: "accept", label: "Leave the plaque — board carpet home", advances: true },
    ],
  },
  {
    id: "intermediate_soft",
    tierLabel: "Intermediate patterns",
    organ: "coin",
    prompt: "You climbed the Coin Jar lid. Harbor already felt your Take.",
    discovery: "soft_beat_look",
    failSource: "soft_beat",
    choices: [
      { id: "retake", label: "Force another Take from the lid", advances: false },
      { id: "look", label: "Look at the jar’s weight — then leave", advances: true },
    ],
  },
  {
    id: "advanced_gate",
    tierLabel: "Advanced strategies",
    organ: "spiral",
    prompt: "Credit’s painting is dim. Cove’s plaque is still blank on the Plinth.",
    discovery: "soft_gate_named",
    failSource: "soft_lock",
    choices: [
      { id: "force", label: "Board Credit anyway", advances: false },
      { id: "cove", label: "Finish Cove Change — let Coin hold first", advances: true },
    ],
  },
];

type Phase = "choose" | "fail" | "earned" | "mastered";

type Props = {
  onExit: () => void;
};

export function KnowledgeLiteracyPrototype({ onExit }: Props) {
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("choose");
  const [earned, setEarned] = useState<KnowledgeDiscoveryId[]>([]);
  const [failLines, setFailLines] = useState<{ observation: string; question: string } | null>(
    null,
  );
  const [attempts, setAttempts] = useState(0);

  const trial = TRIALS[Math.min(trialIndex, TRIALS.length - 1)]!;
  const accent = MONEY_ORGANS[trial.organ].accentHint;
  const done = trialIndex >= TRIALS.length || phase === "mastered";

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "harbor" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  const onChoose = useCallback(
    (choice: TrialChoice) => {
      if (phase !== "choose" || done) return;
      setAttempts((n) => n + 1);
      playOrganSfx(trial.organ);

      if (!choice.advances) {
        const hypo = failHypothesisFor({
          organId: trial.organ,
          source: trial.failSource,
        });
        setFailLines({ observation: hypo.observation, question: hypo.question });
        setPhase("fail");
        playCapitalSfx("scar_chime");
        triggerJuice("fail");
        return;
      }

      const disc = discoveryById(trial.discovery);
      setEarned((prev) => (prev.includes(trial.discovery) ? prev : [...prev, trial.discovery]));
      setFailLines(null);
      setPhase("earned");
      playCapitalSfx("harbor_felt");
      playOrganSfx("memory");
      triggerJuice("complete", { burst: true });
      void disc;
    },
    [done, phase, trial],
  );

  const retry = () => {
    setFailLines(null);
    setPhase("choose");
    playCapitalSfx("ui_confirm");
  };

  const nextTrial = () => {
    const next = trialIndex + 1;
    if (next >= TRIALS.length) {
      setPhase("mastered");
      playCapitalSfx("plinth_hum");
      playOrganSfx("memory");
      return;
    }
    setTrialIndex(next);
    setPhase("choose");
    playOrganSfx(TRIALS[next]!.organ);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col text-white"
      data-testid="knowledge-literacy-prototype"
      data-knowledge-phase={phase}
      data-knowledge-trial={done ? "done" : trial.id}
      style={{
        background:
          "radial-gradient(ellipse 75% 55% at 50% 30%, #1e293b 0%, #0f172a 50%, #020617 100%)",
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/90">
            Capital · Knowledge progression
          </p>
          <p className="text-[10px] text-white/50">
            Fail → understand → adapt → retry · no XP · no spoilers
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="knowledge-exit"
          {...pointerSafeActivate(onExit)}
        >
          Leave · Esc
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-6">
        <ul
          className="mb-6 flex w-full max-w-md flex-col gap-1.5"
          data-testid="knowledge-retell-shelf"
          aria-label="What you can retell"
        >
          <li className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Retell shelf
          </li>
          {earned.length === 0 ? (
            <li className="text-center text-xs text-white/45">Empty — earn truths by adapting</li>
          ) : (
            earned.map((id) => {
              const d = discoveryById(id);
              return (
                <li
                  key={id}
                  className="rounded-lg bg-[#0c4a6e]/55 px-3 py-1.5 text-center text-xs font-semibold ring-1 ring-sky-300/25"
                  data-testid={`knowledge-earned-${id}`}
                >
                  {d?.retell ?? id}
                </li>
              );
            })
          )}
        </ul>

        {phase === "mastered" || (done && phase !== "fail") ? (
          <div className="max-w-lg text-center" data-testid="knowledge-mastered">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200/90">
              Meta · mastery proof
            </p>
            <h1 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              You can retell without spoilers
            </h1>
            <p className="mt-3 text-sm text-white/75">
              Cold kid test: Coin holds · Soft Beat looks · soft-locks speak. Attempts {attempts} —
              each miss taught something.
            </p>
            <GameButton
              variant="primary"
              className="mt-6 min-h-12"
              data-testid="knowledge-done-exit"
              {...pointerSafeActivate(onExit)}
            >
              Return to Capital
            </GameButton>
          </div>
        ) : (
          <div className="w-full max-w-lg text-center">
            <p
              className="text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              {trial.tierLabel} · {organVerbChip(trial.organ)}
            </p>
            <h1 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Form a hypothesis
            </h1>
            <p className="mt-3 text-sm text-white/80">{trial.prompt}</p>

            {phase === "choose" ? (
              <div className="mt-6 flex flex-col gap-3">
                {trial.choices.map((c) => (
                  <GameButton
                    key={c.id}
                    variant={c.advances ? "secondary" : "outline"}
                    className="min-h-14 text-base font-bold"
                    data-testid={`knowledge-choice-${c.id}`}
                    {...pointerSafeActivate(() => onChoose(c))}
                  >
                    {c.label}
                  </GameButton>
                ))}
              </div>
            ) : null}

            {phase === "fail" && failLines ? (
              <div
                className="mt-6 rounded-2xl bg-[#1e293b]/90 px-4 py-4 text-left ring-1 ring-rose-300/30"
                data-testid="knowledge-fail-card"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-200/90">
                  Fail · still learning
                </p>
                <p className="mt-2 text-sm text-white/90" data-testid="knowledge-observation">
                  {failLines.observation}
                </p>
                <p className="mt-2 text-sm font-semibold text-amber-100" data-testid="knowledge-question">
                  {failLines.question}
                </p>
                <p className="mt-3 text-[11px] text-white/45">
                  Adapt — form a new try. The game will not name the optimal move.
                </p>
                <GameButton
                  variant="primary"
                  className="mt-4 min-h-12 w-full"
                  data-testid="knowledge-retry"
                  {...pointerSafeActivate(retry)}
                >
                  Retry with a new hypothesis
                </GameButton>
              </div>
            ) : null}

            {phase === "earned" ? (
              <div className="mt-6" data-testid="knowledge-earned-card">
                <p className="text-lg font-black text-sky-100">
                  Understood — {discoveryById(trial.discovery)?.retell}
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Inked on the retell shelf. No XP. Next pattern when you are ready.
                </p>
                <GameButton
                  variant="primary"
                  className="mt-4 min-h-12"
                  data-testid="knowledge-next"
                  {...pointerSafeActivate(nextTrial)}
                >
                  Next living pattern
                </GameButton>
              </div>
            ) : null}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-white/40">
          Attempts {attempts} · Spoilers blocked · {assertNoStrategySpoiler("safe") ? "contract on" : ""}
        </p>
      </main>
    </div>
  );
}

export function shouldOpenKnowledgeLiteracyPrototype(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("knowledge") === "1";
  } catch {
    return false;
  }
}
