import React, { useState } from 'react';
import { World } from '../World';
import type { Entity } from '../Entity';
import type { TileComponent } from '../components/Tile';
import { TileSelectSystem } from '../systems/TileSelectSystem';

// ECS 2D Puzzle Game Template (e.g., BudgetBalancer)
export default function ECS2DPuzzleGame() {
  const [entities, setEntities] = useState<Entity[]>(() => {
    const world = new World();
    // Create 9 tiles for demo
    for (let i = 0; i < 9; i++) {
      world.addEntity({
        id: i + 1,
        components: {
          tile: { type: 'tile', value: i + 1, selected: false }
        }
      });
    }
    return world.entities;
  });

  const handleTileClick = (id: number) => {
    TileSelectSystem(entities, id);
    setEntities([...entities]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gap: 8 }}>
      {entities.map(entity => {
        const tile = entity.components['tile'] as TileComponent;
        return (
          <button
            key={entity.id}
            onClick={() => handleTileClick(entity.id)}
            style={{
              width: 60,
              height: 60,
              background: tile.selected ? '#10b981' : '#f3f4f6',
              color: tile.selected ? 'white' : '#222',
              fontWeight: 'bold',
              fontSize: 20,
              border: '2px solid #10b981',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: tile.selected ? '0 2px 8px #10b98155' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tile.value}
          </button>
        );
      })}
    </div>
  );
}
