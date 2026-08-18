/**
 * Sync Capital soundtrack mute across capitalMusic prefs + a11y settings.
 */

import { capitalMusic } from "./capitalMusic";
import {
  loadAccessibilitySettings,
  persistAccessibilitySettings,
} from "../settings";

/** Persist mute to both music prefs and Settings panel state. */
export function setCapitalMusicEnabled(enabled: boolean): void {
  capitalMusic.setEnabled(enabled);
  const s = loadAccessibilitySettings();
  if ((s.musicEnabled !== false) === enabled) return;
  persistAccessibilitySettings({ ...s, musicEnabled: enabled });
}

export function toggleCapitalMusicMute(): boolean {
  const next = !capitalMusic.isEnabled();
  setCapitalMusicEnabled(next);
  return next;
}
