import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colorHex, type CapitalCharacter } from "../character";

type Props = {
  character?: CapitalCharacter | null;
  /** seated on carpet vs walking */
  pose?: "stand" | "sit" | "run";
  scale?: number;
};

/** Low-poly Voyager — original Capital silhouette, not a franchise clone. */
export function VoyagerMesh({ character, pose = "stand", scale = 1 }: Props) {
  const group = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Mesh>(null);
  const armR = useRef<THREE.Mesh>(null);
  const hex = colorHex(character?.color ?? "tide");

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pose === "run" && legL.current && legR.current) {
      legL.current.rotation.x = Math.sin(t * 10) * 0.55;
      legR.current.rotation.x = Math.sin(t * 10 + Math.PI) * 0.55;
      if (armL.current && armR.current) {
        armL.current.rotation.x = Math.sin(t * 10 + Math.PI) * 0.4;
        armR.current.rotation.x = Math.sin(t * 10) * 0.4;
      }
    } else if (pose === "sit") {
      if (legL.current && legR.current) {
        legL.current.rotation.x = -1.1;
        legR.current.rotation.x = -1.1;
      }
      if (group.current) group.current.position.y = 0.15;
    } else if (pose === "stand" && group.current) {
      group.current.position.y = Math.sin(t * 2) * 0.02;
      if (legL.current && legR.current) {
        legL.current.rotation.x = 0;
        legR.current.rotation.x = 0;
      }
    }
  });

  const yOff = pose === "sit" ? 0.35 : 0.9;

  return (
    <group ref={group} scale={scale} position={[0, 0, 0]}>
      {/* legs */}
      <mesh ref={legL} position={[-0.12, yOff - 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      <mesh ref={legR} position={[0.12, yOff - 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* body */}
      <mesh position={[0, yOff, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.35, 4, 10]} />
        <meshStandardMaterial color={hex} roughness={0.45} metalness={0.1} />
      </mesh>
      {/* arms */}
      <mesh ref={armL} position={[-0.32, yOff + 0.05, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.28, 4, 8]} />
        <meshStandardMaterial color={hex} />
      </mesh>
      <mesh ref={armR} position={[0.32, yOff + 0.05, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.28, 4, 8]} />
        <meshStandardMaterial color={hex} />
      </mesh>
      {/* head */}
      <mesh position={[0, yOff + 0.48, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.55} />
      </mesh>
      {/* satchel accent */}
      <mesh position={[0.18, yOff - 0.05, 0.12]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.08]} />
        <meshStandardMaterial color="#f4a629" />
      </mesh>
    </group>
  );
}
