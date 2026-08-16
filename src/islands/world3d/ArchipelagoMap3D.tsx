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
  MAP_HUB,
  MAP_SIDE_RX,
  MAP_SIDE_RY,
  type ArchipelagoNode,
} from "../worldMapLayout";
import { getEraLook3D } from "./eraLooks";
import { getIslandLook3D } from "./islandBiomes";
import { DioramaIslandMesh } from "./DioramaIslandMesh";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { moneyStructureForIsland } from "../moneyStructures";
import { HARBOR_3D_FAIL_KEY, HARBOR_HARD_FAILSAFE_MS } from "./harborLoadFailsafe";
import { hasCompletedCoveChange } from "../chapterLoop";
import { HARBOR_HAVEN_ID } from "../islandIds";
import { prefersReducedMotion } from "../a11yMotion";
import {
  PHI,
  SEED_PETAL_ANGLES,
  SEED_SCENE_SPACING,
  SEED_SIDE_R,
  SEED_SPINE_R,
} from "../sacredGeometry";

type Props = {
  islands: Parameters<typeof buildArchipelagoLayout>[0];
  save: IslandSaveV1;
  currentId: string;
  onSelect: (islandId: string) => void;
};

const LOOK = getEraLook3D("capital-default");
export const ARCHIPELAGO_MAP_SPACING = SEED_SCENE_SPACING;

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
  const y = position[1] + 2.15;
  if (theme === "jar") {
    return (
      <mesh position={[position[0], y, position[2]]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.36, 10]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.3} transparent opacity={0.85} />
      </mesh>
    );
  }
  if (theme === "tower") {
    return (
      <mesh position={[position[0], y, position[2]]} castShadow>
        <boxGeometry args={[0.22, 0.45, 0.22]} />
        <meshStandardMaterial color="#cbd5e1" emissive="#64748b" emissiveIntensity={0.2} />
      </mesh>
    );
  }
  if (theme === "keep") {
    return (
      <mesh position={[position[0], y, position[2]]} castShadow>
        <coneGeometry args={[0.22, 0.4, 5]} />
        <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={0.18} flatShading />
      </mesh>
    );
  }
  return (
    <mesh position={[position[0], y, position[2]]} castShadow>
      <boxGeometry args={[0.32, 0.28, 0.24]} />
      <meshStandardMaterial color="#94a3b8" emissive="#b45309" emissiveIntensity={0.18} />
    </mesh>
  );
}

export function mapNodeToScene(node: ArchipelagoNode): [number, number, number] {
  const x = ((node.mapX - MAP_HUB.x) / MAP_SIDE_RX) * ARCHIPELAGO_MAP_SPACING * PHI;
  const z = ((node.mapY - MAP_HUB.y) / MAP_SIDE_RY) * ARCHIPELAGO_MAP_SPACING;
  return [x, 0, z];
}

/** Quiet Seed of Life rings under the archipelago — geometry, not HUD chrome. */
function SeedOfLifeGuides() {
  const reduced = prefersReducedMotion();
  const spineR = (SEED_SPINE_R / MAP_SIDE_RX) * ARCHIPELAGO_MAP_SPACING * PHI * 0.92;
  const sideR = (SEED_SIDE_R / MAP_SIDE_RX) * ARCHIPELAGO_MAP_SPACING * PHI * 0.92;
  const petalR = spineR;
  return (
    <group position={[0, 0.02, 0]} data-sacred="seed-of-life">
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[spineR * 0.96, spineR, 64]} />
        <meshBasicMaterial color="#a7f3d0" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[sideR * 0.97, sideR, 64]} />
        <meshBasicMaterial color="#99f6e4" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
      {SEED_PETAL_ANGLES.map((angle, i) => {
        const cx = Math.cos(angle) * petalR * 0.55;
        const cz = Math.sin(angle) * petalR * 0.55;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.01, cz]}>
            <ringGeometry args={[petalR * 0.92, petalR, 48]} />
            <meshBasicMaterial
              color="#6ee7b7"
              transparent
              opacity={reduced ? 0.08 : 0.11}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function RouteRibbon({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const geom = useMemo(() => {
    const a = new THREE.Vector3(from[0], 0.22, from[2]);
    const c = new THREE.Vector3(to[0], 0.22, to[2]);
    const b = new THREE.Vector3((from[0] + to[0]) / 2, 0.4, (from[2] + to[2]) / 2 - 0.25);
    const curve = new THREE.CatmullRomCurve3([a, b, c]);
    return new THREE.TubeGeometry(curve, 20, 0.028, 5, false);
  }, [from, to]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#6ee7b7" transparent opacity={0.28} roughness={0.45} metalness={0.08} />
    </mesh>
  );
}

function MapCamera() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(0, 10.8, 11.6), 0.08);
    camera.lookAt(0, 0.4, 0);
  });
  return null;
}

function MapFallbackPlate() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <circleGeometry args={[12, 48]} />
      <meshStandardMaterial color="#0e7490" roughness={0.95} />
    </mesh>
  );
}

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
      position={[position[0], position[1] + 3.6, position[2]]}
      center
      distanceFactor={11}
      style={{ pointerEvents: "none" }}
      zIndexRange={[40, 0]}
    >
      <div
        className="pointer-events-none flex flex-col items-center gap-0.5"
        data-testid="harbor-map-start-cue"
      >
        <div
          className={`text-[1.65rem] leading-none text-[#ef4444] drop-shadow-[0_2px_0_#7f1d1d] ${
            reduced ? "" : "animate-bounce"
          }`}
          aria-hidden
        >
          ▼
        </div>
        <div className="rounded-full border border-[#7f1d1d]/80 bg-[#dc2626]/95 px-3 py-1 text-center shadow-md">
          <p className="text-[10px] font-black tracking-wide text-white">Click here · start</p>
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
  const spineOuter = layout.outer.filter((n) => n.ring === "spine");
  const sideOuter = layout.outer.filter((n) => n.ring === "side");

  return (
    <>
      <WorldLighting
        look={{ ...LOOK, fogNear: 12, fogFar: 55, skyMode: "day" }}
        contactShadows={false}
        shadowMapSize={512}
        compactScene
      />
      <OceanWater color="#0e7490" shading="harbor" size={72} calm />
      <SeedOfLifeGuides />
      <MapCamera />

      {/* Spine routes only — side shores stay quiet until earned */}
      {spineOuter.map((node) => {
        const to = mapNodeToScene(node);
        return (
          <RouteRibbon
            key={`route-${node.island.id}`}
            from={[hubPos[0], 0.2, hubPos[2]]}
            to={[to[0], 0.2, to[2]]}
          />
        );
      })}

      <DioramaIslandMesh
        look={LOOK}
        title={layout.hub.island.name}
        subtitle={layout.hub.island.id === currentId ? "You are here" : "Start"}
        seed={layout.hub.island.id}
        islandId={layout.hub.island.id}
        position={hubPos}
        scale={1.32}
        current={layout.hub.island.id === currentId}
        selected={layout.hub.island.id === currentId}
        locked={isIslandLocked(layout.hub.island, save.inventory, save)}
        onSelect={() => onSelect(layout.hub.island.id)}
      />
      <StructurePinBadge islandId={layout.hub.island.id} position={hubPos} />
      <HarborStartCue position={hubPos} visible={showHarborCue} />

      {spineOuter.map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const look = getIslandLook3D(node.island.id, theme.animationStyle);
        const locked = isIslandLocked(node.island, save.inventory, save);
        const pos = mapNodeToScene(node);
        return (
          <group key={node.island.id}>
            <DioramaIslandMesh
              look={look}
              title={node.island.name}
              subtitle={locked ? "Locked" : undefined}
              seed={node.island.id}
              islandId={node.island.id}
              position={pos}
              scale={1.1}
              current={node.island.id === currentId}
              locked={locked}
              onSelect={() => onSelect(node.island.id)}
            />
            <StructurePinBadge islandId={node.island.id} position={pos} />
          </group>
        );
      })}

      {/* Side shores: dioramas only — no nameplates (declutter). Unlock via strip later. */}
      {sideOuter.map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const era = getAnimationStyle(theme.animationStyle);
        const look = getIslandLook3D(node.island.id, theme.animationStyle);
        const locked = isIslandLocked(node.island, save.inventory, save);
        const pos = mapNodeToScene(node);
        return (
          <DioramaIslandMesh
            key={node.island.id}
            look={look}
            title={node.island.name}
            subtitle={era.decade}
            seed={node.island.id}
            islandId={node.island.id}
            position={pos}
            scale={0.82}
            current={node.island.id === currentId}
            locked={locked}
            hideLabels
            onSelect={() => onSelect(node.island.id)}
          />
        );
      })}
    </>
  );
}

/**
 * Fortune Archipelago travel map — Seed of Life composition.
 * Spine named · side shores quiet · HUD chrome stays off the geometry.
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
    if (id !== currentId) setHint(id);
    onSelect(id);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      data-testid="archipelago-map-3d"
      data-sacred="seed-of-life"
    >
      {skipCanvas ? (
        <div
          className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-[#0c4a6e] px-4 text-center"
          data-testid="archipelago-map-flat"
        >
          <p className="text-sm font-bold text-white/85">Fortune Archipelago</p>
          <p className="max-w-sm text-xs font-medium text-white/65">
            Use the spine chips below to board the Money Carpet.
          </p>
          {showHarborCue ? (
            <p
              className="mt-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white"
              data-testid="harbor-map-start-cue-flat"
            >
              Click Harbor Haven · start
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {!ready ? (
            <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#0c4a6e] text-sm font-bold text-white/70">
              Unfolding the Seed…
            </div>
          ) : null}
          <Canvas
            shadows
            dpr={reduced ? [1, 1] : [1, 1.25]}
            camera={{ position: [0, 10.8, 11.6], fov: 40, near: 0.1, far: 160 }}
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

      {hint ? (
        <div className="pointer-events-none absolute bottom-[22%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white">
          Charting course…
        </div>
      ) : null}
    </div>
  );
}
