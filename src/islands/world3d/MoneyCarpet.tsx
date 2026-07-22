import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VoyagerMesh } from "./VoyagerMesh";
import type { CapitalCharacter } from "../character";

type Props = {
  character?: CapitalCharacter | null;
  /** bob / flutter while flying */
  flying?: boolean;
  /** First-person: carpet only (no seated body blocking the lens). */
  hideRider?: boolean;
};

/** Money magic carpet — thick bill-green rug with gold trim + engraved seal. */
export function MoneyCarpet({ character, flying = true, hideRider = false }: Props) {
  const group = useRef<THREE.Group>(null);

  const fringe = useMemo(() => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: "#c9a227", roughness: 0.4, metalness: 0.35 });
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.42), mat);
      m.position.set(-0.85 + i * 0.155, 0.03, 0.62);
      g.add(m);
    }
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.42), mat);
      m.position.set(-0.85 + i * 0.155, 0.03, -0.62);
      g.add(m);
    }
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!group.current || !flying) return;
    const t = clock.elapsedTime;
    group.current.position.y = Math.sin(t * 2.2) * 0.12;
    group.current.rotation.z = Math.sin(t * 1.6) * 0.04;
    group.current.rotation.x = Math.sin(t * 1.1) * 0.03;
  });

  return (
    <group ref={group}>
      {/* Thick rug body */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.08, 1.2]} />
        <meshStandardMaterial color="#1a5436" roughness={0.7} metalness={0.12} />
      </mesh>
      {/* Inner field */}
      <mesh position={[0, 0.085, 0]} receiveShadow>
        <boxGeometry args={[1.45, 0.02, 0.95]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Gold border inlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.62, 0.7, 32]} />
        <meshStandardMaterial color="#c9a227" roughness={0.35} metalness={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* Engraved center seal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.105, 0]}>
        <circleGeometry args={[0.28, 28]} />
        <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <ringGeometry args={[0.16, 0.22, 24]} />
        <meshStandardMaterial color="#0f3d28" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Corner ornaments */}
      {[
        [-0.65, 0.4],
        [0.65, 0.4],
        [-0.65, -0.4],
        [0.65, -0.4],
      ].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.1, z]}>
          <circleGeometry args={[0.08, 12]} />
          <meshStandardMaterial color="#c9a227" roughness={0.4} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <primitive object={fringe} />
      {!hideRider ? (
        <group position={[0, 0.12, 0.05]}>
          <VoyagerMesh character={character} pose="sit" scale={0.85} />
        </group>
      ) : null}
    </group>
  );
}
