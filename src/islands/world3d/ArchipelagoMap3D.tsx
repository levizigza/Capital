import { Suspense, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
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
import { DioramaIslandMesh } from "./DioramaIslandMesh";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";

type Props = {
  islands: Parameters<typeof buildArchipelagoLayout>[0];
  save: IslandSaveV1;
  currentId: string;
  onSelect: (islandId: string) => void;
};

const LOOK = getEraLook3D("capital-default");
const SPACING = 5.8;

function mapToScene(node: ArchipelagoNode): [number, number, number] {
  // Convert % map coords to a gentle isometric grid
  const x = ((node.mapX - 50) / 38) * SPACING * 1.35;
  const z = ((node.mapY - 54) / 34) * SPACING * 1.15;
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
    const b = new THREE.Vector3((from[0] + to[0]) / 2, 0.55, (from[2] + to[2]) / 2 - 0.8);
    const curve = new THREE.CatmullRomCurve3([a, b, c]);
    return new THREE.TubeGeometry(curve, 24, 0.045, 6, false);
  }, [from, to]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#a7f3d0" transparent opacity={0.45} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function MapCamera() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(0, 13.5, 15.5), 0.08);
    camera.lookAt(0, 0.2, 0);
  });
  return null;
}

function MapScene({ islands, save, currentId, onSelect }: Props) {
  const layout = useMemo(() => buildArchipelagoLayout(islands), [islands]);
  const hubPos = mapToScene(layout.hub);

  return (
    <>
      <WorldLighting look={{ ...LOOK, fogNear: 25, fogFar: 55 }} contactShadows={false} shadowMapSize={1024} />
      <OceanWater color="#0e7490" shading="harbor" size={120} calm />
      <MapCamera />

      <Text
        position={[0, 8.2, -2]}
        fontSize={0.55}
        color="#fef3c7"
        anchorX="center"
        outlineWidth={0.03}
        outlineColor="#0c1622"
      >
        Fortune Archipelago · 3D Era Map
      </Text>

      {/* Route ribbons hub → outer */}
      {layout.outer.map((node) => {
        const to = mapToScene(node);
        const from: [number, number, number] = [hubPos[0], 0.2, hubPos[2]];
        const dest: [number, number, number] = [to[0], 0.2, to[2]];
        return <RouteRibbon key={`route-${node.island.id}`} from={from} to={dest} />;
      })}

      {/* Hub diorama */}
      <DioramaIslandMesh
        look={LOOK}
        title={layout.hub.island.name}
        subtitle="Harbor Haven"
        seed={layout.hub.island.id}
        position={hubPos}
        scale={1.15}
        current={layout.hub.island.id === currentId}
        selected={layout.hub.island.id === currentId}
        locked={isIslandLocked(layout.hub.island, save.inventory, save)}
        onSelect={() => onSelect(layout.hub.island.id)}
      />

      {layout.outer.map((node) => {
        const theme = getIslandTheme(node.island.id, node.island.themeId);
        const era = getAnimationStyle(theme.animationStyle);
        const look = getEraLook3D(theme.animationStyle);
        const locked = isIslandLocked(node.island, save.inventory, save);
        const pos = mapToScene(node);
        return (
          <DioramaIslandMesh
            key={node.island.id}
            look={look}
            title={node.island.name}
            subtitle={era.decade}
            seed={node.island.id}
            position={pos}
            scale={1}
            current={node.island.id === currentId}
            locked={locked}
            onSelect={() => onSelect(node.island.id)}
          />
        );
      })}

      {/* Tiny plane accent (toy diorama vibe) */}
      <mesh position={[6.5, 3.2, -2]} rotation={[0, -0.6, 0.15]}>
        <boxGeometry args={[0.55, 0.12, 0.18]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[6.5, 3.2, -2]} rotation={[0, -0.6, 0.15]}>
        <boxGeometry args={[0.12, 0.04, 0.55]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
    </>
  );
}

/**
 * Full-screen 3D isometric archipelago map — floating diorama islands.
 */
export function ArchipelagoMap3D({ islands, save, currentId, onSelect }: Props) {
  const [hint, setHint] = useState<string | null>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center bg-[#0c4a6e] text-sm font-bold text-white/70">
        Loading 3D archipelago map…
      </div>
      <Canvas
        shadows
        dpr={reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 14, 16], fov: 42, near: 0.1, far: 200 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor("#0c4a6e", 1)}
      >
        <Suspense fallback={null}>
          <MapScene
            islands={islands}
            save={save}
            currentId={currentId}
            onSelect={(id) => {
              setHint(id);
              onSelect(id);
            }}
          />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/50 to-transparent px-4 pb-12 pt-3 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-100/90">
          Fortune Archipelago
        </div>
        <h1 className="font-[Fraunces,Georgia,serif] text-2xl font-black text-white drop-shadow sm:text-3xl">
          Era Isles · 3D Map
        </h1>
        <p className="mx-auto mt-1 max-w-md text-xs font-medium text-white/85">
          Tap a floating island diorama to board your money carpet
        </p>
      </div>

      {hint ? (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white">
          Charting course…
        </div>
      ) : null}
    </div>
  );
}
