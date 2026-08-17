/**
 * Ashore Teach — iconic Chamber 00.
 * One living-money room that morphs: Alive → Walk → Talk → Board → Launch.
 * Toys live in the 3D pad; one whisper; Leave · Esc. Real tutorial = first Cove→Harbor.
 * Criteria: docs/ashore-iconic-criteria.md · Design: docs/ashore-teach-design.md
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CapitalCharacter } from "../character";
import { BASE_VOYAGER } from "../character";
import { capitalMusic } from "../audio/capitalMusic";
import { playOrganSfx } from "../audio/capitalSfx";
import { type MoneyOrganId } from "../moneyOrgans";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";
import { TouchWalkPad } from "./TouchWalkPad";
import {
  TALK_TARGET,
  VoyagerWalkPracticeStage,
  WALK_MARKERS,
  type PracticeMode,
} from "../world3d/VoyagerWalkPracticeStage";
import { pointerSafeActivate } from "../pointerSafeClick";
import { useInputAction } from "@/input";

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

function chamberMode(stepId: TeachStepId): PracticeMode {
  if (stepId === "fantasy") return "fantasy";
  if (stepId === "walk") return "walk";
  if (stepId === "talk") return "talk";
  if (stepId === "dock") return "dock";
  return "showcase";
}

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
  const [skipReady, setSkipReady] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "opening" });
  }, []);

  useEffect(() => {
    setSkipReady(false);
    const t = window.setTimeout(() => setSkipReady(true), 4200);
    return () => window.clearTimeout(t);
  }, [stepId]);

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

  const pokeFantasy = useCallback((id: MoneyOrganId) => {
    setFantasyPoked((prev) => (prev.includes(id) ? prev : [...prev, id]));
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

  useInputAction("cancel", onComplete);

  const line = useMemo(() => {
    if (stepId === "fantasy") {
      return fantasyDone
        ? "It answered…"
        : `You are ${voyager.name || "the Voyager"}. Living money waits.`;
    }
    if (stepId === "walk") {
      return walkDone ? "The path is yours." : "Step into every light.";
    }
    if (stepId === "talk") {
      if (talked) return "Piggy will meet you at Harbor.";
      if (nearTalk) return "Press E when you choose.";
      return "Walk to the pink hush — talk only if you want.";
    }
    if (stepId === "dock") {
      return carpetBoarded
        ? "Cove first. Harbor will remember."
        : "Board the glowing carpet — Cove first.";
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

  const padMode = chamberMode(stepId);
  const showPad = stepId !== "ready";
  const showMobilePad =
    stepId === "fantasy" ||
    stepId === "walk" ||
    stepId === "talk" ||
    stepId === "dock";

  return (
    <div
      className="fixed inset-0 z-[80] overflow-hidden text-white"
      data-testid="ashore-comprehension-tutorial"
      data-teach-step={stepId}
      data-teach-mode="chamber-00"
      data-iconic="seed-chamber"
      data-sacred="seed-of-life"
    >
      {/* Full-bleed living chamber — one composition */}
      {showPad ? (
        <div className="absolute inset-0" data-testid="ashore-teach-scroll">
          <VoyagerWalkPracticeStage
            character={voyager}
            mode={padMode}
            claimed={claimed}
            onClaimMarker={onClaimMarker}
            talkTarget={TALK_TARGET}
            nearTalk={nearTalk}
            onNearTalkChange={setNearTalk}
            fantasyPoked={fantasyPoked}
            onPokeOrgan={pokeFantasy}
            carpetBoarded={carpetBoarded}
            onBoardCove={() => {
              setCarpetBoarded(true);
            }}
            className="h-full w-full"
          />
          {showMobilePad && !reduced ? (
            <div className="pointer-events-auto absolute bottom-3 right-5 z-[3] sm:hidden">
              <TouchWalkPad />
            </div>
          ) : null}
          {/* A11y + e2e hit targets — visuals are the 3D toys / carpet */}
          {stepId === "fantasy" ? (
            <div
              className="pointer-events-none absolute inset-0"
              data-testid="ashore-fantasy-toys"
              data-spectacle="1"
            >
              <button
                type="button"
                className="pointer-events-auto absolute left-[28%] top-[48%] h-[18vmin] w-[18vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.01]"
                data-testid="ashore-fantasy-toy-memory"
                aria-label="Poke Memory organ"
                {...pointerSafeActivate(() => pokeFantasy("memory"))}
              />
              <button
                type="button"
                className="pointer-events-auto absolute left-[72%] top-[48%] h-[18vmin] w-[18vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.01]"
                data-testid="ashore-fantasy-toy-coin"
                aria-label="Poke Coin organ"
                {...pointerSafeActivate(() => pokeFantasy("coin"))}
              />
            </div>
          ) : null}
          {stepId === "dock" && !carpetBoarded ? (
            <button
              type="button"
              className="pointer-events-auto absolute bottom-[28%] left-1/2 z-[4] h-16 w-40 -translate-x-1/2 rounded-full opacity-[0.01]"
              data-testid="ashore-carpet-board-cove"
              aria-label="Board Coincraft Cove carpet"
              {...pointerSafeActivate(() => {
                playOrganSfx("coin");
                setCarpetBoarded(true);
              })}
            />
          ) : null}
        </div>
      ) : null}

      {stepId === "ready" ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,#1e3a5f_0%,#0c1929_45%,#020617_100%)] px-4 text-center"
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

      {/* Leave — always reachable */}
      <button
        type="button"
        className="absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-[5] rounded-lg bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/25 backdrop-blur-sm hover:bg-black/50"
        data-testid="ashore-teach-skip"
        {...pointerSafeActivate(onComplete)}
      >
        Leave · Esc
      </button>

      {/* One whisper — no petal chrome, no homework strip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex flex-col items-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        {stepId === "talk" && nearTalk && !talked ? (
          <button
            type="button"
            className={`pointer-events-auto ${LAUNCH_CTA}`}
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
          className="max-w-md text-center text-sm font-medium tracking-wide text-amber-50/80 drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-[0.95rem]"
          data-testid="ashore-teach-gate"
          data-gate={
            stepId === "walk"
              ? "walk-markers"
              : stepId === "talk"
                ? "talk-near"
                : stepId
          }
          role="status"
        >
          {line}
        </p>

        {skipReady &&
        stepId !== "ready" &&
        ((stepId === "fantasy" && !fantasyDone) ||
          (stepId === "walk" && !walkDone) ||
          (stepId === "talk" && !talked) ||
          (stepId === "dock" && !carpetBoarded)) ? (
          <button
            type="button"
            className="pointer-events-auto text-[0.65rem] text-white/35 underline-offset-2 hover:text-white/60 hover:underline"
            data-testid="ashore-teach-skip-beat"
            {...pointerSafeActivate(advance)}
          >
            Skip this beat
          </button>
        ) : null}
      </div>

      <h1 className="sr-only" data-testid="ashore-iconic-title">
        {stepId === "fantasy"
          ? "Money is alive here"
          : stepId === "dock" || stepId === "ready"
            ? "Board Cove"
            : "Inside living money"}
      </h1>
    </div>
  );
}

/** Exported for unit contracts — spine places (taught in-world after Ashore). */
export const ASHORE_SPINE_PAINTING_PLACES = SPINE_PAINTINGS.map((p) => p.place);
export const ASHORE_TEACH_STEP_COUNT = STEPS.length;
