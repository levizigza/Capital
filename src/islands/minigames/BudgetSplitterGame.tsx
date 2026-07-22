import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import { InsightCard, ConsequenceTheater, useQuizJuice } from "../quiz";
import "../quiz/livingQuiz.css";

type Expense = { id: string; label: string; amount: number; bucket: "needs" | "wants" | "savings"; emoji: string };

const EXPENSES: Expense[] = [
  { id: "e1", label: "Rent", amount: 800, bucket: "needs", emoji: "🏠" },
  { id: "e2", label: "Groceries", amount: 200, bucket: "needs", emoji: "🛒" },
  { id: "e3", label: "Streaming", amount: 15, bucket: "wants", emoji: "📺" },
  { id: "e4", label: "Emergency fund", amount: 100, bucket: "savings", emoji: "🫙" },
  { id: "e5", label: "Bus pass", amount: 60, bucket: "needs", emoji: "🚌" },
  { id: "e6", label: "Concert tickets", amount: 75, bucket: "wants", emoji: "🎵" },
  { id: "e7", label: "401k", amount: 150, bucket: "savings", emoji: "🏦" },
  { id: "e8", label: "Sneakers", amount: 90, bucket: "wants", emoji: "👟" },
];

const BUCKET_META = {
  needs: { label: "Needs", color: "border-blue-400 bg-blue-50", bar: "bg-blue-500" },
  wants: { label: "Wants", color: "border-pink-400 bg-pink-50", bar: "bg-pink-500" },
  savings: { label: "Savings", color: "border-emerald-400 bg-emerald-50", bar: "bg-emerald-500" },
};

type Phase = "sort" | "reveal" | "insight";

export default function BudgetSplitterGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const sfx = useQuizJuice();
  const [pool, setPool] = useState<Expense[]>(() => [...EXPENSES]);
  const [buckets, setBuckets] = useState<Record<string, Expense[]>>({
    needs: [],
    wants: [],
    savings: [],
  });
  const [dragId, setDragId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("sort");
  const [score, setScore] = useState(0);

  const totals = useMemo(() => {
    const t = { needs: 0, wants: 0, savings: 0 };
    for (const b of ["needs", "wants", "savings"] as const) {
      t[b] = buckets[b].reduce((s, e) => s + e.amount, 0);
    }
    return t;
  }, [buckets]);

  const place = (bucket: Expense["bucket"]) => {
    if (!dragId) return;
    const item = pool.find((e) => e.id === dragId);
    if (!item) return;
    setPool((p) => p.filter((e) => e.id !== dragId));
    setBuckets((b) => ({ ...b, [bucket]: [...b[bucket], item] }));
    if (item.bucket === bucket) sfx.correct();
    else sfx.wrong();
    setDragId(null);
  };

  const finish = useCallback(() => {
    let correct = 0;
    for (const bucket of ["needs", "wants", "savings"] as const) {
      for (const e of buckets[bucket]) {
        if (e.bucket === bucket) correct++;
      }
    }
    const s = clampScore(Math.round((correct / EXPENSES.length) * 100));
    setScore(s);
    setPhase("reveal");
  }, [buckets]);

  const allPlaced = pool.length === 0;
  const success = score >= 70;

  if (phase === "insight") {
    return (
      <GameVisualShell shell="notebook" title={def?.name ?? "Budget Splitter"} icon="📊" onClose={onClose}>
        <InsightCard
          insight={{
            headline: "Your budget is a story about priorities",
            story: "Every dollar in a bucket is a vote for your future self.",
            systemLesson:
              "The 50/30/20 framework mirrors how banks and advisors think: fixed obligations first, joy second, future third. Automating the savings bucket beats willpower.",
            realWorld: "Many people use separate accounts so 'savings' never mixes with spending money.",
          }}
          success={success}
          onContinue={() => onComplete(success, score)}
        />
      </GameVisualShell>
    );
  }

  if (phase === "reveal") {
    return (
      <GameVisualShell shell="notebook" title="Results" icon="📊" onClose={onClose}>
        <ConsequenceTheater
          title={success ? "Balanced budget!" : "A few misfires — learn and adjust"}
          beats={[
            { label: "Needs covered", amount: totals.needs, emoji: "🏠" },
            { label: "Fun money", amount: totals.wants, emoji: "🎮" },
            { label: "Future you", amount: totals.savings, emoji: "🫙" },
          ]}
          success={success}
        />
        <GameButton variant="primary" className="w-full mt-3" onClick={() => setPhase("insight")}>
          Why this matters →
        </GameButton>
      </GameVisualShell>
    );
  }

  return (
    <GameVisualShell
      shell="notebook"
      title={def?.name ?? "Budget Splitter"}
      icon={def?.icon ?? "📊"}
      genre="puzzle"
      complexity="easy"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm font-medium">
          You got paid! Tap an expense, then tap the jar it belongs in. Watch the bars fill.
        </p>

        {/* Live budget bars */}
        <div className="space-y-2">
          {(["needs", "wants", "savings"] as const).map((b) => (
            <div key={b}>
              <div className="flex justify-between text-xs font-bold mb-0.5">
                <span>{BUCKET_META[b].label}</span>
                <span>${totals[b]}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${BUCKET_META[b].bar}`}
                  animate={{ width: `${Math.min(100, (totals[b] / 800) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-xl border-2 border-dashed border-amber-600/40 bg-amber-50/50">
          {pool.map((e) => (
            <motion.button
              key={e.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setDragId(e.id)}
              className={`px-3 py-2 rounded-lg text-sm font-bold border-2 shadow-sm ${
                dragId === e.id ? "border-amber-600 bg-amber-200 scale-105" : "border-amber-400 bg-white"
              }`}
            >
              {e.emoji} {e.label} <span className="text-amber-800">${e.amount}</span>
            </motion.button>
          ))}
          {pool.length === 0 ? <span className="text-sm opacity-60">All sorted! Seal it up.</span> : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(["needs", "wants", "savings"] as const).map((bucket) => (
            <motion.button
              key={bucket}
              type="button"
              whileHover={{ scale: 1.02 }}
              onClick={() => place(bucket)}
              className={`rounded-xl border-2 p-3 text-left min-h-[7rem] ${BUCKET_META[bucket].color}`}
            >
              <div className="font-black mb-2">{BUCKET_META[bucket].label}</div>
              <div className="space-y-1 text-xs">
                {buckets[bucket].map((e) => (
                  <div key={e.id} className={e.bucket === bucket ? "" : "text-red-600 line-through"}>
                    {e.emoji} {e.label}
                  </div>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {allPlaced ? (
          <GameButton variant="primary" className="w-full" onClick={finish}>
            Seal my budget 📬
          </GameButton>
        ) : null}
      </div>
    </GameVisualShell>
  );
}
