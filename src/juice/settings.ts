import type { JuiceLevel } from "./types";

const JUICE_KEY = "financequest_juice_v1";

export type JuiceSettingsV1 = {
  version: 1;
  level: JuiceLevel;
};

const DEFAULT: JuiceSettingsV1 = {
  version: 1,
  level: "high",
};

export function loadJuiceSettings(): JuiceSettingsV1 {
  try {
    const raw = localStorage.getItem(JUICE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as JuiceSettingsV1;
      if (p.version === 1 && (p.level === "off" || p.level === "low" || p.level === "high")) {
        return p;
      }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT };
}

export function persistJuiceSettings(s: JuiceSettingsV1): void {
  try {
    localStorage.setItem(JUICE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
