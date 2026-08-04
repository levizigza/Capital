/**
 * Harbor Ledger Bank — interior architecture that reads as brass vault + marble
 * ledger, not a generic stone cylinder.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";

function BrassColumn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.28, 0.35, 4.4, 12]} />
        <meshStandardMaterial color="#b45309" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.42, 0.32, 0.35, 12]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.25}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function LedgerGlowLine({ z, phase }: { z: number; phase: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 1.8 + phase) * 0.08;
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, z]}>
      <planeGeometry args={[8.5, 0.12]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.25}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Brass columns · marble ledger lines · vault door mouth · teller glass. */
export function BankInteriorArchitecture() {
  return (
    <group>
      {/* Brass columns around the vault room */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        return (
          <BrassColumn
            key={i}
            position={[Math.cos(a) * 9.2, 0, Math.sin(a) * 9.2]}
          />
        );
      })}

      {/* Marble ledger glow lines underfoot */}
      {[-2.2, 0, 2.2].map((z, i) => (
        <LedgerGlowLine key={z} z={z} phase={i * 0.9} />
      ))}

      {/* Teller glass wall toward Soft Beat pad */}
      <mesh position={[0, 2.4, -7.6]} castShadow>
        <boxGeometry args={[5.2, 3.2, 0.12]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={0.28}
          transparent
          opacity={0.45}
          metalness={0.2}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.7, -7.4]} castShadow>
        <boxGeometry args={[5.6, 0.35, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.15} roughness={0.45} />
      </mesh>
      <Billboard position={[0, 4.4, -7.4]} follow>
        <SafeText
          fontSize={0.28}
          color="#fde68a"
          anchorX="center"
          outlineWidth={0.02}
          outlineColor="#0f172a"
        >
          Teller · Memory keeps
        </SafeText>
      </Billboard>

      {/* Vault door mouth at exit */}
      <group position={[0, 0, 8.3]}>
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[2.4, 3.6, 0.35]} />
          <meshStandardMaterial
            color="#92400e"
            emissive="#b45309"
            emissiveIntensity={0.2}
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 2.0, 0.2]}>
          <torusGeometry args={[0.55, 0.08, 8, 24]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.4}
            metalness={0.65}
            roughness={0.28}
          />
        </mesh>
        <Billboard position={[0, 4.2, 0]} follow>
          <SafeText
            fontSize={0.26}
            color="#fde68a"
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            Vault door · plaza
          </SafeText>
        </Billboard>
      </group>

      {/* Safe niches near Safe Heart / Stamp pads */}
      {[
        [-4.8, 1.2, -1.0],
        [4.8, 1.2, -0.8],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[1.4, 1.6, 0.5]} />
          <meshStandardMaterial
            color="#334155"
            emissive={i === 0 ? "#f59e0b" : "#94a3b8"}
            emissiveIntensity={0.15}
            metalness={0.35}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
