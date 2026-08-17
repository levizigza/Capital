/**
 * Pre-carpet walk chamber — see your Voyager move on a tiny pad.
 * Not Harbor; not a new island. Portal-style prove-it room.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";
import { SafeText } from "./SafeText";
import { mergeWalkIntent, type WalkIntent } from "../input/walkIntent";
import { stepWalkVelocity, type WalkVelocity } from "../input/walkFeel";
import { prefersReducedMotion } from "../a11yMotion";

export type PracticeMarker = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
};

type Mode = "walk" | "talk" | "showcase";

type Props = {
  character: CapitalCharacter;
  mode: Mode;
  markers?: PracticeMarker[];
  /** Marker ids already claimed */
  claimed?: string[];
  onClaimMarker?: (id: string) => void;
  /** Talk ring center */
  talkTarget?: [number, number, number];
  nearTalk?: boolean;
  onNearTalkChange?: (near: boolean) => void;
  className?: string;
};

const PAD_R = 4.2;
const CLAIM_R = 0.85;
const TALK_R = 1.15;

function MarkerMesh({
  marker,
  claimed,
  onClaim,
}: {
  marker: PracticeMarker;
  claimed: boolean;
  onClaim?: (id: string) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current || claimed) return;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.2;
    mesh.current.position.y = 0.08 + Math.sin(clock.elapsedTime * 2.2) * 0.04;
  });
  return (
    <group
      position={marker.position}
      onClick={(e) => {
        e.stopPropagation();
        if (!claimed) onClaim?.(marker.id);
      }}
      onPointerOver={() => {
        if (!claimed) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
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
      {/* Soft piggy stand-in — pink orb + ears */}
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

function PracticePlayer({
  character,
  markers,
  claimed,
  onClaimMarker,
  talkTarget,
  onNearTalkChange,
  inputEnabled,
}: {
  character: CapitalCharacter;
  markers: PracticeMarker[];
  claimed: string[];
  onClaimMarker?: (id: string) => void;
  talkTarget?: [number, number, number];
  onNearTalkChange?: (near: boolean) => void;
  inputEnabled: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef<WalkIntent>({ f: false, b: false, l: false, r: false });
  const vel = useRef<WalkVelocity>({ x: 0, z: 0 });
  const [moving, setMoving] = useState(false);
  const nearRef = useRef(false);
  const yaw = useRef(0);

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
    // Strafe as yaw nudge so left/right visibly turn the body
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

    if (talkTarget) {
      const near =
        Math.hypot(x - talkTarget[0], z - talkTarget[2]) < TALK_R;
      if (near !== nearRef.current) {
        nearRef.current = near;
        onNearTalkChange?.(near);
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.6]}>
      <VoyagerMesh character={character} pose={moving ? "run" : "stand"} scale={1.05} />
    </group>
  );
}

function PracticeWorld({
  character,
  mode,
  markers,
  claimed,
  onClaimMarker,
  talkTarget,
  nearTalk,
  onNearTalkChange,
}: Omit<Props, "className">) {
  const inputEnabled = mode === "walk" || mode === "talk";
  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 8, 3]} intensity={1.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <hemisphereLight args={["#fde68a", "#0f172a", 0.35]} />

      {/* Living-money pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[PAD_R + 0.35, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[PAD_R + 0.1, PAD_R + 0.35, 48]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.25}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Ledger glow lines */}
      {[-1.2, 0, 1.2].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, z]}>
          <planeGeometry args={[6.5, 0.08]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.3}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      ))}

      {mode === "walk"
        ? markers.map((m) => (
            <MarkerMesh
              key={m.id}
              marker={m}
              claimed={claimed.includes(m.id)}
              onClaim={onClaimMarker}
            />
          ))
        : null}
      {mode === "talk" && talkTarget ? (
        <PiggyTalkRing position={talkTarget} near={Boolean(nearTalk)} />
      ) : null}

      <PracticePlayer
        character={character}
        markers={mode === "walk" ? markers : []}
        claimed={claimed}
        onClaimMarker={onClaimMarker}
        talkTarget={mode === "talk" ? talkTarget : undefined}
        onNearTalkChange={onNearTalkChange}
        inputEnabled={inputEnabled}
      />
    </>
  );
}

/** Public markers for the walk chamber */
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
  className,
}: Props) {
  const [ready, setReady] = useState(false);
  const reduced = prefersReducedMotion();
  const claimedKey = claimed.join("|");
  const claimedStable = useMemo(() => claimed, [claimedKey]);

  return (
    <div
      className={className ?? "relative h-full w-full"}
      data-testid="voyager-walk-practice"
      data-practice-mode={mode}
    >
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-white/70">
          Setting the practice pad…
        </div>
      ) : null}
      <Canvas
        dpr={reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 5.8, 7.2], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0.6, 0);
          gl.setClearColor("#0b1220", 1);
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
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
