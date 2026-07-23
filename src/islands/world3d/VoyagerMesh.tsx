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
import { getEraLook3D } from "./eraLooks";
import type { AnimationStyleId } from "../animationStyles";

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
  /** Island decade lens — remaps materials without changing identity */
  animationStyle?: AnimationStyleId | string;
};

function eraMaterialProps(styleId?: AnimationStyleId | string): {
  roughness: number;
  metalness: number;
  flatShading: boolean;
  wireframe: boolean;
  emissive?: string;
  emissiveIntensity?: number;
} {
  const look = getEraLook3D(styleId);
  switch (look.shading) {
    case "vector":
      // Soft chalk glow — not pure white wash that dissolves into the sky
      return {
        roughness: 0.92,
        metalness: 0,
        flatShading: true,
        wireframe: false,
        emissive: "#fef3c7",
        emissiveIntensity: 0.12,
      };
    case "wire":
      // Keep silhouette solid; light wire accent only via outline, not full wire body
      return {
        roughness: 0.45,
        metalness: 0.15,
        flatShading: true,
        wireframe: false,
        emissive: look.accent,
        emissiveIntensity: 0.22,
      };
    case "neon":
      return { roughness: 0.25, metalness: 0.45, flatShading: true, wireframe: false, emissive: look.accent, emissiveIntensity: 0.35 };
    case "lowpoly":
      return { roughness: 0.7, metalness: 0.05, flatShading: true, wireframe: false };
    case "glossy":
      return { roughness: 0.28, metalness: 0.35, flatShading: false, wireframe: false };
    case "cinematic":
      return { roughness: 0.62, metalness: 0.12, flatShading: false, wireframe: false };
    case "painterly":
      return { roughness: 0.55, metalness: 0.08, flatShading: false, wireframe: false };
    default:
      return { roughness: 0.55, metalness: 0.08, flatShading: false, wireframe: false };
  }
}

/**
 * Anthropomorphic money mascot — the People of Capital.
 * Wacky kids-game cast for Fortune Archipelago. Procedural, no human faces.
 * Optional animationStyle remaps materials into the island's decade lens.
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
  animationStyle,
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

  const materials = useMemo(() => {
    const eraMat = eraMaterialProps(animationStyle);
    const look = getEraLook3D(animationStyle);
    // Ledgerlight: coat color always wins — people must not dissolve into the decade land
    const bodyColor = hex;
    const inkColor =
      look.shading === "vector" ? "#0f172a" : look.shading === "wire" ? "#052e16" : pantColor;
    const paperColor =
      look.shading === "vector" || look.shading === "wire" ? "#fef3c7" : skinColor;
    const eyeColor = look.shading === "vector" || look.shading === "wire" ? "#0c1622" : "#16283b";
    return {
      body: new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness:
          eraMat.roughness ??
          (bodyForm === "coin" || bodyForm === "ancient" || bodyForm === "crypto" || bodyForm === "ingot"
            ? 0.35
            : 0.55),
        metalness:
          eraMat.metalness ??
          (bodyForm === "coin" || bodyForm === "ancient" || bodyForm === "crypto" || bodyForm === "ingot"
            ? 0.55
            : 0.08),
        flatShading: eraMat.flatShading,
        wireframe: eraMat.wireframe,
        emissive: eraMat.emissive ?? "#000000",
        emissiveIntensity: eraMat.emissiveIntensity ?? 0,
      }),
      ink: new THREE.MeshStandardMaterial({
        color: inkColor,
        roughness: 0.7,
        wireframe: false,
        flatShading: eraMat.flatShading,
      }),
      paper: new THREE.MeshStandardMaterial({
        color: paperColor,
        roughness: 0.75,
        wireframe: false,
        flatShading: eraMat.flatShading,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: "#f4a629",
        roughness: 0.35,
        metalness: 0.45,
        wireframe: false,
        flatShading: eraMat.flatShading,
        emissive: look.shading === "wire" || look.shading === "vector" ? "#fbbf24" : "#000000",
        emissiveIntensity: look.shading === "wire" || look.shading === "vector" ? 0.2 : 0,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#0c1622",
        roughness: 0.55,
        wireframe: false,
      }),
      eye: new THREE.MeshStandardMaterial({
        color: eyeColor,
        roughness: 0.35,
        wireframe: false,
      }),
      blush: new THREE.MeshStandardMaterial({ color: "#fb7185", roughness: 0.6, wireframe: false }),
      pink: new THREE.MeshStandardMaterial({ color: "#fda4af", roughness: 0.55, wireframe: false }),
    };
  }, [hex, pantColor, skinColor, bodyForm, animationStyle]);

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
  const look = getEraLook3D(animationStyle);
  const needsPop = look.shading === "vector" || look.shading === "wire" || look.skyMode === "void";

  return (
    <group ref={group} scale={scale}>
      {/* Soft contact disc — separates Money People from decade/void ground */}
      {needsPop ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <circleGeometry args={[0.55, 20]} />
          <meshStandardMaterial
            color="#0c1622"
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      ) : null}
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

        {/* Gear — form-aware landmarks so every accessory sits on the body honestly */}
        {accessory !== "none" ? (
          <GearAttach accessory={accessory} form={bodyForm} materials={materials} />
        ) : null}

        {companion !== "none" ? (
          <CompanionAttach companion={companion} form={bodyForm} materials={materials} />
        ) : null}
      </group>
    </group>
  );
}

type GearMats = {
  body: THREE.MeshStandardMaterial;
  ink: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  pink: THREE.MeshStandardMaterial;
};

/** Per-body landmarks for Outfitter gear (eye / neck / crown / torso / hand). */
function gearLandmarks(form: MoneyForm): {
  crownY: number;
  eyeY: number;
  eyeX: number;
  eyeZ: number;
  neckY: number;
  neckZ: number;
  earX: number;
  headR: number;
  torsoY: number;
  torsoW: number;
  torsoH: number;
  torsoD: number;
  handX: number;
  handY: number;
  handZ: number;
  backZ: number;
} {
  switch (form) {
    case "piggy":
      return {
        crownY: 1.3, eyeY: 1.04, eyeX: 0.22, eyeZ: 0.42, neckY: 0.9, neckZ: 0.3,
        earX: 0.42, headR: 0.42, torsoY: 0.62, torsoW: 0.78, torsoH: 0.5, torsoD: 0.55,
        handX: 0.52, handY: 0.72, handZ: 0.18, backZ: -0.42,
      };
    case "coin":
    case "signal":
    case "ancient":
      return {
        crownY: 1.34, eyeY: 1.12, eyeX: 0.17, eyeZ: 0.14, neckY: 0.86, neckZ: 0.1,
        earX: 0.38, headR: 0.38, torsoY: 0.55, torsoW: 0.55, torsoH: 0.55, torsoD: 0.22,
        handX: 0.42, handY: 0.7, handZ: 0.12, backZ: -0.2,
      };
    case "bill":
    case "wave":
      return {
        crownY: 1.44, eyeY: 1.2, eyeX: 0.24, eyeZ: 0.12, neckY: 0.7, neckZ: 0.1,
        earX: 0.44, headR: 0.36, torsoY: 0.48, torsoW: 0.72, torsoH: 0.7, torsoD: 0.18,
        handX: 0.48, handY: 0.65, handZ: 0.1, backZ: -0.16,
      };
    case "ledger":
    case "scroll":
      return {
        crownY: 1.42, eyeY: 1.16, eyeX: 0.2, eyeZ: 0.16, neckY: 0.76, neckZ: 0.14,
        earX: 0.4, headR: 0.36, torsoY: 0.5, torsoW: 0.62, torsoH: 0.65, torsoD: 0.28,
        handX: 0.46, handY: 0.68, handZ: 0.12, backZ: -0.24,
      };
    case "bag":
      return {
        crownY: 1.36, eyeY: 1.1, eyeX: 0.2, eyeZ: 0.34, neckY: 0.88, neckZ: 0.24,
        earX: 0.42, headR: 0.42, torsoY: 0.58, torsoW: 0.72, torsoH: 0.55, torsoD: 0.5,
        handX: 0.5, handY: 0.7, handZ: 0.2, backZ: -0.4,
      };
    case "vault":
    case "chest":
    case "safe":
      return {
        crownY: 1.16, eyeY: 0.96, eyeX: 0.22, eyeZ: 0.3, neckY: 0.7, neckZ: 0.24,
        earX: 0.38, headR: 0.36, torsoY: 0.48, torsoW: 0.7, torsoH: 0.55, torsoD: 0.48,
        handX: 0.48, handY: 0.58, handZ: 0.22, backZ: -0.38,
      };
    case "card":
    case "wallet":
      return {
        crownY: 1.22, eyeY: 1.02, eyeX: 0.18, eyeZ: 0.16, neckY: 0.74, neckZ: 0.14,
        earX: 0.34, headR: 0.32, torsoY: 0.5, torsoW: 0.58, torsoH: 0.55, torsoD: 0.2,
        handX: 0.4, handY: 0.62, handZ: 0.1, backZ: -0.18,
      };
    case "currency":
    case "receipt":
      return {
        crownY: 1.4, eyeY: 1.14, eyeX: 0.2, eyeZ: 0.16, neckY: 0.84, neckZ: 0.14,
        earX: 0.38, headR: 0.36, torsoY: 0.55, torsoW: 0.6, torsoH: 0.55, torsoD: 0.22,
        handX: 0.44, handY: 0.68, handZ: 0.12, backZ: -0.2,
      };
    case "cloud":
    case "globe":
      return {
        crownY: 1.42, eyeY: 1.14, eyeX: 0.22, eyeZ: 0.38, neckY: 0.86, neckZ: 0.28,
        earX: 0.44, headR: 0.44, torsoY: 0.58, torsoW: 0.8, torsoH: 0.55, torsoD: 0.55,
        handX: 0.52, handY: 0.7, handZ: 0.22, backZ: -0.44,
      };
    default:
      return {
        crownY: 1.4, eyeY: 1.14, eyeX: 0.2, eyeZ: 0.24, neckY: 0.88, neckZ: 0.18,
        earX: 0.4, headR: 0.38, torsoY: 0.55, torsoW: 0.65, torsoH: 0.55, torsoD: 0.35,
        handX: 0.48, handY: 0.7, handZ: 0.14, backZ: -0.3,
      };
  }
}

/** Readable outfit gear for every mascot silhouette (Outfitter + plaza Voyager). */
function GearAttach({
  accessory,
  form,
  materials,
}: {
  accessory: string;
  form: MoneyForm;
  materials: GearMats;
}) {
  const L = gearLandmarks(form);
  const monocleR = Math.max(0.08, L.headR * 0.26);
  const cupR = Math.max(0.1, L.headR * 0.36);

  // Top Hat — tall crown seated on the head, brim at crown line
  if (accessory === "cap") {
    const brim = L.headR * 0.95;
    const crown = L.headR * 0.55;
    return (
      <group position={[0, L.crownY, 0]}>
        <mesh castShadow position={[0, 0.02, 0]} material={materials.dark}>
          <cylinderGeometry args={[brim, brim, 0.05, 18]} />
        </mesh>
        <mesh castShadow position={[0, 0.22, 0]} material={materials.dark}>
          <cylinderGeometry args={[crown, crown * 1.05, 0.36, 16]} />
        </mesh>
        <mesh castShadow position={[0, 0.08, 0]} material={materials.pink}>
          <torusGeometry args={[crown * 1.02, 0.028, 8, 18]} />
        </mesh>
        <mesh castShadow position={[0, 0.42, 0]} material={materials.gold}>
          <sphereGeometry args={[0.05, 10, 8]} />
        </mesh>
      </group>
    );
  }

  // Gold Monocle — right eye, chain toward temple
  if (accessory === "goggles") {
    return (
      <group position={[L.eyeX, L.eyeY, L.eyeZ + 0.02]}>
        <mesh castShadow material={materials.gold}>
          <torusGeometry args={[monocleR, monocleR * 0.28, 8, 20]} />
        </mesh>
        <mesh material={materials.gold} position={[0, 0, 0.012]} rotation={[0, 0, 0]}>
          <circleGeometry args={[monocleR * 0.72, 18]} />
        </mesh>
        <mesh
          castShadow
          position={[-monocleR * 0.85, -monocleR * 0.35, 0]}
          rotation={[0.15, 0.2, 0.55]}
          material={materials.gold}
        >
          <capsuleGeometry args={[0.012, monocleR * 1.1, 4, 6]} />
        </mesh>
      </group>
    );
  }

  // Bow Tie — collar knot centered on neck
  if (accessory === "bandana") {
    const w = Math.max(0.22, L.torsoW * 0.38);
    return (
      <group position={[0, L.neckY + 0.02, L.neckZ + 0.04]}>
        <mesh castShadow material={materials.pink} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[w * 0.45, 0.09, 0.07]} />
        </mesh>
        <mesh castShadow position={[-w * 0.42, -0.01, 0.01]} rotation={[0, 0, 0.5]} material={materials.pink}>
          <boxGeometry args={[w * 0.55, 0.11, 0.05]} />
        </mesh>
        <mesh castShadow position={[w * 0.42, -0.01, 0.01]} rotation={[0, 0, -0.5]} material={materials.pink}>
          <boxGeometry args={[w * 0.55, 0.11, 0.05]} />
        </mesh>
        <mesh castShadow position={[0, -0.015, 0.045]} material={materials.gold}>
          <sphereGeometry args={[0.038, 10, 8]} />
        </mesh>
      </group>
    );
  }

  // Signal Phones — band over crown, cups on ears, mic boom
  if (accessory === "headset") {
    const earY = L.eyeY;
    const bandY = L.crownY + L.headR * 0.05;
    const earZ = Math.min(0.12, Math.abs(L.eyeZ) * 0.4);
    return (
      <group>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]} position={[0, bandY, 0]} material={materials.dark}>
          <torusGeometry args={[L.headR * 0.98, 0.04, 8, 24, Math.PI]} />
        </mesh>
        {([-1, 1] as const).map((side) => (
          <group key={side} position={[side * L.earX, earY, earZ]}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]} material={materials.ink}>
              <cylinderGeometry args={[cupR, cupR, 0.1, 16]} />
            </mesh>
            <mesh position={[side * 0.04, 0, 0.02]} material={materials.pink}>
              <circleGeometry args={[cupR * 0.72, 16]} />
            </mesh>
          </group>
        ))}
        <mesh
          castShadow
          position={[L.earX * 0.55, earY - cupR * 1.1, earZ + 0.1]}
          rotation={[0.55, 0.4, 0.08]}
          material={materials.dark}
        >
          <capsuleGeometry args={[0.018, 0.16, 4, 8]} />
        </mesh>
        <mesh castShadow position={[L.earX * 0.32, earY - cupR * 1.7, earZ + 0.16]} material={materials.gold}>
          <sphereGeometry args={[0.035, 10, 8]} />
        </mesh>
      </group>
    );
  }

  // Sparkle Stamp — floats by the raised hand / shoulder, not inside the skull
  if (accessory === "lantern") {
    return (
      <group position={[L.handX, L.handY + 0.08, L.handZ]}>
        <mesh castShadow material={materials.gold}>
          <octahedronGeometry args={[0.11, 0]} />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 4]} material={materials.pink}>
          <octahedronGeometry args={[0.055, 0]} />
        </mesh>
        <pointLight color="#fbbf24" intensity={0.55} distance={2.2} />
      </group>
    );
  }

  // Fortune Cape — draped from shoulders down the back
  if (accessory === "cape") {
    return (
      <group position={[0, L.neckY - 0.05, L.backZ]}>
        <mesh castShadow position={[0, -L.torsoH * 0.35, -0.02]} rotation={[0.35, 0, 0]} material={materials.ink}>
          <boxGeometry args={[L.torsoW * 1.15, L.torsoH * 1.35, 0.06]} />
        </mesh>
        <mesh castShadow position={[0, 0.02, 0.02]} material={materials.gold}>
          <boxGeometry args={[L.torsoW * 0.55, 0.06, 0.05]} />
        </mesh>
      </group>
    );
  }

  // Ledger Scarf — loop at neck with dangling end
  if (accessory === "scarf") {
    const loop = Math.max(0.18, L.headR * 0.62);
    return (
      <group position={[0, L.neckY + 0.02, L.neckZ * 0.55]}>
        <mesh castShadow material={materials.gold} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[loop, 0.055, 8, 20]} />
        </mesh>
        <mesh castShadow position={[loop * 0.55, -loop * 1.15, 0.06]} material={materials.gold}>
          <boxGeometry args={[0.09, loop * 1.5, 0.06]} />
        </mesh>
        <mesh castShadow position={[loop * 0.55, -loop * 1.9, 0.06]} material={materials.pink}>
          <boxGeometry args={[0.1, 0.05, 0.065]} />
        </mesh>
      </group>
    );
  }

  // Market Vest — torso plate with open front notch
  if (accessory === "vest") {
    return (
      <group position={[0, L.torsoY, L.neckZ * 0.25]}>
        <mesh castShadow material={materials.dark}>
          <boxGeometry args={[L.torsoW * 0.95, L.torsoH * 0.85, L.torsoD * 0.75]} />
        </mesh>
        <mesh position={[0, L.torsoH * 0.12, L.torsoD * 0.38]} material={materials.gold}>
          <boxGeometry args={[0.06, L.torsoH * 0.55, 0.02]} />
        </mesh>
        <mesh position={[-L.torsoW * 0.28, L.torsoH * 0.05, L.torsoD * 0.38]} material={materials.gold}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
        <mesh position={[L.torsoW * 0.28, L.torsoH * 0.05, L.torsoD * 0.38]} material={materials.gold}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      </group>
    );
  }

  // Seal Sash — diagonal across the chest
  if (accessory === "sash") {
    return (
      <group position={[0, L.torsoY + 0.05, L.torsoD * 0.35]}>
        <mesh
          castShadow
          rotation={[0.1, 0, -0.65]}
          material={materials.gold}
        >
          <boxGeometry args={[L.torsoW * 1.25, 0.12, 0.05]} />
        </mesh>
        <mesh position={[L.torsoW * 0.35, -L.torsoH * 0.25, 0.04]} material={materials.pink}>
          <sphereGeometry args={[0.055, 10, 8]} />
        </mesh>
      </group>
    );
  }
  return null;
}

/** Distinct companion silhouettes so pets read as pets, not gold blobs. */
function CompanionAttach({
  companion,
  form,
  materials,
}: {
  companion: string;
  form: MoneyForm;
  materials: GearMats;
}) {
  const L = gearLandmarks(form);
  const base: [number, number, number] = [L.handX + 0.08, 0.22, L.handZ + 0.08];

  if (companion === "tortoise") {
    return (
      <group position={base}>
        <mesh castShadow position={[0, 0.06, 0]} material={materials.ink}>
          <sphereGeometry args={[0.11, 10, 8]} />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0]} material={materials.gold}>
          <sphereGeometry args={[0.13, 10, 8]} />
        </mesh>
        <mesh castShadow position={[0.1, 0.08, 0.06]} material={materials.pink}>
          <sphereGeometry args={[0.05, 8, 6]} />
        </mesh>
      </group>
    );
  }
  if (companion === "finch") {
    return (
      <group position={[base[0], base[1] + 0.35, base[2]]}>
        <mesh castShadow material={materials.pink}>
          <sphereGeometry args={[0.08, 10, 8]} />
        </mesh>
        <mesh castShadow position={[0.07, 0, 0.02]} rotation={[0, 0, -0.4]} material={materials.gold}>
          <coneGeometry args={[0.03, 0.08, 6]} />
        </mesh>
        <mesh castShadow position={[-0.02, 0.02, -0.05]} rotation={[0.4, 0, 0.3]} material={materials.ink}>
          <boxGeometry args={[0.04, 0.1, 0.02]} />
        </mesh>
      </group>
    );
  }
  if (companion === "iguana") {
    return (
      <group position={base} rotation={[0, 0.4, 0]}>
        <mesh castShadow position={[0, 0.08, 0]} material={materials.ink}>
          <capsuleGeometry args={[0.06, 0.16, 4, 8]} />
        </mesh>
        <mesh castShadow position={[0.1, 0.12, 0.04]} material={materials.gold}>
          <sphereGeometry args={[0.055, 8, 6]} />
        </mesh>
        <mesh castShadow position={[-0.1, 0.04, -0.02]} rotation={[0.3, 0, 0.5]} material={materials.pink}>
          <coneGeometry args={[0.04, 0.12, 5]} />
        </mesh>
      </group>
    );
  }
  if (companion === "otter") {
    return (
      <group position={base} rotation={[0.2, -0.3, 0]}>
        <mesh castShadow position={[0, 0.1, 0]} material={materials.dark}>
          <capsuleGeometry args={[0.055, 0.18, 4, 8]} />
        </mesh>
        <mesh castShadow position={[0.08, 0.16, 0.04]} material={materials.dark}>
          <sphereGeometry args={[0.06, 8, 6]} />
        </mesh>
        <mesh castShadow position={[0.02, 0.02, 0.08]} material={materials.gold}>
          <sphereGeometry args={[0.04, 8, 6]} />
        </mesh>
      </group>
    );
  }
  if (companion === "crab") {
    return (
      <group position={base}>
        <mesh castShadow position={[0, 0.08, 0]} material={materials.pink}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>
        <mesh castShadow position={[-0.12, 0.1, 0.04]} rotation={[0, 0, 0.6]} material={materials.gold}>
          <boxGeometry args={[0.12, 0.04, 0.04]} />
        </mesh>
        <mesh castShadow position={[0.12, 0.1, 0.04]} rotation={[0, 0, -0.6]} material={materials.gold}>
          <boxGeometry args={[0.12, 0.04, 0.04]} />
        </mesh>
      </group>
    );
  }
  return (
    <mesh castShadow position={base} material={materials.gold}>
      <sphereGeometry args={[0.12, 10, 8]} />
    </mesh>
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
  animationStyle,
  scale = 0.95,
}: {
  coat?: string;
  pants?: string;
  skin?: string;
  pose?: "stand" | "run" | "wave" | "talk" | "nod" | "cheer" | "point";
  form?: MoneyForm;
  character?: CapitalCharacter | null;
  glyph?: string;
  /** Island decade lens — must match the world (wire/vector/etc). */
  animationStyle?: AnimationStyleId | string;
  scale?: number;
}) {
  return (
    <VoyagerMesh
      coatColor={coat}
      pantColor={pants}
      skinColor={skin}
      pose={pose}
      scale={scale}
      character={character ?? null}
      form={form}
      glyph={glyph}
      animationStyle={animationStyle}
    />
  );
}
