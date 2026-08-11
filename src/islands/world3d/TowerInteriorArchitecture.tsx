/**
 * Paycheck Payroll Tower — chute ribs · clock face · bucket presses.
 * Soundtrack cue unchanged: ai_undercity (Clock Stamp Shift).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";

function ClockHand() {
  const hand = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!hand.current) return;
    hand.current.rotation.z = -clock.elapsedTime * 0.35;
  });
  return (
    <mesh ref={hand} position={[0, 3.6, -7.2]}>
      <boxGeometry args={[0.08, 1.4, 0.08]} />
      <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.45} />
    </mesh>
  );
}

/** Chute ribs · neon clock · bucket silhouettes · loft hatch. */
export function TowerInteriorArchitecture() {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 9.4, 3.2, Math.sin(a) * 9.4]} castShadow>
            <boxGeometry args={[0.18, 6.2, 0.18]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.22}
              metalness={0.35}
              roughness={0.35}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 3.6, -7.35]} castShadow>
        <circleGeometry args={[1.35, 28]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#38bdf8"
          emissiveIntensity={0.35}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      <ClockHand />
      <Billboard position={[0, 5.4, -7.2]} follow>
        <SafeText fontSize={0.26} color="#e0f2fe" anchorX="center" outlineWidth={0.02} outlineColor="#0c4a6e">
          Time Clock · Clock earns
        </SafeText>
      </Billboard>

      {[
        [-4.2, 1.1, -2.2],
        [4.2, 1.1, -2.0],
        [0, 1.1, -5.5],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[1.6, 1.4, 1.1]} />
          <meshStandardMaterial
            color={i === 2 ? "#7dd3fc" : "#0369a1"}
            emissive="#38bdf8"
            emissiveIntensity={0.18}
            metalness={0.3}
            roughness={0.45}
          />
        </mesh>
      ))}

      <group position={[0, 0, 8.2]}>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[1.1, 1.4, 3.8, 16]} />
          <meshStandardMaterial
            color="#0e7490"
            emissive="#22d3ee"
            emissiveIntensity={0.3}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
        <Billboard position={[0, 4.4, 0]} follow>
          <SafeText fontSize={0.26} color="#e0f2fe" anchorX="center" outlineWidth={0.02} outlineColor="#0c4a6e">
            Paycheck chute · shore
          </SafeText>
        </Billboard>
      </group>
    </group>
  );
}
