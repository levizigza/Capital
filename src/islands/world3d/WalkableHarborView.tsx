import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";
import { getEraLook3D } from "./eraLooks";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { EraIslandMesh } from "./EraIslandMesh";
import { HarborBuilding, WoodenPier, NatureProps } from "./NatureProps";
import { buildIslandTerrain, islandSeedFromId } from "./islandTerrain";
import { KENNEY_ENABLED } from "./kenneyFlag";

export type HarborHotspot = {
  id: string;
  label: string;
  icon: string;
  position: [number, number, number];
};

type Props = {
  character?: CapitalCharacter | null;
  hotspots: HarborHotspot[];
  onHotspot: (id: string) => void;
  onOpenTravel: () => void;
};

const LOOK = getEraLook3D("capital-default");
const SPEED = 6.5;
const INTERACT_R = 2.6;
const PLAZA_R = 16;

function Player({
  character,
  hotspots,
  onNear,
}: {
  character?: CapitalCharacter | null;
  hotspots: HarborHotspot[];
  onNear: (id: string | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false });
  const vel = useRef(new THREE.Vector3());
  const facing = useRef(0);
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
    const forward = (keys.current.f ? 1 : 0) + (keys.current.b ? -1 : 0);
    const strafe = (keys.current.r ? 1 : 0) + (keys.current.l ? -1 : 0);
    moving.current = forward !== 0 || strafe !== 0;

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    const right = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    vel.current.set(0, 0, 0);
    vel.current.addScaledVector(camDir, forward);
    vel.current.addScaledVector(right, strafe);
    if (vel.current.lengthSq() > 0) {
      vel.current.normalize().multiplyScalar(SPEED * dt);
      group.current.position.add(vel.current);
      facing.current = Math.atan2(vel.current.x, vel.current.z);
      group.current.rotation.y = facing.current;
    }

    const p = group.current.position;
    const r = Math.hypot(p.x, p.z);
    if (r > PLAZA_R) {
      p.x *= PLAZA_R / r;
      p.z *= PLAZA_R / r;
    }
    p.y = 0.02;

    const back = 8;
    const ideal = new THREE.Vector3(
      p.x - Math.sin(facing.current) * back,
      4.6,
      p.z - Math.cos(facing.current) * back,
    );
    camera.position.lerp(ideal, 1 - Math.pow(0.002, dt));
    camera.lookAt(p.x, 1.35, p.z);

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
  });

  return (
    <group ref={group} position={[0, 0, 7]}>
      <VoyagerMesh character={character} pose={moving.current ? "run" : "stand"} scale={1} />
    </group>
  );
}

function Fountain() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1.6, 1.9, 0.5, 16]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 1.1, 10]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.7} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.45, 12, 10]} />
        <meshStandardMaterial color="#f4a629" roughness={0.35} metalness={0.35} />
      </mesh>
      {/* water bowl */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.12, 20]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.35} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function PlazaScene({ hotspots }: { hotspots: HarborHotspot[] }) {
  const accentProps = useMemo(() => {
    const t = buildIslandTerrain(islandSeedFromId("harbor-props"), LOOK, "near");
    // Reposition a subset around the plaza ring
    return t.props.slice(0, 22).map((p, i) => {
      const ang = (i / 22) * Math.PI * 2;
      const r = 11 + (i % 3) * 1.4;
      return {
        ...p,
        position: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number],
        scale: p.scale * 1.15,
      };
    });
  }, []);

  const buildingColors = ["#fef3c7", "#ecfccb", "#e0f2fe", "#ffe4e6", "#f5f5f4"];

  return (
    <>
      <WorldLighting look={LOOK} contactShadows={false} shadowMapSize={1024} />
      <OceanWater color={LOOK.sea} shading={LOOK.shading} size={400} calm />

      {/* Irregular grassy land shelf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[18, 56]} />
        <meshStandardMaterial color={LOOK.land} roughness={0.92} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
        <ringGeometry args={[14, 18.5, 56]} />
        <meshStandardMaterial color={LOOK.shore} roughness={0.9} />
      </mesh>
      {/* Soft hills at the rim (not under walkable plaza) */}
      {[
        [12, 0.4, -10],
        [-13, 0.55, -8],
        [10, 0.35, 12],
        [-11, 0.45, 11],
        [0, 0.7, -15],
      ].map((p, i) => (
        <mesh key={i} castShadow receiveShadow position={p as [number, number, number]}>
          <sphereGeometry args={[2.2 + (i % 3) * 0.4, 10, 8]} />
          <meshStandardMaterial color={LOOK.land} roughness={0.88} flatShading />
        </mesh>
      ))}

      {/* Stone plaza disc (walkable) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[10.5, 48]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.88} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <ringGeometry args={[5.5, 8.2, 48]} />
        <meshStandardMaterial color={LOOK.shore} roughness={0.9} />
      </mesh>
      {/* cobble spokes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, (i / 6) * Math.PI]}
          position={[0, 0.07, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.55, 10]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
        </mesh>
      ))}

      <Fountain />
      <Text
        position={[0, 2.55, 0]}
        fontSize={0.5}
        color="#16283b"
        anchorX="center"
        outlineWidth={0.03}
        outlineColor="#fef3c7"
      >
        Harbor Haven
      </Text>

      <WoodenPier position={[0, 0.05, 12.5]} />

      {/* Low seawall */}
      {Array.from({ length: 24 }).map((_, i) => {
        const ang = (i / 24) * Math.PI * 2;
        const r = 14.5;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(ang) * r, 0.35, Math.sin(ang) * r]}
            rotation={[0, -ang, 0]}
          >
            <boxGeometry args={[3.6, 0.7, 0.45]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.85} flatShading />
          </mesh>
        );
      })}

      <NatureProps props={accentProps} look={LOOK} useKenney={KENNEY_ENABLED} />

      {hotspots.map((h, idx) => (
        <group key={h.id} position={h.position}>
          <HarborBuilding
            label={h.label}
            accent={LOOK.accent}
            body={buildingColors[idx % buildingColors.length]}
          />
          <Text
            position={[0, 2.85, 0]}
            fontSize={0.32}
            color="#16283b"
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#ffffff"
          >
            {`${h.icon} ${h.label}`}
          </Text>
        </group>
      ))}

      {/* Locals */}
      {[
        [4.2, 0, -3.2],
        [-5.1, 0, 2.4],
        [3.4, 0, 5.5],
        [-2.8, 0, -6.2],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh castShadow position={[0, 0.55, 0]}>
            <capsuleGeometry args={[0.22, 0.45, 4, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#fb7185" : i === 1 ? "#38bdf8" : "#34d399"}
              roughness={0.55}
            />
          </mesh>
          <mesh castShadow position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial color="#fde68a" />
          </mesh>
        </group>
      ))}

      {/* Distant flavor islands */}
      <EraIslandMesh
        look={getEraLook3D("era-1990s")}
        seed="horizon-a"
        position={[-38, -0.2, -42]}
        scale={2.2}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-2000s")}
        seed="horizon-b"
        position={[42, -0.2, -36]}
        scale={2.6}
        detail="far"
      />
    </>
  );
}

/**
 * Walkable Harbor plaza — third-person Voyager, approach stalls to interact.
 */
export function WalkableHarborView({ character, hotspots, onHotspot, onOpenTravel }: Props) {
  const [near, setNear] = useState<string | null>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E" || e.key === "Enter") && near) {
        onHotspot(near);
      }
      if (e.key === "m" || e.key === "M") onOpenTravel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [near, onHotspot, onOpenTravel]);

  const nearLabel = hotspots.find((h) => h.id === near)?.label;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center bg-[#7dd3fc] text-sm font-bold text-[#16283b]/70">
        Loading Harbor Haven…
      </div>
      <Canvas
        shadows
        dpr={reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 5, 14], fov: 50 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#7dd3fc", 1);
        }}
      >
        <Suspense fallback={null}>
          <PlazaScene hotspots={hotspots} />
          <Player character={character} hotspots={hotspots} onNear={setNear} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/70 to-transparent pb-6 pt-16">
        {near ? (
          <div className="pointer-events-auto rounded-xl border-2 border-[#f4a629] bg-black/70 px-5 py-3 text-center text-white">
            <div className="text-sm font-bold">Near {nearLabel}</div>
            <button
              type="button"
              className="mt-2 rounded-full bg-[#f4a629] px-4 py-1.5 text-sm font-extrabold text-[#16283b]"
              onClick={() => onHotspot(near)}
            >
              Press E / Enter to open
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-black/50 px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-white/80">
            WASD walk · E interact · M archipelago map
          </div>
        )}
      </div>
    </div>
  );
}
