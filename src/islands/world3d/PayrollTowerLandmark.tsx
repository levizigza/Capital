/**
 * Payroll Tower landmark — Paycheck Peninsula money machine (Astro spirit, Capital art).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  position: [number, number, number];
  active?: boolean;
  guided?: boolean;
  label?: string;
};

export function PayrollTowerLandmark({
  position,
  active = false,
  guided = false,
  label = "Payroll Tower",
}: Props) {
  const chute = useRef<THREE.Mesh>(null);
  const clockHand = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (chute.current) {
      const mat = chute.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.8 : guided ? 0.5 : 0.25) + Math.sin(t * 3.2) * 0.08;
    }
    if (clockHand.current) {
      clockHand.current.rotation.z = -t * 0.8;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.9, 2.45, 28]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={active ? 0.45 : 0.18}
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </mesh>

      {/* Tower shaft */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[2.2, 4.2, 2.0]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.45} metalness={0.15} />
      </mesh>
      {/* Window bands */}
      {[0.6, 1.6, 2.6, 3.6].map((y) => (
        <mesh key={y} position={[0, y, 1.05]}>
          <boxGeometry args={[1.6, 0.35, 0.08]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#7dd3fc"
            emissiveIntensity={0.35}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      {/* Roof cap */}
      <mesh position={[0, 4.55, 0]} castShadow>
        <boxGeometry args={[2.5, 0.35, 2.3]} />
        <meshStandardMaterial color="#0369a1" />
      </mesh>

      {/* Paycheck chute — creative enter */}
      <mesh ref={chute} position={[0, 1.1, 1.2]} rotation={[0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.75, 1.8, 16]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fbbf24"
          emissiveIntensity={0.4}
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.35, 1.85]}>
        <boxGeometry args={[1.1, 0.15, 0.55]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Decorative time clock on facade */}
      <mesh position={[0, 3.5, 1.12]}>
        <circleGeometry args={[0.35, 20]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh ref={clockHand} position={[0, 3.5, 1.14]}>
        <boxGeometry args={[0.04, 0.28, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <Billboard position={[0, 5.3, 0]} follow>
        <Text
          fontSize={0.28}
          color="#ecfeff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#0c4a6e"
        >
          {active ? "Enter · paycheck chute" : label}
        </Text>
      </Billboard>
    </group>
  );
}
