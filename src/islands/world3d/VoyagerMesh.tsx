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
import { SafeText } from "./SafeText";
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
  const resolvedPants = pantColor ?? (character?.pants ? colorHex(character.pants) : "#1e3a5f");
  const bodyForm = form ?? moneyFormFromBase(character?.base);
  const faceGlyph = glyph ?? moneyGlyphFromBase(character?.base);
  const useExtended = (EXTENDED_MASCOT_FORMS as string[]).includes(bodyForm);

  const materials = useMemo(() => {
    const eraMat = eraMaterialProps(animationStyle);
    const look = getEraLook3D(animationStyle);
    // Ledgerlight: coat color always wins — people must not dissolve into the decade land
    const bodyColor = hex;
    const inkColor =
      look.shading === "vector" ? "#0f172a" : look.shading === "wire" ? "#052e16" : resolvedPants;
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
  }, [hex, resolvedPants, skinColor, bodyForm, animationStyle]);

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
  const isCashwell = character?.base === "cashwell";
  const isCashmere = character?.base === "cashmere";
  const isPesoPedro = character?.base === "peso_pedro";
  const isFortunaFernanda = character?.base === "fortuna_fernanda";
  const isBillionaireBao = character?.base === "billionaire_bao";
  const isJadeFortune = character?.base === "jade_fortune";
  const isSultanStacks = character?.base === "sultan_stacks";
  const isDinarDahlia = character?.base === "dinar_dahlia";
  const isMansaMoneybaggs = character?.base === "mansa_moneybaggs";
  const isKandakeKash = character?.base === "kandake_kash";
  const isMoneybaggBro = character?.base === "moneybagg_bro";
  const isMulaMami = character?.base === "mula_mami";
  const isDebtCollector = character?.base === "debt_collector";
  const isSeriesLeadFace =
    isCashwell ||
    isCashmere ||
    isPesoPedro ||
    isFortunaFernanda ||
    isBillionaireBao ||
    isJadeFortune ||
    isSultanStacks ||
    isDinarDahlia ||
    isMansaMoneybaggs ||
    isKandakeKash ||
    isMoneybaggBro ||
    isMulaMami;
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
            <mesh castShadow material={isSeriesLeadFace ? materials.gold : materials.body}>
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
            {/* Cashwell — $ pupils + handlebar mustache (series sheet) */}
            {isCashwell ? (
              <>
                <mesh position={[-0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.45} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.45} />
                </mesh>
                <mesh position={[-0.14, 0.12, 0.16]} material={materials.gold}>
                  <boxGeometry args={[0.04, 0.05, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.16]} material={materials.gold}>
                  <boxGeometry args={[0.04, 0.05, 0.01]} />
                </mesh>
                <mesh
                  position={[-0.1, -0.02, 0.12]}
                  rotation={[0, 0, 0.35]}
                  material={materials.dark}
                >
                  <capsuleGeometry args={[0.025, 0.12, 4, 6]} />
                </mesh>
                <mesh
                  position={[0.1, -0.02, 0.12]}
                  rotation={[0, 0, -0.35]}
                  material={materials.dark}
                >
                  <capsuleGeometry args={[0.025, 0.12, 4, 6]} />
                </mesh>
                <mesh position={[0, -0.12, 0.11]} material={materials.paper}>
                  <boxGeometry args={[0.16, 0.04, 0.02]} />
                </mesh>
              </>
            ) : null}
            {/* Peso Pedro — green eyes, mustache, forehead P */}
            {isPesoPedro ? (
              <>
                <mesh position={[-0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.4} />
                </mesh>
                <mesh
                  position={[-0.1, -0.04, 0.12]}
                  rotation={[0, 0, 0.4]}
                  material={materials.dark}
                >
                  <capsuleGeometry args={[0.022, 0.11, 4, 6]} />
                </mesh>
                <mesh
                  position={[0.1, -0.04, 0.12]}
                  rotation={[0, 0, -0.4]}
                  material={materials.dark}
                >
                  <capsuleGeometry args={[0.022, 0.11, 4, 6]} />
                </mesh>
                <mesh position={[0, -0.14, 0.11]} material={materials.paper}>
                  <boxGeometry args={[0.18, 0.045, 0.02]} />
                </mesh>
                <SafeText
                  position={[0, 0.28, 0.12]}
                  fontSize={0.22}
                  color="#166534"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.015}
                  outlineColor="#fde68a"
                >
                  P
                </SafeText>
              </>
            ) : null}
            {/* Mula Mami — green lashes, high bun headscarf, $ hoops */}
            {isMulaMami ? (
              <>
                <mesh position={[-0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.45} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.45} />
                </mesh>
                {/* Lashes */}
                <mesh position={[-0.14, 0.16, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.09, 0.015, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.16, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.09, 0.015, 0.01]} />
                </mesh>
                <mesh position={[-0.18, 0.14, 0.12]} rotation={[0, 0, 0.5]} material={materials.dark}>
                  <boxGeometry args={[0.04, 0.01, 0.01]} />
                </mesh>
                <mesh position={[0.18, 0.14, 0.12]} rotation={[0, 0, -0.5]} material={materials.dark}>
                  <boxGeometry args={[0.04, 0.01, 0.01]} />
                </mesh>
                <mesh position={[0, -0.08, 0.11]}>
                  <boxGeometry args={[0.1, 0.025, 0.01]} />
                  <meshStandardMaterial color="#9f1239" roughness={0.45} />
                </mesh>
                <SafeText
                  position={[0, 0.28, 0.12]}
                  fontSize={0.12}
                  color="#14532d"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.012}
                  outlineColor="#fde68a"
                >
                  MM
                </SafeText>
                {/* High bun + black headscarf */}
                <mesh castShadow position={[0, 0.48, -0.02]}>
                  <sphereGeometry args={[0.18, 12, 10]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
                </mesh>
                <mesh castShadow position={[0, 0.35, -0.05]}>
                  <sphereGeometry args={[0.26, 14, 12]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
                </mesh>
                {/* $ accents on scarf */}
                {[-0.12, 0.12].map((x, i) => (
                  <SafeText
                    key={i}
                    position={[x, 0.42, 0.18]}
                    fontSize={0.07}
                    color="#fde68a"
                    anchorX="center"
                    anchorY="middle"
                  >
                    $
                  </SafeText>
                ))}
                {/* Massive $ hoop earrings */}
                {([-1, 1] as const).map((side) => (
                  <group key={side} position={[side * 0.48, 0.05, 0.05]}>
                    <mesh castShadow material={materials.gold}>
                      <torusGeometry args={[0.1, 0.02, 8, 18]} />
                    </mesh>
                    <SafeText
                      position={[0, 0, 0.03]}
                      fontSize={0.08}
                      color="#14532d"
                      anchorX="center"
                      anchorY="middle"
                    >
                      $
                    </SafeText>
                  </group>
                ))}
              </>
            ) : null}
            {/* Moneybagg Bro — green eyes, wide grin, durag, mini $ crown */}
            {isMoneybaggBro ? (
              <>
                <mesh position={[-0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.45} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.45} />
                </mesh>
                <mesh position={[-0.14, 0.19, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.09, 0.02, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.19, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.09, 0.02, 0.01]} />
                </mesh>
                {/* Wide mischievous grin */}
                <mesh position={[0, -0.1, 0.12]} material={materials.dark}>
                  <boxGeometry args={[0.22, 0.04, 0.02]} />
                </mesh>
                <mesh position={[0, -0.1, 0.13]} material={materials.paper}>
                  <boxGeometry args={[0.16, 0.025, 0.015]} />
                </mesh>
                <SafeText
                  position={[0, 0.3, 0.12]}
                  fontSize={0.13}
                  color="#14532d"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.012}
                  outlineColor="#fde68a"
                >
                  MB
                </SafeText>
                {/* Black durag */}
                <mesh castShadow position={[0, 0.38, -0.05]}>
                  <sphereGeometry args={[0.28, 14, 12]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
                </mesh>
                <mesh castShadow position={[0, 0.2, -0.35]} rotation={[0.6, 0, 0]}>
                  <boxGeometry args={[0.12, 0.2, 0.05]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
                </mesh>
                {/* Mini $ crown on forehead */}
                <mesh castShadow position={[0, 0.42, 0.18]} material={materials.gold}>
                  <cylinderGeometry args={[0.08, 0.1, 0.06, 8]} />
                </mesh>
                <SafeText
                  position={[0, 0.42, 0.22]}
                  fontSize={0.08}
                  color="#14532d"
                  anchorX="center"
                  anchorY="middle"
                >
                  $
                </SafeText>
              </>
            ) : null}
            {/* Kandake Kash — amber eyes, braided crown, KK crest */}
            {isKandakeKash ? (
              <>
                <mesh position={[-0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#78350f" emissive="#f59e0b" emissiveIntensity={0.35} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#78350f" emissive="#f59e0b" emissiveIntensity={0.35} />
                </mesh>
                <mesh position={[-0.14, 0.17, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.018, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.17, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.018, 0.01]} />
                </mesh>
                <mesh position={[0, -0.08, 0.11]}>
                  <boxGeometry args={[0.1, 0.025, 0.01]} />
                  <meshStandardMaterial color="#9f1239" roughness={0.45} />
                </mesh>
                <SafeText
                  position={[0, 0.28, 0.12]}
                  fontSize={0.12}
                  color="#1b4332"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.012}
                  outlineColor="#fde68a"
                >
                  KK
                </SafeText>
                {/* Tall braided crown of hair */}
                <mesh castShadow position={[0, 0.42, -0.05]}>
                  <sphereGeometry args={[0.22, 12, 10]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                {[0, 1, 2, 3, 4].map((i) => {
                  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <group key={i} position={[Math.cos(a) * 0.16, 0.55, Math.sin(a) * 0.12]}>
                      <mesh castShadow>
                        <capsuleGeometry args={[0.045, 0.22, 4, 6]} />
                        <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                      </mesh>
                      <mesh castShadow position={[0, 0.08, 0]} material={materials.gold}>
                        <torusGeometry args={[0.05, 0.012, 6, 10]} />
                      </mesh>
                      {i % 2 === 0 ? (
                        <mesh castShadow position={[0, 0.16, 0]}>
                          <octahedronGeometry args={[0.03, 0]} />
                          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.4} />
                        </mesh>
                      ) : null}
                    </group>
                  );
                })}
                {/* Wide gold collar */}
                <mesh castShadow position={[0, -0.32, 0.08]} material={materials.gold}>
                  <torusGeometry args={[0.22, 0.04, 8, 16]} />
                </mesh>
                <mesh castShadow position={[0, -0.32, 0.1]}>
                  <octahedronGeometry args={[0.04, 0]} />
                  <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.4} />
                </mesh>
                {/* Disc earrings */}
                <mesh castShadow position={[-0.42, 0.05, 0.05]} material={materials.gold}>
                  <cylinderGeometry args={[0.07, 0.07, 0.02, 14]} />
                </mesh>
                <mesh castShadow position={[0.42, 0.05, 0.05]} material={materials.gold}>
                  <cylinderGeometry args={[0.07, 0.07, 0.02, 14]} />
                </mesh>
              </>
            ) : null}
            {/* Mansa Moneybaggs — gold mask, full beard, M crest */}
            {isMansaMoneybaggs ? (
              <>
                <mesh position={[-0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#1b4332" emissive="#22c55e" emissiveIntensity={0.35} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#1b4332" emissive="#22c55e" emissiveIntensity={0.35} />
                </mesh>
                {/* Golden upper-face mask */}
                <mesh castShadow position={[0, 0.14, 0.1]} material={materials.gold}>
                  <boxGeometry args={[0.42, 0.22, 0.04]} />
                </mesh>
                <mesh position={[-0.14, 0.12, 0.13]} material={materials.gold}>
                  <torusGeometry args={[0.055, 0.012, 6, 12]} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.13]} material={materials.gold}>
                  <torusGeometry args={[0.055, 0.012, 6, 12]} />
                </mesh>
                {/* Full black beard */}
                <mesh castShadow position={[0, -0.18, 0.08]}>
                  <sphereGeometry args={[0.2, 12, 10]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
                </mesh>
                <mesh castShadow position={[-0.12, -0.28, 0.06]}>
                  <capsuleGeometry args={[0.06, 0.12, 4, 6]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
                </mesh>
                <mesh castShadow position={[0.12, -0.28, 0.06]}>
                  <capsuleGeometry args={[0.06, 0.12, 4, 6]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
                </mesh>
                <SafeText
                  position={[0, 0.32, 0.12]}
                  fontSize={0.2}
                  color="#1b4332"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.014}
                  outlineColor="#fde68a"
                >
                  M
                </SafeText>
              </>
            ) : null}
            {/* Dinar Dahlia — emerald eyes, dark waves, crown, DD crest */}
            {isDinarDahlia ? (
              <>
                <mesh position={[-0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#0b3d2e" emissive="#10b981" emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#0b3d2e" emissive="#10b981" emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[-0.14, 0.17, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.018, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.17, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.018, 0.01]} />
                </mesh>
                <mesh position={[0, -0.08, 0.11]}>
                  <boxGeometry args={[0.1, 0.025, 0.01]} />
                  <meshStandardMaterial color="#9f1239" roughness={0.45} />
                </mesh>
                <SafeText
                  position={[0, 0.28, 0.12]}
                  fontSize={0.13}
                  color="#0b3d2e"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.012}
                  outlineColor="#fde68a"
                >
                  DD
                </SafeText>
                {/* Dark wavy hair */}
                <mesh castShadow position={[0, 0.36, -0.1]}>
                  <sphereGeometry args={[0.24, 12, 10]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                <mesh castShadow position={[-0.3, 0.15, -0.08]}>
                  <capsuleGeometry args={[0.09, 0.28, 4, 6]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                <mesh castShadow position={[0.3, 0.15, -0.08]}>
                  <capsuleGeometry args={[0.09, 0.28, 4, 6]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                {/* Emerald crown */}
                <mesh castShadow position={[0, 0.52, 0]} material={materials.gold}>
                  <cylinderGeometry args={[0.22, 0.26, 0.1, 12]} />
                </mesh>
                {[0, 1, 2, 3, 4].map((i) => {
                  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <mesh
                      key={i}
                      castShadow
                      position={[Math.cos(a) * 0.18, 0.6, Math.sin(a) * 0.18]}
                      material={materials.gold}
                    >
                      <coneGeometry args={[0.035, 0.1, 5]} />
                    </mesh>
                  );
                })}
                <mesh castShadow position={[0, 0.58, 0.2]}>
                  <octahedronGeometry args={[0.05, 0]} />
                  <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.45} />
                </mesh>
              </>
            ) : null}
            {/* Sultan Stacks — emerald eyes, handlebar mustache, goatee, $ crest */}
            {isSultanStacks ? (
              <>
                <mesh position={[-0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.11]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[-0.14, 0.18, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.09, 0.02, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.18, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.09, 0.02, 0.01]} />
                </mesh>
                <mesh
                  position={[-0.1, -0.02, 0.12]}
                  rotation={[0, 0, 0.4]}
                  material={materials.dark}
                >
                  <capsuleGeometry args={[0.025, 0.13, 4, 6]} />
                </mesh>
                <mesh
                  position={[0.1, -0.02, 0.12]}
                  rotation={[0, 0, -0.4]}
                  material={materials.dark}
                >
                  <capsuleGeometry args={[0.025, 0.13, 4, 6]} />
                </mesh>
                <mesh position={[0, -0.14, 0.12]} material={materials.dark}>
                  <capsuleGeometry args={[0.02, 0.08, 4, 6]} />
                </mesh>
                <SafeText
                  position={[0, 0.3, 0.12]}
                  fontSize={0.2}
                  color="#064e3b"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.014}
                  outlineColor="#fde68a"
                >
                  $
                </SafeText>
              </>
            ) : null}
            {/* Jade Fortune — green eyes, square-hole coin, jade updo */}
            {isJadeFortune ? (
              <>
                <mesh position={[-0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                  <meshStandardMaterial color="#065f46" emissive="#10b981" emissiveIntensity={0.35} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                  <meshStandardMaterial color="#065f46" emissive="#10b981" emissiveIntensity={0.35} />
                </mesh>
                <mesh position={[-0.14, 0.16, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.07, 0.015, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.16, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.07, 0.015, 0.01]} />
                </mesh>
                <mesh position={[0, -0.08, 0.11]} material={materials.blush}>
                  <boxGeometry args={[0.08, 0.02, 0.01]} />
                </mesh>
                {/* Ancient coin square hole */}
                <mesh position={[0, 0.26, 0.1]} material={materials.dark}>
                  <boxGeometry args={[0.1, 0.1, 0.04]} />
                </mesh>
                {/* Updo + hairpins */}
                <mesh castShadow position={[0, 0.42, -0.05]}>
                  <sphereGeometry args={[0.2, 12, 10]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                <mesh castShadow position={[-0.22, 0.48, 0]} material={materials.gold}>
                  <capsuleGeometry args={[0.015, 0.16, 3, 5]} />
                </mesh>
                <mesh castShadow position={[0.22, 0.48, 0]}>
                  <capsuleGeometry args={[0.015, 0.16, 3, 5]} />
                  <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.3} />
                </mesh>
                <mesh castShadow position={[0, 0.55, 0.02]} material={materials.gold}>
                  <sphereGeometry args={[0.04, 8, 6]} />
                </mesh>
              </>
            ) : null}
            {/* Billionaire Bao — amber eyes, BB crest, swept black hair */}
            {isBillionaireBao ? (
              <>
                <mesh position={[-0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                  <meshStandardMaterial color="#78350f" emissive="#b45309" emissiveIntensity={0.25} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.11]}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                  <meshStandardMaterial color="#78350f" emissive="#b45309" emissiveIntensity={0.25} />
                </mesh>
                <mesh position={[-0.14, 0.16, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.02, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.16, 0.115]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.02, 0.01]} />
                </mesh>
                <mesh position={[0, -0.08, 0.11]} material={materials.blush}>
                  <boxGeometry args={[0.08, 0.02, 0.01]} />
                </mesh>
                <SafeText
                  position={[0, 0.28, 0.12]}
                  fontSize={0.14}
                  color="#052e16"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.012}
                  outlineColor="#fde68a"
                >
                  BB
                </SafeText>
                {/* Swept black hair */}
                <mesh castShadow position={[0, 0.38, -0.08]}>
                  <sphereGeometry args={[0.22, 12, 10]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                <mesh castShadow position={[-0.28, 0.2, -0.12]}>
                  <capsuleGeometry args={[0.08, 0.18, 4, 6]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
                <mesh castShadow position={[0.28, 0.2, -0.12]}>
                  <capsuleGeometry args={[0.08, 0.18, 4, 6]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.65} />
                </mesh>
              </>
            ) : null}
            {/* Fortuna Fernanda — lashes, dark curls, rose crown */}
            {isFortunaFernanda ? (
              <>
                <mesh position={[-0.14, 0.12, 0.11]} material={materials.eye}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.11]} material={materials.eye}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                </mesh>
                <mesh position={[-0.14, 0.175, 0.12]} rotation={[0, 0, 0.25]} material={materials.dark}>
                  <boxGeometry args={[0.085, 0.012, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.175, 0.12]} rotation={[0, 0, -0.25]} material={materials.dark}>
                  <boxGeometry args={[0.085, 0.012, 0.01]} />
                </mesh>
                <mesh position={[0, -0.06, 0.11]} material={materials.blush}>
                  <boxGeometry args={[0.1, 0.025, 0.01]} />
                </mesh>
                {/* Dark curls */}
                <mesh castShadow position={[-0.4, 0.02, -0.06]}>
                  <sphereGeometry args={[0.17, 10, 8]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.7} />
                </mesh>
                <mesh castShadow position={[0.4, 0.02, -0.06]}>
                  <sphereGeometry args={[0.17, 10, 8]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.7} />
                </mesh>
                <mesh castShadow position={[-0.36, -0.22, -0.1]}>
                  <capsuleGeometry args={[0.09, 0.2, 4, 6]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.7} />
                </mesh>
                <mesh castShadow position={[0.36, -0.22, -0.1]}>
                  <capsuleGeometry args={[0.09, 0.2, 4, 6]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.7} />
                </mesh>
                {/* Rose crown */}
                {[
                  [-0.16, 0.42, 0.05],
                  [0.02, 0.48, 0.02],
                  [0.18, 0.42, 0.05],
                  [-0.05, 0.4, 0.12],
                ].map((p, i) => (
                  <mesh key={i} castShadow position={p as [number, number, number]}>
                    <sphereGeometry args={[0.07, 10, 8]} />
                    <meshStandardMaterial
                      color={i % 2 === 0 ? "#b91c1c" : "#fbbf24"}
                      roughness={0.45}
                      metalness={i % 2 === 0 ? 0.1 : 0.4}
                    />
                  </mesh>
                ))}
                {/* $ earrings */}
                <SafeText
                  position={[-0.42, 0.02, 0.1]}
                  fontSize={0.1}
                  color="#fbbf24"
                  anchorX="center"
                  anchorY="middle"
                >
                  $
                </SafeText>
                <SafeText
                  position={[0.42, 0.02, 0.1]}
                  fontSize={0.1}
                  color="#fbbf24"
                  anchorX="center"
                  anchorY="middle"
                >
                  $
                </SafeText>
              </>
            ) : null}
            {/* Cashmere Couture — lashes, blonde waves, cocktail hat, pearls */}
            {isCashmere ? (
              <>
                <mesh position={[-0.14, 0.12, 0.11]} material={materials.eye}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                </mesh>
                <mesh position={[0.14, 0.12, 0.11]} material={materials.eye}>
                  <sphereGeometry args={[0.065, 10, 8]} />
                </mesh>
                <mesh position={[-0.14, 0.175, 0.12]} rotation={[0, 0, 0.2]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.012, 0.01]} />
                </mesh>
                <mesh position={[0.14, 0.175, 0.12]} rotation={[0, 0, -0.2]} material={materials.dark}>
                  <boxGeometry args={[0.08, 0.012, 0.01]} />
                </mesh>
                <mesh position={[0, -0.06, 0.11]} material={materials.blush}>
                  <boxGeometry args={[0.1, 0.025, 0.01]} />
                </mesh>
                {/* Blonde waves */}
                <mesh castShadow position={[-0.42, 0.05, -0.05]} material={materials.gold}>
                  <sphereGeometry args={[0.16, 10, 8]} />
                </mesh>
                <mesh castShadow position={[0.42, 0.05, -0.05]} material={materials.gold}>
                  <sphereGeometry args={[0.16, 10, 8]} />
                </mesh>
                <mesh castShadow position={[-0.38, -0.2, -0.08]} material={materials.gold}>
                  <capsuleGeometry args={[0.08, 0.22, 4, 6]} />
                </mesh>
                <mesh castShadow position={[0.38, -0.2, -0.08]} material={materials.gold}>
                  <capsuleGeometry args={[0.08, 0.22, 4, 6]} />
                </mesh>
                {/* Cocktail hat + veil */}
                <mesh castShadow position={[0.12, 0.42, 0.05]} material={materials.dark}>
                  <cylinderGeometry args={[0.14, 0.16, 0.06, 14]} />
                </mesh>
                <mesh castShadow position={[0.12, 0.48, 0.05]} material={materials.gold}>
                  <sphereGeometry args={[0.05, 8, 6]} />
                </mesh>
                <mesh position={[0.12, 0.35, 0.18]} rotation={[0.4, 0, 0]} material={materials.dark}>
                  <planeGeometry args={[0.28, 0.18]} />
                </mesh>
                {/* Pearl drops */}
                <mesh position={[-0.4, 0.0, 0.08]} material={materials.paper}>
                  <sphereGeometry args={[0.04, 8, 6]} />
                </mesh>
                <mesh position={[0.4, 0.0, 0.08]} material={materials.paper}>
                  <sphereGeometry args={[0.04, 8, 6]} />
                </mesh>
                <mesh position={[0, -0.28, 0.12]} material={materials.paper}>
                  <torusGeometry args={[0.16, 0.025, 6, 16]} />
                </mesh>
              </>
            ) : null}
            {!isSeriesLeadFace ? (
              <>
                <mesh position={[-0.14, 0.1, 0.1]} material={materials.eye}>
                  <sphereGeometry args={[0.06, 10, 8]} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.1]} material={materials.eye}>
                  <sphereGeometry args={[0.06, 10, 8]} />
                </mesh>
                <mesh position={[0, -0.08, 0.1]} material={materials.blush}>
                  <boxGeometry args={[0.12, 0.035, 0.01]} />
                </mesh>
              </>
            ) : null}
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

        {isDebtCollector ? (
          <DebtCollectorBody materials={materials} />
        ) : useExtended && !classic ? (
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
          <GearAttach
            accessory={accessory}
            form={bodyForm}
            materials={materials}
            seriesLead={
              isCashwell
                ? "cashwell"
                : isCashmere
                  ? "cashmere"
                  : isPesoPedro
                    ? "peso_pedro"
                    : isFortunaFernanda
                      ? "fortuna_fernanda"
                      : isBillionaireBao
                        ? "billionaire_bao"
                        : isJadeFortune
                          ? "jade_fortune"
                          : isSultanStacks
                            ? "sultan_stacks"
                            : isDinarDahlia
                              ? "dinar_dahlia"
                              : isMansaMoneybaggs
                                ? "mansa_moneybaggs"
                                : isKandakeKash
                                  ? "kandake_kash"
                                  : isMoneybaggBro
                                    ? "moneybagg_bro"
                                    : isMulaMami
                                      ? "mula_mami"
                                      : isDebtCollector
                                        ? "debt_collector"
                                        : null
            }
          />
        ) : null}

        {isCashwell ? <CashwellCane materials={materials} /> : null}
        {isCashmere ? <CashmereStaff materials={materials} /> : null}
        {isPesoPedro ? <PesoPedroCane materials={materials} /> : null}
        {isFortunaFernanda ? (
          <>
            <PesoPedroCane materials={materials} />
            <FortunaBillFan materials={materials} />
          </>
        ) : null}
        {isBillionaireBao ? (
          <>
            <BaoLionCane materials={materials} />
            <BaoFoldingFan materials={materials} />
          </>
        ) : null}
        {isJadeFortune ? <JadeFortuneStaff materials={materials} /> : null}
        {isSultanStacks ? (
          <>
            <SultanCoinScepter materials={materials} />
            <SultanWealthSash materials={materials} />
          </>
        ) : null}
        {isDinarDahlia ? (
          <>
            <DinarDahliaStaff materials={materials} />
            <DinarCoinClutch materials={materials} />
          </>
        ) : null}
        {isMansaMoneybaggs ? (
          <>
            <MansaSunburstStaff materials={materials} />
            <MansaMoneyBag materials={materials} />
          </>
        ) : null}
        {isKandakeKash ? (
          <>
            <KandakeDollarStaff materials={materials} />
            <KandakeCashClutch materials={materials} />
          </>
        ) : null}
        {isMoneybaggBro ? (
          <>
            <MoneybaggDollarCane materials={materials} />
            <MoneybaggCashPhone materials={materials} />
            <MoneybaggChain materials={materials} />
          </>
        ) : null}
        {isMulaMami ? (
          <>
            <MulaCashFan materials={materials} />
            <MulaQuiltedBag materials={materials} />
            <MulaChainBelt materials={materials} />
          </>
        ) : null}
        {isDebtCollector ? (
          <>
            <DebtCollectorStaff materials={materials} />
            <DebtCollectorLedger materials={materials} />
            <DebtCollectorChains materials={materials} />
          </>
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

/** Cashwell’s dollar cane — wealth in every detail. */
function CashwellCane({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.52, 0.55, 0.12]} rotation={[0.15, 0, 0.08]}>
      <mesh castShadow position={[0, 0.35, 0]} material={materials.dark}>
        <cylinderGeometry args={[0.025, 0.028, 0.85, 8]} />
      </mesh>
      <mesh castShadow position={[0, 0.82, 0]} material={materials.gold}>
        <torusGeometry args={[0.08, 0.022, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.82, 0.01]} material={materials.gold}>
        <boxGeometry args={[0.04, 0.07, 0.02]} />
      </mesh>
    </group>
  );
}

/** Cashmere’s dollar staff — boardroom royalty. */
function CashmereStaff({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.52, 0.5, 0.1]} rotation={[0.12, 0, -0.1]}>
      <mesh castShadow position={[0, 0.4, 0]} material={materials.dark}>
        <cylinderGeometry args={[0.028, 0.03, 1.05, 8]} />
      </mesh>
      <mesh castShadow position={[0, 0.98, 0]} material={materials.gold}>
        <torusGeometry args={[0.1, 0.028, 8, 18]} />
      </mesh>
      <mesh position={[0, 0.98, 0.015]} material={materials.gold}>
        <boxGeometry args={[0.05, 0.09, 0.025]} />
      </mesh>
    </group>
  );
}

/** Peso Pedro’s P-topped cane — fiesta of fortune. */
function PesoPedroCane({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.52, 0.52, 0.12]} rotation={[0.14, 0, 0.1]}>
      <mesh castShadow position={[0, 0.38, 0]} material={materials.dark}>
        <cylinderGeometry args={[0.026, 0.03, 0.95, 8]} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]} material={materials.gold}>
        <sphereGeometry args={[0.09, 12, 10]} />
      </mesh>
      <SafeText
        position={[0, 0.92, 0.08]}
        fontSize={0.14}
        color="#14532d"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#fde68a"
      >
        P
      </SafeText>
    </group>
  );
}

/** Fortuna’s dollar-bill fan — flair of the bag. */
function FortunaBillFan({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.5, 0.85, 0.15]} rotation={[0.2, 0.4, -0.35]}>
      {[-0.2, -0.1, 0, 0.1, 0.2].map((a, i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.sin(a) * 0.08, Math.cos(a) * 0.02, i * 0.01]}
          rotation={[0.1, 0, a]}
          material={materials.paper}
        >
          <boxGeometry args={[0.16, 0.08, 0.008]} />
        </mesh>
      ))}
      <mesh position={[0, -0.02, 0.04]} material={materials.gold}>
        <sphereGeometry args={[0.035, 8, 6]} />
      </mesh>
    </group>
  );
}

/** Bao’s folding fan — quiet luxury. */
function BaoFoldingFan({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.48, 0.88, 0.12]} rotation={[0.15, 0.5, -0.2]}>
      {[-0.25, -0.12, 0, 0.12, 0.25].map((a, i) => (
        <mesh
          key={i}
          castShadow
          position={[Math.sin(a) * 0.06, Math.cos(a) * 0.015, i * 0.008]}
          rotation={[0.05, 0, a]}
        >
          <boxGeometry args={[0.14, 0.07, 0.006]} />
          <meshStandardMaterial color="#052e16" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, -0.01, 0.04]} material={materials.gold}>
        <sphereGeometry args={[0.03, 8, 6]} />
      </mesh>
      <mesh position={[0.02, -0.12, 0.02]} material={materials.gold}>
        <capsuleGeometry args={[0.01, 0.1, 3, 5]} />
      </mesh>
    </group>
  );
}

/** Bao’s lion-head cane — prestige by nature. */
function BaoLionCane({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.5, 0.5, 0.1]} rotation={[0.12, 0, 0.08]}>
      <mesh castShadow position={[0, 0.36, 0]} material={materials.dark}>
        <cylinderGeometry args={[0.026, 0.03, 0.9, 8]} />
      </mesh>
      <mesh castShadow position={[0, 0.88, 0]} material={materials.gold}>
        <sphereGeometry args={[0.1, 12, 10]} />
      </mesh>
      <mesh castShadow position={[0.06, 0.92, 0.04]} material={materials.gold}>
        <boxGeometry args={[0.06, 0.04, 0.08]} />
      </mesh>
      <mesh position={[-0.04, 0.94, 0.06]} material={materials.dark}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>
      <mesh position={[0.02, 0.94, 0.06]} material={materials.dark}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>
    </group>
  );
}

/** Jade Fortune’s jade-disc staff — fortune in bloom. */
function JadeFortuneStaff({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.5, 0.48, 0.1]} rotation={[0.1, 0, 0.06]}>
      <mesh castShadow position={[0, 0.4, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.028, 0.032, 1.05, 8]} />
      </mesh>
      <mesh castShadow position={[0, 0.98, 0]}>
        <torusGeometry args={[0.11, 0.035, 10, 20]} />
        <meshStandardMaterial color="#065f46" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.98, 0.02]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.25} />
      </mesh>
      <SafeText
        position={[0, 0.98, 0.04]}
        fontSize={0.1}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        福
      </SafeText>
    </group>
  );
}

/** Sultan Stacks’ coin-orb scepter — stacked like a sultan. */
function SultanCoinScepter({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.52, 0.45, 0.12]} rotation={[0.08, 0, 0.1]}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 1.1, 8]} />
        <meshStandardMaterial color="#064e3b" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 20]} />
      </mesh>
      <mesh position={[0, 1.02, 0.05]} material={materials.gold}>
        <circleGeometry args={[0.11, 18]} />
      </mesh>
      <SafeText
        position={[0, 1.02, 0.06]}
        fontSize={0.14}
        color="#064e3b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#fde68a"
      >
        $
      </SafeText>
    </group>
  );
}

/** Sultan’s $-buckle sash + overflowing coin purse. */
function SultanWealthSash({ materials }: { materials: GearMats }) {
  return (
    <group position={[0, 0.72, 0.18]}>
      <mesh castShadow rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.72, 0.12, 0.08]} />
        <meshStandardMaterial color="#064e3b" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.05]} material={materials.gold}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
      </mesh>
      <SafeText
        position={[0, 0, 0.08]}
        fontSize={0.1}
        color="#064e3b"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
      <group position={[-0.28, -0.18, 0.06]}>
        <mesh castShadow>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#065f46" roughness={0.55} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            castShadow
            position={[(i - 1) * 0.04, 0.08 + i * 0.01, 0.04]}
            material={materials.gold}
          >
            <cylinderGeometry args={[0.03, 0.03, 0.02, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Dinar Dahlia’s calligraphy medallion staff — dinar charm. */
function DinarDahliaStaff({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.5, 0.48, 0.1]} rotation={[0.1, 0, 0.06]}>
      <mesh castShadow position={[0, 0.42, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.026, 0.03, 1.1, 8]} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 20]} />
      </mesh>
      <mesh position={[0, 1.02, 0.04]}>
        <circleGeometry args={[0.1, 18]} />
        <meshStandardMaterial color="#0b3d2e" roughness={0.4} metalness={0.25} />
      </mesh>
      <SafeText
        position={[0, 1.02, 0.05]}
        fontSize={0.09}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        DD
      </SafeText>
    </group>
  );
}

/** Dahlia’s overflowing DD clutch — wealth with wonder. */
function DinarCoinClutch({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.48, 0.55, 0.12]} rotation={[0.15, 0.3, -0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.16, 0.08]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.045]}>
        <boxGeometry args={[0.18, 0.12, 0.02]} />
        <meshStandardMaterial color="#0b3d2e" roughness={0.45} />
      </mesh>
      <SafeText
        position={[0, 0.01, 0.06]}
        fontSize={0.07}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        DD
      </SafeText>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[(i % 2) * 0.05 - 0.02, 0.1 + (i > 1 ? 0.03 : 0), 0.02]}
          material={materials.gold}
        >
          <cylinderGeometry args={[0.025, 0.025, 0.015, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** Mansa’s sunburst staff — golden legacy. */
function MansaSunburstStaff({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.52, 0.45, 0.12]} rotation={[0.08, 0, 0.1]}>
      <mesh castShadow position={[0, 0.42, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.03, 0.035, 1.1, 8]} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(a) * 0.14, 1.02, Math.sin(a) * 0.14]}
            rotation={[0, 0, a]}
            material={materials.gold}
          >
            <coneGeometry args={[0.025, 0.1, 4]} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.02, 0.04]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#1b4332" roughness={0.4} metalness={0.25} />
      </mesh>
      <SafeText
        position={[0, 1.02, 0.05]}
        fontSize={0.12}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        M
      </SafeText>
    </group>
  );
}

/** Mansa’s overflowing moneybag — legendary abundance. */
function MansaMoneyBag({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.42, 0.7, 0.05]} rotation={[0.2, 0.4, -0.15]}>
      <mesh castShadow position={[0, 0.08, 0]} material={materials.gold}>
        <capsuleGeometry args={[0.02, 0.35, 3, 5]} />
      </mesh>
      <mesh castShadow position={[0, -0.12, 0.08]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.02, 0.08]}>
        <cylinderGeometry args={[0.08, 0.12, 0.1, 12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.08, 0.22]} material={materials.gold}>
        <circleGeometry args={[0.07, 14]} />
      </mesh>
      <SafeText
        position={[0, -0.08, 0.23]}
        fontSize={0.1}
        color="#1b4332"
        anchorX="center"
        anchorY="middle"
      >
        M
      </SafeText>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[(i % 3) * 0.05 - 0.05, 0.08 + Math.floor(i / 3) * 0.04, 0.12]}
          material={materials.gold}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.018, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** Kandake’s $-orb staff — crowned commerce. */
function KandakeDollarStaff({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.5, 0.48, 0.1]} rotation={[0.1, 0, 0.06]}>
      <mesh castShadow position={[0, 0.42, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.026, 0.03, 1.1, 8]} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial
          color="#a7f3d0"
          transparent
          opacity={0.55}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]} material={materials.gold}>
        <torusGeometry args={[0.12, 0.02, 8, 18]} />
      </mesh>
      <SafeText
        position={[0, 1.02, 0.08]}
        fontSize={0.14}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#1b4332"
      >
        $
      </SafeText>
    </group>
  );
}

/** Kandake’s overflowing cash clutch — golden generosity. */
function KandakeCashClutch({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.48, 0.55, 0.12]} rotation={[0.15, 0.3, -0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.18, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.02, 0.055]} material={materials.gold}>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
      </mesh>
      {/* Winged queen mark */}
      <mesh castShadow position={[-0.06, 0.04, 0.07]} material={materials.gold} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.03, 0.01]} />
      </mesh>
      <mesh castShadow position={[0.06, 0.04, 0.07]} material={materials.gold} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.03, 0.01]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={`bill-${i}`}
          castShadow
          position={[(i - 1) * 0.04, 0.12, 0.02]}
          rotation={[0.2, 0.1 * i, 0]}
        >
          <boxGeometry args={[0.08, 0.04, 0.01]} />
          <meshStandardMaterial color="#166534" roughness={0.55} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`coin-${i}`}
          castShadow
          position={[(i % 2) * 0.05 - 0.02, 0.14 + (i > 1 ? 0.03 : 0), 0.05]}
          material={materials.gold}
        >
          <cylinderGeometry args={[0.025, 0.025, 0.015, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** Moneybagg Bro’s $-topper cane — executive style. */
function MoneybaggDollarCane({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.5, 0.42, 0.1]} rotation={[0.15, 0, 0.08]}>
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.028, 0.032, 0.95, 8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.9, 0]} material={materials.gold}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>
      <SafeText
        position={[0, 0.9, 0.06]}
        fontSize={0.14}
        color="#14532d"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#fde68a"
      >
        $
      </SafeText>
    </group>
  );
}

/** Cash stack held like a phone — cash flow. */
function MoneybaggCashPhone({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.45, 1.0, 0.15]} rotation={[0.3, 0.5, -0.2]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[0, i * 0.012, 0]}
        >
          <boxGeometry args={[0.14, 0.01, 0.07]} />
          <meshStandardMaterial color="#166534" roughness={0.55} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.03, 0]} material={materials.gold}>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
      </mesh>
    </group>
  );
}

/** Heavy $ pendant chain — swagger always. */
function MoneybaggChain({ materials }: { materials: GearMats }) {
  return (
    <group position={[0, 0.95, 0.12]}>
      <mesh castShadow rotation={[0.35, 0, 0]} material={materials.gold}>
        <torusGeometry args={[0.22, 0.025, 8, 18]} />
      </mesh>
      <mesh castShadow position={[0, -0.28, 0.06]} material={materials.gold}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
      </mesh>
      <SafeText
        position={[0, -0.28, 0.09]}
        fontSize={0.12}
        color="#14532d"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
      {/* $ belt buckle hint */}
      <mesh castShadow position={[0, -0.55, 0.1]}>
        <boxGeometry args={[0.5, 0.08, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, -0.55, 0.14]} material={materials.gold}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 12]} />
      </mesh>
      <SafeText
        position={[0, -0.55, 0.16]}
        fontSize={0.08}
        color="#14532d"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
    </group>
  );
}

/** Mula’s fanned cash — queen of the bag. */
function MulaCashFan({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.48, 0.95, 0.12]} rotation={[0.2, -0.4, 0.3]}>
      {[-2, -1, 0, 1, 2].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[i * 0.02, Math.abs(i) * 0.01, i * 0.015]}
          rotation={[0, 0, i * 0.18]}
        >
          <boxGeometry args={[0.12, 0.06, 0.008]} />
          <meshStandardMaterial color="#166534" roughness={0.55} />
        </mesh>
      ))}
      <mesh castShadow position={[0, -0.02, 0]} material={materials.gold}>
        <boxGeometry args={[0.04, 0.02, 0.04]} />
      </mesh>
    </group>
  );
}

/** Quilted $ handbag — street glamour. */
function MulaQuiltedBag({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.48, 0.55, 0.12]} rotation={[0.1, 0.35, -0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.16, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>
      {/* Quilt diamond hints */}
      {[0, 1].map((row) =>
        [0, 1].map((col) => (
          <mesh
            key={`${row}-${col}`}
            position={[(col - 0.5) * 0.07, (row - 0.5) * 0.06, 0.052]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <boxGeometry args={[0.05, 0.05, 0.01]} />
            <meshStandardMaterial color="#1c1917" roughness={0.45} />
          </mesh>
        )),
      )}
      <mesh castShadow position={[0, 0.12, 0]} material={materials.gold}>
        <torusGeometry args={[0.08, 0.012, 6, 14, Math.PI]} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.06]} material={materials.gold}>
        <cylinderGeometry args={[0.06, 0.06, 0.03, 14]} />
      </mesh>
      <SafeText
        position={[0, 0, 0.08]}
        fontSize={0.09}
        color="#14532d"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
      <mesh castShadow position={[0.08, -0.1, 0.04]} material={materials.gold}>
        <capsuleGeometry args={[0.015, 0.1, 3, 5]} />
      </mesh>
    </group>
  );
}

/** Gold chain hip belt — hustle & heels. */
function MulaChainBelt({ materials }: { materials: GearMats }) {
  return (
    <group position={[0, 0.55, 0.15]}>
      <mesh castShadow rotation={[0.1, 0, 0]} material={materials.gold}>
        <torusGeometry args={[0.28, 0.02, 6, 18]} />
      </mesh>
      <mesh castShadow position={[0.2, -0.12, 0.05]} material={materials.gold}>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>
      <mesh castShadow position={[-0.18, -0.15, 0.04]} material={materials.gold}>
        <sphereGeometry args={[0.035, 8, 6]} />
      </mesh>
    </group>
  );
}

/** Bank-of-Obligation body — pediment skull, vault heart, fee arches. */
function DebtCollectorBody({ materials }: { materials: GearMats }) {
  return (
    <group position={[0, 0.95, 0]}>
      {/* Pediment roof */}
      <mesh castShadow position={[0, 0.55, 0]} material={materials.body}>
        <coneGeometry args={[0.55, 0.28, 3]} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]} material={materials.gold}>
        <torusGeometry args={[0.08, 0.025, 8, 14]} />
      </mesh>
      <SafeText
        position={[0, 0.72, 0.04]}
        fontSize={0.1}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
      <SafeText
        position={[0, 0.42, 0.2]}
        fontSize={0.045}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        BANK OF OBLIGATION
      </SafeText>
      {/* Menacing stone face */}
      <mesh castShadow position={[0, 0.15, 0]} material={materials.body}>
        <boxGeometry args={[0.85, 0.55, 0.35]} />
      </mesh>
      <mesh position={[-0.18, 0.22, 0.19]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#854d0e" emissive="#facc15" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.18, 0.22, 0.19]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#854d0e" emissive="#facc15" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0.2]} material={materials.dark}>
        <boxGeometry args={[0.35, 0.08, 0.04]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[(i - 2) * 0.06, 0.02, 0.23]}
          material={materials.paper}
        >
          <boxGeometry args={[0.04, 0.1, 0.02]} />
        </mesh>
      ))}
      {/* Pay plaque */}
      <mesh castShadow position={[0, -0.2, 0.18]} material={materials.gold}>
        <boxGeometry args={[0.7, 0.1, 0.04]} />
      </mesh>
      <SafeText
        position={[0, -0.2, 0.21]}
        fontSize={0.04}
        color="#3f3f46"
        anchorX="center"
        anchorY="middle"
      >
        PAY IN FULL. OR ELSE.
      </SafeText>
      {/* Vault door heart */}
      <mesh castShadow position={[0, -0.55, 0.05]} material={materials.gold}>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 24]} />
      </mesh>
      <mesh position={[0, -0.55, 0.12]} material={materials.dark}>
        <circleGeometry args={[0.18, 20]} />
      </mesh>
      <mesh position={[0, -0.55, 0.13]} material={materials.gold}>
        <torusGeometry args={[0.1, 0.025, 8, 16]} />
      </mesh>
      <SafeText
        position={[0, -0.55, 0.14]}
        fontSize={0.12}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
      {/* Fee / Penalties / Interest arches */}
      {(["FEES", "PENALTIES", "INTEREST"] as const).map((label, i) => (
        <group key={label} position={[(i - 1) * 0.28, -0.95, 0.1]}>
          <mesh castShadow material={materials.body}>
            <boxGeometry args={[0.22, 0.28, 0.12]} />
          </mesh>
          <mesh position={[0, 0.02, 0.07]} material={materials.dark}>
            <boxGeometry args={[0.12, 0.18, 0.02]} />
          </mesh>
          <SafeText
            position={[0, 0.18, 0.08]}
            fontSize={0.035}
            color="#fde68a"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </SafeText>
        </group>
      ))}
      {/* Stair base */}
      <mesh castShadow position={[0, -1.25, 0.15]} material={materials.body}>
        <boxGeometry args={[0.9, 0.12, 0.4]} />
      </mesh>
      <mesh castShadow position={[0, -1.38, 0.25]} material={materials.body}>
        <boxGeometry args={[1.0, 0.1, 0.35]} />
      </mesh>
    </group>
  );
}

/** Bank-building staff — foreclosure grip. */
function DebtCollectorStaff({ materials }: { materials: GearMats }) {
  return (
    <group position={[0.55, 0.4, 0.12]} rotation={[0.08, 0, 0.12]}>
      <mesh castShadow position={[0, 0.45, 0]} material={materials.gold}>
        <cylinderGeometry args={[0.032, 0.038, 1.2, 8]} />
      </mesh>
      <mesh castShadow position={[0, 1.12, 0]} material={materials.gold}>
        <boxGeometry args={[0.22, 0.14, 0.08]} />
      </mesh>
      <mesh castShadow position={[0, 1.22, 0]} material={materials.gold}>
        <coneGeometry args={[0.14, 0.12, 3]} />
      </mesh>
      <SafeText
        position={[0, 1.12, 0.05]}
        fontSize={0.08}
        color="#3f3f46"
        anchorX="center"
        anchorY="middle"
      >
        $
      </SafeText>
    </group>
  );
}

/** Ledger of Liability + final notice. */
function DebtCollectorLedger({ materials }: { materials: GearMats }) {
  return (
    <group position={[-0.5, 0.7, 0.15]} rotation={[0.2, 0.5, -0.15]}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.3, 0.08]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.08, 0.045]} material={materials.gold}>
        <boxGeometry args={[0.16, 0.04, 0.01]} />
      </mesh>
      <SafeText
        position={[0, 0.02, 0.05]}
        fontSize={0.04}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        LEDGER
      </SafeText>
      <mesh castShadow position={[0.12, -0.2, 0.02]} rotation={[0.3, 0, 0.2]}>
        <boxGeometry args={[0.12, 0.16, 0.01]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Chains, padlocks, seized-asset sack. */
function DebtCollectorChains({ materials }: { materials: GearMats }) {
  return (
    <group position={[0, 0.5, 0]}>
      <mesh castShadow position={[0.2, -0.1, 0.25]} rotation={[0.4, 0.2, 0.3]} material={materials.gold}>
        <torusGeometry args={[0.15, 0.025, 6, 12]} />
      </mesh>
      <mesh castShadow position={[-0.15, -0.3, 0.22]} rotation={[0.2, -0.3, 0]} material={materials.gold}>
        <torusGeometry args={[0.12, 0.02, 6, 12]} />
      </mesh>
      <mesh castShadow position={[0.25, -0.35, 0.2]} material={materials.dark}>
        <boxGeometry args={[0.08, 0.1, 0.05]} />
      </mesh>
      <group position={[-0.35, -0.55, 0.2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#78716c" roughness={0.7} />
        </mesh>
        <SafeText
          position={[0, 0, 0.12]}
          fontSize={0.08}
          color="#fde68a"
          anchorX="center"
          anchorY="middle"
        >
          $
        </SafeText>
      </group>
    </group>
  );
}

/** Readable outfit gear for every mascot silhouette (Outfitter + plaza Voyager). */
function GearAttach({
  accessory,
  form,
  materials,
  seriesLead = null,
}: {
  accessory: string;
  form: MoneyForm;
  materials: GearMats;
  /** Series lead accents — hat / cape / sombrero / vest / jade cape / turban */
  seriesLead?:
    | "cashwell"
    | "cashmere"
    | "peso_pedro"
    | "fortuna_fernanda"
    | "billionaire_bao"
    | "jade_fortune"
    | "sultan_stacks"
    | "dinar_dahlia"
    | "mansa_moneybaggs"
    | "kandake_kash"
    | "moneybagg_bro"
    | "mula_mami"
    | "debt_collector"
    | null;
}) {
  const L = gearLandmarks(form);
  const monocleR = Math.max(0.08, L.headR * 0.26);
  const cupR = Math.max(0.1, L.headR * 0.36);
  const cashwellHat = seriesLead === "cashwell";
  const pedroSombrero = seriesLead === "peso_pedro";
  const sultanTurban = seriesLead === "sultan_stacks";
  const mansaTurban = seriesLead === "mansa_moneybaggs";

  // Top Hat / Sombrero / Turban — seated on the head, brim at crown line
  if (accessory === "cap") {
    if (mansaTurban) {
      const wrap = L.headR * 1.05;
      return (
        <group position={[0, L.crownY + 0.06, 0]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <sphereGeometry args={[wrap * 0.9, 16, 12]} />
            <meshStandardMaterial color="#f5f0e1" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.22, 0]}>
            <torusGeometry args={[wrap * 0.58, 0.12, 10, 20]} />
            <meshStandardMaterial color="#f5f0e1" roughness={0.65} />
          </mesh>
          <mesh castShadow position={[0, 0.32, 0]} material={materials.gold}>
            <torusGeometry args={[wrap * 0.45, 0.05, 8, 18]} />
          </mesh>
          {/* M emblem on turban */}
          <mesh castShadow position={[0, 0.22, wrap * 0.7]} material={materials.gold}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
          </mesh>
          <mesh position={[0, 0.22, wrap * 0.73]}>
            <circleGeometry args={[0.07, 14]} />
            <meshStandardMaterial color="#1b4332" roughness={0.4} />
          </mesh>
          <SafeText
            position={[0, 0.22, wrap * 0.74]}
            fontSize={0.1}
            color="#fde68a"
            anchorX="center"
            anchorY="middle"
          >
            M
          </SafeText>
          {/* Small crown atop turban */}
          <mesh castShadow position={[0, 0.48, 0]} material={materials.gold}>
            <cylinderGeometry args={[0.1, 0.14, 0.08, 10]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
            return (
              <mesh
                key={i}
                castShadow
                position={[Math.cos(a) * 0.1, 0.56, Math.sin(a) * 0.1]}
                material={materials.gold}
              >
                <coneGeometry args={[0.025, 0.08, 4]} />
              </mesh>
            );
          })}
          {/* Gold bead necklaces hint at collar */}
          <mesh castShadow position={[0, -0.08, wrap * 0.2]} rotation={[0.5, 0, 0]} material={materials.gold}>
            <torusGeometry args={[wrap * 0.55, 0.02, 6, 16, Math.PI]} />
          </mesh>
        </group>
      );
    }
    if (sultanTurban) {
      const wrap = L.headR * 0.95;
      return (
        <group position={[0, L.crownY + 0.04, 0]}>
          <mesh castShadow position={[0, 0.08, 0]}>
            <sphereGeometry args={[wrap * 0.85, 16, 12]} />
            <meshStandardMaterial color="#f5f0e1" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.18, 0]}>
            <torusGeometry args={[wrap * 0.55, 0.1, 10, 20]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.28, 0]}>
            <sphereGeometry args={[wrap * 0.55, 14, 12]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.12, wrap * 0.55]} material={materials.gold}>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
          <mesh castShadow position={[0, 0.12, wrap * 0.55]}>
            <octahedronGeometry args={[0.045, 0]} />
            <meshStandardMaterial color="#10b981" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.48, 0]} material={materials.gold}>
            <sphereGeometry args={[0.04, 8, 6]} />
          </mesh>
          {/* Crescent + star */}
          <mesh castShadow position={[0.02, 0.58, 0]} rotation={[0, 0, 0.2]} material={materials.gold}>
            <torusGeometry args={[0.06, 0.018, 6, 14, Math.PI * 1.4]} />
          </mesh>
          <mesh castShadow position={[0.08, 0.64, 0.02]} material={materials.gold}>
            <octahedronGeometry args={[0.035, 0]} />
          </mesh>
          {/* Feather */}
          <mesh
            castShadow
            position={[0.22, 0.42, -0.05]}
            rotation={[0.3, 0.4, 0.8]}
            material={materials.paper}
          >
            <capsuleGeometry args={[0.02, 0.28, 4, 6]} />
          </mesh>
          {/* Gold chain drape */}
          <mesh castShadow position={[0, 0.05, wrap * 0.35]} rotation={[0.4, 0, 0]} material={materials.gold}>
            <torusGeometry args={[wrap * 0.55, 0.015, 6, 16, Math.PI]} />
          </mesh>
        </group>
      );
    }
    if (pedroSombrero) {
      const brim = L.headR * 1.55;
      return (
        <group position={[0, L.crownY + 0.02, 0]}>
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[brim, brim * 0.92, 0.06, 24]} />
            <meshStandardMaterial color="#166534" roughness={0.55} />
          </mesh>
          <mesh castShadow position={[0, 0.14, 0]}>
            <cylinderGeometry args={[L.headR * 0.5, L.headR * 0.62, 0.22, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.55} />
          </mesh>
          <mesh castShadow position={[0, 0.06, 0]} material={materials.gold}>
            <torusGeometry args={[L.headR * 0.7, 0.03, 8, 20]} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                castShadow
                position={[Math.cos(a) * brim * 0.72, 0.05, Math.sin(a) * brim * 0.72]}
                material={materials.gold}
              >
                <sphereGeometry args={[0.035, 8, 6]} />
              </mesh>
            );
          })}
        </group>
      );
    }
    const brim = L.headR * (cashwellHat ? 1.05 : 0.95);
    const crown = L.headR * (cashwellHat ? 0.58 : 0.55);
    const crownH = cashwellHat ? 0.72 : 0.36;
    const bandY = cashwellHat ? 0.1 : 0.08;
    return (
      <group position={[0, L.crownY, 0]}>
        <mesh castShadow position={[0, 0.02, 0]} material={materials.dark}>
          <cylinderGeometry args={[brim, brim, 0.05, 18]} />
        </mesh>
        <mesh castShadow position={[0, crownH * 0.55, 0]}>
          <cylinderGeometry args={[crown, crown * 1.05, crownH, 16]} />
          <meshStandardMaterial color={cashwellHat ? "#14532d" : "#0c1622"} roughness={0.55} />
        </mesh>
        <mesh castShadow position={[0, bandY, 0]} material={materials.gold}>
          <torusGeometry args={[crown * 1.02, 0.028, 8, 18]} />
        </mesh>
        {cashwellHat ? (
          <mesh castShadow position={[0, crownH * 0.45, crown + 0.02]} material={materials.gold}>
            <circleGeometry args={[0.1, 16]} />
          </mesh>
        ) : (
          <mesh castShadow position={[0, 0.42, 0]} material={materials.gold}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
        )}
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
    const couture = seriesLead === "cashmere";
    const fortuna = seriesLead === "fortuna_fernanda";
    const jade = seriesLead === "jade_fortune";
    const dahlia = seriesLead === "dinar_dahlia";
    const kandake = seriesLead === "kandake_kash";
    const debt = seriesLead === "debt_collector";
    const dramatic = couture || fortuna || jade || dahlia || kandake || debt;
    return (
      <group position={[0, L.neckY - 0.05, L.backZ]}>
        <mesh
          castShadow
          position={[0, -L.torsoH * (dramatic ? 0.55 : 0.35), -0.02]}
          rotation={[0.35, 0, 0]}
        >
          <boxGeometry
            args={[L.torsoW * (dramatic ? 1.35 : 1.15), L.torsoH * (dramatic ? 1.85 : 1.35), 0.06]}
          />
          <meshStandardMaterial
            color={
              fortuna
                ? "#047857"
                : dahlia
                  ? "#0b3d2e"
                  : kandake
                    ? "#1b4332"
                    : debt
                      ? "#14532d"
                      : jade
                        ? "#0a0a0a"
                        : "#0a0a0a"
            }
            roughness={0.55}
          />
        </mesh>
        {/* Gold lining flash */}
        <mesh
          castShadow
          position={[0.28, -L.torsoH * 0.4, 0.02]}
          rotation={[0.3, -0.4, 0.1]}
          material={materials.gold}
        >
          <boxGeometry args={[L.torsoW * 0.45, L.torsoH * (dramatic ? 1.4 : 0.9), 0.04]} />
        </mesh>
        <mesh castShadow position={[0, 0.02, 0.02]} material={materials.gold}>
          <boxGeometry args={[L.torsoW * 0.55, 0.06, 0.05]} />
        </mesh>
        {couture ? (
          <mesh castShadow position={[0, -0.15, 0.08]} material={materials.gold}>
            <boxGeometry args={[0.14, 0.1, 0.04]} />
          </mesh>
        ) : null}
        {fortuna ? (
          <>
            <mesh castShadow position={[-0.2, -0.2, 0.06]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.45} />
            </mesh>
            <mesh castShadow position={[0.18, -0.35, 0.05]} material={materials.gold}>
              <sphereGeometry args={[0.05, 8, 6]} />
            </mesh>
          </>
        ) : null}
        {jade ? (
          <>
            <mesh castShadow position={[0.22, -0.25, 0.05]}>
              <sphereGeometry args={[0.055, 8, 6]} />
              <meshStandardMaterial color="#065f46" roughness={0.35} metalness={0.35} />
            </mesh>
            <mesh castShadow position={[-0.15, -0.4, 0.04]} material={materials.gold}>
              <torusGeometry args={[0.05, 0.015, 6, 12]} />
            </mesh>
          </>
        ) : null}
        {dahlia ? (
          <>
            <mesh castShadow position={[0.2, -0.22, 0.05]} material={materials.gold}>
              <sphereGeometry args={[0.05, 8, 6]} />
            </mesh>
            <mesh castShadow position={[-0.18, -0.38, 0.04]}>
              <octahedronGeometry args={[0.045, 0]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh castShadow position={[0, -L.torsoH * 0.85, 0]} material={materials.gold}>
              <boxGeometry args={[L.torsoW * 0.9, 0.04, 0.04]} />
            </mesh>
          </>
        ) : null}
        {kandake ? (
          <>
            <mesh castShadow position={[0.2, -0.2, 0.05]} material={materials.gold}>
              <sphereGeometry args={[0.05, 8, 6]} />
            </mesh>
            <mesh castShadow position={[-0.18, -0.36, 0.04]}>
              <octahedronGeometry args={[0.04, 0]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Geometric gold trim */}
            <mesh castShadow position={[0, -L.torsoH * 0.5, 0.02]} material={materials.gold}>
              <boxGeometry args={[L.torsoW * 1.1, 0.03, 0.03]} />
            </mesh>
            <mesh castShadow position={[0, -L.torsoH * 0.9, 0]} material={materials.gold}>
              <boxGeometry args={[L.torsoW * 0.95, 0.035, 0.035]} />
            </mesh>
          </>
        ) : null}
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
    const bao = seriesLead === "billionaire_bao";
    const moneybagg = seriesLead === "moneybagg_bro";
    const mula = seriesLead === "mula_mami";
    return (
      <group position={[0, L.torsoY, L.neckZ * 0.25]}>
        {bao ? (
          <mesh castShadow position={[0, 0.02, -0.02]}>
            <boxGeometry args={[L.torsoW * 1.15, L.torsoH * 1.05, L.torsoD * 0.9]} />
            <meshStandardMaterial color="#052e16" roughness={0.45} metalness={0.15} />
          </mesh>
        ) : null}
        {moneybagg ? (
          <mesh castShadow position={[0, 0.02, -0.02]}>
            <boxGeometry args={[L.torsoW * 1.2, L.torsoH * 1.1, L.torsoD * 0.95]} />
            <meshStandardMaterial color="#171717" roughness={0.45} metalness={0.2} />
          </mesh>
        ) : null}
        {mula ? (
          <mesh castShadow position={[0, 0.08, -0.02]}>
            <boxGeometry args={[L.torsoW * 1.15, L.torsoH * 0.75, L.torsoD * 0.9]} />
            <meshStandardMaterial color="#1c1917" roughness={0.4} metalness={0.25} />
          </mesh>
        ) : null}
        <mesh castShadow material={materials.dark}>
          <boxGeometry args={[L.torsoW * 0.95, L.torsoH * (mula ? 0.7 : 0.85), L.torsoD * 0.75]} />
        </mesh>
        <mesh position={[0, L.torsoH * 0.12, L.torsoD * 0.38]} material={materials.gold}>
          <boxGeometry args={[0.06, L.torsoH * (mula ? 0.4 : 0.55), 0.02]} />
        </mesh>
        {/* Frog closures / lapel seals */}
        {[0.18, 0.02, -0.14].map((y, i) => (
          <mesh
            key={i}
            position={[0, y, L.torsoD * 0.42]}
            material={materials.gold}
          >
            <sphereGeometry args={[0.03, 8, 6]} />
          </mesh>
        ))}
        <mesh position={[-L.torsoW * 0.28, L.torsoH * 0.05, L.torsoD * 0.38]} material={materials.gold}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
        <mesh position={[L.torsoW * 0.28, L.torsoH * 0.05, L.torsoD * 0.38]} material={materials.gold}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
        {bao ? (
          <mesh castShadow position={[L.torsoW * 0.32, L.torsoH * 0.2, L.torsoD * 0.4]} material={materials.gold}>
            <boxGeometry args={[0.1, 0.08, 0.03]} />
          </mesh>
        ) : null}
        {moneybagg ? (
          <>
            {/* Green/gold ribbed collar */}
            <mesh castShadow position={[0, L.torsoH * 0.42, L.torsoD * 0.2]}>
              <boxGeometry args={[L.torsoW * 0.9, 0.06, 0.08]} />
              <meshStandardMaterial color="#14532d" roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, L.torsoH * 0.42, L.torsoD * 0.25]} material={materials.gold}>
              <boxGeometry args={[L.torsoW * 0.85, 0.02, 0.02]} />
            </mesh>
            {/* MB breast patch */}
            <mesh castShadow position={[-L.torsoW * 0.25, L.torsoH * 0.15, L.torsoD * 0.42]}>
              <cylinderGeometry args={[0.07, 0.07, 0.03, 14]} />
              <meshStandardMaterial color="#14532d" roughness={0.4} />
            </mesh>
            <SafeText
              position={[-L.torsoW * 0.25, L.torsoH * 0.15, L.torsoD * 0.44]}
              fontSize={0.06}
              color="#fde68a"
              anchorX="center"
              anchorY="middle"
            >
              MB
            </SafeText>
          </>
        ) : null}
        {mula ? (
          <>
            {/* Gold patterned sleeves flash */}
            <mesh castShadow position={[-L.torsoW * 0.55, L.torsoH * 0.1, 0]} material={materials.gold}>
              <boxGeometry args={[0.12, L.torsoH * 0.55, 0.1]} />
            </mesh>
            <mesh castShadow position={[L.torsoW * 0.55, L.torsoH * 0.1, 0]} material={materials.gold}>
              <boxGeometry args={[0.12, L.torsoH * 0.55, 0.1]} />
            </mesh>
            {/* Chest $ mark */}
            <SafeText
              position={[0, L.torsoH * 0.05, L.torsoD * 0.42]}
              fontSize={0.14}
              color="#fde68a"
              anchorX="center"
              anchorY="middle"
            >
              $
            </SafeText>
          </>
        ) : null}
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
