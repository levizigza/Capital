import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh } from "./VoyagerMesh";

function Turntable({
  character,
  autoSpin = true,
}: {
  character: CapitalCharacter;
  autoSpin?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current || !autoSpin) return;
    group.current.rotation.y += dt * 0.55;
  });
  return (
    <group ref={group}>
      <VoyagerMesh character={character} pose="stand" scale={1.15} />
    </group>
  );
}

type Props = {
  character: CapitalCharacter;
  className?: string;
  /** Pause spin for reduced motion */
  reducedMotion?: boolean;
};

/**
 * Live 3D mannequin for Outfitter / Snapchat-style style picking.
 * Own Canvas — only mount when plaza Canvas is hidden.
 */
export function CharacterPreview3D({ character, className, reducedMotion }: Props) {
  const [ready, setReady] = useState(false);
  return (
    <div className={className ?? "relative h-full w-full"} data-testid="character-preview-3d">
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-white/70">
          Loading look…
        </div>
      ) : null}
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 1.35, 3.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 6, 4]} intensity={1.15} castShadow={false} />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <circleGeometry args={[1.2, 32]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.55} />
          </mesh>
          <Turntable character={character} autoSpin={!reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
