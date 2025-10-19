import type { Entity } from '../Entity';
import type { PositionComponent } from '../components/Position';
import type { VelocityComponent } from '../components/Velocity';

export function MovementSystem(entities: Entity[], delta: number) {
  for (const entity of entities) {
    const pos = entity.components['position'] as PositionComponent | undefined;
    const vel = entity.components['velocity'] as VelocityComponent | undefined;
    if (pos && vel) {
      pos.x += vel.vx * delta;
      pos.y += vel.vy * delta;
      pos.z += vel.vz * delta;
    }
  }
}
