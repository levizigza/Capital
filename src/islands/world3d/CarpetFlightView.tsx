import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
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
import { useInputAction } from "@/input";

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

/** Arrival radius — land when you fly into the island. */
const ARRIVE = 16;
/** Cruise / soar / rush speeds (world units per second). */
const SPEED_N = 48;
const SPEED_F = 78;
const SPEED_RUSH = 140;
const TURN = 1.85;
/** Compact archipelago scale so destinations feel close on the horizon. */
const WORLD_SCALE = 0.042;
const START_Z = 14;
const AHEAD_BIAS = 22;

type BoostApi = {
  setBoost: (on: boolean) => void;
  rushToTarget: () => void;
};

function FlightRig({
  world,
  targetId,
  character,
  boostApi,
  onArrive,
}: {
  world: WorldIsle[];
  targetId?: string | null;
  character?: CapitalCharacter | null;
  boostApi: MutableRefObject<BoostApi | null>;
  onArrive: (id: string) => void;
}) {
  const carpet = useRef<THREE.Group>(null);
  const keys = useRef({ l: false, r: false, up: false, down: false, boost: false });
  const rush = useRef(false);
  const state = useRef({
    x: 0,
    z: START_Z,
    y: 4.2,
    heading: 0,
    speed: SPEED_N,
    arrived: false,
  });
  const { camera } = useThree();
  const [hud, setHud] = useState({ knots: 0, hint: "Steer toward an island", rushing: false });

  // Aim initial heading at the voyage target (or nearest island).
  useEffect(() => {
    const s = state.current;
    const preferred =
      (targetId && world.find((w) => w.node.island.id === targetId)) || world[0];
    if (preferred) {
      s.heading = Math.atan2(preferred.pos.x - s.x, preferred.pos.z - s.z);
    }
  }, [targetId, world]);

  useEffect(() => {
    boostApi.current = {
      setBoost: (on) => {
        keys.current.boost = on;
      },
      rushToTarget: () => {
        rush.current = true;
        keys.current.boost = true;
      },
    };
    return () => {
      boostApi.current = null;
    };
  }, [boostApi]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.l = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.r = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.current.down = true;
      if (e.key === "Shift" || e.code === "Space") {
        e.preventDefault();
        keys.current.boost = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.l = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.r = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.current.down = false;
      if (e.key === "Shift" || e.code === "Space") {
        if (!rush.current) keys.current.boost = false;
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
    const s = state.current;
    if (s.arrived) return;

    let nearest: WorldIsle | null = null;
    let nearestDist = Infinity;
    for (const wi of world) {
      const d = Math.hypot(wi.pos.x - s.x, wi.pos.z - s.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = wi;
      }
    }
    const target =
      (targetId && world.find((w) => w.node.island.id === targetId)) || nearest;

    // Rush / boost auto-steers toward the destination island.
    if ((keys.current.boost || rush.current) && target) {
      const want = Math.atan2(target.pos.x - s.x, target.pos.z - s.z);
      let delta = want - s.heading;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      s.heading += delta * Math.min(1, dt * 3.2);
    } else {
      const steer = (keys.current.l ? 1 : 0) + (keys.current.r ? -1 : 0);
      s.heading += steer * TURN * dt;
    }

    const max = keys.current.boost || rush.current
      ? SPEED_RUSH
      : keys.current.up
        ? SPEED_F
        : keys.current.down
          ? SPEED_N * 0.45
          : SPEED_N;
    s.speed += (max - s.speed) * Math.min(1, dt * 3.4);
    s.x += Math.sin(s.heading) * s.speed * dt;
    s.z += Math.cos(s.heading) * s.speed * dt;
    s.y =
      4.2 +
      Math.sin(performance.now() / 450) * 0.28 +
      (keys.current.up || keys.current.boost ? 1.1 : 0);

    if (carpet.current) {
      carpet.current.position.set(s.x, s.y, s.z);
      carpet.current.rotation.order = "YXZ";
      carpet.current.rotation.y = s.heading;
      carpet.current.rotation.x = -0.06;
      carpet.current.rotation.z = Math.sin(performance.now() / 500) * 0.03;
      carpet.current.updateMatrixWorld(true);

      // Wide horizon ride — eye above the rug, gaze far across the sea.
      const eye = new THREE.Vector3(0, 1.05, -0.55).applyMatrix4(carpet.current.matrixWorld);
      const horizon = new THREE.Vector3(0, 1.35, 42).applyMatrix4(carpet.current.matrixWorld);
      const carpetHint = new THREE.Vector3(0, 0.02, 3.4).applyMatrix4(carpet.current.matrixWorld);
      horizon.lerp(carpetHint, 0.1);
      camera.position.lerp(eye, 1 - Math.pow(0.0004, dt));
      camera.lookAt(horizon);
      camera.fov = 68;
      camera.updateProjectionMatrix();
    }

    if (nearest) {
      const marked = targetId && nearest.node.island.id === targetId ? "🎯 " : "";
      const rushing = keys.current.boost || rush.current;
      setHud({
        knots: Math.round((s.speed / SPEED_RUSH) * 90),
        hint: rushing
          ? `${marked}${nearest.node.island.name} · rushing in · ${Math.round(nearestDist)}m`
          : `${marked}${nearest.node.island.name} · ${Math.round(nearestDist)}m — fly closer to land`,
        rushing,
      });
      if (nearestDist < ARRIVE) {
        s.arrived = true;
        onArrive(nearest.node.island.id);
      }
    }
  });

  useEffect(() => {
    const el = document.getElementById("carpet-flight-hud");
    if (el) {
      el.dataset.knots = String(hud.knots);
      el.dataset.hint = hud.hint;
      el.dataset.rushing = hud.rushing ? "1" : "0";
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
  boostApi,
  onArrive,
}: {
  world: WorldIsle[];
  look: EraLook3D;
  targetId?: string | null;
  character?: CapitalCharacter | null;
  boostApi: MutableRefObject<BoostApi | null>;
  onArrive: (id: string) => void;
}) {
  return (
    <>
      <WorldLighting look={{ ...look, fogNear: 24, fogFar: 160 }} shadowMapSize={512} />
      <OceanWater color={look.sea} shading={look.shading} size={1200} />
      {world.map((wi) => {
        const isTarget = targetId === wi.node.island.id;
        return (
          <EraIslandMesh
            key={wi.node.island.id}
            look={wi.look}
            seed={wi.node.island.id}
            position={[wi.pos.x, 0, wi.pos.z]}
            scale={isTarget ? 2.15 : 1.65}
            detail={isTarget ? "near" : "far"}
            showPier={isTarget}
            selected={isTarget}
          />
        );
      })}
      <FlightRig
        world={world}
        targetId={targetId}
        character={character}
        boostApi={boostApi}
        onArrive={onArrive}
      />
      <Text
        position={[0, 10, -8]}
        fontSize={1.4}
        color={look.accent}
        anchorX="center"
        outlineWidth={0.05}
        outlineColor="#0c1622"
      >
        Fortune Archipelago
      </Text>
    </>
  );
}

/**
 * Full-screen 3D money-carpet voyage — real flight graphics (R3F / Three.js).
 * Uses fixed viewport fill so the ride never collapses into a top strip.
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
  const [phase, setPhase] = useState<"dock" | "fly">(() => (voyageTargetId ? "fly" : "dock"));
  const [arriving, setArriving] = useState<string | null>(null);
  const [boostHeld, setBoostHeld] = useState(false);
  const boostApi = useRef<BoostApi | null>(null);
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
    const cx = currentNode.worldX * WORLD_SCALE;
    const cz = currentNode.worldY * WORLD_SCALE;
    return archipelago.all
      .filter((n) => n.island.id !== currentIsland.id)
      .filter((n) => !isIslandLocked(n.island, save.inventory, save))
      .map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const look = getEraLook3D(theme.animationStyle);
        return {
          node,
          look,
          pos: new THREE.Vector3(
            node.worldX * WORLD_SCALE - cx,
            0,
            node.worldY * WORLD_SCALE - cz + AHEAD_BIAS,
          ),
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

  const targetName = useMemo(() => {
    if (!voyageTargetId) return null;
    return islands.find((i) => i.id === voyageTargetId)?.name ?? null;
  }, [islands, voyageTargetId]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useInputAction("cancel", onBack);

  const handleArrive = (id: string) => {
    setArriving(id);
    window.setTimeout(() => onEnterIsland(id), 700);
  };

  const setBoost = (on: boolean) => {
    setBoostHeld(on);
    boostApi.current?.setBoost(on);
  };

  const shellClass =
    "capital-carpet-stage fixed inset-0 z-[60] overflow-hidden bg-[#0c1622]";

  if (phase === "dock") {
    return (
      <div className={shellClass} data-testid="carpet-flight-dock">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 12], fov: 58, near: 0.08, far: 260 }}
          className="absolute inset-0 h-full w-full"
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(homeLook.skyTop, 1)}
        >
          <Suspense fallback={null}>
            <WorldLighting look={homeLook} contactShadows={false} shadowMapSize={512} />
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
            Ride the open horizon — steer with A/D, soar with W, hold Shift to rush.
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
    <div className={shellClass} data-testid="carpet-flight-view">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5.5, START_Z + 2], fov: 68, near: 0.08, far: 280 }}
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(homeLook.skyTop, 1)}
      >
        <Suspense fallback={null}>
          <WorldScene
            world={world}
            look={homeLook}
            targetId={voyageTargetId}
            character={character ?? save.character}
            boostApi={boostApi}
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

      <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
        <button
          type="button"
          className={`rounded-full border-2 px-4 py-2 text-sm font-extrabold shadow-lg transition ${
            boostHeld
              ? "border-amber-200 bg-amber-400 text-[#16283b]"
              : "border-white/35 bg-black/55 text-white hover:bg-black/70"
          }`}
          onPointerDown={(e) => {
            e.preventDefault();
            setBoost(true);
          }}
          onPointerUp={() => setBoost(false)}
          onPointerLeave={() => setBoost(false)}
          onPointerCancel={() => setBoost(false)}
        >
          {boostHeld ? "Rushing…" : "Hold to speed up"}
        </button>
        {voyageTargetId && targetName ? (
          <button
            type="button"
            className="rounded-full border-2 border-[#16283b] bg-[#f4a629] px-4 py-2 text-sm font-extrabold text-[#16283b] shadow-lg"
            onClick={() => {
              setBoostHeld(true);
              boostApi.current?.rushToTarget();
            }}
          >
            Rush to {targetName} →
          </button>
        ) : null}
      </div>

      <div
        id="carpet-flight-hud"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent pb-8 pt-20"
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
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/55">
          A/D turn · W soar · S glide · Shift / hold button to rush · land on an island
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
