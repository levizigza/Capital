/**
 * Ashore Teach — iconic pre-carpet chambers.
 * Portal prove-it pad → Talk opt-in → loop → paintings (islands) → toolkit → carpet.
 * Design: docs/ashore-teach-design.md
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CapitalCharacter } from "../character";
import { BASE_VOYAGER } from "../character";
import { capitalMusic } from "../audio/capitalMusic";
import { playOrganSfx } from "../audio/capitalSfx";
import { MONEY_ORGANS, MURAL_THESIS, type MoneyOrganId } from "../moneyOrgans";
import { coldOrganKidSentence, organVerbChip } from "../worldMemory";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";
import { TouchWalkPad } from "./TouchWalkPad";
import {
  TALK_TARGET,
  VoyagerWalkPracticeStage,
  WALK_MARKERS,
} from "../world3d/VoyagerWalkPracticeStage";
import { pointerSafeActivate } from "../pointerSafeClick";
import { useInputAction } from "@/input";

export type TeachStepId =
  | "fantasy"
  | "walk"
  | "talk"
  | "loop"
  | "organs"
  | "toolkit"
  | "ready";

const STEPS: TeachStepId[] = [
  "fantasy",
  "walk",
  "talk",
  "loop",
  "organs",
  "toolkit",
  "ready",
];

/** Signature loop — place names first so kids know where the game lives. */
const LOOP_BEATS = [
  {
    id: "harbor",
    title: "Harbor Haven",
    line: "Your home plaza. Talk to Piggy when you choose. The Money Carpet waits at the south pier.",
    organ: "memory" as MoneyOrganId,
  },
  {
    id: "carpet",
    title: "Money Carpet",
    line: "Board a painting from the Carpet Dock. First painting: Coincraft Cove — that is where the first game lives.",
    organ: "coin" as MoneyOrganId,
  },
  {
    id: "take",
    title: "Cove Take",
    line: "On Cove you play, then choose jar or treat. You cannot put it back — Harbor will feel that Take.",
    organ: "coin" as MoneyOrganId,
  },
  {
    id: "return",
    title: "Harbor remembers",
    line: "Carpet home. The Memory Plinth glows with your scar. Piggy names what changed. Then the next painting opens.",
    organ: "memory" as MoneyOrganId,
  },
];

/**
 * Spine paintings — where you go to play.
 * Visual gallery so Ashore is not abstract organ jargon alone.
 */
const SPINE_PAINTINGS: {
  organ: MoneyOrganId;
  place: string;
  role: string;
  playWhere: string;
  order: string;
}[] = [
  {
    organ: "memory",
    place: "Harbor Haven",
    role: "Home plaza",
    playWhere: "Fountain · Piggy · Memory Plinth · Carpet Dock south",
    order: "Always",
  },
  {
    organ: "coin",
    place: "Coincraft Cove",
    role: "First painting · first game",
    playWhere: "Keeper Kira at the Savings Lighthouse — jar before treat, or treat before jar",
    order: "1st",
  },
  {
    organ: "clock",
    place: "Paycheck Peninsula",
    role: "Second painting",
    playWhere: "Vendor Vee on Main Street — umbrella before glitter, or glitter ate the umbrella",
    order: "2nd",
  },
  {
    organ: "spiral",
    place: "Credit Kingdom",
    role: "Third painting",
    playWhere: "Rex in Debt Canyon — waited the spiral, or haste fed the spiral",
    order: "3rd",
  },
];

/** Toolkit = verbs not already proved in Walk/Talk chambers (Hermans elegancy). */
const TOOLKIT = [
  {
    id: "enter",
    label: "Enter",
    detail: "Coin Jar · Payroll Tower · Interest Keep · Ledger Bank (Soft Beat peeks vs arcade pads)",
  },
  { id: "take", label: "Take", detail: "Irreversible fork on the painting shore — not inside the Soft Beat" },
  { id: "return", label: "Return", detail: "Carpet home — Harbor’s Plinth keeps the scar" },
  { id: "share", label: "Share", detail: "Freeze the Plinth — your social object" },
];

type Props = {
  character?: CapitalCharacter | null;
  onComplete: () => void;
};

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
  const [loopBeat, setLoopBeat] = useState(0);
  const [organsSeen, setOrgansSeen] = useState<MoneyOrganId[]>([]);
  const [toolkitLit, setToolkitLit] = useState<string[]>([]);
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

  useEffect(() => {
    if (stepId === "walk" && walkDone) {
      const t = window.setTimeout(advance, Math.round(500 * cinemaTimeScale()));
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onComplete]);

  const showPad = stepId === "fantasy" || stepId === "walk" || stepId === "talk" || stepId === "ready";
  const padMode =
    stepId === "walk" ? "walk" : stepId === "talk" ? "talk" : "showcase";

  const loop = LOOP_BEATS[loopBeat]!;
  /** Prove one painting — rest wait on the Carpet map. */
  const organsComplete = organsSeen.length >= 1;
  const toolkitComplete = toolkitLit.length >= 1;
  useInputAction("cancel", onComplete);

  const chamberEyebrow = useMemo(() => {
    const map: Record<TeachStepId, string> = {
      fantasy: "Chamber 1 · Fantasy",
      walk: "Chamber 2 · Walk",
      talk: "Chamber 3 · Talk",
      loop: "Chamber 4 · The Loop",
      organs: "Chamber 5 · Paintings",
      toolkit: "Chamber 6 · Toolkit",
      ready: "Chamber 7 · Carpet",
    };
    return map[stepId];
  }, [stepId]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col text-white"
      data-testid="ashore-comprehension-tutorial"
      data-teach-step={stepId}
      style={{
        background:
          "radial-gradient(ellipse 85% 65% at 50% 30%, #1e3a5f 0%, #0f172a 52%, #020617 100%)",
      }}
    >
      <header className="relative z-[2] flex items-center justify-between px-4 py-3 sm:px-6">
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
          {...pointerSafeActivate(onComplete)}
        >
          Leave · Esc
        </button>
      </header>

      {showPad ? (
        <div className="relative z-[1] mx-auto w-full max-w-3xl flex-1 min-h-[42vh] px-3 sm:min-h-[48vh]">
          <VoyagerWalkPracticeStage
            character={voyager}
            mode={padMode}
            claimed={claimed}
            onClaimMarker={onClaimMarker}
            talkTarget={TALK_TARGET}
            nearTalk={nearTalk}
            onNearTalkChange={setNearTalk}
            className="h-full min-h-[42vh] overflow-hidden rounded-2xl ring-1 ring-amber-200/25 sm:min-h-[48vh]"
          />
          {(stepId === "walk" || stepId === "talk") && !reduced ? (
            <div className="pointer-events-auto absolute bottom-3 right-5 z-[3] sm:hidden">
              <TouchWalkPad />
            </div>
          ) : null}
        </div>
      ) : null}

      <main
        className={`relative z-[2] flex flex-col items-center px-5 pb-4 text-center ${
          showPad ? "pt-3" : "flex-1 justify-center overflow-y-auto pt-4"
        }`}
      >
        {stepId === "fantasy" ? (
          <>
            <h1 className="max-w-xl font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
              Money is alive here
            </h1>
            <p className="mt-3 max-w-lg text-base text-white/85">{MURAL_THESIS}</p>
            <p className="mt-2 max-w-md text-sm text-amber-100/80">
              That Voyager on the pad is you. Next: walk them — then you’ll see the paintings
              where the games live.
            </p>
            <button
              type="button"
              className="mt-6 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
              data-testid="ashore-teach-continue"
              {...pointerSafeActivate(advance)}
            >
              Enter the walk chamber
            </button>
          </>
        ) : null}

        {stepId === "walk" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Walk your Voyager
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Reach every glowing ring — this is how you explore Harbor and every painting shore.
              WASD or arrows.
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
              On Harbor, Piggy waits by the fountain. Walk into the pink ring — press E only when
              you’re ready. Nothing ambushes you.
            </p>
            <p
              className="mt-3 text-sm font-bold text-amber-100"
              data-testid="ashore-teach-gate"
              data-gate="talk-near"
            >
              {talked
                ? "Piggy: I’ll wait by the fountain — then the Carpet Dock south."
                : nearTalk
                  ? "Press E to talk"
                  : "Walk to Piggy"}
            </p>
            {nearTalk && !talked ? (
              <button
                type="button"
                className="mt-4 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
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

        {stepId === "loop" ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">
              How you play · {loopBeat + 1}/{LOOP_BEATS.length}
            </p>
            <h1 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              {loop.title}
            </h1>
            <p className="mt-3 max-w-lg text-base text-white/85">{loop.line}</p>
            <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
              {LOOP_BEATS.map((b, i) => (
                <span
                  key={b.id}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    i === loopBeat
                      ? "bg-amber-400 text-[#1c1917]"
                      : i < loopBeat
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/40"
                  }`}
                >
                  {b.title}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
              data-testid="ashore-teach-continue"
              {...pointerSafeActivate(() => {
                playOrganSfx(loop.organ);
                if (loopBeat >= LOOP_BEATS.length - 1) advance();
                else setLoopBeat((n) => n + 1);
              })}
            >
              {loopBeat >= LOOP_BEATS.length - 1
                ? "See the paintings"
                : "Next place"}
            </button>
          </>
        ) : null}

        {stepId === "organs" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Where the games live
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Four paintings on the Money Carpet. Each card shows the place and the real Take —
              prove any painting to continue. Cove is first.
            </p>
            <ul
              className="mt-5 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
              data-testid="ashore-teach-organs"
              data-gallery="spine-paintings"
            >
              {SPINE_PAINTINGS.map((painting) => {
                const organ = MONEY_ORGANS[painting.organ];
                const seen = organsSeen.includes(painting.organ);
                return (
                  <li key={painting.organ}>
                    <button
                      type="button"
                      data-testid={`ashore-organ-${painting.organ}`}
                      data-painting-place={painting.place}
                      {...pointerSafeActivate(() => {
                        playOrganSfx(painting.organ);
                        setOrgansSeen((prev) =>
                          prev.includes(painting.organ)
                            ? prev
                            : [...prev, painting.organ],
                        );
                      })}
                      className={`w-full overflow-hidden rounded-xl text-left ring-1 transition ${
                        seen
                          ? "bg-white/15 ring-amber-200/50"
                          : "bg-white/5 ring-white/15 hover:bg-white/10"
                      }`}
                    >
                      {/* Painting frame — place first, not abstract organ jargon */}
                      <div
                        className="relative px-4 pb-3 pt-3"
                        style={{
                          borderTop: `5px solid ${organ.accentHint}`,
                          background: `linear-gradient(165deg, ${organ.accentHint}33 0%, transparent 55%)`,
                        }}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                            {painting.order === "Always"
                              ? "Home"
                              : `Painting · ${painting.order}`}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: organ.accentHint }}
                          >
                            {organVerbChip(painting.organ)}
                          </span>
                        </div>
                        <span
                          className="mt-1 block text-lg font-black tracking-tight"
                          style={{ color: organ.accentHint }}
                        >
                          {painting.place}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-white/80">
                          {painting.role}
                        </span>
                        <span className="mt-2 block text-[11px] leading-snug text-white/70">
                          Play here: {painting.playWhere}
                        </span>
                        <span className="mt-1.5 block text-[11px] italic text-amber-100/75">
                          {coldOrganKidSentence(painting.organ)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 max-w-md text-[11px] text-white/55">
              Route: Harbor → Carpet → Cove → Harbor → Paycheck → Harbor → Credit
            </p>
            <button
              type="button"
              className="mt-5 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] disabled:opacity-40"
              data-testid="ashore-teach-continue"
              disabled={!organsComplete}
              {...pointerSafeActivate(advance)}
            >
              {organsComplete ? "Your toolkit" : "Prove one painting"}
            </button>
          </>
        ) : null}

        {stepId === "toolkit" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              What you can do
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Walk and Talk you already proved. Light one more verb — Takes live on the shore;
              Soft Beats are quiet peeks inside the machines.
            </p>
            <ul className="mt-5 grid w-full max-w-lg grid-cols-2 gap-2" data-testid="ashore-teach-toolkit">
              {TOOLKIT.map((t) => {
                const lit = toolkitLit.includes(t.id);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      data-testid={`ashore-tool-${t.id}`}
                      {...pointerSafeActivate(() =>
                        setToolkitLit((prev) =>
                          prev.includes(t.id) ? prev : [...prev, t.id],
                        ),
                      )}
                      className={`w-full rounded-xl px-3 py-3 text-left ring-1 ${
                        lit
                          ? "bg-amber-400/20 ring-amber-200/60"
                          : "bg-white/5 ring-white/15 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm font-black text-amber-100">{t.label}</span>
                      <span className="mt-0.5 block text-[11px] text-white/70">{t.detail}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="mt-6 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] disabled:opacity-40"
              data-testid="ashore-teach-continue"
              disabled={!toolkitComplete}
              {...pointerSafeActivate(advance)}
            >
              {toolkitComplete ? "Board the Money Carpet" : "Light one verb"}
            </button>
          </>
        ) : null}

        {stepId === "ready" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
              Board the Money Carpet
            </h1>
            <p className="mt-3 max-w-lg text-base text-white/85">
              You’ll land on Harbor Haven. Talk to Piggy at the fountain, then walk south to the
              Carpet Dock. Board the{" "}
              <span className="font-bold text-amber-100">Coincraft Cove</span> painting — that’s
              where your first game waits.
            </p>
            <ul
              className="mt-4 flex w-full max-w-lg flex-wrap justify-center gap-2"
              data-testid="ashore-teach-route"
              aria-label="Main painting route"
            >
              {SPINE_PAINTINGS.filter((p) => p.organ !== "memory").map((p) => (
                <li
                  key={p.organ}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-bold ring-1 ring-white/20"
                  style={{
                    color: MONEY_ORGANS[p.organ].accentHint,
                    background: `${MONEY_ORGANS[p.organ].accentHint}22`,
                  }}
                >
                  {p.order} · {p.place}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
              data-testid="ashore-teach-continue"
              {...pointerSafeActivate(onComplete)}
            >
              Launch carpet · {voyager.name || "Voyager"}
            </button>
          </>
        ) : null}
      </main>

      <footer className="relative z-[2] px-4 pb-4 text-center">
        <p className="text-[11px] uppercase tracking-wider text-white/45">
          Chamber {index + 1} / {STEPS.length} · Esc · Leave
        </p>
        <div className="mx-auto mt-2 flex max-w-md justify-center gap-1.5">
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 flex-1 max-w-8 rounded-full ${
                i <= index ? "bg-amber-300" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}

/** Exported for unit contracts — spine painting gallery copy. */
export const ASHORE_SPINE_PAINTING_PLACES = SPINE_PAINTINGS.map((p) => p.place);
