import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import type { IslandDefinition } from "../types";
import { getIslandTheme } from "../themes/islandThemes";
import { getEraLook3D, type EraLook3D } from "./eraLooks";
import { VoyagerMesh } from "./VoyagerMesh";
import { WorldLighting } from "./WorldLighting";
import { getAnimationStyle } from "../animationStyles";
import { MoneyBagGuide } from "./MoneyBagGuide";
import { CoinBagBuddyHud } from "../views/CoinBagBuddyHud";

type Props = {
  island: IslandDefinition;
  character?: CapitalCharacter | null;
  title?: string;
  /** Seconds on the clock */
  durationSec?: number;
  /** Value coins needed to clear */
  goalCoins?: number;
  onComplete: (success: boolean, score: number) => void;
  onExit: () => void;
};

const ARENA_R = 11;
const SPEED = 7.2;
const JUMP_V = 9.5;
const GRAVITY = 22;

type Pickup = {
  id: number;
  kind: "value" | "impulse";
  pos: THREE.Vector3;
  taken: boolean;
};

/**
 * Mario Party–style 3D action arena inside a painting.
 * Verbs: WASD move · Space jump · E / click Action to grab nearby value.
 * Goal: bank enough value coins while dodging impulse spends before time runs out.
 */
function ArenaPlayer({
  character,
  animationStyle,
  pickups,
  onGrab,
  onHitImpulse,
  groundedOut,
  playerPosOut,
}: {
  character?: CapitalCharacter | null;
  animationStyle?: string;
  pickups: React.MutableRefObject<Pickup[]>;
  onGrab: (id: number, kind: "value" | "impulse") => void;
  onHitImpulse: () => void;
  groundedOut: React.MutableRefObject<boolean>;
  playerPosOut: React.MutableRefObject<THREE.Vector3>;
}) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false, jump: false, act: false });
  const yaw = useRef(0);
  const vy = useRef(0);
  const { camera } = useThree();
  const moving = useRef(false);
  const actLatch = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") keys.current.f = true;
      if (e.key === "s" || e.key === "ArrowDown") keys.current.b = true;
      if (e.key === "a" || e.key === "ArrowLeft") keys.current.l = true;
      if (e.key === "d" || e.key === "ArrowRight") keys.current.r = true;
      if (e.code === "Space") {
        e.preventDefault();
        keys.current.jump = true;
      }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") keys.current.act = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") keys.current.f = false;
      if (e.key === "s" || e.key === "ArrowDown") keys.current.b = false;
      if (e.key === "a" || e.key === "ArrowLeft") keys.current.l = false;
      if (e.key === "d" || e.key === "ArrowRight") keys.current.r = false;
      if (e.code === "Space") keys.current.jump = false;
      if (e.key === "e" || e.key === "E" || e.key === "Enter") {
        keys.current.act = false;
        actLatch.current = false;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = group.current.position;
    const k = keys.current;

    // Camera-relative tank controls (Mario Party: stick = move)
    const turn = (Number(k.l) - Number(k.r)) * 2.4 * dt;
    yaw.current += turn;
    const forward = Number(k.f) - Number(k.b);
    moving.current = Math.abs(forward) > 0.01 || Math.abs(turn) > 0.001;

    if (Math.abs(forward) > 0.01) {
      p.x += Math.sin(yaw.current) * forward * SPEED * dt;
      p.z += Math.cos(yaw.current) * forward * SPEED * dt;
    }

    // Jump (Action A in Party terms)
    const onGround = p.y <= 0.02 + 0.001;
    groundedOut.current = onGround;
    if (onGround) {
      p.y = 0.02;
      vy.current = 0;
      if (k.jump) {
        vy.current = JUMP_V;
        k.jump = false;
      }
    } else {
      vy.current -= GRAVITY * dt;
      p.y += vy.current * dt;
      if (p.y < 0.02) {
        p.y = 0.02;
        vy.current = 0;
      }
    }

    // Soft arena bounds
    const r = Math.hypot(p.x, p.z);
    if (r > ARENA_R) {
      p.x *= ARENA_R / r;
      p.z *= ARENA_R / r;
    }

    group.current.rotation.y = yaw.current;
    playerPosOut.current.set(p.x, p.y, p.z);

    // Action grab / impulse contact
    for (const pk of pickups.current) {
      if (pk.taken) continue;
      const d = Math.hypot(pk.pos.x - p.x, pk.pos.z - p.z);
      if (pk.kind === "impulse" && d < 0.85 && p.y < 0.9) {
        pk.taken = true;
        onHitImpulse();
      } else if (pk.kind === "value" && d < 1.15) {
        if (k.act && !actLatch.current) {
          actLatch.current = true;
          pk.taken = true;
          onGrab(pk.id, "value");
        } else if (d < 0.55) {
          // Auto-bank when you run through — Party-style forgiveness
          pk.taken = true;
          onGrab(pk.id, "value");
        }
      }
    }

    // Chase cam
    const ideal = new THREE.Vector3(
      p.x - Math.sin(yaw.current) * 8.5,
      5.2 + p.y * 0.3,
      p.z - Math.cos(yaw.current) * 8.5,
    );
    camera.position.lerp(ideal, 1 - Math.pow(0.002, dt));
    camera.lookAt(p.x, 1.1 + p.y, p.z);
  });

  return (
    <group ref={group} position={[0, 0.02, 3]}>
      <VoyagerMesh
        character={character}
        pose={moving.current ? "run" : "stand"}
        scale={1}
        animationStyle={animationStyle}
      />
    </group>
  );
}

function PickupMeshes({
  pickups,
  look,
}: {
  pickups: React.MutableRefObject<Pickup[]>;
  look: EraLook3D;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const pk = pickups.current[i];
      if (!pk || !(child instanceof THREE.Object3D)) return;
      child.visible = !pk.taken;
      child.position.copy(pk.pos);
      child.position.y = pk.pos.y + Math.sin(t * 3 + i) * 0.12;
      child.rotation.y = t * (pk.kind === "value" ? 2 : -1.5);
    });
  });

  return (
    <group ref={group}>
      {pickups.current.map((pk) => (
        <mesh key={pk.id} castShadow>
          {pk.kind === "value" ? (
            <cylinderGeometry args={[0.35, 0.35, 0.12, 16]} />
          ) : (
            <octahedronGeometry args={[0.4, 0]} />
          )}
          <meshStandardMaterial
            color={pk.kind === "value" ? look.accent : "#ef4444"}
            emissive={pk.kind === "value" ? look.accent : "#ef4444"}
            emissiveIntensity={0.45}
            roughness={0.35}
            metalness={0.4}
            flatShading={look.shading === "lowpoly" || look.shading === "neon"}
            wireframe={look.shading === "wire" || look.shading === "vector"}
          />
        </mesh>
      ))}
    </group>
  );
}

function RivalBot({
  seed,
  look,
}: {
  seed: number;
  look: EraLook3D;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + seed;
    const r = 4 + (seed % 3);
    ref.current.position.x = Math.cos(t * 0.7 + seed) * r;
    ref.current.position.z = Math.sin(t * 0.7 + seed) * r;
    ref.current.rotation.y = t * 0.7 + seed + Math.PI / 2;
  });
  return (
    <group ref={ref} position={[0, 0.02, 0]}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.28, 0.55, 4, 8]} />
        <meshStandardMaterial
          color={look.shore}
          emissive={look.accent}
          emissiveIntensity={0.15}
          flatShading
        />
      </mesh>
    </group>
  );
}

function ArenaGuide({
  playerPos,
  pickups,
  tip,
}: {
  playerPos: React.MutableRefObject<THREE.Vector3>;
  pickups: React.MutableRefObject<Pickup[]>;
  tip: string;
}) {
  const lookAtRef = useRef<[number, number, number] | null>([0, 0.5, -2]);
  useFrame(() => {
    let best: Pickup | null = null;
    let bestD = Infinity;
    const p = playerPos.current;
    for (const pk of pickups.current) {
      if (pk.taken || pk.kind !== "value") continue;
      const d = Math.hypot(pk.pos.x - p.x, pk.pos.z - p.z);
      if (d < bestD) {
        bestD = d;
        best = pk;
      }
    }
    lookAtRef.current = best
      ? [best.pos.x, best.pos.y + 0.4, best.pos.z]
      : null;
  });
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <MoneyBagGuide
      lookAtRef={lookAtRef}
      playerPos={playerPos}
      tip={tip}
      reducedMotion={reduced}
    />
  );
}

function ArenaScene({
  island,
  look,
  character,
  animationStyle,
  pickups,
  onGrab,
  onHitImpulse,
  guideTip,
}: {
  island: IslandDefinition;
  look: EraLook3D;
  character?: CapitalCharacter | null;
  animationStyle: string;
  pickups: React.MutableRefObject<Pickup[]>;
  onGrab: (id: number, kind: "value" | "impulse") => void;
  onHitImpulse: () => void;
  guideTip: string;
}) {
  const grounded = useRef(true);
  const playerPos = useRef(new THREE.Vector3(0, 0.02, 3));
  const wire = look.shading === "vector" || look.shading === "wire";

  const platforms = useMemo(
    () => [
      { pos: [0, 0.15, 0] as [number, number, number], size: [8, 0.3, 8] as [number, number, number] },
      { pos: [-5.5, 0.55, -3] as [number, number, number], size: [3.2, 0.35, 3.2] as [number, number, number] },
      { pos: [5.2, 0.85, 2.5] as [number, number, number], size: [2.8, 0.35, 2.8] as [number, number, number] },
      { pos: [0, 1.2, -6] as [number, number, number], size: [3.5, 0.35, 2.2] as [number, number, number] },
    ],
    [],
  );

  return (
    <>
      <WorldLighting look={look} contactShadows={false} shadowMapSize={512} />
      <color attach="background" args={[look.skyTop]} />
      <fog attach="fog" args={[look.fog, 18, 55]} />

      {/* Course floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[ARENA_R + 1.5, 48]} />
        <meshStandardMaterial color={look.land} roughness={0.88} flatShading={!wire} wireframe={wire} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[ARENA_R - 0.4, ARENA_R + 0.3, 48]} />
        <meshStandardMaterial color={look.accent} emissive={look.accent} emissiveIntensity={0.2} wireframe={wire} />
      </mesh>

      {platforms.map((pl, i) => (
        <mesh key={i} position={pl.pos} castShadow receiveShadow>
          <boxGeometry args={pl.size} />
          <meshStandardMaterial
            color={i === 0 ? look.shore : look.land}
            roughness={0.7}
            flatShading
            wireframe={wire}
            emissive={look.accent}
            emissiveIntensity={i > 0 ? 0.12 : 0}
          />
        </mesh>
      ))}

      {/* Painting-world title */}
      <Billboard position={[0, 4.8, -9]} follow>
        <Text fontSize={0.55} color="#fff" outlineWidth={0.04} outlineColor="#0f172a" anchorX="center">
          {island.name}
        </Text>
      </Billboard>

      <PickupMeshes pickups={pickups} look={look} />
      <RivalBot seed={1.2} look={look} />
      <RivalBot seed={2.7} look={look} />

      <ArenaPlayer
        character={character}
        animationStyle={animationStyle}
        pickups={pickups}
        onGrab={onGrab}
        onHitImpulse={onHitImpulse}
        groundedOut={grounded}
        playerPosOut={playerPos}
      />
      <ArenaGuide playerPos={playerPos} pickups={pickups} tip={guideTip} />
    </>
  );
}

export function PartyArenaWorld({
  island,
  character,
  title,
  durationSec = 45,
  goalCoins = 8,
  onComplete,
  onExit,
}: Props) {
  const theme = getIslandTheme(island.id, island.themeId);
  const look = useMemo(() => getEraLook3D(theme.animationStyle), [theme.animationStyle]);
  const era = getAnimationStyle(theme.animationStyle);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"ready" | "play" | "won" | "lost">("ready");
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const ended = useRef(false);
  const coinsRef = useRef(0);
  const timeRef = useRef(durationSec);

  const pickups = useRef<Pickup[]>([]);
  if (pickups.current.length === 0) {
    const list: Pickup[] = [];
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const rad = 3 + (i % 4) * 1.6;
      list.push({
        id: i,
        kind: i % 4 === 0 ? "impulse" : "value",
        pos: new THREE.Vector3(Math.cos(ang) * rad, 0.55, Math.sin(ang) * rad),
        taken: false,
      });
    }
    // Extra value on raised pads
    list.push({ id: 100, kind: "value", pos: new THREE.Vector3(-5.5, 1.1, -3), taken: false });
    list.push({ id: 101, kind: "value", pos: new THREE.Vector3(5.2, 1.4, 2.5), taken: false });
    list.push({ id: 102, kind: "value", pos: new THREE.Vector3(0, 1.75, -6), taken: false });
    pickups.current = list;
  }

  const finish = (success: boolean, score: number) => {
    if (ended.current) return;
    ended.current = true;
    setPhase(success ? "won" : "lost");
    window.setTimeout(() => onComplete(success, score), 900);
  };

  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        window.clearInterval(id);
        finish(coinsRef.current >= goalCoins, coinsRef.current * 12);
      }
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onGrab = (id: number, kind: "value" | "impulse") => {
    if (kind !== "value" || phase !== "play") return;
    coinsRef.current += 1;
    const next = coinsRef.current;
    setCoins(next);
    if (next >= goalCoins) finish(true, next * 12 + timeRef.current);
    void id;
  };

  const onHitImpulse = () => {
    if (phase !== "play") return;
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) finish(false, coins * 5);
      return Math.max(0, next);
    });
  };

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="party-arena-world">
      <Canvas
        shadows
        dpr={reduced ? [1, 1] : [1, 1.35]}
        camera={{ position: [0, 6, 12], fov: 52 }}
        className="absolute inset-0"
        gl={{ antialias: !reduced, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(look.skyTop, 1);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          {phase === "play" || phase === "ready" ? (
            <ArenaScene
              island={island}
              look={look}
              character={character}
              animationStyle={theme.animationStyle}
              pickups={pickups}
              onGrab={onGrab}
              onHitImpulse={onHitImpulse}
              guideTip="Grab the gold value coins — dodge red impulse spends!"
            />
          ) : null}
        </Suspense>
      </Canvas>

      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-white font-bold">
          Diving into the painting…
        </div>
      ) : null}

      {/* Course HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="rounded-2xl border border-white/25 bg-black/55 px-4 py-2 text-white backdrop-blur-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
            Painting world · {era.eraLabel}
          </div>
          <div className="text-lg font-black">{title ?? `${island.name} Arena`}</div>
          <div className="text-xs text-white/80">WASD move · Space jump · E / run-through to grab value</div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl border border-white/25 bg-black/55 px-3 py-2 text-center text-white">
            <div className="text-[10px] uppercase text-amber-200">Value</div>
            <div className="text-xl font-black tabular-nums">
              {coins}/{goalCoins}
            </div>
          </div>
          <div className="rounded-2xl border border-white/25 bg-black/55 px-3 py-2 text-center text-white">
            <div className="text-[10px] uppercase text-amber-200">Time</div>
            <div className="text-xl font-black tabular-nums">{timeLeft}s</div>
          </div>
          <div className="rounded-2xl border border-white/25 bg-black/55 px-3 py-2 text-center text-white">
            <div className="text-[10px] uppercase text-amber-200">Lives</div>
            <div className="text-xl font-black">{"❤️".repeat(lives)}</div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center px-4">
        <CoinBagBuddyHud
          tip="Grab gold value coins — I’m pointing the nearest one!"
          coach="Stay with me in the painting. Dodge red impulse spends."
          track="main"
        />
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <button
          type="button"
          className="pointer-events-auto rounded-full border-2 border-white/30 bg-black/55 px-4 py-2 text-sm font-bold text-white"
          onClick={onExit}
        >
          ← Exit painting
        </button>
      </div>

      {phase === "ready" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-6">
          <div className="max-w-md rounded-3xl border-2 border-amber-300/60 bg-[#0c1622] p-6 text-center text-white shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-200">Mario Party · Action Arena</div>
            <h2 className="mt-2 text-2xl font-black">{title ?? "Party Arena"}</h2>
            <p className="mt-2 text-sm text-white/80">
              This is a real 3D game world inside the painting — not a quiz. Move, jump, and grab{" "}
              <strong>{goalCoins} value coins</strong> before time runs out. Red impulse spends steal a life.
            </p>
            <button
              type="button"
              className="mt-5 rounded-full bg-[#f4a629] px-8 py-3 text-base font-extrabold text-[#16283b]"
              data-testid="arena-start"
              autoFocus
              onClick={() => setPhase("play")}
            >
              Dive in →
            </button>
          </div>
        </div>
      ) : null}

      {phase === "won" || phase === "lost" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 text-3xl font-black text-white">
          {phase === "won" ? "Course clear!" : "Try again…"}
        </div>
      ) : null}
    </div>
  );
}
