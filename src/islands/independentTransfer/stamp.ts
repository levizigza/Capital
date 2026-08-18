/**
 * Stamp Independent Transfer windows from real play — landing on the analogous
 * island after training, not from tutorial-shell completion.
 */

import type { IslandSaveV1 } from "../types";
import { noteTransferAttempt } from "../conceptProgression/transferMetrics";
import {
  SPINE_TRANSFER_SURFACES,
  transferSurfacesOnIsland,
  type SpineTransferSurface,
} from "./surfaces";

function hasTaught(save: IslandSaveV1, surface: SpineTransferSurface): boolean {
  return Boolean(save.irreversibleChoices?.[surface.taughtByKey]);
}

function hasTransferred(save: IslandSaveV1, surface: SpineTransferSurface): boolean {
  if (save.irreversibleChoices?.[surface.irreversibleKey]) return true;
  return Boolean(save.conceptTransferPasses?.[surface.scenarioId]);
}

/** Player is on the analogous island, training done, Take not yet committed. */
export function isUnguidedTransferOpen(
  save: IslandSaveV1,
  islandId: string,
): boolean {
  return transferSurfacesOnIsland(islandId).some(
    (s) => hasTaught(save, s) && !hasTransferred(save, s),
  );
}

/** Mute principle re-teach (Cove jar mapping, “this is the Take”, etc.). */
export function shouldMutePrincipleReteach(
  save: IslandSaveV1,
  islandId: string | null | undefined,
): boolean {
  if (!islandId) return false;
  return isUnguidedTransferOpen(save, islandId);
}

export function isTransferAttemptPending(
  save: IslandSaveV1,
  surface: SpineTransferSurface,
): boolean {
  if (save.currentIslandId !== surface.islandId) return false;
  if (!hasTaught(save, surface) || hasTransferred(save, surface)) return false;
  const attempts = save.conceptProgress?.concepts[surface.concept_id]?.transferAttempts ?? 0;
  return attempts < 1;
}

/**
 * When the Voyager stands on a transfer island after training, open the
 * Independent Transfer window (attempt counted; no mapping coach).
 */
export function stampIndependentTransferWindows(
  save: IslandSaveV1,
  now = new Date().toISOString(),
): IslandSaveV1 {
  let next = save;
  for (const surface of SPINE_TRANSFER_SURFACES) {
    if (!isTransferAttemptPending(next, surface)) continue;
    next = noteTransferAttempt(next, surface.concept_id, now);
  }
  return next;
}
