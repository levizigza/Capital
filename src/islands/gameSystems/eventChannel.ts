/**
 * EventChannel — Unity Behavior Event Channel analogue.
 * Decoupled pub/sub for world systems (coach, soft-lock, atmosphere intent).
 */

export type GameEventMap = {
  "player.idle": { seconds: number; place: "harbor" | "shore" | "board" | "play" };
  "player.near_store": { storeId: string | null };
  "player.near_npc": { npcId: string | null };
  "quest.failed": { questId: string; attempts: number };
  "coach.tip_changed": { tip: string };
  "world.entered": { place: string; ecosystemMotion?: string };
  "softlock.nudge": { reason: string };
};

type Handler<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

export class EventChannel {
  private listeners = new Map<string, Set<Handler<keyof GameEventMap>>>();

  on<K extends keyof GameEventMap>(event: K, handler: Handler<K>): () => void {
    const key = event as string;
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    const set = this.listeners.get(key)!;
    set.add(handler as Handler<keyof GameEventMap>);
    return () => set.delete(handler as Handler<keyof GameEventMap>);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.listeners.get(event as string);
    if (!set) return;
    for (const h of set) h(payload);
  }

  clear(): void {
    this.listeners.clear();
  }
}

/** Shared game bus — one channel for the session */
export const gameEvents = new EventChannel();
