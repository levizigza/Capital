/**
 * Interest Keep landmark — Spiral organ silhouette.
 * After credit haste Take (hush), the spiral slows — shore remembers before Harbor does.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";
import { cinemaFlashAmp } from "../a11yMotion";
import * as THREE from "three";
import { ShoreSoftBeatBeacon } from "./ShoreSoftBeatBeacon";

type CinemaPhase = "hush" | "mark" | "line";

type Props = {
  position: [number, number, number];
  active?: boolean;
  guided?: boolean;
  label?: string;
  hushActive?: boolean;
  cinemaPhase?: CinemaPhase | null;
};

export function InterestKeepLandmark({
  position,
  active = false,
  guided = false,
  label = "Interest Keep",
  hushActive = false,
  cinemaPhase = null,
}: Props) {
  const spiral = useRef<THREE.Group>(null);
  const gateGlow = useRef<THREE.Mesh>(null);
  const scar = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mark = cinemaPhase === "mark";
    const flash = cinemaFlashAmp();
    if (spiral.current) spiral.current.rotation.y = t * (mark ? 0.04 : hushActive ? 0.12 : 0.55);
    if (gateGlow.current) {
      const mat = gateGlow.current.material as THREE.MeshStandardMaterial;
      if (mark) {
        mat.emissiveIntensity = 0.5 + flash * (0.4 + Math.sin(t * 10) * 0.2);
      } else {
        const base = hushActive ? 0.12 : active ? 0.85 : guided ? 0.5 : 0.28;
        mat.emissiveIntensity = base + Math.sin(t * (hushActive ? 1.1 : 3.0)) * (hushActive ? 0.03 : 0.08);
      }
    }
    if (scar.current) {
      const mat = scar.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = mark ? 0.4 + flash * (0.35 + Math.sin(t * 12) * 0.2) : 0.2;
      mat.opacity = mark ? 0.8 + 0.1 * flash : 0.65;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[2.0, 2.55, 28]} />
        <meshStandardMaterial
          color={hushActive ? "#64748b" : "#f87171"}
          emissive={hushActive ? "#334155" : "#b91c1c"}
          emissiveIntensity={hushActive ? 0.08 : active ? 0.42 : 0.16}
          transparent
          opacity={hushActive ? 0.5 : 0.7}
          depthWrite={false}
        />
      </mesh>

      {hushActive ? (
        <mesh ref={scar} rotation={[-Math.PI / 2, 0, 0.5]} position={[0.7, 0.08, -0.5]}>
          <ringGeometry args={[0.35, 0.55, 20]} />
          <meshStandardMaterial
            color="#57534e"
            emissive="#78716c"
            emissiveIntensity={0.2}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[2.8, 3.2, 2.6]} />
        <meshStandardMaterial
          color={hushActive ? "#57534e" : "#64748b"}
          roughness={0.75}
          metalness={0.12}
        />
      </mesh>
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
          <meshStandardMaterial color={hushActive ? "#44403c" : "#475569"} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[3.1, 0.4, 2.9]} />
        <meshStandardMaterial color={hushActive ? "#292524" : "#334155"} />
      </mesh>

      <group ref={spiral} position={[0, 1.35, 1.35]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[Math.cos(i) * 0.25, i * 0.22 - 0.3, Math.sin(i) * 0.25]}
            rotation={[0.4, i * 0.7, 0]}
          >
            <torusGeometry args={[0.42 - i * 0.05, 0.07, 8, 16]} />
            <meshStandardMaterial
              color={hushActive ? "#a8a29e" : "#fbbf24"}
              emissive={hushActive ? "#57534e" : "#f59e0b"}
              emissiveIntensity={hushActive ? 0.1 : 0.45}
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
          emissive={hushActive ? "#57534e" : "#dc2626"}
          emissiveIntensity={hushActive ? 0.15 : 0.4}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      <ShoreSoftBeatBeacon y={4.45} accent="#fb7185" hushActive={hushActive} />

      <Billboard position={[0, 5.05, 0]} follow>
        <SafeText
          fontSize={0.28}
          color={hushActive ? "#e7e5e4" : "#fff1f2"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#450a0a"
        >
          {cinemaPhase === "mark"
            ? "The mark holds"
            : hushActive
              ? "Quiet after the Take"
              : active
                ? "Enter · interest spiral"
                : `${label} · Soft Beat battlement`}
        </SafeText>
      </Billboard>
    </group>
  );
}
