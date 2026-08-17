/**
 * Soft Beat crown — readable from shore distance before you enter the jar/tower/keep.
 * Interior SoftBeatBeacon stays the pad climax; this is the approach beacon.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "../a11yMotion";

type Props = {
  /** World Y above landmark origin */
  y?: number;
  accent?: string;
  /** After Take hush, dim the invitation */
  hushActive?: boolean;
};

export function ShoreSoftBeatBeacon({
  y = 4.55,
  accent = "#fbbf24",
  hushActive = false,
}: Props) {
  const crown = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const reduced = prefersReducedMotion();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (crown.current) {
      const mat = crown.current.material as THREE.MeshStandardMaterial;
      const pulse = hushActive ? 0.12 : reduced ? 0.35 : 0.42 + Math.sin(t * 2.1) * 0.12;
      mat.emissiveIntensity = pulse;
      crown.current.position.y = y + (hushActive || reduced ? 0 : Math.sin(t * 2.2) * 0.08);
    }
    if (ring.current) {
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.opacity = hushActive ? 0.25 : reduced ? 0.45 : 0.55 + Math.sin(t * 1.8) * 0.08;
      ring.current.rotation.z = t * (hushActive ? 0.15 : 0.55);
    }
  });

  return (
    <group data-testid="shore-soft-beat-beacon">
      <mesh ref={crown} position={[0, y, 0]} castShadow>
        <coneGeometry args={[0.28, 0.55, 5]} />
        <meshStandardMaterial
          color={hushActive ? "#94a3b8" : accent}
          emissive={hushActive ? "#64748b" : accent}
          emissiveIntensity={hushActive ? 0.12 : 0.4}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, y - 0.15, 0]}>
        <ringGeometry args={[0.32, 0.48, 24]} />
        <meshBasicMaterial
          color={hushActive ? "#64748b" : accent}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
