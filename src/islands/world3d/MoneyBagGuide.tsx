import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

import { VoyagerMesh } from "./VoyagerMesh";
import type { CapitalCharacter } from "../character";

export const COIN_BAG_GUIDE_ID = "coin_bag_guide";

const BAG_LOOK: CapitalCharacter = {
  name: "Coin Bag",
  base: "baggy_bucks",
  color: "marigold",
  accessory: "none",
  companion: "none",
};

type Props = {
  /** World position Coin Bag should lead the player toward */
  target: [number, number, number];
  /** Short tip shown above the bag */
  tip?: string;
  reducedMotion?: boolean;
};

/**
 * SM64-style hopping money-bag guide — points the Voyager where to go next.
 * Separate from plaza NPCs; does not steal the player's companion slot.
 */
export function MoneyBagGuide({ target, tip, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const hop = useRef(0);
  const desired = useMemo(() => new THREE.Vector3(...target), [target]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = group.current.position;
    const to = desired;
    const dx = to.x - p.x;
    const dz = to.z - p.z;
    const dist = Math.hypot(dx, dz);

    // Lead a little short of the door so the player can walk past
    const stop = 1.55;
    if (dist > stop) {
      const spd = Math.min(5.5, 2.2 + dist * 0.35);
      p.x += (dx / dist) * spd * dt;
      p.z += (dz / dist) * spd * dt;
      group.current.rotation.y = Math.atan2(dx, dz);
    } else {
      // Face the destination while waiting
      group.current.rotation.y = Math.atan2(to.x - p.x, to.z - p.z);
    }

    hop.current += dt * (reducedMotion ? 2.2 : 7.5);
    const bounce = reducedMotion ? 0.04 : 0.16;
    p.y = 0.05 + Math.abs(Math.sin(hop.current)) * bounce;
  });

  return (
    <group ref={group} position={[0, 0.05, 2.5]} userData={{ guideId: COIN_BAG_GUIDE_ID }}>
      <VoyagerMesh character={BAG_LOOK} pose="stand" scale={0.72} />
      {/* Pointing spark */}
      <mesh position={[0, 1.55, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={0.85}
          roughness={0.3}
        />
      </mesh>
      {tip ? (
        <Billboard position={[0, 2.15, 0]} follow>
          <Text
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.028}
            outlineColor="#0f172a"
            maxWidth={3.2}
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
): [number, number, number] {
  if (highlight === "guide") return piggyPos;
  if (highlight === "practice") {
    const arcade = hotspots.find((h) => h.id === "arcade");
    return arcade?.position ?? [0, 0, 3];
  }
  const hit = hotspots.find((h) => h.id === highlight);
  return hit?.position ?? [0, 0, -6];
}
