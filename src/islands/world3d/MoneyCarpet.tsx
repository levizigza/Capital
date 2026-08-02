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
    // Clone so POV/third-person can orient the print independently of the cache.
    const base = getMoneyCarpetTexture();
    const map = base.clone();
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    // PlaneGeometry → rotateX(-π/2) leaves the print mirrored from the seat.
    map.repeat.x = -1;
    map.offset.x = 1;
    map.needsUpdate = true;
    return map;
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
      // Gentle magic-carpet lift at the nose — keep POV readable as a rug, not a balloon.
      const noseCurl = along * along * (povRide ? 0.07 : 0.1);
      const cornerDip = side * side * (1 - along) * 0.03;
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
    const count = povRide ? 15 : 11;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = -width * 0.44 + t * width * 0.88;
      // Long nose tassels trail into the POV frame so the rug reads as a carpet.
      const noseLen = (povRide ? 0.55 : 0.38) + Math.abs(t - 0.5) * 0.2;
      const tailLen = (povRide ? 0.4 : 0.32) + Math.abs(t - 0.5) * 0.12;
      items.push({ x, z: noseTipZ + 0.04, nose: true, len: noseLen });
      items.push({ x, z: tailZ - 0.04, nose: false, len: tailLen });
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
        // Keep flap gentle near the seat so POV never peeks at a mirrored underside.
        const flapAmp =
          (0.03 + along * along * 0.2 + side * 0.08) * seatFirm * (povRide ? 0.85 : 0.75);
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
    // FrontSide only — DoubleSide mirrored the banknote when the camera
    // grazed the underside during POV flap.
    if (texture) {
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.52,
        metalness: 0.08,
        side: THREE.FrontSide,
        emissive: new THREE.Color(povRide ? "#0a2f1c" : "#000000"),
        emissiveIntensity: povRide ? 0.14 : 0,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: "#217a4a",
      roughness: 0.55,
      metalness: 0.08,
      side: THREE.FrontSide,
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

      {/* Dark underside — separate mesh so the printed face stays FrontSide-only */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -0.014, seatZ + length * 0.12]}
        material={underMat}
        receiveShadow
      >
        <planeGeometry args={[width * 0.98, length * 0.98]} />
      </mesh>

      {/* Thick woven hem so the rug has volume, not paper-thin card stock */}
      <mesh position={[0, -0.03, seatZ + length * 0.12]} castShadow>
        <boxGeometry args={[width * 0.92, 0.045, length * 0.9]} />
        <meshStandardMaterial color="#0f3d28" roughness={0.9} />
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

      {/* 3D coin medallions — geometry $, not texture, so POV always reads “money” */}
      {(
        povRide
          ? ([
              [0, seatZ + 1.05, 0.24],
              [-0.42, seatZ + 0.55, 0.16],
              [0.42, seatZ + 0.55, 0.16],
            ] as const)
          : ([[0, seatZ + 0.55, 0.2]] as const)
      ).map(([x, z, r], i) => (
        <group
          key={`seal-${i}`}
          ref={i === 0 ? medallion : undefined}
          position={[x, 0.09, z]}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[r, r, 0.045, 28]} />
            <meshStandardMaterial color="#eab308" roughness={0.28} metalness={0.65} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
            <cylinderGeometry args={[r * 0.62, r * 0.62, 0.02, 24]} />
            <meshStandardMaterial color="#14532d" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[r * 0.18, 0.02, r * 0.9]} />
            <meshStandardMaterial color="#f5e6c8" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.045, 0]} rotation={[0, 0, 0.35]}>
            <torusGeometry args={[r * 0.32, r * 0.08, 8, 16, Math.PI * 1.15]} />
            <meshStandardMaterial color="#f5e6c8" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.045, 0]} rotation={[0, 0, Math.PI + 0.35]}>
            <torusGeometry args={[r * 0.32, r * 0.08, 8, 16, Math.PI * 1.15]} />
            <meshStandardMaterial color="#f5e6c8" roughness={0.35} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Gold tassels on nose + tail — the magic-carpet cue */}
      {fringe.map((f, i) => (
        <group
          key={`tassel-${i}`}
          position={[f.x, 0.04, f.z]}
          rotation={[f.nose ? 1.15 : 0.35, 0, 0]}
        >
          <mesh
            ref={(el) => {
              if (el) fringeRefs.current[i] = el;
            }}
            castShadow
            position={[0, -f.len * 0.5, 0]}
          >
            <cylinderGeometry args={[0.022, 0.04, f.len, 6]} />
            <meshStandardMaterial color="#c9a227" roughness={0.38} metalness={0.45} />
          </mesh>
          <mesh position={[0, -f.len - 0.02, 0]}>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial color="#f5e6c8" roughness={0.4} metalness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Side fringe — bright gold ribbons into the POV flanks */}
      {sideFringe.map((f, i) => (
        <mesh
          key={`side-tassel-${i}`}
          ref={(el) => {
            if (el) fringeRefs.current[fringe.length + i] = el;
          }}
          position={[f.x + f.side * (povRide ? 0.12 : 0.06), 0.02, f.z]}
          rotation={[0.15, 0, f.side * (povRide ? 0.9 : 0.55)]}
          castShadow
        >
          <boxGeometry args={[povRide ? 0.38 : 0.24, 0.03, 0.05]} />
          <meshStandardMaterial color="#eab308" roughness={0.35} metalness={0.5} />
        </mesh>
      ))}

      {/* Corner knotted tassels — classic flying-carpet silhouette */}
      {(
        [
          [-width * 0.48, noseTipZ + 0.02],
          [width * 0.48, noseTipZ + 0.02],
          [-width * 0.48, tailZ - 0.02],
          [width * 0.48, tailZ - 0.02],
        ] as const
      ).map(([x, z], i) => (
        <group key={`corner-${i}`} position={[x, 0.05, z]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.055, 0.42, 8]} />
            <meshStandardMaterial color="#c9a227" roughness={0.35} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#fde68a" roughness={0.35} metalness={0.45} />
          </mesh>
        </group>
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
