import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import type { IslandDefinition } from "../types";
import { getIslandTheme } from "../themes/islandThemes";
import { getEraLook3D, type EraLook3D } from "./eraLooks";
import { VoyagerMesh, HarborNpcMesh } from "./VoyagerMesh";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { IslandTitle } from "./IslandTitle";
import { WoodenPier, NatureProps } from "./NatureProps";
import { buildIslandTerrain, islandSeedFromId } from "./islandTerrain";
import { colorHex, moneyFormFromBase } from "../character";
import type { ShoreHotspot } from "../islandShoreLayout";

type Props = {
  island: IslandDefinition;
  character?: CapitalCharacter | null;
  hotspots: ShoreHotspot[];
  onHotspot: (id: string) => void;
  onNearChange?: (id: string | null, label: string | null) => void;
  collectedItemIds?: string[];
};

const SPEED = 6.8;
const INTERACT_R = 2.6;
const PLAZA_R = 14;

function Player({
  character,
  animationStyle,
  hotspots,
  onNear,
  playerPosOut,
}: {
  character?: CapitalCharacter | null;
  animationStyle?: string;
  hotspots: ShoreHotspot[];
  onNear: (id: string | null) => void;
  playerPosOut: MutableRefObject<THREE.Vector3>;
}) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false });
  const camYaw = useRef(Math.PI);
  const facing = useRef(Math.PI);
  const vel = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const moving = useRef(false);

  useEffect(() => {
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
    };
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = group.current.position;
    const k = keys.current;
    const turn = (Number(k.l) - Number(k.r)) * 2.2 * dt;
    camYaw.current += turn;

    const forward = Number(k.f) - Number(k.b);
    moving.current = Math.abs(forward) > 0.01 || Math.abs(turn) > 0.001;
    if (Math.abs(forward) > 0.01) {
      facing.current = forward >= 0 ? camYaw.current : camYaw.current + Math.PI;
      const spd = SPEED * (k.b && !k.f ? 0.65 : 1);
      vel.current.set(
        Math.sin(camYaw.current) * forward * spd,
        0,
        Math.cos(camYaw.current) * forward * spd,
      );
      p.x += vel.current.x * dt;
      p.z += vel.current.z * dt;
    }
    group.current.rotation.y = facing.current;
    playerPosOut.current.set(p.x, p.y, p.z);

    const r = Math.hypot(p.x, p.z);
    if (r > PLAZA_R) {
      p.x *= PLAZA_R / r;
      p.z *= PLAZA_R / r;
    }
    p.y = 0.02;

    let near: string | null = null;
    let best = INTERACT_R;
    for (const h of hotspots) {
      const d = Math.hypot(h.position[0] - p.x, h.position[2] - p.z);
      if (d < best) {
        best = d;
        near = h.id;
      }
    }
    onNear(near);

    const back = near ? 10.2 : 8.2;
    const camH = near ? 5.2 : 4.7;
    const ideal = new THREE.Vector3(
      p.x - Math.sin(camYaw.current) * back,
      camH,
      p.z - Math.cos(camYaw.current) * back,
    );
    camera.position.lerp(ideal, 1 - Math.pow(0.0015, dt));
    camera.lookAt(p.x, near ? 1.45 : 1.2, p.z);
  });

  return (
    <group ref={group} position={[0, 0, 4.5]} rotation={[0, Math.PI, 0]}>
      <VoyagerMesh
        character={character}
        pose={moving.current ? "run" : "stand"}
        scale={1}
        animationStyle={animationStyle}
      />
    </group>
  );
}

function PadMarker({
  hotspot,
  look,
  active,
  collected,
}: {
  hotspot: ShoreHotspot;
  look: EraLook3D;
  active: boolean;
  collected?: boolean;
}) {
  const wire = look.shading === "vector" || look.shading === "wire";
  const color =
    hotspot.kind === "play_pad"
      ? look.accent
      : hotspot.kind === "pier"
        ? "#38bdf8"
        : hotspot.kind === "party_board"
          ? "#f4a629"
          : hotspot.kind === "journal"
            ? "#a78bfa"
            : hotspot.kind === "item"
              ? "#86efac"
              : look.shore;

  if (collected) return null;

  return (
    <group position={hotspot.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[active ? 1.35 : 1.05, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.45 : 0.18}
          roughness={0.45}
          wireframe={wire}
          transparent
          opacity={wire ? 0.85 : 0.92}
        />
      </mesh>
      {hotspot.kind === "play_pad" ? (
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.9, 0.55, 0.9]} />
          <meshStandardMaterial
            color={look.land}
            emissive={look.accent}
            emissiveIntensity={0.25}
            flatShading
            wireframe={wire}
          />
        </mesh>
      ) : hotspot.kind === "party_board" ? (
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.5, 8]} />
          <meshStandardMaterial color="#f4a629" roughness={0.4} metalness={0.2} flatShading wireframe={wire} />
        </mesh>
      ) : hotspot.kind === "journal" ? (
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.7, 0.9, 0.2]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} flatShading wireframe={wire} />
        </mesh>
      ) : hotspot.kind === "pier" ? null : hotspot.kind === "item" ? (
        <mesh position={[0, 0.35, 0]} castShadow>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} wireframe={wire} />
        </mesh>
      ) : (
        <group position={[0, 0, 0]}>
          <HarborNpcMesh
            coat={colorHex("tide")}
            form={moneyFormFromBase("coin")}
            pose={active ? "wave" : "stand"}
          />
        </group>
      )}
      <Billboard position={[0, hotspot.kind === "npc" ? 2.15 : 1.55, 0]} follow>
        <Text
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          outlineWidth={0.028}
          outlineColor="#0f172a"
          maxWidth={3.2}
          textAlign="center"
        >
          {`${hotspot.icon} ${hotspot.label}`}
        </Text>
      </Billboard>
    </group>
  );
}

function ShoreScene({
  island,
  look,
  hotspots,
  nearId,
  collectedItemIds,
  character,
  animationStyle,
  onNear,
  playerPosOut,
}: {
  island: IslandDefinition;
  look: EraLook3D;
  hotspots: ShoreHotspot[];
  nearId: string | null;
  collectedItemIds: string[];
  character?: CapitalCharacter | null;
  animationStyle: string;
  onNear: (id: string | null) => void;
  playerPosOut: MutableRefObject<THREE.Vector3>;
}) {
  const wire = look.shading === "vector" || look.shading === "wire";
  const props = useMemo(() => {
    const t = buildIslandTerrain(islandSeedFromId(`${island.id}-shore`), look, "near");
    return t.props
      .filter((p) => p.kind !== "hut")
      .slice(0, 14)
      .map((p, i) => {
        const ang = (i / 14) * Math.PI * 2;
        const r = 11.5 + (i % 3) * 0.9;
        return {
          ...p,
          position: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number],
        };
      });
  }, [island.id, look]);

  return (
    <>
      <WorldLighting look={look} contactShadows={false} shadowMapSize={512} />
      <OceanWater color={look.sea} shading={look.shading} size={420} calm />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[16.5, 48]} />
        <meshStandardMaterial color={look.land} roughness={0.9} flatShading={!wire} wireframe={wire} />
      </mesh>
      <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[15.5, 17, 1.2, 40]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} flatShading wireframe={wire} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[12.5, 16.8, 48]} />
        <meshStandardMaterial color={look.shore} roughness={0.88} wireframe={wire} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[9.2, 40]} />
        <meshStandardMaterial
          color={wire ? look.accent : "#e7e5e4"}
          roughness={0.85}
          flatShading
          wireframe={wire}
        />
      </mesh>

      <WoodenPier position={[0, 0.05, 13.2]} />
      <NatureProps props={props} look={look} />

      <IslandTitle title={island.name} subtitle="Walk · Talk · Play pads" height={8.2} accent={look.accent} />

      {hotspots.map((h) => (
        <PadMarker
          key={h.id}
          hotspot={h}
          look={look}
          active={nearId === h.id}
          collected={h.kind === "item" && h.refId ? collectedItemIds.includes(h.refId) : false}
        />
      ))}

      <Player
        character={character}
        animationStyle={animationStyle}
        hotspots={hotspots.filter(
          (h) => !(h.kind === "item" && h.refId && collectedItemIds.includes(h.refId)),
        )}
        onNear={onNear}
        playerPosOut={playerPosOut}
      />
    </>
  );
}

/**
 * Walkable island shore — SM64-style plaza for every non-hub island.
 * Era look + Voyager morph; play pads / NPCs / pier — no instant quiz dump.
 */
export function WalkableIslandExplore({
  island,
  character,
  hotspots,
  onHotspot,
  onNearChange,
  collectedItemIds = [],
}: Props) {
  const theme = getIslandTheme(island.id, island.themeId);
  const look = useMemo(() => getEraLook3D(theme.animationStyle), [theme.animationStyle]);
  const [near, setNear] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const playerPos = useRef(new THREE.Vector3(0, 0, 4.5));
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E" || e.key === "Enter") && near) {
        e.preventDefault();
        onHotspot(near);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [near, onHotspot]);

  useEffect(() => {
    const label = hotspots.find((h) => h.id === near)?.label ?? null;
    onNearChange?.(near, label);
  }, [near, hotspots, onNearChange]);

  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="island-shore-explore">
      {!ready ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-sm font-bold"
          style={{ background: look.skyTop, color: look.accent }}
        >
          Landing on {island.name}…
        </div>
      ) : null}
      <Canvas
        shadows
        dpr={reduced ? [1, 1] : [1, 1.25]}
        camera={{ position: [0, 5, 14], fov: 50 }}
        className="absolute inset-0 z-[2]"
        gl={{ antialias: !reduced, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(look.skyTop, 1);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <ShoreScene
            island={island}
            look={look}
            hotspots={hotspots}
            nearId={near}
            collectedItemIds={collectedItemIds}
            character={character}
            animationStyle={theme.animationStyle}
            onNear={setNear}
            playerPosOut={playerPos}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
