import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";

import { SERIES_LEAD_MASCOT_IDS, getMascot } from "../moneyCast";
import { PLAYABLE_SELECT_CAST } from "../castLooks";
import { SeriesCoinFace } from "./SeriesCoinFace";

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

type Props = {
  selectedId: string;
  /** Prefer the 12 series leads on the SF board; classics optional. */
  ids?: readonly string[];
  onPick: (id: string) => void;
  className?: string;
};

const LEAD_IDS = SERIES_LEAD_MASCOT_IDS as readonly string[];

function CoinCell({
  id,
  index,
  cols,
  rows,
  selected,
  onPick,
}: {
  id: string;
  index: number;
  cols: number;
  rows: number;
  selected: boolean;
  onPick: (id: string) => void;
}) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const spacingX = 1.55;
  const spacingY = 1.55;
  const x = (col - (cols - 1) / 2) * spacingX;
  const y = ((rows - 1) / 2 - row) * spacingY;
  return (
    <group
      position={[x, y, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onPick(id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <SeriesCoinFace id={id} radius={selected ? 0.52 : 0.44} spin selected={selected} />
    </group>
  );
}

function CoinBoard({
  ids,
  selectedId,
  onPick,
}: {
  ids: readonly string[];
  selectedId: string;
  onPick: (id: string) => void;
}) {
  const cols = ids.length <= 12 ? 4 : 5;
  const rows = Math.ceil(ids.length / cols);
  return (
    <>
      <color attach="background" args={["#0c1622"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[2, 4, 6]} intensity={1.15} />
      <pointLight position={[-3, 2, 4]} intensity={0.55} color="#fbbf24" />
      <mesh position={[0, 0, -1.2]} receiveShadow>
        <planeGeometry args={[cols * 2.2, rows * 2.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.92} />
      </mesh>
      {ids.map((id, i) => (
        <CoinCell
          key={id}
          id={id}
          index={i}
          cols={cols}
          rows={rows}
          selected={id === selectedId}
          onPick={onPick}
        />
      ))}
    </>
  );
}

/**
 * Street Fighter–style select: every fighter as a spinning face-forward coin,
 * all visible at once. Tap a coin → parent opens full 3D body + customize.
 */
export function StreetFighterCoinSelect({
  selectedId,
  ids,
  onPick,
  className,
}: Props) {
  const roster = useMemo(() => {
    if (ids?.length) return ids;
    // Series leads first (the 12), then Harbor classics for Outfitter reuse
    const leads = LEAD_IDS;
    const extras = PLAYABLE_SELECT_CAST.filter((id) => !leads.includes(id));
    return [...leads, ...extras];
  }, [ids]);

  // Boot cast: show only the 12 leads so every face fits one screen.
  const boardIds = ids ?? LEAD_IDS;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const selected = getMascot(selectedId);

  const cols = 4;
  const rows = Math.ceil(boardIds.length / cols);
  const camZ = rows <= 3 ? 7.2 : 8.6;

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2_000);
    return () => {
      window.clearTimeout(t);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div
      className={className ?? "absolute inset-0"}
      data-testid="sf-coin-select"
      data-selected={selectedId}
    >
      {!ready && !failed ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#0c1622] text-sm font-bold text-amber-100/80">
          Spinning the cast coins…
        </div>
      ) : null}

      {failed ? (
        // HTML fallback grid — still Street Fighter, still distinct sheets
        <div className="absolute inset-0 overflow-y-auto bg-[#0c1622] px-3 pb-36 pt-24">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 sm:grid-cols-4">
            {boardIds.map((id) => {
              const m = getMascot(id);
              const active = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onPick(id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 ${
                    active
                      ? "border-amber-300 bg-amber-200/20"
                      : "border-white/20 bg-black/40 hover:border-white/50"
                  }`}
                  data-testid={`sf-coin-fallback-${id}`}
                >
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-[#14532d] shadow-inner"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #fde68a, #f4b942 55%, #d97706)",
                    }}
                  >
                    {m.glyph ?? m.emoji}
                  </span>
                  <span className="w-full truncate text-center text-[10px] font-bold text-white">
                    {m.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <CanvasErrorBoundary onError={() => setFailed(true)}>
          <Canvas
            dpr={[1, 1.25]}
            camera={{ position: [0, 0, camZ], fov: 42, near: 0.1, far: 40 }}
            className="absolute inset-0"
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: false,
            }}
            onCreated={({ gl, camera }) => {
              gl.setClearColor("#0c1622", 1);
              camera.lookAt(0, 0, 0);
              setReady(true);
            }}
          >
            <Suspense fallback={null}>
              <CoinBoard ids={boardIds} selectedId={selectedId} onPick={onPick} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}

      {/* Name plate under the board — doesn't cover coins on desktop */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[8.5rem] z-[2] px-4 text-center sm:bottom-40">
        <p className="text-lg font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
          {selected.name}
        </p>
        <p className="mx-auto max-w-md text-xs text-white/80 sm:text-sm">{selected.tagline}</p>
      </div>

      {/* Invisible — keep roster length for tests */}
      <span className="sr-only" data-testid="sf-coin-count">
        {boardIds.length}
      </span>
      <span className="sr-only">{roster.length}</span>
    </div>
  );
}

/** Orthographic helper export for tests */
export const SF_SELECT_LEAD_COUNT = LEAD_IDS.length;
