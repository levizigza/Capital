import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Check, Sparkle, ArrowsClockwise } from '@phosphor-icons/react'
import { Confetti } from '@/components/Confetti'
import { ScoreRing } from '@/components/ScoreRing'
import {
  ARCHETYPE_QUESTIONS,
  ARCHETYPES,
  calculateArchetypeScores,
  getDominantArchetype,
  getSecondaryArchetype,
  type ArchetypeId
} from '@/data/archetype-questions'

interface ArchetypeQuizProps {
  onComplete: (primaryArchetype: ArchetypeId, secondaryArchetype: ArchetypeId | null) => void
  onSkip?: () => void
}

export default function ArchetypeQuiz({ onComplete, onSkip }: ArchetypeQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const progress = ((currentQuestion + 1) / ARCHETYPE_QUESTIONS.length) * 100

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showResults) return
      
      if (e.key === 'Enter' || e.key === ' ') {
        if (selectedAnswer !== null && !isTransitioning) {
          e.preventDefault()
          handleNext()
        }
      } else if (e.key === 'ArrowLeft' && !isTransitioning) {
        e.preventDefault()
        handleBack()
      } else if (e.key === 'ArrowRight' && selectedAnswer !== null && !isTransitioning) {
        e.preventDefault()
        handleNext()
      } else if (e.key >= '1' && e.key <= '4') {
        const answerIndex = parseInt(e.key) - 1
        const question = ARCHETYPE_QUESTIONS[currentQuestion]
        if (answerIndex < question.answers.length) {
          e.preventDefault()
          handleAnswerSelect(answerIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentQuestion, selectedAnswer, isTransitioning, showResults])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    const newAnswers = { ...answers }
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (isTransitioning) return
    if (selectedAnswer === null) return

    setIsTransitioning(true)
    
    if (currentQuestion < ARCHETYPE_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer((prevAnswers) => {
          const nextQuestion = currentQuestion + 1
          return answers[nextQuestion] ?? null
        })
        setIsTransitioning(false)
      }, 200)
    } else {
      setTimeout(() => {
        setShowResults(true)
        setIsTransitioning(false)
      }, 200)
    }
  }

  const handleBack = () => {
    if (isTransitioning) return
    if (currentQuestion === 0) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentQuestion((prev) => prev - 1)
      setSelectedAnswer((prevAnswers) => {
        const prevQuestion = currentQuestion - 1
        return answers[prevQuestion] ?? null
      })
      setIsTransitioning(false)
    }, 200)
  }

  const handleComplete = () => {
    const answersArray: number[][] = Array(ARCHETYPE_QUESTIONS.length).fill([]).map((_, idx) => 
      answers[idx] !== undefined ? [answers[idx]] : []
    )
    
    const scores = calculateArchetypeScores(answersArray)
    const primaryArchetype = getDominantArchetype(scores)
    const secondaryArchetype = getSecondaryArchetype(scores, primaryArchetype)
    onComplete(primaryArchetype, secondaryArchetype)
  }

  const handleRestartQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setSelectedAnswer(null)
    setShowResults(false)
    setIsTransitioning(false)
  }

  if (showResults) {
    const answersArray: number[][] = Array(ARCHETYPE_QUESTIONS.length).fill([]).map((_, idx) => 
      answers[idx] !== undefined ? [answers[idx]] : []
    )
    const scores = calculateArchetypeScores(answersArray)
    const primaryArchetype = getDominantArchetype(scores)
    const secondaryArchetype = getSecondaryArchetype(scores, primaryArchetype)
    const primaryData = ARCHETYPES[primaryArchetype]
    const secondaryData = secondaryArchetype ? ARCHETYPES[secondaryArchetype] : null

    return (
      <>
        <Confetti trigger={showResults} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full"
        >
          <Card className="border-2 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full text-6xl"
                  style={{ backgroundColor: primaryData.color.primary + '20' }}>
                  {primaryData.icon}
                </div>
                
                <ScoreRing 
                  score={Math.round((scores[primaryArchetype] / ARCHETYPE_QUESTIONS.length) * 100)}
                  maxScore={100}
                  size={100}
                  strokeWidth={8}
                  color={primaryData.color.primary}
                  delay={0.4}
                />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <CardTitle className="text-4xl font-bold mb-2">
                  You are {primaryData.name}!
                </CardTitle>
                <CardDescription className="text-xl">{primaryData.tagline}</CardDescription>
              </motion.div>
              {secondaryData && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Badge variant="outline" className="text-base px-4 py-1">
                    Secondary: {secondaryData.name} {secondaryData.icon}
                  </Badge>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <blockquote className="text-center text-xl font-medium italic border-l-4 pl-4 py-2"
                  style={{ borderColor: primaryData.color.primary }}>
                  "{primaryData.motto}"
                </blockquote>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-semibold">About You</h3>
                <p className="text-muted-foreground">{primaryData.description}</p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkle weight="fill" className="text-yellow-500" />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {primaryData.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check weight="bold" className="mt-0.5 text-green-600 flex-shrink-0" size={16} />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Growth Zones</h3>
                  <ul className="space-y-2">
                    {primaryData.growthZones.map((zone, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 flex-shrink-0">→</span>
                        <span>{zone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold">Perfect For You</h3>
                <div className="flex flex-wrap gap-2">
                  {primaryData.preferredLearning.slice(0, 5).map((learning, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {learning}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-8">
              <Button
                size="lg"
                className="w-full px-8 text-lg"
                onClick={handleComplete}
                style={{ backgroundColor: primaryData.color.primary }}
                aria-label="Begin your financial learning journey"
              >
                Begin Your Journey
                <ArrowRight className="ml-2" weight="bold" aria-hidden="true" />
              </Button>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleRestartQuiz}
                  aria-label="Restart the archetype quiz"
                >
                  <ArrowsClockwise className="mr-2" size={16} aria-hidden="true" />
                  Restart Quiz
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={onSkip}
                  aria-label="Return to home screen"
                >
                  Return Home
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      </>
    )
  }

  const question = ARCHETYPE_QUESTIONS[currentQuestion]
  const isAnswered = selectedAnswer !== null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Discover Your Financial Archetype</h1>
          <p className="text-lg text-gray-600">
            Answer 10 questions to personalize your learning journey
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">Question {currentQuestion + 1} of {ARCHETYPE_QUESTIONS.length}</span>
            <span className="font-semibold">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2.5" aria-label={`Quiz progress: ${Math.round(progress)}% complete`} />
          
          <div className="flex justify-center gap-1.5 pt-2" role="navigation" aria-label="Question progress">
            {ARCHETYPE_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentQuestion
                    ? 'w-8 bg-purple-600'
                    : idx < currentQuestion
                    ? 'w-2 bg-purple-400'
                    : 'w-2 bg-gray-200'
                }`}
                aria-label={`Question ${idx + 1}${idx === currentQuestion ? ' (current)' : idx < currentQuestion ? ' (completed)' : ''}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardDescription className="text-sm font-medium text-purple-600">
                  {question.situation}
                </CardDescription>
                <CardTitle className="text-2xl leading-tight">{question.question}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {question.answers.map((answer, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleAnswerSelect(index)
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ${
                      selectedAnswer === index
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-pressed={selectedAnswer === index}
                    aria-label={`Answer option ${index + 1}: ${answer.text}`}
                    role="radio"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                          selectedAnswer === index
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        {selectedAnswer === index && (
                          <Check weight="bold" className="text-white" size={14} />
                        )}
                      </div>
                      <span className="flex-1 text-gray-900">{answer.text}</span>
                    </div>
                  </motion.button>
                ))}
              </CardContent>

              <CardFooter className="flex justify-between pt-6">
                <div className="flex gap-2">
                  {currentQuestion === 0 && onSkip && (
                    <Button
                      variant="outline"
                      onClick={onSkip}
                      aria-label="Skip quiz and continue"
                    >
                      <ArrowLeft className="mr-2" weight="bold" aria-hidden="true" />
                      Skip Quiz
                    </Button>
                  )}
                  {currentQuestion > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={isTransitioning}
                      aria-label="Go to previous question"
                    >
                      <ArrowLeft className="mr-2" weight="bold" aria-hidden="true" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleNext} 
                    disabled={!isAnswered || isTransitioning}
                    aria-label={currentQuestion < ARCHETYPE_QUESTIONS.length - 1 ? "Go to next question" : "See quiz results"}
                  >
                    {currentQuestion < ARCHETYPE_QUESTIONS.length - 1 ? (
                      <>
                        Next
                        <ArrowRight className="ml-2" weight="bold" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        See Results
                        <Sparkle className="ml-2" weight="fill" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
