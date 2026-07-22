import { useMemo } from "react";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";
import { buildIslandTerrain, islandSeedFromId, type IslandDetail } from "./islandTerrain";
import { NatureProps, WoodenPier } from "./NatureProps";
import { KENNEY_ENABLED } from "./kenneyFlag";

type Props = {
  look: EraLook3D;
  position: [number, number, number];
  scale?: number;
  label?: string;
  selected?: boolean;
  /** Island id / seed for deterministic silhouette. */
  seed?: string;
  detail?: IslandDetail;
  /** Harbor-style pier on the near shore. */
  showPier?: boolean;
};

export function EraIslandMesh({
  look,
  position,
  scale = 1,
  selected,
  seed = "isle",
  detail = "near",
  showPier = false,
}: Props) {
  const wire = look.shading === "wire" || look.shading === "vector";
  const flat = look.shading === "lowpoly" || look.shading === "vector" || look.shading === "harbor";

  const terrain = useMemo(
    () => buildIslandTerrain(islandSeedFromId(seed), look, detail),
    // look.id + palette drive silhouette/colors; avoid rebuilding on new object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, look.id, look.land, look.shore, look.accent, look.shading, detail],
  );

  const landMat = useMemo(() => {
    if (wire) {
      return new THREE.MeshBasicMaterial({
        color: look.land,
        wireframe: true,
        vertexColors: false,
      });
    }
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: look.shading === "glossy" ? 0.28 : look.shading === "cinematic" ? 0.88 : 0.62,
      metalness: look.shading === "neon" ? 0.28 : 0.04,
      flatShading: flat,
      emissive: look.shading === "neon" ? look.accent : "#000000",
      emissiveIntensity: look.shading === "neon" ? 0.18 : 0,
    });
  }, [look, wire, flat]);

  return (
    <group position={position} scale={scale}>
      <mesh
        geometry={terrain.geometry}
        material={landMat}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      />
      {/* Underwater sand shelf */}
      {!wire && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <circleGeometry args={[terrain.radius * 1.15, 32]} />
          <meshStandardMaterial color={look.shore} roughness={0.95} transparent opacity={0.85} />
        </mesh>
      )}
      {detail === "near" && !wire ? (
        <NatureProps props={terrain.props} look={look} useKenney={KENNEY_ENABLED} />
      ) : null}
      {showPier && detail === "near" && !wire ? (
        <WoodenPier position={[0, 0.02, terrain.radius * 0.75]} />
      ) : null}
      {selected && (
        <mesh position={[0, terrain.peakY + 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.78, 28]} />
          <meshBasicMaterial color={look.accent} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export { OceanPlane } from "./OceanWater";
