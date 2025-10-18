import { useState } from 'react'
import { Bug, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DebugPanelProps {
  userProfile: any
  currentMode: any
  isInitialized: boolean
  gameScores: any[]
}

export function DebugPanel({ userProfile, currentMode, isInitialized, gameScores }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg"
        variant="outline"
        title="Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Debug Panel
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <div className="font-semibold mb-1 flex items-center justify-between">
            <span>Initialization Status</span>
            <Badge variant={isInitialized ? "default" : "destructive"}>
              {isInitialized ? "Ready" : "Loading"}
            </Badge>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1 flex items-center justify-between">
            <span>Current Mode</span>
            <Badge variant={currentMode ? "default" : "outline"}>
              {currentMode || "None"}
            </Badge>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1">User Profile</div>
          <div className="bg-muted p-2 rounded text-xs font-mono overflow-auto max-h-40">
            {userProfile ? (
              <pre>{JSON.stringify(userProfile, null, 2)}</pre>
            ) : (
              <span className="text-muted-foreground">No profile loaded</span>
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1 flex items-center justify-between">
            <span>Game Scores</span>
            <Badge variant="outline">{gameScores?.length || 0} scores</Badge>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1">Environment</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Window</span>
              <span>{typeof window !== 'undefined' ? '✓' : '✗'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spark KV</span>
              <span>{typeof window !== 'undefined' && window.spark?.kv ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
