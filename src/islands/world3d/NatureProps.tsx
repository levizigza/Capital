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
  const leafDark = "#166534";
  return (
    <group scale={scale}>
      <mesh castShadow position={[0.04, 0.55, 0]} rotation={[0.12, 0.2, 0.08]}>
        <cylinderGeometry args={[0.06, 0.12, 1.2, 7]} />
        <meshStandardMaterial color={trunk} roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0.1, 1.15, 0.02]} rotation={[0.2, 0.1, 0.05]}>
        <cylinderGeometry args={[0.045, 0.07, 0.55, 6]} />
        <meshStandardMaterial color={trunk} roughness={0.85} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[
            0.1 + Math.cos((i / 7) * Math.PI * 2) * 0.42,
            1.42,
            Math.sin((i / 7) * Math.PI * 2) * 0.42,
          ]}
          rotation={[0.75, (i / 7) * Math.PI * 2, 0.15]}
        >
          <coneGeometry args={[0.22, 0.85, 5]} />
          <meshStandardMaterial
            color={i % 2 ? leaf : leafDark}
            roughness={0.7}
            flatShading
          />
        </mesh>
      ))}
      {/* Coconut cluster */}
      <mesh castShadow position={[0.12, 1.35, 0.05]}>
        <sphereGeometry args={[0.09, 6, 5]} />
        <meshStandardMaterial color="#3f2a1a" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function ProceduralTree({ look, scale }: { look: EraLook3D; scale: number }) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.09, 0.15, 1.0, 7]} />
        <meshStandardMaterial color="#5c4030" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <icosahedronGeometry args={[0.58, 0]} />
        <meshStandardMaterial color={look.land} roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[0.28, 1.5, -0.12]}>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color={look.land} roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[-0.22, 1.55, 0.18]}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#15803d" roughness={0.78} flatShading />
      </mesh>
      <mesh castShadow position={[0.05, 1.85, 0.05]}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#166534" roughness={0.78} flatShading />
      </mesh>
    </group>
  );
}

function ProceduralRock({ look, scale }: { look: EraLook3D; scale: number }) {
  const rock = look.shading === "neon" ? look.accent : "#78716c";
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.16, 0]} rotation={[0.2, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={rock}
          roughness={0.92}
          flatShading
          metalness={look.shading === "neon" ? 0.3 : 0}
        />
      </mesh>
      <mesh castShadow position={[0.22, 0.1, 0.12]} rotation={[0.5, -0.3, 0.2]} scale={0.55}>
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

function ProceduralBush({ look, scale }: { look: EraLook3D; scale: number }) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.32, 7, 6]} />
        <meshStandardMaterial color={look.land} roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow position={[0.18, 0.18, 0.1]}>
        <sphereGeometry args={[0.22, 6, 5]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow position={[-0.14, 0.16, -0.08]}>
        <sphereGeometry args={[0.18, 6, 5]} />
        <meshStandardMaterial color={look.land} roughness={0.82} flatShading />
      </mesh>
    </group>
  );
}

function ProceduralGrass({ look, scale }: { look: EraLook3D; scale: number }) {
  return (
    <group scale={scale}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.cos(i * 1.4) * 0.1, 0.2, Math.sin(i * 1.4) * 0.1]}
          rotation={[0.2, i * 0.9, 0.08]}
        >
          <coneGeometry args={[0.035, 0.4 + (i % 3) * 0.06, 3]} />
          <meshStandardMaterial
            color={i % 2 ? look.land : "#166534"}
            roughness={0.7}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/** Tiny coastal cottage for near islands. */
export function IslandHut({
  accent = "#f4a629",
  body = "#fef3c7",
  scale = 1,
}: {
  accent?: string;
  body?: string;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[1.15, 0.12, 0.95]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.92} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.0, 0.7, 0.82]} />
        <meshStandardMaterial color={body} roughness={0.72} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.85, 0.55, 4]} />
        <meshStandardMaterial color={accent} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.32, 0.42]}>
        <boxGeometry args={[0.28, 0.42, 0.05]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
      </mesh>
      <mesh position={[-0.28, 0.48, 0.42]}>
        <boxGeometry args={[0.22, 0.18, 0.04]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0.32, 1.15, -0.1]}>
        <cylinderGeometry args={[0.06, 0.07, 0.28, 6]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.4} />
      </mesh>
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


function eraMeshProps(look: EraLook3D) {
  const wire = look.shading === "wire" || look.shading === "vector";
  return {
    wireframe: wire,
    flatShading: !wire && (look.shading === "lowpoly" || look.shading === "neon" || look.shading === "harbor"),
    emissive: wire ? look.accent : "#000000",
    emissiveIntensity: wire ? 0.25 : 0,
  };
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
  const hutBodies = ["#fef3c7", "#ecfccb", "#e0f2fe", "#ffe4e6", "#f5f5f4"];
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
      case "hut":
        return (
          <IslandHut
            accent={look.accent}
            body={hutBodies[Math.abs(Math.round(prop.rotationY * 10)) % hutBodies.length]}
            scale={1}
          />
        );
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

/** Wooden pier — dock hardware language (cleats, bolts, metal rails, cargo). */
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
      {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
        <mesh key={`plank-${i}`} castShadow receiveShadow position={[x, 0.12, 1.5]}>
          <boxGeometry args={[0.32, 0.1, 3.9]} />
          <meshStandardMaterial color={i % 2 ? plank : "#7a4e24"} roughness={0.88} flatShading />
        </mesh>
      ))}
      {/* Cross beams under deck */}
      {[0.4, 1.5, 2.6].map((z) => (
        <mesh key={`beam-${z}`} position={[0, 0.02, z]}>
          <boxGeometry args={[1.6, 0.08, 0.14]} />
          <meshStandardMaterial color={dark} roughness={0.92} flatShading />
        </mesh>
      ))}
      {/* Pilings */}
      {[-0.85, 0.85].map((x) =>
        [0.2, 1.35, 2.55, 3.3].map((z) => (
          <group key={`${x}-${z}`}>
            <mesh castShadow position={[x, -0.35, z]}>
              <cylinderGeometry args={[0.09, 0.12, 0.95, 8]} />
              <meshStandardMaterial color={dark} roughness={0.92} flatShading />
            </mesh>
            <mesh position={[x, 0.12, z]}>
              <cylinderGeometry args={[0.13, 0.13, 0.05, 8]} />
              <meshStandardMaterial color={steel} roughness={0.35} metalness={0.7} />
            </mesh>
          </group>
        )),
      )}
      {/* Metal handrails */}
      {[-1.05, 1.05].map((x) => (
        <group key={`rail-${x}`}>
          <mesh position={[x, 0.55, 1.55]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 3.5, 8]} />
            <meshStandardMaterial color={steel} roughness={0.3} metalness={0.75} />
          </mesh>
          {[0.35, 1.5, 2.65].map((z) => (
            <mesh key={z} position={[x, 0.35, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
              <meshStandardMaterial color={steel} roughness={0.35} metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Dock cleats */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={`cleat-${x}`} castShadow position={[x, 0.22, 3.15]}>
          <boxGeometry args={[0.28, 0.1, 0.12]} />
          <meshStandardMaterial color={steel} roughness={0.4} metalness={0.65} />
        </mesh>
      ))}
      {/* Cargo crates */}
      <mesh castShadow position={[-0.35, 0.32, 0.55]}>
        <boxGeometry args={[0.45, 0.4, 0.4]} />
        <meshStandardMaterial color="#a16207" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0.4, 0.28, 0.9]}>
        <boxGeometry args={[0.35, 0.32, 0.35]} />
        <meshStandardMaterial color="#854d0e" roughness={0.85} flatShading />
      </mesh>
      {/* Barrel */}
      <mesh castShadow position={[0.15, 0.32, 1.8]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.4, 10]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.15, 0.52, 1.8]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 10]} />
        <meshStandardMaterial color={steel} roughness={0.4} metalness={0.55} />
      </mesh>
      {/* Lantern posts */}
      {[-1.05, 1.05].map((x) => (
        <group key={`lamp-${x}`} position={[x, 0, 0.35]}>
          <mesh castShadow position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 1.0, 6]} />
            <meshStandardMaterial color="#44403c" roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.12, 0]}>
            <boxGeometry args={[0.18, 0.22, 0.18]} />
            <meshStandardMaterial
              color="#fde68a"
              emissive="#f59e0b"
              emissiveIntensity={0.45}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
      {/* Rope coil */}
      <mesh position={[-0.55, 0.2, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.045, 8, 14]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} />
      </mesh>
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
      {/* Foundation plinth + steps */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[2.4, 0.16, 2.0]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.05, 1.15]}>
        <boxGeometry args={[1.1, 0.1, 0.35]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} flatShading />
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
      {/* Windows */}
      {[
        [-0.7, 1.0, 0.92],
        [0.7, 1.0, 0.92],
        [-1.12, 1.0, 0],
        [1.12, 1.0, 0],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, Math.abs(x) > 1 ? Math.PI / 2 : 0, 0]}>
          <mesh>
            <boxGeometry args={[0.48, 0.42, 0.06]} />
            <meshStandardMaterial color="#16283b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.38, 0.32, 0.04]} />
            <meshStandardMaterial color="#7dd3fc" roughness={0.25} metalness={0.25} />
          </mesh>
        </group>
      ))}
      {/* Flower boxes */}
      {[-0.7, 0.7].map((x) => (
        <group key={`planter-${x}`} position={[x, 0.72, 0.98]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.12, 0.16]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.1, 6, 5]} />
            <meshStandardMaterial color="#22c55e" roughness={0.75} flatShading />
          </mesh>
        </group>
      ))}
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
