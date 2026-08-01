/**
 * Shore toy props — Asobi "toy culture": pokeable, not decoration.
 * Pokes speak the shore organ leitmotif (Coin / Clock / Spiral).
 */

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { playOrganSfx } from "../audio/capitalSfx";

/** Spinning coin you can click — tiny delight on every shore. */
export function ShoreSpinCoin({
  position,
  accent = "#fbbf24",
}: {
  position: [number, number, number];
  accent?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [boost, setBoost] = useState(0);

  useFrame((_, dt) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += (1.4 + boost) * dt;
    mesh.current.position.y = position[1] + 0.45 + Math.sin(performance.now() * 0.003) * 0.06;
    if (boost > 0) setBoost((b) => Math.max(0, b - dt * 2.5));
  });

  return (
    <mesh
      ref={mesh}
      castShadow
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setBoost(4);
        playOrganSfx("coin");
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <cylinderGeometry args={[0.28, 0.28, 0.08, 20]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} metalness={0.55} roughness={0.35} />
    </mesh>
  );
}

/** Ringing bell near the pier — click for a wobble. */
export function ShoreBell({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const [ring, setRing] = useState(0);

  useFrame((_, dt) => {
    if (!group.current) return;
    const sway = Math.sin(performance.now() * 0.008 + ring) * (0.08 + ring * 0.04);
    group.current.rotation.z = sway;
    if (ring > 0) setRing((r) => Math.max(0, r - dt * 1.8));
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setRing(3);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.25} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, 0.12]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

/** Clock face toy — Paycheck organ poke. */
export function ShoreClockToy({
  position,
  accent = "#38bdf8",
}: {
  position: [number, number, number];
  accent?: string;
}) {
  const hand = useRef<THREE.Mesh>(null);
  const [spin, setSpin] = useState(0);

  useFrame((_, dt) => {
    if (!hand.current) return;
    hand.current.rotation.z -= (0.4 + spin) * dt;
    if (spin > 0) setSpin((s) => Math.max(0, s - dt * 2));
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setSpin(5);
        playOrganSfx("clock");
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh castShadow position={[0, 0.55, 0]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.4, 0.1, 20]} />
        <meshStandardMaterial color="#e2e8f0" emissive={accent} emissiveIntensity={0.2} metalness={0.35} />
      </mesh>
      <mesh ref={hand} position={[0, 0.55, 0.06]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.06, 0.28, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Interest spiral toy — Credit organ poke. */
export function ShoreSpiralToy({
  position,
  accent = "#a78bfa",
}: {
  position: [number, number, number];
  accent?: string;
}) {
  const coil = useRef<THREE.Group>(null);
  const [boost, setBoost] = useState(0);

  useFrame((_, dt) => {
    if (!coil.current) return;
    coil.current.rotation.y += (0.7 + boost) * dt;
    if (boost > 0) setBoost((b) => Math.max(0, b - dt * 2.2));
  });

  return (
    <group
      ref={coil}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setBoost(4);
        playOrganSfx("spiral");
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.cos(i * 1.2) * 0.22, 0.35 + i * 0.18, Math.sin(i * 1.2) * 0.22]}
          rotation={[0.4, i * 0.5, 0]}
        >
          <torusGeometry args={[0.2 - i * 0.02, 0.045, 6, 14]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
