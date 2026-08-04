/**
 * Cove Coin Jar — interior architecture that reads as glass + cork + coin piles,
 * not a generic cyan cylinder room.
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

/** Glass ribs · cork shelf · coin piles · slot mouth — jar-true denseness. */
export function JarInteriorArchitecture() {
  return (
    <group>
      {/* Glass vertical ribs — reads as a jar, not a tower tube */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const x = Math.cos(a) * 10.1;
        const z = Math.sin(a) * 10.1;
        return (
          <mesh key={i} position={[x, 3.2, z]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.12, 7.2, 0.18]} />
            <meshStandardMaterial
              color="#a5f3fc"
              emissive="#0891b2"
              emissiveIntensity={0.18}
              transparent
              opacity={0.55}
              roughness={0.2}
              metalness={0.15}
            />
          </mesh>
        );
      })}

      {/* Cork shelf ring — Cork Vault language around the room */}
      <mesh position={[0, 2.4, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[9.2, 0.22, 8, 48]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.55, 0]}>
        <torusGeometry args={[9.2, 0.08, 6, 48]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.25}
          metalness={0.35}
          roughness={0.4}
        />
      </mesh>

      {/* Coin piles near Cork Vault / Coin Spring / Lid pads */}
      {[
        [-4.2, 0.15, -1.2],
        [-5.1, 0.15, -3.1],
        [4.2, 0.15, -1.0],
        [5.0, 0.15, -3.0],
        [-1.2, 0.15, -5.4],
        [1.2, 0.15, -5.6],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.55, 0.7, 0.28, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.4} roughness={0.45} />
          </mesh>
          <FloatingCoin position={[0.1, 0.45, 0.05]} phase={i * 0.7} />
          <FloatingCoin position={[-0.15, 0.55, -0.1]} phase={i * 1.1 + 1} />
        </group>
      ))}

      {/* Slot mouth at exit — organ-true leave path */}
      <group position={[0, 0, 8.4]}>
        <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.7, 1.8, 20, 1, true]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#fbbf24"
            emissiveIntensity={0.4}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            roughness={0.25}
          />
        </mesh>
        <Billboard position={[0, 3.1, 0]} follow>
          <SafeText
            fontSize={0.26}
            color="#fde68a"
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            Coin slot · shore
          </SafeText>
        </Billboard>
      </group>

      {/* Lid glow dome hint toward Lid Lookout */}
      <mesh position={[0, 7.6, -5.5]}>
        <sphereGeometry args={[1.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.22}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
