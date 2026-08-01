/**
 * Payroll Tower landmark — Clock organ silhouette.
 * After rainy-day Take (hush), the chute cools — shore remembers before Harbor does.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";
import * as THREE from "three";

type CinemaPhase = "hush" | "mark" | "line";

type Props = {
  position: [number, number, number];
  active?: boolean;
  guided?: boolean;
  label?: string;
  hushActive?: boolean;
  cinemaPhase?: CinemaPhase | null;
};

export function PayrollTowerLandmark({
  position,
  active = false,
  guided = false,
  label = "Payroll Tower",
  hushActive = false,
  cinemaPhase = null,
}: Props) {
  const chute = useRef<THREE.Mesh>(null);
  const clockHand = useRef<THREE.Mesh>(null);
  const scar = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mark = cinemaPhase === "mark";
    if (chute.current) {
      const mat = chute.current.material as THREE.MeshStandardMaterial;
      if (mark) {
        mat.emissiveIntensity = 0.9 + Math.sin(t * 10) * 0.2;
      } else {
        const base = hushActive ? 0.1 : active ? 0.8 : guided ? 0.5 : 0.25;
        mat.emissiveIntensity = base + Math.sin(t * (hushActive ? 1.2 : 3.2)) * (hushActive ? 0.03 : 0.08);
      }
    }
    if (clockHand.current) {
      clockHand.current.rotation.z = -t * (mark ? 0.05 : hushActive ? 0.15 : 0.8);
    }
    if (scar.current) {
      const mat = scar.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = mark ? 0.8 + Math.sin(t * 12) * 0.2 : 0.2;
      mat.opacity = mark ? 0.95 : 0.7;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.9, 2.45, 28]} />
        <meshStandardMaterial
          color={hushActive ? "#64748b" : "#38bdf8"}
          emissive={hushActive ? "#334155" : "#0284c7"}
          emissiveIntensity={hushActive ? 0.08 : active ? 0.45 : 0.18}
          transparent
          opacity={hushActive ? 0.5 : 0.72}
          depthWrite={false}
        />
      </mesh>

      {hushActive ? (
        <mesh ref={scar} rotation={[-Math.PI / 2, 0, -0.3]} position={[-0.8, 0.08, 0.7]}>
          <planeGeometry args={[1.3, 0.12]} />
          <meshStandardMaterial
            color="#0c4a6e"
            emissive="#0369a1"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[2.2, 4.2, 2.0]} />
        <meshStandardMaterial
          color={hushActive ? "#64748b" : "#0ea5e9"}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      {[0.6, 1.6, 2.6, 3.6].map((y) => (
        <mesh key={y} position={[0, y, 1.05]}>
          <boxGeometry args={[1.6, 0.35, 0.08]} />
          <meshStandardMaterial
            color={hushActive ? "#94a3b8" : "#e0f2fe"}
            emissive={hushActive ? "#475569" : "#7dd3fc"}
            emissiveIntensity={hushActive ? 0.08 : 0.35}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      <mesh position={[0, 4.55, 0]} castShadow>
        <boxGeometry args={[2.5, 0.35, 2.3]} />
        <meshStandardMaterial color={hushActive ? "#475569" : "#0369a1"} />
      </mesh>

      <mesh ref={chute} position={[0, 1.1, 1.2]} rotation={[0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.75, 1.8, 16]} />
        <meshStandardMaterial
          color={hushActive ? "#cbd5e1" : "#fde68a"}
          emissive={hushActive ? "#64748b" : "#fbbf24"}
          emissiveIntensity={hushActive ? 0.12 : 0.4}
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.35, 1.85]}>
        <boxGeometry args={[1.1, 0.15, 0.55]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh position={[0, 3.5, 1.12]}>
        <circleGeometry args={[0.35, 20]} />
        <meshStandardMaterial color={hushActive ? "#94a3b8" : "#f8fafc"} />
      </mesh>
      <mesh ref={clockHand} position={[0, 3.5, 1.14]}>
        <boxGeometry args={[0.04, 0.28, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <Billboard position={[0, 5.3, 0]} follow>
        <SafeText
          fontSize={0.28}
          color={hushActive ? "#e2e8f0" : "#ecfeff"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#0c4a6e"
        >
          {cinemaPhase === "mark"
            ? "The mark holds"
            : hushActive
              ? "Quiet after the Take"
              : active
                ? "Enter · paycheck chute"
                : label}
        </SafeText>
      </Billboard>
    </group>
  );
}
