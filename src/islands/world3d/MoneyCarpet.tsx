import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VoyagerMesh } from "./VoyagerMesh";
import type { CapitalCharacter } from "../character";
import type { AnimationStyleId } from "../animationStyles";
import { CarpetCoinBagBuddy } from "./CarpetCoinBagBuddy";
import { getMoneyCarpetTexture } from "./moneyCarpetTexture";

type Props = {
  character?: CapitalCharacter | null;
  /** bob / flutter while flying */
  flying?: boolean;
  /** First-person: carpet only (no seated body blocking the lens). */
  hideRider?: boolean;
  /**
   * First-person ride layout — long banknote nose ahead of the camera
   * so the Money Carpet fills the lower frame. Local +Z = flight / nose.
   */
  povRide?: boolean;
  /** Decade lens for the seated Voyager (approach morph / dock era). */
  animationStyle?: AnimationStyleId | string;
  /** Coin Bag rides shotgun with cycling emotes (default on for POV). */
  showBuddy?: boolean;
  /** Live rush flag so buddy gets wilder faces mid-boost */
  rushingRef?: MutableRefObject<boolean>;
};

/**
 * Money magic carpet — a flying Fortune banknote with gold tassels.
 * Texture + fringe + curled nose so it reads as “money carpet” at a glance,
 * not a green rectangle.
 */
export function MoneyCarpet({
  character,
  flying = true,
  hideRider = false,
  povRide = false,
  animationStyle,
  showBuddy,
  rushingRef,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const cloth = useRef<THREE.Mesh>(null);
  const medallion = useRef<THREE.Group>(null);
  const fringeRefs = useRef<THREE.Mesh[]>([]);
  const buddyOn = showBuddy ?? povRide;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Classic bill proportions (about 2:1), stretched for POV nose.
  const length = povRide ? 3.35 : 2.05;
  const width = povRide ? 1.55 : 1.15;
  // Seat toward the rear; printed face extends forward (+Z).
  const seatZ = povRide ? -0.62 : -0.05;
  const noseTipZ = seatZ + length * 0.62;
  const tailZ = seatZ - length * 0.38;

  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return getMoneyCarpetTexture();
  }, []);

  const geometry = useMemo(() => {
    const segsW = povRide ? 14 : 10;
    const segsL = povRide ? 26 : 16;
    const geo = new THREE.PlaneGeometry(width, length, segsW, segsL);
    geo.rotateX(-Math.PI / 2);
    // Center of bill slightly ahead of seat so POV sees the printed face
    geo.translate(0, 0, seatZ + length * 0.12);

    // Pre-curl nose + soft rounded corners (magic-carpet silhouette)
    const pos = geo.attributes.position!;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const along = THREE.MathUtils.clamp((z - tailZ) / Math.max(0.001, noseTipZ - tailZ), 0, 1);
      const side = Math.abs(x) / (width * 0.5);
      const noseCurl = along * along * (povRide ? 0.16 : 0.1);
      const cornerDip = side * side * (1 - along) * 0.04;
      pos.setY(i, noseCurl - cornerDip);
      // Slight taper at the short ends so it isn’t a hard rectangle
      if (along > 0.92 || along < 0.08) {
        pos.setX(i, x * (1 - 0.04 * side));
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, [width, length, seatZ, noseTipZ, tailZ, povRide]);

  const basePositions = useMemo(() => {
    const pos = geometry.attributes.position!;
    return Float32Array.from(pos.array as ArrayLike<number>);
  }, [geometry]);

  const fringe = useMemo(() => {
    const items: { x: number; z: number; nose: boolean; len: number }[] = [];
    const count = povRide ? 13 : 9;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = -width * 0.42 + t * width * 0.84;
      const len = 0.28 + Math.abs(t - 0.5) * 0.15;
      items.push({ x, z: noseTipZ + 0.06, nose: true, len: povRide ? len + 0.18 : len });
      items.push({ x, z: tailZ - 0.06, nose: false, len: povRide ? len + 0.08 : len * 0.9 });
    }
    return items;
  }, [povRide, width, noseTipZ, tailZ]);

  const sideFringe = useMemo(() => {
    const items: { x: number; z: number; side: -1 | 1 }[] = [];
    const count = povRide ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const z = tailZ + 0.12 + t * (length * 0.76);
      items.push({ x: -width * 0.5, z, side: -1 });
      items.push({ x: width * 0.5, z, side: 1 });
    }
    return items;
  }, [povRide, width, length, tailZ]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!flying) return;

    if (root.current && !povRide) {
      const gust = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.9) * 0.5;
      root.current.position.y = Math.sin(t * 2.4) * 0.1;
      root.current.rotation.z = gust * 0.05;
      root.current.rotation.x = -0.04 + Math.sin(t * 1.3) * 0.035;
    }

    if (cloth.current) {
      const pos = cloth.current.geometry.attributes.position!;
      for (let i = 0; i < pos.count; i++) {
        const bx = basePositions[i * 3]!;
        const by = basePositions[i * 3 + 1]!;
        const bz = basePositions[i * 3 + 2]!;
        const along = THREE.MathUtils.clamp((bz - tailZ) / Math.max(0.001, noseTipZ - tailZ), 0, 1);
        const side = Math.abs(bx) / (width * 0.5);
        const seatFirm = povRide
          ? THREE.MathUtils.clamp(Math.abs(bz - seatZ) * 1.05, 0.22, 1)
          : 1;
        const flapAmp =
          (0.045 + along * along * 0.26 + side * 0.1) * seatFirm * (povRide ? 1.2 : 0.85);
        const wave =
          Math.sin(bz * 3.1 - t * 8.5) * flapAmp +
          Math.sin(bx * 3.8 + t * 5.8) * flapAmp * 0.5 +
          Math.sin((bz + bx) * 1.8 - t * 3.4) * flapAmp * 0.35 +
          Math.sin(t * 2.2 + along * 4) * flapAmp * 0.2;
        pos.setY(i, by + wave);
      }
      pos.needsUpdate = true;
      cloth.current.geometry.computeVertexNormals();
    }

    for (let i = 0; i < fringeRefs.current.length; i++) {
      const m = fringeRefs.current[i];
      if (!m) continue;
      const nose = i < fringe.length ? fringe[i]?.nose : false;
      const phase = t * (nose ? 11 : 8) + i * 0.55;
      m.rotation.x = (nose ? 0.85 : 0.55) + Math.sin(phase) * (nose ? 0.55 : 0.32);
      m.rotation.z = Math.sin(phase * 0.7 + i) * 0.28;
    }

    if (medallion.current) {
      medallion.current.position.y =
        0.08 + Math.sin(t * 7.2 - noseTipZ * 2.4) * (povRide ? 0.1 : 0.05);
      medallion.current.rotation.y = Math.sin(t * 1.4) * 0.08;
    }
  });

  const mat = useMemo(() => {
    if (texture) {
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.52,
        metalness: 0.08,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(povRide ? "#0a2f1c" : "#000000"),
        emissiveIntensity: povRide ? 0.12 : 0,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: "#217a4a",
      roughness: 0.55,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
  }, [texture, povRide]);

  const underMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b2e1c",
        roughness: 0.85,
        metalness: 0.05,
        side: THREE.FrontSide,
      }),
    [],
  );

  return (
    <group ref={root}>
      {/* Printed banknote cloth */}
      <mesh ref={cloth} geometry={geometry} material={mat} castShadow receiveShadow />

      {/* Dark underside so the silhouette reads from below / side */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -0.012, seatZ + length * 0.12]}
        material={underMat}
        receiveShadow
      >
        <planeGeometry args={[width * 0.98, length * 0.98]} />
      </mesh>

      {/* Raised ivory + gold frame rails — “woven carpet border” */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={`rail-${side}`}
          position={[side * width * 0.5, 0.03, seatZ + length * 0.12]}
          castShadow
        >
          <boxGeometry args={[0.055, 0.045, length * 0.96]} />
          <meshStandardMaterial color="#c9a227" roughness={0.32} metalness={0.55} />
        </mesh>
      ))}
      {([-1, 1] as const).map((end) => (
        <mesh
          key={`hem-${end}`}
          position={[0, 0.03, end > 0 ? noseTipZ - 0.02 : tailZ + 0.02]}
          castShadow
        >
          <boxGeometry args={[width * 0.96, 0.045, 0.06]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.45} metalness={0.2} />
        </mesh>
      ))}

      {/* Soft seat cushion over the bill (keeps rider readable) */}
      <mesh position={[0, 0.02, seatZ]} receiveShadow>
        <boxGeometry args={[width * 0.42, 0.04, povRide ? 0.55 : 0.62]} />
        <meshStandardMaterial color="#14532d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, seatZ]} receiveShadow>
        <boxGeometry args={[width * 0.36, 0.03, povRide ? 0.42 : 0.48]} />
        <meshStandardMaterial color="#c9a227" roughness={0.4} metalness={0.35} />
      </mesh>

      {/* 3D coin medallion on the nose — reinforces “money” in POV */}
      <group ref={medallion} position={[0, 0.08, seatZ + (povRide ? 1.15 : 0.55)]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[povRide ? 0.22 : 0.2, povRide ? 0.22 : 0.2, 0.04, 28]} />
          <meshStandardMaterial color="#eab308" roughness={0.28} metalness={0.65} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <cylinderGeometry args={[povRide ? 0.14 : 0.12, povRide ? 0.14 : 0.12, 0.02, 24]} />
          <meshStandardMaterial color="#14532d" roughness={0.5} />
        </mesh>
        {/* Simple extruded $ bars */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.04, 0.02, povRide ? 0.2 : 0.16]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, 0.35]}>
          <torusGeometry args={[0.07, 0.018, 8, 16, Math.PI * 1.15]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, Math.PI + 0.35]}>
          <torusGeometry args={[0.07, 0.018, 8, 16, Math.PI * 1.15]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.35} metalness={0.4} />
        </mesh>
      </group>

      {/* Gold tassels on nose + tail — the magic-carpet cue */}
      {fringe.map((f, i) => (
        <group key={`tassel-${i}`} position={[f.x, 0.02, f.z]}>
          <mesh
            ref={(el) => {
              if (el) fringeRefs.current[i] = el;
            }}
            castShadow
            position={[0, -f.len * 0.5, 0]}
          >
            <cylinderGeometry args={[0.018, 0.032, f.len, 6]} />
            <meshStandardMaterial color="#c9a227" roughness={0.38} metalness={0.45} />
          </mesh>
          <mesh position={[0, -f.len - 0.02, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#f5e6c8" roughness={0.4} metalness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Short side fringe so the silhouette reads from the flanks */}
      {sideFringe.map((f, i) => (
        <mesh
          key={`side-tassel-${i}`}
          ref={(el) => {
            if (el) fringeRefs.current[fringe.length + i] = el;
          }}
          position={[f.x + f.side * 0.04, -0.02, f.z]}
          rotation={[0.2, 0, f.side * 0.55]}
          castShadow
        >
          <boxGeometry args={[0.22, 0.025, 0.04]} />
          <meshStandardMaterial color="#a16207" roughness={0.42} metalness={0.4} />
        </mesh>
      ))}

      {!hideRider ? (
        <group position={[0, 0.16, seatZ]}>
          <VoyagerMesh character={character} pose="sit" scale={0.85} animationStyle={animationStyle} />
        </group>
      ) : null}

      {buddyOn ? (
        <CarpetCoinBagBuddy
          position={povRide ? [0.72, 0.12, seatZ + 0.2] : [0.55, 0.14, 0.15]}
          scale={povRide ? 0.5 : 0.58}
          rushingRef={rushingRef}
          reducedMotion={reduced}
        />
      ) : null}
    </group>
  );
}
