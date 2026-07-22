import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  colorHex,
  moneyFormFromBase,
  moneyGlyphFromBase,
  type CapitalCharacter,
  type MoneyForm,
} from "../character";
import { EXTENDED_MASCOT_FORMS, MascotBody } from "./MascotBody";

type Props = {
  character?: CapitalCharacter | null;
  /** seated on carpet vs walking / emotes */
  pose?: "stand" | "sit" | "run" | "wave" | "talk" | "nod" | "cheer" | "point";
  scale?: number;
  /** Override primary / accent for NPCs */
  coatColor?: string;
  pantColor?: string;
  skinColor?: string;
  /** Force a money form (NPCs). */
  form?: MoneyForm;
  /** Currency / crypto face mark */
  glyph?: string;
};

/**
 * Anthropomorphic money mascot — the People of Capital.
 * Wacky kids-game cast for Fortune Archipelago. Procedural, no human faces.
 */
export function VoyagerMesh({
  character,
  pose = "stand",
  scale = 1,
  coatColor,
  pantColor = "#1e3a5f",
  skinColor = "#fef3c7",
  form,
  glyph,
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
  const bodyForm = form ?? moneyFormFromBase(character?.base);
  const faceGlyph = glyph ?? moneyGlyphFromBase(character?.base);
  const useExtended = (EXTENDED_MASCOT_FORMS as string[]).includes(bodyForm);

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: hex,
        roughness:
          bodyForm === "coin" || bodyForm === "ancient" || bodyForm === "crypto" || bodyForm === "ingot"
            ? 0.35
            : 0.55,
        metalness:
          bodyForm === "coin" || bodyForm === "ancient" || bodyForm === "crypto" || bodyForm === "ingot"
            ? 0.55
            : 0.08,
      }),
      ink: new THREE.MeshStandardMaterial({ color: pantColor, roughness: 0.7 }),
      paper: new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.75 }),
      gold: new THREE.MeshStandardMaterial({ color: "#f4a629", roughness: 0.35, metalness: 0.45 }),
      dark: new THREE.MeshStandardMaterial({ color: "#16283b", roughness: 0.55 }),
      eye: new THREE.MeshStandardMaterial({ color: "#16283b", roughness: 0.35 }),
      blush: new THREE.MeshStandardMaterial({ color: "#fb7185", roughness: 0.6 }),
      pink: new THREE.MeshStandardMaterial({ color: "#fda4af", roughness: 0.55 }),
    }),
    [hex, pantColor, skinColor, bodyForm],
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
      if (group.current) {
        group.current.position.y = Math.abs(Math.sin(t * 10)) * 0.03;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
    } else if (pose === "sit") {
      if (legL.current && legR.current) {
        legL.current.rotation.x = -1.15;
        legR.current.rotation.x = -1.15;
      }
      if (armL.current && armR.current) {
        armL.current.rotation.x = -0.35;
        armR.current.rotation.x = -0.35;
      }
      if (group.current) {
        group.current.position.y = 0.12;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
    } else if (pose === "wave" && armR.current && armL.current) {
      // Big hello — right arm up, oscillating (what coach text may claim)
      armR.current.rotation.x = -2.2;
      armR.current.rotation.z = Math.sin(t * 8) * 0.55;
      armL.current.rotation.x = 0.15;
      armL.current.rotation.z = 0;
      if (legL.current && legR.current) {
        legL.current.rotation.x = 0;
        legR.current.rotation.x = 0;
      }
      if (group.current) {
        group.current.position.y = Math.abs(Math.sin(t * 4)) * 0.04;
        group.current.rotation.z = Math.sin(t * 4) * 0.04;
        group.current.rotation.x = 0;
      }
    } else if (pose === "talk" && armR.current && armL.current) {
      armR.current.rotation.x = -0.55 + Math.sin(t * 6) * 0.25;
      armL.current.rotation.x = -0.35 + Math.sin(t * 6 + 1) * 0.15;
      armR.current.rotation.z = 0.15;
      armL.current.rotation.z = -0.1;
      if (group.current) {
        group.current.position.y = Math.sin(t * 3) * 0.02;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
    } else if (pose === "nod" && group.current) {
      if (armL.current && armR.current) {
        armL.current.rotation.x = 0.1;
        armR.current.rotation.x = 0.1;
        armL.current.rotation.z = 0;
        armR.current.rotation.z = 0;
      }
      group.current.rotation.x = Math.sin(t * 3.2) * 0.22;
      group.current.rotation.z = 0;
      group.current.position.y = 0.02;
    } else if (pose === "cheer" && armL.current && armR.current) {
      armL.current.rotation.x = -2.4;
      armR.current.rotation.x = -2.4;
      armL.current.rotation.z = -0.35 + Math.sin(t * 7) * 0.1;
      armR.current.rotation.z = 0.35 + Math.sin(t * 7 + 0.5) * 0.1;
      if (group.current) {
        group.current.position.y = Math.abs(Math.sin(t * 6)) * 0.08;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
    } else if (pose === "point" && armR.current && armL.current) {
      armR.current.rotation.x = -1.35;
      armR.current.rotation.z = 0.45;
      armL.current.rotation.x = 0.2;
      armL.current.rotation.z = 0;
      if (group.current) {
        group.current.position.y = Math.sin(t * 2) * 0.02;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
    } else {
      if (legL.current && legR.current) {
        legL.current.rotation.x = 0;
        legR.current.rotation.x = 0;
      }
      if (armL.current && armR.current) {
        armL.current.rotation.x = Math.sin(t * 1.4) * 0.05;
        armR.current.rotation.x = -Math.sin(t * 1.4) * 0.05;
        armL.current.rotation.z = 0;
        armR.current.rotation.z = 0;
      }
      if (group.current) {
        group.current.position.y = Math.sin(t * 2) * 0.02;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
      if (hip.current) hip.current.position.y = 0;
    }
  });

  const stand = pose !== "sit";
  const isPiggy = bodyForm === "piggy";
  const isCoin = bodyForm === "coin" || bodyForm === "signal" || bodyForm === "ancient";
  const isBill = bodyForm === "bill" || bodyForm === "wave";
  const isBook = bodyForm === "ledger" || bodyForm === "scroll";
  const classic = isBill || isCoin || isPiggy || isBook;

  return (
    <group ref={group} scale={scale}>
      <group ref={hip} position={[0, stand ? 0 : 0.18, 0]}>
        <group ref={legL} position={[-0.16, 0.42, 0]}>
          <mesh castShadow position={[0, -0.18, 0]} material={materials.ink}>
            <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0.04]} material={materials.gold}>
            <boxGeometry args={[0.16, 0.1, 0.22]} />
          </mesh>
        </group>
        <group ref={legR} position={[0.16, 0.42, 0]}>
          <mesh castShadow position={[0, -0.18, 0]} material={materials.ink}>
            <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0.04]} material={materials.gold}>
            <boxGeometry args={[0.16, 0.1, 0.22]} />
          </mesh>
        </group>

        {isBill ? (
          <group position={[0, 0.95, 0]}>
            <mesh castShadow material={materials.body}>
              <boxGeometry args={[0.85, 0.95, 0.14]} />
            </mesh>
            <mesh position={[0, 0.02, 0.075]} material={materials.paper}>
              <boxGeometry args={[0.68, 0.72, 0.02]} />
            </mesh>
            <mesh position={[0, 0.05, 0.09]} material={materials.gold}>
              <circleGeometry args={[0.18, 20]} />
            </mesh>
            <mesh position={[0, 0.05, 0.1]} material={materials.dark}>
              <ringGeometry args={[0.1, 0.14, 16]} />
            </mesh>
            <mesh position={[-0.28, 0.32, 0.09]} material={materials.ink}>
              <boxGeometry args={[0.18, 0.04, 0.01]} />
            </mesh>
            <mesh position={[0.28, -0.28, 0.09]} material={materials.ink}>
              <boxGeometry args={[0.18, 0.04, 0.01]} />
            </mesh>
            {bodyForm === "wave" ? (
              <mesh position={[0, -0.35, 0.1]} rotation={[0, 0, 0.1]} material={materials.gold}>
                <torusGeometry args={[0.22, 0.04, 6, 14, Math.PI]} />
              </mesh>
            ) : null}
            <mesh position={[-0.14, 0.28, 0.1]} material={materials.eye}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
            <mesh position={[0.14, 0.28, 0.1]} material={materials.eye}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
            <mesh position={[-0.14, 0.29, 0.14]} material={materials.paper}>
              <sphereGeometry args={[0.02, 6, 6]} />
            </mesh>
            <mesh position={[0.14, 0.29, 0.14]} material={materials.paper}>
              <sphereGeometry args={[0.02, 6, 6]} />
            </mesh>
            <mesh position={[0, 0.12, 0.1]} material={materials.blush}>
              <boxGeometry args={[0.12, 0.03, 0.01]} />
            </mesh>
            <mesh position={[-0.38, 0.42, 0.02]} rotation={[0, 0, 0.4]} material={materials.body}>
              <boxGeometry args={[0.16, 0.16, 0.04]} />
            </mesh>
            <mesh position={[0.38, 0.42, 0.02]} rotation={[0, 0, -0.4]} material={materials.body}>
              <boxGeometry args={[0.16, 0.16, 0.04]} />
            </mesh>
          </group>
        ) : null}

        {isCoin ? (
          <group position={[0, 0.95, 0]}>
            <mesh castShadow material={materials.body}>
              <cylinderGeometry args={[0.48, 0.48, 0.16, 28]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]} material={materials.gold}>
              <ringGeometry args={[0.34, 0.44, 28]} />
            </mesh>
            <mesh position={[0, 0, 0.09]} material={materials.gold}>
              <circleGeometry args={[0.22, 24]} />
            </mesh>
            {bodyForm === "signal" ? (
              <>
                <mesh position={[0, 0.55, 0]} material={materials.ink}>
                  <cylinderGeometry args={[0.03, 0.04, 0.35, 6]} />
                </mesh>
                <mesh position={[0, 0.75, 0]} material={materials.gold}>
                  <sphereGeometry args={[0.08, 8, 6]} />
                </mesh>
              </>
            ) : null}
            {bodyForm === "ancient" ? (
              <mesh position={[0, 0, 0.1]} material={materials.ink}>
                <ringGeometry args={[0.12, 0.2, 3]} />
              </mesh>
            ) : null}
            <mesh position={[-0.14, 0.1, 0.1]} material={materials.eye}>
              <sphereGeometry args={[0.06, 10, 8]} />
            </mesh>
            <mesh position={[0.14, 0.1, 0.1]} material={materials.eye}>
              <sphereGeometry args={[0.06, 10, 8]} />
            </mesh>
            <mesh position={[0, -0.08, 0.1]} material={materials.blush}>
              <boxGeometry args={[0.12, 0.035, 0.01]} />
            </mesh>
          </group>
        ) : null}

        {isPiggy ? (
          <group position={[0, 0.85, 0]}>
            <mesh castShadow material={materials.pink}>
              <sphereGeometry args={[0.48, 18, 14]} />
            </mesh>
            <mesh castShadow position={[0, -0.05, 0.42]} material={materials.body}>
              <cylinderGeometry args={[0.14, 0.16, 0.18, 12]} />
            </mesh>
            <mesh position={[-0.05, -0.05, 0.52]} material={materials.dark}>
              <sphereGeometry args={[0.03, 6, 6]} />
            </mesh>
            <mesh position={[0.05, -0.05, 0.52]} material={materials.dark}>
              <sphereGeometry args={[0.03, 6, 6]} />
            </mesh>
            <mesh position={[0, 0.42, 0]} material={materials.dark}>
              <boxGeometry args={[0.28, 0.04, 0.08]} />
            </mesh>
            <mesh castShadow position={[-0.32, 0.32, 0.05]} rotation={[0, 0, 0.4]} material={materials.pink}>
              <coneGeometry args={[0.1, 0.18, 5]} />
            </mesh>
            <mesh castShadow position={[0.32, 0.32, 0.05]} rotation={[0, 0, -0.4]} material={materials.pink}>
              <coneGeometry args={[0.1, 0.18, 5]} />
            </mesh>
            <mesh position={[-0.14, 0.12, 0.38]} material={materials.eye}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
            <mesh position={[0.14, 0.12, 0.38]} material={materials.eye}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
            <mesh position={[0, -0.1, -0.48]} rotation={[Math.PI / 2, 0, 0]} material={materials.body}>
              <torusGeometry args={[0.1, 0.03, 6, 12]} />
            </mesh>
          </group>
        ) : null}

        {isBook ? (
          <group position={[0, 0.95, 0]}>
            <mesh castShadow material={materials.body}>
              <boxGeometry args={[0.7, 0.9, 0.28]} />
            </mesh>
            <mesh position={[0.02, 0, 0.02]} material={materials.paper}>
              <boxGeometry args={[0.62, 0.82, 0.22]} />
            </mesh>
            <mesh position={[-0.36, 0, 0]} material={materials.gold}>
              <boxGeometry args={[0.06, 0.92, 0.3]} />
            </mesh>
            {bodyForm === "scroll" ? (
              <>
                <mesh castShadow position={[0, 0.52, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.paper}>
                  <cylinderGeometry args={[0.12, 0.12, 0.75, 12]} />
                </mesh>
                <mesh castShadow position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.paper}>
                  <cylinderGeometry args={[0.12, 0.12, 0.75, 12]} />
                </mesh>
              </>
            ) : (
              <>
                <mesh position={[0.05, 0.2, 0.15]} material={materials.ink}>
                  <boxGeometry args={[0.4, 0.04, 0.01]} />
                </mesh>
                <mesh position={[0.05, 0.08, 0.15]} material={materials.ink}>
                  <boxGeometry args={[0.35, 0.04, 0.01]} />
                </mesh>
                <mesh position={[0.05, -0.04, 0.15]} material={materials.ink}>
                  <boxGeometry args={[0.3, 0.04, 0.01]} />
                </mesh>
              </>
            )}
            <mesh position={[-0.12, 0.28, 0.16]} material={materials.eye}>
              <sphereGeometry args={[0.05, 10, 8]} />
            </mesh>
            <mesh position={[0.16, 0.28, 0.16]} material={materials.eye}>
              <sphereGeometry args={[0.05, 10, 8]} />
            </mesh>
            <mesh position={[0.02, 0.12, 0.16]} material={materials.blush}>
              <boxGeometry args={[0.1, 0.025, 0.01]} />
            </mesh>
          </group>
        ) : null}

        {useExtended && !classic ? (
          <MascotBody form={bodyForm} materials={materials} glyph={faceGlyph} />
        ) : null}

        <group ref={armL} position={[-0.48, isPiggy ? 0.95 : 1.15, 0]}>
          <mesh castShadow position={[0, -0.18, 0]} material={materials.body}>
            <capsuleGeometry args={[0.065, 0.28, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0]} material={materials.gold}>
            <sphereGeometry args={[0.08, 10, 8]} />
          </mesh>
        </group>
        <group ref={armR} position={[0.48, isPiggy ? 0.95 : 1.15, 0]}>
          <mesh castShadow position={[0, -0.18, 0]} material={materials.body}>
            <capsuleGeometry args={[0.065, 0.28, 4, 8]} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0]} material={materials.gold}>
            <sphereGeometry args={[0.08, 10, 8]} />
          </mesh>
        </group>

        {/* Gear — oversized & form-aware so Outfitter picks always read clearly */}
        {accessory !== "none" ? (
          <GearAttach
            accessory={accessory}
            headY={isPiggy ? 1.38 : isCoin ? 1.42 : useExtended || isBill || isBook ? 1.48 : 1.52}
            chestY={isPiggy ? 0.88 : 0.98}
            faceZ={isBill || isBook || bodyForm === "currency" || bodyForm === "receipt" ? 0.16 : 0.24}
            materials={materials}
          />
        ) : null}

        {companion !== "none" ? (
          <mesh castShadow position={[0.55, 0.25, 0.2]} material={materials.gold}>
            <sphereGeometry args={[0.13, 10, 8]} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

/** Readable outfit gear for every mascot silhouette (Outfitter live preview). */
function GearAttach({
  accessory,
  headY,
  chestY,
  faceZ,
  materials,
}: {
  accessory: string;
  headY: number;
  chestY: number;
  faceZ: number;
  materials: {
    body: THREE.MeshStandardMaterial;
    ink: THREE.MeshStandardMaterial;
    gold: THREE.MeshStandardMaterial;
    dark: THREE.MeshStandardMaterial;
    pink: THREE.MeshStandardMaterial;
  };
}) {
  if (accessory === "cap") {
    return (
      <group position={[0, headY, 0]}>
        <mesh castShadow material={materials.dark}>
          <cylinderGeometry args={[0.2, 0.22, 0.18, 14]} />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0]} material={materials.dark}>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 14]} />
        </mesh>
        <mesh castShadow position={[0, 0.22, 0]} material={materials.gold}>
          <sphereGeometry args={[0.06, 10, 8]} />
        </mesh>
      </group>
    );
  }
  if (accessory === "goggles") {
    return (
      <group position={[0.16, headY - 0.2, faceZ + 0.06]}>
        <mesh castShadow material={materials.gold}>
          <torusGeometry args={[0.12, 0.035, 8, 18]} />
        </mesh>
        <mesh material={materials.gold} position={[0, 0, 0.02]}>
          <circleGeometry args={[0.08, 16]} />
        </mesh>
      </group>
    );
  }
  if (accessory === "bandana") {
    return (
      <group position={[0, chestY + 0.35, faceZ]}>
        <mesh castShadow material={materials.pink} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.32, 0.14, 0.1]} />
        </mesh>
        <mesh castShadow position={[0.14, -0.12, 0.02]} rotation={[0, 0, -0.5]} material={materials.pink}>
          <boxGeometry args={[0.12, 0.2, 0.05]} />
        </mesh>
      </group>
    );
  }
  if (accessory === "headset") {
    // Signal Phones — over-ear headphones parked on the head (band + cups + mic)
    return (
      <group position={[0, headY + 0.02, 0]}>
        {/* Headband sitting on top of the head */}
        <mesh castShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0.06, 0]} material={materials.dark}>
          <torusGeometry args={[0.34, 0.05, 8, 24, Math.PI]} />
        </mesh>
        {/* Ear cups clamped to the sides of the head */}
        <mesh castShadow position={[-0.38, -0.12, 0.05]} rotation={[0, 0, Math.PI / 2]} material={materials.ink}>
          <cylinderGeometry args={[0.15, 0.15, 0.13, 16]} />
        </mesh>
        <mesh castShadow position={[0.38, -0.12, 0.05]} rotation={[0, 0, Math.PI / 2]} material={materials.ink}>
          <cylinderGeometry args={[0.15, 0.15, 0.13, 16]} />
        </mesh>
        <mesh position={[-0.38, -0.12, 0.12]} material={materials.pink}>
          <circleGeometry args={[0.11, 16]} />
        </mesh>
        <mesh position={[0.38, -0.12, 0.12]} material={materials.pink}>
          <circleGeometry args={[0.11, 16]} />
        </mesh>
        {/* Mic boom toward the face */}
        <mesh castShadow position={[0.26, -0.28, 0.16]} rotation={[0.55, 0.5, 0.15]} material={materials.dark}>
          <capsuleGeometry args={[0.022, 0.2, 4, 8]} />
        </mesh>
        <mesh castShadow position={[0.16, -0.38, 0.26]} material={materials.gold}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </mesh>
      </group>
    );
  }
  if (accessory === "lantern") {
    return (
      <group position={[0.42, headY - 0.1, faceZ]}>
        <mesh castShadow material={materials.gold}>
          <octahedronGeometry args={[0.16, 0]} />
        </mesh>
        <pointLight color="#fbbf24" intensity={0.6} distance={2.5} />
      </group>
    );
  }
  if (accessory === "cape") {
    return (
      <mesh
        castShadow
        position={[0, chestY + 0.05, -0.32]}
        rotation={[0.4, 0, 0]}
        material={materials.ink}
      >
        <boxGeometry args={[0.85, 1.0, 0.08]} />
      </mesh>
    );
  }
  if (accessory === "scarf") {
    return (
      <group position={[0, chestY + 0.35, faceZ * 0.5]}>
        <mesh castShadow material={materials.gold} rotation={[0.25, 0, 0]}>
          <torusGeometry args={[0.26, 0.07, 8, 18]} />
        </mesh>
        <mesh castShadow position={[0.14, -0.28, 0.1]} material={materials.gold}>
          <boxGeometry args={[0.12, 0.42, 0.08]} />
        </mesh>
      </group>
    );
  }
  if (accessory === "vest") {
    return (
      <mesh castShadow position={[0, chestY, faceZ * 0.35]} material={materials.dark}>
        <boxGeometry args={[0.7, 0.55, 0.32]} />
      </mesh>
    );
  }
  if (accessory === "sash") {
    return (
      <mesh
        castShadow
        position={[0.06, chestY, faceZ]}
        rotation={[0, 0, -0.55]}
        material={materials.gold}
      >
        <boxGeometry args={[0.85, 0.14, 0.06]} />
      </mesh>
    );
  }
  return null;
}

/** Harbor local — money mascot with a fixed form + palette. */
export function HarborNpcMesh({
  coat,
  pants,
  skin,
  pose = "stand",
  form = "coin",
  character,
  glyph,
}: {
  coat?: string;
  pants?: string;
  skin?: string;
  pose?: "stand" | "run" | "wave" | "talk" | "nod" | "cheer" | "point";
  form?: MoneyForm;
  character?: CapitalCharacter | null;
  glyph?: string;
}) {
  return (
    <VoyagerMesh
      coatColor={coat}
      pantColor={pants}
      skinColor={skin}
      pose={pose}
      scale={0.95}
      character={character ?? null}
      form={form}
      glyph={glyph}
    />
  );
}
