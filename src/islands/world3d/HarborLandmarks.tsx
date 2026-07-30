/**
 * Harbor plaza landmark kit — unique silhouettes (Astro CPU-Plaza craft).
 * Never reuse HarborBuilding clones for these.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type AccentProps = {
  active?: boolean;
  guided?: boolean;
};

/** Money Carpet Gate — leave-home portal; previews Cove warmth. */
export function MoneyCarpetGate({ active = false, guided = false }: AccentProps) {
  const cloth = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const lit = active || guided;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (cloth.current) {
      cloth.current.position.y = 0.55 + Math.sin(t * 1.6) * 0.06;
      cloth.current.rotation.z = Math.sin(t * 1.1) * 0.04;
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (lit ? 0.7 : 0.28) + Math.sin(t * 2.4) * 0.08;
    }
  });

  return (
    <group>
      {/* Pier plinth */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[3.2, 0.16, 2.4]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
      </mesh>
      {/* Gate posts */}
      {([-1.25, 1.25] as const).map((x) => (
        <mesh key={x} castShadow position={[x, 1.35, -0.2]}>
          <cylinderGeometry args={[0.14, 0.18, 2.6, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </mesh>
      ))}
      {/* Arch lintel */}
      <mesh castShadow position={[0, 2.55, -0.2]}>
        <boxGeometry args={[2.8, 0.28, 0.35]} />
        <meshStandardMaterial color="#b45309" roughness={0.55} />
      </mesh>
      {/* Cove-warm painting portal plane */}
      <mesh ref={glow} position={[0, 1.45, -0.15]}>
        <planeGeometry args={[2.1, 2.2]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={0.35}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Soft sea / Cove hint behind the warm pane */}
      <mesh position={[0, 1.45, -0.22]}>
        <planeGeometry args={[1.85, 1.95]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Floating money carpet */}
      <mesh ref={cloth} castShadow position={[0, 0.55, 0.55]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[1.7, 0.06, 2.1]} />
        <meshStandardMaterial color="#166534" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.62, 0.55]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#facc15"
          emissiveIntensity={lit ? 0.45 : 0.18}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0.4]}>
        <ringGeometry args={[1.35, 1.75, 28]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#b45309"
          emissiveIntensity={lit ? 0.4 : 0.15}
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Soft fabric / mannequin silhouette for Outfitter. */
export function OutfitterPavilion({ active = false, guided = false }: AccentProps) {
  const lit = active || guided;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.35, 1.45, 0.12, 16]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} />
      </mesh>
      {/* Tent poles */}
      {([-0.95, 0.95] as const).flatMap((x) =>
        ([-0.85, 0.85] as const).map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 1.1, z]}>
            <cylinderGeometry args={[0.06, 0.07, 2.1, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
          </mesh>
        )),
      )}
      {/* Fabric canopy */}
      <mesh castShadow position={[0, 2.15, 0]}>
        <coneGeometry args={[1.65, 0.85, 4]} />
        <meshStandardMaterial color="#f472b6" roughness={0.55} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <boxGeometry args={[1.9, 0.08, 1.7]} />
        <meshStandardMaterial color="#fda4af" roughness={0.6} />
      </mesh>
      {/* Mannequin */}
      <mesh castShadow position={[0, 0.55, 0.15]}>
        <cylinderGeometry args={[0.28, 0.32, 0.7, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0.15]}>
        <sphereGeometry args={[0.28, 10, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 1.45, 0.15]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#fde68a" roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.2, 1.5, 24]} />
        <meshStandardMaterial
          color="#f9a8d4"
          emissive="#db2777"
          emissiveIntensity={lit ? 0.35 : 0.12}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Neon cabinet cluster for Arcade. */
export function ArcadePavilion({ active = false, guided = false }: AccentProps) {
  const screen = useRef<THREE.Mesh>(null);
  const lit = active || guided;

  useFrame(({ clock }) => {
    if (!screen.current) return;
    const mat = screen.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = (lit ? 0.85 : 0.4) + Math.sin(clock.elapsedTime * 4) * 0.12;
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[2.6, 0.14, 1.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      {/* Cabinet body */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[1.5, 1.85, 1.15]} />
        <meshStandardMaterial color="#312e81" roughness={0.55} />
      </mesh>
      <mesh ref={screen} position={[0, 1.35, 0.6]}>
        <boxGeometry args={[1.15, 0.75, 0.08]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0.62]}>
        <boxGeometry args={[0.9, 0.35, 0.12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Side cabinets */}
      {([-1.05, 1.05] as const).map((x) => (
        <mesh key={x} castShadow position={[x, 0.75, -0.1]}>
          <boxGeometry args={[0.55, 1.35, 0.7]} />
          <meshStandardMaterial color={x < 0 ? "#7c3aed" : "#db2777"} roughness={0.5} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.15, 1.45, 20]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={lit ? 0.4 : 0.14}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Daily / practice notice board. */
export function HarborNoticeBoard({ active = false, guided = false }: AccentProps) {
  const lit = active || guided;
  return (
    <group>
      <mesh castShadow position={[-0.55, 0.85, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.7, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.55, 0.85, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.7, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0.05]}>
        <boxGeometry args={[1.7, 1.15, 0.12]} />
        <meshStandardMaterial color="#92400e" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.4, 0.13]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fde68a"
          emissiveIntensity={lit ? 0.25 : 0.08}
        />
      </mesh>
      {/* Dice / sun pins */}
      <mesh position={[-0.35, 1.55, 0.16]}>
        <boxGeometry args={[0.28, 0.28, 0.06]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      <mesh position={[0.4, 1.25, 0.16]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

/** Memory Plinth — scar / plaque hero. */
export function MemoryPlinthMesh({ active = false, guided = false }: AccentProps) {
  const glow = useRef<THREE.Mesh>(null);
  const lit = active || guided;

  useFrame(({ clock }) => {
    if (!glow.current) return;
    const mat = glow.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = (lit ? 0.65 : 0.22) + Math.sin(clock.elapsedTime * 2) * 0.08;
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.85, 1.05, 0.4, 8]} />
        <meshStandardMaterial color="#78716c" roughness={0.92} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[0.95, 1.1, 0.55]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.85} flatShading />
      </mesh>
      <mesh ref={glow} position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.3} metalness={0.35} />
      </mesh>
    </group>
  );
}

/** Thin utility signpost — secondary destinations without shop clutter. */
export function HarborSignpost({
  accent = "#38bdf8",
  active = false,
}: {
  accent?: string;
  active?: boolean;
}) {
  return (
    <group>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 1.7, 6]} />
        <meshStandardMaterial color="#57534e" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.65, 0.08]}>
        <boxGeometry args={[0.85, 0.45, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.65, 0.14]}>
        <planeGeometry args={[0.65, 0.28]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 0.45 : 0.18}
        />
      </mesh>
    </group>
  );
}
