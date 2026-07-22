import { Environment, ContactShadows, Sky, Stars } from "@react-three/drei";
import type { EraLook3D } from "./eraLooks";

type Props = {
  look: EraLook3D;
  /** Soft ground contact blob (Harbor / near scenes). */
  contactShadows?: boolean;
  /** Cap shadow map for perf. */
  shadowMapSize?: number;
};

/**
 * Shared cinematic lighting kit — Environment + sun + fog-friendly sky.
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
      <ambientLight intensity={look.ambientIntensity} />
      <hemisphereLight
        args={[look.skyTop, look.shore, 0.35]}
      />
      <directionalLight
        castShadow
        position={[28, 42, 18]}
        intensity={neon ? 0.95 : 1.25}
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
      {!wireEra ? (
        <Environment preset={look.shading === "cinematic" ? "city" : "sunset"} />
      ) : null}
      {wireEra ? (
        <Stars radius={140} depth={50} count={2800} factor={3} saturation={0} fade speed={0.55} />
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
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.45}
          scale={48}
          blur={2.4}
          far={12}
          color="#0c1622"
        />
      ) : null}
    </>
  );
}
