import { useCallback, useMemo, useRef } from "react";

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
import { hasCompletedCoveChange } from "../chapterLoop";

/** Compact structure label for the spine strip. */
function structurePinGlyph(islandId: string): string {
  const theme = moneyStructureForIsland(islandId)?.theme;
  if (theme === "jar") return "Jar";
  if (theme === "tower") return "Tower";
  if (theme === "keep") return "Keep";
  if (theme === "bank") return "Bank";
  return "Shore";
}

/** Readable strip chevron — replaces browser scrollbar triangles. */
function StripChevron({ dir }: { dir: "prev" | "next" }) {
  const mirror = dir === "prev";
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
      className={mirror ? "-scale-x-100" : undefined}
    >
      <path
        d="M6.2 3.2 12.4 9 6.2 14.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
 * Map owns names + geometry for every island; HUD is brand + spine strip only.
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
  const stripRef = useRef<HTMLDivElement>(null);

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
  const freeRoamOpen = hasCompletedCoveChange(save);

  const scrollStrip = useCallback((dir: "prev" | "next") => {
    const el = stripRef.current;
    if (!el) return;
    const step = Math.max(140, el.clientWidth * 0.55);
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  }, []);

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
        <GameButton
          variant="outline"
          size="sm"
          onClick={onBack}
          data-testid="travel-map-back"
          className="mr-12"
        >
          Harbor
        </GameButton>
      }
      bottom={
        <div className="relative z-30 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-3 pb-2">
          <div
            className="flex w-full items-center gap-2"
            data-testid="archipelago-island-strip-row"
          >
            <button
              type="button"
              data-testid="archipelago-strip-prev"
              aria-label="Scroll spine strip left"
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-slate-950/70 text-amber-100 ring-1 ring-white/25 transition hover:bg-slate-900/90 hover:ring-amber-200/50"
              onClick={() => scrollStrip("prev")}
            >
              <StripChevron dir="prev" />
            </button>
            <div
              ref={stripRef}
              className="flex min-w-0 flex-1 justify-start gap-2 overflow-x-auto scroll-smooth pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    {locked && lockWhy ? (
                      <span className="mt-0.5 block max-w-[9.5rem] text-[8px] font-semibold leading-snug opacity-80 normal-case tracking-normal">
                        {lockWhy}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              data-testid="archipelago-strip-next"
              aria-label="Scroll spine strip right"
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-slate-950/70 text-amber-100 ring-1 ring-white/25 transition hover:bg-slate-900/90 hover:ring-amber-200/50"
              onClick={() => scrollStrip("next")}
            >
              <StripChevron dir="next" />
            </button>
          </div>
          <InputPromptHint action="cancel" className="justify-center text-white/70">
            Spine voyage · Esc Harbor
          </InputPromptHint>
          {freeRoamOpen ? (
            <p
              className="max-w-md text-center text-[10px] font-medium text-sky-100/75"
              data-testid="travel-free-roam-whisper"
            >
              Free roam · side shores whisper — stray, choose, leave footprints; spine stays Cove → Paycheck → Credit
            </p>
          ) : (
            <p className="max-w-md text-center text-[10px] font-medium text-white/45">
              Finish Cove Change — then the outer ring opens for free stray
            </p>
          )}
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
