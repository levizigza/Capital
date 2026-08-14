/**
 * AI allow / deny for Sales OS.
 */

import type {
  AiAssistAction,
  AiForbiddenAction,
  AiUpdatableField,
} from "./types";
import { AI_ALLOWED_ACTIONS, AI_FORBIDDEN_ACTIONS, AI_UPDATABLE_FIELDS } from "./types";

export class AiDeniedError extends Error {
  readonly action: string;
  constructor(action: string, message: string) {
    super(message);
    this.name = "AiDeniedError";
    this.action = action;
  }
}

export function isAiAllowedAction(action: string): action is AiAssistAction {
  return (AI_ALLOWED_ACTIONS as string[]).includes(action);
}

export function isAiForbiddenAction(action: string): action is AiForbiddenAction {
  return (AI_FORBIDDEN_ACTIONS as string[]).includes(action);
}

export function assertAiActionAllowed(action: string): asserts action is AiAssistAction {
  if (isAiForbiddenAction(action)) {
    throw new AiDeniedError(
      action,
      `AI may NOT autonomously ${action.replace(/_/g, " ")}`,
    );
  }
  if (!isAiAllowedAction(action)) {
    throw new AiDeniedError(action, `Unknown or disallowed AI action: ${action}`);
  }
}

export function isAiUpdatableField(field: string): field is AiUpdatableField {
  return (AI_UPDATABLE_FIELDS as string[]).includes(field);
}

/** Detect forbidden intent inside free-text AI payloads. */
const FORBIDDEN_PAYLOAD_PATTERNS: { action: AiForbiddenAction; patterns: RegExp[] }[] = [
  {
    action: "make_contractual_commitments",
    patterns: [
      /\b(we (hereby )?agree|binding (contract|agreement)|sign(ed)? (the )?contract)\b/i,
      /\blegally bound\b/i,
    ],
  },
  {
    action: "change_official_pricing",
    patterns: [
      /\b(change|set|update) (official )?pric(e|ing)\b/i,
      /\bnew list price\b/i,
    ],
  },
  {
    action: "offer_unapproved_discounts",
    patterns: [
      /\b(\d{1,2}|fifty|twenty)\s*%\s*off\b/i,
      /\bunapproved discount\b/i,
      /\bI can give you a discount\b/i,
    ],
  },
  {
    action: "make_financial_guarantees",
    patterns: [
      /\bmoney[-\s]?back guarantee\b/i,
      /\bguaranteed (returns|ROI|income)\b/i,
      /\bwe guarantee you will\b/i,
    ],
  },
  {
    action: "misrepresent_product_capabilities",
    patterns: [
      /\b(we (fully )?automate (your )?taxes|FDIC insured by Capital)\b/i,
      /\breplaces (your )?financial advisor\b/i,
      /\bguaranteed to make you rich\b/i,
    ],
  },
];

export function detectForbiddenPayload(
  text: string,
): AiForbiddenAction | null {
  for (const { action, patterns } of FORBIDDEN_PAYLOAD_PATTERNS) {
    if (patterns.some((p) => p.test(text))) return action;
  }
  return null;
}

export function assertPayloadNotForbidden(payload: Record<string, unknown>): void {
  const blob = JSON.stringify(payload);
  const hit = detectForbiddenPayload(blob);
  if (hit) {
    throw new AiDeniedError(hit, `AI payload blocked: ${hit.replace(/_/g, " ")}`);
  }
}
