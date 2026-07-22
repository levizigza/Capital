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

const KENNEY_DIR = `${import.meta.env.BASE_URL}assets/3d/kenney/`;

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

/** Wooden pier — dock hardware language (cleats, bolts, metal rails). */
export function WoodenPier({
  position = [0, 0, 3.2],
  rotationY = 0,
}: {
  position?: [number, number, number];
  rotationY?: number;
}) {
  const plank = "#8b5a2b";
  const dark = "#5c3a1e";
  const steel = "#6b7280";
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Deck planks */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={`plank-${i}`} castShadow receiveShadow position={[x, 0.12, 1.4]}>
          <boxGeometry args={[0.35, 0.1, 3.6]} />
          <meshStandardMaterial color={i % 2 ? plank : "#7a4e24"} roughness={0.88} flatShading />
        </mesh>
      ))}
      {/* Pilings */}
      {[-0.75, 0.75].map((x) =>
        [0.15, 1.25, 2.45].map((z) => (
          <group key={`${x}-${z}`}>
            <mesh castShadow position={[x, -0.3, z]}>
              <cylinderGeometry args={[0.09, 0.11, 0.85, 8]} />
              <meshStandardMaterial color={dark} roughness={0.92} flatShading />
            </mesh>
            {/* Bolt collar */}
            <mesh position={[x, 0.12, z]}>
              <cylinderGeometry args={[0.12, 0.12, 0.05, 8]} />
              <meshStandardMaterial color={steel} roughness={0.35} metalness={0.7} />
            </mesh>
          </group>
        )),
      )}
      {/* Metal handrails */}
      {[-0.95, 0.95].map((x) => (
        <group key={`rail-${x}`}>
          <mesh position={[x, 0.55, 1.4]}>
            <cylinderGeometry args={[0.035, 0.035, 3.2, 8]} />
            <meshStandardMaterial color={steel} roughness={0.3} metalness={0.75} />
          </mesh>
          {[0.3, 1.4, 2.5].map((z) => (
            <mesh key={z} position={[x, 0.35, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
              <meshStandardMaterial color={steel} roughness={0.35} metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Dock cleats */}
      {[-0.45, 0.45].map((x) => (
        <mesh key={`cleat-${x}`} castShadow position={[x, 0.22, 2.9]}>
          <boxGeometry args={[0.28, 0.1, 0.12]} />
          <meshStandardMaterial color={steel} roughness={0.4} metalness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

/** Stylized shop / stall — Capital architecture with hardware accents. */
export function HarborBuilding({
  label: _label,
  accent = "#f4a629",
  body = "#fef3c7",
}: {
  label: string;
  accent?: string;
  body?: string;
}) {
  const steel = "#6b7280";
  return (
    <group>
      {/* Foundation plinth */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[2.4, 0.16, 2.0]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[2.2, 1.5, 1.8]} />
        <meshStandardMaterial color={body} roughness={0.68} flatShading />
      </mesh>
      {/* Corner brackets */}
      {[
        [-1.05, 0.9],
        [1.05, 0.9],
        [-1.05, -0.85],
        [1.05, -0.85],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]}>
          <boxGeometry args={[0.08, 0.35, 0.08]} />
          <meshStandardMaterial color={steel} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      {/* Awning */}
      <mesh castShadow position={[0, 1.7, 0.55]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[2.45, 0.07, 1.05]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.75, 0.95, 4]} />
        <meshStandardMaterial color={accent} roughness={0.55} flatShading />
      </mesh>
      {/* Chimney vent */}
      <mesh castShadow position={[0.55, 2.35, -0.2]}>
        <cylinderGeometry args={[0.1, 0.12, 0.45, 8]} />
        <meshStandardMaterial color={steel} roughness={0.45} metalness={0.55} />
      </mesh>
      {/* Door + hardware */}
      <mesh position={[0, 0.55, 0.92]}>
        <boxGeometry args={[0.55, 0.95, 0.08]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.55, 0.98]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Window with frame */}
      <mesh position={[-0.7, 1.0, 0.92]}>
        <boxGeometry args={[0.48, 0.42, 0.06]} />
        <meshStandardMaterial color="#16283b" roughness={0.6} />
      </mesh>
      <mesh position={[-0.7, 1.0, 0.95]}>
        <boxGeometry args={[0.38, 0.32, 0.04]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.25} metalness={0.25} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 1.45, 1.08]}>
        <boxGeometry args={[1.35, 0.32, 0.06]} />
        <meshStandardMaterial color="#16283b" />
      </mesh>
      <mesh position={[-0.55, 1.45, 1.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 6]} />
        <meshStandardMaterial color={steel} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.55, 1.45, 1.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 6]} />
        <meshStandardMaterial color={steel} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}
