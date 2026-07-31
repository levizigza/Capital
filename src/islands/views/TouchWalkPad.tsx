/**
 * On-screen walk pad for phone cold-play — left stick for Harbor / shores.
 * Hidden on fine pointers (mouse/trackpad) unless forced.
 */

import { useEffect, useRef, useState } from "react";
import { clearTouchWalkIntent, setTouchWalkIntent } from "../input/walkIntent";

type Props = {
  enabled?: boolean;
  /** Force show (tests / a11y). Default: coarse pointer only. */
  forceShow?: boolean;
};

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return coarse;
}

export function TouchWalkPad({ enabled = true, forceShow = false }: Props) {
  const coarse = useCoarsePointer();
  const show = enabled && (forceShow || coarse);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!show) clearTouchWalkIntent();
    return () => clearTouchWalkIntent();
  }, [show]);

  if (!show) return null;

  const applyVector = (dx: number, dy: number) => {
    const max = 42;
    const len = Math.hypot(dx, dy);
    const scale = len > max ? max / len : 1;
    const x = dx * scale;
    const y = dy * scale;
    setKnob({ x, y });
    const dead = 10;
    setTouchWalkIntent({
      f: y < -dead,
      b: y > dead,
      l: x < -dead,
      r: x > dead,
    });
  };

  const end = () => {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    clearTouchWalkIntent();
  };

  return (
    <div
      className="pointer-events-auto absolute bottom-20 left-3 z-[25] select-none touch-none sm:bottom-24 sm:left-5"
      data-testid="touch-walk-pad"
      aria-label="Walk pad"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        origin.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        applyVector(e.clientX - origin.current.x, e.clientY - origin.current.y);
      }}
      onPointerMove={(e) => {
        if (!origin.current) return;
        applyVector(e.clientX - origin.current.x, e.clientY - origin.current.y);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="relative h-28 w-28 rounded-full border border-white/35 bg-black/40 shadow-lg backdrop-blur-[2px]">
        <div
          className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 shadow"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
        <p className="pointer-events-none absolute inset-x-0 -bottom-5 text-center text-[10px] font-semibold text-white/70">
          Walk
        </p>
      </div>
    </div>
  );
}
