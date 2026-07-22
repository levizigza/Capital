import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import {
  Oscilloscope,
  InsightCard,
  ConsequenceTheater,
  StreakMeter,
  useQuizJuice,
  LIVING_SIGNALS,
  CATEGORY_ZONES,
  type LivingSignal,
  type SignalCategory,
} from "../quiz";
import "../quiz/livingQuiz.css";

type Phase = "tune" | "classify" | "reveal" | "insight" | "done";

export default function SignalScannerGame({
  minigameId,
  island,
  difficulty,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const sfx = useQuizJuice();
  const rounds = difficulty === "easy" ? 3 : difficulty === "hard" ? 5 : 4;
  const deck = useMemo(() => LIVING_SIGNALS.slice(0, rounds), [rounds]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("tune");
  const [dial, setDial] = useState(50);
  const [locked, setLocked] = useState(false);
  const [pickedCategory, setPickedCategory] = useState<SignalCategory | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastSuccess, setLastSuccess] = useState(false);

  const signal: LivingSignal | undefined = deck[idx];
  const tuneDistance = signal ? Math.abs(dial - signal.frequency) : 99;
  const canLock = tuneDistance <= 8;

  const lockSignal = useCallback(() => {
    if (!canLock || !signal) return;
    setLocked(true);
    sfx.lock();
    window.setTimeout(() => setPhase("classify"), 500);
  }, [canLock, signal, sfx]);

  const classify = useCallback(
    (cat: SignalCategory) => {
      if (!signal) return;
      const correct = cat === signal.category;
      setPickedCategory(cat);
      setLastSuccess(correct);
      if (correct) {
        const bonus = streak >= 2 ? 15 : 0;
        setScore((s) => s + 25 + bonus);
        setStreak((st) => st + 1);
        sfx.correct();
        if (streak >= 2) sfx.streak();
      } else {
        setStreak(0);
        sfx.wrong();
      }
      setPhase("reveal");
    },
    [signal, streak, sfx],
  );

  const afterReveal = () => setPhase("insight");

  const afterInsight = () => {
    if (idx + 1 >= deck.length) {
      const final = clampScore(score);
      setPhase("done");
      sfx.complete();
      onComplete(final >= 60, final);
    } else {
      setIdx((i) => i + 1);
      setPhase("tune");
      setDial(50);
      setLocked(false);
      setPickedCategory(null);
    }
  };

  if (phase === "done") {
    return (
      <GameVisualShell shell="neon" title="Scan complete" icon="🌃" onClose={onClose}>
        <div className="text-center space-y-4 font-mono">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">
            {score >= 60 ? "🛰️" : "📡"}
          </motion.div>
          <div className="text-2xl font-black text-cyan-300">Score {score}</div>
          <p className="text-sm text-cyan-200/80">
            You decoded {Math.round(score / 25)} signals in Signal City&apos;s noise.
          </p>
          <GameButton variant="primary" className="w-full" onClick={onClose}>
            Exit interceptor
          </GameButton>
        </div>
      </GameVisualShell>
    );
  }

  if (!signal) return null;

  return (
    <GameVisualShell
      shell="neon"
      title={def?.name ?? "Signal Interceptor"}
      icon={def?.icon ?? "📡"}
      genre="quiz"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-4 font-mono text-cyan-100">
        <div className="flex justify-between text-xs text-cyan-400">
          <span>SIGNAL {idx + 1}/{deck.length}</span>
          <span>SCORE {score}</span>
        </div>
        <StreakMeter streak={streak} />

        <AnimatePresence mode="wait">
          {phase === "tune" ? (
            <motion.div key="tune" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="text-center">
                <span className="text-4xl">{signal.emoji}</span>
                <div className="font-bold mt-1">{signal.label}</div>
                <div className="text-xs text-cyan-400/70">Tune the dial until the wave locks</div>
              </div>
              <Oscilloscope dial={dial} target={signal.frequency} locked={locked} label={signal.label} />
              <input
                type="range"
                min={0}
                max={100}
                value={dial}
                onChange={(e) => setDial(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <GameButton variant="primary" className="w-full" disabled={!canLock} onClick={lockSignal}>
                {canLock ? "◆ Lock frequency" : "△ Keep tuning..."}
              </GameButton>
            </motion.div>
          ) : null}

          {phase === "classify" ? (
            <motion.div key="classify" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="text-center text-sm text-emerald-400 font-bold">◆ LOCKED — Now classify the signal</div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CATEGORY_ZONES) as SignalCategory[]).map((cat) => {
                  const z = CATEGORY_ZONES[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => classify(cat)}
                      className={`lq-classify-zone rounded-xl border-2 p-3 text-center ${z.color} hover:scale-105 transition-transform`}
                    >
                      <div className="text-2xl">{z.emoji}</div>
                      <div className="text-xs font-black mt-1">{z.label}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}

          {phase === "reveal" ? (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ConsequenceTheater
                title={
                  lastSuccess
                    ? `Correct — it's a ${CATEGORY_ZONES[signal.category].label} signal`
                    : `It's ${CATEGORY_ZONES[signal.category].label}, not ${pickedCategory ? CATEGORY_ZONES[pickedCategory].label : "?"}`
                }
                beats={lastSuccess ? signal.consequenceGood : signal.consequenceBad}
                success={lastSuccess}
              />
              <GameButton variant="primary" className="w-full mt-3" onClick={afterReveal}>
                Decode deeper →
              </GameButton>
            </motion.div>
          ) : null}

          {phase === "insight" ? (
            <motion.div key="insight" initial={{ opacity: 0 }}>
              <InsightCard insight={signal.insight} success={lastSuccess} onContinue={afterInsight} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </GameVisualShell>
  );
}
