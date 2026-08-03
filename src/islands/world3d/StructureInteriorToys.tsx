/**
 * Money Structure toy culture — pokeable interior props (Asobi density).
 * Each theme answers differently when clicked.
 */

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MoneyStructureTheme } from "../moneyStructures";
import { playOrganSfx } from "../audio/capitalSfx";

function pokeCursor(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "auto";
}

/** Poppable cork — Jar Cork Vault organ toy. */
function ToyCork({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Group>(null);
  const [pop, setPop] = useState(0);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    mesh.current.position.y = position[1] + 0.4 + pop * 0.55;
    mesh.current.rotation.z = pop * 0.8;
    if (pop > 0) setPop((p) => Math.max(0, p - dt * 1.8));
  });
  return (
    <group
      ref={mesh}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setPop(1);
        playOrganSfx("coin");
      }}
      onPointerOver={() => pokeCursor(true)}
      onPointerOut={() => pokeCursor(false)}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.55, 12]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/** Bouncy coil — Jar Coin Spring organ toy. */
function ToySpringCoil({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Group>(null);
  const [squash, setSquash] = useState(0);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    const s = 1 + Math.sin(performance.now() * 0.006) * 0.06 - squash * 0.35;
    mesh.current.scale.set(1, Math.max(0.45, s), 1);
    if (squash > 0) setSquash((v) => Math.max(0, v - dt * 2.2));
  });
  return (
    <group
      ref={mesh}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setSquash(1);
        playOrganSfx("coin");
      }}
      onPointerOver={() => pokeCursor(true)}
      onPointerOut={() => pokeCursor(false)}
    >
      {[0, 1, 2].map((i) => (
        <mesh key={i} castShadow position={[0, 0.15 + i * 0.18, 0]} rotation={[0.5, i, 0]}>
          <torusGeometry args={[0.28, 0.06, 6, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/** Spinning coin — Jar / Bank. */
function ToyCoin({
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
    mesh.current.rotation.y += (1.6 + boost) * dt;
    mesh.current.position.y = position[1] + 0.35 + Math.sin(performance.now() * 0.004) * 0.05;
    if (boost > 0) setBoost((b) => Math.max(0, b - dt * 2.8));
  });
  return (
    <mesh
      ref={mesh}
      castShadow
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setBoost(5);
        playOrganSfx("coin");
      }}
      onPointerOver={() => pokeCursor(true)}
      onPointerOut={() => pokeCursor(false)}
    >
      <cylinderGeometry args={[0.32, 0.32, 0.08, 20]} />
      <meshStandardMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={0.4}
        metalness={0.55}
        roughness={0.3}
      />
    </mesh>
  );
}

/** Punchable time dial — Tower. */
function ToyClockFace({ position }: { position: [number, number, number] }) {
  const hand = useRef<THREE.Mesh>(null);
  const [spin, setSpin] = useState(0);
  useFrame((_, dt) => {
    if (!hand.current) return;
    hand.current.rotation.z -= (0.4 + spin) * dt;
    if (spin > 0) setSpin((s) => Math.max(0, s - dt * 1.5));
  });
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setSpin(8);
        playOrganSfx("clock");
      }}
      onPointerOver={() => pokeCursor(true)}
      onPointerOut={() => pokeCursor(false)}
    >
      <mesh castShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 24]} />
        <meshStandardMaterial color="#e0f2fe" metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh ref={hand} position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.06, 0.42, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

/** Interest spiral bead — Keep. */
function ToySpiralBead({
  position,
  phase = 0,
}: {
  position: [number, number, number];
  phase?: number;
}) {
  const g = useRef<THREE.Group>(null);
  const [boost, setBoost] = useState(0);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    g.current.rotation.y = clock.elapsedTime * (0.8 + boost * 0.4) + phase;
    g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + phase) * 0.08;
    if (boost > 0) setBoost((b) => Math.max(0, b - dt * 2));
  });
  return (
    <group
      ref={g}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setBoost(6);
        playOrganSfx("spiral");
      }}
      onPointerOver={() => pokeCursor(true)}
      onPointerOut={() => pokeCursor(false)}
    >
      <mesh castShadow>
        <torusGeometry args={[0.38, 0.1, 8, 20]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.45}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

/** Brass stamp — Bank. */
function ToyStamp({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [press, setPress] = useState(0);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    mesh.current.position.y = position[1] + 0.55 - press * 0.25;
    if (press > 0) setPress((p) => Math.max(0, p - dt * 2.2));
  });
  return (
    <group
      position={[position[0], 0, position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setPress(1);
        playOrganSfx("memory");
      }}
      onPointerOver={() => pokeCursor(true)}
      onPointerOut={() => pokeCursor(false)}
    >
      <mesh ref={mesh} castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.55, 12]} />
        <meshStandardMaterial color="#b45309" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.4, 0.42, 0.1, 12]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
    </group>
  );
}

/** Theme floor inlays — organ silhouette underfoot. */
export function StructureFloorMotif({ theme }: { theme: MoneyStructureTheme }) {
  if (theme === "tower") {
    return (
      <group>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, (i / 4) * Math.PI]} position={[0, 0.04, 0]}>
            <planeGeometry args={[0.18, 7.5]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.25}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2.4, 2.65, 32]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.2} />
        </mesh>
      </group>
    );
  }
  if (theme === "keep") {
    return (
      <group>
        {[0, 1, 2].map((ring) => (
          <mesh key={ring} rotation={[-Math.PI / 2, 0, ring * 0.35]} position={[0, 0.04, 0]}>
            <ringGeometry args={[1.6 + ring * 1.1, 1.75 + ring * 1.1, 40]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#7c3aed"
              emissiveIntensity={0.22 - ring * 0.04}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    );
  }
  if (theme === "bank") {
    return (
      <group>
        {[-1.4, 0, 1.4].map((z, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, z]}>
            <planeGeometry args={[7.5, 0.14]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#d97706"
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
  // jar — coin mosaic
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[Math.cos(a) * 3.2, 0.04, Math.sin(a) * 3.2]}
          >
            <circleGeometry args={[0.45, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Pokeable cluster for the interior — denser micro-delights. */
export function StructureToyCulture({ theme }: { theme: MoneyStructureTheme }) {
  if (theme === "tower") {
    return (
      <group>
        <ToyClockFace position={[-2.2, 0, 2.4]} />
        <ToyClockFace position={[2.6, 0, 1.8]} />
        <ToyClockFace position={[0, 0, -3.8]} />
        <ToyCoin position={[0.8, 0, 3.5]} accent="#38bdf8" />
        <ToyCoin position={[-3.4, 0, -0.5]} accent="#7dd3fc" />
        <ToyCoin position={[3.2, 0, -2.2]} accent="#bae6fd" />
      </group>
    );
  }
  if (theme === "keep") {
    return (
      <group>
        <ToySpiralBead position={[-2.4, 0.2, 2.2]} phase={0} />
        <ToySpiralBead position={[2.8, 0.2, 1.6]} phase={1.2} />
        <ToySpiralBead position={[0.2, 0.2, 3.6]} phase={2.4} />
        <ToySpiralBead position={[-1.5, 0.2, -3.5]} phase={3.1} />
        <ToyCoin position={[-3.2, 0, -1.2]} accent="#a78bfa" />
        <ToyCoin position={[3.4, 0, -0.8]} accent="#c4b5fd" />
      </group>
    );
  }
  if (theme === "bank") {
    return (
      <group>
        <ToyStamp position={[-2.6, 0, 2.5]} />
        <ToyStamp position={[2.4, 0, 2.0]} />
        <ToyStamp position={[0.2, 0, -4.0]} />
        <ToyCoin position={[0.5, 0, 3.8]} accent="#f59e0b" />
        <ToyCoin position={[-1.8, 0, 3.2]} accent="#fbbf24" />
        <ToyCoin position={[3.0, 0, -1.5]} accent="#fde68a" />
      </group>
    );
  }
  // jar — coin mosaic + cork / spring organ toys (no stray bank stamp)
  return (
    <group>
      <ToyCork position={[-2.8, 0, 2.4]} />
      <ToySpringCoil position={[2.8, 0, 2.0]} />
      <ToyCoin position={[-2.4, 0, 2.6]} />
      <ToyCoin position={[2.6, 0, 2.2]} />
      <ToyCoin position={[0.2, 0, 3.8]} accent="#fde68a" />
      <ToyCoin position={[-3.5, 0, -0.8]} accent="#f59e0b" />
      <ToyCoin position={[3.2, 0, -1.4]} />
      <ToyCoin position={[-1.2, 0, -3.8]} accent="#fbbf24" />
      <ToyCoin position={[1.8, 0, -4.2]} accent="#fde68a" />
      <ToyCork position={[0.4, 0, -3.6]} />
      <ToySpringCoil position={[-0.6, 0, 3.2]} />
    </group>
  );
}
