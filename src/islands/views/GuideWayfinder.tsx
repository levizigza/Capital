/**
 * Soft wayfinder — only nudges when the next step is off-screen.
 * No permanent center arrow (keeps visual rhythm clean).
 */

import { useRef, useState, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type GuideProjection = {
  /** NDC x (-1..1) */
  x: number;
  /** NDC y (-1..1) */
  y: number;
  /** True when target is behind the camera or far outside frame */
  offscreen: boolean;
  /** Angle in radians for edge chevron (atan2) */
  angle: number;
};

/** Inside Canvas — projects world lookAt into NDC for the HUD edge cue. */
export function GuideProjector({
  lookAt,
  enabled,
  onProject,
}: {
  lookAt: [number, number, number] | null;
  enabled: boolean;
  onProject: (p: GuideProjection | null) => void;
}) {
  const { camera } = useThree();
  const tmp = useRef(new THREE.Vector3());
  const last = useRef({ x: 0, y: 0, off: false, t: 0 });

  useFrame((_, dt) => {
    last.current.t += dt;
    if (!enabled || !lookAt) {
      if (last.current.off || last.current.x !== 0) {
        last.current = { x: 0, y: 0, off: false, t: 0 };
        onProject(null);
      }
      return;
    }
    // Throttle HUD updates ~12fps
    if (last.current.t < 0.08) return;
    last.current.t = 0;

    const v = tmp.current.set(lookAt[0], lookAt[1] + 0.6, lookAt[2]).project(camera);
    const margin = 0.78;
    const behind = v.z > 1;
    const offscreen = behind || Math.abs(v.x) > margin || Math.abs(v.y) > margin;
    const angle = Math.atan2(v.y, v.x);
    const next = { x: v.x, y: v.y, off: offscreen };
    if (
      Math.abs(next.x - last.current.x) < 0.04 &&
      Math.abs(next.y - last.current.y) < 0.04 &&
      next.off === last.current.off
    ) {
      return;
    }
    last.current = { ...next, t: 0 };
    onProject({ x: v.x, y: v.y, offscreen, angle });
  });

  return null;
}

/**
 * Minimal edge chevron — only when the goal is off-screen.
 * Sits in the HUD layer; never a center-screen sticker.
 */
export function GuideEdgeCue({
  projection,
  enabled,
  label,
}: {
  projection: GuideProjection | null;
  enabled: boolean;
  label?: string;
}) {
  if (!enabled || !projection?.offscreen) return null;

  // Place chevron on the ellipse of the viewport edge
  const ang = projection.angle;
  const rx = 42; // % from center
  const ry = 36;
  const left = 50 + Math.cos(ang) * rx;
  const top = 50 - Math.sin(ang) * ry;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] overflow-hidden"
      data-testid="guide-edge-cue"
      aria-hidden
    >
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          transform: `translate(-50%, -50%) rotate(${(-ang * 180) / Math.PI + 90}deg)`,
        }}
      >
        <div
          className="h-0 w-0 border-l-[10px] border-r-[10px] border-b-[16px] border-l-transparent border-r-transparent border-b-amber-300/90 drop-shadow"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}
        />
        {label ? (
          <div
            className="mt-1 max-w-[7rem] truncate rounded-full bg-black/50 px-2 py-0.5 text-center text-[9px] font-semibold text-amber-100"
            style={{ transform: `rotate(${(ang * 180) / Math.PI - 90}deg)` }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Optional helper for parents that keep lookAt in a ref (arenas). */
export function guideLookAtFromRef(
  ref: MutableRefObject<[number, number, number] | null>,
): [number, number, number] | null {
  return ref.current;
}

export function useThrottledGuideProjection() {
  const [projection, setProjection] = useState<GuideProjection | null>(null);
  return { projection, setProjection };
}
