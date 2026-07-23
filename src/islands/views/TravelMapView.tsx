import { useCallback, useMemo } from "react";

import {
  GameHudLayout,
  GameButton,
  HudChip,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { getEffectiveBoatTier, nextBoatTier } from "../boats";
import { HUB_ISLAND_ID, isIslandLocked } from "../worldMapLayout";
import { GALAPAGOS_ARCHIPELAGO_NAME } from "../galapagosIslands";
import { ArchipelagoMap3D } from "../world3d/ArchipelagoMap3D";
import { getIslandTheme } from "../themes/islandThemes";

export type TravelMapViewProps = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  onBack: () => void;
  onStartVoyage: (islandId: string) => void;
};

/**
 * Archipelago travel — 3D floating diorama map + visible island strip
 * (strip stays usable even if WebGL hiccups).
 */
export function TravelMapView({
  userProfile,
  islands,
  save,
  onBack,
  onStartVoyage,
}: TravelMapViewProps) {
  useInputAction("cancel", onBack);

  const boat = getEffectiveBoatTier(userProfile.totalCoins, save);
  const nextBoat = nextBoatTier(userProfile.totalCoins);
  const currentId = save.currentIslandId ?? HUB_ISLAND_ID;

  const beginVoyage = useCallback(
    (islandId: string) => {
      if (islandId === currentId) return;
      onStartVoyage(islandId);
    },
    [currentId, onStartVoyage],
  );

  const islandList = useMemo(() => islands, [islands]);

  return (
    <GameHudLayout
      className="!bg-transparent"
      background={
        <div className="absolute inset-0">
          <ArchipelagoMap3D
            islands={islandList}
            save={save}
            currentId={currentId}
            onSelect={beginVoyage}
          />
        </div>
      }
      topLeft={
        <HudChip
          title={GALAPAGOS_ARCHIPELAGO_NAME}
          subtitle={`${boat.emoji} ${boat.label} · 🪙 ${userProfile.totalCoins}`}
        />
      }
      topRight={
        <GameButton variant="outline" size="sm" onClick={onBack} data-testid="travel-map-back">
          Back
        </GameButton>
      }
      bottom={
        <div className="flex w-full max-w-4xl flex-col items-center gap-2 px-3 pb-1">
          <div
            className="flex w-full gap-2 overflow-x-auto pb-1"
            data-testid="archipelago-island-strip"
          >
            {islandList.map((island) => {
              const locked = isIslandLocked(island, save.inventory, save);
              const here = island.id === currentId;
              const theme = getIslandTheme(island.id, island.themeId);
              return (
                <button
                  key={island.id}
                  type="button"
                  data-testid={`island-pin-${island.id}`}
                  data-locked={locked ? "1" : "0"}
                  disabled={locked || here}
                  onClick={() => beginVoyage(island.id)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-left text-xs font-bold shadow-md ring-1 transition ${
                    here
                      ? "bg-amber-200 text-amber-950 ring-amber-400"
                      : locked
                        ? "cursor-not-allowed bg-slate-700/70 text-white/45 ring-white/10"
                        : "bg-white/90 text-slate-900 ring-white/40 hover:bg-white"
                  }`}
                  style={{ borderLeft: `4px solid ${theme.accent}` }}
                >
                  <span className="mr-1">{locked ? "🔒" : island.icon}</span>
                  {island.name}
                  {here ? " · here" : ""}
                </button>
              );
            })}
          </div>
          <InputPromptHint action="cancel" className="justify-center text-white/80">
            Tap a diorama or chip · Esc back to Harbor
          </InputPromptHint>
          {nextBoat ? (
            <p className="text-[10px] font-medium text-white/65">
              {nextBoat.minCoins - userProfile.totalCoins} coins to unlock {nextBoat.label}
            </p>
          ) : null}
        </div>
      }
    >
      <div data-hud-pass className="h-full min-h-[50vh]" aria-hidden />
    </GameHudLayout>
  );
}
