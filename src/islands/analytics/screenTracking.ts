import { analytics } from "../analytics";
import {
  getCurrentScreen,
  getScreenDwellMs,
  setCurrentScreen,
  sessionContext,
} from "./session";

export async function trackScreenEnter(
  screen: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const prev = getCurrentScreen();
  if (prev && prev !== screen) {
    const dwellMs = getScreenDwellMs();
    await analytics.track("screen_exit", {
      ...sessionContext(),
      screen: prev,
      dwellMs,
      nextScreen: screen,
      ...meta,
    });
    // Fun-dropoff / stuck signal — long dwell without progress (pattern #90).
    if (dwellMs >= 90_000) {
      await analytics.track("core_loop_beat", {
        beat: "dwell_stuck",
        screen: prev,
        dwellMs,
        nextScreen: screen,
      });
    }
  }
  setCurrentScreen(screen);
  await analytics.track("screen_enter", {
    ...sessionContext(),
    screen,
    previousScreen: prev,
    ...meta,
  });
}

export async function trackScreenExit(
  reason: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const screen = getCurrentScreen();
  if (!screen) return;
  await analytics.track("screen_exit", {
    ...sessionContext(),
    screen,
    dwellMs: getScreenDwellMs(),
    reason,
    ...meta,
  });
}
