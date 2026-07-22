import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import { InsightCard, useQuizJuice } from "../quiz";
import "../quiz/livingQuiz.css";

/**
 * Compound Snowball — learn compounding by DOING it. Each year you decide to
 * reinvest your gains (the snowball rolls bigger) or cash them out (flat).
 * Over the years the reinvested path visibly balloons past the cash-out path,
 * so the lesson is felt, not told.
 */

type Config = {
  principal: number;
  ratePct: number;
  years: number;
  label: string;
};

const DEFAULTS: Config = { principal: 100, ratePct: 12, years: 10, label: "your coins" };

type YearPoint = { year: number; compounded: number; cashedOut: number };

export default function CompoundSnowballGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const cfg = useMemo<Config>(() => {
    const raw = (def?.modules?.[0]?.config ?? {}) as Partial<Config>;
    return { ...DEFAULTS, ...raw };
  }, [def]);

  const sfx = useQuizJuice();
  const rate = cfg.ratePct / 100;

  const [year, setYear] = useState(0);
  // balance = the money still working for you (compounding)
  const [balance, setBalance] = useState(cfg.principal);
  // pocket = gains you cashed out (no longer compounding)
  const [pocket, setPocket] = useState(0);
  const [history, setHistory] = useState<YearPoint[]>([
    { year: 0, compounded: cfg.principal, cashedOut: cfg.principal },
  ]);
  // the "if you cashed out every year" shadow path, for comparison
  const cashOutShadow = useRef(cfg.principal);
  const [phase, setPhase] = useState<"play" | "insight">("play");
  const [floatKey, setFloatKey] = useState(0);
  const [lastGain, setLastGain] = useState<{ amount: number; reinvested: boolean } | null>(null);

  const pendingInterest = Math.round(balance * rate);

  const advance = useCallback(
    (reinvest: boolean) => {
      const interest = Math.round(balance * rate);
      // shadow: simple interest on original principal only
      cashOutShadow.current += Math.round(cfg.principal * rate);

      if (reinvest) {
        setBalance((b) => b + interest);
        sfx.correct();
      } else {
        setPocket((p) => p + interest);
        sfx.wrong();
      }
      setLastGain({ amount: interest, reinvested: reinvest });
      setFloatKey((k) => k + 1);

      const nextYear = year + 1;
      setYear(nextYear);
      setHistory((h) => [
        ...h,
        {
          year: nextYear,
          compounded: (reinvest ? balance + interest : balance) + (reinvest ? pocket : pocket + interest),
          cashedOut: cashOutShadow.current,
        },
      ]);

      if (nextYear >= cfg.years) {
        sfx.complete();
        window.setTimeout(() => setPhase("insight"), 650);
      }
    },
    [balance, rate, cfg.principal, cfg.years, year, pocket, sfx],
  );

  const netWorth = balance + pocket;
  // Score: how close to the all-reinvest maximum you got.
  const maxWorth = useMemo(
    () => Math.round(cfg.principal * Math.pow(1 + rate, cfg.years)),
    [cfg.principal, cfg.years, rate],
  );
  const minWorth = useMemo(
    () => Math.round(cfg.principal + cfg.principal * rate * cfg.years),
    [cfg.principal, rate, cfg.years],
  );
  const score = useMemo(() => {
    if (maxWorth <= minWorth) return 100;
    return clampScore(((netWorth - minWorth) / (maxWorth - minWorth)) * 100);
  }, [netWorth, maxWorth, minWorth]);
  const success = score >= 60;

  // snowball grows with balance (relative to max)
  const snowScale = 0.5 + Math.min(1.6, (balance / maxWorth) * 1.6);

  if (phase === "insight") {
    return (
      <GameVisualShell shell="retro" title="Compound Snowball" icon="⛄" onClose={onClose}>
        <div className="mb-3 rounded-xl bg-black/20 p-3 text-center text-slate-100">
          <div className="text-xs uppercase tracking-widest opacity-70">After {cfg.years} years</div>
          <div className="mt-1 flex items-center justify-center gap-4">
            <div>
              <div className="text-2xl font-black text-emerald-300">${netWorth.toLocaleString()}</div>
              <div className="text-[11px] opacity-70">you reinvesting</div>
            </div>
            <div className="text-lg opacity-50">vs</div>
            <div>
              <div className="text-2xl font-black text-slate-300">${cashOutShadow.current.toLocaleString()}</div>
              <div className="text-[11px] opacity-70">cashing out yearly</div>
            </div>
          </div>
        </div>
        <InsightCard
          insight={{
            headline: "Compounding pays interest on your interest",
            story: `Every year you reinvested, your gains started earning gains too. That's why the snowball rolls faster the longer it goes.`,
            systemLesson:
              "Compound growth is exponential: balance × (1 + rate) every period. Time is the biggest lever — starting early beats adding more later. Cashing out gains resets you to slow, straight-line growth.",
            realWorld:
              "This is why retirement accounts and index funds are left to grow for decades — the last few years add the most.",
          }}
          success={success}
          onContinue={() => onComplete(success, score)}
        />
      </GameVisualShell>
    );
  }

  return (
    <GameVisualShell
      shell="retro"
      title={def?.name ?? "Compound Snowball"}
      icon={def?.icon ?? "⛄"}
      genre="simulation"
      complexity="easy"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-4 text-slate-100">
        <p className="text-sm font-medium">
          Roll your snowball down the hill. Each year, <b>reinvest</b> your gains to make them compound —
          or <b>cash them out</b> and watch growth flatten. You have {cfg.years} years.
        </p>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Year" value={`${year}/${cfg.years}`} />
          <Stat label="Working (compounding)" value={`$${balance.toLocaleString()}`} accent="emerald" />
          <Stat label="Pocketed (flat)" value={`$${pocket.toLocaleString()}`} accent="slate" />
        </div>

        {/* Snowball hill + growth chart */}
        <div className="relative h-40 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b from-[#20344a] to-[#0e1c2c]">
          <GrowthChart history={history} max={Math.max(maxWorth, netWorth)} />
          <motion.div
            className="absolute bottom-2 left-3 text-5xl"
            animate={{ scale: snowScale, rotate: [0, -6, 0] }}
            transition={{ duration: 0.5 }}
            aria-hidden
          >
            ⛄
          </motion.div>

          {/* floating gain feedback */}
          <AnimatePresence>
            {lastGain ? (
              <motion.div
                key={floatKey}
                className={`absolute right-4 top-3 rounded-full px-3 py-1 text-sm font-black ${
                  lastGain.reinvested ? "bg-emerald-400 text-emerald-950" : "bg-slate-300 text-slate-800"
                }`}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16 }}
              >
                {lastGain.reinvested ? "＋ reinvested " : "→ pocketed "}${lastGain.amount}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Decision buttons */}
        {year < cfg.years ? (
          <div className="space-y-2">
            <div className="text-center text-sm">
              This year&apos;s gain on {cfg.label}:{" "}
              <span className="font-black text-emerald-300">+${pendingInterest}</span>{" "}
              <span className="opacity-60">({cfg.ratePct}% of ${balance.toLocaleString()})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <GameButton variant="primary" className="w-full" onClick={() => advance(true)}>
                ♻️ Reinvest gains
              </GameButton>
              <GameButton variant="secondary" className="w-full" onClick={() => advance(false)}>
                💸 Cash out gains
              </GameButton>
            </div>
          </div>
        ) : (
          <GameButton variant="primary" className="w-full" onClick={() => setPhase("insight")}>
            See how you did →
          </GameButton>
        )}
      </div>
    </GameVisualShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "slate" }) {
  const color = accent === "emerald" ? "text-emerald-300" : accent === "slate" ? "text-slate-300" : "text-white";
  return (
    <div className="rounded-lg bg-black/25 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide opacity-60">{label}</div>
      <div className={`text-sm font-black ${color}`}>{value}</div>
    </div>
  );
}

function GrowthChart({ history, max }: { history: YearPoint[]; max: number }) {
  const w = 100;
  const h = 100;
  const n = Math.max(1, history[history.length - 1]?.year || 1);
  const toPts = (key: "compounded" | "cashedOut") =>
    history
      .map((p) => `${(p.year / n) * w},${h - (p[key] / Math.max(1, max)) * h * 0.9}`)
      .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <polyline points={toPts("cashedOut")} fill="none" stroke="rgba(203,213,225,0.7)" strokeWidth="1.5" strokeDasharray="3 2" />
      <polyline points={toPts("compounded")} fill="none" stroke="#34d399" strokeWidth="2.5" />
    </svg>
  );
}
