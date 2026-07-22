import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";
import { getEraLook3D } from "./eraLooks";

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
const INTERACT_R = 2.4;

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

    // camera-relative movement (BOTW-ish)
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

    // clamp to plaza disk
    const p = group.current.position;
    const r = Math.hypot(p.x, p.z);
    if (r > 18) {
      p.x *= 18 / r;
      p.z *= 18 / r;
    }
    p.y = 0;

    // follow cam
    const back = 7;
    const ideal = new THREE.Vector3(
      p.x - Math.sin(facing.current) * back,
      4.2,
      p.z - Math.cos(facing.current) * back,
    );
    camera.position.lerp(ideal, 1 - Math.pow(0.002, dt));
    camera.lookAt(p.x, 1.4, p.z);

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
    <group ref={group} position={[0, 0, 6]}>
      <VoyagerMesh character={character} pose={moving.current ? "run" : "stand"} scale={1} />
    </group>
  );
}

function PlazaProps({ hotspots }: { hotspots: HarborHotspot[] }) {
  return (
    <>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 48]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[6, 9, 48]} />
        <meshStandardMaterial color="#fde68a" roughness={0.85} />
      </mesh>
      {/* sea ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <ringGeometry args={[20, 60, 48]} />
        <meshStandardMaterial color={LOOK.sea} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* central fountain / plaza marker */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.5, 1.2, 12]} />
        <meshStandardMaterial color="#f4a629" />
      </mesh>
      <Text position={[0, 2.2, 0]} fontSize={0.55} color="#16283b" anchorX="center">
        Harbor Haven
      </Text>

      {hotspots.map((h) => (
        <group key={h.id} position={h.position}>
          <mesh castShadow position={[0, 0.9, 0]}>
            <boxGeometry args={[1.6, 1.8, 1.6]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, 2.0, 0]}>
            <coneGeometry args={[1.3, 0.8, 4]} />
            <meshStandardMaterial color="#f4a629" />
          </mesh>
          <Text position={[0, 2.7, 0]} fontSize={0.35} color="#16283b" anchorX="center">
            {`${h.icon} ${h.label}`}
          </Text>
        </group>
      ))}

      {/* ambient NPCs — simple bobbing locals */}
      {[
        [4, 0, -3],
        [-5, 0, 2],
        [3, 0, 5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
          <meshStandardMaterial color={i === 0 ? "#fb7185" : i === 1 ? "#38bdf8" : "#34d399"} />
        </mesh>
      ))}
    </>
  );
}

/**
 * Walkable Harbor plaza — third-person Voyager, approach stalls to interact.
 */
export function WalkableHarborView({ character, hotspots, onHotspot, onOpenTravel }: Props) {
  const [near, setNear] = useState<string | null>(null);

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
      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }} className="absolute inset-0">
        <Suspense fallback={null}>
          <color attach="background" args={[LOOK.skyTop]} />
          <fog attach="fog" args={[LOOK.fog, 25, 70]} />
          <ambientLight intensity={0.55} />
          <directionalLight castShadow position={[12, 18, 8]} intensity={1.25} color={LOOK.sunColor} />
          <Sky sunPosition={[60, 30, 40]} />
          <PlazaProps hotspots={hotspots} />
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
