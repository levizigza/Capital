/**
 * Cove Coin Jar — glass ribs · cork · coin piles · slot mouth.
 * Soundtrack cue unchanged: solarpunk_cove (Coin Jar Morning).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";

function FloatingCoin({
  position,
  phase,
}: {
  position: [number, number, number];
  phase: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.elapsedTime * 1.4 + phase;
    mesh.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.1 + phase) * 0.1;
  });
  return (
    <mesh ref={mesh} castShadow position={position}>
      <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.35}
        metalness={0.55}
        roughness={0.3}
      />
    </mesh>
  );
}

/** Glass vertical ribs · cork shelf · coin piles · slot mouth. */
export function JarInteriorArchitecture() {
  return (
    <group>
      {/* Glass vertical ribs */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 9.6, 2.8, Math.sin(a) * 9.6]} castShadow>
            <boxGeometry args={[0.12, 5.2, 0.12]} />
            <meshStandardMaterial
              color="#a5f3fc"
              emissive="#22d3ee"
              emissiveIntensity={0.2}
              transparent
              opacity={0.55}
              metalness={0.15}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      {/* Cork shelf ring */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[8.2, 8.6, 0.45, 32]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Coin piles */}
      {[
        [-3.2, 0.7, -1.5],
        [3.4, 0.7, -1.2],
        [0.2, 0.7, 2.8],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55, 12, 10]} />
            <meshStandardMaterial color="#b45309" metalness={0.4} roughness={0.45} />
          </mesh>
          <FloatingCoin position={[0.15, 0.55, 0.1]} phase={i} />
          <FloatingCoin position={[-0.2, 0.7, -0.15]} phase={i + 1.2} />
        </group>
      ))}

      {/* Coin slot mouth at exit */}
      <group position={[0, 0, 8.2]}>
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[2.2, 3.4, 0.35]} />
          <meshStandardMaterial
            color="#0f766e"
            emissive="#14b8a6"
            emissiveIntensity={0.25}
            metalness={0.35}
            roughness={0.4}
          />
        </mesh>
        <Billboard position={[0, 4.1, 0]} follow>
          <SafeText fontSize={0.26} color="#fde68a" anchorX="center" outlineWidth={0.02} outlineColor="#0f172a">
            Coin slot · shore
          </SafeText>
        </Billboard>
      </group>
    </group>
  );
}
