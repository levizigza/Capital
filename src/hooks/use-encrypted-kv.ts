import { useState, useEffect, useCallback } from 'react'
import { EncryptionService } from '@/lib/encryption'

export function useEncryptedKV<T>(
  key: string,
  defaultValue: T,
  userId: string
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const encryptedData = await window.spark.kv.get<string>(key)
        if (encryptedData) {
          const decrypted = await EncryptionService.decryptObject<T>(encryptedData, userId)
          setValue(decrypted)
        } else {
          setValue(defaultValue)
        }
      } catch {
        setValue(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    loadValue()
  }, [key, userId])

  const setEncryptedValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const resolvedValue = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(value)
        : newValue

      setValue(resolvedValue)

      try {
        const encrypted = await EncryptionService.encryptObject(resolvedValue, userId)
        await window.spark.kv.set(key, encrypted)
      } catch {
      }
    },
    [key, userId, value]
  )

  const deleteValue = useCallback(async () => {
    try {
      await window.spark.kv.delete(key)
      setValue(defaultValue)
    } catch {
    }
  }, [key, defaultValue])

  if (isLoading) {
    return [defaultValue, () => {}, () => {}]
  }

  return [value, setEncryptedValue, deleteValue]
}
