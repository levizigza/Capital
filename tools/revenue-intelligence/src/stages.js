/**
 * Capital lifecycle stages — full customer journey for Revenue Intelligence.
 */

export const LIFECYCLE_STAGES = [
  "DISCOVERED",
  "CONTACTED",
  "REPLIED",
  "INTERVIEWED",
  "USER_TEST",
  "QUALIFIED",
  "OFFERED",
  "CHECKOUT_STARTED",
  "PAID",
  "ACTIVATED",
  "RETAINED",
  "REFERRED",
];

export const STAGE_LABELS = {
  DISCOVERED: "Discovered",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  INTERVIEWED: "Interviewed",
  USER_TEST: "User test",
  QUALIFIED: "Qualified",
  OFFERED: "Offered",
  CHECKOUT_STARTED: "Checkout started",
  PAID: "Paid",
  ACTIVATED: "Activated",
  RETAINED: "Retained",
  REFERRED: "Referred",
};

/** North-star outcome stages — never optimize upstream without these. */
export const OUTCOME_STAGES = ["PAID", "ACTIVATED", "RETAINED"];
