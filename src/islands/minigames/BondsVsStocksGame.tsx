import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MinigameProps } from "../types";
import { NewsTicker, InsightCard, ConsequenceTheater, useQuizJuice } from "../quiz";
import type { InsightPayload } from "../quiz";
import "./minigame-charts.css";
import "../quiz/livingQuiz.css";

type Scenario = {
  id: number;
  headline: string;
  description: string;
  ticker: string[];
  bondOutcome: { returnPct: number; explanation: string };
  stockOutcome: { returnPct: number; explanation: string };
  bestChoice: "bond" | "stock";
  teachingPoint: string;
  insight: InsightPayload;
};

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    headline: "Fed Signals Rate Hikes Ahead",
    description: "The Federal Reserve hints at multiple interest rate increases to combat inflation. Markets hold their breath. Where do you move $1,000?",
    ticker: ["Rates rising", "Banks watch margins", "Bond prices wobble", "Inflation fight"],
    bondOutcome: { returnPct: -2, explanation: "Existing bond prices drop when rates rise — you lost 2%." },
    stockOutcome: { returnPct: 3, explanation: "Stocks dipped then banks rallied on higher margins — you gained 3%." },
    bestChoice: "stock",
    teachingPoint: "Rising rates hurt existing bond prices. Rate-sensitive sectors can still win.",
    insight: {
      headline: "Rates reprice everything",
      story: "When the Fed moves, the whole system recalculates risk.",
      systemLesson: "Bond prices and yields move inversely. New bonds pay more; old bonds are worth less until they mature.",
    },
  },
  {
    id: 2,
    headline: "Recession Fears — GDP Shrinks Again",
    description: "Two quarters of contraction. Layoff headlines everywhere. Fear is the loudest signal.",
    ticker: ["Layoffs surge", "Flight to safety", "Earnings warnings", "Consumer pullback"],
    bondOutcome: { returnPct: 5, explanation: "Government bonds rallied as investors fled to safety — +5%." },
    stockOutcome: { returnPct: -12, explanation: "Stocks plunged on earnings fears — -12%." },
    bestChoice: "bond",
    teachingPoint: "Recessions reward safety. Bonds often cushion stock crashes.",
    insight: {
      headline: "Fear has a price",
      story: "In panic, people pay for stability — that's why Treasuries spike.",
      systemLesson: "Government bonds are the system's shock absorber. Credit spreads widen; safe assets get bid up.",
    },
  },
  {
    id: 3,
    headline: "AI Boom — Tech Earnings Explode",
    description: "Euphoria returns. Growth stocks scream higher. FOMO is trending.",
    ticker: ["AI revenues beat", "Mag 7 rally", "IPO window opens", "Risk appetite up"],
    bondOutcome: { returnPct: 1, explanation: "Bonds returned 1% — stable but boring in a boom." },
    stockOutcome: { returnPct: 15, explanation: "Tech soared — you rode the wave at +15%!" },
    bestChoice: "stock",
    teachingPoint: "Bull markets favor stocks. Bonds sleep while stocks sprint.",
    insight: {
      headline: "Risk premiums exist for a reason",
      story: "When growth dominates headlines, equity risk pays — until it doesn't.",
      systemLesson: "Expected return rises with risk. Booms reward stockholders; busts punish them harder.",
    },
  },
  {
    id: 4,
    headline: "Inflation Hits 40-Year High",
    description: "Prices up 9% year-over-year. Cash in your pocket is melting.",
    ticker: ["CPI shock", "Wage pressure", "Energy spikes", "Real returns negative"],
    bondOutcome: { returnPct: -4, explanation: "Fixed-rate bonds crushed by inflation — deeply negative real return." },
    stockOutcome: { returnPct: 2, explanation: "Some sectors hedged inflation; stocks barely kept pace at +2%." },
    bestChoice: "stock",
    teachingPoint: "Inflation eats fixed income. Real assets can partially hedge.",
    insight: {
      headline: "Nominal vs real",
      story: "A 3% bond in 9% inflation is a losing bet in purchasing power.",
      systemLesson: "The system reports nominal returns; your life costs real dollars. Inflation transfers wealth from savers to borrowers.",
    },
  },
];

type Choice = "bond" | "stock";
type RoundResult = { scenario: Scenario; choice: Choice; returnPct: number; correct: boolean };
type Phase = "news" | "pick" | "reveal" | "insight" | "finished";

export default function BondsVsStocksGame({ onComplete, onClose, difficulty }: MinigameProps) {
  const sfx = useQuizJuice();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("news");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [portfolio, setPortfolio] = useState(4000);
  const [history, setHistory] = useState<number[]>([4000]);

  const currentScenario = SCENARIOS[round];
  const finished = round >= SCENARIOS.length && phase === "finished";

  const winThreshold = difficulty === "easy" ? 2 : difficulty === "hard" ? 4 : 3;
  const correctCount = results.filter((r) => r.correct).length;
  const winCondition = correctCount >= winThreshold;

  const makeChoice = (choice: Choice) => {
    if (!currentScenario || phase !== "pick") return;
    const outcome = choice === "bond" ? currentScenario.bondOutcome : currentScenario.stockOutcome;
    const correct = choice === currentScenario.bestChoice;
    const roundReturn = 1000 * (outcome.returnPct / 100);
    const nextPortfolio = portfolio + roundReturn;

    setPortfolio(nextPortfolio);
    setHistory((h) => [...h, nextPortfolio]);
    setResults((prev) => [...prev, { scenario: currentScenario, choice, returnPct: outcome.returnPct, correct }]);
    if (correct) sfx.correct();
    else sfx.wrong();
    setPhase("reveal");
  };

  const afterReveal = () => setPhase("insight");
  const afterInsight = () => {
    if (round + 1 >= SCENARIOS.length) {
      setPhase("finished");
      sfx.complete();
    } else {
      setRound((r) => r + 1);
      setPhase("news");
    }
  };

  const sparkMax = useMemo(() => Math.max(...history), [history]);
  const sparkMin = useMemo(() => Math.min(...history), [history]);

  return (
    <div className="space-y-4">
      <NewsTicker items={SCENARIOS.flatMap((s) => s.ticker).slice(0, 8)} />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-black">📊 Market Pulse</div>
          <div className="text-sm text-muted-foreground">
            Round {Math.min(round + 1, SCENARIOS.length)}/{SCENARIOS.length}
          </div>
        </div>
        <Badge variant="secondary">💰 ${portfolio.toFixed(0)}</Badge>
      </div>

      {/* Portfolio sparkline */}
      <div className="h-16 flex items-end gap-1 px-2 bg-slate-900 rounded-lg">
        {history.map((v, i) => {
          const range = sparkMax - sparkMin || 1;
          const h = 20 + ((v - sparkMin) / range) * 80;
          return (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {phase === "news" && currentScenario ? (
          <motion.div key={`news-${round}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-slate-900 text-amber-100 border border-amber-500/30 rounded-xl p-5 space-y-3">
              <motion.div
                className="text-xl font-black"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.8 }}
              >
                {currentScenario.headline}
              </motion.div>
              <p className="text-sm leading-relaxed opacity-90">{currentScenario.description}</p>
              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold" onClick={() => setPhase("pick")}>
                Read the tape → Trade
              </Button>
            </div>
          </motion.div>
        ) : null}

        {phase === "pick" && currentScenario ? (
          <motion.div key={`pick-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => makeChoice("bond")}
              className="p-5 rounded-xl border-2 border-blue-400/50 bg-blue-950/40 text-left"
            >
              <div className="text-3xl mb-2">🏛️</div>
              <div className="font-black text-blue-100">Bonds</div>
              <div className="text-xs text-blue-300/80">Safety · income</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => makeChoice("stock")}
              className="p-5 rounded-xl border-2 border-emerald-400/50 bg-emerald-950/40 text-left"
            >
              <div className="text-3xl mb-2">📈</div>
              <div className="font-black text-emerald-100">Stocks</div>
              <div className="text-xs text-emerald-300/80">Growth · risk</div>
            </motion.button>
          </motion.div>
        ) : null}

        {phase === "reveal" && results.length > 0 ? (() => {
          const last = results[results.length - 1];
          const outcome = last.choice === "bond" ? last.scenario.bondOutcome : last.scenario.stockOutcome;
          return (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ConsequenceTheater
                title={last.correct ? "Sharp read!" : "Markets humbled that pick"}
                beats={[
                  { label: outcome.explanation, amount: last.returnPct, emoji: last.returnPct >= 0 ? "📈" : "📉" },
                  { label: "Portfolio shift", amount: Math.round(1000 * last.returnPct / 100), emoji: "💰" },
                ]}
                success={last.correct}
              />
              <Button onClick={afterReveal} className="w-full mt-3">Understand why →</Button>
            </motion.div>
          );
        })() : null}

        {phase === "insight" && currentScenario ? (
          <InsightCard
            insight={currentScenario.insight}
            success={results[results.length - 1]?.correct ?? false}
            onContinue={afterInsight}
          />
        ) : null}
      </AnimatePresence>

      {finished ? (
        <div className="space-y-3">
          <div className={`rounded-lg p-4 text-center font-bold ${winCondition ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {winCondition
              ? `🎉 ${correctCount}/${SCENARIOS.length} optimal reads. Portfolio: $${portfolio.toFixed(0)}`
              : `Need ${winThreshold}+ optimal picks. Final: $${portfolio.toFixed(0)}`}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onComplete(winCondition, correctCount)} className="flex-1">
              {winCondition ? "✅ Claim Reward" : "🔄 Try Again"}
            </Button>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
