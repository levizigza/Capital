import { useMemo } from "react";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";
import { buildIslandTerrain, islandSeedFromId, type IslandDetail } from "./islandTerrain";
import { getIslandBiome } from "./islandBiomes";
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
  const biome = useMemo(() => getIslandBiome(seed), [seed]);

  const terrain = useMemo(
    () => buildIslandTerrain(islandSeedFromId(seed), look, detail, seed === "harbor_haven" ? null : biome),
    // look.id + palette drive silhouette/colors; avoid rebuilding on new object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, look.id, look.land, look.shore, look.accent, look.shading, detail, biome.id],
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

  const rockColor = biome.rock ?? (look.shading === "neon" ? look.accent : "#6b6560");
  const r = terrain.radius;

  // Dirt path toward the pier (near islands)
  const pathSegments = useMemo(() => {
    if (detail !== "near" || wire) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      return {
        z: r * 0.15 + t * r * 0.58,
        w: 0.32 + (1 - t) * 0.18,
      };
    });
  }, [detail, wire, r]);

  return (
    <group position={position} scale={scale}>
      <mesh
        geometry={terrain.geometry}
        material={landMat}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      />

      {/* Cliff skirt — gives the island real thickness from flight angles */}
      {!wire && (
        <>
          <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[r * 0.88, r * 1.02, 1.05, detail === "near" ? 36 : 20]} />
            <meshStandardMaterial color={rockColor} roughness={0.95} flatShading={flat} />
          </mesh>
          <mesh position={[0, -1.2, 0]} castShadow>
            <cylinderGeometry args={[r * 1.02, r * 1.18, 0.4, detail === "near" ? 36 : 20]} />
            <meshStandardMaterial color="#4b5563" roughness={0.98} flatShading={flat} />
          </mesh>
          {/* Irregular rock buttresses around the rim */}
          {detail === "near" &&
            Array.from({ length: 10 }).map((_, i) => {
              const ang = (i / 10) * Math.PI * 2 + 0.2;
              const br = r * 0.95;
              return (
                <mesh
                  key={`buttress-${i}`}
                  castShadow
                  position={[Math.cos(ang) * br, -0.25, Math.sin(ang) * br]}
                  rotation={[0.3, -ang, 0.15]}
                  scale={[0.55 + (i % 3) * 0.15, 0.7 + (i % 2) * 0.25, 0.5]}
                >
                  <dodecahedronGeometry args={[0.45, 0]} />
                  <meshStandardMaterial color="#57534e" roughness={0.95} flatShading />
                </mesh>
              );
            })}
        </>
      )}

      {/* Underwater sand shelf + foam ring */}
      {!wire && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
            <circleGeometry args={[r * 1.28, 40]} />
            <meshStandardMaterial color={look.shore} roughness={0.95} transparent opacity={0.9} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
            <ringGeometry args={[r * 0.98, r * 1.12, 40]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={1}
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
            <ringGeometry args={[r * 1.15, r * 1.35, 40]} />
            <meshStandardMaterial
              color="#0369a1"
              roughness={0.6}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Path down to the pier */}
      {pathSegments.map((seg, i) => (
        <mesh
          key={`path-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.04 + i * 0.01, seg.z]}
          receiveShadow
        >
          <planeGeometry args={[seg.w, r * 0.12]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.95} />
        </mesh>
      ))}

      {detail === "near" && !wire ? (
        <NatureProps props={terrain.props} look={look} useKenney={KENNEY_ENABLED} />
      ) : null}
      {showPier && detail === "near" && !wire ? (
        <WoodenPier position={[0, 0.02, terrain.radius * 0.78]} />
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
