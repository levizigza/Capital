import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MinigameProps } from "../types";
import { InsightCard, useQuizJuice } from "../quiz";
import "./minigame-charts.css";
import "../quiz/livingQuiz.css";

type ETF = {
  ticker: string;
  name: string;
  expenseRatio: number;
  sectors: { name: string; pct: number }[];
  holdings: number;
  fiveYearReturn: number;
  risk: "Low" | "Medium" | "High";
  description: string;
};

type Clue = { id: string; text: string; match: string };

type Goal = {
  id: number;
  title: string;
  description: string;
  timeHorizon: string;
  riskTolerance: string;
  correctETF: string;
  clues: Clue[];
  explanation: string;
  insight: { headline: string; story: string; systemLesson: string };
};

const ETFS: ETF[] = [
  {
    ticker: "VTI",
    name: "Total Stock Market ETF",
    expenseRatio: 0.03,
    sectors: [
      { name: "Tech", pct: 30 },
      { name: "Healthcare", pct: 14 },
      { name: "Finance", pct: 13 },
      { name: "Consumer", pct: 12 },
      { name: "Other", pct: 31 },
    ],
    holdings: 3900,
    fiveYearReturn: 10.2,
    risk: "Medium",
    description: "Tracks the entire US stock market. Extremely diversified with very low fees.",
  },
  {
    ticker: "QQQ",
    name: "Nasdaq-100 ETF",
    expenseRatio: 0.20,
    sectors: [
      { name: "Tech", pct: 58 },
      { name: "Consumer", pct: 18 },
      { name: "Healthcare", pct: 7 },
      { name: "Telecom", pct: 5 },
      { name: "Other", pct: 12 },
    ],
    holdings: 100,
    fiveYearReturn: 16.8,
    risk: "High",
    description: "Tracks the 100 largest non-financial Nasdaq companies. High-growth, tech-heavy.",
  },
  {
    ticker: "BND",
    name: "Total Bond Market ETF",
    expenseRatio: 0.03,
    sectors: [
      { name: "Government", pct: 46 },
      { name: "Corporate", pct: 27 },
      { name: "Mortgage", pct: 22 },
      { name: "Other", pct: 5 },
    ],
    holdings: 10000,
    fiveYearReturn: 1.4,
    risk: "Low",
    description: "Tracks the US investment-grade bond market. Low volatility, steady income.",
  },
];

const GOALS: Goal[] = [
  {
    id: 1,
    title: "🎓 College Fund (5 years)",
    description: "Tuition is due in 5 years — you can't afford a crash right before the bill.",
    timeHorizon: "5 years",
    riskTolerance: "Low",
    correctETF: "BND",
    clues: [
      { id: "c1", text: "Hard deadline soon", match: "BND" },
      { id: "c2", text: "Sleep-at-night priority", match: "BND" },
      { id: "c3", text: "Low volatility needed", match: "BND" },
    ],
    explanation: "Short horizon + hard deadline = prioritize capital preservation (BND).",
    insight: {
      headline: "Time horizon is risk capacity",
      story: "Five years isn't long enough to fully recover from a stock crash.",
      systemLesson: "Sequence-of-returns risk: losses near a deadline hurt more than early losses.",
    },
  },
  {
    id: 2,
    title: "🏖️ Retirement (30 years)",
    description: "You're 25. Maximum growth, decades to recover from dips.",
    timeHorizon: "30 years",
    riskTolerance: "High",
    correctETF: "VTI",
    clues: [
      { id: "c4", text: "30-year runway", match: "VTI" },
      { id: "c5", text: "Lowest fees matter", match: "VTI" },
      { id: "c6", text: "Own the whole economy", match: "VTI" },
    ],
    explanation: "Long horizon favors broad equity (VTI) at rock-bottom cost.",
    insight: {
      headline: "Compounding loves time and low fees",
      story: "0.03% vs 0.20% compounds into real money over decades.",
      systemLesson: "Expense ratios are a silent tax. Broad index funds capture market growth minus tiny friction.",
    },
  },
  {
    id: 3,
    title: "🚀 Aggressive Growth (10 years)",
    description: "Stable job, no big expenses — maximize growth, stomach volatility.",
    timeHorizon: "10 years",
    riskTolerance: "High",
    correctETF: "QQQ",
    clues: [
      { id: "c7", text: "Tech-heavy growth", match: "QQQ" },
      { id: "c8", text: "Can handle swings", match: "QQQ" },
      { id: "c9", text: "Concentrated bet OK", match: "QQQ" },
    ],
    explanation: "Aggressive 10-year growth can justify QQQ's concentration — if you can hold through drawdowns.",
    insight: {
      headline: "Concentration amplifies outcomes",
      story: "QQQ wins big in tech booms and hurts in rotations.",
      systemLesson: "Sector ETFs are levered bets on one slice of the economy — higher expected volatility, not free lunch.",
    },
  },
];

type Phase = "briefing" | "investigate" | "accuse" | "verdict";

export default function ETFDetectiveGame({ onComplete, onClose, difficulty }: MinigameProps) {
  const sfx = useQuizJuice();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("briefing");
  const [activeClue, setActiveClue] = useState<string | null>(null);
  const [matchedClues, setMatchedClues] = useState<Record<string, string>>({});
  const [accused, setAccused] = useState<string | null>(null);
  const [results, setResults] = useState<{ goalId: number; correct: boolean }[]>([]);

  const currentGoal = GOALS[round];
  const correctCount = results.filter((r) => r.correct).length;
  const winThreshold = difficulty === "easy" ? 1 : difficulty === "hard" ? 3 : 2;
  const finished = round >= GOALS.length && phase === "verdict" && results.length >= GOALS.length;

  const matchClueToEtf = (ticker: string) => {
    if (!activeClue || !currentGoal) return;
    const clue = currentGoal.clues.find((c) => c.id === activeClue);
    if (!clue) return;
    setMatchedClues((m) => ({ ...m, [activeClue]: ticker }));
    if (clue.match === ticker) sfx.correct();
    else sfx.wrong();
    setActiveClue(null);
  };

  const submitAccusation = (ticker: string) => {
    if (!currentGoal) return;
    const correct = ticker === currentGoal.correctETF;
    setAccused(ticker);
    setResults((r) => [...r, { goalId: currentGoal.id, correct }]);
    if (correct) sfx.complete();
    else sfx.wrong();
    setPhase("verdict");
  };

  const nextCase = () => {
    setRound((r) => r + 1);
    setPhase("briefing");
    setMatchedClues({});
    setAccused(null);
    setActiveClue(null);
  };

  const allCluesMatched = currentGoal?.clues.every((c) => matchedClues[c.id]) ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-black">🔍 ETF Detective Bureau</div>
          <div className="text-sm text-muted-foreground">
            Case {Math.min(round + 1, GOALS.length)}/{GOALS.length}
          </div>
        </div>
        <Badge variant="secondary">{correctCount} solved</Badge>
      </div>

      <AnimatePresence mode="wait">
        {phase === "briefing" && currentGoal ? (
          <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-purple-950/30 border border-purple-400/40 rounded-xl p-4 space-y-3">
            <div className="font-black text-lg">{currentGoal.title}</div>
            <p className="text-sm">{currentGoal.description}</p>
            <div className="flex gap-2">
              <Badge variant="outline">⏱️ {currentGoal.timeHorizon}</Badge>
              <Badge variant="outline">⚠️ {currentGoal.riskTolerance}</Badge>
            </div>
            <Button onClick={() => setPhase("investigate")} className="w-full">Open case file →</Button>
          </motion.div>
        ) : null}

        {phase === "investigate" && currentGoal ? (
          <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="text-sm font-bold text-purple-900">📎 Clue board — tap a clue, then tap the ETF it points to</div>
            <div className="flex flex-wrap gap-2">
              {currentGoal.clues.map((clue) => {
                const matched = matchedClues[clue.id];
                const ok = matched === clue.match;
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => !matched && setActiveClue(clue.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition ${
                      matched
                        ? ok
                          ? "border-green-400 bg-green-100"
                          : "border-red-400 bg-red-100"
                        : activeClue === clue.id
                          ? "border-yellow-400 bg-yellow-100 scale-105"
                          : "border-gray-300 bg-white"
                    }`}
                  >
                    {clue.text} {matched ? `→ ${matched}` : ""}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ETFS.map((etf) => (
                <button
                  key={etf.ticker}
                  type="button"
                  onClick={() => (activeClue ? matchClueToEtf(etf.ticker) : null)}
                  className={`text-left p-3 rounded-xl border-2 transition ${
                    activeClue ? "hover:border-blue-400 cursor-crosshair" : "border-gray-200"
                  } ${accused === etf.ticker ? "border-blue-500 bg-blue-50" : "bg-white"}`}
                >
                  <div className="font-bold">{etf.ticker}</div>
                  <div className="text-xs text-muted-foreground">{etf.name}</div>
                  <div className="text-xs mt-1">{etf.risk} · {etf.expenseRatio}% fee</div>
                </button>
              ))}
            </div>

            <Button disabled={!allCluesMatched} onClick={() => setPhase("accuse")} className="w-full">
              {allCluesMatched ? "Make your accusation →" : "Match all clues first"}
            </Button>
          </motion.div>
        ) : null}

        {phase === "accuse" && currentGoal ? (
          <motion.div key="acc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="font-bold text-center">Who dunnit? Pick the ETF for this investor.</div>
            <div className="grid grid-cols-3 gap-2">
              {ETFS.map((etf) => (
                <Button key={etf.ticker} variant="outline" onClick={() => submitAccusation(etf.ticker)}>
                  {etf.ticker}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : null}

        {phase === "verdict" && currentGoal && accused ? (
          <motion.div key="ver" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <InsightCard
              insight={{
                ...currentGoal.insight,
                headline: accused === currentGoal.correctETF
                  ? `✅ ${currentGoal.correctETF} fits the case`
                  : `Best fit: ${currentGoal.correctETF}`,
                story: currentGoal.explanation,
              }}
              success={accused === currentGoal.correctETF}
              onContinue={() => {
                if (round + 1 >= GOALS.length) {
                  onComplete(correctCount + (accused === currentGoal.correctETF ? 1 : 0) >= winThreshold, correctCount);
                } else {
                  nextCase();
                }
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {finished ? (
        <div className="flex gap-2">
          <Button onClick={() => onComplete(correctCount >= winThreshold, correctCount)} className="flex-1">
            {correctCount >= winThreshold ? "✅ Claim Badge" : "Close"}
          </Button>
          <Button onClick={onClose} variant="outline">Exit</Button>
        </div>
      ) : null}
    </div>
  );
}
