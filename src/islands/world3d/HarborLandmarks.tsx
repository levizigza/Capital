/**
 * Harbor plaza landmark kit — unique silhouettes with Astro-grade material craft.
 * Simple readable shapes + rich secondary detail (not barren primitives).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { organMaterialTint, type MoneyOrganId } from "../moneyOrgans";
import { SafeText } from "./SafeText";

type AccentProps = {
  active?: boolean;
  guided?: boolean;
};

/** Money Carpet Gate — leave-home portal; previews Cove warmth. */
export function MoneyCarpetGate({ active = false, guided = false }: AccentProps) {
  const cloth = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const fringe = useRef<THREE.Group>(null);
  const lit = active || guided;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (cloth.current) {
      cloth.current.position.y = 0.62 + Math.sin(t * 1.6) * 0.07;
      cloth.current.rotation.z = Math.sin(t * 1.1) * 0.05;
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (lit ? 0.85 : 0.32) + Math.sin(t * 2.4) * 0.1;
    }
    if (fringe.current) {
      fringe.current.children.forEach((c, i) => {
        c.rotation.x = Math.sin(t * 3 + i) * 0.2;
      });
    }
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.1, 0.2]}>
        <boxGeometry args={[3.6, 0.2, 2.8]} />
        <meshStandardMaterial color="#78716c" roughness={0.88} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.22, 0.2]}>
        <boxGeometry args={[3.2, 0.08, 2.4]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.75} />
      </mesh>
      {/* Twin pillars with brass caps */}
      {([-1.35, 1.35] as const).map((x) => (
        <group key={x} position={[x, 0, -0.15]}>
          <mesh castShadow position={[0, 1.45, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 2.8, 10]} />
            <meshStandardMaterial color="#92400e" roughness={0.65} />
          </mesh>
          <mesh castShadow position={[0, 2.95, 0]}>
            <cylinderGeometry args={[0.28, 0.22, 0.22, 10]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Curved lintel + coin emblem */}
      <mesh castShadow position={[0, 2.85, -0.15]}>
        <boxGeometry args={[3.1, 0.35, 0.45]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.85, 0.12]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.45} metalness={0.5} />
      </mesh>
      {/* Nested painting portal — warm Cove over cool sea */}
      <mesh ref={glow} position={[0, 1.5, -0.12]}>
        <planeGeometry args={[2.2, 2.35]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.5, -0.2]}>
        <planeGeometry args={[1.9, 2.05]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.25, -0.18]}>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color="#4ade80" roughness={0.7} flatShading />
      </mesh>
      {/* Floating money carpet with fringe */}
      <mesh ref={cloth} castShadow position={[0, 0.62, 0.7]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[1.85, 0.07, 2.35]} />
        <meshStandardMaterial color="#166534" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.7, 0.7]} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[1.35, 1.7]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#facc15"
          emissiveIntensity={lit ? 0.5 : 0.2}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <group ref={fringe} position={[0, 0.55, 1.75]}>
        {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.08, 0.35, 0.04]} />
            <meshStandardMaterial color="#14532d" />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0.55]}>
        <ringGeometry args={[1.45, 1.9, 28]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#b45309"
          emissiveIntensity={lit ? 0.45 : 0.16}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Soft fabric Outfitter — mannequin + draped stall + clothing rack. */
export function OutfitterPavilion({ active = false, guided = false }: AccentProps) {
  const lit = active || guided;
  const swatch = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!swatch.current) return;
    swatch.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.15;
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.55, 1.7, 0.16, 18]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.88} />
      </mesh>
      {/* Raised stage */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[1.35, 1.4, 0.18, 16]} />
        <meshStandardMaterial color="#fce7f3" roughness={0.7} />
      </mesh>
      {([-1.05, 1.05] as const).flatMap((x) =>
        ([-0.95, 0.95] as const).map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 1.2, z]}>
            <cylinderGeometry args={[0.07, 0.08, 2.2, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
          </mesh>
        )),
      )}
      {/* Layered canopy — silhouette + soft volume */}
      <mesh castShadow position={[0, 2.35, 0]}>
        <coneGeometry args={[1.85, 0.95, 4]} />
        <meshStandardMaterial color="#f472b6" roughness={0.5} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.0, 0]}>
        <cylinderGeometry args={[1.55, 1.55, 0.12, 4]} />
        <meshStandardMaterial color="#fb7185" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0.05]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.6]} />
        <meshStandardMaterial color="#fda4af" roughness={0.6} />
      </mesh>
      {/* Mannequin with coat */}
      <mesh castShadow position={[0, 0.7, 0.2]}>
        <cylinderGeometry args={[0.3, 0.34, 0.85, 10]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0.2]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0.2]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0.35]}>
        <boxGeometry args={[0.85, 0.7, 0.2]} />
        <meshStandardMaterial color="#c084fc" roughness={0.55} />
      </mesh>
      {/* Clothing rack */}
      <group ref={swatch} position={[0.95, 0.9, -0.35]}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 1.4, 6]} />
          <meshStandardMaterial color="#44403c" metalness={0.4} />
        </mesh>
        {[-0.25, 0, 0.25].map((x, i) => (
          <mesh key={x} castShadow position={[x, 0.85, 0.05]}>
            <boxGeometry args={[0.2, 0.45, 0.08]} />
            <meshStandardMaterial color={["#38bdf8", "#fbbf24", "#4ade80"][i]} roughness={0.5} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.35, 1.7, 24]} />
        <meshStandardMaterial
          color="#f9a8d4"
          emissive="#db2777"
          emissiveIntensity={lit ? 0.4 : 0.14}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Arcade — marquee + neon cabinets + coin slot glow. */
export function ArcadePavilion({ active = false, guided = false }: AccentProps) {
  const screen = useRef<THREE.Mesh>(null);
  const marquee = useRef<THREE.Mesh>(null);
  const lit = active || guided;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (screen.current) {
      const mat = screen.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (lit ? 0.95 : 0.45) + Math.sin(t * 4) * 0.15;
    }
    if (marquee.current) {
      const mat = marquee.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.35 + Math.sin(t * 5) * 0.2;
    }
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[3.0, 0.18, 2.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Main cabinet */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[1.65, 1.95, 1.25]} />
        <meshStandardMaterial color="#312e81" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Bevel crown */}
      <mesh castShadow position={[0, 2.15, 0]}>
        <boxGeometry args={[1.85, 0.28, 1.4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.45} />
      </mesh>
      <mesh ref={marquee} position={[0, 2.35, 0.55]}>
        <boxGeometry args={[1.5, 0.28, 0.12]} />
        <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={screen} position={[0, 1.4, 0.65]}>
        <boxGeometry args={[1.25, 0.85, 0.1]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0.55, 0.68]}>
        <boxGeometry args={[1.0, 0.4, 0.16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0.25, 0.58, 0.78]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 10]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      {([-1.15, 1.15] as const).map((x) => (
        <group key={x} position={[x, 0, -0.05]}>
          <mesh castShadow position={[0, 0.8, 0]}>
            <boxGeometry args={[0.6, 1.45, 0.75]} />
            <meshStandardMaterial color={x < 0 ? "#7c3aed" : "#db2777"} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.15, 0.4]}>
            <boxGeometry args={[0.4, 0.35, 0.06]} />
            <meshStandardMaterial
              color={x < 0 ? "#c4b5fd" : "#fda4af"}
              emissive={x < 0 ? "#8b5cf6" : "#f472b6"}
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.25, 1.6, 22]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={lit ? 0.45 : 0.16}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Harbor Board — framed cork with hanging tickets. */
export function HarborNoticeBoard({ active = false, guided = false }: AccentProps) {
  const lit = active || guided;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[2.2, 0.14, 0.9]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.85} />
      </mesh>
      {([-0.7, 0.7] as const).map((x) => (
        <mesh key={x} castShadow position={[x, 1.0, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 1.9, 8]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.55, 0.06]}>
        <boxGeometry args={[2.0, 1.45, 0.16]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0.16]}>
        <planeGeometry args={[1.7, 1.15]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fde68a"
          emissiveIntensity={lit ? 0.28 : 0.1}
        />
      </mesh>
      {/* Ticket slips */}
      {[
        [-0.45, 1.75, "#38bdf8"],
        [0.1, 1.65, "#fbbf24"],
        [0.5, 1.8, "#f472b6"],
      ].map(([x, y, c], i) => (
        <mesh key={i} position={[x as number, y as number, 0.2]} rotation={[0, 0, (i - 1) * 0.08]}>
          <planeGeometry args={[0.35, 0.45]} />
          <meshStandardMaterial color={c as string} />
        </mesh>
      ))}
      <mesh castShadow position={[-0.4, 1.95, 0.2]}>
        <boxGeometry args={[0.32, 0.32, 0.08]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      <mesh position={[0.45, 1.35, 0.2]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Memory Plinth — the one Harbor icon.
 * Kid-drawable: open ledger on a terrace + scar lamp (not a RPG rock).
 * Empty shelf until a Take; scar-lit when Harbor remembers.
 */
export function MemoryPlinthMesh({
  active = false,
  guided = false,
  scarRemembered = false,
  spectacleActive = false,
  scarOrgan = null,
  scarLabel,
}: AccentProps & {
  scarRemembered?: boolean;
  /** Scar spectacle camera lock — lamp peaks */
  spectacleActive?: boolean;
  /** Scar organ tint — Coin gold / Clock sky / Spiral violet on Memory ledger */
  scarOrgan?: MoneyOrganId | null;
  scarLabel?: string;
}) {
  const glow = useRef<THREE.Mesh>(null);
  const pages = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const lit = active || guided || scarRemembered || spectacleActive;
  const tint = organMaterialTint(scarOrgan);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      if (spectacleActive) {
        mat.emissiveIntensity = 1.55 + Math.sin(t * 5.2) * 0.35;
      } else {
        const base = scarRemembered ? 1.05 : lit ? 0.7 : 0.22;
        mat.emissiveIntensity = base + Math.sin(t * (scarRemembered ? 2.6 : 1.8)) * 0.14;
      }
    }
    if (pages.current && (scarRemembered || spectacleActive)) {
      pages.current.rotation.y = Math.sin(t * (spectacleActive ? 1.4 : 0.7)) * (spectacleActive ? 0.07 : 0.04);
    }
    if (ring.current) {
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = spectacleActive
        ? 0.95 + Math.sin(t * 6) * 0.25
        : scarRemembered
          ? 0.55
          : 0.2;
      mat.opacity = spectacleActive ? 0.92 : scarRemembered ? 0.75 : 0.5;
    }
  });

  const pageColor = scarRemembered ? "#fffbeb" : lit ? "#f5f5f4" : "#e7e5e4";
  const spineColor = scarRemembered ? "#92400e" : "#57534e";

  return (
    <group>
      {/* Terrace — wide readable base */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[2.4, 0.2, 1.7]} />
        <meshStandardMaterial color="#78716c" roughness={0.92} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[2.0, 0.16, 1.35]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.88} flatShading />
      </mesh>
      {scarRemembered || spectacleActive ? (
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
          <ringGeometry args={[0.95, 1.35, 28]} />
          <meshStandardMaterial
            color={tint.accent}
            emissive={tint.emissive}
            emissiveIntensity={0.55}
            transparent
            opacity={0.75}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Open ledger — two pages a kid can crayon */}
      <group ref={pages} position={[0, 1.05, 0]}>
        <mesh castShadow position={[-0.42, 0.15, 0]} rotation={[0, 0.22, -0.08]}>
          <boxGeometry args={[0.85, 1.35, 0.08]} />
          <meshStandardMaterial color={pageColor} roughness={0.55} />
        </mesh>
        <mesh castShadow position={[0.42, 0.15, 0]} rotation={[0, -0.22, 0.08]}>
          <boxGeometry args={[0.85, 1.35, 0.08]} />
          <meshStandardMaterial color={pageColor} roughness={0.55} />
        </mesh>
        {/* Spine */}
        <mesh castShadow position={[0, 0.1, -0.02]}>
          <boxGeometry args={[0.14, 1.4, 0.18]} />
          <meshStandardMaterial color={spineColor} roughness={0.7} />
        </mesh>
        {/* Ledger lines */}
        {([-0.42, 0.42] as const).map((x, side) =>
          [0.35, 0.05, -0.25, -0.55].map((y, i) => (
            <mesh
              key={`${side}-${i}`}
              position={[x + (side === 0 ? 0.08 : -0.08), y, 0.05]}
              rotation={[0, side === 0 ? 0.22 : -0.22, 0]}
            >
              <boxGeometry args={[0.55, 0.03, 0.02]} />
              <meshStandardMaterial
                color={scarRemembered ? "#b45309" : "#a8a29e"}
                roughness={0.8}
              />
            </mesh>
          )),
        )}
      </group>

      {/* Scar lamp — Harbor’s memory light */}
      <mesh castShadow position={[0, 2.05, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.22, 8]} />
        <meshStandardMaterial color="#92400e" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh ref={glow} position={[0, 2.42, 0]}>
        <sphereGeometry args={[scarRemembered || spectacleActive ? 0.42 : 0.3, 16, 14]} />
        <meshStandardMaterial
          color={scarRemembered || spectacleActive ? tint.lamp : "#f5f5f4"}
          emissive={tint.emissive}
          emissiveIntensity={
            spectacleActive ? 1.2 : scarRemembered ? 0.65 : lit ? 0.35 : 0.12
          }
          metalness={0.35}
        />
      </mesh>
      {scarRemembered || spectacleActive ? (
        <pointLight
          position={[0, 2.5, 0.4]}
          color={tint.accent}
          intensity={spectacleActive ? 2.4 : 1.4}
          distance={spectacleActive ? 11 : 8}
          decay={2}
        />
      ) : null}

      {/* Empty-shelf plaque face vs scar label */}
      {!scarRemembered ? (
        <Billboard follow position={[0, 2.95, 0]}>
          <SafeText
            fontSize={0.2}
            color="#57534e"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#fafaf9"
          >
            Memory
          </SafeText>
        </Billboard>
      ) : null}
      {scarRemembered && scarLabel ? (
        <Billboard follow position={[0, 3.05, 0]}>
          <SafeText
            fontSize={0.22}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#fffbeb"
          >
            {scarLabel}
          </SafeText>
        </Billboard>
      ) : null}
    </group>
  );
}

/** Utility signpost — denser plaque on quay (not a lonely stick). */
export function HarborSignpost({
  accent = "#38bdf8",
  active = false,
}: {
  accent?: string;
  active?: boolean;
}) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.12, 8]} />
        <meshStandardMaterial color="#78716c" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.8, 6]} />
        <meshStandardMaterial color="#44403c" roughness={0.75} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 1.85, 0.1]}>
        <boxGeometry args={[1.05, 0.55, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.85, 0.17]}>
        <planeGeometry args={[0.85, 0.38]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 0.5 : 0.22}
        />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
