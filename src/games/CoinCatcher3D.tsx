import React, { useEffect, useState } from 'react'
import { sfx } from '@/lib/sfx'
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


// Simple 2D Coin Catcher (no 3D)
export default function CoinCatcher3D() {
  return (
    <div style={{padding:40, textAlign:'center', color:'#888', fontSize:24}}>
      This game has been replaced by the 2D Coin Catcher. Please play the main Coin Catcher game!
    </div>
  )
}
