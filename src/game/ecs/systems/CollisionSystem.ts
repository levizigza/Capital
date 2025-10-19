import type { Entity } from '../Entity';
import type { PositionComponent } from '../components/Position';
import type { ObstacleComponent } from '../components/Obstacle';
import type { PlayerComponent } from '../components/Player';

export function CollisionSystem(entities: Entity[], onPlayerHit: (obstacle: Entity) => void) {
  const player = entities.find(e => e.components['player'])
  if (!player) return
  const playerPos = player.components['position'] as PositionComponent
  for (const entity of entities) {
    const obstacle = entity.components['obstacle'] as ObstacleComponent | undefined
    const pos = entity.components['position'] as PositionComponent | undefined
    if (obstacle && pos && !obstacle.hit) {
      const dist = Math.sqrt(
        Math.pow(pos.x - playerPos.x, 2) +
        Math.pow(pos.y - playerPos.y, 2) +
        Math.pow(pos.z - playerPos.z, 2)
      )
      if (dist < 0.5) {
        obstacle.hit = true
        onPlayerHit(entity)
      }
    }
  }
}
