import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import type { IslandSaveV1 } from "../types";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle } from "../animationStyles";
import {
  buildArchipelagoLayout,
  isIslandLocked,
  type ArchipelagoNode,
} from "../worldMapLayout";
import { getEraLook3D } from "./eraLooks";
import { getIslandLook3D } from "./islandBiomes";
import { genreHudLine } from "../genreWorlds";
import { DioramaIslandMesh } from "./DioramaIslandMesh";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { moneyStructureForIsland } from "../moneyStructures";
import { HARBOR_3D_FAIL_KEY, HARBOR_HARD_FAILSAFE_MS } from "./harborLoadFailsafe";
import { hasCompletedCoveChange } from "../chapterLoop";
import { HARBOR_HAVEN_ID } from "../islandIds";
import { prefersReducedMotion } from "../a11yMotion";

type Props = {
  islands: Parameters<typeof buildArchipelagoLayout>[0];
  save: IslandSaveV1;
  currentId: string;
  onSelect: (islandId: string) => void;
};

const LOOK = getEraLook3D("capital-default");
/** Scene spacing — tight so dioramas nest (sacred-geometry overlap). */
export const ARCHIPELAGO_MAP_SPACING = 3.85;

const START_CUE_KEY = "capital_map_harbor_start_cue_v1";

function startCueDismissed(): boolean {
  try {
    return sessionStorage.getItem(START_CUE_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissStartCue() {
  try {
    sessionStorage.setItem(START_CUE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Tiny Money Structure silhouette chip above each diorama pin. */
function StructurePinBadge({
  islandId,
  position,
}: {
  islandId: string;
  position: [number, number, number];
}) {
  const structure = moneyStructureForIsland(islandId);
  if (!structure) return null;
  const theme = structure.theme;
  const y = position[1] + 2.35;
  if (theme === "jar") {
    return (
      <mesh position={[position[0], y, position[2]]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.45, 10]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.35} transparent opacity={0.9} />
      </mesh>
    );
  }
  if (theme === "tower") {
    return (
      <mesh position={[position[0], y, position[2]]} castShadow>
        <boxGeometry args={[0.28, 0.55, 0.28]} />
        <meshStandardMaterial color="#cbd5e1" emissive="#64748b" emissiveIntensity={0.25} />
      </mesh>
    );
  }
  if (theme === "keep") {
    return (
      <mesh position={[position[0], y, position[2]]} castShadow>
        <coneGeometry args={[0.28, 0.5, 5]} />
        <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={0.22} flatShading />
      </mesh>
    );
  }
  // bank / default
  return (
    <mesh position={[position[0], y, position[2]]} castShadow>
      <boxGeometry args={[0.4, 0.35, 0.3]} />
      <meshStandardMaterial color="#94a3b8" emissive="#b45309" emissiveIntensity={0.2} />
    </mesh>
  );
}

export function mapNodeToScene(node: ArchipelagoNode): [number, number, number] {
  // Normalize against outer-ring radii so dual-ring layout keeps visual rhythm.
  const x = ((node.mapX - 50) / 24) * ARCHIPELAGO_MAP_SPACING * 1.2;
  const z = ((node.mapY - 54) / 21) * ARCHIPELAGO_MAP_SPACING * 1.05;
  return [x, 0, z];
}

function RouteRibbon({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const geom = useMemo(() => {
    const a = new THREE.Vector3(from[0], 0.25, from[2]);
    const c = new THREE.Vector3(to[0], 0.25, to[2]);
    const b = new THREE.Vector3((from[0] + to[0]) / 2, 0.55, (from[2] + to[2]) / 2 - 0.45);
    const curve = new THREE.CatmullRomCurve3([a, b, c]);
    return new THREE.TubeGeometry(curve, 24, 0.04, 6, false);
  }, [from, to]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#a7f3d0" transparent opacity={0.4} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function MapCamera() {
  const { camera } = useThree();
  useFrame(() => {
    // Closer framing for nested sacred-geometry ring
    camera.position.lerp(new THREE.Vector3(0, 11.5, 12.8), 0.08);
    camera.lookAt(0, 0.35, 0);
  });
  return null;
}

function MapFallbackPlate() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <circleGeometry args={[14, 48]} />
      <meshStandardMaterial color="#0e7490" roughness={0.95} />
    </mesh>
  );
}

/** First-start cue — red arrow + Click here on Harbor Haven. */
function HarborStartCue({
  position,
  visible,
}: {
  position: [number, number, number];
  visible: boolean;
}) {
  if (!visible) return null;
  const reduced = prefersReducedMotion();
  return (
    <Html
      position={[position[0], position[1] + 4.15, position[2]]}
      center
      distanceFactor={10}
      style={{ pointerEvents: "none" }}
      zIndexRange={[40, 0]}
    >
      <div
        className="pointer-events-none flex flex-col items-center gap-0.5"
        data-testid="harbor-map-start-cue"
      >
        <div
          className={`text-[2rem] leading-none text-[#ef4444] drop-shadow-[0_2px_0_#7f1d1d] ${
            reduced ? "" : "animate-bounce"
          }`}
          aria-hidden
        >
          ▼
        </div>
        <div className="rounded-xl border-2 border-[#7f1d1d] bg-[#dc2626] px-3 py-1.5 text-center shadow-[3px_3px_0_#7f1d1d]">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/90">
            Click here
          </p>
          <p className="text-xs font-black text-white">Harbor Haven</p>
          <p className="text-[9px] font-semibold text-white/85">Start your journey</p>
        </div>
      </div>
    </Html>
  );
}

function MapScene({
  islands,
  save,
  currentId,
  onSelect,
  showHarborCue,
}: Props & { showHarborCue: boolean }) {
  const layout = useMemo(() => buildArchipelagoLayout(islands), [islands]);
  const hubPos = mapNodeToScene(layout.hub);

  return (
    <>
      <WorldLighting
        look={{ ...LOOK, fogNear: 14, fogFar: 70, skyMode: "day" }}
        contactShadows={false}
        shadowMapSize={512}
        compactScene
      />
      <OceanWater color="#0e7490" shading="harbor" size={90} calm />
      <MapCamera />

      {layout.outer.map((node) => {
        const to = mapNodeToScene(node);
        const from: [number, number, number] = [hubPos[0], 0.2, hubPos[2]];
        const dest: [number, number, number] = [to[0], 0.2, to[2]];
        return <RouteRibbon key={`route-${node.island.id}`} from={from} to={dest} />;
      })}

      <DioramaIslandMesh
        look={LOOK}
        title={layout.hub.island.name}
        subtitle="Harbor Haven · start"
        seed={layout.hub.island.id}
        islandId={layout.hub.island.id}
        position={hubPos}
        scale={1.28}
        current={layout.hub.island.id === currentId}
        selected={layout.hub.island.id === currentId}
        locked={isIslandLocked(layout.hub.island, save.inventory, save)}
        onSelect={() => onSelect(layout.hub.island.id)}
      />
      <StructurePinBadge islandId={layout.hub.island.id} position={hubPos} />
      <HarborStartCue position={hubPos} visible={showHarborCue} />

      {layout.outer.map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const era = getAnimationStyle(theme.animationStyle);
        const look = getIslandLook3D(node.island.id, theme.animationStyle);
        const locked = isIslandLocked(node.island, save.inventory, save);
        const pos = mapNodeToScene(node);
        const genreLine = genreHudLine(node.island.id);
        const side = node.ring === "side";
        const subtitle = side
          ? `Side shore · ${genreLine ?? era.decade}`
          : (genreLine ?? era.decade);
        return (
          <group key={node.island.id}>
            <DioramaIslandMesh
              look={look}
              title={node.island.name}
              subtitle={subtitle}
              seed={node.island.id}
              islandId={node.island.id}
              position={pos}
              scale={side ? 0.95 : 1.08}
              current={node.island.id === currentId}
              locked={locked}
              onSelect={() => onSelect(node.island.id)}
            />
            {!side ? <StructurePinBadge islandId={node.island.id} position={pos} /> : null}
          </group>
        );
      })}
    </>
  );
}

/**
 * Full-screen 3D isometric archipelago map — floating diorama islands.
 * Island names use HTML billboards (no font Suspense blanking WebGL).
 */
export function ArchipelagoMap3D({ islands, save, currentId, onSelect }: Props) {
  const [hint, setHint] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [cueOn, setCueOn] = useState(() => !startCueDismissed());
  const [skipCanvas, setSkipCanvas] = useState(() => {
    try {
      return sessionStorage.getItem(HARBOR_3D_FAIL_KEY) === "1";
    } catch {
      return false;
    }
  });
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const earlyJourney = !hasCompletedCoveChange(save);
  const showHarborCue = cueOn && earlyJourney;

  const readyRef = useRef(ready);
  readyRef.current = ready;
  useEffect(() => {
    if (skipCanvas) return;
    const t = window.setTimeout(() => {
      if (!readyRef.current) setSkipCanvas(true);
    }, HARBOR_HARD_FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [skipCanvas]);

  const pick = (id: string) => {
    const node = islands.find((i) => i.id === id);
    if (node && isIslandLocked(node, save.inventory, save)) return;
    if (id === HARBOR_HAVEN_ID || id === currentId) {
      dismissStartCue();
      setCueOn(false);
    }
    // Current island is a valid pick — TravelMapView returns to plaza.
    if (id !== currentId) setHint(id);
    onSelect(id);
  };

  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="archipelago-map-3d">
      {skipCanvas ? (
        <div
          className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-[#0c4a6e] px-4 text-center"
          data-testid="archipelago-map-flat"
        >
          <p className="text-sm font-bold text-white/85">Fortune Archipelago</p>
          <p className="max-w-sm text-xs font-medium text-white/65">
            3D map is resting — use the island chips below to board the Money Carpet.
          </p>
          {showHarborCue ? (
            <p
              className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white"
              data-testid="harbor-map-start-cue-flat"
            >
              Click Harbor Haven below · start your journey
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {!ready ? (
            <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#0c4a6e] text-sm font-bold text-white/70">
              Loading 3D archipelago map…
            </div>
          ) : null}
          <Canvas
            shadows
            dpr={reduced ? [1, 1] : [1, 1.25]}
            camera={{ position: [0, 11.5, 12.8], fov: 42, near: 0.1, far: 200 }}
            className="absolute inset-0 z-[2]"
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.setClearColor("#0c4a6e", 1);
              setReady(true);
            }}
          >
            <Suspense fallback={<MapFallbackPlate />}>
              <MapScene
                islands={islands}
                save={save}
                currentId={currentId}
                onSelect={pick}
                showHarborCue={showHarborCue}
              />
            </Suspense>
          </Canvas>
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/35 to-transparent px-4 pb-8 pt-2 text-center">
        <p className="text-[11px] font-semibold text-white/80">
          {skipCanvas ? "Tap an island chip below" : "Tap a named island to fly"}
        </p>
      </div>

      {hint ? (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold text-white">
          Charting course…
        </div>
      ) : null}
    </div>
  );
}
