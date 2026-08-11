/**
 * Credit Interest Keep — spiral rune floor · anvil glow · battlement teeth.
 * Soundtrack cue unchanged: credit_ruins (Spiral Interest Keep).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";

function SpiralRune({ radius, phase }: { radius: number; phase: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = clock.elapsedTime * 0.25 + phase;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.25 + Math.sin(clock.elapsedTime * 2 + phase) * 0.1;
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <ringGeometry args={[radius - 0.08, radius, 48]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#7c3aed"
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Spiral runes · debt anvil · battlement teeth · interest gate. */
export function KeepInteriorArchitecture() {
  return (
    <group>
      {[2.2, 4.0, 5.8, 7.6].map((r, i) => (
        <SpiralRune key={r} radius={r} phase={i * 0.7} />
      ))}

      <mesh position={[-4.2, 1.0, -2.4]} castShadow>
        <boxGeometry args={[1.8, 1.2, 1.2]} />
        <meshStandardMaterial
          color="#44403c"
          emissive="#a78bfa"
          emissiveIntensity={0.22}
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>
      <Billboard position={[-4.2, 2.4, -2.4]} follow>
        <SafeText fontSize={0.22} color="#ddd6fe" anchorX="center" outlineWidth={0.02} outlineColor="#1c1917">
          Debt Anvil
        </SafeText>
      </Billboard>

      {[-1.8, -0.6, 0.6, 1.8].map((x) => (
        <mesh key={x} position={[x, 3.8, -7.5]} castShadow>
          <boxGeometry args={[0.7, 1.6, 0.45]} />
          <meshStandardMaterial
            color="#78716c"
            emissive="#8b5cf6"
            emissiveIntensity={0.15}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}
      <Billboard position={[0, 5.2, -7.3]} follow>
        <SafeText fontSize={0.26} color="#ddd6fe" anchorX="center" outlineWidth={0.02} outlineColor="#1c1917">
          Score Battlement · Spiral withstands
        </SafeText>
      </Billboard>

      <group position={[0, 0, 8.2]}>
        <mesh position={[0, 2.0, 0]}>
          <torusGeometry args={[1.35, 0.22, 10, 36]} />
          <meshStandardMaterial
            color="#6d28d9"
            emissive="#a78bfa"
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        <Billboard position={[0, 4.0, 0]} follow>
          <SafeText fontSize={0.26} color="#ddd6fe" anchorX="center" outlineWidth={0.02} outlineColor="#1c1917">
            Interest gate · shore
          </SafeText>
        </Billboard>
      </group>
    </group>
  );
}
