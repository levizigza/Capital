import { useCallback, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";

const PITS = 6;

/**
 * Mancala Compound — sow-and-capture remixed as save → compound growth.
 * Cultural seed: mancala family; original Capital money framing.
 */
export default function MancalaCompoundGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [pits, setPits] = useState(() => Array.from({ length: PITS }, () => 3));
  const [store, setStore] = useState(0);
  const [turns, setTurns] = useState(0);
  const [msg, setMsg] = useState("Sow seeds into future pits — your store is compound savings.");

  const finished = turns >= 8 || pits.every((p) => p === 0);

  const sow = useCallback(
    (index: number) => {
      if (finished || pits[index]! <= 0) return;
      const next = [...pits];
      let hand = next[index]!;
      next[index] = 0;
      let i = index;
      let gained = 0;
      while (hand > 0) {
        i = (i + 1) % PITS;
        // Every full lap, a seed compounds into the store
        if (i === 0 && hand > 0) {
          gained += 1;
          hand -= 1;
          if (hand === 0) break;
        }
        next[i]! += 1;
        hand -= 1;
      }
      // Capture: land in a pit with 1 after drop → harvest pair into store (compound moment)
      if (next[i] === 1 && i !== index) {
        gained += 1;
        next[i] = 0;
      }
      const compoundBonus = Math.floor(store / 10);
      const totalGain = gained + (gained > 0 ? compoundBonus : 0);
      setPits(next);
      setStore((s) => s + totalGain);
      setTurns((t) => t + 1);
      setMsg(
        totalGain > 0
          ? `Compound harvest +${totalGain}${compoundBonus ? ` (incl. +${compoundBonus} from prior savings)` : ""}!`
          : "Seeds moved — keep sowing to grow the store.",
      );
    },
    [finished, pits, store],
  );

  const score = Math.min(100, store * 8 + turns * 2);
  const success = store >= 8;

  return (
    <GameVisualShell
      shell="retro"
      title={def?.name ?? "Mancala Compound"}
      icon={def?.icon ?? "🟢"}
      genre="strategy"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3 p-4" data-testid="mancala-compound-game">
        <p className="text-sm text-center text-[var(--cap-ink-soft)]">
          Each sow is a deposit. Seeds that loop home compound into your <b>savings store</b>.
        </p>
        <div className="text-center">
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
            Savings store
          </div>
          <div className="font-display text-3xl font-black text-emerald-700">{store}</div>
          <div className="text-xs">Turn {Math.min(turns, 8)}/8</div>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {pits.map((count, i) => (
            <button
              key={i}
              type="button"
              disabled={finished || count === 0}
              onClick={() => sow(i)}
              className="aspect-square rounded-full border-2 border-[var(--cap-ink)]/20 bg-[var(--cap-paper)] font-black disabled:opacity-40 hover:border-[var(--cap-tide)]"
              data-testid={`mancala-pit-${i}`}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-semibold">{msg}</p>

        {finished ? (
          <GameButton
            variant="primary"
            className="w-full"
            onClick={() => onComplete(success, score)}
          >
            {success ? `Bank it — store ${store}` : `Close — need more compound (store ${store})`}
          </GameButton>
        ) : (
          <p className="text-center text-xs text-[var(--cap-ink-soft)]">
            Tip: bigger pits sow farther — like letting savings ride longer.
          </p>
        )}
      </div>
    </GameVisualShell>
  );
}
