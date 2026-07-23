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

export type TravelMapViewProps = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  onBack: () => void;
  onStartVoyage: (islandId: string) => void;
};

/**
 * Archipelago travel — 3D floating diorama map (not flat 2D pins).
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
          {/* Accessible / QA pin list — 3D dioramas aren't in the DOM tree */}
          <div className="sr-only">
            {islandList.map((island) => {
              const locked = isIslandLocked(island, save.inventory, save);
              return (
                <button
                  key={island.id}
                  type="button"
                  data-testid={`island-pin-${island.id}`}
                  data-locked={locked ? "1" : "0"}
                  disabled={locked || island.id === currentId}
                  onClick={() => beginVoyage(island.id)}
                >
                  {island.name}
                </button>
              );
            })}
          </div>
        </div>
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
        <div className="flex flex-col items-center gap-1 px-4 pb-1 text-center">
          <InputPromptHint action="interact" className="justify-center text-white/80">
            Tap an island · Esc back
          </InputPromptHint>
          {nextBoat ? (
            <p className="text-[10px] font-medium text-white/65">
              {nextBoat.minCoins - userProfile.totalCoins} coins to unlock {nextBoat.label}
            </p>
          ) : null}
        </div>
      }
    >
      {/* Pass-through spacer — map lives in background and must receive taps */}
      <div data-hud-pass className="h-full min-h-[50vh]" aria-hidden />
    </GameHudLayout>
  );
}
