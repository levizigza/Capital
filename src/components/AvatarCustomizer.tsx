import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowLeft, ArrowRight, Sparkle } from '@phosphor-icons/react'

export interface AvatarConfig {
  base: string
  skinTone: string
  hair: string
  hairColor: string
  eyes: string
  outfit: string
  accessory: string
  pet: string
}

interface AvatarCustomizerProps {
  currentAvatar?: AvatarConfig
  onSave: (avatar: AvatarConfig) => void
  onCancel?: () => void
}

// Avatar customization options
const AVATAR_BASES = [
  { id: 'kid-1', emoji: '👦', label: 'Boy' },
  { id: 'kid-2', emoji: '👧', label: 'Girl' },
  { id: 'kid-3', emoji: '🧒', label: 'Child' },
  { id: 'kid-4', emoji: '👶', label: 'Baby Face' },
]

const SKIN_TONES = [
  { id: 'light', color: '#FFE0BD', label: 'Light' },
  { id: 'medium-light', color: '#F1C27D', label: 'Medium Light' },
  { id: 'medium', color: '#C68642', label: 'Medium' },
  { id: 'medium-dark', color: '#8D5524', label: 'Medium Dark' },
  { id: 'dark', color: '#5C3317', label: 'Dark' },
]

const HAIR_STYLES = [
  { id: 'short', emoji: '💇', label: 'Short' },
  { id: 'long', emoji: '💇‍♀️', label: 'Long' },
  { id: 'curly', emoji: '🦱', label: 'Curly' },
  { id: 'spiky', emoji: '🦔', label: 'Spiky' },
  { id: 'none', emoji: '👨‍🦲', label: 'None' },
]

const HAIR_COLORS = [
  { id: 'black', color: '#1a1a1a', label: 'Black' },
  { id: 'brown', color: '#654321', label: 'Brown' },
  { id: 'blonde', color: '#F4D03F', label: 'Blonde' },
  { id: 'red', color: '#C0392B', label: 'Red' },
  { id: 'blue', color: '#3498DB', label: 'Blue' },
  { id: 'purple', color: '#9B59B6', label: 'Purple' },
  { id: 'pink', color: '#E91E63', label: 'Pink' },
  { id: 'green', color: '#27AE60', label: 'Green' },
]

const EYE_STYLES = [
  { id: 'normal', emoji: '👀', label: 'Normal' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'cool', emoji: '😎', label: 'Cool' },
  { id: 'stars', emoji: '🤩', label: 'Star Eyes' },
  { id: 'hearts', emoji: '😍', label: 'Heart Eyes' },
]

const OUTFITS = [
  { id: 'casual', emoji: '👕', label: 'Casual', color: '#3498DB' },
  { id: 'sporty', emoji: '🏃', label: 'Sporty', color: '#E74C3C' },
  { id: 'fancy', emoji: '👔', label: 'Fancy', color: '#9B59B6' },
  { id: 'adventure', emoji: '🎒', label: 'Adventure', color: '#27AE60' },
  { id: 'superhero', emoji: '🦸', label: 'Superhero', color: '#F39C12' },
  { id: 'wizard', emoji: '🧙', label: 'Wizard', color: '#8E44AD' },
  { id: 'pirate', emoji: '🏴‍☠️', label: 'Pirate', color: '#2C3E50' },
  { id: 'astronaut', emoji: '👨‍🚀', label: 'Astronaut', color: '#ECF0F1' },
]

const ACCESSORIES = [
  { id: 'none', emoji: '❌', label: 'None' },
  { id: 'glasses', emoji: '👓', label: 'Glasses' },
  { id: 'hat', emoji: '🎩', label: 'Hat' },
  { id: 'cap', emoji: '🧢', label: 'Cap' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'headphones', emoji: '🎧', label: 'Headphones' },
  { id: 'bow', emoji: '🎀', label: 'Bow' },
  { id: 'bandana', emoji: '🏴', label: 'Bandana' },
]

const PETS = [
  { id: 'none', emoji: '❌', label: 'None' },
  { id: 'dog', emoji: '🐕', label: 'Dog' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'bird', emoji: '🐦', label: 'Bird' },
  { id: 'bunny', emoji: '🐰', label: 'Bunny' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
]

const DEFAULT_AVATAR: AvatarConfig = {
  base: 'kid-1',
  skinTone: 'medium',
  hair: 'short',
  hairColor: 'brown',
  eyes: 'normal',
  outfit: 'casual',
  accessory: 'none',
  pet: 'none',
}

type CustomizationCategory = 'base' | 'skinTone' | 'hair' | 'hairColor' | 'eyes' | 'outfit' | 'accessory' | 'pet'

const CATEGORIES: { id: CustomizationCategory; label: string; icon: string }[] = [
  { id: 'base', label: 'Character', icon: '👤' },
  { id: 'skinTone', label: 'Skin', icon: '🎨' },
  { id: 'hair', label: 'Hair Style', icon: '💇' },
  { id: 'hairColor', label: 'Hair Color', icon: '🌈' },
  { id: 'eyes', label: 'Eyes', icon: '👀' },
  { id: 'outfit', label: 'Outfit', icon: '👕' },
  { id: 'accessory', label: 'Accessory', icon: '🎩' },
  { id: 'pet', label: 'Pet', icon: '🐾' },
]

export function AvatarPreview({ avatar, size = 'lg' }: { avatar: AvatarConfig; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
    xl: 'w-48 h-48 text-7xl',
  }

  const base = AVATAR_BASES.find(b => b.id === avatar.base) || AVATAR_BASES[0]
  const skin = SKIN_TONES.find(s => s.id === avatar.skinTone) || SKIN_TONES[2]
  const outfit = OUTFITS.find(o => o.id === avatar.outfit) || OUTFITS[0]
  const accessory = ACCESSORIES.find(a => a.id === avatar.accessory)
  const pet = PETS.find(p => p.id === avatar.pet)
  const hairColor = HAIR_COLORS.find(h => h.id === avatar.hairColor) || HAIR_COLORS[1]

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Background circle with skin tone */}
      <div 
        className="absolute inset-0 rounded-full border-4 shadow-lg"
        style={{ 
          backgroundColor: skin.color,
          borderColor: outfit.color
        }}
      />
      
      {/* Base character */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="drop-shadow-md">{base.emoji}</span>
      </div>
      
      {/* Hair color indicator */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow"
        style={{ backgroundColor: hairColor.color }}
      />
      
      {/* Accessory */}
      {accessory && accessory.id !== 'none' && (
        <motion.div 
          className="absolute -top-2 -right-2 text-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {accessory.emoji}
        </motion.div>
      )}
      
      {/* Pet */}
      {pet && pet.id !== 'none' && (
        <motion.div 
          className="absolute -bottom-2 -right-2 text-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1, y: [0, -3, 0] }}
          transition={{ y: { repeat: Infinity, duration: 2 } }}
        >
          {pet.emoji}
        </motion.div>
      )}
    </div>
  )
}

export default function AvatarCustomizer({ currentAvatar, onSave, onCancel }: AvatarCustomizerProps) {
  const [avatar, setAvatar] = useState<AvatarConfig>(currentAvatar || DEFAULT_AVATAR)
  const [activeCategory, setActiveCategory] = useState<CustomizationCategory>('base')
  const [categoryIndex, setCategoryIndex] = useState(0)

  const getOptionsForCategory = (category: CustomizationCategory) => {
    switch (category) {
      case 'base': return AVATAR_BASES
      case 'skinTone': return SKIN_TONES
      case 'hair': return HAIR_STYLES
      case 'hairColor': return HAIR_COLORS
      case 'eyes': return EYE_STYLES
      case 'outfit': return OUTFITS
      case 'accessory': return ACCESSORIES
      case 'pet': return PETS
      default: return []
    }
  }

  const updateAvatar = (category: CustomizationCategory, value: string) => {
    setAvatar(prev => ({ ...prev, [category]: value }))
  }

  const nextCategory = () => {
    const newIndex = (categoryIndex + 1) % CATEGORIES.length
    setCategoryIndex(newIndex)
    setActiveCategory(CATEGORIES[newIndex].id)
  }

  const prevCategory = () => {
    const newIndex = (categoryIndex - 1 + CATEGORIES.length) % CATEGORIES.length
    setCategoryIndex(newIndex)
    setActiveCategory(CATEGORIES[newIndex].id)
  }

  const options = getOptionsForCategory(activeCategory)
  const currentCategory = CATEGORIES[categoryIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white/90 backdrop-blur shadow-2xl border-4 border-purple-200">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
                <Sparkle className="w-8 h-8 text-yellow-500" weight="fill" />
                Create Your Character
                <Sparkle className="w-8 h-8 text-yellow-500" weight="fill" />
              </h2>
              <p className="text-gray-600">Customize your avatar for the adventure!</p>
            </div>

            {/* Avatar Preview */}
            <div className="flex justify-center mb-8">
              <motion.div
                key={JSON.stringify(avatar)}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <AvatarPreview avatar={avatar} size="xl" />
              </motion.div>
            </div>

            {/* Category Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevCategory}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center min-w-[150px]">
                <div className="text-3xl mb-1">{currentCategory.icon}</div>
                <div className="font-bold text-purple-800">{currentCategory.label}</div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextCategory}
                className="rounded-full"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Category Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryIndex(idx)
                    setActiveCategory(cat.id)
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === categoryIndex 
                      ? 'bg-purple-600 scale-125' 
                      : 'bg-purple-200 hover:bg-purple-300'
                  }`}
                />
              ))}
            </div>

            {/* Options Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-4 gap-3 mb-8"
              >
                {options.map((option: any) => {
                  const isSelected = avatar[activeCategory] === option.id
                  const hasColor = 'color' in option
                  
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateAvatar(activeCategory, option.id)}
                      className={`
                        relative p-3 rounded-xl border-3 transition-all
                        ${isSelected 
                          ? 'border-purple-500 bg-purple-100 shadow-lg' 
                          : 'border-gray-200 bg-white hover:border-purple-300'
                        }
                      `}
                    >
                      {hasColor ? (
                        <div 
                          className="w-10 h-10 mx-auto rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: option.color }}
                        />
                      ) : (
                        <div className="text-3xl text-center">{option.emoji}</div>
                      )}
                      <div className="text-xs mt-1 text-center font-medium text-gray-700">
                        {option.label}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" weight="bold" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={() => onSave(avatar)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
              >
                <Sparkle className="w-5 h-5 mr-2" weight="fill" />
                Save Character
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export { DEFAULT_AVATAR, AVATAR_BASES, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, OUTFITS, ACCESSORIES, PETS }
