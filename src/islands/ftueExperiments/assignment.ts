import { listRunningFtueExperiments, getFtueExperiment } from "./registry";
import { FTUE_VERSION, type FtueExperimentAssignment } from "./types";

const ASSIGNMENT_KEY = "capital_ftue_assignment_v1";
const LEGACY_VARIANT_KEY = "capital_ftue_exp_variant";

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readSticky(): FtueExperimentAssignment | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(ASSIGNMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FtueExperimentAssignment;
    if (!parsed?.experiment_id || !parsed?.variant || !parsed?.ftue_version) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSticky(assignment: FtueExperimentAssignment): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignment));
    localStorage.setItem(LEGACY_VARIANT_KEY, assignment.variant);
  } catch {
    /* ignore */
  }
}

function parseQueryAssignment(): FtueExperimentAssignment | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const expParam = params.get("ftueExp") ?? params.get("exp");
    if (!expParam || !/^[a-z0-9_.:-]{1,64}$/i.test(expParam)) return null;

    // Forms: "variant" | "experimentId:variant"
    let experiment_id = "ftue_baseline_control";
    let variant = expParam;
    if (expParam.includes(":")) {
      const [id, arm] = expParam.split(":");
      if (id && arm) {
        experiment_id = id;
        variant = arm;
      }
    } else if (getFtueExperiment(expParam)) {
      experiment_id = expParam;
      variant = getFtueExperiment(expParam)?.control.id ?? "control";
    }

    const assignment: FtueExperimentAssignment = {
      experiment_id,
      variant,
      ftue_version: FTUE_VERSION,
      assigned_at: new Date().toISOString(),
      source: "query",
    };
    writeSticky(assignment);
    return assignment;
  } catch {
    return null;
  }
}

function pickArm(weight: number): "control" | "variant" {
  const w = Math.min(1, Math.max(0, weight));
  return Math.random() < w ? "variant" : "control";
}

function assignRunning(): FtueExperimentAssignment {
  const running = listRunningFtueExperiments();
  if (running.length === 0) {
    return {
      experiment_id: "ftue_baseline_control",
      variant: "control",
      ftue_version: FTUE_VERSION,
      assigned_at: new Date().toISOString(),
      source: "default_control",
    };
  }

  // Single active experiment for clarity; if multiple, first running wins.
  const exp = running[0]!;
  const arm = pickArm(exp.variant_weight ?? 0.5);
  const variant = arm === "variant" ? exp.variant.id : exp.control.id;
  const assignment: FtueExperimentAssignment = {
    experiment_id: exp.experiment_id,
    variant,
    ftue_version: exp.ftue_version,
    assigned_at: new Date().toISOString(),
    source: "sticky",
  };
  writeSticky(assignment);
  return assignment;
}

/**
 * Sticky assignment for the session/device.
 * Reassigns when FTUE version changes so events never mix versions silently.
 */
export function resolveFtueExperimentAssignment(
  opts?: { forceRefresh?: boolean },
): FtueExperimentAssignment {
  const fromQuery = parseQueryAssignment();
  if (fromQuery) return fromQuery;

  if (!opts?.forceRefresh) {
    const sticky = readSticky();
    if (sticky && sticky.ftue_version === FTUE_VERSION) {
      const exp = getFtueExperiment(sticky.experiment_id);
      if (!exp || exp.status === "running" || exp.status === "shipped" || exp.status === "paused") {
        return sticky;
      }
    }
  }

  return assignRunning();
}

export function getAssignedExperimentVariant(): string {
  return resolveFtueExperimentAssignment().variant;
}

export function getAssignedExperimentId(): string {
  return resolveFtueExperimentAssignment().experiment_id;
}

/** True when the sticky/query assignment matches this experiment arm. */
export function isFtueVariant(experimentId: string, variantId: string): boolean {
  const a = resolveFtueExperimentAssignment();
  return a.experiment_id === experimentId && a.variant === variantId;
}

/** Analytics context — exact FTUE version on every relevant event. */
export function ftueExperimentAnalyticsContext(): {
  ftue_version: string;
  experiment_id: string;
  experiment_variant: string;
} {
  const a = resolveFtueExperimentAssignment();
  return {
    ftue_version: a.ftue_version,
    experiment_id: a.experiment_id,
    experiment_variant: a.variant,
  };
}

export function clearFtueExperimentAssignmentForTests(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(ASSIGNMENT_KEY);
    localStorage.removeItem(LEGACY_VARIANT_KEY);
  } catch {
    /* ignore */
  }
}
