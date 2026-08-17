import type { ConceptEvidence, ConceptPredicate } from "./types";

/**
 * Evaluate a proof predicate. Combinators recurse.
 * island_discovered / guided_hub_done are weak alone — callers should wrap in all_of.
 */
export function evalPredicate(
  pred: ConceptPredicate,
  evidence: ConceptEvidence,
): boolean {
  switch (pred.type) {
    case "never":
      return false;
    case "quest_completed":
      return evidence.completedQuests.has(pred.questId);
    case "irreversible_set":
      return evidence.irreversibleKeys.has(pred.key);
    case "scar_present": {
      if (pred.scarId && evidence.scarIds.has(pred.scarId)) return true;
      if (pred.scarIdPrefix) {
        for (const id of evidence.scarIds) {
          if (id.startsWith(pred.scarIdPrefix)) return true;
        }
      }
      return false;
    }
    case "minigame_completed":
      return evidence.completedMinigames.has(pred.minigameId);
    case "mastery_gate_cleared":
      return evidence.masteryClears.has(pred.gateId);
    case "has_freedom":
      return evidence.hasFreedom;
    case "island_discovered":
      return evidence.discoveredIslands.has(pred.islandId);
    case "guided_hub_done":
      return evidence.guidedHubDone;
    case "transfer_scenario_passed":
      return evidence.transferScenarioPasses.has(pred.scenarioId);
    case "all_of":
      return pred.of.every((p) => evalPredicate(p, evidence));
    case "any_of":
      return pred.of.some((p) => evalPredicate(p, evidence));
    default:
      return false;
  }
}

/** True if predicate (or any nested leaf) is a forbidden sole-unlock kind used alone. */
export function isWeakSolePredicate(pred: ConceptPredicate): boolean {
  return pred.type === "island_discovered" || pred.type === "guided_hub_done";
}
