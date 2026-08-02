import {
  Suspense,
  useCallback,
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
import { BASE_VOYAGER, type CapitalCharacter } from "../character";
import {
  hasSeenCapitalIntro,
  markCapitalIntroSeen,
  shouldPlayCapitalIntroOnBoot,
} from "../views/CapitalOpeningIntro";
import { WorldArriveOverlay } from "../views/WorldArriveOverlay";
import { HARBOR_HAVEN_ID } from "../islandIds";

export { hasSeenCapitalIntro, markCapitalIntroSeen, shouldPlayCapitalIntroOnBoot };

type Props = {
  onComplete: () => void;
  /** Voyager chosen on cast select — rides the carpet into Harbor. */
  character?: CapitalCharacter | null;
};

const LOOK = getEraLook3D("capital-default");
/** Default ride length — short enough to feel like a horizon glide. */
const FLIGHT_SECS = 3.2;
const RUSH_MULT = 3.2;

/**
 * First-person money-carpet opening — you fly toward Harbor Haven (first island).
 * Plays after the title mural and Street Fighter cast select.
 *
 * Camera looks mostly at the island ahead; the flapping dollar bill stays a
 * clear strip underfoot / lower frame without covering the view.
 */
function FlightPov({
  onLanded,
  speedRef,
  character,
}: {
  onLanded: () => void;
  speedRef: MutableRefObject<number>;
  character: CapitalCharacter;
}) {
  const carpet = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const done = useRef(false);
  const { camera } = useThree();
  // Slightly lower eye + stronger carpet hint so the printed banknote rug reads underfoot.
  const localEye = useMemo(() => new THREE.Vector3(0, 0.92, -0.48), []);
  const localHorizon = useMemo(() => new THREE.Vector3(0, 1.2, 42), []);
  const localCarpetHint = useMemo(() => new THREE.Vector3(0, 0.04, 2.6), []);
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
      worldLook.lerp(tmp, 0.22);
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
      <MoneyCarpet character={character} flying hideRider={false} povRide showBuddy />
    </group>
  );
}

function OpeningWorld({
  onLanded,
  speedRef,
  character,
}: {
  onLanded: () => void;
  speedRef: MutableRefObject<number>;
  character: CapitalCharacter;
}) {
  return (
    <>
      <WorldLighting look={LOOK} contactShadows={false} shadowMapSize={512} />
      <OceanWater color={LOOK.sea} shading={LOOK.shading} size={280} calm />
      <EraIslandMesh
        look={LOOK}
        seed="harbor-haven"
        position={[0, -0.2, -6]}
        scale={2.4}
        detail="near"
        showPier
      />
      <EraIslandMesh
        look={getEraLook3D("era-1990s")}
        seed="open-a"
        position={[-28, -0.4, -36]}
        scale={1.6}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-2000s")}
        seed="open-b"
        position={[32, -0.3, -40]}
        scale={1.9}
        detail="far"
      />
      <IslandTitle title="Harbor Haven" subtitle="Ordinary World" height={6.2} accent={LOOK.accent} />
      <FlightPov onLanded={onLanded} speedRef={speedRef} character={character} />
    </>
  );
}

/**
 * Boot carpet ceremony — quieter chrome, iconic Harbor arrive.
 */
export function CarpetOpeningIntro({ onComplete, character }: Props) {
  const rider = character ?? BASE_VOYAGER;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"fly" | "land">("fly");
  const [rushing, setRushing] = useState(false);
  const speedRef = useRef(1);
  const finishing = useRef(false);
  const readyRef = useRef(false);
  readyRef.current = ready;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Never leave players on “Unfolding the Money Carpet…” if WebGL stalls
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => {
      if (!readyRef.current) setReady(true);
    }, 2_400);
    return () => window.clearTimeout(t);
  }, [ready]);

  // Hard land / enter Harbor if the fly loop never reports onLanded
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (finishing.current) return;
      setPhase((p) => (p === "fly" ? "land" : p));
    }, 8_000);
    return () => window.clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    markCapitalIntroSeen();
    try {
      sessionStorage.setItem("capital_boot_land_hub", "1");
    } catch {
      /* ignore */
    }
    onComplete();
  }, [onComplete]);

  // Absolute escape — carpet must never trap the boot forever
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!finishing.current) finish();
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [finish]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
        return;
      }
      if (e.key === "Shift" || e.code === "Space" || e.key === "Enter") {
        if (reduced) return;
        e.preventDefault();
        speedRef.current = RUSH_MULT;
        setRushing(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.code === "Space" || e.key === "Enter") {
        if (reduced) return;
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
  }, [reduced, finish]);

  const onLanded = () => {
    setPhase("land");
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
          Unfolding the Money Carpet…
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
          <OpeningWorld onLanded={onLanded} speedRef={speedRef} character={rider} />
        </Suspense>
      </Canvas>

      {phase === "fly" ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/50 to-transparent px-4 pb-14 pt-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200/90">
              Fortune Archipelago
            </p>
            <p className="mt-1 text-sm font-semibold text-white/95">
              {rushing ? "Rushing to Harbor Haven…" : "Harbor Haven on the horizon"}
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-4 pb-8 pt-20 text-center">
            <button
              type="button"
              className={`pointer-events-auto rounded-full border-2 px-6 py-2.5 text-sm font-extrabold shadow-lg backdrop-blur-sm ${
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
              {rushing ? "Rushing…" : "Hold to rush · Shift"}
            </button>
            <button
              type="button"
              className="pointer-events-auto text-[11px] font-bold uppercase tracking-[0.2em] text-white/55 underline-offset-2 hover:text-white/90 hover:underline"
              onClick={finish}
            >
              Skip
            </button>
          </div>
        </>
      ) : null}

      {phase === "land" ? (
        <WorldArriveOverlay
          islandId={HARBOR_HAVEN_ID}
          islandName="Harbor Haven"
          kind="carpet_land"
          durationMs={1500}
          onDone={finish}
        />
      ) : null}
    </div>
  );
}
