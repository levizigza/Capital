/**
 * Stylized nature props — procedural low-poly (KayKit / Quaternius lane)
 * with optional CC0 Kenney OBJ overrides under public/assets/3d/kenney.
 */

import { useMemo, Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";
import type { PropInstance } from "./islandTerrain";

const KENNEY_DIR = "/assets/3d/kenney/";

function ProceduralPalm({ look, scale }: { look: EraLook3D; scale: number }) {
  const trunk = "#6b4a2a";
  const leaf = look.land;
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.11, 1.4, 6]} />
        <meshStandardMaterial color={trunk} roughness={0.85} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 0.35,
            1.45,
            Math.sin((i / 5) * Math.PI * 2) * 0.35,
          ]}
          rotation={[0.55, (i / 5) * Math.PI * 2, 0]}
        >
          <coneGeometry args={[0.28, 0.7, 5]} />
          <meshStandardMaterial color={leaf} roughness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function ProceduralTree({ look, scale }: { look: EraLook3D; scale: number }) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.9, 6]} />
        <meshStandardMaterial color="#5c4030" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.15, 0]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={look.land} roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[0.25, 1.45, -0.1]}>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={look.land} roughness={0.75} flatShading />
      </mesh>
    </group>
  );
}

function ProceduralRock({ look, scale }: { look: EraLook3D; scale: number }) {
  const rock = look.shading === "neon" ? look.accent : "#78716c";
  return (
    <mesh castShadow scale={scale} position={[0, 0.15 * scale, 0]}>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial
        color={rock}
        roughness={0.92}
        flatShading
        metalness={look.shading === "neon" ? 0.3 : 0}
      />
    </mesh>
  );
}

function ProceduralBush({ look, scale }: { look: EraLook3D; scale: number }) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.32, 6, 5]} />
        <meshStandardMaterial color={look.land} roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow position={[0.18, 0.18, 0.1]}>
        <sphereGeometry args={[0.22, 6, 5]} />
        <meshStandardMaterial color={look.land} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

function ProceduralGrass({ look, scale }: { look: EraLook3D; scale: number }) {
  return (
    <group scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.cos(i) * 0.08, 0.18, Math.sin(i) * 0.08]}
          rotation={[0.15, i, 0.05]}
        >
          <coneGeometry args={[0.04, 0.36, 3]} />
          <meshStandardMaterial color={look.land} roughness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function KenneyObj({
  name,
  scale,
}: {
  name: "tree" | "rock";
  scale: number;
}) {
  const materials = useLoader(MTLLoader, `${KENNEY_DIR}${name}.mtl`, (loader) => {
    loader.setResourcePath(KENNEY_DIR);
    loader.setPath(KENNEY_DIR);
  });
  materials.preload();
  const obj = useLoader(OBJLoader, `${KENNEY_DIR}${name}.obj`, (loader) => {
    loader.setMaterials(materials);
  });
  const clone = useMemo(() => {
    const c = obj.clone(true);
    c.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material;
        const applyFlat = (m: THREE.Material) => {
          if ("flatShading" in m) {
            (m as THREE.MeshStandardMaterial).flatShading = true;
            m.needsUpdate = true;
          }
        };
        if (Array.isArray(mat)) mat.forEach(applyFlat);
        else if (mat) applyFlat(mat);
      }
    });
    return c;
  }, [obj]);
  return <primitive object={clone} scale={scale * (name === "tree" ? 0.85 : 0.7)} />;
}

function PropMesh({
  prop,
  look,
  preferKenney,
}: {
  prop: PropInstance;
  look: EraLook3D;
  preferKenney: boolean;
}) {
  const content = (() => {
    if (preferKenney && (prop.kind === "tree" || prop.kind === "palm")) {
      return (
        <Suspense fallback={<ProceduralPalm look={look} scale={1} />}>
          <KenneyObj name="tree" scale={1} />
        </Suspense>
      );
    }
    if (preferKenney && prop.kind === "rock") {
      return (
        <Suspense fallback={<ProceduralRock look={look} scale={1} />}>
          <KenneyObj name="rock" scale={1} />
        </Suspense>
      );
    }
    switch (prop.kind) {
      case "palm":
        return <ProceduralPalm look={look} scale={1} />;
      case "tree":
        return <ProceduralTree look={look} scale={1} />;
      case "rock":
        return <ProceduralRock look={look} scale={1} />;
      case "bush":
        return <ProceduralBush look={look} scale={1} />;
      default:
        return <ProceduralGrass look={look} scale={1} />;
    }
  })();

  return (
    <group position={prop.position} rotation={[0, prop.rotationY, 0]} scale={prop.scale}>
      {content}
    </group>
  );
}

type Props = {
  props: PropInstance[];
  look: EraLook3D;
  /** When Kenney OBJs exist under public/assets/3d/kenney */
  useKenney?: boolean;
};

export function NatureProps({ props, look, useKenney = false }: Props) {
  return (
    <group>
      {props.map((p, i) => (
        <PropMesh key={`${p.kind}-${i}`} prop={p} look={look} preferKenney={useKenney} />
      ))}
    </group>
  );
}

/** Wooden pier stub for Harbor / near islands. */
export function WoodenPier({
  position = [0, 0, 3.2],
  rotationY = 0,
}: {
  position?: [number, number, number];
  rotationY?: number;
}) {
  const plank = "#8b5a2b";
  const dark = "#5c3a1e";
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.12, 1.2]}>
        <boxGeometry args={[1.8, 0.12, 3.2]} />
        <meshStandardMaterial color={plank} roughness={0.85} flatShading />
      </mesh>
      {[-0.7, 0.7].map((x) =>
        [0.2, 1.2, 2.2].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, -0.25, z]}>
            <cylinderGeometry args={[0.08, 0.1, 0.7, 6]} />
            <meshStandardMaterial color={dark} roughness={0.9} flatShading />
          </mesh>
        )),
      )}
      {[-0.85, 0.85].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.45, 1.2]}>
          <boxGeometry args={[0.06, 0.08, 3.0]} />
          <meshStandardMaterial color={dark} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Stylized shop / stall building — original Capital architecture. */
export function HarborBuilding({
  label: _label,
  accent = "#f4a629",
  body = "#fef3c7",
}: {
  label: string;
  accent?: string;
  body?: string;
}) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[2.2, 1.4, 1.8]} />
        <meshStandardMaterial color={body} roughness={0.7} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0.55]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[2.4, 0.08, 1.0]} />
        <meshStandardMaterial color={accent} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.7, 0.9, 4]} />
        <meshStandardMaterial color={accent} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.45, 0.92]}>
        <boxGeometry args={[0.55, 0.9, 0.08]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      <mesh position={[-0.7, 0.85, 0.92]}>
        <boxGeometry args={[0.4, 0.35, 0.06]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.25, 1.05]}>
        <boxGeometry args={[1.2, 0.28, 0.05]} />
        <meshStandardMaterial color="#16283b" />
      </mesh>
    </group>
  );
}
