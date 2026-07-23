/**
 * Coin Bag on the money carpet — side-seat chill buddy with cycling emotes.
 * Looks back, sleeps (Zzz), waves, blushes… never abandons the ride.
 */

import { useMemo, useRef, useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

import {
  type CoinBagEmote,
  pickCarpetEmoteBeat,
  captionForEmote,
} from "./coinBagEmotes";

type Props = {
  /** Local carpet seat offset (POV: right edge of the bill) */
  position?: [number, number, number];
  scale?: number;
  /** Live rush flag from FlightRig (optional) */
  rushingRef?: MutableRefObject<boolean>;
  reducedMotion?: boolean;
};

function EmoteFace({
  emoteRef,
}: {
  emoteRef: MutableRefObject<CoinBagEmote>;
}) {
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const leftPupil = useRef<THREE.Mesh>(null);
  const rightPupil = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const blushL = useRef<THREE.Mesh>(null);
  const blushR = useRef<THREE.Mesh>(null);
  const zzz = useRef<THREE.Group>(null);

  const white = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fffbeb", roughness: 0.4 }),
    [],
  );
  const eye = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.35 }),
    [],
  );
  const ink = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#14532d", roughness: 0.7 }),
    [],
  );
  const pink = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#fb7185",
        roughness: 0.55,
        transparent: true,
        opacity: 0.85,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const emote = emoteRef.current;
    const t = clock.elapsedTime;
    const sleep = emote === "sleep";
    const dizzy = emote === "dizzy";
    const blush = emote === "blush" || emote === "smug";
    const lookBack = emote === "lookBack";
    const excited = emote === "excited";

    if (leftPupil.current && rightPupil.current) {
      leftPupil.current.visible = !sleep;
      rightPupil.current.visible = !sleep;
      if (dizzy) {
        leftPupil.current.position.set(-0.12 + Math.sin(t * 8) * 0.03, 0.66, 0.41);
        rightPupil.current.position.set(0.12 + Math.cos(t * 8) * 0.03, 0.66, 0.41);
      } else if (lookBack) {
        leftPupil.current.position.set(-0.09, 0.66, 0.41);
        rightPupil.current.position.set(0.15, 0.66, 0.41);
      } else if (excited) {
        leftPupil.current.position.set(-0.12, 0.68, 0.41);
        rightPupil.current.position.set(0.12, 0.68, 0.41);
      } else {
        leftPupil.current.position.set(-0.12, 0.66, 0.41);
        rightPupil.current.position.set(0.12, 0.66, 0.41);
      }
    }

    if (leftEye.current && rightEye.current) {
      const squint = sleep ? 0.25 : emote === "smug" ? 0.7 : 1;
      leftEye.current.scale.set(1, squint, 1);
      rightEye.current.scale.set(1, squint, 1);
    }

    if (mouth.current) {
      if (sleep) {
        mouth.current.scale.set(0.55, 0.4, 1);
        mouth.current.rotation.x = 0.1;
      } else if (excited || emote === "wave") {
        mouth.current.scale.set(1.25, 1.1, 1);
        mouth.current.rotation.x = 0.45;
      } else if (emote === "curious") {
        mouth.current.scale.set(0.5, 0.5, 1);
        mouth.current.rotation.x = 0.15;
      } else if (emote === "smug") {
        mouth.current.scale.set(1.1, 0.55, 1);
        mouth.current.rotation.z = 0.25;
        mouth.current.rotation.x = 0.2;
      } else {
        mouth.current.scale.set(1, 1, 1);
        mouth.current.rotation.x = 0.3;
        mouth.current.rotation.z = 0;
      }
    }

    if (blushL.current && blushR.current) {
      blushL.current.visible = blush;
      blushR.current.visible = blush;
    }

    if (zzz.current) {
      zzz.current.visible = sleep;
      if (sleep) {
        zzz.current.position.y = 1.55 + Math.sin(t * 2.2) * 0.06;
        zzz.current.rotation.z = Math.sin(t * 1.4) * 0.08;
      }
    }
  });

  return (
    <>
      <mesh ref={leftEye} position={[-0.12, 0.66, 0.34]} material={white}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>
      <mesh ref={rightEye} position={[0.12, 0.66, 0.34]} material={white}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>
      <mesh ref={leftPupil} position={[-0.12, 0.66, 0.41]} material={eye}>
        <sphereGeometry args={[0.04, 10, 8]} />
      </mesh>
      <mesh ref={rightPupil} position={[0.12, 0.66, 0.41]} material={eye}>
        <sphereGeometry args={[0.04, 10, 8]} />
      </mesh>
      <mesh ref={mouth} position={[0, 0.52, 0.4]} rotation={[0.3, 0, 0]} material={ink}>
        <torusGeometry args={[0.09, 0.016, 6, 12, Math.PI]} />
      </mesh>
      <mesh ref={blushL} position={[-0.22, 0.48, 0.32]} material={pink} visible={false}>
        <sphereGeometry args={[0.06, 10, 8]} />
      </mesh>
      <mesh ref={blushR} position={[0.22, 0.48, 0.32]} material={pink} visible={false}>
        <sphereGeometry args={[0.06, 10, 8]} />
      </mesh>
      <group ref={zzz} position={[0.25, 1.55, 0.1]} visible={false}>
        <Billboard follow>
          <Text
            fontSize={0.22}
            color="#fef3c7"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#0f172a"
          >
            Zzz
          </Text>
        </Billboard>
      </group>
    </>
  );
}

/**
 * Side-seat carpet passenger — cycles emotes, sometimes looks back at you.
 */
export function CarpetCoinBagBuddy({
  position = [0.72, 0.08, -0.2],
  scale = 0.55,
  rushingRef,
  reducedMotion = false,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const ears = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const emoteRef = useRef<CoinBagEmote>("chill");
  const playlistIndex = useRef(0);
  const holdUntil = useRef(0);
  const hopPhase = useRef(0);
  const [caption, setCaption] = useState(captionForEmote("chill"));

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

  useFrame((_, dt) => {
    const now = performance.now() / 1000;
    const rushing = !!rushingRef?.current;

    if (now >= holdUntil.current) {
      const { beat, nextIndex } = pickCarpetEmoteBeat(playlistIndex.current, rushing);
      playlistIndex.current = nextIndex;
      emoteRef.current = beat.emote;
      holdUntil.current = now + (reducedMotion ? beat.duration * 1.4 : beat.duration);
      setCaption(beat.caption ?? captionForEmote(beat.emote));
    }

    const emote = emoteRef.current;
    hopPhase.current += dt * (emote === "excited" ? 11 : emote === "sleep" ? 1.6 : reducedMotion ? 2.5 : 5.5);

    if (root.current) {
      // Look back at the Voyager (camera sits behind/above the seat)
      let yaw = -0.35;
      let pitch = 0.05;
      if (emote === "lookBack" || emote === "wave" || emote === "blush") {
        yaw = -1.15 + Math.sin(now * 2.2) * 0.08;
        pitch = 0.18;
      } else if (emote === "curious") {
        yaw = -0.55;
        pitch = 0.22;
      } else if (emote === "sleep") {
        yaw = -0.2;
        pitch = 0.35;
      } else if (emote === "dizzy") {
        yaw = -0.5 + Math.sin(now * 6) * 0.5;
        pitch = Math.sin(now * 4) * 0.15;
      } else if (emote === "smug") {
        yaw = -0.85;
        pitch = 0.1;
      }
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, yaw, 1 - Math.pow(0.02, dt));
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, pitch, 1 - Math.pow(0.04, dt));
      root.current.position.y = position[1] + (emote === "sleep" ? -0.04 : Math.abs(Math.sin(hopPhase.current)) * (emote === "excited" ? 0.12 : 0.04));
    }

    const bounce = Math.abs(Math.sin(hopPhase.current));
    if (body.current) {
      const squash = emote === "sleep" ? 1.05 : 1 - bounce * 0.1;
      const stretch = emote === "sleep" ? 0.92 : 1 + bounce * 0.12;
      body.current.scale.set(squash, stretch, squash);
    }
    if (ears.current) {
      if (emote === "sleep") {
        ears.current.rotation.x = 0.45;
        ears.current.rotation.z = Math.sin(hopPhase.current * 0.4) * 0.04;
      } else if (emote === "excited") {
        ears.current.rotation.x = -0.35;
        ears.current.rotation.z = Math.sin(hopPhase.current * 2) * 0.2;
      } else if (emote === "dizzy") {
        ears.current.rotation.z = Math.sin(now * 7) * 0.45;
      } else {
        ears.current.rotation.z = Math.sin(hopPhase.current * 1.2) * 0.1;
        ears.current.rotation.x = -0.12 + bounce * 0.05;
      }
    }
    if (arm.current) {
      if (emote === "wave") {
        arm.current.rotation.x = -1.4;
        arm.current.rotation.z = 0.2 + Math.sin(now * 10) * 0.55;
      } else if (emote === "sleep") {
        arm.current.rotation.x = 0.4;
        arm.current.rotation.z = 0.5;
      } else if (emote === "excited") {
        arm.current.rotation.x = -0.9 + Math.sin(now * 8) * 0.3;
        arm.current.rotation.z = 0.25;
      } else {
        arm.current.rotation.x = -0.3 + Math.sin(hopPhase.current) * 0.08;
        arm.current.rotation.z = 0.12;
      }
    }
  });

  return (
    <group
      ref={root}
      position={position}
      scale={scale}
      userData={{ guideId: "coin_bag_carpet" }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      <group ref={body}>
        <mesh castShadow position={[0, 0.5, 0]} material={sack}>
          <sphereGeometry args={[0.42, 16, 12]} />
        </mesh>
        <mesh castShadow position={[0, 0.26, 0]} material={sack} scale={[1.05, 0.7, 1.05]}>
          <sphereGeometry args={[0.38, 14, 10]} />
        </mesh>
        <mesh castShadow position={[0, 0.88, 0]} material={ink}>
          <cylinderGeometry args={[0.12, 0.2, 0.18, 10]} />
        </mesh>
        <mesh castShadow position={[0, 1.0, 0]} material={gold}>
          <torusGeometry args={[0.14, 0.04, 8, 14]} />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0.38]} material={gold}>
          <cylinderGeometry args={[0.17, 0.17, 0.07, 16]} />
        </mesh>
        <Billboard position={[0, 0.5, 0.44]} follow={false}>
          <Text fontSize={0.18} color="#14532d" anchorX="center" anchorY="middle">
            $
          </Text>
        </Billboard>

        <EmoteFace emoteRef={emoteRef} />

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

        <group ref={arm} position={[0.38, 0.55, 0.05]}>
          <mesh castShadow material={sack}>
            <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.22, 0.02]} material={gold}>
            <sphereGeometry args={[0.09, 10, 8]} />
          </mesh>
        </group>
      </group>

      <Billboard position={[0, 1.7, 0]} follow>
        <Text
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.022}
          outlineColor="#14532d"
        >
          Coin Bag
        </Text>
      </Billboard>
      <Billboard position={[0, 1.95, 0]} follow>
        <Text
          fontSize={0.13}
          color="#fef3c7"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#0f172a"
          maxWidth={2.4}
        >
          {caption}
        </Text>
      </Billboard>
    </group>
  );
}
