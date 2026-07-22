import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";

function FittingRoom({ character }: { character: CapitalCharacter }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.4;
  });

  return (
    <>
      <color attach="background" args={["#2a1f18"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 3]} intensity={1.2} castShadow shadow-mapSize={[512, 512]} />
      <pointLight position={[-2.2, 2.4, 1.2]} intensity={0.55} color="#fbbf24" />
      <pointLight position={[2.4, 2.2, -0.8]} intensity={0.4} color="#38bdf8" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#c4a574" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[1.6, 40]} />
        <meshStandardMaterial color="#efe6d4" roughness={0.7} />
      </mesh>

      {/* Back wall + mirror plane */}
      <mesh position={[0, 2.2, -3.2]} receiveShadow>
        <boxGeometry args={[9, 4.5, 0.25]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, -3.0]}>
        <planeGeometry args={[3.2, 2.6]} />
        <meshStandardMaterial color="#bae6fd" metalness={0.55} roughness={0.15} />
      </mesh>
      <Billboard position={[0, 3.55, -2.9]} follow>
        <Text fontSize={0.28} color="#fff7ed" anchorX="center" outlineWidth={0.02} outlineColor="#1c1917">
          Fitting mirror
        </Text>
      </Billboard>

      {/* Side racks */}
      {[-3.4, 3.4].map((x) => (
        <group key={x} position={[x, 0, -0.5]}>
          <mesh castShadow position={[0, 1.4, 0]}>
            <boxGeometry args={[0.12, 2.6, 0.12]} />
            <meshStandardMaterial color="#292524" roughness={0.6} metalness={0.3} />
          </mesh>
          {[0.7, 1.2, 1.7, 2.2].map((y, i) => (
            <mesh key={y} castShadow position={[x > 0 ? -0.35 : 0.35, y, 0]} rotation={[0, 0, x > 0 ? 0.2 : -0.2]}>
              <boxGeometry args={[0.55, 0.7, 0.08]} />
              <meshStandardMaterial
                color={["#0ea5e9", "#f4a629", "#2dd4bf", "#fb7185"][i]!}
                roughness={0.55}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Counter */}
      <mesh castShadow receiveShadow position={[0, 0.45, 2.4]}>
        <boxGeometry args={[4.5, 0.9, 1.1]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      <group ref={spin} position={[0, 0.02, 0.15]}>
        <VoyagerMesh
          key={`${character.base}-${character.color}-${character.accessory}-${character.companion}`}
          character={character}
          pose="stand"
          scale={1.25}
        />
      </group>
    </>
  );
}

type Props = {
  character: CapitalCharacter;
  className?: string;
};

/**
 * Walk-in 3D Outfitter interior — mirrors, racks, live Voyager mannequin.
 * Mount only while plaza Canvas is hidden (one WebGL context at a time).
 */
export function OutfitterStudio3D({ character, className }: Props) {
  const [ready, setReady] = useState(false);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className={className ?? "absolute inset-0"}
      data-testid="outfitter-studio-3d"
      aria-hidden={!ready}
    >
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#2a1f18] text-sm font-bold text-amber-100/80">
          Opening the Outfitter…
        </div>
      ) : null}
      <Canvas
        shadows={!reduced}
        dpr={reduced ? [1, 1] : [1, 1.25]}
        camera={{ position: [0, 2.1, 5.2], fov: 42 }}
        className="absolute inset-0"
        gl={{ antialias: !reduced, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor("#2a1f18", 1);
          camera.lookAt(0, 1.1, 0);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <FittingRoom character={character} />
        </Suspense>
      </Canvas>
    </div>
  );
}
