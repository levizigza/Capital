import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { colorHex } from "../character";
import { sheetLookForBase } from "../castLooks";
import { VoyagerMesh } from "./VoyagerMesh";

/** Keep troika/font workers out of the Outfitter — they flake on Pages CSP/hydration. */
class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_e: Error, _info: ErrorInfo) {
    this.props.onError?.();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export type OutfitterStudioMode = "solo" | "lineup";

type FittingProps = {
  character: CapitalCharacter;
  mode: OutfitterStudioMode;
  lineupIds?: readonly string[];
  onPickFighter?: (id: string) => void;
};

function Pedestal({
  active,
  color,
}: {
  active: boolean;
  color: string;
}) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.12, 20]} />
        <meshStandardMaterial
          color={active ? "#fde68a" : "#78716c"}
          roughness={0.55}
          metalness={active ? 0.35 : 0.1}
          emissive={active ? "#f59e0b" : "#000000"}
          emissiveIntensity={active ? 0.35 : 0}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
        <ringGeometry args={[0.34, 0.42, 28]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.45 : 0.12}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function LineupFighter({
  id,
  index,
  total,
  selected,
  detailed,
  onPick,
}: {
  id: string;
  index: number;
  total: number;
  selected: boolean;
  /** Full VoyagerMesh only for nearby / selected — keeps Pages WebGL alive. */
  detailed: boolean;
  onPick?: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const look = useMemo(() => sheetLookForBase(id), [id]);
  const accent = colorHex(look.color);

  // Arc / grid: up to 5 columns, rows fill backward
  const cols = Math.min(5, total);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = (col - (cols - 1) / 2) * 1.35;
  const z = -0.2 - row * 1.45;
  const targetScale = selected ? 1.15 : 0.72;

  useFrame((_, dt) => {
    if (!group.current) return;
    const g = group.current;
    g.position.x = THREE.MathUtils.damp(g.position.x, x, 8, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, z, 8, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, selected ? 0.12 : 0, 8, dt);
    const s = THREE.MathUtils.damp(g.scale.x, targetScale, 8, dt);
    g.scale.setScalar(s);
    if (selected) g.rotation.y += dt * 0.55;
    else g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 6, dt);
  });

  return (
    <group
      ref={group}
      position={[x, 0, z]}
      scale={targetScale}
      onClick={(e) => {
        e.stopPropagation();
        onPick?.(id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <Pedestal active={selected} color={accent} />
      <group position={[0, 0.14, 0]}>
        {detailed ? (
          <VoyagerMesh
            key={`${id}-${look.color}-${look.accessory}-${look.pants}`}
            character={look}
            pose="stand"
            scale={selected ? 1.05 : 0.95}
          />
        ) : (
          <group>
            <mesh castShadow position={[0, 0.55, 0]}>
              <capsuleGeometry args={[0.28, 0.55, 6, 12]} />
              <meshStandardMaterial color={accent} roughness={0.45} metalness={0.2} />
            </mesh>
            <mesh castShadow position={[0, 1.15, 0]}>
              <sphereGeometry args={[0.22, 14, 12]} />
              <meshStandardMaterial color={accent} roughness={0.4} metalness={0.25} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

function StudioCamera({ mode }: { mode: OutfitterStudioMode }) {
  const { camera } = useThree();
  const want = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0, 1.1, 0), []);
  useFrame((_, dt) => {
    if (mode === "lineup") {
      want.set(0, 3.4, 9.2);
      look.set(0, 1.0, -1.2);
    } else {
      want.set(0, 2.1, 5.2);
      look.set(0, 1.1, 0);
    }
    camera.position.lerp(want, 1 - Math.pow(0.001, dt));
    lookTarget.lerp(look, 1 - Math.pow(0.001, dt));
    camera.lookAt(lookTarget);
    const persp = camera as THREE.PerspectiveCamera;
    persp.fov = THREE.MathUtils.damp(persp.fov, mode === "lineup" ? 38 : 42, 6, dt);
    persp.updateProjectionMatrix();
  });
  return null;
}

function FittingRoom({ character, mode, lineupIds, onPickFighter }: FittingProps) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (mode === "solo" && spin.current) spin.current.rotation.y += dt * 0.4;
  });

  const ids = lineupIds ?? [];
  const selectedIndex = Math.max(0, ids.indexOf(character.base));

  return (
    <>
      <color attach="background" args={["#1c1917"]} />
      <fog attach="fog" args={["#1c1917", 12, 22]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[4, 9, 4]}
        intensity={1.25}
        castShadow={mode === "solo"}
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-2.4, 2.6, 1.4]} intensity={0.6} color="#fbbf24" />
      <pointLight position={[2.6, 2.4, -0.6]} intensity={0.45} color="#38bdf8" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[mode === "lineup" ? 4.2 : 1.6, 48]} />
        <meshStandardMaterial color="#efe6d4" roughness={0.7} />
      </mesh>

      <mesh position={[0, 2.4, -5.2]} receiveShadow>
        <boxGeometry args={[14, 5.2, 0.3]} />
        <meshStandardMaterial color="#44403c" roughness={0.92} />
      </mesh>
      {mode === "solo" ? (
        <mesh position={[0, 2.0, -4.95]}>
          <planeGeometry args={[3.2, 2.6]} />
          <meshStandardMaterial color="#bae6fd" metalness={0.55} roughness={0.15} />
        </mesh>
      ) : null}

      {mode === "lineup" ? (
        <group>
          {ids.map((id, i) => (
            <LineupFighter
              key={id}
              id={id}
              index={i}
              total={ids.length}
              selected={id === character.base}
              // Troika off in prod — full cast meshes are safe again.
              detailed
              onPick={onPickFighter}
            />
          ))}
        </group>
      ) : (
        <>
          {([-3.4, 3.4] as const).map((x) => (
            <group key={x} position={[x, 0, -0.5]}>
              <mesh castShadow position={[0, 1.4, 0]}>
                <boxGeometry args={[0.12, 2.6, 0.12]} />
                <meshStandardMaterial color="#292524" roughness={0.6} metalness={0.3} />
              </mesh>
              {[0.7, 1.2, 1.7, 2.2].map((y, i) => (
                <mesh
                  key={y}
                  castShadow
                  position={[x > 0 ? -0.35 : 0.35, y, 0]}
                  rotation={[0, 0, x > 0 ? 0.2 : -0.2]}
                >
                  <boxGeometry args={[0.55, 0.7, 0.08]} />
                  <meshStandardMaterial
                    color={["#0ea5e9", "#f4a629", "#2dd4bf", "#fb7185"][i]!}
                    roughness={0.55}
                  />
                </mesh>
              ))}
            </group>
          ))}
          <mesh castShadow receiveShadow position={[0, 0.45, 2.4]}>
            <boxGeometry args={[4.5, 0.9, 1.1]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          <group ref={spin} position={[0, 0.02, 0.15]}>
            <VoyagerMesh
              key={`${character.base}-${character.color}-${character.accessory}-${character.pants ?? "ink"}-${character.companion}`}
              character={character}
              pantColor={character.pants ? undefined : "#1e3a5f"}
              pose="stand"
              scale={1.25}
            />
          </group>
        </>
      )}

      <StudioCamera mode={mode} />
    </>
  );
}

type Props = {
  character: CapitalCharacter;
  className?: string;
  /** solo = Snapchat mirror; lineup = 3D fighter select floor */
  mode?: OutfitterStudioMode;
  lineupIds?: readonly string[];
  onPickFighter?: (id: string) => void;
};

/**
 * Walk-in 3D Outfitter — live Voyager mannequin (solo) or full 3D cast lineup.
 * Mount only while plaza Canvas is hidden (one WebGL context at a time).
 */
export function OutfitterStudio3D({
  character,
  className,
  mode = "solo",
  lineupIds,
  onPickFighter,
}: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Lineup of every fighter is heavy — keep shadows off and cap DPR in lineup.
  const lineup = mode === "lineup";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.cursor = "auto";
    };
  }, []);

  // Never leave boot stuck on “Opening the 3D Outfitter…” — UI chrome must stay usable.
  useEffect(() => {
    if (ready || failed) return;
    const t = window.setTimeout(() => setReady(true), 2_200);
    return () => window.clearTimeout(t);
  }, [ready, failed]);

  return (
    <div
      className={className ?? "absolute inset-0"}
      data-testid="outfitter-studio-3d"
      data-mode={mode}
      aria-hidden={!ready}
    >
      {!ready && !failed ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#1c1917] text-sm font-bold text-amber-100/80">
          Opening the 3D Outfitter…
        </div>
      ) : null}
      {failed ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#1c1917] px-6 text-center text-sm font-bold text-amber-100/90">
          3D Outfitter couldn’t start on this device — use Customize to continue with your pick.
        </div>
      ) : (
        <CanvasErrorBoundary onError={() => setFailed(true)}>
          <Canvas
            shadows={!reduced && !lineup}
            dpr={reduced || lineup ? [1, 1] : [1, 1.25]}
            camera={{ position: lineup ? [0, 3.4, 9.2] : [0, 2.1, 5.2], fov: lineup ? 38 : 42 }}
            className="absolute inset-0"
            gl={{
              antialias: !reduced,
              alpha: false,
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: false,
            }}
            onCreated={({ gl, camera }) => {
              gl.setClearColor("#1c1917", 1);
              camera.lookAt(0, lineup ? 1.0 : 1.1, lineup ? -1.2 : 0);
              setReady(true);
            }}
          >
            <Suspense fallback={null}>
              <FittingRoom
                character={character}
                mode={mode}
                lineupIds={lineupIds}
                onPickFighter={onPickFighter}
              />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
