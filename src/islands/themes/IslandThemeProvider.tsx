import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { getIslandTheme, themeCssVars, type IslandTheme } from "./islandThemes";
import { eraCssVars, eraDimension } from "../eraMorph";
import { getEraLook3D } from "../world3d/eraLooks";
import { EraLensProvider } from "../EraLensContext";

export type IslandThemeProviderProps = {
  islandId: string;
  themeId?: string;
  children: ReactNode;
  className?: string;
};

export function IslandThemeProvider({
  islandId,
  themeId,
  children,
  className,
}: IslandThemeProviderProps) {
  const theme = getIslandTheme(islandId, themeId);
  const look = getEraLook3D(theme.animationStyle);
  const dimension = eraDimension(theme.animationStyle);
  return (
    <div
      key={islandId}
      className={cn(theme.skinClass, "island-theme-enter", className)}
      style={{ ...themeCssVars(theme), ...eraCssVars(look) } as CSSProperties}
      data-island-theme={theme.id}
      data-animation-style={theme.animationStyle}
      data-era-dimension={dimension}
      data-era-shading={look.shading}
    >
      <EraLensProvider animationStyle={theme.animationStyle}>{children}</EraLensProvider>
    </div>
  );
}

export function IslandThemedBackground({
  theme,
  children,
}: {
  theme: IslandTheme;
  children?: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: theme.background }}
      aria-hidden
    >
      {children}
    </div>
  );
}
