import { motion } from "framer-motion";

import {
  GameHudLayout,
  GameButton,
  GameTooltip,
  GameTooltipProvider,
  HudChip,
  useGameMotion,
  useGameUi,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { getIslandTheme } from "../themes/islandThemes";

const ISLAND_POSITIONS = [
  { x: 15, y: 70 },
  { x: 35, y: 55 },
  { x: 55, y: 68 },
  { x: 75, y: 52 },
  { x: 25, y: 40 },
  { x: 48, y: 35 },
  { x: 70, y: 38 },
  { x: 85, y: 25 },
  { x: 15, y: 22 },
  { x: 38, y: 18 },
  { x: 60, y: 15 },
  { x: 82, y: 12 },
];

const PIN_SHAPE: Record<string, string> = {
  round: "rounded-2xl",
  hex: "rounded-lg",
  diamond: "rounded-lg rotate-45",
  square: "rounded-md",
};

export type TravelMapViewProps = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  onBack: () => void;
  onEnterIsland: (islandId: string) => void;
};

export function TravelMapView({
  userProfile,
  islands,
  save,
  onBack,
  onEnterIsland,
}: TravelMapViewProps) {
  useInputAction("cancel", onBack);

  const { reduced } = useGameMotion();
  const { uiAspect } = useGameUi();

  const clouds =
    reduced ? null : (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(uiAspect === "ultrawide" ? 3 : 5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl sm:text-6xl opacity-60"
            initial={{ x: -100 }}
            animate={{ x: "100vw" }}
            transition={{ duration: 30 + i * 5, repeat: Infinity, delay: i * 6, ease: "linear" }}
            style={{ top: `${10 + i * 15}%` }}
          >
            ☁️
          </motion.div>
        ))}
      </div>
    );

  return (
    <GameTooltipProvider>
      <GameHudLayout
        background={
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 via-sky-200 to-emerald-300">
            {clouds}
          </div>
        }
        topLeft={
          <HudChip
            title={userProfile.name || "Adventurer"}
            subtitle={`⭐ Level ${userProfile.level} · 🧭 ${save.discovered.islands.length} islands`}
          />
        }
        topRight={
          <GameButton variant="outline" size="sm" onClick={onBack}>
            Back
          </GameButton>
        }
      >
        <div className="relative mx-auto h-full min-h-[280px] w-full max-w-[var(--game-content-max)]">
          <h1
            className="mb-2 text-center font-black text-white drop-shadow-lg"
            style={{
              fontSize: "var(--game-title-size)",
              textShadow: "2px 2px 0 #000, -2px -2px 0 #000",
            }}
          >
            🎈 Island Blimp
          </h1>
          <p className="text-center text-sm text-white/90 mb-4 max-w-md mx-auto">
            Each island is its own world — different art, games, and quests. Like Poptropica!
          </p>
          <p className="text-center mb-2">
            <InputPromptHint action="interact" className="justify-center text-gray-800">
              Hop to an island —
            </InputPromptHint>
          </p>
          <div className="relative h-[min(60dvh,520px)] w-full">
            {islands.map((island, index) => {
              const theme = getIslandTheme(island.id, island.themeId);
              const pos = ISLAND_POSITIONS[index] || ISLAND_POSITIONS[index % ISLAND_POSITIONS.length];
              const missingItems = (island.requiredItems || []).filter((id) => !save.inventory.includes(id));
              const isLocked = missingItems.length > 0;
              const pinSize = "w-[var(--game-pin-size)] h-[var(--game-pin-size)]";
              const shapeClass = PIN_SHAPE[theme.mapPinShape] ?? PIN_SHAPE.round;
              const discovered = save.discovered.islands.includes(island.id);

              const pin = (
                <motion.button
                  type="button"
                  disabled={isLocked}
                  data-testid={`island-pin-${island.id}`}
                  className={`absolute ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                  initial={reduced ? false : { scale: 0 }}
                  animate={{ scale: 1, opacity: isLocked ? 0.5 : 1 }}
                  whileHover={isLocked || reduced ? undefined : { scale: 1.12 }}
                  onClick={() => !isLocked && onEnterIsland(island.id)}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`${pinSize} ${shapeClass} flex items-center justify-center text-2xl sm:text-4xl shadow-xl border-4 overflow-hidden`}
                      style={{
                        borderColor: isLocked ? "#9ca3af" : theme.accent,
                        background: isLocked ? "#e5e7eb" : theme.background,
                        filter: isLocked ? "grayscale(1)" : undefined,
                      }}
                    >
                      <span className={theme.mapPinShape === "diamond" ? "-rotate-45" : ""}>
                        {isLocked ? "🔒" : island.icon}
                      </span>
                    </div>
                    <div
                      className="mt-2 max-w-[9rem] truncate rounded-lg px-2 py-0.5 text-center text-[10px] sm:text-xs font-bold shadow-md"
                      style={{
                        background: isLocked ? "#e5e7eb" : "rgba(255,255,255,0.95)",
                        color: isLocked ? "#6b7280" : "#1f2937",
                        borderBottom: discovered ? `3px solid ${theme.accent}` : undefined,
                      }}
                    >
                      {island.name}
                    </div>
                    <div className="text-[9px] text-white/90 font-medium mt-0.5 max-w-[8rem] truncate drop-shadow">
                      {theme.mood}
                    </div>
                  </div>
                </motion.button>
              );

              return (
                <GameTooltip
                  key={island.id}
                  content={
                    isLocked
                      ? `Locked — requires: ${missingItems.join(", ")}`
                      : `${island.description}\n\n${theme.mood} · ${theme.genre} · ${theme.complexity}`
                  }
                >
                  {pin}
                </GameTooltip>
              );
            })}
          </div>
        </div>
      </GameHudLayout>
    </GameTooltipProvider>
  );
}
