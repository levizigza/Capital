import { useCallback, useRef } from 'react'

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const callbackRef = useRef<T>(callback)

  callbackRef.current = callback

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0)
  const callbackRef = useRef<T>(callback)

  callbackRef.current = callback

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastRunRef.current >= delay) {
      lastRunRef.current = now
      callbackRef.current(...args)
    }
  }, [delay])
}
