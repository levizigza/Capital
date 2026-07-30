/**
 * Ledger Bank landmark — Harbor plaza money machine (Astro spirit, Capital art).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { SafeText } from "./SafeText";

type Props = {
  position: [number, number, number];
  active?: boolean;
  guided?: boolean;
  label?: string;
};

export function LedgerBankLandmark({
  position,
  active = false,
  guided = false,
  label = "Ledger Bank",
}: Props) {
  const dial = useRef<THREE.Mesh>(null);
  const doorGlow = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (dial.current) dial.current.rotation.z = t * 0.35;
    if (doorGlow.current) {
      const mat = doorGlow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.75 : guided ? 0.45 : 0.22) + Math.sin(t * 2.8) * 0.06;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[2.0, 2.55, 28]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#b45309"
          emissiveIntensity={active ? 0.45 : 0.18}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* Stone bank body */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[3.2, 2.8, 2.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* Columns */}
      {([-1.2, 1.2] as const).map((x) => (
        <mesh key={x} position={[x, 1.5, 1.15]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 2.6, 10]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.55} />
        </mesh>
      ))}
      {/* Pediment */}
      <mesh position={[0, 3.05, 0]} castShadow>
        <boxGeometry args={[3.4, 0.35, 2.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Brass vault door — creative enter */}
      <mesh ref={doorGlow} position={[0, 1.15, 1.28]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.18, 24]} />
        <meshStandardMaterial
          color="#b45309"
          emissive="#f59e0b"
          emissiveIntensity={0.35}
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={dial} position={[0, 1.15, 1.4]}>
        <torusGeometry args={[0.38, 0.08, 8, 20]} />
        <meshStandardMaterial color="#fde68a" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.15, 1.42]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#78350f" metalness={0.5} />
      </mesh>

      <Billboard position={[0, 3.7, 0]} follow>
        <SafeText
          fontSize={0.3}
          color="#fffbeb"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#0f172a"
        >
          {active ? "Enter · vault door" : label}
        </SafeText>
      </Billboard>
    </group>
  );
}
