import React, { useRef, useState, useEffect } from 'react'
import { sfx } from '@/lib/sfx'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { World } from '@/game/ecs/World'
import type { Entity } from '@/game/ecs/Entity'
import type { PositionComponent } from '@/game/ecs/components/Position'
import type { CollectibleComponent } from '@/game/ecs/components/Collectible'
import { CollectSystem } from '@/game/ecs/systems/CollectSystem'
import { OnboardingSystem } from '@/game/ecs/systems/OnboardingSystem'
import type { OnboardingComponent } from '@/game/ecs/components/Onboarding'
import { XPSystem } from '@/game/ecs/systems/XPSystem'
import type { XPComponent } from '@/game/ecs/components/XP'
import type { AchievementComponent } from '@/game/ecs/components/Achievement'


function Coin({ entity }: { entity: Entity }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const pos = entity.components['position'] as PositionComponent
  const collectible = entity.components['collectible'] as CollectibleComponent

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05
    }
  })

  if (collectible.collected) return null

  return (
    <mesh ref={meshRef} position={[pos.x, pos.y, pos.z]}>
      <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
      <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

const CoinCatcher3D = () => {
  const [score, setScore] = useState(0)
  const [playerPos] = useState({ x: 0, y: 0, z: 0 }) // Player is at origin for demo
  const [entities, setEntities] = useState<Entity[]>([])
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [achievementUnlocked, setAchievementUnlocked] = useState(false)

  // Initialize ECS world and coins
  useEffect(() => {
    const world = new World()
    // Add player entity with onboarding, xp, and achievement components
    world.addEntity({
      id: 0,
      components: {
        onboarding: { type: 'onboarding', completed: false, step: 0 } as OnboardingComponent,
        xp: { type: 'xp', value: 0, level: 1 } as XPComponent,
        achievement: {
          type: 'achievement',
          id: 'all-coins',
          unlocked: false,
          name: 'Coin Collector',
          description: 'Collect all coins in a single game.'
        } as AchievementComponent
      }
    })
    const coinPositions = [
      { x: 0, y: 2, z: 0 },
      { x: 2, y: 1, z: 0 },
      { x: -2, y: 3, z: 0 }
    ]
    let id = 1
    for (const pos of coinPositions) {
      world.addEntity({
        id: id++,
        components: {
          position: { type: 'position', ...pos },
          collectible: { type: 'collectible', collected: false }
        }
      })
    }
    setEntities(world.entities)
  }, [])
  // Onboarding, XP, and achievement system effect
  useEffect(() => {
    // Find player entity (id: 0)
    const player = entities.find(e => e.id === 0)
    if (!player) return
    // Onboarding
    const onboarding = player.components['onboarding'] as OnboardingComponent | undefined
    if (onboarding) {
      OnboardingSystem([player], (entity) => {
        setOnboardingComplete(true)
      })
      setOnboardingStep(onboarding.step)
      setOnboardingComplete(onboarding.completed)
    }
    // XP
    const xpComp = player.components['xp'] as XPComponent | undefined
    if (xpComp) {
      setXp(xpComp.value)
      setLevel(xpComp.level)
    }
    // Achievement
    const ach = player.components['achievement'] as AchievementComponent | undefined
    if (ach) {
      setAchievementUnlocked(ach.unlocked)
    }
  }, [entities])
  // Advance onboarding step
  const handleAdvanceOnboarding = () => {
    setEntities(prev => prev.map(e => {
      if (e.id === 0 && e.components['onboarding']) {
        return {
          ...e,
          components: {
            ...e.components,
            onboarding: {
              ...e.components['onboarding'],
              step: e.components['onboarding'].step + 1
            }
          }
        }
      }
      return e
    }))
  }

  // Simulate collection system (replace with real player movement/collision in future)
  const handleCollect = (entity: Entity) => {
    setScore((prev) => prev + 1)
    if (sfx?.coin) sfx.coin.play()
    setEntities((prev) => {
      // Mark coin as collected
      const updated = prev.map(e => e.id === entity.id ? {
        ...e,
        components: {
          ...e.components,
          collectible: { ...e.components['collectible'], collected: true }
        }
      } : e)
      // Give XP to player (id: 0)
      XPSystem(updated.filter(e => e.id === 0), 50)
      // Check if all coins are collected for achievement
      const allCollected = updated.filter(e => e.components['collectible']).every(e => e.components['collectible'].collected)
      if (allCollected) {
        // Unlock achievement
        return updated.map(e => {
          if (e.id === 0 && e.components['achievement']) {
            return {
              ...e,
              components: {
                ...e.components,
                achievement: {
                  ...e.components['achievement'],
                  unlocked: true
                }
              }
            }
          }
          return e
        })
      }
      return updated
    })
  }

  // For demo: collect all coins when button pressed
  const handleCollectAll = () => {
    for (const entity of entities) {
      const collectible = entity.components['collectible'] as CollectibleComponent
      if (!collectible.collected) {
        CollectSystem([entity], playerPos, handleCollect)
      }
    }
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
        <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: '#2563eb' }}>
          XP: {xp} | Level: {level}
        </div>
        <div style={{ background: achievementUnlocked ? '#d1fae5' : '#f3f4f6', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: achievementUnlocked ? '#059669' : '#6b7280' }}>
          {achievementUnlocked ? '🏆 Achievement: Coin Collector' : 'Achievement: Locked'}
        </div>
      </div>
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>Coin Catcher 3D - Score: {score}</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
        <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: '#2563eb' }}>
          XP: {xp} | Level: {level}
        </div>
        <div style={{ background: achievementUnlocked ? '#d1fae5' : '#f3f4f6', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: achievementUnlocked ? '#059669' : '#6b7280' }}>
          {achievementUnlocked ? '🏆 Achievement: Coin Collector' : 'Achievement: Locked'}
        </div>
      </div>
      {!onboardingComplete && (
        <div style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 12,
          padding: 24,
          margin: '24px auto',
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: '0 2px 8px #ffd70033'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Welcome to Coin Catcher 3D!</h3>
          <p style={{ marginBottom: 16 }}>
            {onboardingStep === 0 && 'Collect coins by clicking the button below or by interacting with the 3D scene.'}
            {onboardingStep === 1 && 'Each coin you collect increases your score.'}
            {onboardingStep === 2 && 'Try to collect all coins to finish onboarding!'}
          </p>
          <button onClick={handleAdvanceOnboarding} style={{
            background: '#ffd700',
            color: '#222',
            fontWeight: 'bold',
            fontSize: 16,
            padding: '8px 24px',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #ffd70055'
          }}>
            {onboardingStep < 2 ? 'Next' : 'Finish Onboarding'}
          </button>
        </div>
      )}
      <button onClick={handleCollectAll} style={{ display: 'block', margin: '0 auto 16px', fontSize: 18, padding: '8px 24px', borderRadius: 8, background: '#ffd700', color: '#222', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #ffd70055' }}>
        Collect All Coins (ECS Demo)
      </button>
      <Canvas style={{ width: "100%", height: "400px" }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {entities.filter(e => e.components['collectible']).map(entity => <Coin key={entity.id} entity={entity} />)}
      </Canvas>
    </div>
  )
}

export default CoinCatcher3D;
