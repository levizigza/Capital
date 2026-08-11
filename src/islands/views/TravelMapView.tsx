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
import {
  FORTUNE_ARCHIPELAGO_NAME,
  islandsForArchipelagoMap,
  islandsForSpineTravel,
  SIDE_SHORE_TRAVEL_IDS,
} from "../spineArchipelago";
import { hasCompletedCoveChange } from "../chapterLoop";
import { ArchipelagoMap3D } from "../world3d/ArchipelagoMap3D";
import { getIslandTheme } from "../themes/islandThemes";
import { islandLockHint } from "../progressGates";
import { moneyStructureForIsland } from "../moneyStructures";
import { pointerSafeActivate } from "../pointerSafeClick";

/** Compact structure label for the strip — Jar / Tower / Keep / Bank. */
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

  /** Strip = main course; side row appears after Cove Change (fun discovery). */
  const stripIslands = useMemo(() => islandsForSpineTravel(islands), [islands]);
  const mapIslands = useMemo(() => islandsForArchipelagoMap(islands), [islands]);
  const sideShoresOpen = hasCompletedCoveChange(save);
  const sideStrip = useMemo(() => {
    if (!sideShoresOpen) return [];
    const byId = new Map(islands.map((i) => [i.id, i]));
    return SIDE_SHORE_TRAVEL_IDS.map((id) => byId.get(id)).filter(
      (i): i is IslandDefinition => Boolean(i),
    );
  }, [islands, sideShoresOpen]);

  return (
    <GameHudLayout
      className="!bg-transparent"
      background={
        <div className="absolute inset-0">
          <ArchipelagoMap3D
            islands={mapIslands}
            save={save}
            currentId={currentId}
            onSelect={beginVoyage}
          />
        </div>
      }
      topLeft={
        <div data-testid="fortune-archipelago-chip">
          <HudChip
            title={FORTUNE_ARCHIPELAGO_NAME}
            subtitle={`${boat.emoji} ${boat.label} · 🪙 ${userProfile.totalCoins} · side shores on map`}
          />
        </div>
      }
      topRight={
        <GameButton variant="outline" size="sm" onClick={onBack} data-testid="travel-map-back">
          Harbor
        </GameButton>
      }
      bottom={
        <div className="flex w-full max-w-4xl flex-col items-center gap-2 px-3 pb-1">
          <div
            className="flex w-full gap-2 overflow-x-auto pb-1"
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
                  title={
                    lockWhy ??
                    (here
                      ? "You are here · Harbor"
                      : `Board carpet · ${island.name}`)
                  }
                  disabled={locked || here}
                  {...pointerSafeActivate(() => {
                    if (!locked && !here) beginVoyage(island.id);
                  })}
                  className={`shrink-0 touch-manipulation rounded-xl px-3 py-2 text-left text-xs font-bold shadow-md ring-1 transition ${
                    here
                      ? "bg-amber-200 text-amber-950 ring-amber-400"
                      : locked
                        ? "cursor-not-allowed bg-slate-800/55 text-white/40 ring-white/10 opacity-70"
                        : "bg-white/90 text-slate-900 ring-white/40 hover:bg-white"
                  }`}
                  style={{ borderLeft: `4px solid ${theme.accent}` }}
                  data-ghost={locked ? "1" : "0"}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="rounded bg-black/10 px-1 py-0.5 text-[9px] font-black uppercase tracking-wide opacity-80"
                      aria-hidden
                    >
                      {locked ? "···" : structurePinGlyph(island.id)}
                    </span>
                    <span>
                      {island.name}
                      {here ? " · here" : locked ? " · ghost" : ""}
                    </span>
                  </div>
                  {lockWhy ? (
                    <div className="mt-0.5 text-[10px] font-semibold opacity-80">{lockWhy}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
          {sideStrip.length > 0 ? (
            <div
              className="flex w-full gap-2 overflow-x-auto pb-1"
              data-testid="archipelago-side-shore-strip"
            >
              {sideStrip.map((island) => {
                const locked = isIslandLocked(island, save.inventory, save);
                const here = island.id === currentId;
                const theme = getIslandTheme(island.id, island.themeId);
                const lockWhy = locked ? islandLockHint(island, save) : null;
                return (
                  <button
                    key={island.id}
                    type="button"
                    data-testid={`side-shore-pin-${island.id}`}
                    data-locked={locked ? "1" : "0"}
                    title={lockWhy ?? `Side shore · ${island.name}`}
                    disabled={locked || here}
                    {...pointerSafeActivate(() => {
                      if (!locked && !here) beginVoyage(island.id);
                    })}
                    className={`shrink-0 touch-manipulation rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold shadow-md ring-1 transition ${
                      here
                        ? "bg-amber-200 text-amber-950 ring-amber-400"
                        : locked
                          ? "cursor-not-allowed bg-slate-800/45 text-white/35 ring-white/10"
                          : "bg-sky-100/95 text-slate-900 ring-sky-300/60 hover:bg-white"
                    }`}
                    style={{ borderLeft: `3px solid ${theme.accent}` }}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wide opacity-70">
                      Side
                    </span>{" "}
                    {island.name}
                    {here ? " · here" : ""}
                  </button>
                );
              })}
            </div>
          ) : (
            <p
              className="text-[10px] font-semibold text-white/60"
              data-testid="side-shores-locked-hint"
            >
              Era side shores wake after Coincraft Change — outer ring on the map.
            </p>
          )}
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
