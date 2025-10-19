import type { Entity } from './Entity';
import type { System } from './System';

export class World {
  entities: Entity[] = [];
  systems: System[] = [];

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  update(delta: number) {
    for (const system of this.systems) {
      system(this.entities, delta);
    }
  }
}
