import { analytics } from "../analytics";
import {
  getCurrentScreen,
  getScreenDwellMs,
  setCurrentScreen,
  sessionContext,
} from "./session";

const DWELL_STUCK_MS = 90_000;
let dwellWatch: ReturnType<typeof setTimeout> | null = null;
let dwellFiredScreen: string | null = null;

/** Pattern #90 — fire while stuck, not only when leaving the screen. */
export function clearDwellStuckWatch(): void {
  if (dwellWatch) {
    clearTimeout(dwellWatch);
    dwellWatch = null;
  }
}

export function armDwellStuckWatch(screen: string): void {
  clearDwellStuckWatch();
  if (dwellFiredScreen === screen) return;
  dwellWatch = setTimeout(() => {
    dwellFiredScreen = screen;
    void analytics.track("core_loop_beat", {
      beat: "dwell_stuck",
      screen,
      dwellMs: getScreenDwellMs(),
      whileStuck: true,
    });
  }, DWELL_STUCK_MS);
}

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
    if (dwellMs >= DWELL_STUCK_MS && dwellFiredScreen !== prev) {
      await analytics.track("core_loop_beat", {
        beat: "dwell_stuck",
        screen: prev,
        dwellMs,
        nextScreen: screen,
      });
    }
  }
  setCurrentScreen(screen);
  if (prev !== screen) dwellFiredScreen = null;
  armDwellStuckWatch(screen);
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
  clearDwellStuckWatch();
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
