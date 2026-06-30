import { useEffect, useMemo, useState } from "react";

import {
  computeIntegerScale,
  getPixelAtlasById,
  loadPixelAtlases,
  PixelCanvas,
  PIXEL_VIEWPORT,
  usePixelAnimation,
  type LoadedPixelAtlas,
} from "@/pixel";

const REFRESH_KEY = "pixel-preview-refresh";

function useAtlasList(): LoadedPixelAtlas[] {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_KEY) setTick((t) => t + 1);
    };
    window.addEventListener("storage", onStorage);

    if (import.meta.hot) {
      import.meta.hot.on("vite:afterUpdate", () => setTick((t) => t + 1));
    }

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return useMemo(() => {
    void tick;
    return loadPixelAtlases();
  }, [tick]);
}

export function SpritePreviewTool() {
  const atlases = useAtlasList();
  const [selectedId, setSelectedId] = useState<string>(() => atlases[0]?.id ?? "");
  const [animation, setAnimation] = useState<string>("");
  const [playing, setPlaying] = useState(true);
  const [manualScale, setManualScale] = useState<number | "auto">("auto");
  const [showGrid, setShowGrid] = useState(true);
  const [frameOverride, setFrameOverride] = useState<number | null>(null);

  const atlas = getPixelAtlasById(selectedId) ?? atlases[0];
  const animNames = atlas ? Object.keys(atlas.animations) : [];
  const activeAnim = animation || atlas?.defaultAnimation || animNames[0] || "";

  const animState = usePixelAnimation(atlas, activeAnim, playing && frameOverride == null);

  useEffect(() => {
    if (atlas) setAnimation(atlas.defaultAnimation);
  }, [atlas?.id]);

  const displayFrameKey = useMemo(() => {
    if (!atlas) return "";
    if (frameOverride != null) {
      const keys = atlas.animations[activeAnim]?.frames ?? [];
      return keys[frameOverride] ?? keys[0] ?? "";
    }
    return animState?.frameKey ?? "";
  }, [atlas, activeAnim, animState?.frameKey, frameOverride]);

  const integerScale = manualScale === "auto" ? undefined : manualScale;
  const autoScale = computeIntegerScale(320, 180);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-tight">Pixel Atlas Preview</h1>
            <p className="text-sm text-white/60">
              Dev tool · {PIXEL_VIEWPORT.width}×{PIXEL_VIEWPORT.height} logical · integer scale only
            </p>
          </div>
          <a
            href="/"
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            ← Back to app
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">Atlases ({atlases.length})</h2>
          {atlases.length === 0 ? (
            <p className="text-sm text-amber-300">
              No atlases found. Add <code className="text-xs">content/pixel/**/atlas.json</code>.
            </p>
          ) : (
            <ul className="space-y-1">
              {atlases.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(a.id);
                      setFrameOverride(null);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      a.id === atlas?.id ? "bg-cyan-500/30 font-bold" : "hover:bg-white/10"
                    }`}
                  >
                    <div>{a.name}</div>
                    <div className="text-xs text-white/50">{a.id}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {atlas ? (
          <section className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <PixelCanvas
                atlas={atlas}
                frameKey={displayFrameKey}
                integerScale={integerScale}
                showGrid={showGrid}
                background="#1e293b"
                className="h-64 w-full"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Animation
                <select
                  className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
                  value={activeAnim}
                  onChange={(e) => {
                    setAnimation(e.target.value);
                    setFrameOverride(null);
                  }}
                >
                  {animNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                Integer scale
                <select
                  className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
                  value={manualScale === "auto" ? "auto" : String(manualScale)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setManualScale(v === "auto" ? "auto" : Number(v));
                  }}
                >
                  <option value="auto">Auto-fit ({autoScale}×)</option>
                  {[1, 2, 3, 4, 5, 6, 8].map((s) => (
                    <option key={s} value={s}>
                      {s}×
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold hover:bg-cyan-500"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? "⏸ Pause" : "▶ Play"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
                onClick={() => setShowGrid((g) => !g)}
              >
                Grid {showGrid ? "on" : "off"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                ↻ Reload atlases
              </button>
            </div>

            {atlas.animations[activeAnim] ? (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-white/50">Frame scrub</div>
                <div className="flex flex-wrap gap-2">
                  {atlas.animations[activeAnim].frames.map((key, idx) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setPlaying(false);
                        setFrameOverride(idx);
                      }}
                      className={`rounded border px-2 py-1 text-xs ${
                        frameOverride === idx ? "border-cyan-400 bg-cyan-500/20" : "border-white/20"
                      }`}
                    >
                      {idx}: {key}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <details className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Atlas metadata</summary>
              <pre className="mt-2 overflow-auto text-xs text-white/70">
                {JSON.stringify(
                  {
                    id: atlas.id,
                    entityId: atlas.entityId,
                    directory: atlas.directory,
                    frame: displayFrameKey,
                    meta: atlas.meta,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default SpritePreviewTool;
