import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VoyagerMesh } from "./VoyagerMesh";
import type { CapitalCharacter } from "../character";

type Props = {
  character?: CapitalCharacter | null;
  /** bob / flutter while flying */
  flying?: boolean;
  /** First-person: carpet only (no seated body blocking the lens). */
  hideRider?: boolean;
  /**
   * First-person ride layout — long dollar-bill nose ahead of the camera
   * so the money rug fills the lower frame. Local +Z = flight / nose.
   */
  povRide?: boolean;
};

/**
 * Money magic carpet — a flying dollar bill that ripples in the wind.
 * POV mode stretches a long nose in front of the camera so you clearly
 * see you're riding it.
 */
export function MoneyCarpet({
  character,
  flying = true,
  hideRider = false,
  povRide = false,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const cloth = useRef<THREE.Mesh>(null);
  const fringeRefs = useRef<THREE.Mesh[]>([]);
  const tipRefs = useRef<THREE.Mesh[]>([]);

  // POV: long bright bill stretching far ahead of the seat.
  const length = povRide ? 4.6 : 1.6;
  const width = povRide ? 2.05 : 1.75;
  // Seat sits toward the rear; most of the bill is the nose in front (+Z).
  const seatZ = povRide ? -0.95 : 0;
  const noseTipZ = seatZ + length * 0.72;
  const tailZ = seatZ - length * 0.28;

  const geometry = useMemo(() => {
    const segsW = povRide ? 16 : 8;
    const segsL = povRide ? 32 : 12;
    const geo = new THREE.PlaneGeometry(width, length, segsW, segsL);
    geo.rotateX(-Math.PI / 2);
    // Shift so seat origin is near the rear of the bill
    geo.translate(0, 0, seatZ + length * 0.22);
    // Brighter bill greens so POV reads clearly against sky/sea
    const pos = geo.attributes.position!;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const edge = Math.max(Math.abs(x) / (width * 0.5), 0);
      const along = (z - tailZ) / Math.max(0.001, noseTipZ - tailZ);
      const ink = 0.06 + edge * 0.1;
      colors[i * 3] = 0.18 + ink;
      colors[i * 3 + 1] = 0.48 + (1 - edge) * 0.22 + along * 0.06;
      colors[i * 3 + 2] = 0.28 + ink * 0.4;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [width, length, seatZ, noseTipZ, tailZ, povRide]);

  const basePositions = useMemo(() => {
    const pos = geometry.attributes.position!;
    return Float32Array.from(pos.array as ArrayLike<number>);
  }, [geometry]);

  const fringe = useMemo(() => {
    const items: { x: number; z: number; nose: boolean }[] = [];
    const count = povRide ? 16 : 10;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = -width * 0.46 + t * width * 0.92;
      items.push({ x, z: noseTipZ + 0.08, nose: true });
      items.push({ x, z: tailZ - 0.08, nose: false });
    }
    return items;
  }, [povRide, width, noseTipZ, tailZ]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!flying) return;

    // Whole-carpet wind lean — POV keeps the root still so the locked camera
    // stays aimed at the flapping cloth (motion lives in the vertices / fringe).
    if (root.current && !povRide) {
      const gust = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.9) * 0.5;
      root.current.position.y = Math.sin(t * 2.4) * 0.1;
      root.current.rotation.z = gust * 0.05;
      root.current.rotation.x = -0.04 + Math.sin(t * 1.3) * 0.035;
    }

    // Cloth ripple — stronger toward the nose and sides (wind-driven flap).
    if (cloth.current) {
      const pos = cloth.current.geometry.attributes.position!;
      for (let i = 0; i < pos.count; i++) {
        const bx = basePositions[i * 3]!;
        const by = basePositions[i * 3 + 1]!;
        const bz = basePositions[i * 3 + 2]!;
        const along = THREE.MathUtils.clamp((bz - tailZ) / Math.max(0.001, noseTipZ - tailZ), 0, 1);
        const side = Math.abs(bx) / (width * 0.5);
        // Nose flaps hard; seat area stays firmer under the rider.
        const seatFirm = povRide ? THREE.MathUtils.clamp(Math.abs(bz - seatZ) * 1.1, 0.25, 1) : 1;
        const flapAmp =
          (0.06 + along * along * 0.42 + side * 0.16) * seatFirm * (povRide ? 1.6 : 0.9);
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

    // Gold fringe tassels whip in the wind
    for (let i = 0; i < fringeRefs.current.length; i++) {
      const m = fringeRefs.current[i];
      if (!m) continue;
      const nose = fringe[i]?.nose;
      const phase = t * (nose ? 11 : 8) + i * 0.55;
      m.rotation.x = (nose ? 0.55 : 0.35) + Math.sin(phase) * (nose ? 0.55 : 0.3);
      m.rotation.z = Math.sin(phase * 0.7 + i) * 0.25;
    }

    // Nose ornaments ride the tip flap
    for (let i = 0; i < tipRefs.current.length; i++) {
      const m = tipRefs.current[i];
      if (!m) continue;
      m.position.y = 0.1 + Math.sin(t * 7.5 - noseTipZ * 2.8 + i) * (povRide ? 0.14 : 0.06);
    }
  });

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.55,
        metalness: 0.12,
        side: THREE.DoubleSide,
        flatShading: false,
        emissive: new THREE.Color(povRide ? "#14532d" : "#000000"),
        emissiveIntensity: povRide ? 0.22 : 0,
      }),
    [povRide],
  );

  return (
    <group ref={root}>
      {/* Flapping dollar-bill cloth */}
      <mesh ref={cloth} geometry={geometry} material={mat} castShadow receiveShadow />

      {/* Seat pad only — full-length underside would fight the flap */}
      <mesh position={[0, -0.02, seatZ]} receiveShadow>
        <boxGeometry args={[width * 0.55, 0.035, povRide ? 0.7 : length * 0.5]} />
        <meshStandardMaterial color="#0f3d28" roughness={0.85} />
      </mesh>

      {/* Gold border rails along the long edges */}
      {[-1, 1].map((side) => (
        <mesh
          key={`rail-${side}`}
          position={[side * width * 0.48, 0.05, seatZ + length * 0.22]}
          castShadow
        >
          <boxGeometry args={[0.05, 0.03, length * 0.95]} />
          <meshStandardMaterial color="#c9a227" roughness={0.35} metalness={0.45} />
        </mesh>
      ))}

      {/* Big $ seal under / just ahead of the seat — readable in POV */}
      <mesh
        ref={(el) => {
          if (el) tipRefs.current[0] = el;
        }}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, seatZ + 0.55]}
      >
        <circleGeometry args={[povRide ? 0.38 : 0.28, 28]} />
        <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, seatZ + 0.55]}>
        <ringGeometry args={[0.2, 0.28, 24]} />
        <meshStandardMaterial color="#0f3d28" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Extra nose medallions — sit right in the forward POV */}
      {povRide ? (
        <>
          <mesh
            ref={(el) => {
              if (el) tipRefs.current[1] = el;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.1, seatZ + 1.6]}
          >
            <circleGeometry args={[0.26, 24]} />
            <meshStandardMaterial
              color="#c9a227"
              roughness={0.28}
              metalness={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) tipRefs.current[2] = el;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.1, seatZ + 2.7]}
          >
            <circleGeometry args={[0.2, 20]} />
            <meshStandardMaterial
              color="#f4a629"
              roughness={0.3}
              metalness={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Bill serial stripes marching toward the tip */}
          {[1.1, 1.55, 2.0, 2.45, 2.95, 3.35].map((z, i) => (
            <mesh
              key={`stripe-${i}`}
              ref={(el) => {
                if (el) tipRefs.current[3 + i] = el;
              }}
              position={[0, 0.09, seatZ + z]}
            >
              <boxGeometry args={[width * 0.7, 0.015, 0.05]} />
              <meshStandardMaterial color={i % 2 ? "#0f3d28" : "#c9a227"} roughness={0.45} />
            </mesh>
          ))}
          {/* Dollar corners near tip */}
          {[
            [-0.55, 3.1],
            [0.55, 3.1],
            [-0.55, 2.2],
            [0.55, 2.2],
          ].map(([x, z], i) => (
            <mesh
              key={`corner-${i}`}
              ref={(el) => {
                if (el) tipRefs.current[10 + i] = el;
              }}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.1, seatZ + z]}
            >
              <circleGeometry args={[0.09, 10]} />
              <meshStandardMaterial color="#c9a227" roughness={0.4} metalness={0.4} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      ) : null}

      {/* Wind-whipped fringe */}
      {fringe.map((f, i) => (
        <mesh
          key={`fringe-${i}`}
          ref={(el) => {
            if (el) fringeRefs.current[i] = el;
          }}
          position={[f.x, 0.02, f.z]}
          castShadow
        >
          <boxGeometry args={[0.04, 0.03, povRide ? 0.55 : 0.38]} />
          <meshStandardMaterial color="#c9a227" roughness={0.4} metalness={0.35} />
        </mesh>
      ))}

      {!hideRider ? (
        <group position={[0, 0.14, seatZ]}>
          <VoyagerMesh character={character} pose="sit" scale={0.85} />
        </group>
      ) : null}
    </group>
  );
}
