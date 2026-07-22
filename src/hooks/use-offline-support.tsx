import { useEffect, useState } from 'react'
import { WifiSlash, WifiHigh, DownloadSimple, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'caching' | 'cached' | 'error'>('idle')

  useEffect(() => {
    // In development, never let a cached service worker mask live code changes.
    // Unregister any existing worker and clear its caches so dev is always fresh.
    if (import.meta.env.DEV) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister())
        })
      }
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
      }
    } else if ('serviceWorker' in navigator) {
      // main.tsx already registers under BASE_URL; only observe + update here
      // so GitHub Pages (/Capital/) never hits a root /sw.js 404.
      const swUrl = `${import.meta.env.BASE_URL}sw.js`
      navigator.serviceWorker.ready.then(() => {
        setIsInstalled(true)
      })

      navigator.serviceWorker
        .register(swUrl, { scope: import.meta.env.BASE_URL })
        .then((registration) => {
          setIsInstalled(true)
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast.info('New version available! Refresh to update.')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
          setCacheStatus('error')
        })
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online!')
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.info('You are offline. App will work with cached data.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const cacheAssets = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Service Workers not supported')
      return
    }

    setCacheStatus('caching')
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Send message to service worker to cache additional URLs
      if (registration.active) {
        registration.active.postMessage({
          type: 'CACHE_URLS',
          urls: [
            import.meta.env.BASE_URL,
            `${import.meta.env.BASE_URL}index.html`,
          ]
        })
      }

      setCacheStatus('cached')
      toast.success('Assets cached for offline use!')
    } catch (error) {
      console.error('Cache failed:', error)
      setCacheStatus('error')
      toast.error('Failed to cache assets')
    }
  }

  const installApp = async () => {
    if (!installPrompt) {
      toast.error('Install prompt not available')
      return
    }

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!')
      setInstallPrompt(null)
    }
  }

  return {
    isOnline,
    isInstalled,
    installPrompt,
    cacheStatus,
    cacheAssets,
    installApp
  }
}

export function OfflineIndicator() {
  const { isOnline } = useOfflineSupport()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="bg-yellow-50 border-2 border-yellow-400 shadow-lg">
        <CardContent className="p-3 flex items-center gap-2">
          <WifiSlash className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-800">Offline Mode</span>
        </CardContent>
      </Card>
    </div>
  )
}

export function OfflineSettings() {
  const { isOnline, isInstalled, installPrompt, cacheStatus, cacheAssets, installApp } = useOfflineSupport()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Offline Support</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enable offline functionality to use the app without an internet connection.
        </p>
      </div>

      {/* Online Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <WifiHigh className="w-5 h-5 text-green-600" />
              ) : (
                <WifiSlash className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-semibold">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {isInstalled && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Service Worker Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Assets */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3">
            <h4 className="font-semibold mb-1">Cache Assets</h4>
            <p className="text-sm text-gray-600">
              Download and cache app assets for offline use.
            </p>
          </div>
          {cacheStatus === 'caching' && (
            <div className="mb-3">
              <Progress value={50} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Caching assets...</p>
            </div>
          )}
          <Button
            onClick={cacheAssets}
            disabled={cacheStatus === 'caching' || !isInstalled}
            className="w-full"
            variant="outline"
          >
            <DownloadSimple className="w-4 h-4 mr-2" />
            {cacheStatus === 'cached' ? 'Assets Cached' : 'Cache Assets for Offline'}
          </Button>
        </CardContent>
      </Card>

      {/* Install App */}
      {installPrompt && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-3">
              <h4 className="font-semibold mb-1">Install App</h4>
              <p className="text-sm text-gray-600">
                Install Capital as a Progressive Web App for better offline support.
              </p>
            </div>
            <Button onClick={installApp} className="w-full">
              <DownloadSimple className="w-4 h-4 mr-2" />
              Install App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 text-blue-900">Offline Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Play all mini-games offline</li>
            <li>✓ Access your progress and profile</li>
            <li>✓ View game scores and achievements</li>
            <li>✓ Use village map navigation</li>
            <li>✓ Data syncs when back online</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
