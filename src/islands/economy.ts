// ---------------------------------------------------------------------------
// Dynamic Economy — macro-phase system (Boom / Normal / Recession)
// ---------------------------------------------------------------------------
// The economy cycles through phases every N turns. Each phase modifies:
//   - Event deck weights (tag-based multipliers)
//   - Income multipliers (earned money scaling)
//   - Portfolio volatility multiplier
// All config is data-driven via ECONOMY_PHASE_CONFIG.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EconomyPhase = "boom" | "normal" | "recession";

/** Modifiers active during a given economy phase. */
export type PhaseModifiers = {
  /** Multiplier applied to event weights by tag (e.g. { "bills": 1.5 } = more bill events) */
  eventWeightMultipliers: Record<string, number>;
  /** Default multiplier for events without a specific tag override */
  eventWeightDefault: number;
  /** Multiplier on money earned (income events, quest rewards) */
  incomeMultiplier: number;
  /** Multiplier applied to portfolio volatility */
  volatilityMultiplier: number;
};

/** Economy state persisted in island save. */
export type EconomyState = {
  phase: EconomyPhase;
  /** Turns spent in the current phase */
  turnsInPhase: number;
  /** Total turns elapsed across all phase changes */
  totalTurns: number;
  /** History of phase transitions for UI display */
  phaseHistory: { phase: EconomyPhase; startedAtTurn: number }[];
};

// ---------------------------------------------------------------------------
// Data-driven phase configuration
// ---------------------------------------------------------------------------

export const ECONOMY_PHASES: readonly EconomyPhase[] = ["boom", "normal", "recession"] as const;

/** How many turns each phase lasts before a transition check. */
export const PHASE_DURATION = 5;

export const ECONOMY_PHASE_CONFIG: Record<EconomyPhase, {
  label: string;
  icon: string;
  color: string;
  description: string;
  whatItAffects: string;
  modifiers: PhaseModifiers;
}> = {
  boom: {
    label: "Boom",
    icon: "☀️",
    color: "#22c55e",
    description: "The economy is thriving! Income is up and markets are rising.",
    whatItAffects: "Income +20%, lower volatility, fewer debt/bill events.",
    modifiers: {
      eventWeightMultipliers: {
        "bills": 0.6,
        "debt": 0.5,
        "fixed-expenses": 0.7,
        "investment": 1.5,
        "income": 1.4,
        "peer-pressure": 1.2,
      },
      eventWeightDefault: 1.0,
      incomeMultiplier: 1.2,
      volatilityMultiplier: 0.7,
    },
  },
  normal: {
    label: "Normal",
    icon: "⛅",
    color: "#3b82f6",
    description: "Steady economic conditions. No major shocks expected.",
    whatItAffects: "Standard income, standard volatility, balanced events.",
    modifiers: {
      eventWeightMultipliers: {},
      eventWeightDefault: 1.0,
      incomeMultiplier: 1.0,
      volatilityMultiplier: 1.0,
    },
  },
  recession: {
    label: "Recession",
    icon: "🌧️",
    color: "#ef4444",
    description: "Economic downturn! Income drops and markets are volatile.",
    whatItAffects: "Income −20%, higher volatility, more debt/bill events.",
    modifiers: {
      eventWeightMultipliers: {
        "bills": 1.5,
        "debt": 1.6,
        "fixed-expenses": 1.4,
        "investment": 0.6,
        "income": 0.7,
        "peer-pressure": 0.8,
        "emergency": 1.5,
      },
      eventWeightDefault: 1.0,
      incomeMultiplier: 0.8,
      volatilityMultiplier: 1.6,
    },
  },
};

// ---------------------------------------------------------------------------
// Transition rules — data-driven Markov-style probabilities
// ---------------------------------------------------------------------------

/**
 * Probability of transitioning to each phase from the current phase
 * when the phase duration expires. Probabilities should sum to 1.
 */
const TRANSITION_PROBS: Record<EconomyPhase, Record<EconomyPhase, number>> = {
  boom:      { boom: 0.35, normal: 0.50, recession: 0.15 },
  normal:    { boom: 0.25, normal: 0.45, recession: 0.30 },
  recession: { boom: 0.15, normal: 0.50, recession: 0.35 },
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function createDefaultEconomyState(): EconomyState {
  return {
    phase: "normal",
    turnsInPhase: 0,
    totalTurns: 0,
    phaseHistory: [{ phase: "normal", startedAtTurn: 0 }],
  };
}

/** Get the current phase modifiers. */
export function getPhaseModifiers(phase: EconomyPhase): PhaseModifiers {
  return ECONOMY_PHASE_CONFIG[phase].modifiers;
}

/** Get the event weight multiplier for a specific tag in the current phase. */
export function getEventWeightForTag(phase: EconomyPhase, tag: string): number {
  const mods = getPhaseModifiers(phase);
  return mods.eventWeightMultipliers[tag] ?? mods.eventWeightDefault;
}

/**
 * Compute the effective weight of an event given its tags and the economy phase.
 * Picks the multiplier that deviates most from 1.0 across the event's tags.
 */
export function computeEffectiveWeight(
  baseWeight: number,
  tags: string[],
  phase: EconomyPhase,
): number {
  const mods = getPhaseModifiers(phase);
  if (tags.length === 0) return baseWeight * mods.eventWeightDefault;

  let best = mods.eventWeightDefault;
  for (const tag of tags) {
    const m = mods.eventWeightMultipliers[tag];
    if (m !== undefined && Math.abs(m - 1) > Math.abs(best - 1)) {
      best = m;
    }
  }

  return Math.max(0.1, baseWeight * best);
}

/**
 * Advance the economy by one turn. Returns a new EconomyState.
 * If the phase duration has been reached, a transition roll happens.
 */
export function advanceEconomy(
  state: EconomyState,
  phaseDuration: number = PHASE_DURATION,
): EconomyState {
  const nextTurnsInPhase = state.turnsInPhase + 1;
  const nextTotalTurns = state.totalTurns + 1;

  // Check if it's time for a phase transition
  if (nextTurnsInPhase >= phaseDuration) {
    const newPhase = rollPhaseTransition(state.phase);
    return {
      phase: newPhase,
      turnsInPhase: 0,
      totalTurns: nextTotalTurns,
      phaseHistory: [
        ...state.phaseHistory,
        { phase: newPhase, startedAtTurn: nextTotalTurns },
      ],
    };
  }

  return {
    ...state,
    turnsInPhase: nextTurnsInPhase,
    totalTurns: nextTotalTurns,
  };
}

/** Roll for a phase transition using the Markov probabilities. */
function rollPhaseTransition(current: EconomyPhase): EconomyPhase {
  const probs = TRANSITION_PROBS[current];
  const roll = Math.random();
  let cumulative = 0;

  for (const phase of ECONOMY_PHASES) {
    cumulative += probs[phase];
    if (roll <= cumulative) return phase;
  }

  return "normal"; // fallback
}
