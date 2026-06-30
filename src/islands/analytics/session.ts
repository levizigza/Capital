import { v4 as uuidv4 } from "uuid";

export type AnalyticsScreen =
  | "islands_hub"
  | "islands_travel"
  | "islands_play"
  | "dialogue"
  | "minigame"
  | "hub_modal"
  | "islands_exit";

type SessionState = {
  id: string;
  startedAt: number;
  screen: string | null;
  screenEnteredAt: number | null;
};

let session: SessionState | null = null;

export function getOrStartSession(): SessionState {
  if (!session) {
    const now = Date.now();
    session = { id: uuidv4(), startedAt: now, screen: null, screenEnteredAt: null };
  }
  return session;
}

export function resetSession(): void {
  session = null;
}

export function getSessionId(): string {
  return getOrStartSession().id;
}

export function getSessionStartedAt(): number {
  return getOrStartSession().startedAt;
}

export function getElapsedMs(): number {
  return Date.now() - getOrStartSession().startedAt;
}

export function getCurrentScreen(): string | null {
  return session?.screen ?? null;
}

export function getScreenDwellMs(): number {
  if (!session?.screenEnteredAt) return 0;
  return Date.now() - session.screenEnteredAt;
}

export function setCurrentScreen(screen: string): string | null {
  const prev = session?.screen ?? null;
  if (!session) getOrStartSession();
  session!.screen = screen;
  session!.screenEnteredAt = Date.now();
  return prev;
}

export function sessionContext(extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    sessionId: getSessionId(),
    elapsedMs: getElapsedMs(),
    screen: getCurrentScreen(),
    ...extra,
  };
}
