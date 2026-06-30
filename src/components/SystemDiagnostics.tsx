import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Warning, Info } from '@phosphor-icons/react'
import { useKV } from '@/hooks/use-safe-kv'

interface DiagnosticResult {
  name: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  message: string
}

export function SystemDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [userProfile] = useKV<Record<string, unknown> | null>('user-profile', null)
  const [gameScores] = useKV<unknown[]>('game-scores', [])

  useEffect(() => {
    const runDiagnostics = async () => {
      const diagnostics: DiagnosticResult[] = []

      diagnostics.push({
        name: 'Local Storage',
        status: typeof localStorage !== 'undefined' ? 'pass' : 'fail',
        message: typeof localStorage !== 'undefined' 
          ? 'localStorage is available' 
          : 'localStorage is not available (required for saving progress)'
      })

      diagnostics.push({
        name: 'User Profile',
        status: userProfile ? 'pass' : 'warning',
        message: userProfile 
          ? `Profile loaded: Level ${(userProfile as Record<string, unknown>).level}` 
          : 'No user profile found (will be created on first action)'
      })

      diagnostics.push({
        name: 'Game Scores',
        status: Array.isArray(gameScores) ? 'pass' : 'warning',
        message: `${gameScores?.length || 0} game scores recorded`
      })

      diagnostics.push({
        name: 'Spark KV',
        status: typeof window.spark !== 'undefined' && window.spark.kv ? 'pass' : 'fail',
        message: typeof window.spark !== 'undefined' && window.spark.kv
          ? 'Spark KV persistence is available'
          : 'Spark KV not available (critical for data persistence)'
      })

      diagnostics.push({
        name: 'GitHub User',
        status: typeof window.spark !== 'undefined' ? 'pass' : 'warning',
        message: typeof window.spark !== 'undefined'
          ? 'Spark SDK loaded'
          : 'Spark SDK may not be loaded'
      })

      const hasWebGL = (() => {
        try {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        } catch {
          return false
        }
      })()

      diagnostics.push({
        name: 'WebGL Support',
        status: hasWebGL ? 'pass' : 'info',
        message: hasWebGL 
          ? 'WebGL is supported (enables 3D games)' 
          : 'WebGL not available (3D games may not work)'
      })

      diagnostics.push({
        name: 'Animation Support',
        status: typeof window.requestAnimationFrame !== 'undefined' ? 'pass' : 'warning',
        message: typeof window.requestAnimationFrame !== 'undefined'
          ? 'RequestAnimationFrame available'
          : 'Limited animation support'
      })

      diagnostics.push({
        name: 'Touch Support',
        status: 'ontouchstart' in window ? 'info' : 'info',
        message: 'ontouchstart' in window 
          ? 'Touch events supported (mobile device)' 
          : 'Mouse input detected (desktop device)'
      })

      const screenSize = `${window.innerWidth}x${window.innerHeight}`
      diagnostics.push({
        name: 'Screen Resolution',
        status: 'info',
        message: `${screenSize} - ${window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop'} layout`
      })

      diagnostics.push({
        name: 'Browser',
        status: 'info',
        message: navigator.userAgent.includes('Chrome') ? 'Chrome' :
                 navigator.userAgent.includes('Firefox') ? 'Firefox' :
                 navigator.userAgent.includes('Safari') ? 'Safari' :
                 navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown'
      })

      setResults(diagnostics)
    }

    runDiagnostics()
  }, [userProfile, gameScores])

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" weight="fill" />
      case 'warning':
        return <Warning className="w-5 h-5 text-yellow-500" weight="fill" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" weight="fill" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      info: 'outline'
    }
    return <Badge variant={variants[status] as 'default' | 'destructive' | 'secondary' | 'outline'}>{status.toUpperCase()}</Badge>
  }

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warningCount = results.filter(r => r.status === 'warning').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Diagnostics</CardTitle>
        <CardDescription>
          Platform health check - {passCount} passing, {failCount} failing, {warningCount} warnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(result.status)}
              <div>
                <p className="font-medium">{result.name}</p>
                <p className="text-sm text-muted-foreground">{result.message}</p>
              </div>
            </div>
            {getStatusBadge(result.status)}
          </div>
        ))}

        {failCount > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">
              ⚠️ Critical Issues Detected
            </p>
            <p className="text-sm text-muted-foreground">
              Some core features may not work properly. Try refreshing the page or using a different browser.
            </p>
          </div>
        )}

        {failCount === 0 && passCount > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              ✅ All Systems Operational
            </p>
            <p className="text-sm text-muted-foreground">
              Capital is ready to use. Start playing games to begin your financial learning journey!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
