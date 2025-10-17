import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Clock, Trophy, Target, Calculator,
  TrendUp, Coins, Play, X, GameController,
  Brain, Lightbulb, Eye, Headphones, BookOpen, Hand
} from '@phosphor-icons/react'
import { RetroGameEngine } from './RetroGameEngine'
import { KinestheticController } from './KinestheticController'
import { BCIInterface } from './BCIInterface'
import { VARKAssessment } from './VARKAssessment'

interface RetroGameHubProps {
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface RetroGame {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  color: string
  gameType: 'lemonade-boss' | 'pixel-budget-runner' | 'market-tycoon' | 'debt-dash'
  kinestheticEnabled: boolean
  bciEnabled: boolean
  learningObjectives: string[]
}

interface LearningStyle {
  visual: number
  auditory: number
  readWrite: number
  kinesthetic: number
  dominant: 'visual' | 'auditory' | 'read-write' | 'kinesthetic'
}

const retroGames: RetroGame[] = [
  {
    id: 'lemonade-boss',
    title: '🍋 Lemonade Boss',
    description: 'Master unit costs, pricing, and profit margins in this classic business sim',
    icon: <Coins className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '3-5 min',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gameType: 'lemonade-boss',
    kinestheticEnabled: true,
    bciEnabled: true,
    learningObjectives: ['Unit Cost Analysis', 'Profit Margin Calculation', 'Market Demand']
  },
  {
    id: 'pixel-budget-runner',
    title: '🏃 Pixel Budget Runner',
    description: 'Side-scroll through budgeting challenges using the envelope method',
    icon: <Calculator className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    gameType: 'pixel-budget-runner',
    kinestheticEnabled: true,
    bciEnabled: true,
    learningObjectives: ['Zero-Based Budgeting', 'Envelope Method', 'Expense Tracking']
  },
  {
    id: 'market-tycoon',
    title: '📈 8-Bit Market Tycoon',
    description: 'Build a diversified portfolio in this retro investment simulator',
    icon: <TrendUp className="w-6 h-6" />,
    difficulty: 'Hard',
    estimatedTime: '5-8 min',
    color: 'bg-green-100 text-green-800 border-green-200',
    gameType: 'market-tycoon',
    kinestheticEnabled: true,
    bciEnabled: true,
    learningObjectives: ['Portfolio Diversification', 'Risk-Return Analysis', 'Market Timing']
  },
  {
    id: 'debt-dash',
    title: '💳 Debt Dash',
    description: 'Endless runner where you dodge debt and choose repayment strategies',
    icon: <Target className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '3-4 min',
    color: 'bg-red-100 text-red-800 border-red-200',
    gameType: 'debt-dash',
    kinestheticEnabled: true,
    bciEnabled: true,
    learningObjectives: ['Debt Snowball Method', 'Interest Rate Optimization', 'Payment Prioritization']
  }
]

export function RetroGameHub({ onGameComplete, onExit, userTier = 'middle' }: RetroGameHubProps) {
  const [selectedGame, setSelectedGame] = useState<RetroGame | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null)
  const [showVARKAssessment, setShowVARKAssessment] = useState(false)
  const [kinestheticEnabled, setKinestheticEnabled] = useState(false)
  const [bciEnabled, setBciEnabled] = useState(false)
  const [bciConnected, setBciConnected] = useState(false)
  const [focusLevel, setFocusLevel] = useState(0.5)

  console.log('RetroGameHub rendered with:', { selectedGame, isPlaying, showVARKAssessment })

  // Auto-detect learning style preference from storage or use default
  useEffect(() => {
    const loadLearningStyle = async () => {
      try {
        const storedStyle = await window.spark.kv.get<LearningStyle>('learning-style')
        if (storedStyle) {
          setLearningStyle(storedStyle)
        } else {
          // Skip assessment by default - use balanced learning style
          const defaultStyle: LearningStyle = {
            visual: 0.35,
            auditory: 0.25,
            readWrite: 0.2,
            kinesthetic: 0.2,
            dominant: 'visual'
          }
          setLearningStyle(defaultStyle)
          await window.spark.kv.set('learning-style', defaultStyle)
        }
      } catch (error) {
        console.error('Error loading learning style:', error)
        const defaultStyle: LearningStyle = {
          visual: 0.35,
          auditory: 0.25,
          readWrite: 0.2,
          kinesthetic: 0.2,
          dominant: 'visual'
        }
        setLearningStyle(defaultStyle)
      }
    }

    loadLearningStyle()
  }, [])

  const handleVARKComplete = (results: LearningStyle) => {
    setLearningStyle(results)
    window.spark.kv.set('learning-style', results)
    setShowVARKAssessment(false)
    
    // Auto-enable kinesthetic mode if dominant
    if (results.dominant === 'kinesthetic' && results.kinesthetic > 0.6) {
      setKinestheticEnabled(true)
    }
  }

  const handleVARKSkip = () => {
    // Create a default balanced learning style for skipped users
    const defaultStyle: LearningStyle = {
      visual: 0.3,
      auditory: 0.25,
      readWrite: 0.2,
      kinesthetic: 0.25,
      dominant: 'visual'
    }
    
    setLearningStyle(defaultStyle)
    window.spark.kv.set('learning-style', defaultStyle)
    setShowVARKAssessment(false)
  }

  const handleGameStart = (game: RetroGame) => {
    console.log('Starting game:', game.id)
    setSelectedGame(game)
    setIsPlaying(true)
  }

  const handleGameComplete = (score: number, timeSpent: number, additionalData?: any) => {
    if (selectedGame) {
      onGameComplete(selectedGame.id, score, timeSpent, {
        ...additionalData,
        learningStyle: learningStyle?.dominant,
        kinestheticUsed: kinestheticEnabled,
        bciUsed: bciEnabled,
        avgFocusLevel: focusLevel
      })
    }
    setIsPlaying(false)
    setSelectedGame(null)
  }

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return <Eye className="w-4 h-4" />
      case 'auditory': return <Headphones className="w-4 h-4" />
      case 'read-write': return <BookOpen className="w-4 h-4" />
      case 'kinesthetic': return <Hand className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  if (showVARKAssessment) {
    console.log('Showing VARK assessment')
    return (
      <div className="h-full bg-slate-50">
        <VARKAssessment onComplete={handleVARKComplete} onSkip={handleVARKSkip} />
      </div>
    )
  }

  if (isPlaying && selectedGame) {
    console.log('Playing game:', selectedGame.id)
    return (
      <div className="h-full bg-slate-900">
        <RetroGameEngine
          game={selectedGame}
          learningStyle={learningStyle}
          kinestheticEnabled={kinestheticEnabled}
          bciEnabled={bciEnabled}
          onComplete={handleGameComplete}
          onExit={() => {setIsPlaying(false); setSelectedGame(null)}}
        />
      </div>
    )
  }

  console.log('Showing game selection')

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExit}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-3">
                <GameController className="w-6 h-6" />
                Retro Finance Arcade
              </h1>
              <p className="text-slate-300 text-sm">Learn finance through classic gaming</p>
            </div>
          </div>
          
          {/* Learning Style & Controls */}
          <div className="flex items-center gap-3">
            {learningStyle && (
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-700 rounded-lg">
                {getLearningStyleIcon(learningStyle.dominant)}
                <span className="text-xs capitalize">{learningStyle.dominant} Learner</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant={kinestheticEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setKinestheticEnabled(!kinestheticEnabled)}
                className={`text-xs h-8 ${kinestheticEnabled ? "bg-green-600 hover:bg-green-700" : "border-slate-600 text-slate-300"}`}
              >
                <Hand className="w-3 h-3 mr-1" />
                Motion
              </Button>
              
              <Button
                variant={bciEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setBciEnabled(!bciEnabled)}
                className={`text-xs h-8 ${bciEnabled ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600 text-slate-300"}`}
              >
                <Brain className="w-3 h-3 mr-1" />
                BCI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BCI Status & Controls */}
      {bciEnabled && (
        <div className="bg-slate-100 border-b p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Brain Interface</span>
                <Badge variant={bciConnected ? "default" : "outline"} className="text-xs">
                  {bciConnected ? "Connected" : "Searching..."}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Focus Level:</span>
                <Progress value={focusLevel * 100} className="w-20 h-1.5" />
                <span className="text-xs font-mono">{Math.round(focusLevel * 100)}%</span>
              </div>
            </div>
            
            <BCIInterface
              onFocusChange={setFocusLevel}
              onConnectionChange={setBciConnected}
            />
          </div>
        </div>
      )}

      {/* Kinesthetic Controls */}
      {kinestheticEnabled && (
        <div className="bg-blue-50 border-b p-3 flex-shrink-0">
          <KinestheticController
            onMotionDetected={(motion) => console.log('Motion:', motion)}
            className="w-full"
          />
        </div>
      )}

      {/* Game Selection - Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Choose Your Financial Adventure
            </h2>
            <p className="text-base text-slate-600">
              Experience classic arcade-style games with modern financial education. 
              Each game adapts to your learning style.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {retroGames.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 hover:border-slate-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${game.color.split(' ')[0]}`}>
                      {game.icon}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {game.difficulty}
                      </Badge>
                      {game.kinestheticEnabled && kinestheticEnabled && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          <Hand className="w-3 h-3 mr-1" />
                        </Badge>
                      )}
                      {game.bciEnabled && bciEnabled && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          <Brain className="w-3 h-3 mr-1" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-slate-600 transition-colors">
                    {game.title}
                  </CardTitle>
                  <p className="text-slate-600 text-sm">{game.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {game.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {game.learningObjectives.length} Skills
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">Learning Objectives:</p>
                      <div className="flex flex-wrap gap-1">
                        {game.learningObjectives.map((objective, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {objective}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-slate-800 transition-colors"
                      onClick={() => handleGameStart(game)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Learning Style Info */}
          {learningStyle && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                {getLearningStyleIcon(learningStyle.dominant)}
                Your Learning Profile
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(learningStyle).filter(([key]) => key !== 'dominant').map(([style, score]) => (
                  <div key={style} className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      {getLearningStyleIcon(style)}
                      <span className="text-xs font-medium capitalize">{style === 'readWrite' ? 'Read/Write' : style}</span>
                    </div>
                    <Progress value={score * 100} className="h-1.5 mb-1" />
                    <span className="text-xs text-slate-500">{Math.round(score * 100)}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Games adapt to your <strong>{learningStyle.dominant}</strong> learning preference
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVARKAssessment(true)}
                  className="text-xs"
                >
                  Retake Assessment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}