import { Suspense } from "react";
import { ContactShadows, Sky, Stars } from "@react-three/drei";
import type { EraLook3D } from "./eraLooks";
import type { SkyMode } from "./ledgerlight";
import { SHORE_WORLD_SCALE } from "./ledgerlight";

type Props = {
  look: EraLook3D;
  /** Soft ground contact blob (Harbor / near scenes). */
  contactShadows?: boolean;
  /** Cap shadow map for perf. */
  shadowMapSize?: number;
};

function resolveSkyMode(look: EraLook3D): SkyMode {
  if (look.skyMode) return look.skyMode;
  if (look.shading === "vector" || look.shading === "wire") return "stars";
  if (look.shading === "neon") return "night";
  return "day";
}

/**
 * Ledgerlight lighting kit — sunsets, starfields, and void nights.
 * No CDN HDRI (can hang Suspense on blocked networks).
 */
export function WorldLighting({
  look,
  contactShadows = false,
  shadowMapSize = 1024,
}: Props) {
  const skyMode = resolveSkyMode(look);
  const neon = look.shading === "neon";
  const voidNight = skyMode === "void";
  const starry = skyMode === "stars" || skyMode === "night" || voidNight;
  const sunset = skyMode === "sunset";

  // Honest ambient — dark eras stay dark so emissive characters read as people
  const ambient = voidNight
    ? Math.min(0.22, look.ambientIntensity)
    : starry
      ? Math.max(0.18, Math.min(0.42, look.ambientIntensity))
      : Math.max(0.38, look.ambientIntensity);

  const keyIntensity = voidNight ? 0.35 : sunset ? 1.15 : neon ? 0.95 : starry ? 0.55 : 1.45;
  const keyPos: [number, number, number] = sunset
    ? [55, 6, 28]
    : voidNight
      ? [12, 8, -30]
      : neon
        ? [40, 8, 20]
        : starry
          ? [20, 14, 40]
          : [28, 42, 18];

  const fillColor = sunset ? "#ffb070" : voidNight ? "#6d28d9" : starry ? "#93c5fd" : "#c4e8ff";
  const fillIntensity = voidNight ? 0.22 : sunset ? 0.45 : 0.35;
  const shadowExtent = 40 * SHORE_WORLD_SCALE;

  return (
    <>
      <color attach="background" args={[look.skyTop]} />
      <fog attach="fog" args={[look.fog, look.fogNear * (starry ? 0.85 : 1), look.fogFar * SHORE_WORLD_SCALE * 0.75]} />
      <ambientLight intensity={ambient} />
      <hemisphereLight
        args={[look.skyTop, look.shore, voidNight ? 0.25 : sunset ? 0.65 : 0.55]}
      />
      <directionalLight
        castShadow
        position={keyPos}
        intensity={keyIntensity}
        color={look.sunColor}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={160 * SHORE_WORLD_SCALE}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-22, 16, -14]} intensity={fillIntensity} color={fillColor} />
      {voidNight ? (
        <pointLight position={[0, 4, 0]} intensity={0.55} distance={48} color={look.accent} />
      ) : null}

      {starry ? (
        <Stars
          radius={160 * SHORE_WORLD_SCALE}
          depth={voidNight ? 80 : 55}
          count={voidNight ? 2200 : skyMode === "night" ? 1400 : 1000}
          factor={voidNight ? 4.2 : 3.2}
          saturation={voidNight ? 0.35 : 0}
          fade
          speed={voidNight ? 0.25 : 0.5}
        />
      ) : (
        <Sky
          sunPosition={keyPos}
          turbidity={sunset ? 12 : neon ? 2 : 6}
          rayleigh={sunset ? 2.4 : neon ? 0.35 : 1.15}
          mieCoefficient={sunset ? 0.02 : 0.004}
          mieDirectionalG={sunset ? 0.95 : 0.8}
        />
      )}

      {contactShadows ? (
        <Suspense fallback={null}>
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={48 * SHORE_WORLD_SCALE}
            blur={2.2}
            far={12 * SHORE_WORLD_SCALE}
            color="#0c1622"
          />
        </Suspense>
      ) : null}
    </>
  );
}
