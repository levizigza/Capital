/**
 * Ledger Bank landmark — Harbor plaza money machine (Astro spirit, Capital art).
 * Tall readable silhouette: dome, wings, stairs, brass vault heart.
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
  const dome = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (dial.current) dial.current.rotation.z = t * 0.35;
    if (doorGlow.current) {
      const mat = doorGlow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.85 : guided ? 0.5 : 0.28) + Math.sin(t * 2.8) * 0.08;
    }
    if (dome.current) {
      const mat = dome.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.08 + Math.sin(t * 1.2) * 0.04;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.15, 2.75, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#b45309"
          emissiveIntensity={active ? 0.5 : 0.2}
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>

      {/* Stepped plinth */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0.15]}>
        <boxGeometry args={[4.0, 0.24, 3.2]} />
        <meshStandardMaterial color="#78716c" roughness={0.88} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.28, 0.15]}>
        <boxGeometry args={[3.6, 0.16, 2.85]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.8} />
      </mesh>
      {/* Stairs to vault */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} castShadow receiveShadow position={[0, 0.12 + i * 0.12, 1.55 - i * 0.22]}>
          <boxGeometry args={[1.6 - i * 0.15, 0.12, 0.4]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.75} />
        </mesh>
      ))}

      {/* Main body */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[3.35, 2.6, 2.5]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.62} metalness={0.12} />
      </mesh>
      {/* Side wings — wider silhouette */}
      {([-2.0, 2.0] as const).map((x) => (
        <mesh key={x} castShadow position={[x, 1.15, -0.15]}>
          <boxGeometry args={[0.75, 1.8, 1.8]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
      ))}
      {/* Columns */}
      {([-1.25, 1.25] as const).map((x) => (
        <mesh key={x} position={[x, 1.55, 1.28]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 2.5, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.45} metalness={0.15} />
        </mesh>
      ))}
      {/* Pediment + cornice */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <boxGeometry args={[3.7, 0.32, 2.7]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.55} />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.55, 0.85, 4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} flatShading />
      </mesh>
      {/* Brass dome crown — tall hero read */}
      <mesh ref={dome} castShadow position={[0, 3.95, 0]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#b45309"
          emissiveIntensity={0.1}
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>
      <mesh castShadow position={[0, 4.45, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.45, 8]} />
        <meshStandardMaterial color="#fde68a" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Ledger window slits */}
      {([-0.85, 0.85] as const).map((x) => (
        <mesh key={x} position={[x, 2.15, 1.28]}>
          <boxGeometry args={[0.55, 0.7, 0.08]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.25} metalness={0.2} />
        </mesh>
      ))}

      {/* Brass vault door */}
      <mesh ref={doorGlow} position={[0, 1.25, 1.35]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.2, 28]} />
        <meshStandardMaterial
          color="#b45309"
          emissive="#f59e0b"
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.28}
        />
      </mesh>
      <mesh ref={dial} position={[0, 1.25, 1.48]}>
        <torusGeometry args={[0.4, 0.09, 8, 22]} />
        <meshStandardMaterial color="#fde68a" metalness={0.75} roughness={0.22} />
      </mesh>
      <mesh position={[0, 1.25, 1.5]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#78350f" metalness={0.55} />
      </mesh>

      <Billboard position={[0, 5.0, 0]} follow>
        <SafeText
          fontSize={0.32}
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
