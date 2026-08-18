/**
 * Official headless harness for iconic 100% proof.
 * `__QA__` may open islands / talk / structures / seeds (WebGL walk flakes).
 * Live UI still has to prove Talk, mastery, Soft Beat leave, fail, mute, Seal.
 * Law: `src/qa/iconicProofLaw.ts`.
 */
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
  /**
   * Finish the active minigame with an explicit result (cold fail dignity).
   * Prefer live Finish round → See result when the UI is reachable.
   */
  completeMinigame: (success: boolean, score?: number) => void | Promise<void>;
  startQuest: (questId: string) => void;
  /** Open a real Talk Battle (cold quest chains — not a seed shortcut). */
  talkNpc: (npcId: string) => void | Promise<void>;
  /** Pick up a shore item through the live collect path. Resolves when inventory updates. */
  collectItem: (itemId: string) => Promise<boolean>;
  persistSave: () => Promise<void>;
  resetSave: () => Promise<void>;
  /** Seed Harbor at a signature-loop phase (cold playtest). Optional spine organ. */
  seedSignatureLoop: (phase?: SignaturePhase, organ?: SignatureSpineOrgan) => Promise<void>;
  /** Cove training done, parked on Paycheck with the analogous Take still open (ITR cold play). */
  seedIndependentTransfer: () => Promise<void>;
  /**
   * After a same-day Cove/Paycheck/Credit Take: backdate the latest scar and
   * re-roll ritual so Day-2 echo cinema can open (cold overnight proof).
   */
  prepareDay2Echo: () => void;
  /** Play the ~24s mute-friendly trailer cut over Harbor. */
  playSignatureTrailer: () => void;
  /**
   * Open Money Structure interior (skips enter cinema).
   * Harbor → Ledger Bank; spine shores → Jar / Tower / Keep.
   */
  enterMoneyStructure: (islandId: string) => void | Promise<void>;
  /** Fire the Soft Beat part inside the open structure (Lid / Teller / Loft / Battlement). */
  enterStructureSoftBeat: () => void;
  /** Dismiss Soft Beat and exit structure — host plaza/shore must stay mounted. */
  exitMoneyStructure: () => void;
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
