/**
 * Giant Coin Jar landmark — Coin organ silhouette.
 * After irreversible Take (hush), the jar dims — shore remembers before Harbor does.
 * Take cinema phases: hush → mark flash → lid settle.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";
import { cinemaFlashAmp } from "../a11yMotion";
import * as THREE from "three";

type CinemaPhase = "hush" | "mark" | "line";

type Props = {
  position: [number, number, number];
  active?: boolean;
  guided?: boolean;
  label?: string;
  /** Quiet after the Take — diegetic hush on the Coin organ */
  hushActive?: boolean;
  /** World-cinema beat — mark flash / lid settle */
  cinemaPhase?: CinemaPhase | null;
};

export function CoinJarLandmark({
  position,
  active = false,
  guided = false,
  label = "Giant Coin Jar",
  hushActive = false,
  cinemaPhase = null,
}: Props) {
  const glow = useRef<THREE.Mesh>(null);
  const lid = useRef<THREE.Group>(null);
  const pile = useRef<THREE.Mesh>(null);
  const scar = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mark = cinemaPhase === "mark";
    const settle = cinemaPhase === "line" || (hushActive && !cinemaPhase);
    const flash = cinemaFlashAmp(); // 0 under reduced motion — no blinding strobe

    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      if (mark) {
        // Irreversible punch — brighter than Soft Beat so the combine reads in-world.
        mat.emissiveIntensity = 0.75 + flash * (0.55 + Math.sin(t * 11) * 0.3);
      } else if (hushActive) {
        const base = settle ? 0.1 : 0.12;
        mat.emissiveIntensity = base + Math.sin(t * 1.1) * 0.03 * Math.max(flash, 0.35);
      } else {
        const base = active ? 0.85 : guided ? 0.55 : 0.28;
        mat.emissiveIntensity = base + Math.sin(t * 3) * 0.08 * Math.max(flash, 0.35);
      }
    }
    if (lid.current) {
      if (mark) {
        lid.current.rotation.y = Math.sin(t * 7) * 0.06 * flash;
        lid.current.position.y = 3.26 + Math.sin(t * 9) * 0.035 * flash;
      } else if (settle || hushActive) {
        const speed = settle ? 0.08 : 0.2;
        lid.current.rotation.y = Math.sin(t * speed) * (settle ? 0.008 : 0.02);
        lid.current.position.y = 3.32 + Math.sin(t * (settle ? 0.25 : 0.4)) * (settle ? 0.004 : 0.01);
      } else {
        lid.current.rotation.y = Math.sin(t * 0.6) * 0.08;
        lid.current.position.y = 3.35 + Math.sin(t * 1.2) * 0.04;
      }
    }
    if (pile.current) {
      const mat = pile.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = mark ? 0.35 + 0.2 * flash : hushActive ? 0.08 : 0.35;
    }
    if (scar.current) {
      const mat = scar.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = mark
        ? 0.45 + flash * (0.4 + Math.sin(t * 12) * 0.2)
        : hushActive
          ? 0.25
          : 0;
      mat.opacity = mark ? 0.85 + 0.1 * flash : hushActive ? 0.7 : 0;
    }
  });

  return (
    <group position={position}>
      {/* Ground ring — amber warm, or slate hush after Take */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.2, 2.8, 32]} />
        <meshStandardMaterial
          color={hushActive ? "#64748b" : "#fbbf24"}
          emissive={hushActive ? (cinemaPhase === "mark" ? "#b45309" : "#334155") : "#f59e0b"}
          emissiveIntensity={
            cinemaPhase === "mark" ? 0.55 : hushActive ? 0.08 : active ? 0.5 : 0.22
          }
          transparent
          opacity={hushActive ? 0.55 : 0.75}
          depthWrite={false}
        />
      </mesh>

      {/* Scar tick on the ground when hush — irreversible mark */}
      {hushActive ? (
        <mesh ref={scar} rotation={[-Math.PI / 2, 0, 0.4]} position={[0.9, 0.08, 0.6]}>
          <planeGeometry args={[1.4, 0.12]} />
          <meshStandardMaterial
            color="#78350f"
            emissive="#92400e"
            emissiveIntensity={0.25}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Jar body */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[1.55, 1.85, 3.0, 28]} />
        <meshStandardMaterial
          color={hushActive ? "#94a3b8" : "#7dd3fc"}
          transparent
          opacity={hushActive ? 0.4 : 0.55}
          roughness={0.25}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[1.45, 1.75, 2.9, 28]} />
        <meshStandardMaterial
          color="#0c4a6e"
          roughness={0.6}
          metalness={0.05}
          transparent
          opacity={hushActive ? 0.5 : 0.35}
        />
      </mesh>

      {/* Coins pile inside */}
      <mesh ref={pile} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.7, 16]} />
        <meshStandardMaterial
          color={hushActive ? "#a8a29e" : "#fbbf24"}
          emissive={hushActive ? "#57534e" : "#f59e0b"}
          emissiveIntensity={hushActive ? 0.08 : 0.35}
          metalness={0.4}
        />
      </mesh>

      {/* Coin slot mouth */}
      <mesh ref={glow} position={[0, 1.7, 1.55]} castShadow>
        <boxGeometry args={[1.15, 0.22, 0.35]} />
        <meshStandardMaterial
          color={hushActive ? "#cbd5e1" : "#fef08a"}
          emissive={hushActive ? "#64748b" : "#facc15"}
          emissiveIntensity={hushActive ? 0.15 : 0.6}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 1.7, 1.72]}>
        <boxGeometry args={[0.95, 0.08, 0.12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Cork / lid */}
      <group ref={lid} position={[0, 3.35, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.25, 1.35, 0.45, 24]} />
          <meshStandardMaterial color={hushActive ? "#78716c" : "#b45309"} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.5, 12]} />
          <meshStandardMaterial color={hushActive ? "#57534e" : "#92400e"} />
        </mesh>
      </group>

      <Billboard position={[0, 4.4, 0]} follow>
        <SafeText
          fontSize={0.32}
          color={hushActive ? "#e2e8f0" : "#fffbeb"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          {cinemaPhase === "mark"
            ? "The mark holds"
            : hushActive
              ? "Quiet after the Take"
              : active
                ? "Enter · coin slot"
                : label}
        </SafeText>
      </Billboard>
    </group>
  );
}
