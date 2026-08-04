import type { IslandSaveV1 } from "@/islands/types";
import type { SignaturePhase, SignatureSpineOrgan } from "./signatureLoop";

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
  enterIsland: (islandId: string) => void | Promise<void>;
  openTravel: () => void;
  openHub: () => void;
  startMinigame: (minigameId: string) => void;
  startQuest: (questId: string) => void;
  /** Open a real Talk Battle (cold quest chains — not a seed shortcut). */
  talkNpc: (npcId: string) => void | Promise<void>;
  /** Pick up a shore item through the live collect path. Resolves when inventory updates. */
  collectItem: (itemId: string) => Promise<boolean>;
  persistSave: () => Promise<void>;
  resetSave: () => Promise<void>;
  /** Seed Harbor at a signature-loop phase (cold playtest). Optional spine organ. */
  seedSignatureLoop: (phase?: SignaturePhase, organ?: SignatureSpineOrgan) => Promise<void>;
  /**
   * After a same-day Cove/Paycheck/Credit Take: backdate the latest scar and
   * re-roll ritual so Day-2 echo cinema can open (cold overnight proof).
   */
  prepareDay2Echo: () => void;
  /** Play the ~24s mute-friendly trailer cut over Harbor. */
  playSignatureTrailer: () => void;
  /** Open the island Money Structure interior (Cove Jar · Tower · Keep). */
  enterMoneyStructure: () => void;
  /** Climb a named structure part (cork_vault · coin_spring · lid_lookout · …). */
  enterStructurePart: (partId: string) => void;
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
