/**
 * Core loop prototype — Commit → hush → Harbor felt that → next choice.
 * Isolated fun test: no map, XP, Freedom, Ashore, or quests.
 * Open with ?coreLoop=1
 *
 * Canon: GAME_DESIGN_LOOP.md
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import { MONEY_ORGANS, type MoneyOrganId } from "../moneyOrgans";
import {
  coldOrganKidSentence,
  coldSpectacleHeadline,
  organTakeHushLine,
  organVerbChip,
} from "../worldMemory";
import { drawMemoryPlinthSilhouette } from "../harborIcon";
import { cinemaTimeScale } from "../a11yMotion";
import { triggerJuice } from "@/juice";
import { pointerSafeActivate } from "../pointerSafeClick";
import { GameButton } from "@/game-ui";

type SpineOrgan = Extract<MoneyOrganId, "coin" | "clock" | "spiral">;

type Fork = {
  organ: SpineOrgan;
  place: string;
  a: string;
  b: string;
};

const FORKS: Fork[] = [
  {
    organ: "coin",
    place: "Coincraft Cove",
    a: "Jar before treat",
    b: "Treat before jar",
  },
  {
    organ: "clock",
    place: "Paycheck Peninsula",
    a: "Umbrella before glitter",
    b: "Glitter ate the umbrella",
  },
  {
    organ: "spiral",
    place: "Credit Kingdom",
    a: "Waited the spiral",
    b: "Haste fed the spiral",
  },
];

type Phase = "choose" | "hush" | "mark" | "felt" | "between";

type Props = {
  onExit: () => void;
};

function PlinthShelf({
  plaques,
  lit,
}: {
  plaques: { label: string; organ: SpineOrgan }[];
  lit: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 280;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawMemoryPlinthSilhouette(ctx, w / 2, h / 2 + 12, 1.35, lit);
  }, [lit, plaques.length]);

  return (
    <div className="relative flex flex-col items-center" data-testid="core-loop-plinth">
      <canvas
        ref={ref}
        className={`h-48 w-48 sm:h-56 sm:w-56 ${lit ? "drop-shadow-[0_0_28px_#f59e0b]" : ""}`}
        width={280}
        height={280}
        aria-hidden
      />
      <ul className="mt-2 flex max-w-sm flex-col gap-1" data-testid="core-loop-shelf">
        {plaques.length === 0 ? (
          <li className="text-center text-[11px] text-white/45">Plinth empty — Harbor is listening</li>
        ) : (
          plaques.map((p, i) => (
            <li
              key={`${p.label}-${i}`}
              className="rounded-lg bg-[#1c1917]/75 px-3 py-1.5 text-center text-xs font-bold ring-1 ring-amber-200/30"
              style={{ color: MONEY_ORGANS[p.organ].accentHint }}
            >
              {organVerbChip(p.organ)} · {p.label}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function CoreLoopPrototype({ onExit }: Props) {
  const [forkIndex, setForkIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("choose");
  const [chosen, setChosen] = useState<string | null>(null);
  const [plaques, setPlaques] = useState<{ label: string; organ: SpineOrgan }[]>([]);
  const [cycles, setCycles] = useState(0);
  const [softBreath, setSoftBreath] = useState(false);
  const [feltHeadline, setFeltHeadline] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const fork = FORKS[forkIndex % FORKS.length]!;
  const accent = MONEY_ORGANS[fork.organ].accentHint;
  const scale = cinemaTimeScale();

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "harbor" });
    return () => clearTimers();
  }, [clearTimers]);

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

  const commit = (label: string) => {
    if (phase !== "choose") return;
    clearTimers();
    setSoftBreath(false);
    setFeltHeadline(null);
    setChosen(label);
    setPhase("hush");
    playCapitalSfx("scar_chime");
    playOrganSfx(fork.organ);
    triggerJuice("accept");

    const hushMs = Math.round(480 * scale);
    const markMs = Math.round(1100 * scale);
    const feltMs = Math.round(2800 * scale);

    timers.current.push(
      window.setTimeout(() => {
        setPhase("mark");
        playCapitalSfx("take_mark");
        triggerJuice("reward", { burst: true });
      }, hushMs),
    );

    timers.current.push(
      window.setTimeout(() => {
        const headline = coldSpectacleHeadline({
          id: `${fork.organ}_proto`,
          islandId:
            fork.organ === "coin"
              ? "coincraft_cove"
              : fork.organ === "clock"
                ? "paycheck_peninsula"
                : "credit_kingdom",
          label,
        });
        setFeltHeadline(headline);
        setPhase("felt");
        setPlaques((prev) => [...prev, { label, organ: fork.organ }]);
        playCapitalSfx("harbor_felt");
        playOrganSfx("memory");
        playCapitalSfx("plinth_hum");
        triggerJuice("complete", { burst: true });
      }, markMs),
    );

    timers.current.push(
      window.setTimeout(() => {
        setPhase("between");
        setCycles((c) => c + 1);
      }, feltMs),
    );
  };

  const nextChoice = () => {
    clearTimers();
    setChosen(null);
    setFeltHeadline(null);
    setSoftBreath(false);
    setForkIndex((i) => i + 1);
    setPhase("choose");
    playOrganSfx(FORKS[(forkIndex + 1) % FORKS.length]!.organ);
  };

  const softLook = () => {
    playCapitalSfx("soft_beat");
    playOrganSfx(fork.organ);
    triggerJuice("accept");
    setSoftBreath(true);
    timers.current.push(
      window.setTimeout(() => setSoftBreath(false), Math.round(1400 * scale)),
    );
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col text-white"
      data-testid="core-loop-prototype"
      data-loop-phase={phase}
      data-loop-organ={fork.organ}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, #1e3a5f 0%, #0f172a 55%, #020617 100%)",
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
            Capital · Core loop
          </p>
          <p className="text-[10px] text-white/50">
            Commit → hush → Harbor felt that · no map · no XP
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="core-loop-exit"
          {...pointerSafeActivate(onExit)}
        >
          Leave · Esc
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-6 pt-2">
        <PlinthShelf plaques={plaques} lit={phase === "felt" || phase === "between"} />

        <div className="mt-4 min-h-[5.5rem] w-full max-w-lg text-center">
          {phase === "choose" ? (
            <>
              <p
                className="text-[11px] font-black uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {organVerbChip(fork.organ)} · {fork.place}
              </p>
              <h1 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
                Choose — it sticks
              </h1>
              <p className="mt-2 text-sm text-white/75">{coldOrganKidSentence(fork.organ)}</p>
            </>
          ) : null}

          {phase === "hush" ? (
            <p
              className="text-sm tracking-[0.35em] text-white/55"
              data-testid="core-loop-hush"
            >
              …
            </p>
          ) : null}

          {phase === "mark" ? (
            <div data-testid="core-loop-mark">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80">
                Mark
              </p>
              <p className="mt-2 text-lg font-black text-amber-100">“{chosen}”</p>
              <p className="mt-1 text-sm text-white/70">{organTakeHushLine(fork.organ)}</p>
            </div>
          ) : null}

          {phase === "felt" || phase === "between" ? (
            <div data-testid="core-loop-felt">
              <p className="text-xl font-black text-amber-100 sm:text-2xl">{feltHeadline}</p>
              <p className="mt-2 text-sm text-white/80">
                Harbor remembered: “{chosen}.”
              </p>
              {softBreath ? (
                <p
                  className="mt-3 text-xs font-semibold tracking-wide text-sky-200/90"
                  data-testid="core-loop-soft-breath"
                >
                  Soft Beat — the {organVerbChip(fork.organ)} still hums.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {phase === "choose" ? (
          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            {[fork.a, fork.b].map((label, i) => (
              <GameButton
                key={label}
                variant={i === 0 ? "primary" : "secondary"}
                className="min-h-14 flex-1 text-base font-black"
                data-testid={`core-loop-fork-${i === 0 ? "a" : "b"}`}
                {...pointerSafeActivate(() => commit(label))}
              >
                {label}
              </GameButton>
            ))}
          </div>
        ) : null}

        {phase === "between" ? (
          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <GameButton
              variant="secondary"
              className="min-h-12 flex-1"
              data-testid="core-loop-look"
              {...pointerSafeActivate(softLook)}
            >
              Look — Soft Beat breath
            </GameButton>
            <GameButton
              variant="primary"
              className="min-h-12 flex-1"
              data-testid="core-loop-next"
              {...pointerSafeActivate(nextChoice)}
            >
              Next living choice
            </GameButton>
          </div>
        ) : null}

        <p className="mt-8 text-center text-[11px] text-white/40">
          Cycles {cycles} · Pass bar: want another choice without rewards chrome
        </p>
      </main>
    </div>
  );
}

/** True when URL asks for the isolated core-loop prototype. */
export function shouldOpenCoreLoopPrototype(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("coreLoop") === "1";
  } catch {
    return false;
  }
}
