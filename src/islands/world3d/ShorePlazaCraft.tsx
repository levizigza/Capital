/**
 * Shore visual rhythm — Harbor craft language adapted per island culture.
 * Vertical tiers, eye trail from pier, berms, banners, pier mouth frame.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";
import type { IslandCulture } from "../islandCulture";
import { SHORE_WORLD_SCALE, shoreScale } from "./ledgerlight";

type CraftProps = {
  look: EraLook3D;
  culture: IslandCulture;
  pier: [number, number, number];
};

/** Raised plaza + warm collar — breaks flat pancake shores. */
export function ShorePlazaTier({ look, culture }: Pick<CraftProps, "look" | "culture">) {
  const r =
    (culture.layout === "radar" ? 10.2 : culture.layout === "keep" ? 7.2 : 8.8) * SHORE_WORLD_SCALE;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial color={look.shore} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[r, r + shoreScale(0.35), 0.14, 40]} />
        <meshStandardMaterial color={look.land} roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[r * 0.32, r * 0.38, 36]} />
        <meshStandardMaterial
          color={look.accent}
          emissive={look.accent}
          emissiveIntensity={0.18}
          metalness={0.3}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

/** Coin / accent inlays from pier toward plaza center. */
export function ShoreEyePath({ look, pier }: Pick<CraftProps, "look" | "pier">) {
  const coins = Array.from({ length: 8 }, (_, i) => {
    const t = (i + 1) / 9;
    return [pier[0] * (1 - t), 0.13, pier[2] * (1 - t)] as [number, number, number];
  });
  return (
    <group>
      {coins.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 0.35]} position={p} receiveShadow>
          <circleGeometry args={[shoreScale(0.2), 14]} />
          <meshStandardMaterial
            color={look.accent}
            emissive={look.accent}
            emissiveIntensity={0.28}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ShoreBerms({ look }: Pick<CraftProps, "look">) {
  const berms: [number, number, number, number][] = [
    [shoreScale(10.2), shoreScale(0.18), shoreScale(-5.5), shoreScale(1.6)],
    [shoreScale(-10.8), shoreScale(0.22), shoreScale(-3.8), shoreScale(1.9)],
    [shoreScale(9.2), shoreScale(0.16), shoreScale(7.2), shoreScale(1.5)],
    [shoreScale(-8.4), shoreScale(0.2), shoreScale(8.0), shoreScale(1.7)],
  ];
  return (
    <group>
      {berms.map(([x, y, z, rad], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow receiveShadow scale={[1, 0.32, 1]}>
            <sphereGeometry args={[rad, 10, 7]} />
            <meshStandardMaterial color={look.land} roughness={0.92} flatShading />
          </mesh>
          {[0, 1].map((j) => (
            <mesh
              key={j}
              castShadow
              position={[Math.cos(j + i) * rad * 0.4, rad * 0.25, Math.sin(j + i) * rad * 0.4]}
            >
              <sphereGeometry args={[rad * 0.22, 7, 5]} />
              <meshStandardMaterial color="#4ade80" roughness={0.75} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Banner({
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
    cloth.current.rotation.y = Math.sin(clock.elapsedTime * 1.35 + phase) * 0.28;
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, shoreScale(1.5), 0]}>
        <cylinderGeometry args={[shoreScale(0.05), shoreScale(0.06), shoreScale(3.0), 6]} />
        <meshStandardMaterial color="#57534e" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh ref={cloth} castShadow position={[shoreScale(0.4), shoreScale(2.4), 0]}>
        <planeGeometry args={[shoreScale(0.75), shoreScale(0.5)]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function ShoreBanners({ look, culture }: Pick<CraftProps, "look" | "culture">) {
  const r = shoreScale(culture.layout === "keep" ? 5.5 : 7.2);
  const colors = [look.accent, "#fbbf24", "#38bdf8", "#f472b6"];
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const ang = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <Banner
            key={i}
            position={[Math.cos(ang) * r, 0, Math.sin(ang) * r]}
            color={colors[i % colors.length]!}
            phase={i * 0.8}
          />
        );
      })}
    </group>
  );
}

/** Frame the pier approach so arriving by carpet reads as a gate. */
export function ShorePierMouth({ look, pier }: Pick<CraftProps, "look" | "pier">) {
  const z = pier[2] * 0.82;
  return (
    <group position={[0, 0, z]}>
      {([-shoreScale(2.4), shoreScale(2.4)] as const).map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, shoreScale(1.0), 0]}>
            <boxGeometry args={[shoreScale(0.5), shoreScale(2.0), shoreScale(0.5)]} />
            <meshStandardMaterial color={look.land} roughness={0.8} />
          </mesh>
          <mesh position={[0, shoreScale(2.15), 0]}>
            <boxGeometry args={[shoreScale(0.6), shoreScale(0.18), shoreScale(0.6)]} />
            <meshStandardMaterial
              color={look.accent}
              emissive={look.accent}
              emissiveIntensity={0.28}
              metalness={0.35}
            />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0, shoreScale(2.35), 0]}>
        <boxGeometry args={[shoreScale(5.0), shoreScale(0.2), shoreScale(0.35)]} />
        <meshStandardMaterial color={look.accent} roughness={0.55} />
      </mesh>
      {/* Soft painting portal hint above pier */}
      <mesh position={[0, shoreScale(1.4), shoreScale(0.2)]}>
        <planeGeometry args={[shoreScale(1.8), shoreScale(2.0)]} />
        <meshStandardMaterial
          color={look.accent}
          emissive={look.accent}
          emissiveIntensity={0.35}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Full shore craft kit — one call from ShoreScene. */
export function ShoreRhythmCraft({ look, culture, pier }: CraftProps) {
  return (
    <group>
      <ShoreBerms look={look} />
      <ShorePlazaTier look={look} culture={culture} />
      <ShoreEyePath look={look} pier={pier} />
      <ShoreBanners look={look} culture={culture} />
      <ShorePierMouth look={look} pier={pier} />
    </group>
  );
}
