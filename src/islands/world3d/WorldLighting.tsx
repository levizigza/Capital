import { Suspense } from "react";
import { ContactShadows, Sky, Stars } from "@react-three/drei";
import type { EraLook3D } from "./eraLooks";

type Props = {
  look: EraLook3D;
  /** Soft ground contact blob (Harbor / near scenes). */
  contactShadows?: boolean;
  /** Cap shadow map for perf. */
  shadowMapSize?: number;
};

/**
 * Shared cinematic lighting kit — sun/sky/fog without CDN HDRI waits.
 * (drei Environment presets can hang Suspense on blocked networks → blank canvas.)
 */
export function WorldLighting({
  look,
  contactShadows = false,
  shadowMapSize = 1024,
}: Props) {
  const wireEra = look.shading === "vector" || look.shading === "wire";
  const neon = look.shading === "neon";

  return (
    <>
      <color attach="background" args={[look.skyTop]} />
      <fog attach="fog" args={[look.fog, look.fogNear, look.fogFar]} />
      <ambientLight intensity={Math.max(0.45, look.ambientIntensity)} />
      <hemisphereLight args={[look.skyTop, look.shore, 0.55]} />
      <directionalLight
        castShadow
        position={[28, 42, 18]}
        intensity={neon ? 1.05 : 1.45}
        color={look.sunColor}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={120}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0002}
      />
      {/* Fill light so islands never render as a black void */}
      <directionalLight position={[-20, 18, -12]} intensity={0.35} color="#c4e8ff" />
      {wireEra ? (
        <Stars radius={140} depth={50} count={900} factor={3} saturation={0} fade speed={0.55} />
      ) : (
        <Sky
          sunPosition={neon ? [40, 8, 20] : [80, 28, 40]}
          turbidity={neon ? 2 : 6}
          rayleigh={neon ? 0.35 : 1.15}
          mieCoefficient={0.004}
          mieDirectionalG={0.8}
        />
      )}
      {contactShadows ? (
        <Suspense fallback={null}>
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={48}
            blur={2.2}
            far={12}
            color="#0c1622"
          />
        </Suspense>
      ) : null}
    </>
  );
}
