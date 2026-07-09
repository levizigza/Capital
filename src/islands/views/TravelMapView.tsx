import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  GameHudLayout,
  GameButton,
  GameTooltip,
  GameTooltipProvider,
  HudChip,
  useGameMotion,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle } from "../animationStyles";
import { getBoatTier, nextBoatTier } from "../boats";
import { CharacterAvatar } from "./CharacterAvatar";
import { BoatVoyageOverlay } from "./BoatVoyageOverlay";

const ISLAND_POSITIONS = [
  { x: 12, y: 72 },
  { x: 28, y: 58 },
  { x: 44, y: 70 },
  { x: 62, y: 55 },
  { x: 78, y: 68 },
  { x: 22, y: 38 },
  { x: 42, y: 32 },
  { x: 58, y: 36 },
  { x: 76, y: 28 },
  { x: 10, y: 20 },
  { x: 32, y: 14 },
  { x: 54, y: 12 },
  { x: 78, y: 10 },
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
  const boat = getBoatTier(userProfile.totalCoins);
  const nextBoat = nextBoatTier(userProfile.totalCoins);

  const [voyage, setVoyage] = useState<{
    islandId: string;
    name: string;
    animationStyle: string;
  } | null>(null);

  const beginVoyage = useCallback(
    (island: IslandDefinition) => {
      const theme = getIslandTheme(island.id, island.themeId);
      setVoyage({
        islandId: island.id,
        name: island.name,
        animationStyle: theme.animationStyle,
      });
    },
    []
  );

  const completeVoyage = useCallback(() => {
    if (!voyage) return;
    const id = voyage.islandId;
    setVoyage(null);
    onEnterIsland(id);
  }, [voyage, onEnterIsland]);

  const waves = useMemo(
    () =>
      reduced ? null : (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-8 rounded-[50%] bg-white/30"
              style={{ bottom: `${8 + i * 6}%` }}
              animate={{ x: ["-5%", "5%", "-5%"] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      ),
    [reduced]
  );

  return (
    <GameTooltipProvider>
      <AnimatePresence>
        {voyage ? (
          <BoatVoyageOverlay
            key="voyage"
            boat={boat}
            character={save.character}
            targetAnimationStyle={voyage.animationStyle}
            destinationName={voyage.name}
            onComplete={completeVoyage}
          />
        ) : null}
      </AnimatePresence>

      <GameHudLayout
        background={
          <div className="cap-surface absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[color-mix(in_oklab,var(--cap-tide)_25%,#ecfdf5)]" />
            {waves}
          </div>
        }
        topLeft={
          <HudChip
            title={userProfile.name || "Captain"}
            subtitle={`${boat.emoji} ${boat.label} · 🪙 ${userProfile.totalCoins}`}
          />
        }
        topRight={
          <GameButton variant="outline" size="sm" onClick={onBack}>
            Back
          </GameButton>
        }
        bottom={
          <div className="flex flex-col items-center gap-1 px-4 pb-2 text-center">
            {save.character ? (
              <CharacterAvatar
                character={save.character}
                size={56}
                animationStyle="capital-default"
              />
            ) : null}
            <div className="voyage-sailing relative">
              <span
                className="voyage-boat inline-block text-4xl"
                style={{ transform: `scale(${boat.scale})` }}
                title={boat.label}
              >
                {boat.emoji}
              </span>
              <div className="voyage-wake" />
            </div>
            {nextBoat ? (
              <p className="text-[10px] font-medium text-[var(--cap-ink-soft)]">
                {nextBoat.minCoins - userProfile.totalCoins} more coins for a {nextBoat.label}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-[var(--cap-gold-deep)]">Mega yacht unlocked!</p>
            )}
          </div>
        }
      >
        <div className="relative mx-auto h-full min-h-[280px] w-full max-w-[var(--game-content-max)]">
          <div className="text-center shrink-0 mb-3">
            <div className="cap-eyebrow">Sail the Capital sea</div>
            <h1 className="cap-display text-[var(--cap-ink)]" style={{ fontSize: "var(--game-title-size)" }}>
              Voyage Map
            </h1>
          </div>
          <p className="text-center text-sm text-[var(--cap-ink-soft)] mb-2 max-w-lg mx-auto">
            Each island is its own game era — Poptropica sketch, Flash flat, Miniclip arcade. Sail there and
            your character morphs into that world&apos;s style.
          </p>
          <p className="text-center mb-2">
            <InputPromptHint action="interact" className="justify-center text-[var(--cap-ink-soft)]">
              Chart a course —
            </InputPromptHint>
          </p>

          <div className="relative h-[min(52dvh,480px)] w-full">
            {islands.map((island, index) => {
              const theme = getIslandTheme(island.id, island.themeId);
              const era = getAnimationStyle(theme.animationStyle);
              const pos = ISLAND_POSITIONS[index] || ISLAND_POSITIONS[index % ISLAND_POSITIONS.length];
              const missingItems = (island.requiredItems || []).filter((id) => !save.inventory.includes(id));
              const isLocked = missingItems.length > 0;
              const pinSize = "w-[var(--game-pin-size)] h-[var(--game-pin-size)]";
              const shapeClass = PIN_SHAPE[theme.mapPinShape] ?? PIN_SHAPE.round;
              const discovered = save.discovered.islands.includes(island.id);
              const isFuture = island.id === "future_shores";

              const pin = (
                <motion.button
                  type="button"
                  disabled={isLocked || Boolean(voyage)}
                  data-testid={`island-pin-${island.id}`}
                  className={`absolute ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                  initial={reduced ? false : { scale: 0 }}
                  animate={{ scale: 1, opacity: isLocked ? 0.45 : 1 }}
                  whileHover={isLocked || reduced || voyage ? undefined : { scale: 1.1 }}
                  onClick={() => !isLocked && beginVoyage(island)}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`${pinSize} ${shapeClass} flex items-center justify-center text-2xl sm:text-4xl shadow-xl border-4 overflow-hidden ${
                        isFuture ? "island-pin-future" : ""
                      }`}
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
                    <span
                      className="era-badge mt-1.5"
                      style={{
                        borderColor: isLocked ? "#9ca3af" : theme.accent,
                        color: isLocked ? "#6b7280" : "#1f2937",
                      }}
                    >
                      {era.eraLabel}
                    </span>
                    <div
                      className="mt-1 max-w-[9rem] truncate rounded-lg px-2 py-0.5 text-center text-[10px] sm:text-xs font-bold shadow-md"
                      style={{
                        background: isLocked ? "#e5e7eb" : "var(--cap-card)",
                        color: isLocked ? "#6b7280" : "var(--cap-ink)",
                        border: `2px solid ${isLocked ? "#9ca3af" : "var(--cap-ink)"}`,
                        borderBottom: discovered ? `3px solid ${theme.accent}` : undefined,
                      }}
                    >
                      {island.name}
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
                      : `${island.description}\n\n${era.tagline}\n${theme.mood}`
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
