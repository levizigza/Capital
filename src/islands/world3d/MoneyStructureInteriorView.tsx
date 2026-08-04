/**
 * Inside a Money Structure — walkable toy interior; each part pad dives a world.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useInputAction } from "@/input";
import { GameButton, GameHudLayout } from "@/game-ui";
import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";
import { SafeText } from "./SafeText";
import {
  structureExitLabel,
  structureReturnLabel,
  type MoneyStructureDef,
  type MoneyStructurePart,
} from "../moneyStructures";
import { playOrganSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import { moneyOrganForStructureTheme } from "../moneyOrgans";
import { organVerbChip } from "../worldMemory";
import { StructureFloorMotif, StructureToyCulture } from "./StructureInteriorToys";
import { StructureInteriorLights } from "./StructureInteriorLights";
import { StructureRoomBackdrop } from "./StructureRoomBackdrop";
import { structureShell } from "./structureInteriorTheme";
import { StructurePartSilhouette } from "./StructurePartSilhouette";
import { JarInteriorArchitecture } from "./JarInteriorArchitecture";

function themeExitHint(theme: MoneyStructureDef["theme"], near: boolean) {
  if (theme === "bank") return near ? "Close the vault" : "Return · Memory plaza";
  if (theme === "tower") return near ? "Down the paycheck chute" : "Return · Clock shore";
  if (theme === "keep") return near ? "Out the interest spiral" : "Return · Spiral shore";
  return near ? "Out the coin slot" : "Return · Coin shore";
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

function SoftBeatBeacon({ accent, active }: { accent: string; active: boolean }) {
  const beam = useRef<THREE.Mesh>(null);
  const crown = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (beam.current) {
      const mat = beam.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.9 : 0.5) + Math.sin(t * 2.4) * 0.15;
      beam.current.scale.y = 1 + Math.sin(t * 1.8) * 0.08;
    }
    if (crown.current) {
      const mat = crown.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 1.1 : 0.65) + Math.sin(t * 3.1) * 0.2;
      crown.current.position.y = 2.85 + Math.sin(t * 2.2) * 0.08;
    }
  });
  return (
    <group>
      <mesh ref={beam} position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 2.6, 12]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.55}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </mesh>
      {/* Crown orb — Soft Beat reads from across the interior */}
      <mesh ref={crown} position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial
          color="#fff7ed"
          emissive={accent}
          emissiveIntensity={0.75}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[1.05, 1.55, 32]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 0.75 : 0.42}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function PartPad({
  part,
  active,
  theme,
  accent = "#fbbf24",
  onEnter,
}: {
  part: MoneyStructurePart;
  active: boolean;
  theme: MoneyStructureDef["theme"];
  accent?: string;
  /** Near + poke climbs into the part (Soft Beat / minigame). */
  onEnter?: () => void;
}) {
  const bounce = useRef(0);
  const poke = useRef(0);
  const meshGroup = useRef<THREE.Group>(null);
  const softBeat = Boolean(part.softBeat);
  useFrame((_, dt) => {
    bounce.current += dt;
    if (poke.current > 0) poke.current = Math.max(0, poke.current - dt * 2.5);
    if (meshGroup.current) {
      meshGroup.current.rotation.y = poke.current * 1.8;
      meshGroup.current.position.y = Math.sin(bounce.current * 2.5) * 0.06 + poke.current * 0.12;
    }
  });
  const y = softBeat ? 1.05 : 0.9;
  const organChip = organVerbChip(moneyOrganForStructureTheme(theme).id);
  const padLabel = softBeat
    ? active
      ? `Enter · ${organChip}`
      : `${part.label} · ${organChip}`
    : active
      ? `Enter · ${part.entryPiece}`
      : part.label;
  return (
    <group
      position={part.position}
      onClick={(e) => {
        e.stopPropagation();
        poke.current = 1;
        playOrganSfx(moneyOrganForStructureTheme(theme).id);
        // Near pad: poke climbs in (kids poke what they can reach).
        if (active && onEnter) onEnter();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[active ? 1.4 : softBeat ? 1.25 : 1.15, 24]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 0.55 : softBeat ? 0.38 : 0.25}
          transparent
          opacity={0.85}
        />
      </mesh>
      {softBeat ? <SoftBeatBeacon accent={accent} active={active} /> : null}
      <group ref={meshGroup} position={[0, y, 0]}>
        <StructurePartSilhouette partId={part.id} />
      </group>
      {/* Soft Beat pads name the suit verb — cold retell in the interior. */}
      <Billboard position={[0, softBeat ? 2.85 : 2.1, 0]} follow>
        <SafeText
          fontSize={softBeat ? 0.3 : 0.28}
          color="#fff"
          anchorX="center"
          outlineWidth={0.025}
          outlineColor="#0f172a"
        >
          {padLabel}
        </SafeText>
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
  onEnterPart,
}: {
  structure: MoneyStructureDef;
  character?: CapitalCharacter | null;
  nearId: string | null;
  setNearId: (id: string | null) => void;
  inputFrozen: boolean;
  onEnterPart: (part: MoneyStructurePart) => void;
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
      <StructureInteriorLights
        bg={shell.bg}
        accent={shell.accent}
        fillLight={shell.fillLight}
      />
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
        <meshStandardMaterial color={shell.floor} roughness={0.75} metalness={0.08} />
      </mesh>
      <StructureFloorMotif theme={structure.theme} />
      <StructureToyCulture theme={structure.theme} />
      {structure.theme === "jar" ? <JarInteriorArchitecture /> : null}

      {structure.parts.map((p) => (
        <PartPad
          key={p.id}
          part={p}
          active={nearId === p.id}
          theme={structure.theme}
          accent={shell.accent}
          onEnter={inputFrozen ? undefined : () => onEnterPart(p)}
        />
      ))}

      {/* Exit mouth — organ-true ring (not shared cyan) */}
      <group position={structure.exitPosition}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.0, 1.45, 24]} />
          <meshStandardMaterial
            color={shell.exit}
            emissive={shell.exitEmissive}
            emissiveIntensity={nearId === "exit" ? 0.55 : 0.25}
          />
        </mesh>
        <Billboard position={[0, 1.8, 0]} follow>
          <SafeText fontSize={0.28} color={shell.accent} outlineWidth={0.02} outlineColor="#0f172a">
            {themeExitHint(structure.theme, nearId === "exit")}
          </SafeText>
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
  const organ = moneyOrganForStructureTheme(structure.theme);

  useEffect(() => {
    playOrganSfx(organ.id);
    capitalMusic.playPlace({ kind: "structure", organ: organ.id });
    return () => {
      // Restore plaza / shore bed when leaving the organ room
      if (structure.theme === "bank") {
        capitalMusic.playPlace({ kind: "harbor" });
      } else {
        capitalMusic.playPlace({
          kind: "shore",
          islandId: structure.islandId,
        });
      }
    };
  }, [organ.id, structure.theme, structure.islandId]);

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
      data-organ={organ.id}
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
                  onEnterPart={onEnterPart}
                />
              </Suspense>
            </Canvas>
          </div>
        }
        topLeft={
          <div className="rounded-xl bg-black/40 px-3 py-2 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
              Capital · {organ.name}
            </p>
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
                Open · {nearPart.label}
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
