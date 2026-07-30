/**
 * Organ-true shore motifs — each spine island must squint as a different mural piece.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MoneyOrgan } from "../moneyOrgans";
import { shoreScale } from "./ledgerlight";

/** Cove — stacked coins that spin when near path. */
export function OrganCoinStacks({ accent = "#fbbf24" }: { accent?: string }) {
  const spots: [number, number, number][] = [
    [shoreScale(-3.2), 0, shoreScale(-2.5)],
    [shoreScale(3.8), 0, shoreScale(-1.8)],
    [shoreScale(-1.5), 0, shoreScale(3.2)],
  ];
  return (
    <group>
      {spots.map((p, i) => (
        <CoinStack key={i} position={p} accent={accent} phase={i * 0.9} />
      ))}
    </group>
  );
}

function CoinStack({
  position,
  accent,
  phase,
}: {
  position: [number, number, number];
  accent: string;
  phase: number;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    g.current.rotation.y = Math.sin(clock.elapsedTime * 0.8 + phase) * 0.15;
  });
  return (
    <group ref={g} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[0, 0.08 + i * 0.1, 0]}
          rotation={[-Math.PI / 2, 0, i * 0.2]}
          onClick={(e) => {
            e.stopPropagation();
            if (g.current) g.current.rotation.y += 0.8;
          }}
        >
          <cylinderGeometry args={[shoreScale(0.28 - i * 0.02), shoreScale(0.28 - i * 0.02), 0.08, 16]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.25}
            metalness={0.5}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Paycheck — floating clock faces + tick markers. */
export function OrganClockField({ accent = "#38bdf8" }: { accent?: string }) {
  const hand = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (hand.current) hand.current.rotation.z = -clock.elapsedTime * 0.6;
  });
  return (
    <group>
      <group position={[shoreScale(0), 0.15, shoreScale(-4.5)]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[shoreScale(1.1), shoreScale(1.35), 32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} />
        </mesh>
        <mesh ref={hand} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[shoreScale(0.08), shoreScale(0.9), 0.04]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} />
        </mesh>
      </group>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const ang = (i / 6) * Math.PI * 2;
        const r = shoreScale(6.5);
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(ang) * r, 0.35, Math.sin(ang) * r]}
          >
            <boxGeometry args={[shoreScale(0.15), shoreScale(0.7), shoreScale(0.15)]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Credit — spiral runes on the ground that slowly turn. */
export function OrganSpiralRunes({ accent = "#a78bfa" }: { accent?: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.12;
  });
  return (
    <group ref={g} position={[0, 0.11, 0]}>
      {[0, 1, 2].map((ring) => (
        <mesh key={ring} rotation={[-Math.PI / 2, 0, ring * 0.4]}>
          <ringGeometry
            args={[
              shoreScale(2.2 + ring * 1.4),
              shoreScale(2.35 + ring * 1.4),
              48,
            ]}
          />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.22 - ring * 0.04}
            transparent
            opacity={0.75}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Harbor memory — soft ledger lines under plaza (when scars exist). */
export function OrganLedgerLines({
  accent = "#f59e0b",
  active = false,
  /** Harbor plaza uses unscaled meters; shores use shoreScale. */
  harborScale = false,
}: {
  accent?: string;
  active?: boolean;
  harborScale?: boolean;
}) {
  if (!active) return null;
  const w = harborScale ? 9.5 : shoreScale(4.5);
  const h = harborScale ? 0.14 : shoreScale(0.12);
  const zs = harborScale ? [-2.2, 0, 2.2] : [-1.2, 0, 1.2];
  return (
    <group>
      {zs.map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, z]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.2}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function OrganShoreMotifs({ organ }: { organ: MoneyOrgan }) {
  if (organ.pathMotif === "coin") return <OrganCoinStacks accent={organ.accentHint} />;
  if (organ.pathMotif === "tick") return <OrganClockField accent={organ.accentHint} />;
  if (organ.pathMotif === "spiral") return <OrganSpiralRunes accent={organ.accentHint} />;
  return null;
}
