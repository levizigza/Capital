/**
 * Ashore Teach — iconic Chamber 00.
 * One living-money room that morphs: Alive → Walk → Talk → Board → Launch.
 * First Cove→Harbor loop in the real game is the rest of the tutorial.
 * Design: docs/ashore-teach-design.md · docs/ashore-tutorial-research.md
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CapitalCharacter } from "../character";
import { BASE_VOYAGER } from "../character";
import { capitalMusic } from "../audio/capitalMusic";
import { playOrganSfx } from "../audio/capitalSfx";
import { MURAL_THESIS, type MoneyOrganId } from "../moneyOrgans";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";
import { TouchWalkPad } from "./TouchWalkPad";
import {
  TALK_TARGET,
  VoyagerWalkPracticeStage,
  WALK_MARKERS,
} from "../world3d/VoyagerWalkPracticeStage";
import { pointerSafeActivate } from "../pointerSafeClick";
import { useInputAction } from "@/input";
import {
  CarpetDockShowcase,
  FantasyOrganToys,
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

const LAUNCH_CTA =
  "min-h-12 w-full max-w-sm rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]";

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
  const reduced = prefersReducedMotion();

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "opening" });
  }, []);

  const advance = useCallback(() => {
    if (index >= STEPS.length - 1) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  }, [index, onComplete]);

  const onClaimMarker = useCallback((id: string) => {
    setClaimed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const walkDone = WALK_MARKERS.every((m) => claimed.includes(m.id));
  const fantasyDone = fantasyPoked.length >= 1;

  /** Body proved → morph the room (no homework Continue). */
  useEffect(() => {
    if (stepId === "fantasy" && fantasyDone) {
      const t = window.setTimeout(advance, Math.round(1100 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, fantasyDone, stepId]);

  useEffect(() => {
    if (stepId === "walk" && walkDone) {
      const t = window.setTimeout(advance, Math.round(550 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, stepId, walkDone]);

  useEffect(() => {
    if (stepId !== "talk" || talked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if ((e.code === "KeyE" || e.key === "e" || e.key === "E") && nearTalk) {
        e.preventDefault();
        playOrganSfx("memory");
        setTalked(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nearTalk, stepId, talked]);

  useEffect(() => {
    if (stepId === "talk" && talked) {
      const t = window.setTimeout(advance, Math.round(900 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, stepId, talked]);

  useEffect(() => {
    if (stepId === "dock" && carpetBoarded) {
      const t = window.setTimeout(advance, Math.round(900 * cinemaTimeScale()));
      return () => window.clearTimeout(t);
    }
  }, [advance, carpetBoarded, stepId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onComplete]);

  const showPad = stepId === "fantasy" || stepId === "walk" || stepId === "talk";
  const padMode =
    stepId === "walk" ? "walk" : stepId === "talk" ? "talk" : "showcase";

  useInputAction("cancel", onComplete);

  const line = useMemo(() => {
    if (stepId === "fantasy") {
      return fantasyDone
        ? "It answered. The light opens…"
        : `You are ${voyager.name || "the Voyager"}. Poke living money.`;
    }
    if (stepId === "walk") {
      return walkDone
        ? "The path is yours."
        : "Step into every light — this is how you explore.";
    }
    if (stepId === "talk") {
      if (talked) return "Piggy will meet you at Harbor.";
      if (nearTalk) return "Press E when you choose.";
      return "Walk to Piggy — talk only when you want.";
    }
    if (stepId === "dock") {
      return carpetBoarded
        ? "Cove first. Harbor will remember."
        : "Board the lit Cove painting.";
    }
    return "Harbor Haven, then Coincraft Cove.";
  }, [
    carpetBoarded,
    fantasyDone,
    nearTalk,
    stepId,
    talked,
    voyager.name,
    walkDone,
  ]);

  const pokeFantasy = (id: MoneyOrganId) => {
    setFantasyPoked((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden text-white"
      data-testid="ashore-comprehension-tutorial"
      data-teach-step={stepId}
      data-teach-mode="chamber-00"
      data-iconic="seed-chamber"
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 50% 42%, #1e3a5f 0%, #0c1929 45%, #020617 100%)",
      }}
    >
      {/* Seed of Life — quiet geometry behind the living room */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] z-0 h-[min(92vw,34rem)] w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 opacity-30"
        aria-hidden
        data-sacred="seed-of-life"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, transparent 31%, rgba(167,243,208,0.9) 32%, transparent 33.5%),
            radial-gradient(circle at 50% 18%, transparent 31%, rgba(167,243,208,0.55) 32%, transparent 33.5%),
            radial-gradient(circle at 50% 82%, transparent 31%, rgba(167,243,208,0.55) 32%, transparent 33.5%),
            radial-gradient(circle at 22% 34%, transparent 31%, rgba(253,230,138,0.4) 32%, transparent 33.5%),
            radial-gradient(circle at 78% 34%, transparent 31%, rgba(253,230,138,0.4) 32%, transparent 33.5%),
            radial-gradient(circle at 22% 66%, transparent 31%, rgba(253,230,138,0.4) 32%, transparent 33.5%),
            radial-gradient(circle at 78% 66%, transparent 31%, rgba(253,230,138,0.4) 32%, transparent 33.5%)
          `,
        }}
      />

      <header className="relative z-[2] flex shrink-0 items-start justify-between px-4 py-3 pr-16 sm:px-6 sm:pr-20">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200/85">
            Capital
          </p>
          <h1
            className="mt-1 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black tracking-tight text-white sm:text-3xl"
            data-testid="ashore-iconic-title"
          >
            {stepId === "fantasy"
              ? "Money is alive here"
              : stepId === "dock" || stepId === "ready"
                ? "Board Cove"
                : "Inside living money"}
          </h1>
          {stepId === "fantasy" && !fantasyDone ? (
            <p className="mt-1 max-w-md text-sm text-white/75">{MURAL_THESIS}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/65 ring-1 ring-white/20 hover:bg-white/10"
          data-testid="ashore-teach-skip"
          {...pointerSafeActivate(onComplete)}
        >
          Leave · Esc
        </button>
      </header>

      {/* Full-bleed prove stage — the room, not a card */}
      <div
        className="relative z-[1] mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-3"
        data-testid="ashore-teach-scroll"
      >
        {showPad ? (
          <div className="relative min-h-0 flex-1">
            <VoyagerWalkPracticeStage
              character={voyager}
              mode={padMode}
              claimed={claimed}
              onClaimMarker={onClaimMarker}
              talkTarget={TALK_TARGET}
              nearTalk={nearTalk}
              onNearTalkChange={setNearTalk}
              className="h-full min-h-[42vh] overflow-hidden rounded-[1.5rem] ring-1 ring-amber-200/20 sm:min-h-[48vh]"
            />
            {(stepId === "walk" || stepId === "talk") && !reduced ? (
              <div className="pointer-events-auto absolute bottom-3 right-5 z-[3] sm:hidden">
                <TouchWalkPad />
              </div>
            ) : null}
          </div>
        ) : null}

        {stepId === "dock" ? (
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center py-2"
            data-testid="ashore-teach-prove-dock"
          >
            <CarpetDockShowcase
              boarded={carpetBoarded}
              onBoard={() => {
                playOrganSfx("coin");
                setCarpetBoarded(true);
              }}
            />
          </div>
        ) : null}

        {stepId === "ready" ? (
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 text-center"
            data-testid="ashore-teach-prove-dock"
          >
            <p className="max-w-md text-base text-white/85">
              Land on <span className="font-bold text-amber-100">Harbor Haven</span>. Your Cove
              choice will stain home — that’s the real lesson.
            </p>
            <ul
              className="flex flex-wrap justify-center gap-2"
              data-testid="ashore-teach-route"
              aria-label="First voyage"
            >
              <li className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-amber-100 ring-1 ring-white/20">
                Harbor Haven
              </li>
              <li className="rounded-full bg-amber-400/25 px-3 py-1.5 text-[11px] font-bold text-amber-100 ring-1 ring-amber-200/50">
                Coincraft Cove
              </li>
            </ul>
            <button
              type="button"
              className={LAUNCH_CTA}
              data-testid="ashore-teach-continue"
              {...pointerSafeActivate(onComplete)}
            >
              Launch carpet · {voyager.name || "Voyager"}
            </button>
          </div>
        ) : null}
      </div>

      {/* Golden-section lower third — one line + in-world toys */}
      <div className="relative z-[3] flex shrink-0 flex-col items-center gap-3 px-4 pb-4 pt-2">
        {stepId === "fantasy" ? (
          <FantasyOrganToys
            poked={fantasyPoked}
            onPoke={pokeFantasy}
            spectacle
          />
        ) : null}

        {stepId === "talk" && nearTalk && !talked ? (
          <button
            type="button"
            className={LAUNCH_CTA}
            data-testid="ashore-teach-talk"
            {...pointerSafeActivate(() => {
              playOrganSfx("memory");
              setTalked(true);
            })}
          >
            Talk to Piggy?
          </button>
        ) : null}

        <p
          className="max-w-lg text-center text-sm font-semibold text-amber-50/90 sm:text-base"
          data-testid="ashore-teach-gate"
          data-gate={
            stepId === "walk"
              ? "walk-markers"
              : stepId === "talk"
                ? "talk-near"
                : stepId
          }
        >
          {stepId === "walk"
            ? `${claimed.length}/${WALK_MARKERS.length} · ${line}`
            : line}
        </p>

        {/* Seed petals — progress without “Chamber 3/5” chrome */}
        <div
          className="flex items-center justify-center gap-2"
          aria-label={`Beat ${index + 1} of ${STEPS.length}`}
        >
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-2 w-2 rounded-full transition ${
                i < index
                  ? "bg-amber-300"
                  : i === index
                    ? "scale-125 bg-amber-200 ring-2 ring-amber-100/50"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Esc · Leave</p>
      </div>
    </div>
  );
}

/** Exported for unit contracts — spine places (taught in-world after Ashore). */
export const ASHORE_SPINE_PAINTING_PLACES = SPINE_PAINTINGS.map((p) => p.place);
export const ASHORE_TEACH_STEP_COUNT = STEPS.length;
