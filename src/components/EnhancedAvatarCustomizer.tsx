import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, ArrowLeft, ArrowRight, Sparkle, Coins, User, Palette, ShirtFolded, Crown, Dog } from '@phosphor-icons/react'
import * as THREE from 'three'

export interface EnhancedAvatarConfig {
  // Base character
  characterType: 'kid' | 'teen' | 'adult' | 'elder' | 'robot' | 'alien'
  gender: 'boy' | 'girl' | 'neutral'
  
  // Appearance
  skinTone: string
  bodyType: 'slim' | 'average' | 'athletic' | 'round'
  height: 'short' | 'medium' | 'tall'
  
  // Face
  faceShape: 'round' | 'oval' | 'square' | 'heart'
  eyeStyle: string
  eyeColor: string
  noseStyle: string
  mouthStyle: string
  
  // Hair
  hairStyle: string
  hairColor: string
  facialHair?: string
  
  // Clothing
  topStyle: string
  topColor: string
  bottomStyle: string
  bottomColor: string
  shoesStyle: string
  shoesColor: string
  
  // Accessories
  hat?: string
  glasses?: string
  earrings?: string
  necklace?: string
  backpack?: string
  
  // Pet companion
  pet?: string
  petColor?: string
  
  // Special effects
  aura?: string
  trail?: string
  
  // Stats display
  money: number
}

// Expanded customization options
const CHARACTER_TYPES = [
  { id: 'kid', label: 'Kid', emoji: '👶', ageRange: '6-10' },
  { id: 'teen', label: 'Teen', emoji: '🧑', ageRange: '11-17' },
  { id: 'adult', label: 'Adult', emoji: '🧑‍💼', ageRange: '18-59' },
  { id: 'elder', label: 'Elder', emoji: '👴', ageRange: '60+' },
  { id: 'robot', label: 'Robot', emoji: '🤖', ageRange: 'N/A' },
  { id: 'alien', label: 'Alien', emoji: '👽', ageRange: 'N/A' },
]

const SKIN_TONES = [
  { id: 'pale', color: '#FFEBD0', label: 'Pale' },
  { id: 'fair', color: '#FFE0BD', label: 'Fair' },
  { id: 'light', color: '#F1C27D', label: 'Light' },
  { id: 'medium', color: '#C68642', label: 'Medium' },
  { id: 'tan', color: '#A0522D', label: 'Tan' },
  { id: 'brown', color: '#8D5524', label: 'Brown' },
  { id: 'dark', color: '#5C3317', label: 'Dark' },
  { id: 'blue', color: '#4A90D9', label: 'Blue (Fantasy)' },
  { id: 'green', color: '#4CAF50', label: 'Green (Fantasy)' },
  { id: 'purple', color: '#9C27B0', label: 'Purple (Fantasy)' },
]

const HAIR_STYLES = [
  { id: 'short', label: 'Short', emoji: '💇' },
  { id: 'medium', label: 'Medium', emoji: '💇‍♀️' },
  { id: 'long', label: 'Long', emoji: '👱‍♀️' },
  { id: 'curly', label: 'Curly', emoji: '🦱' },
  { id: 'wavy', label: 'Wavy', emoji: '〰️' },
  { id: 'spiky', label: 'Spiky', emoji: '🦔' },
  { id: 'mohawk', label: 'Mohawk', emoji: '🎸' },
  { id: 'ponytail', label: 'Ponytail', emoji: '🎀' },
  { id: 'braids', label: 'Braids', emoji: '🪢' },
  { id: 'afro', label: 'Afro', emoji: '🌺' },
  { id: 'bald', label: 'Bald', emoji: '🥚' },
  { id: 'buzz', label: 'Buzz Cut', emoji: '✂️' },
]

const HAIR_COLORS = [
  { id: 'black', color: '#1a1a1a' },
  { id: 'brown', color: '#654321' },
  { id: 'blonde', color: '#F4D03F' },
  { id: 'red', color: '#C0392B' },
  { id: 'ginger', color: '#E67E22' },
  { id: 'gray', color: '#95A5A6' },
  { id: 'white', color: '#ECF0F1' },
  { id: 'blue', color: '#3498DB' },
  { id: 'purple', color: '#9B59B6' },
  { id: 'pink', color: '#E91E63' },
  { id: 'green', color: '#27AE60' },
  { id: 'rainbow', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)' },
]

const EYE_STYLES = [
  { id: 'normal', emoji: '👀', label: 'Normal' },
  { id: 'big', emoji: '🥺', label: 'Big' },
  { id: 'small', emoji: '😑', label: 'Small' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'cool', emoji: '😎', label: 'Cool' },
  { id: 'wink', emoji: '😉', label: 'Wink' },
  { id: 'stars', emoji: '🤩', label: 'Star Eyes' },
  { id: 'hearts', emoji: '😍', label: 'Heart Eyes' },
  { id: 'sleepy', emoji: '😴', label: 'Sleepy' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
]

const TOPS = [
  { id: 'tshirt', label: 'T-Shirt', emoji: '👕' },
  { id: 'hoodie', label: 'Hoodie', emoji: '🧥' },
  { id: 'jacket', label: 'Jacket', emoji: '🧥' },
  { id: 'sweater', label: 'Sweater', emoji: '🧶' },
  { id: 'dress-shirt', label: 'Dress Shirt', emoji: '👔' },
  { id: 'tank-top', label: 'Tank Top', emoji: '🎽' },
  { id: 'superhero', label: 'Superhero Cape', emoji: '🦸' },
  { id: 'armor', label: 'Armor', emoji: '🛡️' },
  { id: 'wizard-robe', label: 'Wizard Robe', emoji: '🧙' },
  { id: 'jersey', label: 'Sports Jersey', emoji: '⚽' },
]

const BOTTOMS = [
  { id: 'jeans', label: 'Jeans', emoji: '👖' },
  { id: 'shorts', label: 'Shorts', emoji: '🩳' },
  { id: 'skirt', label: 'Skirt', emoji: '👗' },
  { id: 'dress', label: 'Dress', emoji: '👗' },
  { id: 'sweatpants', label: 'Sweatpants', emoji: '🏃' },
  { id: 'cargo', label: 'Cargo Pants', emoji: '📦' },
  { id: 'suit-pants', label: 'Suit Pants', emoji: '👔' },
]

const HATS = [
  { id: 'none', label: 'None', emoji: '❌' },
  { id: 'cap', label: 'Baseball Cap', emoji: '🧢' },
  { id: 'beanie', label: 'Beanie', emoji: '🎿' },
  { id: 'crown', label: 'Crown', emoji: '👑' },
  { id: 'cowboy', label: 'Cowboy Hat', emoji: '🤠' },
  { id: 'wizard', label: 'Wizard Hat', emoji: '🧙' },
  { id: 'pirate', label: 'Pirate Hat', emoji: '🏴‍☠️' },
  { id: 'headphones', label: 'Headphones', emoji: '🎧' },
  { id: 'bow', label: 'Bow', emoji: '🎀' },
  { id: 'tiara', label: 'Tiara', emoji: '👸' },
  { id: 'helmet', label: 'Helmet', emoji: '⛑️' },
  { id: 'top-hat', label: 'Top Hat', emoji: '🎩' },
]

const GLASSES = [
  { id: 'none', label: 'None', emoji: '❌' },
  { id: 'regular', label: 'Regular', emoji: '👓' },
  { id: 'sunglasses', label: 'Sunglasses', emoji: '🕶️' },
  { id: 'round', label: 'Round', emoji: '🔵' },
  { id: 'square', label: 'Square', emoji: '🔲' },
  { id: 'monocle', label: 'Monocle', emoji: '🧐' },
  { id: 'vr', label: 'VR Headset', emoji: '🥽' },
  { id: '3d', label: '3D Glasses', emoji: '🎬' },
]

const PETS = [
  { id: 'none', label: 'None', emoji: '❌' },
  { id: 'dog', label: 'Dog', emoji: '🐕' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'bird', label: 'Bird', emoji: '🐦' },
  { id: 'bunny', label: 'Bunny', emoji: '🐰' },
  { id: 'hamster', label: 'Hamster', emoji: '🐹' },
  { id: 'fish', label: 'Fish', emoji: '🐠' },
  { id: 'dragon', label: 'Dragon', emoji: '🐉' },
  { id: 'unicorn', label: 'Unicorn', emoji: '🦄' },
  { id: 'phoenix', label: 'Phoenix', emoji: '🔥' },
  { id: 'robot-pet', label: 'Robot Pet', emoji: '🤖' },
  { id: 'slime', label: 'Slime', emoji: '🟢' },
]

const AURAS = [
  { id: 'none', label: 'None', emoji: '❌' },
  { id: 'fire', label: 'Fire', emoji: '🔥', color: '#FF6B35' },
  { id: 'ice', label: 'Ice', emoji: '❄️', color: '#74B9FF' },
  { id: 'electric', label: 'Electric', emoji: '⚡', color: '#F1C40F' },
  { id: 'nature', label: 'Nature', emoji: '🌿', color: '#27AE60' },
  { id: 'shadow', label: 'Shadow', emoji: '🌑', color: '#2C3E50' },
  { id: 'rainbow', label: 'Rainbow', emoji: '🌈', color: 'rainbow' },
  { id: 'sparkle', label: 'Sparkle', emoji: '✨', color: '#FFD700' },
  { id: 'money', label: 'Money', emoji: '💰', color: '#2ECC71' },
]

// Helper: pick a color associated with a hat ID
function hatColor(hat: string): string {
  const map: Record<string, string> = {
    cap: '#2563EB', beanie: '#DC2626', crown: '#F59E0B', cowboy: '#92400E',
    wizard: '#7C3AED', pirate: '#1F2937', headphones: '#374151', bow: '#EC4899',
    tiara: '#F472B6', helmet: '#EF4444', 'top-hat': '#111827',
  }
  return map[hat] ?? '#F1C40F'
}

function glassesColor(id: string): string {
  const map: Record<string, string> = {
    regular: '#1F2937', sunglasses: '#111827', round: '#7C3AED',
    square: '#1F2937', monocle: '#F59E0B', vr: '#6366F1', '3d': '#EF4444',
  }
  return map[id] ?? '#1F2937'
}

const PET_COLORS: Record<string, string> = {
  dog: '#92400E', cat: '#F97316', bird: '#3B82F6', bunny: '#F9A8D4',
  hamster: '#FBBF24', fish: '#06B6D4', dragon: '#16A34A', unicorn: '#D946EF',
  phoenix: '#EF4444', 'robot-pet': '#6B7280', slime: '#22C55E',
}

// 3D Avatar Preview Component
function Avatar3DPreview({ config }: { config: EnhancedAvatarConfig }) {
  const meshRef = useRef<THREE.Group>(null)
  const petRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.15
      meshRef.current.position.y = Math.sin(t * 2) * 0.04
    }
    if (petRef.current) {
      petRef.current.position.y = 0.5 + Math.sin(t * 3) * 0.08
      petRef.current.rotation.y = t * 1.2
    }
  })

  const skinColor = SKIN_TONES.find(s => s.id === config.skinTone)?.color || '#F1C27D'
  const hairCol = HAIR_COLORS.find(h => h.id === config.hairColor)?.color || '#654321'
  const topColor = config.topColor || '#3498DB'
  const bottomColor = config.bottomColor || '#2C3E50'
  const isRobot = config.characterType === 'robot'
  const isAlien = config.characterType === 'alien'
  const headColor = isRobot ? '#94A3B8' : isAlien ? '#86EFAC' : skinColor
  const bodyScale = config.characterType === 'kid' ? 0.85 : config.characterType === 'elder' ? 0.95 : 1

  const eyeSize = config.eyeStyle === 'big' ? 0.08 : config.eyeStyle === 'small' ? 0.04 : 0.06
  const pupilSize = eyeSize * 0.5
  const eyeYOffset = config.eyeStyle === 'sleepy' ? -0.02 : 0

  return (
    <group ref={meshRef} scale={bodyScale}>
      {/* Body / torso */}
      <RoundedBox args={[0.8, 1.2, 0.5]} radius={0.1} position={[0, 0, 0]}>
        <meshStandardMaterial color={topColor} />
      </RoundedBox>

      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={headColor} metalness={isRobot ? 0.6 : 0} roughness={isRobot ? 0.3 : 0.8} />
      </mesh>

      {/* Robot antenna */}
      {isRobot && (
        <group position={[0, 1.55, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Alien extra eyes (forehead) */}
      {isAlien && (
        <mesh position={[0, 1.35, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* Hair - varies by style */}
      {config.hairStyle !== 'bald' && config.hairStyle !== 'buzz' && !isRobot && (
        <>
          {/* Base hair cap */}
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={hairCol} />
          </mesh>

          {/* Long hair: drape down back */}
          {(config.hairStyle === 'long' || config.hairStyle === 'ponytail') && (
            <RoundedBox args={[0.5, 0.7, 0.15]} radius={0.06} position={[0, 0.8, -0.25]}>
              <meshStandardMaterial color={hairCol} />
            </RoundedBox>
          )}

          {/* Curly / Afro: bigger sphere */}
          {(config.hairStyle === 'curly' || config.hairStyle === 'afro') && (
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[config.hairStyle === 'afro' ? 0.52 : 0.44, 32, 32]} />
              <meshStandardMaterial color={hairCol} />
            </mesh>
          )}

          {/* Mohawk: row of bumps */}
          {config.hairStyle === 'mohawk' && (
            <group>
              {[0, 0.15, 0.3].map((z, i) => (
                <mesh key={i} position={[0, 1.48 + i * 0.02, -0.1 + z * 0.5]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial color={hairCol} />
                </mesh>
              ))}
            </group>
          )}

          {/* Spiky */}
          {config.hairStyle === 'spiky' && (
            <group>
              {[[-0.15, 1.5, 0], [0.15, 1.52, 0], [0, 1.55, -0.1], [-0.1, 1.48, 0.1], [0.1, 1.48, 0.1]].map(([x, y, z], i) => (
                <mesh key={i} position={[x, y, z]}>
                  <coneGeometry args={[0.06, 0.18, 8]} />
                  <meshStandardMaterial color={hairCol} />
                </mesh>
              ))}
            </group>
          )}

          {/* Braids: two side pieces */}
          {config.hairStyle === 'braids' && (
            <>
              <RoundedBox args={[0.1, 0.6, 0.1]} radius={0.04} position={[-0.3, 0.9, 0.1]}>
                <meshStandardMaterial color={hairCol} />
              </RoundedBox>
              <RoundedBox args={[0.1, 0.6, 0.1]} radius={0.04} position={[0.3, 0.9, 0.1]}>
                <meshStandardMaterial color={hairCol} />
              </RoundedBox>
            </>
          )}

          {/* Ponytail band */}
          {config.hairStyle === 'ponytail' && (
            <mesh position={[0, 1.15, -0.35]}>
              <torusGeometry args={[0.08, 0.03, 8, 16]} />
              <meshStandardMaterial color="#EC4899" />
            </mesh>
          )}
        </>
      )}

      {/* Buzz cut: thin shell */}
      {config.hairStyle === 'buzz' && !isRobot && (
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.41, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={hairCol} />
        </mesh>
      )}

      {/* Eyes */}
      <mesh position={[-0.12, 1.15 + eyeYOffset, 0.35]}>
        <sphereGeometry args={[eyeSize, 16, 16]} />
        <meshStandardMaterial color={isRobot ? '#0EA5E9' : 'white'} emissive={isRobot ? '#0EA5E9' : '#000000'} emissiveIntensity={isRobot ? 0.4 : 0} />
      </mesh>
      <mesh position={[0.12, 1.15 + eyeYOffset, 0.35]}>
        <sphereGeometry args={[eyeSize, 16, 16]} />
        <meshStandardMaterial color={isRobot ? '#0EA5E9' : 'white'} emissive={isRobot ? '#0EA5E9' : '#000000'} emissiveIntensity={isRobot ? 0.4 : 0} />
      </mesh>
      {/* Pupils */}
      {!isRobot && (
        <>
          <mesh position={[-0.12, 1.15 + eyeYOffset, 0.4]}>
            <sphereGeometry args={[pupilSize, 16, 16]} />
            <meshStandardMaterial color={config.eyeColor || '#2C3E50'} />
          </mesh>
          <mesh position={[0.12, 1.15 + eyeYOffset, 0.4]}>
            <sphereGeometry args={[pupilSize, 16, 16]} />
            <meshStandardMaterial color={config.eyeColor || '#2C3E50'} />
          </mesh>
        </>
      )}

      {/* Mouth */}
      <mesh position={[0, 0.98, 0.38]}>
        <boxGeometry args={[0.15, 0.03, 0.02]} />
        <meshStandardMaterial color={isRobot ? '#0EA5E9' : '#E11D48'} />
      </mesh>

      {/* Glasses */}
      {config.glasses && config.glasses !== 'none' && (
        <group position={[0, 1.15, 0.38]}>
          <mesh position={[-0.12, 0, 0]}>
            <torusGeometry args={[0.08, 0.015, 8, 16]} />
            <meshStandardMaterial color={glassesColor(config.glasses)} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <torusGeometry args={[0.08, 0.015, 8, 16]} />
            <meshStandardMaterial color={glassesColor(config.glasses)} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.02]} />
            <meshStandardMaterial color={glassesColor(config.glasses)} />
          </mesh>
          {/* Tinted lenses for sunglasses / VR */}
          {(config.glasses === 'sunglasses' || config.glasses === 'vr') && (
            <>
              <mesh position={[-0.12, 0, -0.01]}>
                <circleGeometry args={[0.07, 16]} />
                <meshStandardMaterial color="#111827" transparent opacity={0.7} />
              </mesh>
              <mesh position={[0.12, 0, -0.01]}>
                <circleGeometry args={[0.07, 16]} />
                <meshStandardMaterial color="#111827" transparent opacity={0.7} />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Hat */}
      {config.hat && config.hat !== 'none' && (
        <group position={[0, 1.5, 0]}>
          {/* Crown: pointed gold */}
          {config.hat === 'crown' && (
            <>
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.32, 0.35, 0.18, 5]} />
                <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
              </mesh>
              {[0, 1, 2, 3, 4].map(i => (
                <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 5) * 0.28, 0.2, Math.sin(i * Math.PI * 2 / 5) * 0.28]}>
                  <coneGeometry args={[0.04, 0.12, 6]} />
                  <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
                </mesh>
              ))}
            </>
          )}
          {/* Wizard hat: cone */}
          {config.hat === 'wizard' && (
            <mesh position={[0, 0.25, 0]}>
              <coneGeometry args={[0.3, 0.6, 16]} />
              <meshStandardMaterial color="#7C3AED" />
            </mesh>
          )}
          {/* Top hat: tall cylinder */}
          {config.hat === 'top-hat' && (
            <>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.4, 16]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.38, 0.38, 0.05, 16]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
            </>
          )}
          {/* Generic hat (cap, beanie, cowboy, etc.) */}
          {!['crown', 'wizard', 'top-hat', 'headphones'].includes(config.hat) && (
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.32, 0.38, 0.15, 32]} />
              <meshStandardMaterial color={hatColor(config.hat)} />
            </mesh>
          )}
          {/* Headphones */}
          {config.hat === 'headphones' && (
            <group position={[0, -0.05, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.35, 0.03, 8, 32, Math.PI]} />
                <meshStandardMaterial color="#374151" />
              </mesh>
              <mesh position={[-0.35, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
                <meshStandardMaterial color="#374151" />
              </mesh>
              <mesh position={[0.35, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
                <meshStandardMaterial color="#374151" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* Legs */}
      <RoundedBox args={[0.25, 0.8, 0.25]} radius={0.05} position={[-0.2, -0.9, 0]}>
        <meshStandardMaterial color={bottomColor} />
      </RoundedBox>
      <RoundedBox args={[0.25, 0.8, 0.25]} radius={0.05} position={[0.2, -0.9, 0]}>
        <meshStandardMaterial color={bottomColor} />
      </RoundedBox>

      {/* Arms */}
      <RoundedBox args={[0.2, 0.7, 0.2]} radius={0.05} position={[-0.55, 0.1, 0]}>
        <meshStandardMaterial color={isRobot ? '#94A3B8' : skinColor} metalness={isRobot ? 0.6 : 0} roughness={isRobot ? 0.3 : 0.8} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.7, 0.2]} radius={0.05} position={[0.55, 0.1, 0]}>
        <meshStandardMaterial color={isRobot ? '#94A3B8' : skinColor} metalness={isRobot ? 0.6 : 0} roughness={isRobot ? 0.3 : 0.8} />
      </RoundedBox>

      {/* Pet companion */}
      {config.pet && config.pet !== 'none' && (
        <group ref={petRef} position={[0.9, 0.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={PET_COLORS[config.pet] ?? '#E74C3C'} />
          </mesh>
          {/* Pet eyes */}
          <mesh position={[-0.04, 0.04, 0.12]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.04, 0.04, 0.12]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      )}

      {/* Aura effect (ring around character) */}
      {config.aura && config.aura !== 'none' && (
        <AuraEffect aura={config.aura} />
      )}

      {/* Money display floating above head */}
      <Text
        position={[0, config.hat && config.hat !== 'none' ? 2.1 : 1.9, 0]}
        fontSize={0.15}
        color="#F1C40F"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {'$' + config.money.toLocaleString()}
      </Text>
    </group>
  )
}

function AuraEffect({ aura }: { aura: string }) {
  const ringRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 1.5
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      ringRef.current.scale.set(s, s, s)
    }
  })
  const auraColor =
    AURAS.find(a => a.id === aura)?.color === 'rainbow'
      ? '#FFD700'
      : AURAS.find(a => a.id === aura)?.color ?? '#FFD700'
  return (
    <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.8, 0.04, 8, 48]} />
      <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={0.6} transparent opacity={0.7} />
    </mesh>
  )
}

const DEFAULT_CONFIG: EnhancedAvatarConfig = {
  characterType: 'kid',
  gender: 'neutral',
  skinTone: 'medium',
  bodyType: 'average',
  height: 'medium',
  faceShape: 'round',
  eyeStyle: 'normal',
  eyeColor: '#2C3E50',
  noseStyle: 'normal',
  mouthStyle: 'smile',
  hairStyle: 'short',
  hairColor: 'brown',
  topStyle: 'tshirt',
  topColor: '#3498DB',
  bottomStyle: 'jeans',
  bottomColor: '#2C3E50',
  shoesStyle: 'sneakers',
  shoesColor: '#E74C3C',
  hat: 'none',
  glasses: 'none',
  pet: 'none',
  aura: 'none',
  money: 1000,
}

interface EnhancedAvatarCustomizerProps {
  currentConfig?: EnhancedAvatarConfig
  onSave: (config: EnhancedAvatarConfig) => void
  onCancel?: () => void
  startingMoney?: number
}

export default function EnhancedAvatarCustomizer({ 
  currentConfig, 
  onSave, 
  onCancel,
  startingMoney = 1000
}: EnhancedAvatarCustomizerProps) {
  const [config, setConfig] = useState<EnhancedAvatarConfig>({
    ...(currentConfig || DEFAULT_CONFIG),
    money: startingMoney
  })
  const [activeTab, setActiveTab] = useState('character')

  const updateConfig = <K extends keyof EnhancedAvatarConfig>(
    key: K, 
    value: EnhancedAvatarConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const randomize = () => {
    const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    
    setConfig({
      ...config,
      characterType: randomFrom(CHARACTER_TYPES).id as any,
      skinTone: randomFrom(SKIN_TONES).id,
      hairStyle: randomFrom(HAIR_STYLES).id,
      hairColor: randomFrom(HAIR_COLORS).id,
      eyeStyle: randomFrom(EYE_STYLES).id,
      topStyle: randomFrom(TOPS).id,
      topColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      bottomStyle: randomFrom(BOTTOMS).id,
      bottomColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      hat: randomFrom(HATS).id,
      glasses: randomFrom(GLASSES).id,
      pet: randomFrom(PETS).id,
      aura: randomFrom(AURAS).id,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4">
      {/* Retro Header */}
      <div className="retro-card max-w-6xl mx-auto mb-4">
        <div className="retro-card-header flex items-center justify-between">
          <span>🎨 Character Creator</span>
          <div className="retro-money-display">
            <span className="retro-money-icon">💰</span>
            <span>${config.money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* 3D Preview */}
        <div className="retro-card">
          <div className="retro-card-body">
            <div className="bg-gradient-to-br from-sky-200 to-green-200 rounded-xl border-4 border-black" style={{ height: '400px' }}>
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <Avatar3DPreview config={config} />
                <OrbitControls 
                  enableZoom={false} 
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.5}
                />
              </Canvas>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-3 mt-4">
              <button onClick={randomize} className="retro-btn retro-btn-purple flex-1">
                🎲 Randomize
              </button>
              <button 
                onClick={() => setConfig({ ...DEFAULT_CONFIG, money: startingMoney })} 
                className="retro-btn retro-btn-yellow flex-1"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="retro-card">
          <div className="retro-card-body">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 gap-2 mb-4 bg-transparent">
                {[
                  { id: 'character', icon: '👤', label: 'Body' },
                  { id: 'face', icon: '😊', label: 'Face' },
                  { id: 'clothes', icon: '👕', label: 'Clothes' },
                  { id: 'accessories', icon: '👑', label: 'Extras' },
                  { id: 'special', icon: '✨', label: 'Special' },
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="retro-btn retro-btn-blue text-xs py-2"
                  >
                    <span className="text-lg">{tab.icon}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="character" className="space-y-4">
                {/* Character Type */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Character Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CHARACTER_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => updateConfig('characterType', type.id as any)}
                        className={`p-3 rounded-xl border-3 text-center transition-all ${
                          config.characterType === type.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl">{type.emoji}</div>
                        <div className="text-xs font-bold">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Tone */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Skin Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map(skin => (
                      <button
                        key={skin.id}
                        onClick={() => updateConfig('skinTone', skin.id)}
                        className={`w-10 h-10 rounded-full border-3 transition-all ${
                          config.skinTone === skin.id 
                            ? 'border-purple-500 scale-110' 
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: skin.color }}
                        title={skin.label}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="face" className="space-y-4">
                {/* Hair Style */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Hair Style</label>
                  <div className="grid grid-cols-4 gap-2">
                    {HAIR_STYLES.map(hair => (
                      <button
                        key={hair.id}
                        onClick={() => updateConfig('hairStyle', hair.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.hairStyle === hair.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{hair.emoji}</div>
                        <div className="text-xs">{hair.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Hair Color</label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => updateConfig('hairColor', color.id)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          config.hairColor === color.id 
                            ? 'border-purple-500 scale-110' 
                            : 'border-gray-300'
                        }`}
                        style={{ background: color.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Eye Style */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Eyes</label>
                  <div className="grid grid-cols-5 gap-2">
                    {EYE_STYLES.map(eye => (
                      <button
                        key={eye.id}
                        onClick={() => updateConfig('eyeStyle', eye.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.eyeStyle === eye.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{eye.emoji}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clothes" className="space-y-4">
                {/* Top */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Top</label>
                  <div className="grid grid-cols-5 gap-2">
                    {TOPS.map(top => (
                      <button
                        key={top.id}
                        onClick={() => updateConfig('topStyle', top.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.topStyle === top.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{top.emoji}</div>
                        <div className="text-xs">{top.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Color */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Top Color</label>
                  <input
                    type="color"
                    value={config.topColor}
                    onChange={(e) => updateConfig('topColor', e.target.value)}
                    className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                </div>

                {/* Bottom */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Bottom</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BOTTOMS.map(bottom => (
                      <button
                        key={bottom.id}
                        onClick={() => updateConfig('bottomStyle', bottom.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.bottomStyle === bottom.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{bottom.emoji}</div>
                        <div className="text-xs">{bottom.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="accessories" className="space-y-4">
                {/* Hat */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Hat</label>
                  <div className="grid grid-cols-4 gap-2">
                    {HATS.map(hat => (
                      <button
                        key={hat.id}
                        onClick={() => updateConfig('hat', hat.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.hat === hat.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{hat.emoji}</div>
                        <div className="text-xs">{hat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glasses */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Glasses</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GLASSES.map(glass => (
                      <button
                        key={glass.id}
                        onClick={() => updateConfig('glasses', glass.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.glasses === glass.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{glass.emoji}</div>
                        <div className="text-xs">{glass.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="special" className="space-y-4">
                {/* Pet */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Pet Companion</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PETS.map(pet => (
                      <button
                        key={pet.id}
                        onClick={() => updateConfig('pet', pet.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.pet === pet.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{pet.emoji}</div>
                        <div className="text-xs">{pet.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aura */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Aura Effect</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AURAS.map(aura => (
                      <button
                        key={aura.id}
                        onClick={() => updateConfig('aura', aura.id)}
                        className={`p-2 rounded-lg border-2 text-center ${
                          config.aura === aura.id 
                            ? 'border-purple-500 bg-purple-100' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xl">{aura.emoji}</div>
                        <div className="text-xs">{aura.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto mt-6 pb-20 flex gap-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="retro-btn retro-btn-red flex-1">
            ❌ Cancel
          </button>
        )}
        <button type="button" onClick={() => onSave(config)} className="retro-btn retro-btn-green flex-1">
          ✅ Save Character
        </button>
      </div>
    </div>
  )
}
