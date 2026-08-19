import { useMemo } from "react";

import type { IslandSaveV1 } from "../types";
import {
  buildArchipelagoLayout,
  isIslandLocked,
  type ArchipelagoNode,
} from "../worldMapLayout";
import { getIslandTheme } from "../themes/islandThemes";
import { HARBOR_HAVEN_ID } from "../islandIds";
import { PHI, SEED_PETAL_ANGLES, SEED_SIDE_R, SEED_SPINE_R } from "../sacredGeometry";
import { pointerSafeActivate } from "../pointerSafeClick";
import { mapSpineSubtitle, mapStructurePin } from "./mapIslandLabels";

type Props = {
  islands: Parameters<typeof buildArchipelagoLayout>[0];
  save: IslandSaveV1;
  currentId: string;
  onSelect: (islandId: string) => void;
  showHarborCue: boolean;
};

function structurePin(islandId: string): string {
  return mapStructurePin(islandId);
}

function flatSubtitle(
  node: ArchipelagoNode,
  currentId: string,
  locked: boolean,
): string {
  const here = node.island.id === currentId;
  if (node.ring === "spine") {
    return mapSpineSubtitle(node.island.id, { locked, current: here });
  }
  if (here) return "Here";
  return structurePin(node.island.id);
}

function IslandFlatPin({
  node,
  currentId,
  save,
  onSelect,
  showHarborCue,
}: {
  node: ArchipelagoNode;
  currentId: string;
  save: IslandSaveV1;
  onSelect: (islandId: string) => void;
  showHarborCue: boolean;
}) {
  const locked = isIslandLocked(node.island, save.inventory, save);
  const here = node.island.id === currentId;
  const theme = getIslandTheme(node.island.id, node.island.themeId);
  const isHarbor = node.isHub || node.island.id === HARBOR_HAVEN_ID;
  const size =
    node.ring === "hub" ? 56 : node.ring === "spine" ? 44 : 36;

  return (
    <button
      type="button"
      data-testid={`flat-map-island-${node.island.id}`}
      data-ring={node.ring}
      data-locked={locked ? "1" : "0"}
      disabled={locked}
      title={locked ? `${node.island.name} · locked` : `Board · ${node.island.name}`}
      {...pointerSafeActivate(() => {
        if (!locked) onSelect(node.island.id);
      })}
      className={`absolute -translate-x-1/2 -translate-y-1/2 touch-manipulation rounded-full text-center shadow-lg ring-2 transition ${
        locked
          ? "cursor-not-allowed opacity-55 ring-white/20"
          : here
            ? "ring-amber-300 hover:scale-105"
            : "ring-white/40 hover:scale-105"
      }`}
      style={{
        left: `${node.mapX}%`,
        top: `${node.mapY}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${theme.accent}ee, ${theme.accent}66 55%, #0f172aee)`,
      }}
    >
      <span className="sr-only">{node.island.name}</span>
      {/* Nameplate — always visible so voyagers know what is what */}
      <span
        className={`pointer-events-none absolute left-1/2 top-full mt-1 w-max max-w-[7.5rem] -translate-x-1/2 rounded-full bg-[#0f172a]/88 px-2 py-0.5 text-center ring-1 ring-white/30 ${
          isHarbor ? "z-30" : "z-10"
        }`}
        data-testid={`map-island-label-${node.island.id}`}
      >
        <span className="block text-[9px] font-black leading-tight text-white">
          {locked ? `🔒 ${node.island.name}` : node.island.name}
        </span>
        <span
          className="block text-[7px] font-bold uppercase tracking-wide"
          style={{ color: here ? "#fbbf24" : theme.accent }}
        >
          {flatSubtitle(node, currentId, locked)}
        </span>
      </span>
      {isHarbor && showHarborCue ? (
        <span
          className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-1 flex -translate-x-1/2 flex-col items-center"
          data-testid="harbor-map-start-cue-flat"
          aria-label="Start at Harbor Haven"
        >
          <span className="animate-bounce text-xl leading-none text-[#ef4444] drop-shadow-[0_2px_0_#7f1d1d]">
            ▼
          </span>
        </span>
      ) : null}
    </button>
  );
}

/**
 * Flat Seed-of-Life archipelago — always shows islands + names when WebGL is skipped.
 * Same layout math as the 3D map so rhythm never collapses to empty navy.
 */
export function FlatArchipelagoMap({
  islands,
  save,
  currentId,
  onSelect,
  showHarborCue,
}: Props) {
  const layout = useMemo(() => buildArchipelagoLayout(islands), [islands]);
  const spineR = SEED_SPINE_R;
  const sideR = SEED_SIDE_R;
  const petalR = spineR * 0.58;

  return (
    <div
      className="absolute inset-0 z-[2] overflow-hidden"
      data-testid="archipelago-map-flat"
      data-sacred="seed-of-life"
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 50% 48%, #0e7490 0%, #0c4a6e 45%, #082f49 100%)",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <ellipse
          cx="50"
          cy="52"
          rx={sideR}
          ry={sideR / PHI}
          fill="none"
          stroke="#99f6e4"
          strokeOpacity="0.35"
          strokeWidth="0.35"
        />
        <ellipse
          cx="50"
          cy="52"
          rx={spineR}
          ry={spineR / PHI}
          fill="none"
          stroke="#a7f3d0"
          strokeOpacity="0.45"
          strokeWidth="0.4"
        />
        {SEED_PETAL_ANGLES.map((angle, i) => {
          const cx = 50 + Math.cos(angle) * petalR;
          const cy = 52 + Math.sin(angle) * (petalR / PHI);
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={spineR * 0.92}
              ry={(spineR * 0.92) / PHI}
              fill="none"
              stroke="#6ee7b7"
              strokeOpacity="0.22"
              strokeWidth="0.28"
            />
          );
        })}
        {layout.outer
          .filter((n) => n.ring === "spine")
          .map((n) => (
            <line
              key={`r-${n.island.id}`}
              x1={layout.hub.mapX}
              y1={layout.hub.mapY}
              x2={n.mapX}
              y2={n.mapY}
              stroke="#6ee7b7"
              strokeOpacity="0.4"
              strokeWidth="0.35"
            />
          ))}
      </svg>

      <IslandFlatPin
        node={layout.hub}
        currentId={currentId}
        save={save}
        onSelect={onSelect}
        showHarborCue={showHarborCue}
      />
      {layout.outer.map((node) => (
        <IslandFlatPin
          key={node.island.id}
          node={node}
          currentId={currentId}
          save={save}
          onSelect={onSelect}
          showHarborCue={false}
        />
      ))}
    </div>
  );
}
