import { createContext, useContext, type ReactNode } from "react";
import type { AnimationStyleId } from "./animationStyles";
import { shellForEra } from "./eraMorph";
import type { MinigameVisualShell } from "./platform/gameCatalog";

const EraLensContext = createContext<AnimationStyleId | string | undefined>(undefined);

/** Provides the active island decade lens to minigames / HUD chrome. */
export function EraLensProvider({
  animationStyle,
  children,
}: {
  animationStyle?: AnimationStyleId | string;
  children: ReactNode;
}) {
  return <EraLensContext.Provider value={animationStyle}>{children}</EraLensContext.Provider>;
}

export function useEraLens(): AnimationStyleId | string | undefined {
  return useContext(EraLensContext);
}

/** Prefer the island decade shell so every minigame shares the docked era look. */
export function useEraAwareShell(fallback: MinigameVisualShell): MinigameVisualShell {
  const era = useEraLens();
  if (!era) return fallback;
  return shellForEra(era);
}
