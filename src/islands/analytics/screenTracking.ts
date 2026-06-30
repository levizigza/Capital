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
    await analytics.track("screen_exit", {
      ...sessionContext(),
      screen: prev,
      dwellMs: getScreenDwellMs(),
      nextScreen: screen,
      ...meta,
    });
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
