import type { DialogueNode } from "../types";

/**
 * Pure Talk Battle turn rules — keep UI thin; logic testable.
 * listen → (choices ? choose : done)
 */
export function nextTalkPhase(
  node: Pick<DialogueNode, "choices" | "end">,
  phase: "listen" | "choose",
): "listen" | "choose" | "done" {
  if (phase === "listen") {
    if (node.choices && node.choices.length > 0) return "choose";
    return "done";
  }
  return "done";
}
