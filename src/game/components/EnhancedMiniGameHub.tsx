/**
 * Enhanced Mini-Game Hub with Age Tiers, Motion Controls, BCI, and VARK Adaptation
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Users, GraduationCap, Briefcase, Brain, Eye, 
  SpeakerHigh, FileText, Hand, Trophy, Gear,
  Play, Clock, Star
} from '@phosphor-icons/react'
import { MotionControlSystem } from '../systems/MotionControlSystem'
import { BCISystem, CognitiveState } from '../systems/BCISystem'
import { VARKSystem } from '../systems/VARKSystem'
import { AgeTierSystem } from '../systems/AgeTierSystem'
import { RetroLemonadeStand } from './RetroLemonadeStand'
import { MotionBudgetGame } from './MotionBudgetGame'

interface GameDefinition {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
  ageGroups: ('elementary' | 'middle' | 'adult')[]
  supportedModes: ('visual' | 'aural' | 'readWrite' | 'kinesthetic')[]
  motionEnabled: boolean
  bciEnabled: boolean
  estimatedTime: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
}

interface EnhancedMiniGameHubProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
}

export const EnhancedMiniGameHub: React.FC<EnhancedMiniGameHubProps> = ({
  onGameComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onExit
}) => {
  const [currentView, setCurrentView] = useState<'ageSelect' | 'varkAssessment' | 'gameHub' | 'playing'>('ageSelect')
  const [, setSelectedAge] = useState<number | null>(null)
  const [varkAssessmentStep, setVarkAssessmentStep] = useState(0)
  const [varkResponses, setVarkResponses] = useState<{ questionId: string, selectedOption: number }[]>([])
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null)
  const [cognitiveState, setCognitiveState] = useState<CognitiveState | null>(null)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [bciEnabled, setBciEnabled] = useState(false)

  const varkSystem = useRef<VARKSystem>(new VARKSystem())
  const ageSystem = useRef<AgeTierSystem>(new AgeTierSystem())
  const motionSystem = useRef<MotionControlSystem | null>(null)
  const bciSystem = useRef<BCISystem | null>(null)

  const games: GameDefinition[] = [
    {
      id: 'retro-lemonade',
      title: 'Retro Lemonade Stand',
      description: '8-bit business simulation with motion controls',
      icon: <Trophy className="w-8 h-8" />,
      category: 'Entrepreneurship',
      ageGroups: ['elementary', 'middle', 'adult'],
      supportedModes: ['visual', 'kinesthetic', 'aural'],
      motionEnabled: true,
      bciEnabled: true,
      estimatedTime: 5,
      component: RetroLemonadeStand
    },
    {
      id: 'motion-budget',
      title: 'Motion Budget Game',
      description: 'Physical budgeting with tilt controls',
      icon: <Hand className="w-8 h-8" />,
      category: 'Budgeting',
      ageGroups: ['middle', 'adult'],
      supportedModes: ['kinesthetic', 'visual'],
      motionEnabled: true,
      bciEnabled: false,
      estimatedTime: 4,
      component: MotionBudgetGame
    }
  ]

  useEffect(() => {
    initializeSystems()
  }, [])

  const initializeSystems = async () => {
    // Initialize motion controls
    motionSystem.current = new MotionControlSystem()
    const motionSuccess = await motionSystem.current.initialize()
    setMotionEnabled(motionSuccess)

    // Initialize BCI
    bciSystem.current = new BCISystem({ deviceType: 'mock' })
    const bciSuccess = await bciSystem.current.initialize()
    setBciEnabled(bciSuccess)

    if (bciSuccess) {
      bciSystem.current.onStateChange(setCognitiveState)
      await bciSystem.current.calibrate(5)
    }
  }

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age)
    ageSystem.current.setUserAge(age)
    
    // Skip VARK assessment for very young children
    if (age < 8) {
      // Set default kinesthetic preference for young children
      varkSystem.current.calculateProfile([
        { questionId: 'money_learning', selectedOption: 3 }, // kinesthetic
        { questionId: 'problem_solving', selectedOption: 3 },
        { questionId: 'memory_retention', selectedOption: 3 }
      ])
      setCurrentView('gameHub')
    } else {
      setCurrentView('varkAssessment')
    }
  }

  const handleVarkResponse = (questionId: string, optionIndex: number) => {
    const newResponses = [...varkResponses, { questionId, selectedOption: optionIndex }]
    setVarkResponses(newResponses)

    if (varkAssessmentStep < varkSystem.current.getQuestions().length - 1) {
      setVarkAssessmentStep(varkAssessmentStep + 1)
    } else {
      // Complete VARK assessment
      varkSystem.current.calculateProfile(newResponses)
      setCurrentView('gameHub')
    }
  }

  const getFilteredGames = () => {
    const currentTier = ageSystem.current.getCurrentTier()
    const varkProfile = varkSystem.current.getProfile()
    
    if (!currentTier) return games

    return games.filter(game => {
      // Filter by age group
      if (!game.ageGroups.includes(currentTier.id)) return false
      
      // Prioritize games that match learning style
      if (varkProfile) {
        const hasMatchingMode = game.supportedModes.some(mode => {
          if (varkProfile[mode] > 0.3) return true
          return false
        })
        return hasMatchingMode
      }
      
      return true
    }).sort((a, b) => {
      // Sort by learning style compatibility
      if (!varkProfile) return 0
      
      const aScore = a.supportedModes.reduce((sum, mode) => sum + (varkProfile[mode] || 0), 0)
      const bScore = b.supportedModes.reduce((sum, mode) => sum + (varkProfile[mode] || 0), 0)
      
      return bScore - aScore
    })
  }

  const renderAgeSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome to Capital!</h2>
        <p className="text-lg text-muted-foreground">Choose your learning level to get started</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {ageSystem.current.getAllTiers().map((tier) => (
          <Card 
            key={tier.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => handleAgeSelect(tier.id === 'elementary' ? 8 : tier.id === 'middle' ? 13 : 18)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary to-accent text-white rounded-full w-16 h-16 flex items-center justify-center">
                {tier.id === 'elementary' && <Users className="w-8 h-8" />}
                {tier.id === 'middle' && <GraduationCap className="w-8 h-8" />}
                {tier.id === 'adult' && <Briefcase className="w-8 h-8" />}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <CardDescription className="text-base">{tier.ageRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground mb-4">
                {tier.description}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold">Key Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {tier.contentAdaptations.financialConcepts.slice(0, 3).map((concept, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                  {tier.contentAdaptations.financialConcepts.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tier.contentAdaptations.financialConcepts.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderVarkAssessment = () => {
    const questions = varkSystem.current.getQuestions()
    const currentQuestion = questions[varkAssessmentStep]
    
    if (!currentQuestion) return null

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Learning Style Assessment</h2>
          <p className="text-muted-foreground">
            Help us customize your experience - Question {varkAssessmentStep + 1} of {questions.length}
          </p>
          <Progress value={(varkAssessmentStep / questions.length) * 100} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left justify-start h-auto p-4"
                onClick={() => handleVarkResponse(currentQuestion.id, index)}
              >
                <div className="flex items-center gap-3">
                  {option.style === 'visual' && <Eye className="w-5 h-5 text-blue-500" />}
                  {option.style === 'aural' && <SpeakerHigh className="w-5 h-5 text-green-500" />}
                  {option.style === 'readWrite' && <FileText className="w-5 h-5 text-purple-500" />}
                  {option.style === 'kinesthetic' && <Hand className="w-5 h-5 text-orange-500" />}
                  <span>{option.text}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGameHub = () => {
    const filteredGames = getFilteredGames()
    const varkProfile = varkSystem.current.getProfile()
    const currentTier = ageSystem.current.getCurrentTier()

    return (
      <div className="space-y-6">
        {/* Header with personalization info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {currentTier?.id === 'elementary' && <Users className="w-5 h-5" />}
                {currentTier?.id === 'middle' && <GraduationCap className="w-5 h-5" />}
                {currentTier?.id === 'adult' && <Briefcase className="w-5 h-5" />}
                <div>
                  <p className="font-semibold">Learning Level</p>
                  <p className="text-sm text-muted-foreground">{currentTier?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {varkProfile && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {varkProfile.dominant === 'visual' && <Eye className="w-5 h-5 text-blue-500" />}
                  {varkProfile.dominant === 'aural' && <SpeakerHigh className="w-5 h-5 text-green-500" />}
                  {varkProfile.dominant === 'readWrite' && <FileText className="w-5 h-5 text-purple-500" />}
                  {varkProfile.dominant === 'kinesthetic' && <Hand className="w-5 h-5 text-orange-500" />}
                  {varkProfile.dominant === 'multimodal' && <Brain className="w-5 h-5 text-indigo-500" />}
                  <div>
                    <p className="font-semibold">Learning Style</p>
                    <p className="text-sm text-muted-foreground capitalize">{varkProfile.dominant}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gear className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Enhanced Features</p>
                  <div className="flex gap-2 mt-1">
                    {motionEnabled && <Badge className="bg-blue-100 text-blue-800 text-xs">Motion</Badge>}
                    {bciEnabled && <Badge className="bg-purple-100 text-purple-800 text-xs">BCI</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cognitive State Display */}
        {cognitiveState && bciEnabled && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">Brain State</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Focus</p>
                    <div className="flex items-center gap-1">
                      <Progress value={cognitiveState.focus * 100} className="w-12 h-2" />
                      <span className="text-xs font-semibold">{Math.round(cognitiveState.focus * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Flow</p>
                    <div className="flex items-center gap-1">
                      <Progress value={cognitiveState.flow * 100} className="w-12 h-2" />
                      <span className="text-xs font-semibold">{Math.round(cognitiveState.flow * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Calm</p>
                    <div className="flex items-center gap-1">
                      <Progress value={cognitiveState.relaxation * 100} className="w-12 h-2" />
                      <span className="text-xs font-semibold">{Math.round(cognitiveState.relaxation * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Games Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredGames.map((game) => (
            <Card 
              key={game.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedGame(game)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary to-accent text-white rounded-lg">
                      {game.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{game.title}</CardTitle>
                      <CardDescription>{game.category}</CardDescription>
                    </div>
                  </div>
                  {varkProfile && game.supportedModes.some(mode => varkProfile[mode] > 0.4) && (
                    <Badge className="bg-green-100 text-green-800">
                      <Star className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{game.estimatedTime} min</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {game.motionEnabled && motionEnabled && (
                      <Badge variant="outline" className="text-xs">Motion</Badge>
                    )}
                    {game.bciEnabled && bciEnabled && (
                      <Badge variant="outline" className="text-xs">BCI</Badge>
                    )}
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGameComplete = (score: number, timeSpent: number, additionalData?: any) => {
    if (selectedGame) {
      // Update VARK system with performance data
      const varkProfile = varkSystem.current.getProfile()
      if (varkProfile && additionalData) {
        // Simple heuristic: if they used motion controls and did well, boost kinesthetic
        if (additionalData.usedMotionControls && score > 500) {
          varkSystem.current.updateFromPerformance('kinesthetic', 0.8)
        }
        // If they used BCI and maintained focus, boost their dominant style
        if (additionalData.usedBCI && additionalData.focusBonus > 1 && varkProfile.dominant !== 'multimodal') {
          varkSystem.current.updateFromPerformance(varkProfile.dominant as 'visual' | 'aural' | 'readWrite' | 'kinesthetic', 0.9)
        }
      }

      onGameComplete(selectedGame.id, score, timeSpent, {
        ...additionalData,
        learningStyle: varkProfile?.dominant,
        ageGroup: ageSystem.current.getCurrentTier()?.id
      })
      
      setSelectedGame(null)
      setCurrentView('gameHub')
    }
  }

  if (currentView === 'playing' && selectedGame) {
    const GameComponent = selectedGame.component
    return (
      <Dialog open={true} onOpenChange={() => setCurrentView('gameHub')}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedGame.icon}
              {selectedGame.title}
            </DialogTitle>
          </DialogHeader>
          <GameComponent
            onComplete={handleGameComplete}
            onExit={() => {
              setSelectedGame(null)
              setCurrentView('gameHub')
            }}
            difficulty="medium"
            {...(selectedGame.id === 'retro-lemonade' ? {} : { income: 5000 })}
          />
        </DialogContent>
      </Dialog>
    )
  }

  if (selectedGame && currentView === 'gameHub') {
    setCurrentView('playing')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        {currentView === 'ageSelect' && renderAgeSelection()}
        {currentView === 'varkAssessment' && renderVarkAssessment()}
        {currentView === 'gameHub' && renderGameHub()}
      </div>
    </div>
  )
}