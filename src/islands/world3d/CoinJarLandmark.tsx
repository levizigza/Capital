/**
 * Giant Coin Jar landmark — Coin organ silhouette.
 * After irreversible Take (hush), the jar dims — shore remembers before Harbor does.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";
import * as THREE from "three";

type Props = {
  position: [number, number, number];
  active?: boolean;
  guided?: boolean;
  label?: string;
  /** Quiet after the Take — diegetic hush on the Coin organ */
  hushActive?: boolean;
};

export function CoinJarLandmark({
  position,
  active = false,
  guided = false,
  label = "Giant Coin Jar",
  hushActive = false,
}: Props) {
  const glow = useRef<THREE.Mesh>(null);
  const lid = useRef<THREE.Group>(null);
  const pile = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      const base = hushActive ? 0.12 : active ? 0.85 : guided ? 0.55 : 0.28;
      mat.emissiveIntensity = base + Math.sin(t * (hushActive ? 1.1 : 3)) * (hushActive ? 0.03 : 0.08);
    }
    if (lid.current) {
      const speed = hushActive ? 0.2 : 0.6;
      lid.current.rotation.y = Math.sin(t * speed) * (hushActive ? 0.02 : 0.08);
      lid.current.position.y = 3.35 + Math.sin(t * (hushActive ? 0.4 : 1.2)) * (hushActive ? 0.01 : 0.04);
    }
    if (pile.current) {
      const mat = pile.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = hushActive ? 0.08 : 0.35;
    }
  });

  return (
    <group position={position}>
      {/* Ground ring — amber warm, or slate hush after Take */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.2, 2.8, 32]} />
        <meshStandardMaterial
          color={hushActive ? "#64748b" : "#fbbf24"}
          emissive={hushActive ? "#334155" : "#f59e0b"}
          emissiveIntensity={hushActive ? 0.08 : active ? 0.5 : 0.22}
          transparent
          opacity={hushActive ? 0.55 : 0.75}
          depthWrite={false}
        />
      </mesh>

      {/* Scar tick on the ground when hush — irreversible mark */}
      {hushActive ? (
        <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[0.9, 0.08, 0.6]}>
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
          {hushActive ? "Quiet after the Take" : active ? "Enter · coin slot" : label}
        </SafeText>
      </Billboard>
    </group>
  );
}
