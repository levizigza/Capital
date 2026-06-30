import { Warning, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Warning className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-slate-800">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 text-center">
            <p>An error occurred while running the application.</p>
            <p className="mt-2 font-mono text-xs bg-slate-100 p-2 rounded">
              {error.message}
            </p>
          </div>
          <Button 
            onClick={resetErrorBoundary}
            className="w-full"
            variant="outline"
            aria-label="Try again"
            title="Try again"
            data-ux-tooltip="Retry the last action"
          >
            <ArrowCounterClockwise className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}