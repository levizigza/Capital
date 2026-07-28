/**
 * Kill switches + capacity flags — DevOps + SRE degradation levers.
 * Remote flags can later override these via VITE_TELEMETRY_URL config fetch.
 */

function envFlag(name: string, whenTrue = "1"): boolean {
  try {
    return import.meta.env[name] === whenTrue;
  } catch {
    return false;
  }
}

export type KillSwitchId =
  | "harbor3d"
  | "serviceWorker"
  | "telemetry"
  | "familyRooms"
  | "studioGallery"
  | "partyBoard";

const RUNTIME_OVERRIDES: Partial<Record<KillSwitchId, boolean>> = {};

/** True when the feature should be DISABLED (killed). */
export function isKilled(id: KillSwitchId): boolean {
  if (RUNTIME_OVERRIDES[id] !== undefined) return RUNTIME_OVERRIDES[id]!;
  switch (id) {
    case "harbor3d":
      return envFlag("VITE_KILL_HARBOR_3D");
    case "serviceWorker":
      return envFlag("VITE_KILL_SW");
    case "telemetry":
      return envFlag("VITE_KILL_TELEMETRY");
    case "familyRooms":
      return envFlag("VITE_KILL_FAMILY");
    case "studioGallery":
      return envFlag("VITE_KILL_GALLERY");
    case "partyBoard":
      return envFlag("VITE_KILL_PARTY");
    default:
      return false;
  }
}

/** Operator override for incident response (Settings / QA bridge). */
export function setKillSwitch(id: KillSwitchId, killed: boolean): void {
  RUNTIME_OVERRIDES[id] = killed;
  try {
    localStorage.setItem(`capital_kill_${id}`, killed ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function loadPersistedKillSwitches(): void {
  const ids: KillSwitchId[] = [
    "harbor3d",
    "serviceWorker",
    "telemetry",
    "familyRooms",
    "studioGallery",
    "partyBoard",
  ];
  for (const id of ids) {
    try {
      const v = localStorage.getItem(`capital_kill_${id}`);
      if (v === "1") RUNTIME_OVERRIDES[id] = true;
      if (v === "0") RUNTIME_OVERRIDES[id] = false;
    } catch {
      /* ignore */
    }
  }
}

export function allKillSwitchStates(): Record<KillSwitchId, boolean> {
  const ids: KillSwitchId[] = [
    "harbor3d",
    "serviceWorker",
    "telemetry",
    "familyRooms",
    "studioGallery",
    "partyBoard",
  ];
  return Object.fromEntries(ids.map((id) => [id, isKilled(id)])) as Record<
    KillSwitchId,
    boolean
  >;
}

export const TELEMETRY_URL: string | undefined =
  typeof import.meta.env.VITE_TELEMETRY_URL === "string" &&
  import.meta.env.VITE_TELEMETRY_URL.length > 0
    ? import.meta.env.VITE_TELEMETRY_URL
    : undefined;

export const SRE_DEBUG = envFlag("VITE_SRE_DEBUG");
