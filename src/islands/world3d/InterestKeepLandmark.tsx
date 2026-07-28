/**
 * Interest Keep landmark — Credit Kingdom money machine (Astro spirit, Capital art).
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

export function InterestKeepLandmark({
  position,
  active = false,
  guided = false,
  label = "Interest Keep",
}: Props) {
  const spiral = useRef<THREE.Group>(null);
  const gateGlow = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (spiral.current) spiral.current.rotation.y = t * 0.55;
    if (gateGlow.current) {
      const mat = gateGlow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.85 : guided ? 0.5 : 0.28) + Math.sin(t * 3.0) * 0.08;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[2.0, 2.55, 28]} />
        <meshStandardMaterial
          color="#f87171"
          emissive="#b91c1c"
          emissiveIntensity={active ? 0.42 : 0.16}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* Keep walls */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[2.8, 3.2, 2.6]} />
        <meshStandardMaterial color="#64748b" roughness={0.75} metalness={0.12} />
      </mesh>
      {/* Corner turrets */}
      {(
        [
          [-1.15, -1.05],
          [1.15, -1.05],
          [-1.15, 1.05],
          [1.15, 1.05],
        ] as const
      ).map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 2.0, z]} castShadow>
          <cylinderGeometry args={[0.32, 0.36, 3.6, 10]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
      ))}
      {/* Battlement cap */}
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[3.1, 0.4, 2.9]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Interest spiral — creative enter */}
      <group ref={spiral} position={[0, 1.35, 1.35]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[Math.cos(i) * 0.25, i * 0.22 - 0.3, Math.sin(i) * 0.25]}
            rotation={[0.4, i * 0.7, 0]}
          >
            <torusGeometry args={[0.42 - i * 0.05, 0.07, 8, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.45}
              metalness={0.55}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
      <mesh ref={gateGlow} position={[0, 0.55, 1.55]} castShadow>
        <boxGeometry args={[1.35, 1.5, 0.18]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#dc2626"
          emissiveIntensity={0.4}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      <Billboard position={[0, 4.2, 0]} follow>
        <Text
          fontSize={0.28}
          color="#fff1f2"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#450a0a"
        >
          {active ? "Enter · interest spiral" : label}
        </Text>
      </Billboard>
    </group>
  );
}
