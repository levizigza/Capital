import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colorHex, type CapitalCharacter } from "../character";

type Props = {
  character?: CapitalCharacter | null;
  /** seated on carpet vs walking */
  pose?: "stand" | "sit" | "run";
  scale?: number;
  /** Override coat / accent for NPCs */
  coatColor?: string;
  pantColor?: string;
  skinColor?: string;
};

/**
 * Stylized Voyager humanoid — proportions informed by figure-drawing
 * practice (≈7–7.5 heads, clear shoulder/hip blocks), original Capital look.
 * Not a franchise clone; procedural so it stays light for the web build.
 */
export function VoyagerMesh({
  character,
  pose = "stand",
  scale = 1,
  coatColor,
  pantColor = "#1e3a5f",
  skinColor = "#f5d0a9",
}: Props) {
  const group = useRef<THREE.Group>(null);
  const hip = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const hex = coatColor ?? colorHex(character?.color ?? "tide");
  const accessory = character?.accessory ?? "none";
  const companion = character?.companion ?? "none";

  const materials = useMemo(
    () => ({
      coat: new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5, metalness: 0.08 }),
      pants: new THREE.MeshStandardMaterial({ color: pantColor, roughness: 0.75 }),
      skin: new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 }),
      boot: new THREE.MeshStandardMaterial({ color: "#3f2a1a", roughness: 0.85 }),
      accent: new THREE.MeshStandardMaterial({ color: "#f4a629", roughness: 0.4, metalness: 0.25 }),
      hair: new THREE.MeshStandardMaterial({ color: "#2c1810", roughness: 0.9 }),
      eye: new THREE.MeshStandardMaterial({ color: "#16283b", roughness: 0.4 }),
    }),
    [hex, pantColor, skinColor],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pose === "run" && legL.current && legR.current && armL.current && armR.current) {
      const swing = Math.sin(t * 10) * 0.7;
      legL.current.rotation.x = swing;
      legR.current.rotation.x = -swing;
      armL.current.rotation.x = -swing * 0.75;
      armR.current.rotation.x = swing * 0.75;
      if (hip.current) hip.current.position.y = Math.abs(Math.sin(t * 10)) * 0.04;
      if (group.current) group.current.position.y = Math.abs(Math.sin(t * 10)) * 0.03;
    } else if (pose === "sit") {
      if (legL.current && legR.current) {
        legL.current.rotation.x = -1.25;
        legR.current.rotation.x = -1.25;
      }
      if (armL.current && armR.current) {
        armL.current.rotation.x = -0.35;
        armR.current.rotation.x = -0.35;
      }
      if (group.current) group.current.position.y = 0.12;
    } else {
      if (legL.current && legR.current) {
        legL.current.rotation.x = 0;
        legR.current.rotation.x = 0;
      }
      if (armL.current && armR.current) {
        armL.current.rotation.x = Math.sin(t * 1.4) * 0.04;
        armR.current.rotation.x = -Math.sin(t * 1.4) * 0.04;
      }
      if (group.current) group.current.position.y = Math.sin(t * 2) * 0.015;
      if (hip.current) hip.current.position.y = 0;
    }
  });

  // Unit height ≈ 1.7 — head at ~1.55 when standing
  const stand = pose !== "sit";

  return (
    <group ref={group} scale={scale}>
      <group ref={hip} position={[0, stand ? 0 : 0.2, 0]}>
        {/* Boots + lower legs */}
        <group ref={legL} position={[-0.14, 0.55, 0]}>
          <mesh castShadow position={[0, -0.28, 0]} material={materials.pants}>
            <capsuleGeometry args={[0.075, 0.38, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.55, 0.04]} material={materials.boot}>
            <boxGeometry args={[0.16, 0.12, 0.26]} />
          </mesh>
        </group>
        <group ref={legR} position={[0.14, 0.55, 0]}>
          <mesh castShadow position={[0, -0.28, 0]} material={materials.pants}>
            <capsuleGeometry args={[0.075, 0.38, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.55, 0.04]} material={materials.boot}>
            <boxGeometry args={[0.16, 0.12, 0.26]} />
          </mesh>
        </group>

        {/* Hips / torso */}
        <mesh castShadow position={[0, 0.72, 0]} material={materials.pants}>
          <boxGeometry args={[0.38, 0.22, 0.22]} />
        </mesh>
        <mesh castShadow position={[0, 1.05, 0]} material={materials.coat}>
          <capsuleGeometry args={[0.2, 0.42, 5, 10]} />
        </mesh>
        {/* Collar / lapel */}
        <mesh castShadow position={[0, 1.28, 0.12]} material={materials.accent}>
          <boxGeometry args={[0.28, 0.08, 0.06]} />
        </mesh>
        {/* Shoulders */}
        <mesh castShadow position={[-0.28, 1.28, 0]} material={materials.coat}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>
        <mesh castShadow position={[0.28, 1.28, 0]} material={materials.coat}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>

        {/* Arms */}
        <group ref={armL} position={[-0.34, 1.22, 0]}>
          <mesh castShadow position={[0, -0.22, 0]} material={materials.coat}>
            <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.42, 0]} material={materials.skin}>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
        </group>
        <group ref={armR} position={[0.34, 1.22, 0]}>
          <mesh castShadow position={[0, -0.22, 0]} material={materials.coat}>
            <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.42, 0]} material={materials.skin}>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
        </group>

        {/* Neck + head */}
        <mesh castShadow position={[0, 1.42, 0]} material={materials.skin}>
          <cylinderGeometry args={[0.07, 0.08, 0.12, 8]} />
        </mesh>
        <mesh castShadow position={[0, 1.62, 0]} material={materials.skin}>
          <sphereGeometry args={[0.17, 16, 14]} />
        </mesh>
        {/* Hair cap */}
        <mesh castShadow position={[0, 1.72, -0.02]} material={materials.hair}>
          <sphereGeometry args={[0.165, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.06, 1.64, 0.14]} material={materials.eye}>
          <sphereGeometry args={[0.025, 8, 6]} />
        </mesh>
        <mesh position={[0.06, 1.64, 0.14]} material={materials.eye}>
          <sphereGeometry args={[0.025, 8, 6]} />
        </mesh>

        {/* Ledger satchel */}
        <mesh castShadow position={[0.22, 0.95, 0.12]} material={materials.accent}>
          <boxGeometry args={[0.14, 0.18, 0.08]} />
        </mesh>
        <mesh castShadow position={[0.22, 1.08, 0.12]} material={materials.boot}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
        </mesh>

        {/* Accessories */}
        {accessory === "cap" ? (
          <group position={[0, 1.78, 0]}>
            <mesh castShadow material={materials.accent}>
              <cylinderGeometry args={[0.18, 0.19, 0.1, 12]} />
            </mesh>
            <mesh castShadow position={[0, -0.02, 0.14]} material={materials.accent}>
              <boxGeometry args={[0.22, 0.03, 0.12]} />
            </mesh>
          </group>
        ) : null}
        {accessory === "goggles" ? (
          <mesh castShadow position={[0, 1.66, 0.16]} material={materials.accent}>
            <torusGeometry args={[0.12, 0.025, 6, 16]} />
          </mesh>
        ) : null}
        {accessory === "bandana" ? (
          <mesh castShadow position={[0, 1.52, 0]} material={materials.accent}>
            <torusGeometry args={[0.14, 0.03, 6, 16]} />
          </mesh>
        ) : null}
        {accessory === "headset" ? (
          <>
            <mesh castShadow position={[-0.18, 1.62, 0]} material={materials.boot}>
              <sphereGeometry args={[0.07, 10, 8]} />
            </mesh>
            <mesh castShadow position={[0.18, 1.62, 0]} material={materials.boot}>
              <sphereGeometry args={[0.07, 10, 8]} />
            </mesh>
          </>
        ) : null}
        {accessory === "lantern" ? (
          <mesh castShadow position={[0.42, 0.85, 0.1]} material={materials.accent}>
            <boxGeometry args={[0.1, 0.16, 0.1]} />
          </mesh>
        ) : null}

        {/* Tiny companion */}
        {companion !== "none" ? (
          <mesh castShadow position={[0.45, 0.2, 0.15]} material={materials.accent}>
            <sphereGeometry args={[0.12, 10, 8]} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

/** Harbor local — same humanoid language, varied palette. */
export function HarborNpcMesh({
  coat,
  pants,
  skin,
  pose = "stand",
}: {
  coat: string;
  pants?: string;
  skin?: string;
  pose?: "stand" | "run";
}) {
  return (
    <VoyagerMesh
      coatColor={coat}
      pantColor={pants}
      skinColor={skin}
      pose={pose}
      scale={0.95}
      character={null}
    />
  );
}
