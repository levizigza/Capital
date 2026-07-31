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
import {
  structureExitLabel,
  structureReturnLabel,
  type MoneyStructureDef,
  type MoneyStructurePart,
} from "../moneyStructures";
import { playCapitalSfx } from "../audio/capitalSfx";
import { StructureFloorMotif, StructureToyCulture } from "./StructureInteriorToys";
import { StructureInteriorLights } from "./StructureInteriorLights";
import { StructureRoomBackdrop } from "./StructureRoomBackdrop";
import { structureShell } from "./structureInteriorTheme";

function themeExitHint(theme: MoneyStructureDef["theme"], near: boolean) {
  if (theme === "bank") return near ? "Exit · vault door" : "Back to Harbor";
  if (theme === "tower") return near ? "Exit · paycheck chute" : "Back to Peninsula";
  if (theme === "keep") return near ? "Exit · interest spiral" : "Back to Credit";
  return near ? "Exit · coin slot" : "Back to Cove";
}

type Props = {
  structure: MoneyStructureDef;
  character?: CapitalCharacter | null;
  onExit: () => void;
  onEnterPart: (part: MoneyStructurePart) => void;
  /** Freeze walk while a Soft Beat overlay owns the screen */
  inputFrozen?: boolean;
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
  const poke = useRef(0);
  const meshGroup = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    bounce.current += dt;
    if (poke.current > 0) poke.current = Math.max(0, poke.current - dt * 2.5);
    if (meshGroup.current) {
      meshGroup.current.rotation.y = poke.current * 1.8;
      meshGroup.current.position.y = Math.sin(bounce.current * 2.5) * 0.06 + poke.current * 0.12;
    }
  });
  const y = 0.9;
  return (
    <group
      position={part.position}
      onClick={(e) => {
        e.stopPropagation();
        poke.current = 1;
        playCapitalSfx("plinth_hum");
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
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
      <group ref={meshGroup} position={[0, y, 0]}>
      {/* Creative piece silhouette */}
      {part.id === "cork_vault" || part.id === "vault_safe" ? (
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.1, 12]} />
          <meshStandardMaterial
            color="#b45309"
            roughness={0.75}
            metalness={part.id === "vault_safe" ? 0.45 : 0.05}
          />
        </mesh>
      ) : part.id === "coin_spring" || part.id === "stamp_press" ? (
        <mesh rotation={[0.4, 0, 0]} castShadow>
          <torusGeometry args={[0.55, 0.14, 8, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.55} roughness={0.35} />
        </mesh>
      ) : part.id === "teller_window" ? (
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.9, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.4} />
        </mesh>
      ) : part.id === "budget_press" ? (
        <group>
          {([-0.55, 0, 0.55] as const).map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} castShadow>
              <boxGeometry args={[0.4, 0.85, 0.4]} />
              <meshStandardMaterial
                color={i === 0 ? "#22c55e" : i === 1 ? "#f59e0b" : "#38bdf8"}
                metalness={0.2}
                roughness={0.45}
              />
            </mesh>
          ))}
        </group>
      ) : part.id === "time_clock" ? (
        <mesh castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.22, 24]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.25} roughness={0.35} />
        </mesh>
      ) : part.id === "umbrella_loft" ? (
        <mesh castShadow>
          <coneGeometry args={[0.85, 1.1, 12]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.15} roughness={0.5} />
        </mesh>
      ) : part.id === "debt_anvil" ? (
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.55, 0.7]} />
          <meshStandardMaterial color="#78716c" metalness={0.55} roughness={0.35} />
        </mesh>
      ) : part.id === "dispatch_hatch" ? (
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.75, 0.2]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.2} roughness={0.45} />
        </mesh>
      ) : part.id === "score_battlement" ? (
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1.4, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} />
        </mesh>
      ) : (
        <mesh castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.25, 20]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      </group>
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
  const shell = structureShell(structure.theme);
  const pads = useMemo(
    () => [
      ...structure.parts.map((p) => ({ id: p.id, position: p.position })),
      { id: "exit", position: structure.exitPosition },
    ],
    [structure],
  );

  return (
    <>
      <StructureInteriorLights bg={shell.bg} accent={shell.accent} />
      {/* Structure shell walls — toy interior */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[10.5, 11, 10, 32, 1, true]} />
        <meshStandardMaterial
          color={shell.wall}
          transparent
          opacity={shell.wallOp}
          side={THREE.BackSide}
          roughness={0.35}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.75} metalness={0.08} />
      </mesh>
      <StructureFloorMotif theme={structure.theme} />
      <StructureToyCulture theme={structure.theme} />

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
            {themeExitHint(structure.theme, nearId === "exit")}
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
  inputFrozen = false,
}: Props) {
  const [nearId, setNearId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const nearPart = structure.parts.find((p) => p.id === nearId) ?? null;

  useEffect(() => {
    playCapitalSfx("plinth_hum");
  }, []);

  useInputAction("cancel", () => {
    if (inputFrozen) return;
    onExit();
  });
  useInputAction("confirm", () => {
    if (inputFrozen) return;
    if (nearId === "exit") {
      onExit();
      return;
    }
    if (nearPart) onEnterPart(nearPart);
  });
  useInputAction("interact", () => {
    if (inputFrozen) return;
    if (nearId === "exit") {
      onExit();
      return;
    }
    if (nearPart) onEnterPart(nearPart);
  });

  const shell = structureShell(structure.theme);

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ background: shell.bg }}
      data-testid="money-structure-interior"
      data-structure={structure.id}
      data-ready={ready ? "1" : "0"}
    >
      <GameHudLayout
        className="h-full min-h-[100dvh]"
        background={
          <div className="absolute inset-0">
            <StructureRoomBackdrop theme={structure.theme} name={structure.name} />
            {!ready ? (
              <div className="absolute inset-0 z-[1] flex items-center justify-center text-sm font-bold text-white/85">
                Inside the {structure.name}…
              </div>
            ) : null}
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{ position: [0, 8.5, 12.5], fov: 48, near: 0.1, far: 80 }}
              className="absolute inset-0 z-[2] h-full w-full"
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              onCreated={({ camera, gl }) => {
                camera.lookAt(0, 1.2, -1);
                gl.setClearColor(shell.bg, 0);
                setReady(true);
              }}
            >
              <Suspense fallback={null}>
                <InteriorWorld
                  structure={structure}
                  character={character}
                  nearId={nearId}
                  setNearId={setNearId}
                  inputFrozen={inputFrozen}
                />
              </Suspense>
            </Canvas>
          </div>
        }
        topLeft={
          <div className="rounded-xl bg-black/40 px-3 py-2 text-white">
            <h1 className="text-lg font-black">{structure.name}</h1>
            {!nearPart && nearId !== "exit" ? (
              <p className="max-w-sm text-xs text-white/75">{structure.entryHint}</p>
            ) : null}
          </div>
        }
        topRight={
          <GameButton variant="outline" size="sm" onClick={onExit} disabled={inputFrozen}>
            {structureExitLabel(structure.theme)}
          </GameButton>
        }
        bottom={
          inputFrozen ? (
            <p className="text-center text-xs font-semibold text-white/70">…</p>
          ) : nearPart ? (
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
                {structureReturnLabel(structure.theme)}
              </GameButton>
            </div>
          ) : (
            <p className="text-center text-xs font-semibold text-white/90">
              WASD · E on a glowing part · poke the toys
            </p>
          )
        }
      >
        <div />
      </GameHudLayout>
    </div>
  );
}
