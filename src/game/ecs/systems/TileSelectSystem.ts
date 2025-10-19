import type { Entity } from '../Entity';
import type { TileComponent } from '../components/Tile';

export function TileSelectSystem(entities: Entity[], tileId: number) {
  for (const entity of entities) {
    const tile = entity.components['tile'] as TileComponent | undefined;
    if (tile && entity.id === tileId) {
      tile.selected = !tile.selected;
    }
  }
}
