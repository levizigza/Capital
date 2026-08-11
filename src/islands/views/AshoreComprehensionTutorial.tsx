/**
 * Pre-carpet Ashore teach — Portal-style comprehension gates.
 * Title → Cast → **this** → Money Carpet → Harbor (free walk, opt-in Talk).
 */

import { useCallback, useEffect, useState } from "react";
import { capitalMusic } from "../audio/capitalMusic";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";

export type TeachStepId =
  | "welcome"
  | "walk_right"
  | "walk_left"
  | "walk_forward"
  | "interact"
  | "harbor_jobs"
  | "spine_map"
  | "ready";

const STEPS: TeachStepId[] = [
  "welcome",
  "walk_right",
  "walk_left",
  "walk_forward",
  "interact",
  "harbor_jobs",
  "spine_map",
  "ready",
];

type StepCopy = {
  eyebrow: string;
  title: string;
  line: string;
  /** Comprehension gate — null = Continue button */
  gate: "ArrowRight" | "ArrowLeft" | "ArrowUp" | "KeyE" | null;
  gateHint?: string;
};

const COPY: Record<TeachStepId, StepCopy> = {
  welcome: {
    eyebrow: "Capital · Ashore",
    title: "Money is alive here",
    line: "Before the Money Carpet, prove you know the moves — then Harbor Haven is yours to walk.",
    gate: null,
  },
  walk_right: {
    eyebrow: "Controls",
    title: "Walk right",
    line: "Harbor is a place you walk — not a stack of pop-up cards.",
    gate: "ArrowRight",
    gateHint: "Press → or D",
  },
  walk_left: {
    eyebrow: "Controls",
    title: "Walk left",
    line: "Same legs, other way. You’ll use this around the fountain.",
    gate: "ArrowLeft",
    gateHint: "Press ← or A",
  },
  walk_forward: {
    eyebrow: "Controls",
    title: "Walk forward",
    line: "Toward Piggy, the Ledger Bank, and the Money Carpet gate.",
    gate: "ArrowUp",
    gateHint: "Press ↑ or W",
  },
  interact: {
    eyebrow: "Controls",
    title: "Talk when you choose",
    line: "Walk up to someone first. Then press E — they ask, you answer. Nothing ambushes you.",
    gate: "KeyE",
    gateHint: "Press E",
  },
  harbor_jobs: {
    eyebrow: "Harbor Haven",
    title: "Your first plaza",
    line: "Walk free. Piggy waves by the fountain — talk when you’re ready. Outfitter and stalls wait as discovery. When you’re set, board the Money Carpet.",
    gate: null,
  },
  spine_map: {
    eyebrow: "Fortune Archipelago",
    title: "Four living organs",
    line: "Harbor remembers (Memory). Cove holds & Takes (Coin). Paycheck earns on the clock (Clock). Credit weighs interest (Spiral). Same soundtrack beds — new choices each shore.",
    gate: null,
  },
  ready: {
    eyebrow: "Ready",
    title: "Board the Money Carpet",
    line: "You’ll land on Harbor Haven. Walk around. Talk to Piggy when you want. Then ride to Coincraft Cove for your first Take.",
    gate: null,
  },
};

function matchesGate(e: KeyboardEvent, gate: NonNullable<StepCopy["gate"]>): boolean {
  if (gate === "ArrowRight") {
    return e.code === "ArrowRight" || e.key === "d" || e.key === "D" || e.code === "KeyD";
  }
  if (gate === "ArrowLeft") {
    return e.code === "ArrowLeft" || e.key === "a" || e.key === "A" || e.code === "KeyA";
  }
  if (gate === "ArrowUp") {
    return e.code === "ArrowUp" || e.key === "w" || e.key === "W" || e.code === "KeyW";
  }
  return e.code === "KeyE" || e.key === "e" || e.key === "E";
}

type Props = {
  onComplete: () => void;
};

export function AshoreComprehensionTutorial({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const stepId = STEPS[index]!;
  const copy = COPY[stepId];
  const reduced = prefersReducedMotion();

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "opening" });
  }, []);

  const advance = useCallback(() => {
    setFlash(true);
    const ms = Math.round((reduced ? 120 : 280) * cinemaTimeScale());
    window.setTimeout(() => {
      setFlash(false);
      if (index >= STEPS.length - 1) {
        onComplete();
        return;
      }
      setIndex((i) => i + 1);
    }, ms);
  }, [index, onComplete, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onComplete();
        return;
      }
      if (copy.gate) {
        if (matchesGate(e, copy.gate)) {
          e.preventDefault();
          advance();
        }
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, copy.gate, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col text-white"
      data-testid="ashore-comprehension-tutorial"
      data-teach-step={stepId}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, #1e3a5f 0%, #0f172a 55%, #020617 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(251,191,36,0.04) 3px, rgba(251,191,36,0.04) 4px)",
        }}
        aria-hidden
      />

      <header className="relative z-[1] flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
          Capital · Teach
        </p>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="ashore-teach-skip"
          onClick={onComplete}
        >
          Skip
        </button>
      </header>

      <main className="relative z-[1] flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-100/85">
          {copy.eyebrow}
        </p>
        <h1
          className={`mt-3 max-w-xl font-[family-name:var(--cap-display,Georgia,serif)] text-3xl font-black sm:text-4xl ${
            flash ? "scale-[1.02] text-amber-100" : ""
          } transition-transform`}
        >
          {copy.title}
        </h1>
        <p className="mt-4 max-w-lg text-base text-white/85 sm:text-lg">{copy.line}</p>

        {copy.gateHint ? (
          <p
            className="mt-8 animate-pulse rounded-2xl border-2 border-amber-200/50 bg-amber-500/15 px-6 py-4 text-lg font-black tracking-wide text-amber-50"
            data-testid="ashore-teach-gate"
            data-gate={copy.gate ?? undefined}
          >
            {copy.gateHint}
          </p>
        ) : (
          <button
            type="button"
            className="mt-8 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
            data-testid="ashore-teach-continue"
            onClick={advance}
          >
            {stepId === "ready" ? "Board Money Carpet" : "Continue"}
          </button>
        )}

        {stepId === "spine_map" ? (
          <ul
            className="mt-8 grid w-full max-w-lg grid-cols-2 gap-2 text-left text-sm"
            data-testid="ashore-teach-organs"
          >
            {[
              ["Harbor", "Memory · remembers"],
              ["Cove", "Coin · hold & Take"],
              ["Paycheck", "Clock · earn"],
              ["Credit", "Spiral · interest"],
            ].map(([place, organ]) => (
              <li
                key={place}
                className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
              >
                <span className="font-bold text-amber-100">{place}</span>
                <span className="mt-0.5 block text-white/70">{organ}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </main>

      <footer className="relative z-[1] px-4 pb-5 text-center">
        <p className="text-[11px] uppercase tracking-wider text-white/45">
          Step {index + 1} / {STEPS.length}
          {copy.gate ? " · prove it" : " · Enter · Space"}
          {" · Esc skips"}
        </p>
        <div className="mx-auto mt-2 flex max-w-xs justify-center gap-1.5">
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 w-6 rounded-full ${
                i <= index ? "bg-amber-300" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
