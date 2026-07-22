import { motion } from "framer-motion";

import { useGameMotion } from "@/game-ui";
import type { ArchipelagoNode } from "../worldMapLayout";
import { GALAPAGOS_HUB_LABEL } from "../galapagosIslands";

type GalapagosIslandMarkerProps = {
  node: ArchipelagoNode;
  locked: boolean;
  isCurrent: boolean;
  discovered: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function GalapagosIslandMarker({
  node,
  locked,
  isCurrent,
  discovered,
  disabled,
  onSelect,
}: GalapagosIslandMarkerProps) {
  const { reduced } = useGameMotion();
  const { island, isHub, mapX, mapY, galapagos } = node;

  return (
    <motion.button
      type="button"
      className={`galapagos-island ${isHub ? "galapagos-island--hub" : "galapagos-island--outer"} ${
        isCurrent ? "galapagos-island--current" : ""
      } galapagos-island--${galapagos.terrain}`}
      style={{ left: `${mapX}%`, top: `${mapY}%` }}
      disabled={locked || disabled}
      data-testid={`island-pin-${island.id}`}
      onClick={onSelect}
      initial={reduced ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: locked ? 0.5 : 1 }}
      whileHover={locked || disabled || reduced ? undefined : { scale: 1.05 }}
      title={`${island.name} — modeled on ${galapagos.galapagosName}`}
    >
      {isHub ? <span className="galapagos-island__badge">{GALAPAGOS_HUB_LABEL}</span> : null}
      <div className="galapagos-island__shape">
        <div className="galapagos-island__shore" style={{ background: galapagos.shore }} />
        <div className="galapagos-island__lava" style={{ background: galapagos.lava }} />
        <div
          className="galapagos-island__vegetation"
          style={{ background: `linear-gradient(160deg, ${galapagos.vegetation} 0%, color-mix(in oklab, ${galapagos.vegetation} 70%, #14532d) 100%)` }}
        />
        {isHub || galapagos.terrain === "shield-volcano" || galapagos.terrain === "young-lava" ? (
          <div className="galapagos-island__cone" style={{ background: galapagos.lava }} aria-hidden />
        ) : null}
        <span className="galapagos-island__wildlife" aria-hidden>
          {locked ? "🔒" : galapagos.endemicIcon}
        </span>
        <span className="galapagos-island__icon">{locked ? "🔒" : island.icon}</span>
      </div>
      <span className="galapagos-island__galapagos-name">{galapagos.galapagosName}</span>
      <span className="galapagos-island__label">
        {island.name}
        {isCurrent ? " · You" : discovered ? "" : " · New"}
      </span>
    </motion.button>
  );
}
