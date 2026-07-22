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
  /**
   * First-person ride layout — longer nose ahead of the camera so the
   * money rug fills the lower frame and reads as something you're on.
   * Local +Z is the flight / nose direction.
   */
  povRide?: boolean;
};

/** Money magic carpet — thick bill-green rug with gold trim + engraved seal. */
export function MoneyCarpet({
  character,
  flying = true,
  hideRider = false,
  povRide = false,
}: Props) {
  const group = useRef<THREE.Group>(null);

  // Standard rug is short; POV needs a long bill-nose in front of the rider.
  const length = povRide ? 2.85 : 1.2;
  const width = povRide ? 1.55 : 1.75;
  const nose = length * 0.5;
  // Shift body slightly forward so more carpet sits ahead of the seating origin.
  const bodyZ = povRide ? 0.55 : 0;

  const fringe = useMemo(() => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: "#c9a227",
      roughness: 0.4,
      metalness: 0.35,
    });
    const count = povRide ? 14 : 12;
    const halfW = width * 0.48;
    const step = (halfW * 2) / (count - 1);
    const fringeLen = povRide ? 0.5 : 0.42;
    // Nose fringe (flight direction / +Z)
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, fringeLen), mat);
      m.position.set(-halfW + i * step, 0.03, bodyZ + nose + fringeLen * 0.35);
      g.add(m);
    }
    // Tail fringe (−Z)
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, fringeLen), mat);
      m.position.set(-halfW + i * step, 0.03, bodyZ - nose - fringeLen * 0.35);
      g.add(m);
    }
    return g;
  }, [povRide, width, nose, bodyZ]);

  const billBands = useMemo(() => {
    if (!povRide) return null;
    const g = new THREE.Group();
    const ink = new THREE.MeshStandardMaterial({
      color: "#0f3d28",
      roughness: 0.55,
      metalness: 0.05,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: "#c9a227",
      roughness: 0.35,
      metalness: 0.45,
    });
    // Horizontal bill lines running across the nose so POV reads "money rug"
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 0.012, 0.045), ink);
      m.position.set(0, 0.1, bodyZ + 0.35 + i * 0.28);
      g.add(m);
    }
    // Serial-number style strips near the tip
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.014, 0.06), gold);
      m.position.set((i - 1) * 0.42, 0.105, bodyZ + nose - 0.35);
      g.add(m);
    }
    return g;
  }, [povRide, width, bodyZ, nose]);

  useFrame(({ clock }) => {
    if (!group.current || !flying) return;
    const t = clock.elapsedTime;
    // Keep POV ride calmer so the camera (world-locked to parent) doesn't lose the rug.
    const amp = hideRider || povRide ? 0.045 : 0.12;
    group.current.position.y = Math.sin(t * 2.2) * amp;
    group.current.rotation.z = Math.sin(t * 1.6) * (povRide ? 0.02 : 0.04);
    group.current.rotation.x = Math.sin(t * 1.1) * (povRide ? 0.015 : 0.03);
  });

  const innerW = width * 0.83;
  const innerL = length * 0.8;

  return (
    <group ref={group}>
      {/* Thick rug body */}
      <mesh position={[0, 0.04, bodyZ]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.08, length]} />
        <meshStandardMaterial color="#1a5436" roughness={0.7} metalness={0.12} />
      </mesh>
      {/* Inner field */}
      <mesh position={[0, 0.085, bodyZ]} receiveShadow>
        <boxGeometry args={[innerW, 0.02, innerL]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Gold border inlay — under / near rider */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, bodyZ - (povRide ? 0.35 : 0)]}>
        <ringGeometry args={[0.5, 0.58, 32]} />
        <meshStandardMaterial
          color="#c9a227"
          roughness={0.35}
          metalness={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Engraved center seal — slightly forward of rider so POV sees it */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.105, bodyZ + (povRide ? 0.15 : 0)]}
      >
        <circleGeometry args={[0.28, 28]} />
        <meshStandardMaterial
          color="#c9a227"
          roughness={0.3}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.11, bodyZ + (povRide ? 0.15 : 0)]}
      >
        <ringGeometry args={[0.16, 0.22, 24]} />
        <meshStandardMaterial color="#0f3d28" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Nose medallion — sits clearly in front of the camera */}
      {povRide ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, bodyZ + nose - 0.55]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial
            color="#c9a227"
            roughness={0.28}
            metalness={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
      {/* Corner ornaments */}
      {(povRide
        ? [
            [-width * 0.38, bodyZ + nose - 0.25],
            [width * 0.38, bodyZ + nose - 0.25],
            [-width * 0.38, bodyZ - nose + 0.25],
            [width * 0.38, bodyZ - nose + 0.25],
            [-width * 0.28, bodyZ + 0.7],
            [width * 0.28, bodyZ + 0.7],
          ]
        : [
            [-0.65, 0.4],
            [0.65, 0.4],
            [-0.65, -0.4],
            [0.65, -0.4],
          ]
      ).map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.1, z]}>
          <circleGeometry args={[0.08, 12]} />
          <meshStandardMaterial
            color="#c9a227"
            roughness={0.4}
            metalness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <primitive object={fringe} />
      {billBands ? <primitive object={billBands} /> : null}
      {!hideRider ? (
        <group position={[0, 0.12, povRide ? -0.15 : 0.05]}>
          <VoyagerMesh character={character} pose="sit" scale={0.85} />
        </group>
      ) : null}
    </group>
  );
}
