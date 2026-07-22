import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh, HarborNpcMesh } from "./VoyagerMesh";
import { getEraLook3D } from "./eraLooks";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { EraIslandMesh } from "./EraIslandMesh";
import { HarborBuilding, WoodenPier, NatureProps } from "./NatureProps";
import { buildIslandTerrain, islandSeedFromId } from "./islandTerrain";
import { IslandTitle } from "./IslandTitle";
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
  /** Lift near-store state into the HUD so Enter is clickable above the footer. */
  onNearChange?: (id: string | null, label: string | null) => void;
};

const LOOK = getEraLook3D("capital-default");
const SPEED = 6.5;
const INTERACT_R = 4.4;
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
  /** Stable orbit yaw — does not flip when walking backward. */
  const camYaw = useRef(Math.PI); // look toward −Z stores from spawn at +Z
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

    // Tank-style: A/D turn in place; W/S walk along facing without spinning the camera on reverse.
    const turn = (keys.current.r ? -1 : 0) + (keys.current.l ? 1 : 0);
    if (turn !== 0) {
      camYaw.current += turn * 2.4 * dt;
      facing.current = camYaw.current;
    }

    const forward = (keys.current.f ? 1 : 0) + (keys.current.b ? -1 : 0);
    moving.current = forward !== 0 || turn !== 0;

    const fx = Math.sin(facing.current);
    const fz = Math.cos(facing.current);
    if (forward !== 0) {
      vel.current.set(fx * forward, 0, fz * forward);
      vel.current.normalize().multiplyScalar(SPEED * dt);
      group.current.position.add(vel.current);
      // Only face the walk direction when moving forward so reverse keeps storefronts in view.
      if (forward > 0) {
        facing.current = camYaw.current;
      }
    }

    group.current.rotation.y = facing.current;

    const p = group.current.position;
    const r = Math.hypot(p.x, p.z);
    if (r > PLAZA_R) {
      p.x *= PLAZA_R / r;
      p.z *= PLAZA_R / r;
    }
    p.y = 0.02;

    // Camera stays behind the character using camYaw (stable on S / ArrowDown).
    const back = 8;
    const ideal = new THREE.Vector3(
      p.x - Math.sin(camYaw.current) * back,
      4.8,
      p.z - Math.cos(camYaw.current) * back,
    );
    camera.position.lerp(ideal, 1 - Math.pow(0.0015, dt));
    camera.lookAt(p.x, 1.25, p.z);

    // Prefer the building's doorfront (toward plaza center) for interact distance.
    let near: string | null = null;
    let best = INTERACT_R;
    for (const h of hotspots) {
      const hx = h.position[0];
      const hz = h.position[2];
      const len = Math.hypot(hx, hz) || 1;
      // Door sits on the plaza-facing side of the stall
      const doorX = hx - (hx / len) * 1.15;
      const doorZ = hz - (hz / len) * 1.15;
      const d = Math.hypot(doorX - p.x, doorZ - p.z);
      if (d < best) {
        best = d;
        near = h.id;
      }
    }
    onNear(near);
  });

  return (
    <group ref={group} position={[0, 0, 7]} rotation={[0, Math.PI, 0]}>
      <VoyagerMesh character={character} pose={moving.current ? "run" : "stand"} scale={1} />
    </group>
  );
}

function Fountain() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.05, 2.25, 0.28, 20]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.82} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.55, 1.85, 0.4, 18]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 1.0, 10]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.7} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <torusGeometry args={[0.55, 0.12, 8, 20]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.65} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.4, 14, 12]} />
        <meshStandardMaterial color="#f4a629" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.1, 24]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.18} metalness={0.4} transparent opacity={0.78} />
      </mesh>
      {/* Splash rings */}
      {[0.7, 1.0].map((rad, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.64 + i * 0.02, 0]}>
          <ringGeometry args={[rad, rad + 0.08, 24]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function PlazaLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.1, 8]} />
        <meshStandardMaterial color="#44403c" roughness={0.7} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function MarketCrate({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.55, 0.4, 0.45]} />
        <meshStandardMaterial color="#a16207" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.4]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

function PlazaScene({
  hotspots,
  onHotspot,
}: {
  hotspots: HarborHotspot[];
  onHotspot: (id: string) => void;
}) {
  // Keep vegetation on the outer ring only — never under the title / fountain.
  const accentProps = useMemo(() => {
    const t = buildIslandTerrain(islandSeedFromId("harbor-props"), LOOK, "near");
    return t.props
      .filter((p) => p.kind !== "hut")
      .slice(0, 34)
      .map((p, i) => {
        const ang = (i / 34) * Math.PI * 2;
        const r = 12.2 + (i % 3) * 1.1;
        return {
          ...p,
          // Prefer shorter bushes/grass near the inner edge
          kind: r < 12.6 && (p.kind === "palm" || p.kind === "tree") ? ("bush" as const) : p.kind,
          position: [Math.cos(ang) * r, 0.02, Math.sin(ang) * r] as [number, number, number],
          scale: (p.kind === "palm" || p.kind === "tree" ? 0.85 : 1) * p.scale,
        };
      })
      .filter((p) => Math.hypot(p.position[0], p.position[2]) >= 11.5);
  }, []);

  const buildingColors = ["#fef3c7", "#ecfccb", "#e0f2fe", "#ffe4e6", "#f5f5f4"];

  const locals = [
    {
      pos: [4.8, 0, -4.0] as [number, number, number],
      coat: "#fb7185",
      pants: "#1e3a5f",
      skin: "#fef3c7",
      form: "piggy" as const,
    },
    {
      pos: [-5.4, 0, 2.8] as [number, number, number],
      coat: "#38bdf8",
      pants: "#334155",
      skin: "#fef9c3",
      form: "coin" as const,
    },
    {
      pos: [3.8, 0, 6.0] as [number, number, number],
      coat: "#34d399",
      pants: "#1e3a5f",
      skin: "#ecfccb",
      form: "bill" as const,
    },
    {
      pos: [-3.2, 0, -6.6] as [number, number, number],
      coat: "#f4a629",
      pants: "#3f2a1a",
      skin: "#fde68a",
      form: "ledger" as const,
    },
  ];

  const cobbles = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const ang = (i / 36) * Math.PI * 2 + (i % 5) * 0.07;
      const rad = 2.2 + (i % 7) * 0.95;
      return {
        x: Math.cos(ang) * rad,
        z: Math.sin(ang) * rad,
        s: 0.35 + (i % 4) * 0.08,
      };
    });
  }, []);

  return (
    <>
      <WorldLighting look={LOOK} contactShadows={false} shadowMapSize={1024} />
      <OceanWater color={LOOK.sea} shading={LOOK.shading} size={400} calm />

      {/* Island land mass + cliff thickness */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color={LOOK.land} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[17.2, 18.8, 1.3, 48]} />
        <meshStandardMaterial color="#6b6560" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, -1.45, 0]} castShadow>
        <cylinderGeometry args={[18.8, 20.2, 0.4, 48]} />
        <meshStandardMaterial color="#4b5563" roughness={0.98} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
        <ringGeometry args={[14, 18.8, 64]} />
        <meshStandardMaterial color={LOOK.shore} roughness={0.9} />
      </mesh>
      {/* Foam line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[17.6, 18.6, 64]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <ringGeometry args={[18.5, 20.5, 48]} />
        <meshStandardMaterial color="#0369a1" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Outer hills with rock outcrops */}
      {[
        [12, 0.4, -10],
        [-13, 0.55, -8],
        [10, 0.35, 12],
        [-11, 0.45, 11],
        [0, 0.7, -15],
        [14, 0.5, 4],
        [-14.5, 0.45, -2],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[2.0 + (i % 3) * 0.35, 12, 9]} />
            <meshStandardMaterial color={LOOK.land} roughness={0.88} flatShading />
          </mesh>
          <mesh castShadow position={[0.8, 0.3, 0.4]} rotation={[0.3, 0.5, 0.2]} scale={0.55}>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#78716c" roughness={0.94} flatShading />
          </mesh>
        </group>
      ))}

      {/* Stone plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[10.5, 56]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.88} flatShading />
      </mesh>
      {cobbles.map((c, i) => (
        <mesh
          key={`cobble-${i}`}
          rotation={[-Math.PI / 2, 0, (i % 5) * 0.3]}
          position={[c.x, 0.055, c.z]}
          receiveShadow
        >
          <circleGeometry args={[c.s, 6]} />
          <meshStandardMaterial
            color={i % 2 ? "#d6d3d1" : "#c4c0bc"}
            roughness={0.92}
            flatShading
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <ringGeometry args={[5.5, 8.2, 48]} />
        <meshStandardMaterial color={LOOK.shore} roughness={0.9} />
      </mesh>
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

      {/* High billboard title — clear of canopy */}
      <IslandTitle
        title="Harbor Haven"
        subtitle="Your first island · Fortune Archipelago"
        height={10.2}
        accent={LOOK.accent}
      />

      <WoodenPier position={[0, 0.05, 12.5]} />

      {/* Seawall + lanterns */}
      {Array.from({ length: 28 }).map((_, i) => {
        const ang = (i / 28) * Math.PI * 2;
        const r = 14.5;
        return (
          <group key={i}>
            <mesh
              castShadow
              position={[Math.cos(ang) * r, 0.35, Math.sin(ang) * r]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[3.2, 0.75, 0.5]} />
              <meshStandardMaterial color="#a8a29e" roughness={0.85} flatShading />
            </mesh>
            <mesh
              castShadow
              position={[Math.cos(ang) * r, 0.78, Math.sin(ang) * r]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[3.0, 0.12, 0.55]} />
              <meshStandardMaterial color="#78716c" roughness={0.8} flatShading />
            </mesh>
            {i % 4 === 0 ? (
              <PlazaLantern
                position={[Math.cos(ang) * (r - 0.55), 0.05, Math.sin(ang) * (r - 0.55)]}
              />
            ) : null}
          </group>
        );
      })}

      <NatureProps props={accentProps} look={LOOK} useKenney={KENNEY_ENABLED} />

      {/* Market crates near the pier path */}
      <MarketCrate position={[1.8, 0.02, 9.2]} rot={0.3} />
      <MarketCrate position={[2.4, 0.02, 9.6]} rot={-0.5} />
      <MarketCrate position={[-2.1, 0.02, 8.8]} rot={1.1} />
      <mesh castShadow position={[-1.5, 0.28, 9.5]}>
        <cylinderGeometry args={[0.22, 0.24, 0.5, 10]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} flatShading />
      </mesh>

      {hotspots.map((h, idx) => {
        // Face the door toward the plaza center so entrances are readable.
        const yaw = Math.atan2(-h.position[0], -h.position[2]);
        return (
          <group
            key={h.id}
            position={h.position}
            rotation={[0, yaw, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onHotspot(h.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            <HarborBuilding
              label={h.label}
              accent={LOOK.accent}
              body={buildingColors[idx % buildingColors.length]}
            />
            <Text
              position={[0, 3.15, 0]}
              fontSize={0.3}
              color="#16283b"
              anchorX="center"
              outlineWidth={0.02}
              outlineColor="#ffffff"
            >
              {`${h.icon} ${h.label}`}
            </Text>
          </group>
        );
      })}

      {locals.map((npc, i) => (
        <group key={i} position={npc.pos} rotation={[0, (i * Math.PI) / 3, 0]}>
          <HarborNpcMesh
            coat={npc.coat}
            pants={npc.pants}
            skin={npc.skin}
            form={npc.form}
          />
        </group>
      ))}

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
      <EraIslandMesh
        look={getEraLook3D("era-1980s")}
        seed="horizon-c"
        position={[8, -0.2, -55]}
        scale={1.8}
        detail="far"
      />
    </>
  );
}

/**
 * Walkable Harbor plaza — third-person money mascot, approach stalls to enter.
 */
export function WalkableHarborView({
  character,
  hotspots,
  onHotspot,
  onOpenTravel,
  onNearChange,
}: Props) {
  const [near, setNear] = useState<string | null>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E" || e.key === "Enter") && near) {
        e.preventDefault();
        onHotspot(near);
      }
      if (e.key === "m" || e.key === "M") onOpenTravel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [near, onHotspot, onOpenTravel]);

  useEffect(() => {
    const label = hotspots.find((h) => h.id === near)?.label ?? null;
    onNearChange?.(near, label);
  }, [near, hotspots, onNearChange]);

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
          <PlazaScene hotspots={hotspots} onHotspot={onHotspot} />
          <Player character={character} hotspots={hotspots} onNear={setNear} />
        </Suspense>
      </Canvas>

      {/* Always-on top title — never obscured by 3D foliage */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col items-center bg-gradient-to-b from-black/55 via-black/20 to-transparent px-4 pb-10 pt-4 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-100/90">
          Fortune Archipelago
        </div>
        <h1 className="mt-1 font-[Fraunces,Georgia,serif] text-2xl font-black tracking-wide text-white drop-shadow sm:text-3xl">
          Harbor Haven
        </h1>
        <p className="text-xs font-semibold text-white/80">Your first island</p>
      </div>
    </div>
  );
}
