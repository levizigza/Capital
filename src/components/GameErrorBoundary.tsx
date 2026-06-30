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
      return (
        <Alert variant="destructive" className="max-w-lg mx-auto mt-12 shadow-lg animate-shake">
          <AlertTitle className="flex items-center gap-2 text-lg font-bold">
            <Warning size={24} weight="duotone" className="text-red-500" />
            Oops! Something went wrong in {this.props.gameName || 'the game'}.
          </AlertTitle>
          <AlertDescription className="mb-4">
            {this.state.error?.message || 'An unexpected error occurred. Please try again or exit.'}
          </AlertDescription>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset} aria-label="Retry game" title="Retry game" data-ux-tooltip="Try again">
              <ArrowClockwise size={18} /> Retry
            </Button>
            {this.props.onExit && (
              <Button variant="ghost" onClick={this.props.onExit} aria-label="Exit to dashboard" title="Exit to dashboard" data-ux-tooltip="Return to dashboard">
                <ArrowLeft size={18} /> Exit
              </Button>
            )}
          </div>
        </Alert>
      )
    }

    return this.props.children
  }
}
