import type { IslandSaveV1 } from "@/islands/types";
import type { SignaturePhase } from "./signatureLoop";

export type QAView =
  | "home"
  | "travel"
  | "island"
  | "explore"
  | "chapter"
  | "voyage"
  | "arcade"
  | "studio";

export type QABridge = {
  getView: () => QAView;
  getSave: () => IslandSaveV1 | null;
  /** Instant dock — skips dissolve FX so smoke tests do not race transitions. */
  enterIsland: (islandId: string) => void;
  openTravel: () => void;
  openHub: () => void;
  startMinigame: (minigameId: string) => void;
  startQuest: (questId: string) => void;
  persistSave: () => Promise<void>;
  resetSave: () => Promise<void>;
  /** Seed Harbor at a signature-loop phase (cold playtest). */
  seedSignatureLoop: (phase?: SignaturePhase) => Promise<void>;
  /** Play the ~24s mute-friendly trailer cut over Harbor. */
  playSignatureTrailer: () => void;
  ready: boolean;
};

declare global {
  interface Window {
    __QA__?: QABridge;
  }
}

export const QA_ENABLED =
  import.meta.env.VITE_QA === "1" || import.meta.env.DEV;

export function mountQABridge(bridge: QABridge): () => void {
  if (!QA_ENABLED) return () => {};
  window.__QA__ = bridge;
  return () => {
    delete window.__QA__;
  };
}
