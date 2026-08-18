/**
 * Paycheck talks during Independent Transfer — people, not a classroom.
 * After the analogous Take, JSON graphs teach Clock as a new organ.
 */

import type { DialogueGraph } from "../types";
import type { IslandSaveV1 } from "../types";
import { PAYCHECK_PENINSULA_ID } from "../islandIds";
import { shouldMutePrincipleReteach } from "./stamp";

const PAT_TRANSFER: DialogueGraph = {
  id: "dlg_payroll_pat",
  startNodeId: "pat_t1",
  nodes: [
    {
      id: "pat_t1",
      speaker: "Payroll Pat",
      text: "Window can wait. Fountain cracked — Vee’s stall is still open.",
      choices: [{ id: "pat_t_ok", text: "I’ll walk Main Street." }],
      end: true,
    },
  ],
};

const PRIYA_TRANSFER: DialogueGraph = {
  id: "dlg_planner_priya",
  startNodeId: "pri_t1",
  nodes: [
    {
      id: "pri_t1",
      speaker: "Planner Priya",
      text: "Bureau’s quiet until the stall settles. Clock can wait.",
      choices: [{ id: "pri_t_ok", text: "I’ll come back." }],
      end: true,
    },
  ],
};

const CARLOS_TRANSFER: DialogueGraph = {
  id: "dlg_coach_carlos",
  startNodeId: "cc_t1",
  nodes: [
    {
      id: "cc_t1",
      speaker: "Coach Carlos",
      text: "Sky looks mean. I’m not the stall — Vee is.",
      choices: [{ id: "cc_t_ok", text: "Got it." }],
      end: true,
    },
  ],
};

const BY_GRAPH: Record<string, DialogueGraph> = {
  dlg_payroll_pat: PAT_TRANSFER,
  dlg_planner_priya: PRIYA_TRANSFER,
  dlg_coach_carlos: CARLOS_TRANSFER,
};

/** Replace classroom graphs while the analogous Take is still open. */
export function resolveTransferTalk(
  save: IslandSaveV1 | null | undefined,
  graphId: string | null | undefined,
): DialogueGraph | undefined {
  if (!save || !graphId) return undefined;
  if (!shouldMutePrincipleReteach(save, PAYCHECK_PENINSULA_ID)) return undefined;
  return BY_GRAPH[graphId];
}
