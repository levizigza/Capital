import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle } from "../animationStyles";
import { getEffectiveBoatTier } from "../boats";
import {
  buildArchipelagoLayout,
  getArchipelagoNode,
  isIslandLocked,
  type ArchipelagoNode,
} from "../worldMapLayout";
import type { CapitalCharacter } from "../character";
import { getEraLook3D, type EraLook3D } from "./eraLooks";
import { MoneyCarpet } from "./MoneyCarpet";
import { EraIslandMesh } from "./EraIslandMesh";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";

type Props = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  character?: CapitalCharacter | null;
  voyageTargetId?: string | null;
  onBack: () => void;
  onEnterIsland: (islandId: string) => void;
};

type WorldIsle = {
  node: ArchipelagoNode;
  look: EraLook3D;
  pos: THREE.Vector3;
};

const ARRIVE = 14;
const SPEED_N = 22;
const SPEED_F = 42;
const TURN = 1.65;

function FlightRig({
  world,
  targetId,
  character,
  onArrive,
}: {
  world: WorldIsle[];
  targetId?: string | null;
  character?: CapitalCharacter | null;
  onArrive: (id: string) => void;
}) {
  const carpet = useRef<THREE.Group>(null);
  const keys = useRef({ l: false, r: false, up: false, down: false });
  const state = useRef({
    x: 0,
    z: 18,
    y: 3.2,
    heading: 0,
    speed: SPEED_N,
    arrived: false,
  });
  const { camera } = useThree();
  const [hud, setHud] = useState({ knots: 0, hint: "Steer toward an island" });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.l = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.r = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.current.down = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.l = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.r = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.current.down = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, dt) => {
    const s = state.current;
    if (s.arrived) return;
    const steer = (keys.current.l ? 1 : 0) + (keys.current.r ? -1 : 0);
    s.heading += steer * TURN * dt;
    const max = keys.current.up ? SPEED_F : keys.current.down ? SPEED_N * 0.45 : SPEED_N;
    s.speed += (max - s.speed) * Math.min(1, dt * 3);
    s.x += Math.sin(s.heading) * s.speed * dt;
    s.z += Math.cos(s.heading) * s.speed * dt;
    s.y = 3.2 + Math.sin(performance.now() / 450) * 0.25 + (keys.current.up ? 0.8 : 0);

    if (carpet.current) {
      carpet.current.position.set(s.x, s.y, s.z);
      carpet.current.rotation.order = "YXZ";
      carpet.current.rotation.y = s.heading;
      carpet.current.rotation.x = -0.12;
      carpet.current.rotation.z = Math.sin(performance.now() / 500) * 0.03;
      carpet.current.updateMatrixWorld(true);

      // Carpet-local POV: below-and-ahead view of the flapping bill
      const eye = new THREE.Vector3(0, 0.52, -1.05).applyMatrix4(carpet.current.matrixWorld);
      const look = new THREE.Vector3(0, 0.02, 1.55).applyMatrix4(carpet.current.matrixWorld);
      look.y += Math.sin(performance.now() / 130) * 0.05;
      camera.position.lerp(eye, 1 - Math.pow(0.0008, dt));
      camera.lookAt(look);
    }

    let nearest: WorldIsle | null = null;
    let nearestDist = Infinity;
    for (const wi of world) {
      const d = Math.hypot(wi.pos.x - s.x, wi.pos.z - s.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = wi;
      }
    }

    if (nearest) {
      const marked = targetId && nearest.node.island.id === targetId ? "🎯 " : "";
      setHud({
        knots: Math.round((s.speed / SPEED_F) * 60),
        hint: `${marked}${nearest.node.island.name} · ${Math.round(nearestDist)}m — fly closer to land`,
      });
      if (nearestDist < ARRIVE) {
        s.arrived = true;
        onArrive(nearest.node.island.id);
      }
    }
  });

  // expose hud via DOM bridge
  useEffect(() => {
    const el = document.getElementById("carpet-flight-hud");
    if (el) {
      el.dataset.knots = String(hud.knots);
      el.dataset.hint = hud.hint;
      const k = el.querySelector("[data-knots]");
      const h = el.querySelector("[data-hint]");
      if (k) k.textContent = `${hud.knots}`;
      if (h) h.textContent = hud.hint;
    }
  }, [hud]);

  return (
    <group ref={carpet}>
      <MoneyCarpet character={character} flying hideRider povRide />
    </group>
  );
}

function WorldScene({
  world,
  look,
  targetId,
  character,
  onArrive,
}: {
  world: WorldIsle[];
  look: EraLook3D;
  targetId?: string | null;
  character?: CapitalCharacter | null;
  onArrive: (id: string) => void;
}) {
  return (
    <>
      <WorldLighting look={look} shadowMapSize={1024} />
      <OceanWater color={look.sea} shading={look.shading} />
      {world.map((wi) => {
        const isTarget = targetId === wi.node.island.id;
        return (
          <EraIslandMesh
            key={wi.node.island.id}
            look={wi.look}
            seed={wi.node.island.id}
            position={[wi.pos.x, 0, wi.pos.z]}
            scale={isTarget ? 1.85 : 1.45}
            detail={isTarget ? "near" : "far"}
            showPier={isTarget}
            selected={isTarget}
          />
        );
      })}
      <FlightRig world={world} targetId={targetId} character={character} onArrive={onArrive} />
      <Text
        position={[0, 8, 0]}
        fontSize={1.2}
        color={look.accent}
        anchorX="center"
        outlineWidth={0.04}
        outlineColor="#0c1622"
      >
        Fortune Archipelago
      </Text>
    </>
  );
}

/**
 * Full-screen 3D money-carpet voyage — real flight graphics (R3F / Three.js).
 */
export function CarpetFlightView({
  userProfile,
  islands,
  save,
  character,
  voyageTargetId,
  onBack,
  onEnterIsland,
}: Props) {
  // When a destination is already chosen, skip the dock card and launch in POV.
  const [phase, setPhase] = useState<"dock" | "fly">(() => (voyageTargetId ? "fly" : "dock"));
  const [arriving, setArriving] = useState<string | null>(null);
  const boatTier = getEffectiveBoatTier(userProfile.totalCoins, save);
  const archipelago = useMemo(() => buildArchipelagoLayout(islands), [islands]);
  const currentIsland = useMemo(
    () => islands.find((i) => i.id === save.currentIslandId) ?? archipelago.hub.island,
    [islands, save.currentIslandId, archipelago.hub.island],
  );
  const currentNode = useMemo(
    () => getArchipelagoNode(archipelago, currentIsland.id) ?? archipelago.hub,
    [archipelago, currentIsland.id],
  );
  const homeLook = useMemo(() => {
    const theme = getIslandTheme(currentIsland.id, currentIsland.themeId);
    return getEraLook3D(theme.animationStyle);
  }, [currentIsland]);

  const world = useMemo<WorldIsle[]>(() => {
    const cx = currentNode.worldX * 0.08;
    const cz = currentNode.worldY * 0.08;
    return archipelago.all
      .filter((n) => n.island.id !== currentIsland.id)
      .filter((n) => !isIslandLocked(n.island, save.inventory, save))
      .map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const look = getEraLook3D(theme.animationStyle);
        return {
          node,
          look,
          pos: new THREE.Vector3(node.worldX * 0.08 - cx, 0, node.worldY * 0.08 - cz + 40),
        };
      });
  }, [archipelago.all, currentIsland.id, currentNode.worldX, currentNode.worldY, save]);

  const targetEra = useMemo(() => {
    if (!voyageTargetId) return null;
    const isl = islands.find((i) => i.id === voyageTargetId);
    if (!isl) return null;
    const theme = getIslandTheme(isl.id, isl.themeId);
    return getAnimationStyle(theme.animationStyle);
  }, [islands, voyageTargetId]);

  const handleArrive = (id: string) => {
    setArriving(id);
    window.setTimeout(() => onEnterIsland(id), 900);
  };

  if (phase === "dock") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#0c1622]">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 4, 10], fov: 55 }}
          className="absolute inset-0"
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(homeLook.skyTop, 1)}
        >
          <Suspense fallback={null}>
            <WorldLighting look={homeLook} contactShadows={false} shadowMapSize={1024} />
            <OceanWater color={homeLook.sea} shading={homeLook.shading} size={200} calm />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]} receiveShadow>
              <circleGeometry args={[6, 32]} />
              <meshStandardMaterial color={homeLook.shore} roughness={0.9} />
            </mesh>
            <group position={[0, 0.45, 0]}>
              <MoneyCarpet character={character ?? save.character} flying={false} />
            </group>
            <EraIslandMesh
              look={homeLook}
              seed={currentIsland.id}
              position={[0, 0, -8]}
              scale={1.5}
              detail="near"
              showPier
            />
          </Suspense>
        </Canvas>
        <button
          type="button"
          className="absolute left-4 top-4 z-20 rounded-full border-2 border-white/30 bg-black/50 px-4 py-2 text-sm font-bold text-white"
          onClick={onBack}
        >
          ← Back
        </button>
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 to-transparent pb-10 pt-24 text-center">
          <div className="text-4xl">{boatTier.emoji}</div>
          <h1 className="text-2xl font-black text-white drop-shadow">Board your money magic carpet</h1>
          <p className="max-w-md px-4 text-sm text-white/80">
            Real flight across the archipelago — steer with A/D or ←/→, soar with W / ↑.
            {voyageTargetId && targetEra
              ? ` Course set for ${targetEra.decade} · ${targetEra.eraLabel}.`
              : " Pick any glowing island ahead."}
          </p>
          <button
            type="button"
            className="rounded-full border-3 border-[#16283b] bg-[#f4a629] px-8 py-3 text-base font-extrabold text-[#16283b] shadow-lg"
            onClick={() => setPhase("fly")}
            autoFocus
          >
            Launch carpet →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 6, 12], fov: 60 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(homeLook.skyTop, 1)}
      >
        <Suspense fallback={null}>
          <WorldScene
            world={world}
            look={homeLook}
            targetId={voyageTargetId}
            character={character ?? save.character}
            onArrive={handleArrive}
          />
        </Suspense>
      </Canvas>

      <button
        type="button"
        className="absolute left-4 top-4 z-20 rounded-full border-2 border-white/30 bg-black/50 px-4 py-2 text-sm font-bold text-white"
        onClick={onBack}
      >
        ← Dock
      </button>

      <div
        id="carpet-flight-hud"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/75 to-transparent pb-8 pt-16"
      >
        <div className="rounded-2xl border border-white/20 bg-black/55 px-5 py-3 text-center text-white backdrop-blur-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-200">Carpet knots</div>
          <div className="text-3xl font-black tabular-nums">
            <span data-knots>0</span>
          </div>
          <div className="mt-1 max-w-sm text-xs text-white/80" data-hint>
            Steer toward an island
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
          A/D turn · W soar · S glide · land by flying into an island
        </div>
      </div>

      {arriving ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 text-2xl font-black text-white">
          Landing…
        </div>
      ) : null}
    </div>
  );
}
