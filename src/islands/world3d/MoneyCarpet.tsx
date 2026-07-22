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

/** Money magic carpet — bill-green rug with gold trim + seated Voyager. */
export function MoneyCarpet({ character, flying = true, hideRider = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const fringe = useMemo(() => {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.02, 0.35),
        new THREE.MeshStandardMaterial({ color: "#c9a227", roughness: 0.4 }),
      );
      m.position.set(-0.7 + i * 0.2, 0.02, 0.55);
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
      {/* carpet body — dollar aesthetic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow castShadow>
        <planeGeometry args={[1.6, 1.1]} />
        <meshStandardMaterial color="#1a5436" roughness={0.65} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[1.35, 0.85]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* center seal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#c9a227" roughness={0.35} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <primitive object={fringe} />
      {!hideRider ? (
        <group position={[0, 0.05, 0.05]}>
          <VoyagerMesh character={character} pose="sit" scale={0.85} />
        </group>
      ) : null}
    </group>
  );
}
