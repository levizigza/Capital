import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";

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
import { getAnimationStyle } from "../animationStyles";
import { getIslandTheme } from "../themes/islandThemes";
import { getEffectiveBoatTier, nextBoatTier } from "../boats";
import { BOSS_ISLAND_ID, BOSS_MASTERY_REQUIRED } from "../progressGates";
import { CharacterAvatar } from "./CharacterAvatar";
import { GalapagosIslandMarker } from "./GalapagosIslandMarker";
import {
  MAP_HUB,
  buildArchipelagoLayout,
  isIslandLocked,
} from "../worldMapLayout";
import { GALAPAGOS_ARCHIPELAGO_NAME } from "../galapagosIslands";

export type TravelMapViewProps = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  onBack: () => void;
  onStartVoyage: (islandId: string) => void;
};

export function TravelMapView({
  userProfile,
  islands,
  save,
  onBack,
  onStartVoyage,
}: TravelMapViewProps) {
  useInputAction("cancel", onBack);

  const { reduced } = useGameMotion();
  const boat = getEffectiveBoatTier(userProfile.totalCoins, save);
  const nextBoat = nextBoatTier(userProfile.totalCoins);
  const layout = useMemo(() => buildArchipelagoLayout(islands), [islands]);
  const currentId = save.currentIslandId ?? layout.hub.island.id;

  const beginVoyage = useCallback(
    (island: IslandDefinition) => {
      if (island.id === currentId) return;
      onStartVoyage(island.id);
    },
    [currentId, onStartVoyage],
  );

  const routePaths = useMemo(() => {
    return layout.outer.map((node) => {
      const mx = (MAP_HUB.x + node.mapX) / 2;
      const my = (MAP_HUB.y + node.mapY) / 2 - 5;
      return `M ${MAP_HUB.x} ${MAP_HUB.y} Q ${mx} ${my} ${node.mapX} ${node.mapY}`;
    });
  }, [layout.outer]);

  return (
    <GameTooltipProvider>
      <GameHudLayout
        background={
          <div className="cap-surface absolute inset-0 bg-gradient-to-b from-[#0c4a6e] to-[#134e4a]" />
        }
        topLeft={
          <HudChip
            title={GALAPAGOS_ARCHIPELAGO_NAME}
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
              <CharacterAvatar character={save.character} size={48} animationStyle="capital-default" />
            ) : null}
            <p className="text-xs font-medium text-white/90 max-w-sm">
              Your Harbor Voyager look stays on the map and carpet — landing on an era island remaps your animation.
            </p>
            {nextBoat ? (
              <p className="text-[10px] font-medium text-white/70">
                {nextBoat.minCoins - userProfile.totalCoins} more coins for a {nextBoat.label}
              </p>
            ) : null}
          </div>
        }
      >
        <div className="relative mx-auto h-full min-h-[280px] w-full max-w-[var(--game-content-max)]">
          <div className="text-center shrink-0 mb-3">
            <div className="cap-eyebrow text-emerald-100/90">Fortune Archipelago</div>
            <h1 className="cap-display text-white" style={{ fontSize: "var(--game-title-size)" }}>
              Era Isles
            </h1>
          </div>
          <p className="text-center text-sm text-white/85 mb-3 max-w-lg mx-auto">
            <strong>Harbor Haven</strong> (Coincraft Cove) launches your adventure. Float on your money magic carpet
            to decade-themed financial
            worlds — Vector Dawn through Painterly Skies — each with Fortune Party boards and rival captains.
          </p>
          <p className="text-center mb-2">
            <InputPromptHint action="interact" className="justify-center text-white/80">
              Chart a course —
            </InputPromptHint>
          </p>

          <div className="galapagos-map">
            <div className="galapagos-map__ocean" />
            <div className="galapagos-map__mist" />
            <div className="galapagos-map__equator" aria-hidden />
            <span className="galapagos-map__compass" aria-hidden>
              N
            </span>

            <svg className="galapagos-map__routes" viewBox="0 0 100 100" preserveAspectRatio="none">
              {routePaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="rgba(167, 243, 208, 0.28)"
                  strokeWidth="0.35"
                  strokeDasharray="1.2 1.4"
                />
              ))}
            </svg>

            {!reduced ? (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.1, 0.22, 0.1] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 h-5 rounded-[50%] bg-emerald-200/15"
                    style={{ top: `${20 + i * 20}%` }}
                  />
                ))}
              </motion.div>
            ) : null}

            <GalapagosIslandMarker
              node={layout.hub}
              locked={isIslandLocked(layout.hub.island, save.inventory, save)}
              isCurrent={layout.hub.island.id === currentId}
              discovered={save.discovered.islands.includes(layout.hub.island.id)}
              onSelect={() => beginVoyage(layout.hub.island)}
            />

            {layout.outer.map((node) => {
              const locked = isIslandLocked(node.island, save.inventory, save);
              const theme = getIslandTheme(node.island.id, node.island.themeId);
              const era = getAnimationStyle(theme.animationStyle);
              const marker = (
                <GalapagosIslandMarker
                  key={node.island.id}
                  node={node}
                  locked={locked}
                  isCurrent={node.island.id === currentId}
                  discovered={save.discovered.islands.includes(node.island.id)}
                  onSelect={() => beginVoyage(node.island)}
                />
              );

              return (
                <GameTooltip
                  key={node.island.id}
                  content={
                    locked
                      ? node.island.id === BOSS_ISLAND_ID
                        ? `Boss island locked — escape Harbor cashflow + clear ${BOSS_MASTERY_REQUIRED} mastery quizzes`
                        : `Locked — explore other islands first`
                      : `${node.galapagos.galapagosName}: ${node.galapagos.ecology}\n\n${node.island.description}\n\n${era.tagline}`
                  }
                >
                  {marker}
                </GameTooltip>
              );
            })}
          </div>
        </div>
      </GameHudLayout>
    </GameTooltipProvider>
  );
}
