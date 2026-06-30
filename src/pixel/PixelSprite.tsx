import { cn } from "@/lib/utils";

import { PixelCanvas } from "./PixelCanvas";
import { usePixelAnimation } from "./usePixelAnimation";
import type { LoadedPixelAtlas } from "./types";

export type PixelSpriteProps = {
  atlas: LoadedPixelAtlas;
  animation?: string;
  playing?: boolean;
  integerScale?: number;
  className?: string;
  showGrid?: boolean;
  label?: string;
};

export function PixelSprite({
  atlas,
  animation,
  playing = true,
  integerScale,
  className,
  showGrid = false,
  label,
}: PixelSpriteProps) {
  const state = usePixelAnimation(atlas, animation, playing);

  if (!state) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        No animation &quot;{animation ?? atlas.defaultAnimation}&quot;
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <PixelCanvas
        atlas={atlas}
        frameKey={state.frameKey}
        integerScale={integerScale}
        showGrid={showGrid}
        className="min-h-[8rem] w-full max-w-xs rounded-lg border-2 border-[rgb(45_74_111/0.2)] bg-[#c5e8f7]"
      />
      {label ? (
        <span className="text-xs font-medium text-gray-600">{label}</span>
      ) : null}
    </div>
  );
}
