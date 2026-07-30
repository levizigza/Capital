/**
 * Giant Coin Jar landmark — playful low-poly shore prop (Astro spirit, Capital art).
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
};

export function CoinJarLandmark({
  position,
  active = false,
  guided = false,
  label = "Giant Coin Jar",
}: Props) {
  const glow = useRef<THREE.Mesh>(null);
  const lid = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.85 : guided ? 0.55 : 0.28) + Math.sin(t * 3) * 0.08;
    }
    if (lid.current) {
      lid.current.rotation.y = Math.sin(t * 0.6) * 0.08;
      lid.current.position.y = 3.35 + Math.sin(t * 1.2) * 0.04;
    }
  });

  return (
    <group position={position}>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.2, 2.8, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={active ? 0.5 : 0.22}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>

      {/* Jar body */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[1.55, 1.85, 3.0, 28]} />
        <meshStandardMaterial
          color="#7dd3fc"
          transparent
          opacity={0.55}
          roughness={0.25}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[1.45, 1.75, 2.9, 28]} />
        <meshStandardMaterial color="#0c4a6e" roughness={0.6} metalness={0.05} transparent opacity={0.35} />
      </mesh>

      {/* Coins pile inside (hint) */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.7, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.35} metalness={0.4} />
      </mesh>

      {/* Coin slot mouth — the creative enter */}
      <mesh ref={glow} position={[0, 1.7, 1.55]} castShadow>
        <boxGeometry args={[1.15, 0.22, 0.35]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#facc15"
          emissiveIntensity={0.6}
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
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.5, 12]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      </group>

      <Billboard position={[0, 4.4, 0]} follow>
        <SafeText
          fontSize={0.32}
          color="#fffbeb"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          {active ? "Enter · coin slot" : label}
        </SafeText>
      </Billboard>
    </group>
  );
}
