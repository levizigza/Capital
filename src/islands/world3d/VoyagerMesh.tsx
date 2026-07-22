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
  /** seated on carpet vs walking */
  pose?: "stand" | "sit" | "run";
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
      if (group.current) group.current.position.y = Math.abs(Math.sin(t * 10)) * 0.03;
    } else if (pose === "sit") {
      if (legL.current && legR.current) {
        legL.current.rotation.x = -1.15;
        legR.current.rotation.x = -1.15;
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
        armL.current.rotation.x = Math.sin(t * 1.4) * 0.05;
        armR.current.rotation.x = -Math.sin(t * 1.4) * 0.05;
      }
      if (group.current) group.current.position.y = Math.sin(t * 2) * 0.02;
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

        {accessory === "cap" ? (
          <group position={[0, isCoin ? 1.45 : isPiggy ? 1.4 : 1.55, 0]}>
            <mesh castShadow material={materials.dark}>
              <cylinderGeometry args={[0.16, 0.18, 0.14, 12]} />
            </mesh>
            <mesh castShadow position={[0, 0.1, 0]} material={materials.dark}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 12]} />
            </mesh>
          </group>
        ) : null}
        {accessory === "goggles" ? (
          <mesh
            castShadow
            position={[0.18, isPiggy ? 1.0 : 1.25, isBill || isBook ? 0.12 : 0.2]}
            material={materials.gold}
          >
            <torusGeometry args={[0.09, 0.025, 6, 14]} />
          </mesh>
        ) : null}
        {accessory === "bandana" ? (
          <mesh castShadow position={[0, isPiggy ? 0.7 : 0.55, 0.2]} material={materials.gold}>
            <boxGeometry args={[0.22, 0.1, 0.08]} />
          </mesh>
        ) : null}
        {accessory === "headset" ? (
          <>
            <mesh castShadow position={[-0.42, 1.15, 0]} material={materials.ink}>
              <sphereGeometry args={[0.09, 10, 8]} />
            </mesh>
            <mesh castShadow position={[0.42, 1.15, 0]} material={materials.ink}>
              <sphereGeometry args={[0.09, 10, 8]} />
            </mesh>
          </>
        ) : null}
        {accessory === "lantern" ? (
          <mesh castShadow position={[0.35, 1.35, 0.15]} material={materials.gold}>
            <octahedronGeometry args={[0.1, 0]} />
          </mesh>
        ) : null}
        {accessory === "cape" ? (
          <mesh
            castShadow
            position={[0, isPiggy ? 0.95 : 1.05, -0.28]}
            rotation={[0.35, 0, 0]}
            material={materials.ink}
          >
            <boxGeometry args={[0.7, 0.85, 0.06]} />
          </mesh>
        ) : null}
        {accessory === "scarf" ? (
          <group position={[0, isPiggy ? 1.15 : 1.28, 0.12]}>
            <mesh castShadow material={materials.gold} rotation={[0.2, 0, 0]}>
              <torusGeometry args={[0.22, 0.05, 6, 16]} />
            </mesh>
            <mesh castShadow position={[0.12, -0.22, 0.08]} material={materials.gold}>
              <boxGeometry args={[0.1, 0.35, 0.06]} />
            </mesh>
          </group>
        ) : null}
        {accessory === "vest" ? (
          <mesh castShadow position={[0, isPiggy ? 0.85 : 0.95, 0.08]} material={materials.dark}>
            <boxGeometry args={[0.55, 0.45, 0.28]} />
          </mesh>
        ) : null}
        {accessory === "sash" ? (
          <mesh
            castShadow
            position={[0.05, isPiggy ? 0.85 : 0.95, 0.18]}
            rotation={[0, 0, -0.55]}
            material={materials.gold}
          >
            <boxGeometry args={[0.7, 0.1, 0.05]} />
          </mesh>
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
  pose?: "stand" | "run";
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
