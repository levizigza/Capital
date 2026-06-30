import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import { ChestPuzzle, VAULT_PUZZLES, useQuizJuice } from "../quiz";
import "../quiz/livingQuiz.css";

type CellType = "wall" | "floor" | "coin" | "chest" | "npc" | "exit" | "fog";

type Cell = {
  type: CellType;
  label?: string;
  value?: number;
  solved?: boolean;
  puzzleId?: string;
};

const DEFAULT_MAP: Cell[][] = [
  [
    { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" },
  ],
  [
    { type: "wall" }, { type: "floor" }, { type: "fog" }, { type: "coin", value: 5, label: "Nickel" }, { type: "fog" }, { type: "npc", label: "Guide" }, { type: "wall" },
  ],
  [
    { type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "chest", label: "Sort chest", puzzleId: "needs_wants" }, { type: "fog" }, { type: "floor" }, { type: "wall" },
  ],
  [
    { type: "wall" }, { type: "coin", value: 10, label: "Dime" }, { type: "fog" }, { type: "floor" }, { type: "chest", label: "Savings chest", puzzleId: "save_pct" }, { type: "floor" }, { type: "wall" },
  ],
  [
    { type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "npc", label: "Banker" }, { type: "chest", label: "Order chest", puzzleId: "money_order" }, { type: "exit", label: "Vault" }, { type: "wall" },
  ],
  [
    { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" },
  ],
];

const CELL_ICON: Partial<Record<CellType, string>> = {
  coin: "🪙",
  chest: "📦",
  npc: "🧑",
  exit: "🚪",
  fog: "?",
};

function revealFog(grid: Cell[][], cx: number, cy: number): Cell[][] {
  const next = grid.map((row) => row.map((c) => ({ ...c })));
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (next[y]?.[x]?.type === "fog") next[y][x] = { type: "floor" };
    }
  }
  return next;
}

export default function ExplorablePuzzleGame({
  minigameId,
  island,
  difficulty,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const sfx = useQuizJuice();
  const [grid, setGrid] = useState<Cell[][]>(() => DEFAULT_MAP.map((row) => row.map((c) => ({ ...c }))));
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [coins, setCoins] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("The vault is foggy — explore, solve chests, reach the exit!");
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const threshold = useMemo(() => (difficulty === "easy" ? 50 : difficulty === "hard" ? 85 : 70), [difficulty]);

  const activePuzzle = VAULT_PUZZLES.find((p) => p.id === activePuzzleId);

  const tryMove = useCallback(
    (dx: number, dy: number) => {
      if (finished || activePuzzleId) return;
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (nx < 0 || ny < 0 || ny >= rows || nx >= cols) return;
      const cell = grid[ny][nx];
      if (cell.type === "wall" || cell.type === "fog") return;

      setPlayer({ x: nx, y: ny });
      setGrid((g) => revealFog(g, nx, ny));

      if (cell.type === "coin" && cell.value) {
        setCoins((c) => c + cell.value);
        setScore((s) => s + cell.value);
        sfx.correct();
        setMessage(`+${cell.value}¢ — ${cell.label ?? "coin"}`);
        setGrid((g) => {
          const next = g.map((row) => row.map((c) => ({ ...c })));
          next[ny][nx] = { type: "floor" };
          return next;
        });
      } else if (cell.type === "chest" && !cell.solved && cell.puzzleId) {
        setActivePuzzleId(cell.puzzleId);
        setMessage("A puzzle chest! Interact to learn and earn.");
      } else if (cell.type === "npc") {
        setScore((s) => s + 5);
        setMessage(`${cell.label}: "Every saved coin is future freedom." (+5)`);
      } else if (cell.type === "exit") {
        const finalScore = clampScore(score);
        setFinished(true);
        sfx.complete();
        setMessage(finalScore >= threshold ? "Vault unlocked!" : "You escaped — gather more wisdom next time.");
        onComplete(finalScore >= threshold, finalScore);
      }
    },
    [activePuzzleId, cols, finished, grid, onComplete, player, rows, score, sfx, threshold],
  );

  const onPuzzleDone = (success: boolean, points: number) => {
    setScore((s) => s + points);
    if (success) sfx.correct();
    setGrid((g) => {
      const next = g.map((row) => row.map((c) => ({ ...c })));
      const cell = next[player.y][player.x];
      if (cell.type === "chest") cell.solved = true;
      return next;
    });
    setActivePuzzleId(null);
    setMessage(success ? "Chest mastered! The path grows clearer." : "You learned something — try another route.");
  };

  const visible = (x: number, y: number) => {
    const c = grid[y][x];
    if (c.type === "fog") return false;
    const dist = Math.abs(x - player.x) + Math.abs(y - player.y);
    return dist <= 3 || c.type !== "floor";
  };

  return (
    <GameVisualShell
      shell="explore"
      title={def?.name ?? "Treasure Vault Explorer"}
      icon={def?.icon ?? "🗺️"}
      genre="exploration"
      complexity="medium"
      onClose={onClose}
    >
      <div className="space-y-3">
        <motion.p key={message} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm opacity-90">
          {message}
        </motion.p>
        <div className="flex gap-4 text-sm font-bold">
          <span>🪙 {coins}</span>
          <span>⭐ {score}</span>
          <span>🎯 {threshold}+</span>
        </div>

        <div
          className="mx-auto grid gap-0.5 p-2 rounded-lg bg-black/50 ring-1 ring-violet-500/30"
          style={{ gridTemplateColumns: `repeat(${cols}, 2.5rem)` }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = player.x === x && player.y === y;
              const fogged = !visible(x, y);
              const icon = isPlayer ? "🧒" : fogged ? "" : CELL_ICON[cell.type] ?? (cell.type === "floor" ? "" : "");
              return (
                <motion.div
                  key={`${x}-${y}`}
                  className={`w-10 h-10 flex items-center justify-center text-lg rounded relative ${
                    cell.type === "wall"
                      ? "bg-slate-900"
                      : fogged
                        ? "lq-fog"
                        : isPlayer
                          ? "bg-violet-500 ring-2 ring-white shadow-lg shadow-violet-500/50"
                          : cell.type === "chest" && cell.solved
                            ? "bg-indigo-900/50 opacity-50"
                            : "bg-indigo-950/80"
                  }`}
                  animate={isPlayer ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: isPlayer ? Infinity : 0, duration: 1.5 }}
                >
                  {icon}
                  {cell.type === "chest" && !cell.solved && !fogged ? (
                    <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">!</span>
                  ) : null}
                </motion.div>
              );
            }),
          )}
        </div>

        {activePuzzle ? (
          <ChestPuzzle puzzle={activePuzzle} onComplete={onPuzzleDone} onCancel={() => setActivePuzzleId(null)} />
        ) : (
          <div className="grid grid-cols-3 gap-1 max-w-[12rem] mx-auto">
            <div />
            <GameButton size="sm" variant="outline" onClick={() => tryMove(0, -1)}>↑</GameButton>
            <div />
            <GameButton size="sm" variant="outline" onClick={() => tryMove(-1, 0)}>←</GameButton>
            <GameButton size="sm" variant="outline" onClick={() => tryMove(0, 1)}>↓</GameButton>
            <GameButton size="sm" variant="outline" onClick={() => tryMove(1, 0)}>→</GameButton>
          </div>
        )}

        {finished ? (
          <GameButton variant="primary" className="w-full" onClick={onClose}>Done</GameButton>
        ) : null}
      </div>
    </GameVisualShell>
  );
}
