import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { World } from '../World';
import type { Entity } from '../Entity';
import type { PositionComponent } from '../components/Position';
import type { CollectibleComponent } from '../components/Collectible';
import { CollectSystem } from '../systems/CollectSystem';

function CollectibleMesh({ entity }: { entity: Entity }) {
  const meshRef = React.useRef<any>(null);
  const pos = entity.components['position'] as PositionComponent;
  const collectible = entity.components['collectible'] as CollectibleComponent;
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.05;
  });
  if (collectible.collected) return null;
  return (
    <mesh ref={meshRef} position={[pos.x, pos.y, pos.z]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="#10b981" />
    </mesh>
  );
}

export default function ECS3DCollectGame() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [playerPos] = useState({ x: 0, y: 0, z: 0 });
  const [score, setScore] = useState(0);

  useEffect(() => {
    const world = new World();
    for (let i = 0; i < 5; i++) {
      world.addEntity({
        id: i + 1,
        components: {
          position: { type: 'position', x: i * 1.5 - 3, y: 1 + Math.random() * 2, z: 0 },
          collectible: { type: 'collectible', collected: false }
        }
      });
    }
    setEntities(world.entities);
  }, []);

  const handleCollect = (entity: Entity) => {
    setScore(s => s + 1);
    setEntities(prev => prev.map(e => e.id === entity.id ? {
      ...e,
      components: {
        ...e.components,
        collectible: { ...e.components['collectible'], collected: true }
      }
    } : e));
  };

  const handleCollectAll = () => {
    for (const entity of entities) {
      const collectible = entity.components['collectible'] as CollectibleComponent;
      if (!collectible.collected) {
        CollectSystem([entity], playerPos, handleCollect);
      }
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>3D Collect Game - Score: {score}</h2>
      <button onClick={handleCollectAll} style={{ display: 'block', margin: '0 auto 16px', fontSize: 18, padding: '8px 24px', borderRadius: 8, background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #10b98155' }}>
        Collect All (ECS Demo)
      </button>
      <Canvas style={{ width: '100%', height: 400 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {entities.map(entity => <CollectibleMesh key={entity.id} entity={entity} />)}
      </Canvas>
    </div>
  );
}
