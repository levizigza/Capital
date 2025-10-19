import type { Entity } from '../Entity';
import type { XPComponent } from '../components/XP';

export function XPSystem(entities: Entity[], xpGain: number) {
  for (const entity of entities) {
    const xp = entity.components['xp'] as XPComponent | undefined;
    if (xp) {
      xp.value += xpGain;
      // Level up for every 100 XP
      while (xp.value >= 100) {
        xp.value -= 100;
        xp.level += 1;
      }
    }
  }
}
