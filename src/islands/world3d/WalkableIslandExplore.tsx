import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import type { IslandDefinition } from "../types";
import { getIslandTheme } from "../themes/islandThemes";
import { type EraLook3D } from "./eraLooks";
import { getIslandLook3D, getIslandBiome, type IslandBiome, type GroundShape } from "./islandBiomes";
import { VoyagerMesh, HarborNpcMesh } from "./VoyagerMesh";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { IslandTitle } from "./IslandTitle";
import { WoodenPier, NatureProps } from "./NatureProps";
import { buildIslandTerrain, islandSeedFromId } from "./islandTerrain";
import { colorHex, type MoneyForm } from "../character";
import type { ShoreHotspot } from "../islandShoreLayout";
import {
  buildAmbientEcosystem,
  getIslandCulture,
  shoreAnchorsForCulture,
  type AmbientResident,
} from "../islandCulture";
import { getMascot, varyMascot } from "../moneyCast";
import { MoneyBagGuide } from "./MoneyBagGuide";
import { GuideProjector } from "../views/GuideWayfinder";

type Props = {
  island: IslandDefinition;
  character?: CapitalCharacter | null;
  hotspots: ShoreHotspot[];
  onHotspot: (id: string) => void;
  onNearChange?: (id: string | null, label: string | null) => void;
  collectedItemIds?: string[];
  /** Coin Bag tip — who/where next */
  guideTip?: string;
  /** World point Coin Bag points at (stays beside player) */
  guideLookAt?: [number, number, number] | null;
  /** Soft wayfinder arrows (edge cue + bag point). Off = free roam. */
  guideArrows?: boolean;
  onGuideProject?: (p: import("../views/GuideWayfinder").GuideProjection | null) => void;
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

function NpcFromMascot({
  mascotId,
  seed,
  animationStyle,
  pose,
  scale = 0.95,
}: {
  mascotId: string;
  seed: string;
  animationStyle: string;
  pose?: "stand" | "wave" | "talk";
  scale?: number;
}) {
  const mascot = getMascot(mascotId);
  const lookChar = varyMascot(mascotId, seed);
  return (
    <HarborNpcMesh
      coat={colorHex(lookChar.color as "tide")}
      form={(mascot.form as MoneyForm) || "coin"}
      glyph={mascot.glyph}
      character={{
        name: lookChar.name,
        base: lookChar.base as CapitalCharacter["base"],
        color: lookChar.color as CapitalCharacter["color"],
        accessory: lookChar.accessory as CapitalCharacter["accessory"],
        companion: lookChar.companion as CapitalCharacter["companion"],
      }}
      pose={pose ?? "stand"}
      animationStyle={animationStyle}
      scale={scale}
    />
  );
}

function AmbientCritter({
  resident,
  look,
  animationStyle,
  fauna,
}: {
  resident: AmbientResident;
  look: EraLook3D;
  animationStyle: string;
  fauna: string;
}) {
  const wire = look.shading === "vector" || look.shading === "wire";
  if (resident.social === "animal") {
    // Era-continuous critters — simple silhouettes matching the decade lens
    const color = look.accent;
    return (
      <group position={resident.position} rotation={[0, resident.yaw, 0]} scale={resident.scale}>
        {fauna.includes("fish") || fauna.includes("whale") ? (
          <mesh castShadow position={[0, 0.35, 0]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.18, 0.45, 4, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={wire ? 0.45 : 0.15}
              wireframe={wire}
              flatShading
            />
          </mesh>
        ) : fauna.includes("fox") || fauna.includes("cat") || fauna.includes("dog") || fauna.includes("lizard") ? (
          <group>
            <mesh castShadow position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.28, 10, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={wire ? 0.4 : 0.1} wireframe={wire} flatShading />
            </mesh>
            <mesh castShadow position={[0.22, 0.42, -0.05]}>
              <coneGeometry args={[0.08, 0.22, 5]} />
              <meshStandardMaterial color={look.shore} wireframe={wire} flatShading />
            </mesh>
          </group>
        ) : (
          <mesh castShadow position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.16, 8, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} wireframe={wire} />
          </mesh>
        )}
      </group>
    );
  }
  return (
    <group position={resident.position} rotation={[0, resident.yaw, 0]}>
      <NpcFromMascot
        mascotId={resident.mascotId}
        seed={resident.id}
        animationStyle={animationStyle}
        pose="stand"
        scale={resident.scale}
      />
    </group>
  );
}

function PadMarker({
  hotspot,
  look,
  active,
  guided,
  collected,
  animationStyle,
}: {
  hotspot: ShoreHotspot;
  look: EraLook3D;
  active: boolean;
  /** Soft pulse when Coin Bag is pointing here */
  guided?: boolean;
  collected?: boolean;
  animationStyle: string;
}) {
  const wire = look.shading === "vector" || look.shading === "wire";
  const lit = active || !!guided;
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
        <circleGeometry args={[lit ? 1.35 : 1.05, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.45 : guided ? 0.32 : 0.18}
          roughness={0.45}
          wireframe={wire}
          transparent
          opacity={wire ? 0.85 : 0.92}
        />
      </mesh>
      {guided && !active ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[1.15, 1.45, 28]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.55}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {hotspot.kind === "play_pad" ? (
        <group>
          <mesh position={[0, 1.35, 0]} castShadow>
            <boxGeometry args={[1.6, 1.9, 0.18]} />
            <meshStandardMaterial
              color={wire ? look.accent : "#78350f"}
              roughness={0.55}
              metalness={0.15}
              wireframe={wire}
              emissive={wire ? look.accent : "#000000"}
              emissiveIntensity={wire ? 0.2 : 0}
            />
          </mesh>
          <mesh position={[0, 1.35, 0.12]} castShadow>
            <planeGeometry args={[1.25, 1.5]} />
            <meshStandardMaterial
              color={look.accent}
              emissive={look.accent}
              emissiveIntensity={active ? 0.65 : 0.35}
              roughness={0.4}
              side={THREE.DoubleSide}
              wireframe={wire}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0.7]}>
            <ringGeometry args={[0.55, 0.85, 24]} />
            <meshStandardMaterial
              color={look.accent}
              emissive={look.accent}
              emissiveIntensity={active ? 0.5 : 0.2}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
        </group>
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
        <NpcFromMascot
          mascotId={hotspot.mascotId ?? "coiny"}
          seed={hotspot.refId ?? hotspot.id}
          animationStyle={animationStyle}
          pose={active ? "wave" : "stand"}
        />
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

function WireNature({ look, count = 12 }: { look: EraLook3D; count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const ang = (i / count) * Math.PI * 2;
        const r = 11.2 + (i % 4) * 0.85;
        return {
          pos: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number],
          kind: i % 3,
        };
      }),
    [count],
  );
  return (
    <group>
      {items.map((it, i) => (
        <group key={i} position={it.pos}>
          {it.kind === 0 ? (
            <mesh>
              <coneGeometry args={[0.55, 1.6, 5]} />
              <meshStandardMaterial color={look.land} emissive={look.accent} emissiveIntensity={0.35} wireframe />
            </mesh>
          ) : it.kind === 1 ? (
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.45, 8, 6]} />
              <meshStandardMaterial color={look.shore} emissive={look.accent} emissiveIntensity={0.3} wireframe />
            </mesh>
          ) : (
            <mesh position={[0, 0.5, 0]}>
              <octahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial color={look.accent} emissive={look.accent} emissiveIntensity={0.4} wireframe />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}


function BiomeGround({
  look,
  biome,
  wire,
  plazaRadius,
}: {
  look: EraLook3D;
  biome: IslandBiome;
  wire: boolean;
  plazaRadius: number;
}) {
  const shape: GroundShape = biome.groundShape;
  const cliffSegs = shape === "hex" ? 6 : shape === "floe" ? 10 : 40;
  const cliffTop = shape === "mesa" ? 13.5 : shape === "hex" ? 14.8 : 15.5;
  const cliffBot = shape === "mesa" ? 16.8 : shape === "floe" ? 17.5 : 17;
  const cliffH = shape === "mesa" ? 1.8 : 1.2;

  return (
    <>
      {shape === "hex" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[16.2, 6]} />
          <meshStandardMaterial color={look.land} roughness={0.9} flatShading={!wire} wireframe={wire} />
        </mesh>
      ) : shape === "elongated" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} scale={[1.25, 1, 0.82]} receiveShadow>
          <circleGeometry args={[15.5, 48]} />
          <meshStandardMaterial color={look.land} roughness={0.9} flatShading={!wire} wireframe={wire} />
        </mesh>
      ) : shape === "crescent_fill" ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <circleGeometry args={[16.5, 48]} />
            <meshStandardMaterial color={look.land} roughness={0.9} flatShading={!wire} wireframe={wire} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.03, 2]} receiveShadow>
            <circleGeometry args={[7.5, 32]} />
            <meshStandardMaterial color={look.sea} roughness={0.35} transparent opacity={0.55} wireframe={wire} />
          </mesh>
        </>
      ) : shape === "mesa" ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <circleGeometry args={[16.8, 40]} />
            <meshStandardMaterial color={biome.cliff} roughness={0.95} flatShading wireframe={wire} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]} receiveShadow>
            <circleGeometry args={[11.5, 32]} />
            <meshStandardMaterial color={look.land} roughness={0.88} flatShading={!wire} wireframe={wire} />
          </mesh>
        </>
      ) : shape === "floe" ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <circleGeometry args={[17, 8]} />
            <meshStandardMaterial color={look.land} roughness={0.45} metalness={0.15} flatShading wireframe={wire} />
          </mesh>
          {[-5, 4, 7].map((x, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.04, -3 + i * 2]} receiveShadow>
              <circleGeometry args={[2.2 + i * 0.4, 6]} />
              <meshStandardMaterial color={look.shore} roughness={0.35} metalness={0.2} wireframe={wire} />
            </mesh>
          ))}
        </>
      ) : shape === "ring" ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <ringGeometry args={[5.5, 16.5, 48]} />
            <meshStandardMaterial color={look.land} roughness={0.9} flatShading={!wire} wireframe={wire} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <circleGeometry args={[5.2, 32]} />
            <meshStandardMaterial color={look.sea} roughness={0.4} wireframe={wire} />
          </mesh>
        </>
      ) : shape === "floating" ? (
        <>
          {[
            [0, 0, 0, 10],
            [-7, 0.4, -4, 4.5],
            [6.5, 0.55, 3, 4],
            [2, 0.7, -7, 3.2],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x as number, y as number, z as number]} receiveShadow>
              <circleGeometry args={[r as number, 28]} />
              <meshStandardMaterial
                color={i === 0 ? look.land : look.shore}
                roughness={0.7}
                flatShading={!wire}
                wireframe={wire}
                emissive={look.accent}
                emissiveIntensity={0.08}
              />
            </mesh>
          ))}
        </>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[16.5, 48]} />
          <meshStandardMaterial color={look.land} roughness={0.9} flatShading={!wire} wireframe={wire} />
        </mesh>
      )}

      {shape !== "floating" && shape !== "ring" ? (
        <mesh position={[0, shape === "mesa" ? -0.4 : -0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[cliffTop, cliffBot, cliffH, cliffSegs]} />
          <meshStandardMaterial color={biome.cliff} roughness={0.95} flatShading wireframe={wire} />
        </mesh>
      ) : null}

      {shape !== "floating" && shape !== "mesa" ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          scale={shape === "elongated" ? [1.2, 1, 0.85] : [1, 1, 1]}
          receiveShadow
        >
          <ringGeometry args={[12.2, 16.8, shape === "floe" ? 10 : 48]} />
          <meshStandardMaterial color={look.shore} roughness={0.88} wireframe={wire} />
        </mesh>
      ) : null}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, shape === "mesa" ? 0.38 : 0.04, 0]} receiveShadow>
        <circleGeometry args={[plazaRadius, shape === "hex" ? 6 : 40]} />
        <meshStandardMaterial
          color={biome.plaza}
          roughness={0.82}
          flatShading={!wire}
          wireframe={wire}
          emissive={look.shading === "neon" || look.shading === "wire" ? look.accent : "#000000"}
          emissiveIntensity={look.shading === "neon" || look.shading === "wire" ? 0.08 : 0}
        />
      </mesh>
    </>
  );
}

function ShoreScene({
  island,
  look,
  biome,
  hotspots,
  nearId,
  collectedItemIds,
  character,
  animationStyle,
  onNear,
  playerPosOut,
  guideLookAt,
  guideArrows,
}: {
  island: IslandDefinition;
  look: EraLook3D;
  biome: IslandBiome;
  hotspots: ShoreHotspot[];
  nearId: string | null;
  collectedItemIds: string[];
  character?: CapitalCharacter | null;
  animationStyle: string;
  onNear: (id: string | null) => void;
  playerPosOut: MutableRefObject<THREE.Vector3>;
  guideLookAt?: [number, number, number] | null;
  guideArrows?: boolean;
}) {
  const wire = look.shading === "vector" || look.shading === "wire";
  const culture = useMemo(() => getIslandCulture(island), [island]);
  const anchors = useMemo(() => shoreAnchorsForCulture(culture), [culture]);
  const ambients = useMemo(() => buildAmbientEcosystem(island), [island]);
  const guidedHotspotId = useMemo(() => {
    if (!guideArrows || !guideLookAt) return null;
    let best: string | null = null;
    let bestD = 2.8;
    for (const h of hotspots) {
      const d = Math.hypot(h.position[0] - guideLookAt[0], h.position[2] - guideLookAt[2]);
      if (d < bestD) {
        bestD = d;
        best = h.id;
      }
    }
    return best;
  }, [guideArrows, guideLookAt, hotspots]);

  const props = useMemo(() => {
    const t = buildIslandTerrain(islandSeedFromId(`${island.id}-shore`), look, "near", biome);
    const keepHuts = (biome.propWeights.hut ?? 0) > 0.04 || culture.landmarks.includes("hut");
    return t.props
      .filter((p) => keepHuts || p.kind !== "hut")
      .slice(0, culture.layout === "strip" ? 12 : 18)
      .map((p, i) => {
        if (culture.layout === "crescent") {
          const ang = Math.PI * 0.15 + (i / 16) * Math.PI * 0.7;
          const r = 11.8 + (i % 3) * 0.7;
          return { ...p, position: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number] };
        }
        if (culture.layout === "strip") {
          const side = i % 2 === 0 ? -1 : 1;
          return { ...p, position: [side * (9.5 + (i % 3)), 0.02, -6 + i * 1.1] as [number, number, number] };
        }
        if (culture.layout === "cluster") {
          const g = i % 3;
          const ang = (g / 3) * Math.PI * 2 + i * 0.2;
          const r = 8.5 + g * 2.2;
          return { ...p, position: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number] };
        }
        const ang = (i / 14) * Math.PI * 2;
        const r = 11.5 + (i % 3) * 0.9;
        return { ...p, position: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number] };
      });
  }, [island.id, look, culture, biome]);

  const plazaRadius = culture.layout === "radar" ? 10.5 : culture.layout === "keep" ? 7.5 : 9.2;

  return (
    <>
      <WorldLighting look={look} contactShadows={false} shadowMapSize={512} />
      <OceanWater
        color={look.sea}
        shading={look.shading}
        size={420}
        calm={biome.id === "oscilloscope_tundra" || biome.id === "mist_cliffs"}
      />

      <BiomeGround look={look} biome={biome} wire={wire} plazaRadius={plazaRadius} />

      {culture.layout === "radar" ? (
        <>
          {[3, 5.5, 8, 10.5].map((rad) => (
            <mesh key={rad} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
              <ringGeometry args={[rad - 0.06, rad + 0.06, 48]} />
              <meshStandardMaterial color={look.accent} emissive={look.accent} emissiveIntensity={0.35} wireframe={wire} />
            </mesh>
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh key={`spoke-${i}`} rotation={[-Math.PI / 2, 0, (i / 8) * Math.PI]} position={[0, 0.065, 0]}>
              <planeGeometry args={[0.08, 21]} />
              <meshStandardMaterial color={look.accent} emissive={look.accent} emissiveIntensity={0.25} wireframe={wire} />
            </mesh>
          ))}
        </>
      ) : culture.layout === "strip" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
          <planeGeometry args={[6.5, 22]} />
          <meshStandardMaterial color={look.shore} roughness={0.7} emissive={look.accent} emissiveIntensity={0.12} wireframe={wire} />
        </mesh>
      ) : null}

      <WoodenPier position={anchors.pier} />
      {wire ? <WireNature look={look} /> : <NatureProps props={props} look={look} />}

      <IslandTitle
        title={island.name}
        subtitle={`${biome.label} · ${culture.cultureName}`}
        height={8.2}
        accent={look.accent}
      />

      {ambients.map((res) => (
        <AmbientCritter
          key={res.id}
          resident={res}
          look={look}
          animationStyle={animationStyle}
          fauna={culture.fauna}
        />
      ))}

      {hotspots.map((h) => (
        <PadMarker
          key={h.id}
          hotspot={h}
          look={look}
          active={nearId === h.id}
          guided={guideArrows && guidedHotspotId === h.id}
          collected={h.kind === "item" && h.refId ? collectedItemIds.includes(h.refId) : false}
          animationStyle={animationStyle}
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
  guideTip,
  guideLookAt = null,
  guideArrows = true,
  onGuideProject,
}: Props) {
  const theme = getIslandTheme(island.id, island.themeId);
  const biome = useMemo(() => getIslandBiome(island.id), [island.id]);
  const look = useMemo(() => getIslandLook3D(island.id, theme.animationStyle), [island.id, theme.animationStyle]);
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
            biome={biome}
            hotspots={hotspots}
            nearId={near}
            collectedItemIds={collectedItemIds}
            character={character}
            animationStyle={theme.animationStyle}
            onNear={setNear}
            playerPosOut={playerPos}
            guideLookAt={guideLookAt}
            guideArrows={guideArrows}
          />
          <MoneyBagGuide
            lookAt={guideLookAt}
            playerPos={playerPos}
            tip={guideTip ?? "Stay with me — I’ll point the next step!"}
            reducedMotion={reduced}
            pointingEnabled={guideArrows}
          />
          <GuideProjector
            lookAt={guideLookAt}
            enabled={guideArrows}
            onProject={onGuideProject ?? (() => {})}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
