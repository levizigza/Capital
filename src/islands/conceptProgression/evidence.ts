import type { IslandSaveV1 } from "../types";
import { ensureLedger } from "../voyagerLedger";
import { hasHarborFreedom } from "../progressGates";
import { isHubGuidedComplete } from "../story/storyBible";
import type { ConceptEvidence } from "./types";

export function buildConceptEvidence(save: IslandSaveV1): ConceptEvidence {
  const completedQuests = new Set<string>();
  for (const [id, st] of Object.entries(save.questStatus ?? {})) {
    if (st?.completed) completedQuests.add(id);
  }
  const irreversibleKeys = new Set(Object.keys(save.irreversibleChoices ?? {}));
  const scarIds = new Set((save.harborScars ?? []).map((s) => s.id));
  const completedMinigames = new Set(save.completedMinigames ?? []);
  const ledger = ensureLedger(save.voyagerLedger);
  const masteryClears = new Set(ledger.masteryClears ?? []);
  const discoveredIslands = new Set(save.discovered?.islands ?? []);
  const transferScenarioPasses = new Set(Object.keys(save.conceptTransferPasses ?? {}));

  return {
    completedQuests,
    irreversibleKeys,
    scarIds,
    completedMinigames,
    masteryClears,
    discoveredIslands,
    hasFreedom: hasHarborFreedom(save),
    guidedHubDone: isHubGuidedComplete(save.hubGuidedIntro),
    transferScenarioPasses,
  };
}
