/**
 * Ashore Teach — expanded pre-carpet chambers.
 * One idea per page + dedicated interactive visual (no cramped multi-topic strips).
 * Design: docs/ashore-teach-design.md
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
  EnterStructuresShowcase,
  HarborHomeShowcase,
  PAINTING_LESSONS,
  PaintingLessonShowcase,
  ReadyCarpetShowcase,
  ReturnScarShowcase,
  ShareCardShowcase,
  type HarborSpotId,
  type StructurePadId,
} from "./AshoreTeachShowcases";

export type TeachStepId =
  | "fantasy"
  | "walk"
  | "talk"
  | "harbor"
  | "carpet"
  | "cove"
  | "paycheck"
  | "credit"
  | "return_scar"
  | "enter"
  | "share"
  | "ready";

const STEPS: TeachStepId[] = [
  "fantasy",
  "walk",
  "talk",
  "harbor",
  "carpet",
  "cove",
  "paycheck",
  "credit",
  "return_scar",
  "enter",
  "share",
  "ready",
];

/** Spine places — one chamber each after Harbor (exported for contracts). */
const SPINE_PAINTINGS: {
  organ: MoneyOrganId;
  place: string;
}[] = [
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
  const [nearTalk, setNearTalk] = useState(false);
  const [talked, setTalked] = useState(false);
  const [harborLit, setHarborLit] = useState<HarborSpotId[]>([]);
  const [carpetBoarded, setCarpetBoarded] = useState(false);
  const [coveFork, setCoveFork] = useState<string | null>(null);
  const [payFork, setPayFork] = useState<string | null>(null);
  const [creditFork, setCreditFork] = useState<string | null>(null);
  const [scarGlowed, setScarGlowed] = useState(false);
  const [enterLit, setEnterLit] = useState<StructurePadId[]>([]);
  const [shareFrozen, setShareFrozen] = useState(false);
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
  const harborDone = harborLit.length >= 3;
  const enterDone = enterLit.length >= 2;
  const plaquePreview = coveFork ?? "Jar before treat";

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

  useInputAction("cancel", onComplete);

  const chamberEyebrow = useMemo(() => {
    const map: Record<TeachStepId, string> = {
      fantasy: "Chamber 1 · Fantasy",
      walk: "Chamber 2 · Walk",
      talk: "Chamber 3 · Talk",
      harbor: "Chamber 4 · Harbor Haven",
      carpet: "Chamber 5 · Money Carpet",
      cove: "Chamber 6 · Coincraft Cove",
      paycheck: "Chamber 7 · Paycheck Peninsula",
      credit: "Chamber 8 · Credit Kingdom",
      return_scar: "Chamber 9 · Harbor remembers",
      enter: "Chamber 10 · Enter machines",
      share: "Chamber 11 · Share",
      ready: "Chamber 12 · Board",
    };
    return map[stepId];
  }, [stepId]);

  const lightHarbor = (id: HarborSpotId) => {
    setHarborLit((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const lightEnter = (id: StructurePadId) => {
    setEnterLit((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

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
          showPad ? "pt-3" : "flex-1 justify-start overflow-y-auto pt-2 sm:justify-center"
        }`}
      >
        {stepId === "fantasy" ? (
          <>
            <h1 className="max-w-xl font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
              Money is alive here
            </h1>
            <p className="mt-3 max-w-lg text-base text-white/85">{MURAL_THESIS}</p>
            <p className="mt-3 max-w-md text-sm text-amber-100/85">
              That Voyager on the pad is you — {voyager.name || "your cast"}. Next you’ll walk and
              talk with your body. Then each place gets its own chamber: Harbor, Carpet, Cove,
              Paycheck, Credit, and what Harbor remembers.
            </p>
            <button
              type="button"
              className={CTA}
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
              WASD or arrows on desktop; the stick on phone.
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

        {stepId === "harbor" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Harbor Haven is home
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Your plaza never leaves. Light all three landmarks — Piggy at the fountain, the Memory
              Plinth that keeps scars, and the Carpet Dock south where paintings wait.
            </p>
            <div className="mt-4 w-full">
              <HarborHomeShowcase lit={harborLit} onLight={lightHarbor} />
            </div>
            <p className="mt-3 text-sm font-bold text-amber-100" data-testid="ashore-teach-gate">
              {harborLit.length}/3 landmarks · {harborDone ? "Harbor clear" : "Tap each spot"}
            </p>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!harborDone}
              {...pointerSafeActivate(advance)}
            >
              {harborDone ? "Meet the Money Carpet" : "Light all three"}
            </button>
          </>
        ) : null}

        {stepId === "carpet" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Board a living painting
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              The Money Carpet is your voyage vehicle. At the Dock, Cove is lit first — Paycheck and
              Credit stay dim until you’ve played the earlier painting.
            </p>
            <div className="mt-4 w-full">
              <CarpetDockShowcase
                boarded={carpetBoarded}
                onBoard={() => setCarpetBoarded(true)}
              />
            </div>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!carpetBoarded}
              {...pointerSafeActivate(() => {
                playOrganSfx("coin");
                advance();
              })}
            >
              {carpetBoarded ? "Open Coincraft Cove" : "Board Cove first"}
            </button>
          </>
        ) : null}

        {stepId === "cove" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              First painting · first game
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Coincraft Cove is where you earn fair coins, then meet Keeper Kira’s irreversible Take.
              Practice the fork — the plaque words stick for real later.
            </p>
            <div className="mt-4 w-full">
              <PaintingLessonShowcase
                lesson={PAINTING_LESSONS.coin}
                chosen={coveFork}
                onChoose={setCoveFork}
              />
            </div>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!coveFork}
              {...pointerSafeActivate(advance)}
            >
              {coveFork ? "Next painting · Paycheck" : "Practice one Take fork"}
            </button>
          </>
        ) : null}

        {stepId === "paycheck" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Second painting · payday pressure
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Paycheck Peninsula stamps needs, wants, and savings — then Vendor Vee’s fountain vs
              glitter Take. Different organ from Cove’s jar.
            </p>
            <div className="mt-4 w-full">
              <PaintingLessonShowcase
                lesson={PAINTING_LESSONS.clock}
                chosen={payFork}
                onChoose={setPayFork}
              />
            </div>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!payFork}
              {...pointerSafeActivate(advance)}
            >
              {payFork ? "Next painting · Credit" : "Practice one Take fork"}
            </button>
          </>
        ) : null}

        {stepId === "credit" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Third painting · interest gravity
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Credit Kingdom’s Interest Keep pulls. Rex teaches signals — then the Ordeal: wait the
              spiral, or haste feeds it.
            </p>
            <div className="mt-4 w-full">
              <PaintingLessonShowcase
                lesson={PAINTING_LESSONS.spiral}
                chosen={creditFork}
                onChoose={setCreditFork}
              />
            </div>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!creditFork}
              {...pointerSafeActivate(advance)}
            >
              {creditFork ? "How Harbor remembers" : "Practice one Take fork"}
            </button>
          </>
        ) : null}

        {stepId === "return_scar" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Harbor remembers
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              After any Take you carpet home. The Memory Plinth glows with your plaque — that is the
              Change. You practiced “{plaquePreview}” on Cove; for real it would live here.
            </p>
            <div className="mt-4 w-full">
              <ReturnScarShowcase
                plaque={plaquePreview}
                glowed={scarGlowed}
                onGlow={() => setScarGlowed(true)}
              />
            </div>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!scarGlowed}
              {...pointerSafeActivate(advance)}
            >
              {scarGlowed ? "Enter the money machines" : "Feel the Plinth glow"}
            </button>
          </>
        ) : null}

        {stepId === "enter" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Enter the machines
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Coin Jar, Ledger Bank, Payroll Tower, Interest Keep — walk inside. Light both pad
              types so you never confuse a Soft Beat peek with a Take.
            </p>
            <div className="mt-4 w-full">
              <EnterStructuresShowcase lit={enterLit} onLit={lightEnter} />
            </div>
            <p className="mt-3 text-sm font-bold text-amber-100" data-testid="ashore-teach-gate">
              {enterLit.length}/2 pad types · {enterDone ? "Clear" : "Tap Arcade and Soft Beat"}
            </p>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!enterDone}
              {...pointerSafeActivate(advance)}
            >
              {enterDone ? "Your share card" : "Light both pad types"}
            </button>
          </>
        ) : null}

        {stepId === "share" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black">
              Share what Harbor felt
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              After the Plinth spectacle you can freeze a “Harbor felt that” card — portable Memory.
              Tap to practice the freeze.
            </p>
            <div className="mt-4 w-full">
              <ShareCardShowcase
                frozen={shareFrozen}
                plaque={plaquePreview}
                onFreeze={() => setShareFrozen(true)}
              />
            </div>
            <button
              type="button"
              className={CTA}
              data-testid="ashore-teach-continue"
              disabled={!shareFrozen}
              {...pointerSafeActivate(advance)}
            >
              {shareFrozen ? "Board for real" : "Freeze the share card"}
            </button>
          </>
        ) : null}

        {stepId === "ready" ? (
          <>
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl">
              Board the Money Carpet
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              You’ll land on Harbor Haven. Talk to Piggy, walk south to the Carpet Dock, and board
              the lit <span className="font-bold text-amber-100">Coincraft Cove</span> painting —
              your first real game. Route stays Harbor → Cove → Harbor → Paycheck → Harbor → Credit.
            </p>
            <div className="mt-4 w-full">
              <ReadyCarpetShowcase />
            </div>
            <ul
              className="mt-3 flex w-full max-w-lg flex-wrap justify-center gap-2"
              data-testid="ashore-teach-route"
              aria-label="Main painting route"
            >
              {SPINE_PAINTINGS.filter((p) => p.organ !== "memory").map((p) => (
                <li
                  key={p.organ}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-amber-100 ring-1 ring-white/20"
                >
                  {p.place}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={CTA}
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
        <div className="mx-auto mt-2 flex max-w-xl justify-center gap-1">
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 flex-1 max-w-6 rounded-full ${
                i <= index ? "bg-amber-300" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}

/** Exported for unit contracts — spine painting places. */
export const ASHORE_SPINE_PAINTING_PLACES = SPINE_PAINTINGS.map((p) => p.place);
export const ASHORE_TEACH_STEP_COUNT = STEPS.length;
