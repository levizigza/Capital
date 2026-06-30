import { useEffect, useMemo, useState } from "react";

import type { LoadedPixelAtlas, PixelAnimation } from "./types";

export type PixelAnimationState = {
  animationName: string;
  frameIndex: number;
  frameKey: string;
  playing: boolean;
};

export function getAnimation(
  atlas: LoadedPixelAtlas,
  name?: string
): { name: string; def: PixelAnimation } | undefined {
  const animName = name ?? atlas.defaultAnimation;
  const def = atlas.animations[animName];
  if (!def) return undefined;
  return { name: animName, def };
}

export function usePixelAnimation(
  atlas: LoadedPixelAtlas | undefined,
  animationName?: string,
  playing = true
): PixelAnimationState | null {
  const anim = useMemo(
    () => (atlas ? getAnimation(atlas, animationName) : undefined),
    [atlas, animationName]
  );

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
  }, [atlas?.id, anim?.name]);

  useEffect(() => {
    if (!anim || !playing) return;

    const frameKeys = anim.def.frames;
    const currentKey = frameKeys[frameIndex] ?? frameKeys[0];
    const frame = currentKey ? atlas?.frames[currentKey] : undefined;
    const durationMs = frame?.durationMs ?? 1000 / anim.def.fps;

    const timer = window.setTimeout(() => {
      setFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= frameKeys.length) {
          return anim.def.loop ? 0 : prev;
        }
        return next;
      });
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [anim, atlas?.frames, frameIndex, playing]);

  if (!atlas || !anim) return null;

  const frameKey = anim.def.frames[frameIndex] ?? anim.def.frames[0];
  return {
    animationName: anim.name,
    frameIndex,
    frameKey,
    playing,
  };
}
