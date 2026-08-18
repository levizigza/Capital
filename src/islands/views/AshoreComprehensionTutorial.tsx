/**
 * Ashore Teach — Chamber 00 (≤5 prove-it chambers).
 * Fantasy → Walk → Talk → Dock → Launch.
 * First Cove→Harbor loop in the real game is the rest of the tutorial.
 * Design: docs/ashore-teach-design.md · docs/ashore-tutorial-research.md
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CapitalCharacter } from "../character";
import { BASE_VOYAGER } from "../character";
import { capitalMusic } from "../audio/capitalMusic";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { analytics } from "../analytics";
import {
  trackFirstControlReceived,
  trackFirstMeaningfulAction,
  trackFtue,
} from "../analytics/ftue";
import { MURAL_THESIS, type MoneyOrganId } from "../moneyOrgans";
import { cinemaTimeScale } from "../a11yMotion";
import { TouchWalkPad } from "./TouchWalkPad";
import {
  TALK_TARGET,
  VoyagerWalkPracticeStage,
  WALK_MARKERS,
} from "../world3d/VoyagerWalkPracticeStage";
import { pointerSafeActivate } from "../pointerSafeClick";
import { useInputAction, formatMovePhrase, formatInteractPhrase, useInputPrompt } from "@/input";
import {
  CarpetDockShowcase,
  FantasyOrganToys,
  ReadyCarpetShowcase,
} from "./AshoreTeachShowcases";

export type TeachStepId = "fantasy" | "walk" | "talk" | "dock" | "ready";

const STEPS: TeachStepId[] = ["fantasy", "walk", "talk", "dock", "ready"];

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
  "mt-3 min-h-12 w-full max-w-sm rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]";

const CTA_MUTED = `${CTA} opacity-55`;

export function AshoreComprehensionTutorial({
  character,
  onComplete,
}: Props) {
  const voyager = character ?? BASE_VOYAGER;
  const [index, setIndex] = useState(0);
  const stepId = STEPS[index]!;
  const [claimed, setClaimed] = useState<string[]>([]);
  const [nearTalk, setNearTalk] = useState(false);
  const [talked, setTalked] = useState(false);
  const [fantasyPoked, setFantasyPoked] = useState<MoneyOrganId[]>([]);
  const [carpetBoarded, setCarpetBoarded] = useState(false);
  const [toyNudge, setToyNudge] = useState(false);
  const [dockNudge, setDockNudge] = useState(false);

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "opening" });
    void trackFtue("ftue_started", { source: "ashore_teach" });
  }, []);

  useEffect(() => {
    void analytics.track("tutorial_step", { step: stepId, action: "enter" });
  }, [stepId]);

  const completeAshore = useCallback(
    (action: "complete" | "skip") => {
      void analytics.track("tutorial_step", { step: stepId, action });
      if (action === "skip") {
        void trackFtue("tutorial_skipped", { source: "ashore_teach", step: stepId });
      }
      onComplete();
    },
    [onComplete, stepId],
  );

  const advance = useCallback(() => {
    if (index >= STEPS.length - 1) {
      completeAshore("complete");
      return;
    }
    void analytics.track("tutorial_step", { step: stepId, action: "complete" });
    setIndex((i) => i + 1);
    setToyNudge(false);
    setDockNudge(false);
  }, [index, stepId, completeAshore]);

  const onClaimMarker = useCallback((id: string) => {
    playCapitalSfx("walk_stop");
    void trackFirstControlReceived("ashore_walk");
    setClaimed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const walkDone = WALK_MARKERS.every((m) => claimed.includes(m.id));
  const fantasyDone = fantasyPoked.length >= 1;

  useEffect(() => {
    if (stepId === "walk" && walkDone) {
      const t = window.setTimeout(advance, Math.round(500 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, stepId, walkDone]);

  const movePhrase = formatMovePhrase();
  const interactPhrase = formatInteractPhrase({ verb: "Talk" });
  const cancelPrompt = useInputPrompt("cancel");

  useInputAction(
    "interact",
    () => {
      if (!nearTalk || talked) return;
      playOrganSfx("memory");
      void trackFirstMeaningfulAction("ashore_talk");
      setTalked(true);
    },
    stepId === "talk" && nearTalk && !talked,
  );

  useInputAction(
    "confirm",
    () => {
      if (!nearTalk || talked) return;
      playOrganSfx("memory");
      void trackFirstMeaningfulAction("ashore_talk");
      setTalked(true);
    },
    stepId === "talk" && nearTalk && !talked,
  );

  useEffect(() => {
    if (stepId === "talk" && talked) {
      const t = window.setTimeout(advance, Math.round(900 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, stepId, talked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        completeAshore("skip");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completeAshore]);

  /** Clear nudge pulse after it has drawn the eye. */
  useEffect(() => {
    if (!toyNudge) return;
    const t = window.setTimeout(() => setToyNudge(false), 1600);
    return () => window.clearTimeout(t);
  }, [toyNudge]);

  useEffect(() => {
    if (!dockNudge) return;
    const t = window.setTimeout(() => setDockNudge(false), 1600);
    return () => window.clearTimeout(t);
  }, [dockNudge]);

  const showPad =
    stepId === "fantasy" || stepId === "walk" || stepId === "talk" || stepId === "ready";
  const padMode =
    stepId === "walk" ? "walk" : stepId === "talk" ? "talk" : "showcase";
  /** Fantasy keeps Voyager as a preview — never let the stage clip the prove dock. */
  const compactPad = stepId === "fantasy" || stepId === "ready";

  useInputAction("cancel", () => completeAshore("skip"));

  const chamberEyebrow = useMemo(() => {
    const map: Record<TeachStepId, string> = {
      fantasy: "Chamber 1 · Fantasy",
      walk: "Chamber 2 · Walk",
      talk: "Chamber 3 · Talk",
      dock: "Chamber 4 · Carpet Dock",
      ready: "Chamber 5 · Launch",
    };
    return map[stepId];
  }, [stepId]);

  const pokeFantasy = (id: MoneyOrganId) => {
    setToyNudge(false);
    setFantasyPoked((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden text-white"
      data-testid="ashore-comprehension-tutorial"
      data-teach-step={stepId}
      data-teach-mode="chamber-00"
      style={{
        background:
          "radial-gradient(ellipse 85% 65% at 50% 30%, #1e3a5f 0%, #0f172a 52%, #020617 100%)",
      }}
    >
      <header className="relative z-[2] flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
            Capital · Ashore Teach
          </p>
          <p className="text-[10px] text-white/50">{chamberEyebrow}</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="ashore-teach-skip"
          {...pointerSafeActivate(() => completeAshore("skip"))}
        >
          Leave · Esc
        </button>
      </header>

      <div
        className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        data-testid="ashore-teach-scroll"
      >
        {showPad ? (
          <div
            className={`relative mx-auto w-full max-w-3xl shrink-0 px-3 ${
              compactPad
                ? "max-h-[30vh] min-h-[22vh] sm:max-h-[34vh]"
                : "min-h-[38vh] flex-1 sm:min-h-[44vh]"
            }`}
          >
            <VoyagerWalkPracticeStage
              character={voyager}
              mode={padMode}
              claimed={claimed}
              onClaimMarker={onClaimMarker}
              talkTarget={TALK_TARGET}
              nearTalk={nearTalk}
              onNearTalkChange={setNearTalk}
              className={`h-full overflow-hidden rounded-2xl ring-1 ring-amber-200/25 ${
                compactPad ? "min-h-[22vh] max-h-[30vh] sm:max-h-[34vh]" : "min-h-[38vh] sm:min-h-[44vh]"
              }`}
            />
            {(stepId === "walk" || stepId === "talk") ? (
              <div className="pointer-events-auto absolute bottom-3 right-5 z-[3] sm:hidden">
                <TouchWalkPad />
              </div>
            ) : null}
          </div>
        ) : null}

        <main
          className={`relative z-[2] flex flex-col items-center px-5 pb-3 text-center ${
            showPad ? "shrink-0 pt-3" : "flex-1 justify-center pt-2"
          }`}
        >
          {stepId === "fantasy" ? (
            <>
              <h1 className="max-w-xl font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
                Money is alive here
              </h1>
              <p className="mt-3 max-w-lg text-base text-white/85">{MURAL_THESIS}</p>
              <p className="mt-2 max-w-md text-sm text-amber-100/85">
                That Voyager is you — {voyager.name || "your cast"}. Poke a living-money toy below,
                then walk.
              </p>
            </>
          ) : null}

          {stepId === "walk" ? (
            <>
              <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
                Walk your Voyager
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/85">
                Reach every glowing ring — this is how you explore Harbor. {movePhrase}.
              </p>
              <p
                className="mt-3 text-sm font-bold text-amber-100"
                data-testid="ashore-teach-gate"
                data-gate="walk-markers"
              >
                {claimed.length}/{WALK_MARKERS.length} rings ·{" "}
                {walkDone ? "Chamber clear" : "Step into the light"}
              </p>
            </>
          ) : null}

          {stepId === "talk" ? (
            <>
              <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
                Talk when you choose
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/85">
                Piggy waits by the fountain. Walk into the pink ring — use {interactPhrase.toLowerCase()} only
                when you’re ready, or tap the button below.
              </p>
              <p
                className="mt-3 text-sm font-bold text-amber-100"
                data-testid="ashore-teach-gate"
                data-gate="talk-near"
                aria-live="polite"
              >
                {talked
                  ? "Piggy: Meet me at Harbor — then the Carpet Dock south."
                  : nearTalk
                    ? `${interactPhrase} · or tap below`
                    : "Walk to Piggy"}
              </p>
              {nearTalk && !talked ? (
                <button
                  type="button"
                  className={CTA}
                  data-testid="ashore-teach-talk"
                  {...pointerSafeActivate(() => {
                    playOrganSfx("memory");
                    setTalked(true);
                  })}
                >
                  Talk to Piggy?
                </button>
              ) : null}
            </>
          ) : null}

          {stepId === "dock" ? (
            <>
              <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
                Board a living painting
              </h1>
              <p className="mt-2 max-w-lg text-sm text-white/85">
                The Money Carpet is your voyage vehicle. Cove is lit first — that’s where your first
                game waits.
              </p>
              <div
                className={`mt-4 w-full ${dockNudge ? "animate-pulse" : ""}`}
                data-dock-nudge={dockNudge ? "1" : "0"}
              >
                <CarpetDockShowcase
                  boarded={carpetBoarded}
                  onBoard={() => {
                    setDockNudge(false);
                    setCarpetBoarded(true);
                  }}
                />
              </div>
            </>
          ) : null}

          {stepId === "ready" ? (
            <>
              <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
                Harbor, then Cove
              </h1>
              <p className="mt-2 max-w-lg text-sm text-white/85">
                You’ll land on Harbor Haven. Talk to Piggy, walk south to the Carpet Dock, and board{" "}
                <span className="font-bold text-amber-100">Coincraft Cove</span>. Your choice there
                will stain Harbor — that’s the real lesson.
              </p>
              <div className="mt-4 w-full">
                <ReadyCarpetShowcase />
              </div>
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
      </div>

      {/* Prove dock — always on-screen so Chamber 1 / Dock never soft-lock below the fold */}
      {(stepId === "fantasy" || stepId === "dock" || stepId === "ready") && (
        <div
          className="relative z-[3] flex shrink-0 flex-col items-center border-t border-amber-200/20 bg-[#020617]/95 px-4 pb-3 pt-3 backdrop-blur-sm"
          data-testid="ashore-teach-prove-dock"
        >
          {stepId === "fantasy" ? (
            <>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100/80">
                {fantasyDone ? "Toy lit · continue" : "Tap a living-money toy"}
              </p>
              <FantasyOrganToys poked={fantasyPoked} onPoke={pokeFantasy} nudge={toyNudge} />
              <button
                type="button"
                className={fantasyDone ? CTA : CTA_MUTED}
                data-testid="ashore-teach-continue"
                aria-disabled={!fantasyDone}
                {...pointerSafeActivate(() => {
                  if (!fantasyDone) {
                    setToyNudge(true);
                    return;
                  }
                  advance();
                })}
              >
                {fantasyDone ? "Enter the walk chamber" : "Poke a living-money toy"}
              </button>
            </>
          ) : null}

          {stepId === "dock" ? (
            <button
              type="button"
              className={carpetBoarded ? CTA : CTA_MUTED}
              data-testid="ashore-teach-continue"
              aria-disabled={!carpetBoarded}
              {...pointerSafeActivate(() => {
                if (!carpetBoarded) {
                  setDockNudge(true);
                  return;
                }
                playOrganSfx("coin");
                advance();
              })}
            >
              {carpetBoarded ? "Ready to launch" : "Board Cove first"}
            </button>
          ) : null}

          {stepId === "ready" ? (
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              {...pointerSafeActivate(() => completeAshore("complete"))}
            >
              Launch carpet · {voyager.name || "Voyager"}
            </button>
          ) : null}
        </div>
      )}

      <footer className="relative z-[2] shrink-0 px-4 pb-3 pt-1 text-center">
        <p className="text-[11px] uppercase tracking-wider text-white/45">
          Chamber {index + 1} / {STEPS.length} · Leave · {cancelPrompt.label}
        </p>
        <div className="mx-auto mt-2 flex max-w-xs justify-center gap-1.5">
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 max-w-10 flex-1 rounded-full ${
                i <= index ? "bg-amber-300" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}

/** Exported for unit contracts — spine places (taught in-world after Ashore). */
export const ASHORE_SPINE_PAINTING_PLACES = SPINE_PAINTINGS.map((p) => p.place);
export const ASHORE_TEACH_STEP_COUNT = STEPS.length;
