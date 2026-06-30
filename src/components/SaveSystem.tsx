import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FloppyDisk, CloudArrowUp, CloudArrowDown, Trash, Clock, Check, Warning, X } from '@phosphor-icons/react'
import { EnhancedAvatarConfig } from './EnhancedAvatarCustomizer'
import { loadTimelines, persistTimelines } from '@/islands/decisionTimeline'

export interface GameSaveData {
  id: string
  timestamp: number
  playerName: string
  avatarConfig: EnhancedAvatarConfig
  money: number
  completedGames: string[]
  completedChapters: string[]
  unlockedLocations: string[]
  currentLocation: string
  totalPlayTime: number
  achievements: string[]
  settings: {
    musicVolume: number
    sfxVolume: number
    musicEnabled: boolean
  }
  /** Decision timelines from "Why it happened" replay system */
  decisionTimelines?: import('@/islands/decisionTimeline').DecisionTimeline[]
}

interface SaveSystemProps {
  currentData: Omit<GameSaveData, 'id' | 'timestamp'>
  onLoad: (data: GameSaveData) => void
  onClose: () => void
}

const SAVE_SLOTS = 3
const STORAGE_KEY = 'financial-literacy-saves'

export function useSaveSystem() {
  const [saves, setSaves] = useState<(GameSaveData | null)[]>([null, null, null])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null)

  // Load saves from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSaves(parsed)
      }
    } catch (error) {
      console.error('Failed to load saves:', error)
    }
  }, [])

  // Save to localStorage
  const persistSaves = useCallback((newSaves: (GameSaveData | null)[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves))
      setSaves(newSaves)
    } catch (error) {
      console.error('Failed to persist saves:', error)
    }
  }, [])

  // Save to slot
  const saveToSlot = useCallback((slotIndex: number, data: Omit<GameSaveData, 'id' | 'timestamp'>) => {
    const newSave: GameSaveData = {
      ...data,
      id: `save-${slotIndex}-${Date.now()}`,
      timestamp: Date.now(),
      decisionTimelines: loadTimelines(),
    }
    
    const newSaves = [...saves]
    newSaves[slotIndex] = newSave
    persistSaves(newSaves)
    
    return newSave
  }, [saves, persistSaves])

  // Load from slot
  const loadFromSlot = useCallback((slotIndex: number): GameSaveData | null => {
    const data = saves[slotIndex]
    if (data?.decisionTimelines) {
      persistTimelines(data.decisionTimelines)
    }
    return data
  }, [saves])

  // Delete slot
  const deleteSlot = useCallback((slotIndex: number) => {
    const newSaves = [...saves]
    newSaves[slotIndex] = null
    persistSaves(newSaves)
  }, [saves, persistSaves])

  // Auto-save
  const autoSave = useCallback((data: Omit<GameSaveData, 'id' | 'timestamp'>) => {
    if (!autoSaveEnabled) return
    
    // Find auto-save slot (always slot 0) or oldest save
    const newSave: GameSaveData = {
      ...data,
      id: `autosave-${Date.now()}`,
      timestamp: Date.now()
    }
    
    const newSaves = [...saves]
    newSaves[0] = newSave
    persistSaves(newSaves)
    setLastAutoSave(Date.now())
  }, [saves, autoSaveEnabled, persistSaves])

  return {
    saves,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    autoSave,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastAutoSave
  }
}

export default function SaveSystem({ currentData, onLoad, onClose }: SaveSystemProps) {
  const { saves, saveToSlot, loadFromSlot, deleteSlot } = useSaveSystem()
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [mode, setMode] = useState<'menu' | 'save' | 'load' | 'confirm-delete' | 'confirm-overwrite'>('menu')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSave = (slotIndex: number) => {
    if (saves[slotIndex]) {
      setSelectedSlot(slotIndex)
      setMode('confirm-overwrite')
    } else {
      saveToSlot(slotIndex, currentData)
      showNotification('success', 'Game saved successfully!')
      setMode('menu')
    }
  }

  const confirmOverwrite = () => {
    if (selectedSlot !== null) {
      saveToSlot(selectedSlot, currentData)
      showNotification('success', 'Game saved successfully!')
    }
    setMode('menu')
    setSelectedSlot(null)
  }

  const handleLoad = (slotIndex: number) => {
    const data = loadFromSlot(slotIndex)
    if (data) {
      onLoad(data)
      showNotification('success', 'Game loaded successfully!')
      onClose()
    }
  }

  const handleDelete = (slotIndex: number) => {
    setSelectedSlot(slotIndex)
    setMode('confirm-delete')
  }

  const confirmDelete = () => {
    if (selectedSlot !== null) {
      deleteSlot(selectedSlot)
      showNotification('success', 'Save deleted!')
    }
    setMode('menu')
    setSelectedSlot(null)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <Check size={20} /> : <Warning size={20} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="retro-card max-w-2xl w-full"
      >
        {/* Header */}
        <div className="retro-card-header bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FloppyDisk size={28} weight="fill" />
            <span>Save & Load</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1" aria-label="Close save system" title="Close">
            <X size={24} />
          </button>
        </div>

        <div className="retro-card-body">
          {/* Main Menu */}
          {mode === 'menu' && (
            <div className="flex gap-4 justify-center mb-6">
              <button 
                onClick={() => setMode('save')}
                className="retro-btn retro-btn-green flex items-center gap-2"
              >
                <CloudArrowUp size={24} /> Save Game
              </button>
              <button 
                onClick={() => setMode('load')}
                className="retro-btn retro-btn-blue flex items-center gap-2"
              >
                <CloudArrowDown size={24} /> Load Game
              </button>
            </div>
          )}

          {/* Save/Load Slots */}
          {(mode === 'save' || mode === 'load') && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setMode('menu')}
                  className="text-blue-500 hover:underline"
                >
                  ← Back
                </button>
                <h3 className="font-bold text-lg">
                  {mode === 'save' ? '💾 Select Save Slot' : '📂 Select Save to Load'}
                </h3>
                <div />
              </div>

              <div className="space-y-4">
                {saves.map((save, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-3 rounded-xl p-4 ${
                      save ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          save ? 'bg-blue-200' : 'bg-gray-200'
                        }`}>
                          {save ? '💾' : '📁'}
                        </div>
                        <div>
                          <div className="font-bold">
                            {index === 0 ? 'Auto-Save Slot' : `Save Slot ${index}`}
                          </div>
                          {save ? (
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                {formatDate(save.timestamp)}
                              </div>
                              <div>
                                {save.playerName} • 💰 ${save.money} • ⏱️ {formatPlayTime(save.totalPlayTime)}
                              </div>
                              <div className="text-xs">
                                {save.completedGames.length} games completed
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">Empty Slot</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {mode === 'save' && (
                          <button
                            onClick={() => handleSave(index)}
                            className="retro-btn retro-btn-green text-sm py-2"
                          >
                            Save Here
                          </button>
                        )}
                        {mode === 'load' && save && (
                          <button
                            onClick={() => handleLoad(index)}
                            className="retro-btn retro-btn-blue text-sm py-2"
                          >
                            Load
                          </button>
                        )}
                        {save && (
                          <button
                            onClick={() => handleDelete(index)}
                            className="retro-btn retro-btn-red text-sm py-2"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Confirm Delete */}
          {mode === 'confirm-delete' && (
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Delete Save?</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. Are you sure you want to delete this save?
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setMode('menu')}
                  className="retro-btn retro-btn-yellow"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="retro-btn retro-btn-red"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Confirm Overwrite */}
          {mode === 'confirm-overwrite' && (
            <div className="text-center">
              <div className="text-6xl mb-4">💾</div>
              <h3 className="text-xl font-bold mb-2">Overwrite Save?</h3>
              <p className="text-gray-600 mb-6">
                This slot already has a save. Do you want to replace it?
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setMode('save')}
                  className="retro-btn retro-btn-yellow"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmOverwrite}
                  className="retro-btn retro-btn-green"
                >
                  Overwrite
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Navigation Helper Component
export function NavigationHelper({ 
  message, 
  direction,
  onDismiss 
}: { 
  message: string
  direction?: 'up' | 'down' | 'left' | 'right'
  onDismiss?: () => void
}) {
  const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="retro-speech-bubble bg-yellow-100 border-yellow-400 max-w-xs">
        <div className="flex items-center gap-2">
          {direction && (
            <motion.span
              animate={{ 
                x: direction === 'left' ? [-5, 0] : direction === 'right' ? [5, 0] : 0,
                y: direction === 'up' ? [-5, 0] : direction === 'down' ? [5, 0] : 0
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-2xl"
            >
              {arrows[direction]}
            </motion.span>
          )}
          <span className="text-sm">{message}</span>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Pop-up Guide Component
export function PopupGuide({
  title,
  message,
  emoji,
  onConfirm,
  onCancel,
  confirmText = 'Got it!',
  cancelText
}: {
  title: string
  message: string
  emoji: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex: 10000 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        className="retro-card max-w-sm w-full"
      >
        <div className="retro-card-body text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-6xl mb-4"
          >
            {emoji}
          </motion.div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            {onCancel && cancelText && (
              <button onClick={onCancel} className="retro-btn retro-btn-yellow">
                {cancelText}
              </button>
            )}
            <button onClick={onConfirm} className="retro-btn retro-btn-green">
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
