import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";

type Props = {
  color: string;
  shading: EraLook3D["shading"];
  size?: number;
  /** Skip vertex animation (a11y / perf). */
  calm?: boolean;
};

/**
 * Animated stylized ocean — subdivided plane with gentle wave vertex motion.
 * Wire/neon eras keep their graphic language.
 */
export function OceanWater({ color, shading, size = 800, calm = false }: Props) {
  const mesh = useRef<THREE.Mesh>(null);
  const wire = shading === "wire" || shading === "vector";
  // Keep segments modest — high density + per-frame morph can blank weak GPUs.
  const segs = wire ? 16 : calm ? 32 : 48;

  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, segs, segs);
    g.rotateX(-Math.PI / 2);
    // Store base positions for wave animation
    const pos = g.attributes.position;
    const base = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      base[i * 3] = pos.getX(i);
      base[i * 3 + 1] = pos.getY(i);
      base[i * 3 + 2] = pos.getZ(i);
    }
    g.userData.base = base;
    return g;
  }, [size, segs]);

  useFrame(({ clock }) => {
    if (calm || wire || !mesh.current) return;
    const g = mesh.current.geometry as THREE.PlaneGeometry;
    const pos = g.attributes.position as THREE.BufferAttribute;
    const base = g.userData.base as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3]!;
      const z = base[i * 3 + 2]!;
      const y =
        Math.sin(x * 0.08 + t * 1.1) * 0.18 +
        Math.cos(z * 0.06 + t * 0.85) * 0.14 +
        Math.sin((x + z) * 0.04 + t * 0.5) * 0.1;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={mesh} geometry={geom} receiveShadow position={[0, 0, 0]}>
      <meshStandardMaterial
        color={color}
        roughness={shading === "neon" ? 0.18 : shading === "glossy" ? 0.22 : 0.32}
        metalness={shading === "neon" ? 0.55 : 0.22}
        wireframe={wire}
        flatShading={shading === "lowpoly"}
        emissive={shading === "neon" ? color : "#000000"}
        emissiveIntensity={shading === "neon" ? 0.15 : 0}
      />
    </mesh>
  );
}

/** Back-compat alias used by older imports. */
export function OceanPlane({
  color,
  shading,
}: {
  color: string;
  shading: EraLook3D["shading"];
}) {
  return <OceanWater color={color} shading={shading} />;
}
