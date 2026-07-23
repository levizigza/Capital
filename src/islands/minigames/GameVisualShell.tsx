import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MinigameVisualShell } from "../platform/gameCatalog";
import { useEraAwareShell, useEraLens } from "../EraLensContext";
import { eraCssVars, eraDimension } from "../eraMorph";
import { getEraLook3D } from "../world3d/eraLooks";
import { getAnimationStyle } from "../animationStyles";

const SHELL_CLASS: Record<MinigameVisualShell, string> = {
  arcade: "mg-shell-arcade",
  neon: "mg-shell-neon",
  notebook: "mg-shell-notebook",
  explore: "mg-shell-explore",
  retro: "mg-shell-retro",
  flat: "mg-shell-flat",
  broker: "mg-shell-broker",
};

export type GameVisualShellProps = {
  shell: MinigameVisualShell;
  title: string;
  icon?: string;
  complexity?: string;
  genre?: string;
  /** Safe pop-culture wink under the title */
  homage?: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

export function GameVisualShell({
  shell,
  title,
  icon,
  complexity,
  genre,
  homage,
  onClose,
  children,
  className,
}: GameVisualShellProps) {
  const resolvedShell = useEraAwareShell(shell);
  const eraId = useEraLens();
  const look = getEraLook3D(eraId);
  const era = getAnimationStyle(eraId);
  const dimension = eraDimension(eraId);
  return (
    <div
      className={cn("rounded-xl overflow-hidden", SHELL_CLASS[resolvedShell], "mg-era-lens", className)}
      style={eraCssVars(look) as CSSProperties}
      data-era={era.id}
      data-era-dimension={dimension}
      data-era-shading={look.shading}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-3 border-b",
          resolvedShell === "neon" ||
            resolvedShell === "explore" ||
            resolvedShell === "arcade" ||
            resolvedShell === "retro"
            ? "border-white/20 bg-black/30"
            : "border-black/10 bg-black/5",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon ? <span className="text-2xl shrink-0">{icon}</span> : null}
          <div className="min-w-0">
            <div className="font-black truncate">{title}</div>
            <div className="text-xs opacity-70 flex flex-wrap gap-x-2 gap-y-0.5">
              {eraId && era.id !== "capital-default" ? (
                <span className="era-badge font-bold not-italic opacity-95">{era.eraLabel}</span>
              ) : null}
              {homage ? <span className="italic opacity-90">{homage}</span> : null}
              {genre ? <span>{genre}</span> : null}
              {complexity ? <span>· {complexity}</span> : null}
            </div>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            data-testid="minigame-close"
            onClick={onClose}
            className="shrink-0 rounded-lg px-3 py-1 text-sm font-bold bg-black/20 hover:bg-black/30"
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
