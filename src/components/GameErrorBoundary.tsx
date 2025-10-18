import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Warning, ArrowLeft, ArrowClockwise } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
  gameName?: string
  onExit?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Game Error Boundary caught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      const { gameName, onExit } = this.props
      const { error } = this.state

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Warning className="w-6 h-6 text-destructive" weight="fill" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Game Error</CardTitle>
                  <CardDescription>
                    {gameName ? `${gameName} encountered an error` : 'The game encountered an error'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <Warning className="w-4 h-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  The game crashed unexpectedly. Your progress has been saved, and you can try playing again.
                </AlertDescription>
              </Alert>

              {error && (
                <div className="bg-muted p-4 rounded-lg border">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Error Details:</h4>
                  <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-32">
                    {error.message}
                  </pre>
                </div>
              )}

              <div className="flex gap-3">
                {onExit && (
                  <Button 
                    onClick={onExit}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Games
                  </Button>
                )}
                <Button 
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  <ArrowClockwise className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                If this problem persists, try refreshing the page or clearing your browser cache.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
