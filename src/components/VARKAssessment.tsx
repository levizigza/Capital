import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Eye, Headphones, BookOpen, Hand, Brain } from '@phosphor-icons/react'

interface LearningStyle {
  visual: number
  auditory: number
  readWrite: number
  kinesthetic: number
  dominant: 'visual' | 'auditory' | 'read-write' | 'kinesthetic'
}

interface VARKAssessmentProps {
  onComplete: (results: LearningStyle) => void
  onSkip: () => void
}

interface Question {
  id: number
  question: string
  answers: {
    text: string
    type: 'visual' | 'auditory' | 'read-write' | 'kinesthetic'
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    question: "When learning about budgeting, you prefer to:",
    answers: [
      { text: "See charts, graphs, and visual representations of spending", type: "visual" },
      { text: "Listen to explanations and discuss strategies out loud", type: "auditory" },
      { text: "Read detailed guides and take written notes", type: "read-write" },
      { text: "Practice with real money or use hands-on activities", type: "kinesthetic" }
    ]
  },
  {
    id: 2,
    question: "To remember a financial concept, you:",
    answers: [
      { text: "Picture it in your mind or draw diagrams", type: "visual" },
      { text: "Repeat it to yourself or explain it to others", type: "auditory" },
      { text: "Write it down multiple times or create lists", type: "read-write" },
      { text: "Practice applying it in real situations", type: "kinesthetic" }
    ]
  },
  {
    id: 3,
    question: "When making financial decisions, you:",
    answers: [
      { text: "Use spreadsheets, charts, or visual comparisons", type: "visual" },
      { text: "Talk through options with friends or family", type: "auditory" },
      { text: "Research and read articles or reviews", type: "read-write" },
      { text: "Try small experiments or test approaches", type: "kinesthetic" }
    ]
  },
  {
    id: 4,
    question: "In a financial education class, you learn best when:",
    answers: [
      { text: "The teacher uses slides, videos, and visual aids", type: "visual" },
      { text: "There's group discussion and verbal instruction", type: "auditory" },
      { text: "You can read handouts and take detailed notes", type: "read-write" },
      { text: "You participate in simulations and activities", type: "kinesthetic" }
    ]
  },
  {
    id: 5,
    question: "When using a new financial app, you:",
    answers: [
      { text: "Explore the interface and learn by looking around", type: "visual" },
      { text: "Ask someone to explain it or find video tutorials", type: "auditory" },
      { text: "Read the instructions or help documentation", type: "read-write" },
      { text: "Jump in and learn by trying different features", type: "kinesthetic" }
    ]
  },
  {
    id: 6,
    question: "To understand investment risks, you prefer:",
    answers: [
      { text: "Seeing risk/return graphs and visual comparisons", type: "visual" },
      { text: "Hearing explanations from financial advisors", type: "auditory" },
      { text: "Reading detailed risk assessments and reports", type: "read-write" },
      { text: "Starting with small investments to feel the experience", type: "kinesthetic" }
    ]
  },
  {
    id: 7,
    question: "When planning a major purchase, you:",
    answers: [
      { text: "Create visual mood boards or comparison charts", type: "visual" },
      { text: "Discuss pros and cons with others", type: "auditory" },
      { text: "Make detailed written lists and research extensively", type: "read-write" },
      { text: "Visit stores or try products hands-on first", type: "kinesthetic" }
    ]
  }
]

export function VARKAssessment({ onComplete, onSkip }: VARKAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')

  const handleAnswerSelect = (answerType: string) => {
    setSelectedAnswer(answerType)
  }

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }))
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer('')
      } else {
        // Calculate results
        calculateResults()
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || '')
    }
  }

  const calculateResults = () => {
    const scores = {
      visual: 0,
      auditory: 0,
      'read-write': 0,
      kinesthetic: 0
    }

    // Count answers by type
    Object.values(answers).forEach(answerType => {
      if (answerType in scores) {
        scores[answerType as keyof typeof scores]++
      }
    })

    // Convert to percentages
    const total = questions.length
    const percentages = {
      visual: scores.visual / total,
      auditory: scores.auditory / total,
      readWrite: scores['read-write'] / total,
      kinesthetic: scores.kinesthetic / total
    }

    // Find dominant style
    const dominant = Object.entries(percentages).reduce((max, [key, value]) => 
      value > max.value ? { key: key === 'readWrite' ? 'read-write' : key, value } : max
    , { key: 'visual', value: 0 }).key as 'visual' | 'auditory' | 'read-write' | 'kinesthetic'

    const results: LearningStyle = {
      ...percentages,
      dominant
    }

    onComplete(results)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <CardTitle className="text-2xl">Learning Style Assessment</CardTitle>
          </div>
          <p className="text-slate-600 mb-2">
            Discover how you learn best to personalize your financial education experience
          </p>
          <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-lg">
            💡 <strong>Optional:</strong> This quick assessment helps customize games to your learning style, but you can skip it and start playing immediately!
          </p>
          
          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              {question.question}
            </h3>
          </div>

          {/* Answer Options */}
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            <div className="space-y-4">
              {question.answers.map((answer, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={answer.type} 
                    id={`answer-${index}`}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`answer-${index}`}
                    className="flex-1 cursor-pointer text-sm leading-relaxed p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {answer.type === 'visual' && <Eye className="w-4 h-4 text-blue-500" />}
                      {answer.type === 'auditory' && <Headphones className="w-4 h-4 text-green-500" />}
                      {answer.type === 'read-write' && <BookOpen className="w-4 h-4 text-purple-500" />}
                      {answer.type === 'kinesthetic' && <Hand className="w-4 h-4 text-orange-500" />}
                      <span>{answer.text}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onSkip}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                Skip & Play Games Now!
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="min-w-[100px]"
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Learning Style Preview */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-3">Learning Styles:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span><strong>Visual:</strong> Charts, diagrams, colors</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-green-500" />
                <span><strong>Auditory:</strong> Discussions, explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span><strong>Read/Write:</strong> Notes, lists, text</span>
              </div>
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-orange-500" />
                <span><strong>Kinesthetic:</strong> Hands-on, movement</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}