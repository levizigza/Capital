import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameButton } from "@/game-ui";
import { InsightCard, type InsightPayload } from "./InsightCard";
import { ConsequenceTheater } from "./ConsequenceTheater";
import { useQuizJuice } from "./useQuizJuice";

export type ChestPuzzleKind = "sort" | "slider" | "timeline";

export type ChestPuzzleDef = {
  id: string;
  kind: ChestPuzzleKind;
  title: string;
  prompt: string;
  /** sort: items to drag */
  items?: { id: string; label: string; bucket: "needs" | "wants" | "save" }[];
  /** slider: target percentage */
  sliderTarget?: number;
  sliderLabel?: string;
  /** timeline: order events */
  timeline?: { id: string; label: string; order: number }[];
  insight: InsightPayload;
  consequenceGood: { label: string; amount: number; emoji: string }[];
  consequenceBad: { label: string; amount: number; emoji: string }[];
};

type Phase = "play" | "reveal" | "insight";

export function ChestPuzzle({
  puzzle,
  onComplete,
  onCancel,
}: {
  puzzle: ChestPuzzleDef;
  onComplete: (success: boolean, points: number) => void;
  onCancel?: () => void;
}) {
  const sfx = useQuizJuice();
  const [phase, setPhase] = useState<Phase>("play");
  const [success, setSuccess] = useState(false);

  // Sort state
  const [pool, setPool] = useState(() => puzzle.items ?? []);
  const [buckets, setBuckets] = useState<Record<string, typeof pool>>({
    needs: [],
    wants: [],
    save: [],
  });
  const [dragId, setDragId] = useState<string | null>(null);

  // Slider state
  const [slider, setSlider] = useState(50);

  // Timeline state
  const [order, setOrder] = useState<string[]>(() =>
    (puzzle.timeline ?? []).map((t) => t.id).sort(() => Math.random() - 0.5),
  );

  const submit = () => {
    let ok = false;
    if (puzzle.kind === "sort" && puzzle.items) {
      let correct = 0;
      for (const b of ["needs", "wants", "save"] as const) {
        for (const item of buckets[b]) {
          if (item.bucket === b) correct++;
        }
      }
      ok = correct >= puzzle.items.length * 0.75;
    }
    if (puzzle.kind === "slider" && puzzle.sliderTarget != null) {
      ok = Math.abs(slider - puzzle.sliderTarget) <= 12;
    }
    if (puzzle.kind === "timeline" && puzzle.timeline) {
      const ideal = [...puzzle.timeline].sort((a, b) => a.order - b.order).map((t) => t.id);
      ok = order.every((id, i) => id === ideal[i]);
    }
    setSuccess(ok);
    if (ok) sfx.correct();
    else sfx.wrong();
    setPhase("reveal");
  };

  const finishInsight = () => {
    onComplete(success, success ? 25 : 8);
  };

  if (phase === "insight") {
    return (
      <InsightCard insight={puzzle.insight} success={success} onContinue={finishInsight} />
    );
  }

  if (phase === "reveal") {
    return (
      <div className="space-y-4">
        <ConsequenceTheater
          title={success ? "Your choice paid off" : "What could have happened"}
          beats={success ? puzzle.consequenceGood : puzzle.consequenceBad}
          success={success}
        />
        <GameButton variant="primary" className="w-full" onClick={() => setPhase("insight")}>
          Understand why →
        </GameButton>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-xl border-2 border-violet-400/50 bg-violet-950/50 p-4 space-y-3"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="text-lg font-black">📦 {puzzle.title}</div>
      <p className="text-sm opacity-90">{puzzle.prompt}</p>

      {puzzle.kind === "sort" ? (
        <>
          <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded border border-dashed border-violet-400/40">
            {pool.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDragId(item.id)}
                className={`px-2 py-1 rounded text-xs font-bold border-2 ${
                  dragId === item.id ? "border-yellow-400 bg-yellow-200 text-black" : "border-violet-300 bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["needs", "wants", "save"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  if (!dragId) return;
                  const item = pool.find((i) => i.id === dragId);
                  if (!item) return;
                  setPool((p) => p.filter((i) => i.id !== dragId));
                  setBuckets((bk) => ({ ...bk, [b]: [...bk[b], item] }));
                  setDragId(null);
                }}
                className="rounded-lg border border-violet-400/30 p-2 min-h-[4rem] text-left capitalize text-xs"
              >
                <div className="font-bold mb-1">{b}</div>
                {buckets[b].map((i) => (
                  <div key={i.id}>{i.label}</div>
                ))}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {puzzle.kind === "slider" ? (
        <div>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>{puzzle.sliderLabel ?? "Your pick"}</span>
            <span>{slider}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            className="w-full accent-violet-400"
          />
          <p className="text-xs opacity-70 mt-2">Drag the slider — there&apos;s a smart zone!</p>
        </div>
      ) : null}

      {puzzle.kind === "timeline" ? (
        <div className="space-y-2">
          {order.map((id, idx) => {
            const item = puzzle.timeline!.find((t) => t.id === id)!;
            return (
              <div key={id} className="flex items-center gap-2">
                <span className="text-xs font-mono w-6">{idx + 1}.</span>
                <span className="flex-1 text-sm">{item.label}</span>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    className="text-xs px-1 rounded bg-white/10"
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...order];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setOrder(next);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="text-xs px-1 rounded bg-white/10"
                    disabled={idx === order.length - 1}
                    onClick={() => {
                      const next = [...order];
                      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                      setOrder(next);
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            );
          })}
          <p className="text-xs opacity-70">Put money moves in the best order!</p>
        </div>
      ) : null}

      <div className="flex gap-2">
        <GameButton
          variant="primary"
          className="flex-1"
          disabled={puzzle.kind === "sort" && pool.length > 0}
          onClick={submit}
        >
          Seal the chest
        </GameButton>
        {onCancel ? (
          <GameButton variant="outline" onClick={onCancel}>
            Leave
          </GameButton>
        ) : null}
      </div>
    </motion.div>
  );
}

export const VAULT_PUZZLES: ChestPuzzleDef[] = [
  {
    id: "needs_wants",
    kind: "sort",
    title: "Needs vs Wants Sort",
    prompt: "Tap an item, then tap the right jar. Rent before roblox!",
    items: [
      { id: "1", label: "Rent", bucket: "needs" },
      { id: "2", label: "Groceries", bucket: "needs" },
      { id: "3", label: "Roblox skins", bucket: "wants" },
      { id: "4", label: "Emergency fund", bucket: "save" },
    ],
    insight: {
      headline: "Needs keep you safe. Wants keep life fun.",
      story: "Mira sorted her coins and still had money for a treat — because she paid rent first.",
      systemLesson:
        "The financial system rewards people who cover fixed costs first. When needs are handled, lenders trust you, and you avoid panic borrowing.",
      realWorld: "The 50/30/20 rule is a famous budget split: needs, wants, savings.",
    },
    consequenceGood: [
      { label: "Rent paid on time", amount: 15, emoji: "🏠" },
      { label: "Credit trust +", amount: 10, emoji: "⭐" },
    ],
    consequenceBad: [
      { label: "Late fee", amount: -20, emoji: "⚠️" },
      { label: "Stress", amount: -10, emoji: "😰" },
    ],
  },
  {
    id: "save_pct",
    kind: "slider",
    title: "Pay Yourself First",
    prompt: "You got $100. How much goes to savings BEFORE spending?",
    sliderTarget: 20,
    sliderLabel: "Savings %",
    insight: {
      headline: "Saving first beats saving whatever's left",
      story: "If savings come last, they often become zero. Pay-yourself-first flips the script.",
      systemLesson:
        "Banks compound interest on what you keep. Automating savings turns behavior into a system — the money moves before you can spend it.",
      realWorld: "Many employers offer split direct deposit so savings never hits your spending account.",
    },
    consequenceGood: [
      { label: "Future you", amount: 20, emoji: "🫙" },
      { label: "Compound starts", amount: 5, emoji: "📈" },
    ],
    consequenceBad: [
      { label: "Empty jar", amount: -15, emoji: "🫙" },
      { label: "Missed interest", amount: -8, emoji: "⏳" },
    ],
  },
  {
    id: "money_order",
    kind: "timeline",
    title: "Smart Money Order",
    prompt: "Reorder these steps — what should happen first when paycheck arrives?",
    timeline: [
      { id: "a", label: "Cover needs (rent, food)", order: 0 },
      { id: "b", label: "Move savings to jar", order: 1 },
      { id: "c", label: "Fun spending", order: 2 },
      { id: "d", label: "Track what you spent", order: 3 },
    ],
    insight: {
      headline: "Order is a superpower",
      story: "Chaos spending feels fine until Tuesday. A sequence protects you without killing joy.",
      systemLesson:
        "Cash flow is timing. The system cares WHEN money moves — bills, credit due dates, and savings automation all run on calendars.",
    },
    consequenceGood: [
      { label: "No surprises", amount: 12, emoji: "✅" },
      { label: "Budget calm", amount: 8, emoji: "🧘" },
    ],
    consequenceBad: [
      { label: "Overdraft", amount: -25, emoji: "💸" },
      { label: "Borrow to eat", amount: -10, emoji: "😬" },
    ],
  },
];
