import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, Target, Trophy, Coins, Lightning, 
  CheckCircle, XCircle, Eye
} from '@phosphor-icons/react'

interface BCIGameDemoProps {
  onComplete: (score: number) => void
  onExit: () => void
}

interface BrainState {
  focus: number
  relaxation: number
  attention: number
  isCalibrated: boolean
}

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "What's the recommended emergency fund size?",
    options: ["1 month expenses", "3-6 months expenses", "1 year expenses", "No emergency fund needed"],
    correct: 1,
    explanation: "3-6 months of expenses provides a good safety net for most emergencies."
  },
  {
    id: 2,
    question: "What does compound interest mean?",
    options: ["Interest on your initial amount", "Interest on interest earned", "Fixed interest rate", "Simple interest"],
    correct: 1,
    explanation: "Compound interest means earning interest on both your initial investment and previously earned interest."
  },
  {
    id: 3,
    question: "What's a good debt-to-income ratio?",
    options: ["Under 20%", "Under 36%", "Under 50%", "Over 60%"],
    correct: 1,
    explanation: "A debt-to-income ratio under 36% is generally considered healthy for most people."
  }
]

export function BCIGameDemo({ onComplete, onExit }: BCIGameDemoProps) {
  const [brainState, setBrainState] = useState<BrainState>({
    focus: 0.5,
    relaxation: 0.5,
    attention: 0.5,
    isCalibrated: false
  })
  
  const [gameState, setGameState] = useState({
    currentQuestion: 0,
    score: 0,
    isActive: false,
    selectedAnswer: -1,
    showExplanation: false,
    bonusMultiplier: 1,
    focusTime: 0
  })
  
  const [calibrating, setCalibrating] = useState(false)
  const [calibrationProgress, setCalibrationProgress] = useState(0)

  // Simulate BCI data
  useEffect(() => {
    if (!gameState.isActive && !calibrating) return

    const interval = setInterval(() => {
      setBrainState(prev => {
        // Simulate realistic brain signal fluctuations
        const focusChange = (Math.random() - 0.5) * 0.1
        const relaxationChange = (Math.random() - 0.5) * 0.08
        const attentionChange = (Math.random() - 0.5) * 0.12
        
        return {
          ...prev,
          focus: Math.max(0, Math.min(1, prev.focus + focusChange)),
          relaxation: Math.max(0, Math.min(1, prev.relaxation + relaxationChange)),
          attention: Math.max(0, Math.min(1, prev.attention + attentionChange))
        }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [gameState.isActive, calibrating])

  // Track focus time for bonuses
  useEffect(() => {
    if (!gameState.isActive) return

    const tracker = setInterval(() => {
      if (brainState.focus > 0.7) {
        setGameState(prev => ({
          ...prev,
          focusTime: prev.focusTime + 1,
          bonusMultiplier: Math.min(3, 1 + prev.focusTime / 10)
        }))
      }
    }, 1000)

    return () => clearInterval(tracker)
  }, [gameState.isActive, brainState.focus])

  const startCalibration = () => {
    setCalibrating(true)
    setCalibrationProgress(0)
    
    const calibrationInterval = setInterval(() => {
      setCalibrationProgress(prev => {
        const newProgress = prev + 5
        if (newProgress >= 100) {
          setCalibrating(false)
          setBrainState(prev => ({ ...prev, isCalibrated: true }))
          clearInterval(calibrationInterval)
        }
        return newProgress
      })
    }, 200)
  }

  const startGame = () => {
    if (!brainState.isCalibrated) {
      startCalibration()
      return
    }
    
    setGameState(prev => ({ 
      ...prev, 
      isActive: true,
      currentQuestion: 0,
      score: 0,
      selectedAnswer: -1,
      showExplanation: false,
      bonusMultiplier: 1,
      focusTime: 0
    }))
  }

  const selectAnswer = (answerIndex: number) => {
    if (gameState.selectedAnswer !== -1) return
    
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }))
    
    // Show result after a brief delay
    setTimeout(() => {
      const currentQ = questions[gameState.currentQuestion]
      const isCorrect = answerIndex === currentQ.correct
      const basePoints = isCorrect ? 100 : 0
      const focusBonus = brainState.focus > 0.6 ? Math.round(basePoints * 0.5) : 0
      const totalPoints = basePoints + focusBonus
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + Math.round(totalPoints * prev.bonusMultiplier),
        showExplanation: true
      }))
    }, 1000)
  }

  const nextQuestion = () => {
    if (gameState.currentQuestion < questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: -1,
        showExplanation: false
      }))
    } else {
      // Game complete
      onComplete(gameState.score)
    }
  }

  const getFocusColor = (focus: number) => {
    if (focus < 0.3) return 'text-red-500'
    if (focus < 0.6) return 'text-yellow-500'
    return 'text-green-500'
  }

  if (calibrating) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
              Calibrating Brain Interface
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="text-6xl">🧠</div>
              <p className="text-sm text-slate-600">
                Relax and focus on the center of the screen. We're measuring your baseline brain activity.
              </p>
              
              <div className="space-y-2">
                <Progress value={calibrationProgress} className="h-3" />
                <p className="text-sm font-medium">{calibrationProgress}% Complete</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Focus:</span>
                    <span className={`ml-2 font-bold ${getFocusColor(brainState.focus)}`}>
                      {Math.round(brainState.focus * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Relaxation:</span>
                    <span className="ml-2 font-bold text-blue-500">
                      {Math.round(brainState.relaxation * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameState.isActive) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Brain className="w-8 h-8 text-purple-500" />
              BCI Finance Quiz
            </CardTitle>
            <p className="text-slate-600">
              Answer questions while your brain activity enhances your learning experience!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="text-6xl">🎯</div>
              <p className="text-sm text-slate-600">
                Your focus level affects your score multiplier. Stay focused for bonus points!
              </p>
            </div>
            
            {brainState.isCalibrated && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">BCI Calibrated Successfully</span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={startGame} className="w-full" size="lg">
                <Lightning className="w-5 h-5 mr-2" />
                {brainState.isCalibrated ? 'Start BCI Quiz' : 'Calibrate & Start'}
              </Button>
              
              <Button onClick={onExit} variant="ghost" className="w-full">
                Back to Games
              </Button>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <div className="font-medium mb-2">How BCI Enhances Learning:</div>
              <ul className="space-y-1 text-slate-600">
                <li>• High focus = score multiplier bonus</li>
                <li>• Relaxed state = extra thinking time</li>
                <li>• Flow state = unlocks advanced questions</li>
                <li>• Real-time feedback on mental state</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[gameState.currentQuestion]

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 to-blue-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* BCI Status */}
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Brain Activity</span>
              </div>
              <Badge variant="default" className="bg-green-600">Live</Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Focus</span>
                  <span className={`font-bold ${getFocusColor(brainState.focus)}`}>
                    {Math.round(brainState.focus * 100)}%
                  </span>
                </div>
                <Progress value={brainState.focus * 100} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Relaxation</span>
                  <span className="font-bold text-blue-500">
                    {Math.round(brainState.relaxation * 100)}%
                  </span>
                </div>
                <Progress value={brainState.relaxation * 100} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Multiplier</span>
                  <span className="font-bold text-green-500">
                    {gameState.bonusMultiplier.toFixed(1)}x
                  </span>
                </div>
                <Progress value={(gameState.bonusMultiplier - 1) / 2 * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-bold">{gameState.score}</span>
            </div>
            <div className="text-sm">
              Question {gameState.currentQuestion + 1} of {questions.length}
            </div>
          </div>
          
          <div className="text-sm">
            Focus Time: {gameState.focusTime}s
          </div>
        </div>

        {/* Question Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full text-left p-4 rounded-lg border transition-all"
                
                if (gameState.selectedAnswer === -1) {
                  buttonClass += " hover:bg-slate-50 border-slate-200"
                } else if (index === currentQuestion.correct) {
                  buttonClass += " bg-green-100 border-green-300 text-green-800"
                } else if (index === gameState.selectedAnswer) {
                  buttonClass += " bg-red-100 border-red-300 text-red-800"
                } else {
                  buttonClass += " bg-slate-100 border-slate-200 text-slate-600"
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={gameState.selectedAnswer !== -1}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      {gameState.selectedAnswer !== -1 && (
                        <div className="w-5 h-5">
                          {index === currentQuestion.correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : index === gameState.selectedAnswer ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : null}
                        </div>
                      )}
                      <span>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            
            {gameState.showExplanation && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Explanation:</div>
                    {currentQuestion.explanation}
                  </div>
                </div>
                
                <Button 
                  onClick={nextQuestion}
                  className="w-full mt-4"
                >
                  {gameState.currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* BCI Effects */}
        {brainState.focus > 0.7 && (
          <div className="text-center">
            <Badge variant="default" className="bg-green-600 animate-pulse">
              🎯 High Focus Bonus Active!
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}