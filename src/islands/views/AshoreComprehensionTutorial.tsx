/**
 * Ashore FTUE — seven environmental prove-it beats (no text dumps).
 * Goal → Walk → Economy → Decision → Consequence → Reward → Deeper.
 * Design: docs/ftue-interactive-teach.md · docs/ashore-tutorial-research.md
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CapitalCharacter } from "../character";
import { BASE_VOYAGER } from "../character";
import { capitalMusic } from "../audio/capitalMusic";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import type { MoneyOrganId } from "../moneyOrgans";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";
import { TouchWalkPad } from "./TouchWalkPad";
import {
  VoyagerWalkPracticeStage,
  WALK_MARKERS,
} from "../world3d/VoyagerWalkPracticeStage";
import { pointerSafeActivate } from "../pointerSafeClick";
import { useInputAction } from "@/input";
import { triggerJuice } from "@/juice";
import {
  ConsequenceHushShowcase,
  DecisionForkShowcase,
  DeeperStrategyShowcase,
  FantasyOrganToys,
  GoalPlinthClaim,
  RewardPlinthShowcase,
} from "./AshoreTeachShowcases";
import {
  FTUE_STEP_COUNT,
  FTUE_STEPS,
  FtueSessionTracker,
  type FtueStepId,
  ftueStepMeta,
} from "../ftueTelemetry";

export type TeachStepId = FtueStepId;

const STEPS: TeachStepId[] = FTUE_STEPS.map((s) => s.id);

/** Spine places kept for contracts — taught in-world, not as Ashore slides. */
const SPINE_PAINTINGS: { organ: MoneyOrganId; place: string }[] = [
  { organ: "memory", place: "Harbor Haven" },
  { organ: "coin", place: "Coincraft Cove" },
  { organ: "clock", place: "Paycheck Peninsula" },
  { organ: "spiral", place: "Credit Kingdom" },
];

type Props = {
  character?: CapitalCharacter | null;
  onComplete: () => void;
};

const CTA =
  "mt-5 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] disabled:opacity-40";

export function AshoreComprehensionTutorial({
  character,
  onComplete,
}: Props) {
  const voyager = character ?? BASE_VOYAGER;
  const [index, setIndex] = useState(0);
  const stepId = STEPS[index]!;
  const [claimed, setClaimed] = useState<string[]>([]);
  const [goalClaimed, setGoalClaimed] = useState(false);
  const [economyPoked, setEconomyPoked] = useState<MoneyOrganId[]>([]);
  const [decision, setDecision] = useState<string | null>(null);
  const [hushPhase, setHushPhase] = useState<"hush" | "mark">("hush");
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [deeperLooked, setDeeperLooked] = useState(false);
  const [carpetBoarded, setCarpetBoarded] = useState(false);
  const reduced = prefersReducedMotion();
  const tracker = useRef(new FtueSessionTracker());
  const finishing = useRef(false);

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "opening" });
    tracker.current.startSession();
  }, []);

  useEffect(() => {
    tracker.current.startStep(stepId, index);
  }, [stepId, index]);

  const finish = useCallback(
    (kind: "complete" | "leave") => {
      if (finishing.current) return;
      finishing.current = true;
      if (kind === "complete") {
        tracker.current.completeStep();
        tracker.current.completeSession();
      } else {
        tracker.current.abandon("leave");
        tracker.current.skip("leave");
      }
      onComplete();
    },
    [onComplete],
  );

  const advance = useCallback(() => {
    if (finishing.current) return;
    tracker.current.completeStep();
    if (index >= STEPS.length - 1) {
      finish("complete");
      return;
    }
    setIndex((i) => i + 1);
  }, [finish, index]);

  const onClaimMarker = useCallback((id: string) => {
    setClaimed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const walkDone = WALK_MARKERS.every((m) => claimed.includes(m.id));
  const economyDone = economyPoked.includes("coin");

  useEffect(() => {
    if (stepId === "walk" && walkDone) {
      const t = window.setTimeout(advance, Math.round(500 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, stepId, walkDone]);

  useEffect(() => {
    if (stepId !== "consequence" || !decision) return;
    setHushPhase("hush");
    playCapitalSfx("scar_chime");
    playOrganSfx("coin");
    const scale = cinemaTimeScale();
    const markT = window.setTimeout(() => {
      setHushPhase("mark");
      playCapitalSfx("take_mark");
      triggerJuice("reward", { burst: true });
    }, Math.round(700 * scale));
    const doneT = window.setTimeout(() => {
      advance();
    }, Math.round(2200 * scale));
    return () => {
      window.clearTimeout(markT);
      window.clearTimeout(doneT);
    };
  }, [advance, decision, stepId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish("leave");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  const showPad = stepId === "walk";
  useInputAction("cancel", () => finish("leave"));

  const chamberEyebrow = useMemo(() => {
    const meta = ftueStepMeta(stepId);
    return `Beat ${index + 1} · ${meta.label}`;
  }, [index, stepId]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col text-white"
      data-testid="ashore-comprehension-tutorial"
      data-teach-step={stepId}
      data-teach-mode="ftue-7"
      data-ftue-teaches={ftueStepMeta(stepId).teaches}
      style={{
        background:
          "radial-gradient(ellipse 85% 65% at 50% 30%, #1e3a5f 0%, #0f172a 52%, #020617 100%)",
      }}
    >
      <header className="relative z-[2] flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
            Capital · First voyage
          </p>
          <p className="text-[10px] text-white/50">{chamberEyebrow}</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="ashore-teach-skip"
          {...pointerSafeActivate(() => finish("leave"))}
        >
          Leave · Esc
        </button>
      </header>

      {showPad ? (
        <div className="relative z-[1] mx-auto w-full max-w-3xl flex-1 min-h-[42vh] px-3 sm:min-h-[48vh]">
          <VoyagerWalkPracticeStage
            character={voyager}
            mode="walk"
            claimed={claimed}
            onClaimMarker={onClaimMarker}
            className="h-full min-h-[42vh] overflow-hidden rounded-2xl ring-1 ring-amber-200/25 sm:min-h-[48vh]"
          />
          {!reduced ? (
            <div className="pointer-events-auto absolute bottom-3 right-5 z-[3] sm:hidden">
              <TouchWalkPad />
            </div>
          ) : null}
        </div>
      ) : null}

      <main
        className={`relative z-[2] flex flex-col items-center px-5 pb-4 text-center ${
          showPad ? "pt-3" : "flex-1 justify-center overflow-y-auto pt-2"
        }`}
      >
        {stepId === "goal" ? (
          <>
            <h1 className="max-w-xl font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
              Leave a mark Harbor keeps
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Touch the empty Plinth — that is your goal.
            </p>
            <GoalPlinthClaim
              claimed={goalClaimed}
              onClaim={() => setGoalClaimed(true)}
            />
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!goalClaimed}
              {...pointerSafeActivate(advance)}
            >
              {goalClaimed ? "Next — learn to walk" : "Claim the Plinth"}
            </button>
          </>
        ) : null}

        {stepId === "walk" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Walk
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Reach every glowing ring — WASD or arrows.
            </p>
            <p
              className="mt-3 text-sm font-bold text-amber-100"
              data-testid="ashore-teach-gate"
              data-gate="walk-markers"
            >
              {claimed.length}/{WALK_MARKERS.length} rings ·{" "}
              {walkDone ? "Clear" : "Step into the light"}
            </p>
          </>
        ) : null}

        {stepId === "economy" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Money is alive
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Poke the Coin — it holds. That is your living resource.
            </p>
            <FantasyOrganToys
              poked={economyPoked}
              organs={["coin"]}
              onPoke={(id) =>
                setEconomyPoked((prev) => (prev.includes(id) ? prev : [...prev, id]))
              }
            />
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!economyDone}
              {...pointerSafeActivate(advance)}
            >
              {economyDone ? "Next — make a choice" : "Poke Coin holds"}
            </button>
          </>
        ) : null}

        {stepId === "decision" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Choose — it sticks
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Pick one. Both leave a truth Harbor can name.
            </p>
            <DecisionForkShowcase
              chosen={decision}
              onChoose={(label) => {
                setDecision(label);
                triggerJuice("accept");
                window.setTimeout(advance, Math.round(450 * cinemaTimeScale()));
              }}
            />
          </>
        ) : null}

        {stepId === "consequence" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              The world marks it
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">Watch — you cannot put it back.</p>
            <ConsequenceHushShowcase plaque={decision ?? "…"} phase={hushPhase} />
          </>
        ) : null}

        {stepId === "reward" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Harbor felt that
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Tap the glowing Plinth — Memory keeps your proof.
            </p>
            <RewardPlinthShowcase
              plaque={decision ?? "…"}
              claimed={rewardClaimed}
              onClaim={() => {
                if (rewardClaimed) return;
                setRewardClaimed(true);
                playCapitalSfx("harbor_felt");
                playCapitalSfx("plinth_hum");
                triggerJuice("complete", { burst: true });
              }}
            />
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!rewardClaimed}
              {...pointerSafeActivate(advance)}
            >
              {rewardClaimed ? "One deeper hint" : "Claim the Plinth glow"}
            </button>
          </>
        ) : null}

        {stepId === "deeper" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Look deeper — then board
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Soft Beat shows weight. Clock waits. Cove is lit first.
            </p>
            <DeeperStrategyShowcase
              looked={deeperLooked}
              boarded={carpetBoarded}
              onLook={() => {
                setDeeperLooked(true);
                playCapitalSfx("soft_beat");
              }}
              onBoard={() => setCarpetBoarded(true)}
            />
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!carpetBoarded}
              {...pointerSafeActivate(() => finish("complete"))}
            >
              {carpetBoarded
                ? `Launch · ${voyager.name || "Voyager"}`
                : deeperLooked
                  ? "Board Cove to launch"
                  : "Peek Soft Beat first"}
            </button>
            <ul
              className="mt-3 flex w-full max-w-lg flex-wrap justify-center gap-2"
              data-testid="ashore-teach-route"
              aria-label="First voyage"
            >
              <li className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-amber-100 ring-1 ring-white/20">
                Harbor Haven
              </li>
              <li className="rounded-lg bg-amber-400/25 px-3 py-1.5 text-[11px] font-bold text-amber-100 ring-1 ring-amber-200/50">
                Coincraft Cove
              </li>
            </ul>
          </>
        ) : null}
      </main>

      <footer className="relative z-[2] px-4 pb-4 text-center">
        <p className="text-[11px] uppercase tracking-wider text-white/45">
          Beat {index + 1} / {STEPS.length} · Esc · Leave
        </p>
        <div className="mx-auto mt-2 flex max-w-md justify-center gap-1.5">
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 flex-1 max-w-8 rounded-full ${
                i <= index ? "bg-amber-300" : "bg-white/20"
              }`}
              title={ftueStepMeta(id).label}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}

/** Exported for unit contracts — spine places (taught in-world after Ashore). */
export const ASHORE_SPINE_PAINTING_PLACES = SPINE_PAINTINGS.map((p) => p.place);
export const ASHORE_TEACH_STEP_COUNT = FTUE_STEP_COUNT;
export const ASHORE_FTUE_STEP_IDS = STEPS;
