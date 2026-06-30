import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { animateUniform } from "./postFxRenderer";

export type FxContextValue = {
  /** 0–1 dissolve amount driven by overlay each frame */
  dissolve: number;
  dissolveDir: [number, number];
  setDissolve: (v: number) => void;
  /** Play fog wipe: peak at midpoint callback, then reveal */
  playAreaTransition: (onMidpoint: () => void | Promise<void>) => Promise<void>;
  reducedMotion: boolean;
  webglSupported: boolean;
  setWebglSupported: (v: boolean) => void;
};

const FxContext = createContext<FxContextValue | null>(null);

export function useFx(): FxContextValue {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error("useFx must be used within FxProvider");
  return ctx;
}

export function useFxOptional(): FxContextValue | null {
  return useContext(FxContext);
}

type FxProviderProps = {
  children: ReactNode;
  reducedMotion?: boolean;
};

export function FxProvider({ children, reducedMotion = false }: FxProviderProps) {
  const [dissolve, setDissolve] = useState(0);
  const [dissolveDir, setDissolveDir] = useState<[number, number]>([1, 0.3]);
  const [webglSupported, setWebglSupported] = useState(true);
  const transitioning = useRef(false);

  const playAreaTransition = useCallback(
    async (onMidpoint: () => void | Promise<void>) => {
      if (transitioning.current) return;
      transitioning.current = true;

      setDissolveDir([
        0.8 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.6,
      ]);

      if (reducedMotion) {
        await onMidpoint();
        transitioning.current = false;
        return;
      }

      const halfMs = 280;
      await animateUniform(0, 1, halfMs, setDissolve);
      await onMidpoint();
      await animateUniform(1, 0, halfMs, setDissolve);

      transitioning.current = false;
    },
    [reducedMotion],
  );

  const value = useMemo<FxContextValue>(
    () => ({
      dissolve,
      dissolveDir,
      setDissolve,
      playAreaTransition,
      reducedMotion,
      webglSupported,
      setWebglSupported,
    }),
    [dissolve, dissolveDir, playAreaTransition, reducedMotion, webglSupported],
  );

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}
