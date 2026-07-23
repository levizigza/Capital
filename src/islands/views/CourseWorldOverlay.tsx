/**
 * Painting dive — SM64 warp into a self-contained 3D course world.
 * Unmounts the shore plaza (single Canvas rule) while you're inside.
 */

import { useEffect } from "react";
import type { CapitalCharacter } from "../character";
import type { IslandDefinition } from "../types";
import { PartyArenaWorld } from "../world3d/PartyArenaWorld";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle } from "../animationStyles";
import { isMainCoursePainting } from "../mainCourse";

export type CourseWorldOverlayProps = {
  island: IslandDefinition;
  character?: CapitalCharacter | null;
  minigameId: string;
  title?: string;
  onComplete: (success: boolean, score: number) => void;
  onExit: () => void;
};

export function CourseWorldOverlay({
  island,
  character,
  minigameId,
  title,
  onComplete,
  onExit,
}: CourseWorldOverlayProps) {
  const theme = getIslandTheme(island.id, island.themeId);
  const era = getAnimationStyle(theme.animationStyle);
  const main = isMainCoursePainting(minigameId);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#0c1622]"
      data-testid="course-world-overlay"
      data-main-course={main ? "1" : "0"}
      data-minigame={minigameId}
    >
      {/* Dive flash */}
      <div className="pointer-events-none absolute inset-0 z-10 animate-[povv-fade-in_0.45s_ease] bg-gradient-to-b from-amber-200/30 to-transparent" />

      <PartyArenaWorld
        island={island}
        character={character}
        title={title ?? (main ? `Main Course · ${island.name}` : `Side world · ${island.name}`)}
        durationSec={main ? 55 : 45}
        goalCoins={main ? 8 : 6}
        onComplete={onComplete}
        onExit={onExit}
      />

      <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
        {main ? "Main course painting" : "Optional tomfoolery"} · {era.eraLabel}
      </div>
    </div>
  );
}
