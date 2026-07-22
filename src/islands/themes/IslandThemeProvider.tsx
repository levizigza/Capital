import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { getIslandTheme, themeCssVars, type IslandTheme } from "./islandThemes";

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
  return (
    <div
      key={islandId}
      className={cn(theme.skinClass, "island-theme-enter", className)}
      style={themeCssVars(theme) as CSSProperties}
      data-island-theme={theme.id}
      data-animation-style={theme.animationStyle}
    >
      {children}
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
