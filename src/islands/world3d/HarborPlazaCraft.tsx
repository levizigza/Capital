/**
 * Harbor visual rhythm kit — Asobi / Impeccable spatial craft for Harbor Haven.
 *
 * Rhythm rules (from Astro Playroom CPU Plaza + Astro Bot worlds):
 * 1. Vertical tiers — raised plaza, sand berms, cliff bands (not one flat pancake)
 * 2. Eye trail — coin inlays lead pier → fountain → bank
 * 3. Material contrast — stone / brass / fabric / neon / coin-amber in one vista
 * 4. Cluster utilities — shared quay plinth, never lonely posts in empty sand
 * 5. Soft life — banners, bobbing coins, warm lanterns (toy culture)
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Raised plaza ring + stepped lip — breaks the pancake silhouette. */
export function PlazaTier() {
  return (
    <group>
      {/* Raised stone disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow>
        <circleGeometry args={[9.2, 56]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.82} />
      </mesh>
      {/* Warm sand collar between plaza and shore */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <ringGeometry args={[9.2, 12.4, 56]} />
        <meshStandardMaterial color="#f0d9a8" roughness={0.92} />
      </mesh>
      {/* Step lip */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[9.25, 9.55, 0.18, 48]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.78} />
      </mesh>
      {/* Inner coin mosaic ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.135, 0]}>
        <ringGeometry args={[3.2, 3.55, 40]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#b45309"
          emissiveIntensity={0.12}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

/** Coin inlays that draw the eye: pier approach + bank approach. */
export function CoinEyePath() {
  const pierCoins = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    return [0, 0.14, 3.2 + t * 8.6] as [number, number, number];
  });
  const bankCoins = Array.from({ length: 5 }, (_, i) => {
    const t = (i + 1) / 6;
    return [0.35 + t * 1.9, 0.14, -0.2 - t * 0.85] as [number, number, number];
  });
  return (
    <group>
      {[...pierCoins, ...bankCoins].map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 0.4]} position={p} receiveShadow>
          <circleGeometry args={[0.22, 16]} />
          <meshStandardMaterial
            color="#fcd34d"
            emissive="#f59e0b"
            emissiveIntensity={0.22}
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Soft sand berms + grass tufts — vertical soft edges without clutter. */
export function ShoreBerms() {
  const berms: [number, number, number, number][] = [
    [10.5, 0.2, -6.5, 1.8],
    [-11.2, 0.25, -4.2, 2.1],
    [9.8, 0.18, 7.5, 1.6],
    [-8.5, 0.22, 8.8, 1.9],
    [5.5, 0.28, -12.5, 2.4],
  ];
  return (
    <group>
      {berms.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow receiveShadow scale={[1, 0.35, 1]}>
            <sphereGeometry args={[r, 12, 8]} />
            <meshStandardMaterial color="#e8d4a8" roughness={0.95} flatShading />
          </mesh>
          {[0, 1, 2].map((j) => (
            <mesh
              key={j}
              castShadow
              position={[Math.cos(j * 2.1) * r * 0.45, 0.35, Math.sin(j * 2.1) * r * 0.45]}
            >
              <sphereGeometry args={[0.35 + (j % 2) * 0.12, 8, 6]} />
              <meshStandardMaterial color="#4ade80" roughness={0.75} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Soft pennant banners — tall vertical beats that move. */
export function HarborBanners() {
  const poles: [number, number, number, string][] = [
    [-4.2, 0, 6.5, "#f472b6"],
    [4.8, 0, 5.8, "#38bdf8"],
    [-6.8, 0, -3.5, "#a78bfa"],
    [6.2, 0, -2.8, "#fbbf24"],
  ];
  return (
    <group>
      {poles.map(([x, , z, color], i) => (
        <BannerPole key={i} position={[x, 0, z]} color={color} phase={i * 0.7} />
      ))}
    </group>
  );
}

function BannerPole({
  position,
  color,
  phase,
}: {
  position: [number, number, number];
  color: string;
  phase: number;
}) {
  const cloth = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!cloth.current) return;
    cloth.current.rotation.y = Math.sin(clock.elapsedTime * 1.4 + phase) * 0.25;
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 3.2, 6]} />
        <meshStandardMaterial color="#57534e" roughness={0.7} metalness={0.25} />
      </mesh>
      <mesh ref={cloth} castShadow position={[0.45, 2.55, 0]}>
        <planeGeometry args={[0.85, 0.55]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.55} />
      </mesh>
      <mesh position={[0, 3.25, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.35} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Shared west quay for utility signposts — one composition, not scattered sticks. */
export function UtilityQuay() {
  return (
    <group position={[-9.4, 0, 0.6]}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[2.8, 0.2, 7.2]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[2.5, 0.08, 6.8]} />
        <meshStandardMaterial color="#78716c" roughness={0.75} />
      </mesh>
      {/* Soft awning rib */}
      <mesh castShadow position={[0.9, 2.1, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.12, 0.08, 6.4]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
      </mesh>
      {([-2.6, 0, 2.6] as const).map((z) => (
        <mesh key={z} castShadow position={[0.85, 1.15, z]}>
          <cylinderGeometry args={[0.07, 0.08, 2.1, 6]} />
          <meshStandardMaterial color="#334155" roughness={0.65} />
        </mesh>
      ))}
      <mesh castShadow position={[0.9, 2.2, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[1.4, 0.06, 6.6]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.55} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/** East utility ledge for settings / family / editor. */
export function EastUtilityLedge() {
  return (
    <group position={[9.1, 0, 1.6]}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[2.4, 0.2, 5.4]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[-0.7, 1.15, -1.6]}>
        <cylinderGeometry args={[0.07, 0.08, 2.1, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[-0.7, 1.15, 1.6]}>
        <cylinderGeometry args={[0.07, 0.08, 2.1, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[-0.75, 2.2, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[1.2, 0.06, 4.8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.55} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/** Bobbing plaza coins — toy culture micro-delight. */
export function PlazaToyCoins() {
  const spots: [number, number, number][] = [
    [-2.4, 0.2, 2.8],
    [3.1, 0.2, 3.4],
    [-1.2, 0.2, -4.5],
  ];
  return (
    <group>
      {spots.map((p, i) => (
        <BobCoin key={i} position={p} phase={i * 1.3} />
      ))}
    </group>
  );
}

function BobCoin({ position, phase }: { position: [number, number, number]; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + phase;
    ref.current.position.y = position[1] + Math.sin(t * 2.2) * 0.12;
    ref.current.rotation.y = t * 1.5;
  });
  return (
    <mesh ref={ref} castShadow position={position}>
      <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
      <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} metalness={0.5} roughness={0.35} />
    </mesh>
  );
}

/** Pier mouth framing — left/right pylons so the Carpet Gate reads as a destination. */
export function PierMouthFrame() {
  return (
    <group position={[0, 0, 11.4]}>
      {([-2.6, 2.6] as const).map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, 1.1, 0]}>
            <boxGeometry args={[0.55, 2.2, 0.55]} />
            <meshStandardMaterial color="#78716c" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.35, 0]}>
            <boxGeometry args={[0.65, 0.2, 0.65]} />
            <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={0.25} metalness={0.35} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0, 2.55, 0]}>
        <boxGeometry args={[5.4, 0.22, 0.4]} />
        <meshStandardMaterial color="#92400e" roughness={0.65} />
      </mesh>
    </group>
  );
}
