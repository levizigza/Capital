import { useEffect, useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface PersistedData {
  version: string
  timestamp: string
  userProfile: any
  gameScores: any[]
  accessibilitySettings: any
  bankingData: any
  lastSaved: string
}

const PERSISTENCE_KEY = 'financequest-backup'
const VERSION = '1.0.0'

export function useDataPersistence() {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveToLocalStorage = useCallback(async () => {
    try {
      setIsSaving(true)
      const keys = await window.spark.kv.keys()
      const data: Record<string, any> = {}

      for (const key of keys) {
        const value = await window.spark.kv.get(key)
        if (value !== undefined) {
          data[key] = value
        }
      }

      const persistedData: PersistedData = {
        version: VERSION,
        timestamp: new Date().toISOString(),
        userProfile: data['user-profile'] || null,
        gameScores: data['game-scores'] || [],
        accessibilitySettings: data['accessibility-settings'] || null,
        bankingData: data['banking-simulator-state'] || null,
        lastSaved: new Date().toISOString()
      }

      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(persistedData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      toast.error('Failed to save progress backup')
    } finally {
      setIsSaving(false)
    }
  }, [])

  const loadFromLocalStorage = useCallback(async () => {
    try {
      const stored = localStorage.getItem(PERSISTENCE_KEY)
      if (!stored) {
        return null
      }

      const data: PersistedData = JSON.parse(stored)
      return data
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }, [])

  const exportData = useCallback(async () => {
    try {
      const keys = await window.spark.kv.keys()
      const data: Record<string, any> = {}

      for (const key of keys) {
        const value = await window.spark.kv.get(key)
        if (value !== undefined) {
          data[key] = value
        }
      }

      const exportData: PersistedData = {
        version: VERSION,
        timestamp: new Date().toISOString(),
        userProfile: data['user-profile'] || null,
        gameScores: data['game-scores'] || [],
        accessibilitySettings: data['accessibility-settings'] || null,
        bankingData: data['banking-simulator-state'] || null,
        lastSaved: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financequest-progress-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Progress exported successfully!')
      return true
    } catch (error) {
      console.error('Failed to export data:', error)
      toast.error('Failed to export progress')
      return false
    }
  }, [])

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const importedData: PersistedData = JSON.parse(text)

      if (!importedData.version || !importedData.timestamp) {
        toast.error('Invalid data file format')
        return false
      }

      if (importedData.userProfile) {
        await window.spark.kv.set('user-profile', importedData.userProfile)
      }
      if (importedData.gameScores) {
        await window.spark.kv.set('game-scores', importedData.gameScores)
      }
      if (importedData.accessibilitySettings) {
        await window.spark.kv.set('accessibility-settings', importedData.accessibilitySettings)
      }
      if (importedData.bankingData) {
        await window.spark.kv.set('banking-simulator-state', importedData.bankingData)
      }

      await saveToLocalStorage()
      toast.success('Progress imported successfully! Reloading...')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)

      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      toast.error('Failed to import progress - invalid file format')
      return false
    }
  }, [saveToLocalStorage])

  const clearAllData = useCallback(async () => {
    try {
      const keys = await window.spark.kv.keys()
      for (const key of keys) {
        await window.spark.kv.delete(key)
      }
      localStorage.removeItem(PERSISTENCE_KEY)
      setLastSaved(null)
      toast.success('All data cleared successfully')
      return true
    } catch (error) {
      console.error('Failed to clear data:', error)
      toast.error('Failed to clear data')
      return false
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage()
    }, 30000)

    return () => clearInterval(interval)
  }, [saveToLocalStorage])

  useEffect(() => {
    saveToLocalStorage()
  }, [saveToLocalStorage])

  useEffect(() => {
    const loadInitialData = async () => {
      const stored = await loadFromLocalStorage()
      if (stored?.lastSaved) {
        setLastSaved(new Date(stored.lastSaved))
      }
    }
    loadInitialData()
  }, [loadFromLocalStorage])

  return {
    lastSaved,
    isSaving,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportData,
    importData,
    clearAllData
  }
}
