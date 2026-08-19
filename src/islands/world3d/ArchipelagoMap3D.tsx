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
import { HARBOR_HARD_FAILSAFE_MS } from "./harborLoadFailsafe";
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
import { FlatArchipelagoMap } from "./FlatArchipelagoMap";
import {
  mapLabelOffsetY,
  mapLabelZIndex,
  mapSpineSubtitle,
} from "./mapIslandLabels";

/** Sticky only for the travel map — Harbor plaza fail must not wipe islands. */
export const ARCHIPELAGO_MAP_3D_FAIL_KEY = "capital_archipelago_map3d_fail";

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
  const spineR = (SEED_SPINE_R / MAP_SIDE_RX) * ARCHIPELAGO_MAP_SPACING * PHI * 0.95;
  const sideR = (SEED_SIDE_R / MAP_SIDE_RX) * ARCHIPELAGO_MAP_SPACING * PHI * 0.95;
  const petalR = spineR;
  return (
    <group position={[0, 0.03, 0]} data-sacred="seed-of-life">
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[sideR * 1.02, 64]} />
        <meshBasicMaterial color="#042f2e" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[spineR * 0.94, spineR, 64]} />
        <meshBasicMaterial color="#a7f3d0" transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[sideR * 0.96, sideR, 64]} />
        <meshBasicMaterial color="#99f6e4" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      {SEED_PETAL_ANGLES.map((angle, i) => {
        const cx = Math.cos(angle) * petalR * 0.58;
        const cz = Math.sin(angle) * petalR * 0.58;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.015, cz]}>
            <ringGeometry args={[petalR * 0.9, petalR, 48]} />
            <meshBasicMaterial
              color="#6ee7b7"
              transparent
              opacity={reduced ? 0.12 : 0.2}
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
    // Pull back so the φ dual-ring reads as an archipelago, not a clump.
    camera.position.lerp(new THREE.Vector3(0, 16.5, 18.2), 0.08);
    camera.lookAt(0, 0.35, 0);
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
      position={[position[0], position[1] + 4.15, position[2]]}
      center
      distanceFactor={10}
      style={{ pointerEvents: "none" }}
      zIndexRange={[40, 0]}
    >
      <div
        className="pointer-events-none flex flex-col items-center"
        data-testid="harbor-map-start-cue"
        aria-label="Start at Harbor Haven"
      >
        <div
          className={`text-[2rem] leading-none text-[#ef4444] drop-shadow-[0_2px_0_#7f1d1d] ${
            reduced ? "" : "animate-bounce"
          }`}
          aria-hidden
        >
          ▼
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
      <OceanWater color="#0e7490" shading="harbor" size={110} calm />
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
        title="Harbor Haven"
        subtitle={layout.hub.island.id === currentId ? "Here" : "Start"}
        seed={layout.hub.island.id}
        islandId={layout.hub.island.id}
        position={hubPos}
        scale={1.12}
        current={layout.hub.island.id === currentId}
        selected={layout.hub.island.id === currentId}
        locked={isIslandLocked(layout.hub.island, save.inventory, save)}
        onSelect={() => onSelect(layout.hub.island.id)}
      />
      <StructurePinBadge islandId={layout.hub.island.id} position={hubPos} />
      <HarborStartCue position={hubPos} visible={showHarborCue} />

      {/* Side shores first — spine renders last so nameplates stay on top. */}
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
            subtitle={locked ? era.decade : `${era.decade} · Play`}
            seed={node.island.id}
            islandId={node.island.id}
            position={pos}
            scale={0.68}
            current={node.island.id === currentId}
            locked={locked}
            onSelect={() => onSelect(node.island.id)}
            labelZIndexRange={mapLabelZIndex(node.ring)}
          />
        );
      })}

      {spineOuter.map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const look = getIslandLook3D(node.island.id, theme.animationStyle);
        const locked = isIslandLocked(node.island, save.inventory, save);
        const pos = mapNodeToScene(node);
        const current = node.island.id === currentId;
        return (
          <group key={node.island.id}>
            <DioramaIslandMesh
              look={look}
              title={node.island.name}
              subtitle={mapSpineSubtitle(node.island.id, { locked, current })}
              seed={node.island.id}
              islandId={node.island.id}
              position={pos}
              scale={0.88}
              current={current}
              locked={locked}
              onSelect={() => onSelect(node.island.id)}
              labelOffsetY={mapLabelOffsetY(node)}
              labelZIndexRange={mapLabelZIndex(node.ring)}
            />
            <StructurePinBadge islandId={node.island.id} position={pos} />
          </group>
        );
      })}
    </>
  );
}

/**
 * Fortune Archipelago travel map — Seed of Life composition.
 * Every island named · Harbor start cue · HUD chrome stays off the geometry.
 */
export function ArchipelagoMap3D({ islands, save, currentId, onSelect }: Props) {
  const [hint, setHint] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = prefersReducedMotion();
  const [cueOn, setCueOn] = useState(() => !startCueDismissed());
  const [skipCanvas, setSkipCanvas] = useState(() => {
    try {
      return sessionStorage.getItem(ARCHIPELAGO_MAP_3D_FAIL_KEY) === "1";
    } catch {
      return false;
    }
  });

  const earlyJourney = !hasCompletedCoveChange(save);
  const showHarborCue = cueOn && earlyJourney;

  const readyRef = useRef(ready);
  readyRef.current = ready;
  useEffect(() => {
    if (skipCanvas) return;
    const t = window.setTimeout(() => {
      if (!readyRef.current) {
        try {
          sessionStorage.setItem(ARCHIPELAGO_MAP_3D_FAIL_KEY, "1");
        } catch {
          /* ignore */
        }
        setSkipCanvas(true);
      }
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
        <FlatArchipelagoMap
          islands={islands}
          save={save}
          currentId={currentId}
          onSelect={pick}
          showHarborCue={showHarborCue}
        />
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
              try {
                sessionStorage.removeItem(ARCHIPELAGO_MAP_3D_FAIL_KEY);
              } catch {
                /* ignore */
              }
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
