import type { Entity } from '../Entity';
import type { PositionComponent } from '../components/Position';
import type { CollectibleComponent } from '../components/Collectible';

export function CollectSystem(entities: Entity[], playerPosition: { x: number; y: number; z: number }, onCollect: (entity: Entity) => void) {
  for (const entity of entities) {
    const pos = entity.components['position'] as PositionComponent | undefined;
    const collectible = entity.components['collectible'] as CollectibleComponent | undefined;
    if (pos && collectible && !collectible.collected) {
      // Simple collision: if player is close enough
      const dist = Math.sqrt(
        Math.pow(pos.x - playerPosition.x, 2) +
        Math.pow(pos.y - playerPosition.y, 2) +
        Math.pow(pos.z - playerPosition.z, 2)
      );
      if (dist < 0.5) {
        collectible.collected = true;
        onCollect(entity);
      }
    }
  }
}
