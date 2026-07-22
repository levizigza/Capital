import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { MoneyCarpet } from "./MoneyCarpet";
import { EraIslandMesh } from "./EraIslandMesh";
import { getEraLook3D } from "./eraLooks";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { IslandTitle } from "./IslandTitle";
import { BASE_VOYAGER } from "../character";
import {
  hasSeenCapitalIntro,
  markCapitalIntroSeen,
  shouldPlayCapitalIntroOnBoot,
} from "../views/CapitalOpeningIntro";

export { hasSeenCapitalIntro, markCapitalIntroSeen, shouldPlayCapitalIntroOnBoot };

type Props = {
  onComplete: () => void;
};

const LOOK = getEraLook3D("capital-default");
const FLIGHT_SECS = 11;

/**
 * First-person money-carpet opening — you fly toward Harbor Haven (first island).
 * Plays after the Capital title mural.
 *
 * Camera looks mostly at the island ahead; the flapping dollar bill stays a
 * clear strip underfoot / lower frame without covering the view.
 */
function FlightPov({ onLanded }: { onLanded: () => void }) {
  const carpet = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const done = useRef(false);
  const { camera } = useThree();
  // Sit above the rug, look out toward the horizon (island stays readable).
  const localEye = useMemo(() => new THREE.Vector3(0, 0.82, -0.35), []);
  const localHorizon = useMemo(() => new THREE.Vector3(0, 0.55, 16), []);
  const localCarpetHint = useMemo(() => new THREE.Vector3(0, 0.06, 2.2), []);
  const worldEye = useMemo(() => new THREE.Vector3(), []);
  const worldLook = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const start = useMemo(() => new THREE.Vector3(0, 4.5, 55), []);
  const end = useMemo(() => new THREE.Vector3(0, 3.2, 8), []);

  useFrame((_, dt) => {
    if (done.current) return;
    progress.current = Math.min(1, progress.current + dt / FLIGHT_SECS);
    const t = progress.current;
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const pos = new THREE.Vector3().lerpVectors(start, end, e);
    pos.y += Math.sin(t * Math.PI * 4) * 0.35 + Math.sin(performance.now() / 400) * 0.12;
    pos.x += Math.sin(t * Math.PI * 2) * 1.8;

    const heading = Math.atan2(end.x - start.x, end.z - start.z) + Math.sin(t * 6) * 0.08;

    if (carpet.current) {
      carpet.current.position.copy(pos);
      carpet.current.rotation.order = "YXZ";
      carpet.current.rotation.y = heading;
      carpet.current.rotation.z = Math.sin(t * 8) * 0.025;
      carpet.current.rotation.x = -0.04 + Math.sin(t * 5) * 0.015;
      carpet.current.updateMatrixWorld(true);

      worldEye.copy(localEye).applyMatrix4(carpet.current.matrixWorld);
      // Mostly horizon/island; a touch of carpet-ahead so the lower frame still reads “riding”.
      worldLook.copy(localHorizon).applyMatrix4(carpet.current.matrixWorld);
      tmp.copy(localCarpetHint).applyMatrix4(carpet.current.matrixWorld);
      worldLook.lerp(tmp, 0.18);
      camera.position.copy(worldEye);
      camera.lookAt(worldLook);
    }

    if (t >= 1 && !done.current) {
      done.current = true;
      onLanded();
    }
  });

  return (
    <group ref={carpet}>
      <MoneyCarpet character={BASE_VOYAGER} flying hideRider povRide />
    </group>
  );
}

function OpeningWorld({ onLanded }: { onLanded: () => void }) {
  return (
    <>
      <WorldLighting look={{ ...LOOK, fogNear: 18, fogFar: 95 }} shadowMapSize={1024} />
      <OceanWater color={LOOK.sea} shading={LOOK.shading} />

      <EraIslandMesh
        look={LOOK}
        seed="harbor-haven"
        position={[0, 0, -6]}
        scale={2.6}
        detail="near"
        showPier
        selected
      />
      <IslandTitle
        title="Harbor Haven"
        subtitle="Your first island"
        height={9.8}
        position={[0, 0, -6]}
        accent={LOOK.accent}
      />

      <EraIslandMesh
        look={getEraLook3D("era-1980s")}
        seed="horizon-80s"
        position={[-28, 0, -40]}
        scale={1.4}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-1990s")}
        seed="horizon-90s"
        position={[32, 0, -48]}
        scale={1.6}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-1960s")}
        seed="horizon-60s"
        position={[18, 0, -70]}
        scale={1.2}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-2000s")}
        seed="horizon-00s"
        position={[-22, 0, -62]}
        scale={1.5}
        detail="far"
      />

      <FlightPov onLanded={onLanded} />
    </>
  );
}

export function CarpetOpeningIntro({ onComplete }: Props) {
  const [phase, setPhase] = useState<"fly" | "land">("fly");
  const finishing = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const finish = () => {
    if (finishing.current) return;
    finishing.current = true;
    markCapitalIntroSeen();
    try {
      sessionStorage.setItem("capital_boot_land_hub", "1");
    } catch {
      /* ignore */
    }
    onComplete();
  };

  const onLanded = () => {
    setPhase("land");
    window.setTimeout(finish, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-[#0c1622]"
      role="dialog"
      aria-label="Flying to Harbor Haven"
      data-testid="carpet-opening-intro"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-[#0c1622] text-sm font-bold text-white/70">
        Loading carpet flight…
      </div>
      <Canvas
        shadows
        dpr={reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 5, 55], fov: 65, near: 0.08, far: 220 }}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#7dd3fc", 1);
        }}
      >
        <Suspense fallback={null}>
          <OpeningWorld onLanded={onLanded} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/40 to-transparent px-4 pb-10 pt-5 text-center">
        <p className="text-sm font-semibold text-white/90">
          {phase === "fly" ? "Harbor Haven ahead" : "Landing…"}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/55 to-transparent px-4 pb-6 pt-12 text-center">
        <button
          type="button"
          className="pointer-events-auto rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20"
          onClick={finish}
        >
          Skip →
        </button>
      </div>

      {phase === "land" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 text-xl font-black text-white">
          Harbor Haven
        </div>
      ) : null}
    </div>
  );
}
