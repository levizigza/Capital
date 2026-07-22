import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
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
/** Default ride length — short enough to feel like a horizon glide. */
const FLIGHT_SECS = 5.5;
const RUSH_MULT = 3.2;

/**
 * First-person money-carpet opening — you fly toward Harbor Haven (first island).
 * Plays after the Capital title mural.
 *
 * Camera looks mostly at the island ahead; the flapping dollar bill stays a
 * clear strip underfoot / lower frame without covering the view.
 */
function FlightPov({
  onLanded,
  speedRef,
}: {
  onLanded: () => void;
  speedRef: MutableRefObject<number>;
}) {
  const carpet = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const done = useRef(false);
  const { camera } = useThree();
  const localEye = useMemo(() => new THREE.Vector3(0, 1.05, -0.55), []);
  const localHorizon = useMemo(() => new THREE.Vector3(0, 1.35, 42), []);
  const localCarpetHint = useMemo(() => new THREE.Vector3(0, 0.02, 3.4), []);
  const worldEye = useMemo(() => new THREE.Vector3(), []);
  const worldLook = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const start = useMemo(() => new THREE.Vector3(0, 5.2, 48), []);
  const end = useMemo(() => new THREE.Vector3(0, 3.6, 9), []);

  useFrame((_, dt) => {
    if (done.current) return;
    const rate = Math.max(1, speedRef.current);
    progress.current = Math.min(1, progress.current + (dt * rate) / FLIGHT_SECS);
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
      carpet.current.rotation.x = -0.06 + Math.sin(t * 5) * 0.015;
      carpet.current.updateMatrixWorld(true);

      worldEye.copy(localEye).applyMatrix4(carpet.current.matrixWorld);
      worldLook.copy(localHorizon).applyMatrix4(carpet.current.matrixWorld);
      tmp.copy(localCarpetHint).applyMatrix4(carpet.current.matrixWorld);
      worldLook.lerp(tmp, 0.1);
      camera.position.copy(worldEye);
      camera.lookAt(worldLook);
      camera.fov = 68;
      camera.updateProjectionMatrix();
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

function OpeningWorld({
  onLanded,
  speedRef,
}: {
  onLanded: () => void;
  speedRef: MutableRefObject<number>;
}) {
  return (
    <>
      <WorldLighting look={{ ...LOOK, fogNear: 22, fogFar: 130 }} shadowMapSize={512} />
      <OceanWater color={LOOK.sea} shading={LOOK.shading} size={1200} />

      <EraIslandMesh
        look={LOOK}
        seed="harbor-haven"
        position={[0, 0, -6]}
        scale={2.8}
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

      <FlightPov onLanded={onLanded} speedRef={speedRef} />
    </>
  );
}

export function CarpetOpeningIntro({ onComplete }: Props) {
  const [phase, setPhase] = useState<"fly" | "land">("fly");
  const [ready, setReady] = useState(false);
  const [rushing, setRushing] = useState(false);
  const finishing = useRef(false);
  const speedRef = useRef(1);
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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.code === "Space") {
        e.preventDefault();
        speedRef.current = RUSH_MULT;
        setRushing(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.code === "Space") {
        speedRef.current = 1;
        setRushing(false);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
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
    window.setTimeout(finish, 900);
  };

  const setRush = (on: boolean) => {
    speedRef.current = on ? RUSH_MULT : 1;
    setRushing(on);
  };

  return (
    <div
      className="capital-carpet-stage fixed inset-0 z-[10000] bg-[#0c1622]"
      role="dialog"
      aria-label="Flying to Harbor Haven"
      data-testid="carpet-opening-intro"
    >
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#0c1622] text-sm font-bold text-white/70">
          Loading carpet flight…
        </div>
      ) : null}
      <Canvas
        shadows
        dpr={reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 5.5, 48], fov: 68, near: 0.08, far: 260 }}
        className="absolute inset-0 z-[2] h-full w-full"
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#7dd3fc", 1);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <OpeningWorld onLanded={onLanded} speedRef={speedRef} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/45 to-transparent px-4 pb-12 pt-5 text-center">
        <p className="text-sm font-semibold text-white/90">
          {phase === "fly"
            ? rushing
              ? "Rushing to Harbor Haven…"
              : "Harbor Haven on the horizon"
            : "Landing…"}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-4 pb-7 pt-16 text-center">
        {phase === "fly" ? (
          <button
            type="button"
            className={`pointer-events-auto rounded-full border-2 px-5 py-2.5 text-sm font-extrabold shadow-lg backdrop-blur-sm ${
              rushing
                ? "border-amber-200 bg-amber-400 text-[#16283b]"
                : "border-white/30 bg-white/15 text-white hover:bg-white/25"
            }`}
            onPointerDown={(e) => {
              e.preventDefault();
              setRush(true);
            }}
            onPointerUp={() => setRush(false)}
            onPointerLeave={() => setRush(false)}
            onPointerCancel={() => setRush(false)}
          >
            {rushing ? "Rushing…" : "Hold to speed up"}
          </button>
        ) : null}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
          {phase === "fly" ? (
            <button
              type="button"
              className="rounded-full border-2 border-[#16283b] bg-[#f4a629] px-4 py-2 text-xs font-extrabold text-[#16283b] shadow-lg"
              onClick={() => setRush(true)}
            >
              Rush to island →
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20"
            onClick={finish}
          >
            Skip →
          </button>
        </div>
      </div>

      {phase === "land" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 text-xl font-black text-white">
          Harbor Haven
        </div>
      ) : null}
    </div>
  );
}
