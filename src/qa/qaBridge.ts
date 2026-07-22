import type { IslandSaveV1 } from "@/islands/types";

export type QAView = "home" | "travel" | "island" | "voyage" | "arcade" | "studio";

export type QABridge = {
  getView: () => QAView;
  getSave: () => IslandSaveV1 | null;
  enterIsland: (islandId: string) => void;
  openTravel: () => void;
  openHub: () => void;
  startMinigame: (minigameId: string) => void;
  startQuest: (questId: string) => void;
  persistSave: () => Promise<void>;
  resetSave: () => Promise<void>;
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
