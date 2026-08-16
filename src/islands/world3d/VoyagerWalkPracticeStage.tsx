/**
 * Ashore living-money chamber — Portal-style prove-it room.
 * One pad morphs: fantasy toys → walk rings → Piggy talk → Cove carpet board.
 * Not Harbor; not a new island.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";
import { SafeText } from "./SafeText";
import { MoneyCarpet } from "./MoneyCarpet";
import { mergeWalkIntent, type WalkIntent } from "../input/walkIntent";
import { stepWalkVelocity, type WalkVelocity } from "../input/walkFeel";
import { prefersReducedMotion } from "../a11yMotion";
import type { MoneyOrganId } from "../moneyOrgans";
import { MONEY_ORGANS } from "../moneyOrgans";
import { playOrganSfx } from "../audio/capitalSfx";
import { SEED_PETAL_ANGLES } from "../sacredGeometry";

export type PracticeMarker = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
};

export type PracticeMode = "fantasy" | "walk" | "talk" | "dock" | "showcase";

type Props = {
  character: CapitalCharacter;
  mode: PracticeMode;
  markers?: PracticeMarker[];
  claimed?: string[];
  onClaimMarker?: (id: string) => void;
  talkTarget?: [number, number, number];
  nearTalk?: boolean;
  onNearTalkChange?: (near: boolean) => void;
  fantasyPoked?: MoneyOrganId[];
  onPokeOrgan?: (id: MoneyOrganId) => void;
  carpetBoarded?: boolean;
  onBoardCove?: () => void;
  className?: string;
};

const PAD_R = 4.2;
const CLAIM_R = 0.85;
const TALK_R = 1.15;
const TOY_R = 1.05;

const ORGAN_TOYS: { id: MoneyOrganId; position: [number, number, number]; label: string }[] = [
  { id: "memory", position: [-2.35, 0, -0.4], label: "Memory" },
  { id: "coin", position: [2.35, 0, -0.4], label: "Coin" },
];

function SeedFloor({ lit = 0 }: { lit?: number }) {
  const reduced = prefersReducedMotion();
  const pulse = useRef(0);
  useFrame(({ clock }) => {
    pulse.current = reduced ? 0.2 : 0.18 + Math.sin(clock.elapsedTime * 1.4) * 0.06;
  });
  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PAD_R * 0.42, PAD_R * 0.48, 64]} />
        <meshBasicMaterial
          color="#a7f3d0"
          transparent
          opacity={0.22 + lit * 0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PAD_R * 0.72, PAD_R * 0.78, 64]} />
        <meshBasicMaterial
          color="#99f6e4"
          transparent
          opacity={0.16 + lit * 0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {SEED_PETAL_ANGLES.map((angle, i) => {
        const r = PAD_R * 0.38;
        const cx = Math.cos(angle) * r * 0.55;
        const cz = Math.sin(angle) * r * 0.55;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.005, cz]}>
            <ringGeometry args={[r * 0.88, r, 40]} />
            <meshBasicMaterial
              color="#6ee7b7"
              transparent
              opacity={0.1 + lit * 0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function OrganToyMesh({
  id,
  position,
  label,
  lit,
  onPoke,
}: {
  id: MoneyOrganId;
  position: [number, number, number];
  label: string;
  lit: boolean;
  onPoke?: (id: MoneyOrganId) => void;
}) {
  const accent = MONEY_ORGANS[id].accentHint;
  const mesh = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 2 + position[0]) * (lit ? 0.08 : 0.05);
    mesh.current.rotation.y = clock.elapsedTime * (lit ? 0.55 : 0.25);
  });

  const poke = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    playOrganSfx(id);
    onPoke?.(id);
  };

  return (
    <group position={position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        onPointerUp={poke}
        onClick={poke}
      >
        <ringGeometry args={[0.55, 0.95, 28]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={lit ? 0.65 : 0.3}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>
      <group
        ref={mesh}
        onPointerUp={poke}
        onClick={poke}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {id === "memory" ? (
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.95, 0.35]} />
            <meshStandardMaterial
              color="#94a3b8"
              emissive={lit ? accent : "#334155"}
              emissiveIntensity={lit ? 0.45 : 0.12}
              metalness={0.35}
              roughness={0.4}
            />
          </mesh>
        ) : (
          <mesh castShadow>
            <cylinderGeometry args={[0.38, 0.42, 0.85, 16]} />
            <meshStandardMaterial
              color="#fde68a"
              emissive={lit ? accent : "#b45309"}
              emissiveIntensity={lit ? 0.5 : 0.15}
              metalness={0.4}
              roughness={0.35}
            />
          </mesh>
        )}
        <Billboard position={[0, 1.15, 0]} follow>
          <SafeText
            fontSize={0.26}
            color={lit ? "#fef3c7" : "#e2e8f0"}
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            {lit ? `${label} · alive` : `Poke ${label}`}
          </SafeText>
        </Billboard>
      </group>
    </group>
  );
}

function CoveCarpetGate({
  boarded,
  onBoard,
}: {
  boarded: boolean;
  onBoard?: () => void;
}) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!root.current || boarded) return;
    root.current.position.y = 0.15 + Math.sin(clock.elapsedTime * 2.2) * 0.06;
  });
  const board = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    playOrganSfx("coin");
    onBoard?.();
  };
  return (
    <group position={[0, 0.1, -2.4]} ref={root}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onPointerUp={board}
        onClick={board}
      >
        <ringGeometry args={[1.1, 1.55, 36]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={boarded ? 0.2 : 0.55}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <group
        scale={0.85}
        rotation={[0, Math.PI, 0]}
        onPointerUp={board}
        onClick={board}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <MoneyCarpet flying={!boarded} hideRider showBuddy={false} />
      </group>
      <Billboard position={[0, 1.9, 0]} follow>
        <SafeText
          fontSize={0.28}
          color="#fde68a"
          anchorX="center"
          outlineWidth={0.02}
          outlineColor="#0f172a"
        >
          {boarded ? "Cove boarded" : "Board Coincraft Cove"}
        </SafeText>
      </Billboard>
    </group>
  );
}

function MarkerMesh({
  marker,
  claimed,
}: {
  marker: PracticeMarker;
  claimed: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current || claimed) return;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.2;
    mesh.current.position.y = 0.08 + Math.sin(clock.elapsedTime * 2.2) * 0.04;
  });
  return (
    <group position={marker.position}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.75, 28]} />
        <meshStandardMaterial
          color={marker.color}
          emissive={marker.color}
          emissiveIntensity={claimed ? 0.08 : 0.4}
          transparent
          opacity={claimed ? 0.25 : 0.9}
          depthWrite={false}
        />
      </mesh>
      {!claimed ? (
        <Billboard position={[0, 1.15, 0]} follow>
          <SafeText
            fontSize={0.28}
            color={marker.color}
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            {marker.label}
          </SafeText>
        </Billboard>
      ) : null}
    </group>
  );
}

function PiggyTalkRing({
  position,
  near,
}: {
  position: [number, number, number];
  near: boolean;
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.9, 1.25, 32]} />
        <meshStandardMaterial
          color="#f9a8d4"
          emissive="#ec4899"
          emissiveIntensity={near ? 0.55 : 0.28}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.55, 20, 16]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[-0.38, 1.25, 0]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#f472b6" />
      </mesh>
      <mesh position={[0.38, 1.25, 0]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#f472b6" />
      </mesh>
      <Billboard position={[0, 1.85, 0]} follow>
        <SafeText
          fontSize={0.26}
          color="#fde68a"
          anchorX="center"
          outlineWidth={0.02}
          outlineColor="#0f172a"
        >
          {near ? "Piggy · Press E" : "Piggy Penny"}
        </SafeText>
      </Billboard>
    </group>
  );
}

const CARPET_POS: [number, number, number] = [0, 0, -2.4];
const CARPET_R = 1.35;

function PracticePlayer({
  character,
  markers,
  claimed,
  onClaimMarker,
  talkTarget,
  onNearTalkChange,
  inputEnabled,
  organToys,
  fantasyPoked,
  onPokeOrgan,
  carpetBoarded,
  onBoardCove,
}: {
  character: CapitalCharacter;
  markers: PracticeMarker[];
  claimed: string[];
  onClaimMarker?: (id: string) => void;
  talkTarget?: [number, number, number];
  onNearTalkChange?: (near: boolean) => void;
  inputEnabled: boolean;
  organToys?: typeof ORGAN_TOYS;
  fantasyPoked?: MoneyOrganId[];
  onPokeOrgan?: (id: MoneyOrganId) => void;
  carpetBoarded?: boolean;
  onBoardCove?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef<WalkIntent>({ f: false, b: false, l: false, r: false });
  const vel = useRef<WalkVelocity>({ x: 0, z: 0 });
  const [moving, setMoving] = useState(false);
  const nearRef = useRef(false);
  const yaw = useRef(0);
  const pokedNear = useRef<Set<string>>(new Set());
  const boardedRef = useRef(false);

  useEffect(() => {
    if (!inputEnabled) {
      keys.current = { f: false, b: false, l: false, r: false };
      return;
    }
    const down = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") keys.current.f = true;
      if (e.key === "s" || e.key === "ArrowDown") keys.current.b = true;
      if (e.key === "a" || e.key === "ArrowLeft") keys.current.l = true;
      if (e.key === "d" || e.key === "ArrowRight") keys.current.r = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") keys.current.f = false;
      if (e.key === "s" || e.key === "ArrowDown") keys.current.b = false;
      if (e.key === "a" || e.key === "ArrowLeft") keys.current.l = false;
      if (e.key === "d" || e.key === "ArrowRight") keys.current.r = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.current = { f: false, b: false, l: false, r: false };
    };
  }, [inputEnabled]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const k = mergeWalkIntent(keys.current);
    let forward = 0;
    if (k.f) forward += 1;
    if (k.b) forward -= 1;
    if (k.l) yaw.current += dt * 2.4;
    if (k.r) yaw.current -= dt * 2.4;

    const stepped = stepWalkVelocity(vel.current, {
      forward,
      yaw: yaw.current,
      dt,
      speed: 4.2,
    });
    vel.current = stepped.vel;
    setMoving(stepped.moving);

    let x = group.current.position.x + stepped.vel.x * dt;
    let z = group.current.position.z + stepped.vel.z * dt;
    const dist = Math.hypot(x, z);
    if (dist > PAD_R) {
      x = (x / dist) * PAD_R;
      z = (z / dist) * PAD_R;
    }
    group.current.position.x = x;
    group.current.position.z = z;
    group.current.rotation.y = yaw.current;

    for (const m of markers) {
      if (claimed.includes(m.id)) continue;
      const dx = x - m.position[0];
      const dz = z - m.position[2];
      if (Math.hypot(dx, dz) < CLAIM_R) onClaimMarker?.(m.id);
    }

    if (organToys && onPokeOrgan) {
      for (const toy of organToys) {
        if (fantasyPoked?.includes(toy.id)) continue;
        const dx = x - toy.position[0];
        const dz = z - toy.position[2];
        if (Math.hypot(dx, dz) < TOY_R && !pokedNear.current.has(toy.id)) {
          pokedNear.current.add(toy.id);
          playOrganSfx(toy.id);
          onPokeOrgan(toy.id);
        }
      }
    }

    if (talkTarget) {
      const near = Math.hypot(x - talkTarget[0], z - talkTarget[2]) < TALK_R;
      if (near !== nearRef.current) {
        nearRef.current = near;
        onNearTalkChange?.(near);
      }
    }

    if (onBoardCove && !carpetBoarded && !boardedRef.current) {
      const dx = x - CARPET_POS[0];
      const dz = z - CARPET_POS[2];
      if (Math.hypot(dx, dz) < CARPET_R) {
        boardedRef.current = true;
        playOrganSfx("coin");
        onBoardCove();
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.6]}>
      <VoyagerMesh character={character} pose={moving ? "run" : "stand"} scale={1.05} />
    </group>
  );
}

function ChamberCamera({ mode }: { mode: PracticeMode }) {
  useFrame(({ camera }) => {
    const targets: Record<PracticeMode, THREE.Vector3> = {
      fantasy: new THREE.Vector3(0, 5.2, 6.4),
      walk: new THREE.Vector3(0, 5.8, 7.2),
      talk: new THREE.Vector3(0, 5.4, 6.8),
      dock: new THREE.Vector3(0, 4.8, 6.0),
      showcase: new THREE.Vector3(0, 5.2, 6.4),
    };
    const look: Record<PracticeMode, THREE.Vector3> = {
      fantasy: new THREE.Vector3(0, 0.7, -0.2),
      walk: new THREE.Vector3(0, 0.6, 0),
      talk: new THREE.Vector3(0, 0.7, -1.2),
      dock: new THREE.Vector3(0, 0.5, -1.8),
      showcase: new THREE.Vector3(0, 0.6, 0),
    };
    camera.position.lerp(targets[mode], 0.06);
    const cur = new THREE.Vector3();
    camera.getWorldDirection(cur);
    const aim = look[mode].clone().sub(camera.position).normalize();
    // soft lookAt via lerp of a focus point
    const focus = new THREE.Vector3().copy(camera.position).add(cur);
    focus.lerp(look[mode], 0.08);
    camera.lookAt(focus);
    void aim;
  });
  return null;
}

function PracticeWorld({
  character,
  mode,
  markers = WALK_MARKERS,
  claimed = [],
  onClaimMarker,
  talkTarget,
  nearTalk,
  onNearTalkChange,
  fantasyPoked = [],
  onPokeOrgan,
  carpetBoarded = false,
  onBoardCove,
}: Omit<Props, "className">) {
  const inputEnabled =
    mode === "walk" || mode === "talk" || mode === "fantasy" || mode === "dock";
  const litCount = fantasyPoked.length;

  return (
    <>
      <color attach="background" args={["#0a1a28"]} />
      <fog attach="fog" args={["#0a1a28", 14, 32]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 8, 3]} intensity={1.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} />
      <hemisphereLight args={["#fde68a", "#0f172a", 0.42]} />
      <ChamberCamera mode={mode} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[PAD_R + 0.45, 56]} />
        <meshStandardMaterial color="#122033" roughness={0.88} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[PAD_R + 0.12, PAD_R + 0.42, 56]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.32}
          transparent
          opacity={0.55}
        />
      </mesh>
      <SeedFloor lit={litCount} />

      {[-1.2, 0, 1.2].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, z]}>
          <planeGeometry args={[6.2, 0.06]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.28}
            transparent
            opacity={0.32}
            depthWrite={false}
          />
        </mesh>
      ))}

      {mode === "fantasy"
        ? ORGAN_TOYS.map((t) => (
            <OrganToyMesh
              key={t.id}
              id={t.id}
              position={t.position}
              label={t.label}
              lit={fantasyPoked.includes(t.id)}
              onPoke={onPokeOrgan}
            />
          ))
        : null}

      {mode === "walk"
        ? markers.map((m) => (
            <MarkerMesh key={m.id} marker={m} claimed={claimed.includes(m.id)} />
          ))
        : null}

      {mode === "talk" && talkTarget ? (
        <PiggyTalkRing position={talkTarget} near={Boolean(nearTalk)} />
      ) : null}

      {mode === "dock" ? (
        <CoveCarpetGate boarded={carpetBoarded} onBoard={onBoardCove} />
      ) : null}

      <PracticePlayer
        character={character}
        markers={mode === "walk" ? markers : []}
        claimed={claimed}
        onClaimMarker={onClaimMarker}
        talkTarget={mode === "talk" ? talkTarget : undefined}
        onNearTalkChange={onNearTalkChange}
        inputEnabled={inputEnabled}
        organToys={mode === "fantasy" ? ORGAN_TOYS : undefined}
        fantasyPoked={fantasyPoked}
        onPokeOrgan={mode === "fantasy" ? onPokeOrgan : undefined}
        carpetBoarded={mode === "dock" ? carpetBoarded : true}
        onBoardCove={mode === "dock" ? onBoardCove : undefined}
      />
    </>
  );
}

export const WALK_MARKERS: PracticeMarker[] = [
  { id: "right", label: "Right", position: [2.4, 0, 0.2], color: "#38bdf8" },
  { id: "left", label: "Left", position: [-2.4, 0, 0.2], color: "#a78bfa" },
  { id: "forward", label: "Forward", position: [0, 0, -2.5], color: "#fbbf24" },
];

export const TALK_TARGET: [number, number, number] = [0, 0, -2.2];

export function VoyagerWalkPracticeStage({
  character,
  mode,
  markers = WALK_MARKERS,
  claimed = [],
  onClaimMarker,
  talkTarget = TALK_TARGET,
  nearTalk = false,
  onNearTalkChange,
  fantasyPoked = [],
  onPokeOrgan,
  carpetBoarded = false,
  onBoardCove,
  className,
}: Props) {
  const [ready, setReady] = useState(false);
  const reduced = prefersReducedMotion();
  const claimedKey = claimed.join("|");
  const claimedStable = useMemo(() => claimed, [claimedKey]);
  const pokedKey = fantasyPoked.join("|");
  const pokedStable = useMemo(() => fantasyPoked, [pokedKey]);

  // Failsafe — never leave “Setting the practice pad…” forever
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 2200);
    return () => window.clearTimeout(t);
  }, [ready]);

  return (
    <div
      className={className ?? "relative h-full w-full"}
      data-testid="voyager-walk-practice"
      data-practice-mode={mode}
    >
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-white/70">
          The chamber wakes…
        </div>
      ) : null}
      <Canvas
        dpr={reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 5.2, 6.4], fov: 40, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0.7, -0.2);
          gl.setClearColor("#071018", 1);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <PracticeWorld
            character={character}
            mode={mode}
            markers={markers}
            claimed={claimedStable}
            onClaimMarker={onClaimMarker}
            talkTarget={talkTarget}
            nearTalk={nearTalk}
            onNearTalkChange={onNearTalkChange}
            fantasyPoked={pokedStable}
            onPokeOrgan={onPokeOrgan}
            carpetBoarded={carpetBoarded}
            onBoardCove={onBoardCove}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
