import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

import type { GameToastItem, GameToastVariant, UiAspect, UiScale } from "./types";

type GameUiContextValue = {
  reducedMotion: boolean;
  highContrast: boolean;
  uiScale: UiScale;
  uiAspect: UiAspect;
  toasts: GameToastItem[];
  toast: (message: string, variant?: GameToastVariant, durationMs?: number) => void;
  dismissToast: (id: string) => void;
};

const GameUiContext = createContext<GameUiContextValue | null>(null);

export type GameUiProviderProps = {
  children: ReactNode;
  reducedMotion?: boolean;
  highContrast?: boolean;
  uiScale?: UiScale;
  uiAspect?: UiAspect;
};

export function GameUiProvider({
  children,
  reducedMotion = false,
  highContrast = false,
  uiScale = "standard",
  uiAspect = "standard",
}: GameUiProviderProps) {
  const [toasts, setToasts] = useState<GameToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: GameToastVariant = "info", durationMs = 3200) => {
      const id = uuidv4();
      setToasts((prev) => [...prev.slice(-4), { id, message, variant, durationMs }]);
      window.setTimeout(() => dismissToast(id), durationMs);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      reducedMotion,
      highContrast,
      uiScale,
      uiAspect,
      toasts,
      toast,
      dismissToast,
    }),
    [reducedMotion, highContrast, uiScale, uiAspect, toasts, toast, dismissToast]
  );

  return <GameUiContext.Provider value={value}>{children}</GameUiContext.Provider>;
}

export function useGameUi(): GameUiContextValue {
  const ctx = useContext(GameUiContext);
  if (!ctx) {
    throw new Error("useGameUi must be used within GameUiProvider");
  }
  return ctx;
}

export function useGameUiOptional(): GameUiContextValue | null {
  return useContext(GameUiContext);
}
