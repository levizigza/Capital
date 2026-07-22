import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  GameHudLayout,
  GameButton,
  GamePanel,
  GameTabs,
  HudChip,
  useGameMotion,
} from "@/game-ui";

import type { IslandSaveV1 } from "../types";
import type { CatalogGame } from "./gameCatalog";
import { buildGameCatalog } from "./gameCatalog";
import { loadIslandsContent } from "../content/loader";
import { getIslandTheme } from "../themes/islandThemes";

export type ArcadeViewProps = {
  save: IslandSaveV1;
  userName: string;
  onBack: () => void;
  onPlayGame: (islandId: string, minigameId: string) => void;
  onOpenStudio: () => void;
  extraGames?: CatalogGame[];
};

type FilterGenre = "all" | CatalogGame["genre"];
type FilterComplexity = "all" | CatalogGame["complexity"];

const GENRE_LABEL: Record<CatalogGame["genre"], string> = {
  arcade: "🕹️ Arcade",
  puzzle: "🧩 Puzzle",
  simulation: "📈 Sim",
  quiz: "❓ Quiz",
  strategy: "♟️ Strategy",
  exploration: "🗺️ Explore",
  party: "🎲 Party",
};

const SHELL_BADGE: Record<CatalogGame["visualShell"], string> = {
  arcade: "8-BIT",
  neon: "NEON",
  notebook: "SKETCH",
  explore: "PUZZLE",
  retro: "RETRO",
  flat: "CLEAN",
  broker: "PRO",
};

export function ArcadeView({
  save,
  userName,
  onBack,
  onPlayGame,
  onOpenStudio,
  extraGames = [],
}: ArcadeViewProps) {
  const content = useMemo(() => loadIslandsContent(), []);
  const catalog = useMemo(
    () => [...buildGameCatalog(content), ...extraGames],
    [content, extraGames],
  );

  const [genre, setGenre] = useState<FilterGenre>("all");
  const [complexity, setComplexity] = useState<FilterComplexity>("all");
  const { reduced } = useGameMotion();

  const filtered = catalog.filter((g) => {
    if (genre !== "all" && g.genre !== genre) return false;
    if (complexity !== "all" && g.complexity !== complexity) return false;
    return true;
  });

  const completedCount = save.completedMinigames.length;

  return (
    <GameHudLayout
      background={
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900 via-slate-900 to-cyan-950">
          {!reduced ? (
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                  style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 80}%` }}
                >
                  {["🕹️", "👾", "🪙", "⭐", "🎮"][i % 5]}
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      }
      topLeft={<HudChip title={userName || "Player"} subtitle={`🕹️ ${completedCount} games cleared`} />}
      topRight={
        <GameButton variant="outline" size="sm" onClick={onBack}>
          Hub
        </GameButton>
      }
    >
      <div className="mx-auto w-full max-w-[var(--game-content-max)] space-y-4 pb-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-white drop-shadow-lg">🕹️ FinanceQuest Arcade</h1>
          <p className="text-sm text-white/80 mt-1">
            Every island has different worlds and games — pick what sounds fun!
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <GameButton variant="primary" size="sm" onClick={onOpenStudio} data-testid="open-vibe-studio">
            ✨ VibeCode Studio
          </GameButton>
        </div>

        <GameTabs
          tabs={[
            { id: "all", label: "All" },
            ...Object.entries(GENRE_LABEL).map(([id, label]) => ({ id, label })),
          ]}
          activeId={genre}
          onChange={(id) => setGenre(id as FilterGenre)}
        />

        <div className="flex flex-wrap gap-2 justify-center">
          {(["all", "easy", "medium", "hard"] as const).map((c) => (
            <GameButton
              key={c}
              size="sm"
              variant={complexity === c ? "primary" : "outline"}
              onClick={() => setComplexity(c)}
            >
              {c === "all" ? "Any difficulty" : c}
            </GameButton>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((game) => {
            const theme = getIslandTheme(game.islandId);
            const done = save.completedMinigames.includes(game.minigameId);
            return (
              <button
                key={`${game.islandId}:${game.minigameId}`}
                type="button"
                data-testid={`arcade-game-${game.minigameId}`}
                onClick={() => onPlayGame(game.islandId, game.minigameId)}
                className="text-left rounded-xl border-2 border-white/20 bg-black/40 backdrop-blur p-4 hover:border-cyan-400/60 hover:scale-[1.02] transition-transform"
                style={{ borderColor: done ? theme.accent : undefined }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl">{game.icon}</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10">
                    {SHELL_BADGE[game.visualShell]}
                  </span>
                </div>
                <div className="font-black text-white mt-2">{game.name}</div>
                <div className="text-xs text-white/70 line-clamp-2">{game.description}</div>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  <span className="rounded bg-white/10 px-1.5 py-0.5">
                    {game.islandIcon} {game.islandName}
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5">{game.complexity}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5">~{game.estimatedMinutes}m</span>
                  {done ? <span className="rounded bg-green-500/30 px-1.5 py-0.5">✓ cleared</span> : null}
                  {game.isCommunity ? <span className="rounded bg-violet-500/30 px-1.5 py-0.5">community</span> : null}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <GamePanel title="No matches">
            <p className="text-sm">Try a different filter — or build your own in VibeCode Studio!</p>
          </GamePanel>
        ) : null}
      </div>
    </GameHudLayout>
  );
}
