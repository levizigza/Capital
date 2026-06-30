import { useState } from "react";
import { GameButton } from "@/game-ui";
import type { VibeLevel } from "./levelSchema";
import { bumpPlays } from "./communityStorage";

export function VibeLevelPreview({ level, onClose }: { level: VibeLevel; onClose?: () => void }) {
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const finish = (s: number) => {
    setScore(s);
    setDone(true);
    bumpPlays(level.id);
  };

  return (
    <div className="rounded-xl border border-violet-500/40 bg-slate-900 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-black">
            {level.icon} {level.title}
          </div>
          <div className="text-sm text-slate-400">{level.description}</div>
        </div>
        {onClose ? (
          <GameButton size="sm" variant="outline" onClick={onClose}>
            Edit
          </GameButton>
        ) : null}
      </div>

      {level.template === "quiz-signals" ? (
        <QuizPreview questions={level.questions ?? []} onFinish={finish} />
      ) : level.template === "budget-split" ? (
        <BudgetPreview expenses={level.expenses ?? []} onFinish={finish} />
      ) : level.template === "explorable-puzzle" ? (
        <GridPreview grid={level.grid} onFinish={finish} />
      ) : (
        <div className="text-center py-8 space-y-3">
          <div className="text-5xl">🕹️</div>
          <p>Coin Catcher template — play the full version from Coincraft Cove arcade!</p>
          <GameButton variant="primary" onClick={() => finish(75)}>
            Simulate win
          </GameButton>
        </div>
      )}

      {done ? (
        <div className="text-center font-bold text-green-400">Playtest score: {score}</div>
      ) : null}
    </div>
  );
}

function QuizPreview({
  questions,
  onFinish,
}: {
  questions: NonNullable<VibeLevel["questions"]>;
  onFinish: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const q = questions[idx];

  if (!q) {
    return <div className="text-sm text-green-400">Quiz complete!</div>;
  }

  const pick = (choice: string) => {
    const ok = choice === q.answer;
    const nextCorrect = correct + (ok ? 1 : 0);
    setCorrect(nextCorrect);
    if (idx + 1 >= questions.length) {
      onFinish(Math.round((nextCorrect / questions.length) * 100));
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-cyan-400">
        Question {idx + 1}/{questions.length}
      </div>
      <div className="font-bold">{q.prompt}</div>
      {[q.answer, ...q.wrong].map((c) => (
        <GameButton key={c} variant="outline" className="w-full" onClick={() => pick(c)}>
          {c}
        </GameButton>
      ))}
    </div>
  );
}

function BudgetPreview({
  expenses,
  onFinish,
}: {
  expenses: NonNullable<VibeLevel["expenses"]>;
  onFinish: (score: number) => void;
}) {
  const [sorted, setSorted] = useState(0);

  return (
    <div className="space-y-2">
      {expenses.map((e) => (
        <GameButton
          key={e.label}
          variant="outline"
          className="w-full justify-between"
          onClick={() => {
            const next = sorted + 1;
            setSorted(next);
            if (next >= expenses.length) onFinish(90);
          }}
        >
          {e.label} ${e.amount} → {e.bucket}
        </GameButton>
      ))}
    </div>
  );
}

function GridPreview({
  grid,
  onFinish,
}: {
  grid?: VibeLevel["grid"];
  onFinish: (score: number) => void;
}) {
  if (!grid?.length) {
    return <p className="text-sm text-red-400">Add a grid in JSON to preview this level.</p>;
  }

  return (
    <div className="space-y-3">
      <div
        className="inline-grid gap-0.5 p-2 rounded bg-black/40"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, 2rem)` }}
      >
        {grid.flatMap((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded ${
                cell.type === "wall" ? "bg-slate-800" : "bg-indigo-950"
              }`}
            >
              {cell.type === "coin" ? "🪙" : cell.type === "exit" ? "🚪" : cell.type === "npc" ? "🧑" : ""}
            </div>
          )),
        )}
      </div>
      <GameButton variant="primary" onClick={() => onFinish(80)}>
        Simulate explore run
      </GameButton>
    </div>
  );
}
