import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

function CapsuleRoom() {
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      const m = glow.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.35 + Math.sin(clock.elapsedTime * 2.2) * 0.15;
    }
  });

  return (
    <>
      <color attach="background" args={["#1e293b"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 7, 4]} intensity={1.15} castShadow shadow-mapSize={[512, 512]} />
      <pointLight position={[-2, 2.5, 1]} intensity={0.5} color="#fbbf24" />
      <pointLight position={[2.2, 2.2, -1]} intensity={0.45} color="#38bdf8" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[1.8, 40]} />
        <meshStandardMaterial color="#0f172a" roughness={0.75} />
      </mesh>

      {/* Back wall + stall header */}
      <mesh position={[0, 2.2, -3.1]} receiveShadow>
        <boxGeometry args={[9, 4.5, 0.25]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      <Billboard position={[0, 3.5, -2.9]} follow>
        <Text fontSize={0.32} color="#fde68a" anchorX="center" outlineWidth={0.025} outlineColor="#0f172a">
          Capsule Stall
        </Text>
      </Billboard>

      {/* Display counter */}
      <mesh castShadow receiveShadow position={[0, 0.55, 1.8]}>
        <boxGeometry args={[5.2, 1.1, 1.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Capsule products on the counter */}
      {[
        { x: -1.6, color: "#0ea5e9" },
        { x: -0.55, color: "#f4a629" },
        { x: 0.55, color: "#2dd4bf" },
        { x: 1.6, color: "#fb7185" },
      ].map((c) => (
        <group key={c.x} position={[c.x, 1.25, 1.75]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.22, 0.45, 6, 12]} />
            <meshStandardMaterial color={c.color} roughness={0.35} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Glowing showcase capsule */}
      <mesh ref={glow} castShadow position={[0, 1.6, -1.2]}>
        <capsuleGeometry args={[0.55, 1.1, 8, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.4}
          roughness={0.25}
          metalness={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Side shelves */}
      {[-3.2, 3.2].map((x) => (
        <group key={x} position={[x, 0, -0.4]}>
          <mesh castShadow position={[0, 1.5, 0]}>
            <boxGeometry args={[0.9, 2.8, 0.35]} />
            <meshStandardMaterial color="#292524" roughness={0.7} />
          </mesh>
          {[0.6, 1.2, 1.8, 2.4].map((y, i) => (
            <mesh key={y} castShadow position={[0, y, 0.28]}>
              <boxGeometry args={[0.55, 0.35, 0.35]} />
              <meshStandardMaterial
                color={["#38bdf8", "#f4a629", "#a3e635", "#fb7185"][i]!}
                roughness={0.5}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

type Props = {
  className?: string;
};

/**
 * Walk-in 3D Capsule Stall — shelves, glowing capsules, spend counter.
 * Mount only while plaza Canvas is hidden (one WebGL context at a time).
 */
export function CapsuleStudio3D({ className }: Props) {
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
      data-testid="capsule-studio-3d"
      aria-hidden={!ready}
    >
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#0f172a] text-sm font-bold text-sky-100/80">
          Opening Capsule Stall…
        </div>
      ) : null}
      <Canvas
        shadows={!reduced}
        dpr={reduced ? [1, 1] : [1, 1.25]}
        camera={{ position: [0, 2.2, 5.4], fov: 42 }}
        className="absolute inset-0"
        gl={{ antialias: !reduced, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor("#0f172a", 1);
          camera.lookAt(0, 1.2, 0);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <CapsuleRoom />
        </Suspense>
      </Canvas>
    </div>
  );
}
