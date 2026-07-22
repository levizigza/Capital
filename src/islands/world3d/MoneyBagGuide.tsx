import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

export const COIN_BAG_GUIDE_ID = "coin_bag_guide";

type Props = {
  /** World position Coin Bag should lead toward (guided). If null, follows the player. */
  target: [number, number, number] | null;
  /** Live player position to follow / stay near */
  playerPos: MutableRefObject<THREE.Vector3>;
  /** Short tip shown above the bag */
  tip?: string;
  reducedMotion?: boolean;
};

/**
 * Distinctive bunny-eared money-bag guide — always readable, always hopping.
 * SM64 Lakitu energy: leads during Castle Grounds, then sticks with the Voyager.
 */
function BunnyMoneyBagMesh({ hopPhase }: { hopPhase: MutableRefObject<number> }) {
  const body = useRef<THREE.Group>(null);
  const ears = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = hopPhase.current;
    const bounce = Math.abs(Math.sin(t));
    const squash = 1 - bounce * 0.18;
    const stretch = 1 + bounce * 0.22;
    if (body.current) {
      body.current.scale.set(squash, stretch, squash);
      body.current.position.y = bounce * 0.08;
    }
    if (ears.current) {
      ears.current.rotation.z = Math.sin(t * 1.3) * 0.12;
      ears.current.rotation.x = -0.15 + bounce * 0.08;
    }
  });

  const gold = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f4a629",
        roughness: 0.4,
        metalness: 0.35,
        emissive: "#b45309",
        emissiveIntensity: 0.18,
      }),
    [],
  );
  const sack = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#86efac", roughness: 0.65, flatShading: true }),
    [],
  );
  const ink = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#14532d", roughness: 0.7 }),
    [],
  );
  const earOuter = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f9a8d4", roughness: 0.55 }),
    [],
  );
  const earInner = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fce7f3", roughness: 0.5 }),
    [],
  );
  const eye = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.35 }),
    [],
  );
  const white = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fffbeb", roughness: 0.4 }),
    [],
  );

  return (
    <group>
      {/* Soft ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      <group ref={body}>
        {/* Sack body */}
        <mesh castShadow position={[0, 0.55, 0]} material={sack}>
          <sphereGeometry args={[0.48, 18, 14]} />
        </mesh>
        {/* Chubby bottom */}
        <mesh castShadow position={[0, 0.28, 0]} material={sack} scale={[1.05, 0.7, 1.05]}>
          <sphereGeometry args={[0.42, 16, 12]} />
        </mesh>
        {/* Drawstring neck */}
        <mesh castShadow position={[0, 0.95, 0]} material={ink}>
          <cylinderGeometry args={[0.14, 0.22, 0.2, 12]} />
        </mesh>
        <mesh castShadow position={[0, 1.08, 0]} material={gold}>
          <torusGeometry args={[0.16, 0.045, 8, 16]} />
        </mesh>
        {/* $ coin badge */}
        <mesh castShadow position={[0, 0.55, 0.42]} material={gold}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 20]} />
        </mesh>
        <Billboard position={[0, 0.55, 0.48]} follow={false}>
          <Text fontSize={0.22} color="#14532d" anchorX="center" anchorY="middle">
            $
          </Text>
        </Billboard>

        {/* Eyes */}
        <mesh position={[-0.14, 0.72, 0.38]} material={white}>
          <sphereGeometry args={[0.09, 12, 10]} />
        </mesh>
        <mesh position={[0.14, 0.72, 0.38]} material={white}>
          <sphereGeometry args={[0.09, 12, 10]} />
        </mesh>
        <mesh position={[-0.14, 0.72, 0.46]} material={eye}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </mesh>
        <mesh position={[0.14, 0.72, 0.46]} material={eye}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </mesh>
        {/* Smile */}
        <mesh position={[0, 0.58, 0.44]} rotation={[0.3, 0, 0]} material={ink}>
          <torusGeometry args={[0.1, 0.018, 6, 12, Math.PI]} />
        </mesh>

        {/* Bunny ears */}
        <group ref={ears} position={[0, 1.05, 0]}>
          <group position={[-0.18, 0.15, 0]} rotation={[0.1, 0, -0.25]}>
            <mesh castShadow material={earOuter}>
              <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
            </mesh>
            <mesh position={[0, 0.02, 0.04]} material={earInner} scale={[0.7, 0.85, 0.5]}>
              <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
            </mesh>
          </group>
          <group position={[0.18, 0.15, 0]} rotation={[0.1, 0, 0.25]}>
            <mesh castShadow material={earOuter}>
              <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
            </mesh>
            <mesh position={[0, 0.02, 0.04]} material={earInner} scale={[0.7, 0.85, 0.5]}>
              <capsuleGeometry args={[0.09, 0.42, 6, 10]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export function MoneyBagGuide({ target, playerPos, tip, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const hopPhase = useRef(0);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!group.current) return;

    if (target) {
      desired.set(target[0], 0, target[2]);
    } else {
      // Orbit beside the Voyager so the companion is always in view
      const p = playerPos.current;
      const ang = hopPhase.current * 0.15;
      desired.set(p.x + Math.sin(ang) * 1.35, 0, p.z + Math.cos(ang) * 1.35);
    }

    const pos = group.current.position;
    const dx = desired.x - pos.x;
    const dz = desired.z - pos.z;
    const dist = Math.hypot(dx, dz);
    const stop = target ? 1.45 : 0.35;

    if (dist > stop) {
      const spd = Math.min(target ? 6.2 : 4.8, 2.4 + dist * 0.45);
      pos.x += (dx / dist) * spd * dt;
      pos.z += (dz / dist) * spd * dt;
      group.current.rotation.y = Math.atan2(dx, dz);
    } else if (target) {
      group.current.rotation.y = Math.atan2(desired.x - pos.x, desired.z - pos.z);
    } else {
      // Face the player when hanging out
      const p = playerPos.current;
      group.current.rotation.y = Math.atan2(p.x - pos.x, p.z - pos.z);
    }

    hopPhase.current += dt * (reducedMotion ? 3.2 : 9.5);
    const bounce = reducedMotion ? 0.1 : 0.42;
    pos.y = 0.06 + Math.abs(Math.sin(hopPhase.current)) * bounce;
  });

  return (
    <group
      ref={group}
      position={[1.2, 0.06, 4]}
      scale={1.15}
      userData={{ guideId: COIN_BAG_GUIDE_ID }}
    >
      <BunnyMoneyBagMesh hopPhase={hopPhase} />
      {/* Sparkle above ears */}
      <mesh position={[0, 1.85, 0]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={1}
          roughness={0.25}
        />
      </mesh>
      <Billboard position={[0, 2.15, 0]} follow>
        <Text
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#14532d"
        >
          Coin Bag
        </Text>
      </Billboard>
      {tip ? (
        <Billboard position={[0, 2.45, 0]} follow>
          <Text
            fontSize={0.17}
            color="#fef3c7"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.024}
            outlineColor="#0f172a"
            maxWidth={3.4}
          >
            {tip}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}

/** Resolve a guided highlight into a plaza world target. */
export function guideTargetForHighlight(
  highlight: "outfitter" | "capsule" | "travel" | "practice" | "guide" | undefined,
  hotspots: { id: string; position: [number, number, number] }[],
  piggyPos: [number, number, number] = [4.8, 0, -4],
): [number, number, number] | null {
  if (!highlight) return null;
  if (highlight === "guide") return piggyPos;
  if (highlight === "practice") {
    const arcade = hotspots.find((h) => h.id === "arcade");
    return arcade?.position ?? [0, 0, 3];
  }
  const hit = hotspots.find((h) => h.id === highlight);
  return hit?.position ?? [0, 0, -6];
}
