import { useCallback, useMemo } from "react";

import {
  GameHudLayout,
  GameButton,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { nextBoatTier } from "../boats";
import { HUB_ISLAND_ID, isIslandLocked } from "../worldMapLayout";
import {
  FORTUNE_ARCHIPELAGO_NAME,
  islandsForArchipelagoMap,
  islandsForSpineTravel,
} from "../spineArchipelago";
import { ArchipelagoMap3D } from "../world3d/ArchipelagoMap3D";
import { getIslandTheme } from "../themes/islandThemes";
import { islandLockHint } from "../progressGates";
import { moneyStructureForIsland } from "../moneyStructures";
import { pointerSafeActivate } from "../pointerSafeClick";

/** Compact structure label for the spine strip. */
function structurePinGlyph(islandId: string): string {
  const theme = moneyStructureForIsland(islandId)?.theme;
  if (theme === "jar") return "Jar";
  if (theme === "tower") return "Tower";
  if (theme === "keep") return "Keep";
  if (theme === "bank") return "Bank";
  return "Shore";
}

export type TravelMapViewProps = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  onBack: () => void;
  onStartVoyage: (islandId: string) => void;
};

/**
 * Archipelago travel — one Seed of Life composition.
 * Map owns names + geometry; HUD is brand + spine strip only.
 */
export function TravelMapView({
  userProfile,
  islands,
  save,
  onBack,
  onStartVoyage,
}: TravelMapViewProps) {
  useInputAction("cancel", onBack);

  const nextBoat = nextBoatTier(userProfile.totalCoins);
  const currentId = save.currentIslandId ?? HUB_ISLAND_ID;

  const beginVoyage = useCallback(
    (islandId: string) => {
      if (islandId === currentId) {
        onBack();
        return;
      }
      onStartVoyage(islandId);
    },
    [currentId, onBack, onStartVoyage],
  );

  const stripIslands = useMemo(() => islandsForSpineTravel(islands), [islands]);
  const mapIslands = useMemo(() => islandsForArchipelagoMap(islands), [islands]);

  return (
    <GameHudLayout
      className="!bg-transparent"
      background={
        <div className="absolute inset-0" data-testid="travel-map-sacred-stage">
          <ArchipelagoMap3D
            islands={mapIslands}
            save={save}
            currentId={currentId}
            onSelect={beginVoyage}
          />
        </div>
      }
      topLeft={
        <div data-testid="fortune-archipelago-chip" className="pl-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-100/90">
            Capital
          </p>
          <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-xl font-black tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] sm:text-2xl">
            {FORTUNE_ARCHIPELAGO_NAME}
          </h1>
        </div>
      }
      topRight={
        <GameButton variant="outline" size="sm" onClick={onBack} data-testid="travel-map-back">
          Harbor
        </GameButton>
      }
      bottom={
        <div className="relative z-30 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-3 pb-2">
          <div
            className="flex w-full justify-center gap-2 overflow-x-auto pb-0.5"
            data-testid="archipelago-island-strip"
          >
            {stripIslands.map((island) => {
              const locked = isIslandLocked(island, save.inventory, save);
              const here = island.id === currentId;
              const theme = getIslandTheme(island.id, island.themeId);
              const lockWhy = locked ? islandLockHint(island, save) : null;
              return (
                <button
                  key={island.id}
                  type="button"
                  data-testid={`island-pin-${island.id}`}
                  data-locked={locked ? "1" : "0"}
                  data-here={here ? "1" : "0"}
                  title={
                    lockWhy ??
                    (here
                      ? "You are here · return to plaza"
                      : `Board carpet · ${island.name}`)
                  }
                  disabled={locked}
                  {...pointerSafeActivate(() => {
                    if (!locked) beginVoyage(island.id);
                  })}
                  className={`shrink-0 touch-manipulation rounded-full px-3.5 py-2 text-left text-xs font-bold shadow-md ring-1 transition ${
                    here
                      ? "bg-amber-200 text-amber-950 ring-amber-400 hover:bg-amber-100"
                      : locked
                        ? "cursor-not-allowed bg-slate-900/50 text-white/35 ring-white/10"
                        : "bg-white/88 text-slate-900 ring-white/35 hover:bg-white"
                  }`}
                  style={{ boxShadow: here ? `inset 3px 0 0 ${theme.accent}` : undefined }}
                  data-ghost={locked ? "1" : "0"}
                >
                  <span className="text-[9px] font-black uppercase tracking-wide opacity-70">
                    {locked ? "···" : structurePinGlyph(island.id)}
                  </span>{" "}
                  {island.name}
                  {here ? " · here" : ""}
                </button>
              );
            })}
          </div>
          <InputPromptHint action="cancel" className="justify-center text-white/70">
            Spine voyage · Esc Harbor
          </InputPromptHint>
          {nextBoat ? (
            <p className="text-[10px] font-medium text-white/55">
              {nextBoat.minCoins - userProfile.totalCoins} coins · {nextBoat.label}
            </p>
          ) : null}
        </div>
      }
    >
      <div data-hud-pass className="h-full min-h-[50vh]" aria-hidden />
    </GameHudLayout>
  );
}
