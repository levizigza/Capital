import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

export const COIN_BAG_GUIDE_ID = "coin_bag_guide";

type Props = {
  /**
   * Where the next objective is in the world.
   * Coin Bag stays beside you and POINTS here — never runs away.
   */
  lookAt: [number, number, number] | null;
  /** Live player position */
  playerPos: MutableRefObject<THREE.Vector3>;
  /** Buddy tip — who to talk to / where to go */
  tip?: string;
  reducedMotion?: boolean;
};

/**
 * Bunny-eared money-bag buddy — sticks to your side for the whole journey.
 * Points at the next person/door; never abandons the Voyager to race ahead.
 */
function BunnyMoneyBagMesh({
  hopPhase,
  pointing,
}: {
  hopPhase: MutableRefObject<number>;
  pointing: boolean;
}) {
  const body = useRef<THREE.Group>(null);
  const ears = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = hopPhase.current;
    const bounce = Math.abs(Math.sin(t));
    const squash = 1 - bounce * 0.14;
    const stretch = 1 + bounce * 0.16;
    if (body.current) {
      body.current.scale.set(squash, stretch, squash);
      body.current.position.y = bounce * 0.05;
    }
    if (ears.current) {
      ears.current.rotation.z = Math.sin(t * 1.3) * 0.1;
      ears.current.rotation.x = -0.15 + bounce * 0.06;
    }
    if (arm.current) {
      // Pointing arm: hold forward when guiding
      arm.current.rotation.x = pointing ? -1.15 : -0.25 + Math.sin(t) * 0.08;
      arm.current.rotation.z = pointing ? 0.35 : 0.1;
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.48, 20]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <group ref={body}>
        <mesh castShadow position={[0, 0.5, 0]} material={sack}>
          <sphereGeometry args={[0.42, 18, 14]} />
        </mesh>
        <mesh castShadow position={[0, 0.26, 0]} material={sack} scale={[1.05, 0.7, 1.05]}>
          <sphereGeometry args={[0.38, 16, 12]} />
        </mesh>
        <mesh castShadow position={[0, 0.88, 0]} material={ink}>
          <cylinderGeometry args={[0.12, 0.2, 0.18, 12]} />
        </mesh>
        <mesh castShadow position={[0, 1.0, 0]} material={gold}>
          <torusGeometry args={[0.14, 0.04, 8, 16]} />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0.38]} material={gold}>
          <cylinderGeometry args={[0.17, 0.17, 0.07, 20]} />
        </mesh>
        <Billboard position={[0, 0.5, 0.44]} follow={false}>
          <Text fontSize={0.18} color="#14532d" anchorX="center" anchorY="middle">
            $
          </Text>
        </Billboard>

        <mesh position={[-0.12, 0.66, 0.34]} material={white}>
          <sphereGeometry args={[0.08, 12, 10]} />
        </mesh>
        <mesh position={[0.12, 0.66, 0.34]} material={white}>
          <sphereGeometry args={[0.08, 12, 10]} />
        </mesh>
        <mesh position={[-0.12, 0.66, 0.41]} material={eye}>
          <sphereGeometry args={[0.04, 10, 8]} />
        </mesh>
        <mesh position={[0.12, 0.66, 0.41]} material={eye}>
          <sphereGeometry args={[0.04, 10, 8]} />
        </mesh>
        <mesh position={[0, 0.52, 0.4]} rotation={[0.3, 0, 0]} material={ink}>
          <torusGeometry args={[0.09, 0.016, 6, 12, Math.PI]} />
        </mesh>

        <group ref={ears} position={[0, 0.98, 0]}>
          <group position={[-0.16, 0.12, 0]} rotation={[0.1, 0, -0.25]}>
            <mesh castShadow material={earOuter}>
              <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
            </mesh>
            <mesh position={[0, 0.02, 0.035]} material={earInner} scale={[0.7, 0.85, 0.5]}>
              <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
            </mesh>
          </group>
          <group position={[0.16, 0.12, 0]} rotation={[0.1, 0, 0.25]}>
            <mesh castShadow material={earOuter}>
              <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
            </mesh>
            <mesh position={[0, 0.02, 0.035]} material={earInner} scale={[0.7, 0.85, 0.5]}>
              <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
            </mesh>
          </group>
        </group>

        {/* Pointing “paw” */}
        <group ref={arm} position={[0.38, 0.55, 0.05]}>
          <mesh castShadow material={sack}>
            <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.22, 0.02]} material={gold}>
            <sphereGeometry args={[0.09, 10, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Floating arrow from buddy toward the objective. */
function PointArrow({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    ref.current.position.z = 0.55 + Math.sin(clock.elapsedTime * 5) * 0.08;
  });
  if (!active) return null;
  return (
    <group ref={ref} position={[0, 0.85, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <coneGeometry args={[0.16, 0.45, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

export function MoneyBagGuide({ lookAt, playerPos, tip, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const hopPhase = useRef(0);
  const sideOffset = useRef(new THREE.Vector3());
  const pointing = !!lookAt;

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = playerPos.current;

    // Stay on the Voyager's right — buddy distance, not destination race
    const buddyDist = 1.15;
    // Prefer a stable world-right relative to movement: use offset from last frame toward goal for facing
    let faceYaw = group.current.rotation.y;
    if (lookAt) {
      faceYaw = Math.atan2(lookAt[0] - p.x, lookAt[2] - p.z);
    }

    // Side slot: to the right of the facing-toward-goal (or previous) direction
    const rightX = Math.cos(faceYaw) * buddyDist;
    const rightZ = -Math.sin(faceYaw) * buddyDist;
    sideOffset.current.set(p.x + rightX, 0, p.z + rightZ);

    const pos = group.current.position;
    const dx = sideOffset.current.x - pos.x;
    const dz = sideOffset.current.z - pos.z;
    const dist = Math.hypot(dx, dz);
    // Snappy follow so we never feel abandoned
    const spd = Math.min(10, 4 + dist * 3.5);
    if (dist > 0.05) {
      pos.x += (dx / dist) * spd * dt;
      pos.z += (dz / dist) * spd * dt;
    }

    if (lookAt) {
      // Face the next person/door while staying glued to the player
      group.current.rotation.y = Math.atan2(lookAt[0] - pos.x, lookAt[2] - pos.z);
    } else {
      // Face roughly with the player
      group.current.rotation.y = Math.atan2(p.x - pos.x, p.z - pos.z) + Math.PI;
    }

    hopPhase.current += dt * (reducedMotion ? 2.8 : 7.5);
    const bounce = reducedMotion ? 0.08 : 0.28;
    pos.y = 0.05 + Math.abs(Math.sin(hopPhase.current)) * bounce;
  });

  return (
    <group
      ref={group}
      position={[1.15, 0.05, 3.2]}
      scale={1.05}
      userData={{ guideId: COIN_BAG_GUIDE_ID }}
    >
      <BunnyMoneyBagMesh hopPhase={hopPhase} pointing={pointing} />
      <PointArrow active={pointing} />
      <Billboard position={[0, 1.95, 0]} follow>
        <Text
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#14532d"
        >
          Coin Bag
        </Text>
      </Billboard>
      {tip ? (
        <Billboard position={[0, 2.28, 0]} follow>
          <Text
            fontSize={0.155}
            color="#fef3c7"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.022}
            outlineColor="#0f172a"
            maxWidth={3.6}
          >
            {`→ ${tip}`}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}

/** Resolve a guided highlight into a plaza world look-at point. */
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
