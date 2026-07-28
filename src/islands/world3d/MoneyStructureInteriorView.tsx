/**
 * Inside a Money Structure — walkable toy interior; each part pad dives a world.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { useInputAction } from "@/input";
import { GameButton, GameHudLayout } from "@/game-ui";
import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";
import { WorldLighting } from "./WorldLighting";
import { getEraLook3D } from "./eraLooks";
import type { MoneyStructureDef, MoneyStructurePart } from "../moneyStructures";
import { playCapitalSfx } from "../audio/capitalSfx";

type Props = {
  structure: MoneyStructureDef;
  character?: CapitalCharacter | null;
  onExit: () => void;
  onEnterPart: (part: MoneyStructurePart) => void;
};

const SPEED = 6.2;
const INTERACT_R = 2.2;

function InteriorPlayer({
  character,
  pads,
  onNear,
  inputFrozen,
}: {
  character?: CapitalCharacter | null;
  pads: { id: string; position: [number, number, number] }[];
  onNear: (id: string | null) => void;
  inputFrozen: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false });
  const vel = useRef(new THREE.Vector3());
  const facing = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.f = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.b = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.l = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.r = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.f = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.b = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.l = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.r = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, dt) => {
    if (!group.current || inputFrozen) return;
    const k = keys.current;
    const wish = new THREE.Vector3(
      (k.r ? 1 : 0) - (k.l ? 1 : 0),
      0,
      (k.b ? 1 : 0) - (k.f ? 1 : 0),
    );
    if (wish.lengthSq() > 0) {
      wish.normalize();
      facing.current = Math.atan2(wish.x, wish.z);
      vel.current.lerp(wish.multiplyScalar(SPEED), 1 - Math.exp(-12 * dt));
    } else {
      vel.current.multiplyScalar(Math.exp(-10 * dt));
    }
    group.current.position.x += vel.current.x * dt;
    group.current.position.z += vel.current.z * dt;
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x, -9, 9);
    group.current.position.z = THREE.MathUtils.clamp(group.current.position.z, -9, 10);
    group.current.rotation.y = facing.current;

    let nearest: string | null = null;
    let best = INTERACT_R;
    for (const p of pads) {
      const d = group.current.position.distanceTo(new THREE.Vector3(...p.position));
      if (d < best) {
        best = d;
        nearest = p.id;
      }
    }
    onNear(nearest);
  });

  return (
    <group ref={group} position={[0, 0, 5]}>
      <VoyagerMesh character={character ?? undefined} scale={1.05} />
    </group>
  );
}

function PartPad({
  part,
  active,
}: {
  part: MoneyStructurePart;
  active: boolean;
}) {
  const bounce = useRef(0);
  useFrame((_, dt) => {
    bounce.current += dt;
  });
  const y = 0.9 + Math.sin(bounce.current * 2.5) * 0.06;
  return (
    <group position={part.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[active ? 1.4 : 1.15, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={active ? 0.55 : 0.25}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Creative piece silhouette */}
      {part.id === "cork_vault" ? (
        <mesh position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.1, 12]} />
          <meshStandardMaterial color="#b45309" roughness={0.75} />
        </mesh>
      ) : part.id === "coin_spring" ? (
        <mesh position={[0, y, 0]} rotation={[0.4, 0, 0]} castShadow>
          <torusGeometry args={[0.55, 0.14, 8, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.55} roughness={0.35} />
        </mesh>
      ) : (
        <mesh position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.25, 20]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      <Billboard position={[0, 2.1, 0]} follow>
        <Text
          fontSize={0.28}
          color="#fff"
          anchorX="center"
          outlineWidth={0.025}
          outlineColor="#0f172a"
        >
          {active ? `Enter · ${part.entryPiece}` : part.label}
        </Text>
      </Billboard>
    </group>
  );
}

function InteriorWorld({
  structure,
  character,
  nearId,
  setNearId,
  inputFrozen,
}: {
  structure: MoneyStructureDef;
  character?: CapitalCharacter | null;
  nearId: string | null;
  setNearId: (id: string | null) => void;
  inputFrozen: boolean;
}) {
  const look = useMemo(() => getEraLook3D("capital-default"), []);
  const pads = useMemo(
    () => [
      ...structure.parts.map((p) => ({ id: p.id, position: p.position })),
      { id: "exit", position: structure.exitPosition },
    ],
    [structure],
  );

  return (
    <>
      <WorldLighting look={look} />
      <color attach="background" args={["#0c4a6e"]} />
      <fog attach="fog" args={["#0c4a6e", 12, 38]} />

      {/* Jar glass walls — toy interior */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[10.5, 11, 10, 32, 1, true]} />
        <meshStandardMaterial
          color="#7dd3fc"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          roughness={0.2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 48]} />
        <meshStandardMaterial color="#0f172a" roughness={0.85} />
      </mesh>
      {/* Coin floor mosaic */}
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

      {structure.parts.map((p) => (
        <PartPad key={p.id} part={p} active={nearId === p.id} />
      ))}

      {/* Exit mouth */}
      <group position={structure.exitPosition}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.0, 1.45, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0ea5e9"
            emissiveIntensity={nearId === "exit" ? 0.55 : 0.25}
          />
        </mesh>
        <Billboard position={[0, 1.8, 0]} follow>
          <Text fontSize={0.28} color="#e0f2fe" outlineWidth={0.02} outlineColor="#0f172a">
            {nearId === "exit" ? "Exit · coin slot" : "Back to Cove"}
          </Text>
        </Billboard>
      </group>

      <InteriorPlayer
        character={character}
        pads={pads}
        onNear={setNearId}
        inputFrozen={inputFrozen}
      />
    </>
  );
}

export function MoneyStructureInteriorView({
  structure,
  character,
  onExit,
  onEnterPart,
}: Props) {
  const [nearId, setNearId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const nearPart = structure.parts.find((p) => p.id === nearId) ?? null;

  useEffect(() => {
    playCapitalSfx("plinth_hum");
  }, []);

  useInputAction("cancel", () => onExit());
  useInputAction("confirm", () => {
    if (nearId === "exit") {
      onExit();
      return;
    }
    if (nearPart) onEnterPart(nearPart);
  });

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#0c4a6e]"
      data-testid="money-structure-interior"
      data-structure={structure.id}
    >
      <GameHudLayout
        background={
          <div className="absolute inset-0">
            {!ready ? (
              <div className="flex h-full items-center justify-center text-sm font-bold text-white/80">
                Inside the {structure.name}…
              </div>
            ) : null}
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{ position: [0, 9, 14], fov: 50, near: 0.1, far: 80 }}
              className="absolute inset-0 h-full w-full"
              onCreated={({ camera, gl }) => {
                camera.lookAt(0, 1, 0);
                gl.setClearColor("#0c4a6e");
                setReady(true);
              }}
            >
              <Suspense fallback={null}>
                <InteriorWorld
                  structure={structure}
                  character={character}
                  nearId={nearId}
                  setNearId={setNearId}
                  inputFrozen={false}
                />
              </Suspense>
            </Canvas>
          </div>
        }
        topLeft={
          <div className="rounded-xl bg-black/45 px-3 py-2 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-200/90">
              Money Structure
            </p>
            <h1 className="text-lg font-black">{structure.name}</h1>
            <p className="max-w-sm text-xs text-white/80">{structure.entryHint}</p>
          </div>
        }
        topRight={
          <GameButton variant="outline" size="sm" onClick={onExit}>
            Exit Jar
          </GameButton>
        }
        bottom={
          nearPart ? (
            <div className="mx-auto max-w-md rounded-2xl border border-amber-200/40 bg-[#0f172a]/85 px-4 py-3 text-center text-white shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-200">
                {nearPart.entryPiece}
              </p>
              <p className="mt-1 text-sm font-semibold">{nearPart.blurb}</p>
              <GameButton
                variant="primary"
                className="mt-2"
                data-testid="money-structure-enter-part"
                onClick={() => onEnterPart(nearPart)}
              >
                Enter {nearPart.label}
              </GameButton>
            </div>
          ) : nearId === "exit" ? (
            <div className="flex justify-center">
              <GameButton variant="primary" onClick={onExit}>
                Squeeze back to Cove
              </GameButton>
            </div>
          ) : (
            <p className="text-center text-xs font-semibold text-white/90">
              WASD · touch a glowing money-part
            </p>
          )
        }
      >
        <div />
      </GameHudLayout>
    </div>
  );
}
