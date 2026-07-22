import { useMemo } from "react";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";

type Props = {
  look: EraLook3D;
  position: [number, number, number];
  scale?: number;
  label?: string;
  selected?: boolean;
};

export function EraIslandMesh({ look, position, scale = 1, selected }: Props) {
  const wire = look.shading === "wire" || look.shading === "vector";
  const flat = look.shading === "lowpoly" || look.shading === "vector";

  const landMat = useMemo(() => {
    if (wire) {
      return new THREE.MeshBasicMaterial({
        color: look.land,
        wireframe: true,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: look.land,
      roughness: look.shading === "glossy" ? 0.25 : look.shading === "cinematic" ? 0.85 : 0.55,
      metalness: look.shading === "neon" ? 0.35 : 0.05,
      flatShading: flat,
      emissive: look.shading === "neon" || look.shading === "wire" ? look.accent : "#000000",
      emissiveIntensity: look.shading === "neon" ? 0.25 : look.shading === "wire" ? 0.15 : 0,
    });
  }, [look, wire, flat]);

  return (
    <group position={position} scale={scale}>
      {/* volcanic / hill base */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]} material={landMat}>
        <coneGeometry args={[2.2, 1.8, look.shading === "lowpoly" ? 5 : 10]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[2.6, 3.1, 0.4, look.shading === "lowpoly" ? 6 : 12]} />
        <meshStandardMaterial
          color={look.shore}
          roughness={0.8}
          flatShading={flat}
          wireframe={wire}
        />
      </mesh>
      {/* palm-ish markers */}
      {!wire && (
        <>
          <mesh position={[-1.1, 1.2, 0.4]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 1.2, 6]} />
            <meshStandardMaterial color="#6b4a2a" />
          </mesh>
          <mesh position={[-1.1, 1.9, 0.4]} castShadow>
            <sphereGeometry args={[0.35, 6, 6]} />
            <meshStandardMaterial color={look.land} flatShading />
          </mesh>
        </>
      )}
      {selected && (
        <mesh position={[0, 3.2, 0]}>
          <ringGeometry args={[0.5, 0.7, 24]} />
          <meshBasicMaterial color={look.accent} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function OceanPlane({ color, shading }: { color: string; shading: EraLook3D["shading"] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[800, 800, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={shading === "neon" ? 0.2 : 0.35}
        metalness={shading === "neon" ? 0.5 : 0.15}
        wireframe={shading === "wire" || shading === "vector"}
      />
    </mesh>
  );
}
