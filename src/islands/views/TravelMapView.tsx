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
import { CharacterAvatar } from "./CharacterAvatar";
import { HUB_ISLAND_ID } from "../worldMapLayout";
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
        <div className="flex flex-col items-center gap-1 px-4 pb-2 text-center">
          {save.character ? (
            <CharacterAvatar character={save.character} size={44} animationStyle="capital-default" />
          ) : null}
          <InputPromptHint action="interact" className="justify-center text-white/85">
            Tap a diorama island to fly
          </InputPromptHint>
          {nextBoat ? (
            <p className="text-[10px] font-medium text-white/70">
              {nextBoat.minCoins - userProfile.totalCoins} more coins for a {nextBoat.label}
            </p>
          ) : null}
        </div>
      }
    >
      {/* Spacer so HUD bands don't collapse; map is the background */}
      <div className="pointer-events-none h-full min-h-[50vh]" aria-hidden />
    </GameHudLayout>
  );
}
