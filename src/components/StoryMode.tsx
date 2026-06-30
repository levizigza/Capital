import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Star, Book, Coins } from '@phosphor-icons/react'

interface StoryChapter {
  id: string
  title: string
  emoji: string
  theme: string
  backgroundGradient: string
  scenes: StoryScene[]
  quiz: QuizQuestion[]
  reward: number
}

interface StoryScene {
  id: string
  narrator?: string
  character?: string
  characterEmoji?: string
  dialogue: string
  image?: string
  animation?: 'fadeIn' | 'slideUp' | 'bounce' | 'shake'
  choices?: {
    text: string
    outcome: string
    correct?: boolean
  }[]
}

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

// Richest Man in Babylon inspired stories adapted for kids
const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'golden-rule',
    title: 'The Golden Rule of Money',
    emoji: '🏆',
    theme: 'saving',
    backgroundGradient: 'from-amber-400 via-yellow-300 to-orange-400',
    scenes: [
      {
        id: '1',
        narrator: 'Once upon a time, in a colorful town called Moneyville...',
        dialogue: 'There lived a young kid named Alex who wanted to buy the coolest skateboard in the world! 🛹',
        animation: 'fadeIn'
      },
      {
        id: '2',
        character: 'Alex',
        characterEmoji: '🧒',
        dialogue: "Grandma, I really want that skateboard, but it costs $50! I only get $5 allowance each week. That'll take FOREVER!",
        animation: 'slideUp'
      },
      {
        id: '3',
        character: 'Grandma Goldie',
        characterEmoji: '👵',
        dialogue: "Ah, my dear! Let me tell you the Golden Rule of Money that my grandmother taught me...",
        animation: 'fadeIn'
      },
      {
        id: '4',
        character: 'Grandma Goldie',
        characterEmoji: '👵',
        dialogue: "PAY YOURSELF FIRST! 💰 Before you spend ANY money, save at least ONE part out of every TEN parts you receive.",
        animation: 'bounce'
      },
      {
        id: '5',
        narrator: 'Alex was confused...',
        dialogue: "What does 'pay yourself first' mean? 🤔",
        animation: 'fadeIn',
        choices: [
          { text: 'Buy yourself a treat first', outcome: 'Not quite! Keep listening to Grandma...', correct: false },
          { text: 'Save some money before spending', outcome: "That's right! Let's hear more!", correct: true },
          { text: 'Pay for your chores', outcome: 'Good guess, but not exactly!', correct: false }
        ]
      },
      {
        id: '6',
        character: 'Grandma Goldie',
        characterEmoji: '👵',
        dialogue: "It means: every time you get $5, save at least 50 cents FIRST, before you even think about spending! Put it in your piggy bank right away! 🐷",
        animation: 'fadeIn'
      },
      {
        id: '7',
        character: 'Alex',
        characterEmoji: '🧒',
        dialogue: "But Grandma, 50 cents is so little! It'll still take forever!",
        animation: 'slideUp'
      },
      {
        id: '8',
        character: 'Grandma Goldie',
        characterEmoji: '👵',
        dialogue: "Ah, but here's the magic! ✨ What if you saved $1 or even $2 from each $5? And what if you found ways to earn MORE?",
        animation: 'bounce'
      },
      {
        id: '9',
        narrator: 'Alex started thinking...',
        dialogue: "If I save $2 from my $5 allowance each week, and I help Mrs. Chen walk her dog for $3 more... I could save $5 a week! That's only 10 weeks! 🎉",
        animation: 'fadeIn'
      },
      {
        id: '10',
        character: 'Alex',
        characterEmoji: '🧒',
        dialogue: "I DID IT, GRANDMA! I saved $50 in just 10 weeks! And you know what? Now I want to keep saving for something even BIGGER! 🌟",
        animation: 'bounce'
      },
      {
        id: '11',
        character: 'Grandma Goldie',
        characterEmoji: '👵',
        dialogue: "That's the real magic of the Golden Rule! Once you start saving, you never want to stop! Your future self will thank you! 💖",
        animation: 'fadeIn'
      }
    ],
    quiz: [
      {
        question: 'What is the Golden Rule of Money?',
        options: ['Spend everything you earn', 'Pay yourself first by saving', 'Only buy gold things', 'Never share money'],
        correctIndex: 1,
        explanation: 'The Golden Rule is to save a portion of your money FIRST, before spending on anything else!'
      },
      {
        question: 'How much should you try to save from every $10 you get?',
        options: ['Nothing', 'At least $1', '$10', '$100'],
        correctIndex: 1,
        explanation: 'Try to save at least 10% (one part out of ten) of everything you earn!'
      }
    ],
    reward: 100
  },
  {
    id: 'money-grows',
    title: 'The Magic Money Tree',
    emoji: '🌳',
    theme: 'compound interest',
    backgroundGradient: 'from-green-400 via-emerald-300 to-teal-400',
    scenes: [
      {
        id: '1',
        narrator: 'In Moneyville, there was a wise old banker named Mr. Compound...',
        dialogue: "He knew a secret that could turn small coins into mountains of gold! 💰",
        animation: 'fadeIn'
      },
      {
        id: '2',
        character: 'Sam',
        characterEmoji: '👧',
        dialogue: "Mr. Compound, my friend says money can grow like a plant. Is that true?",
        animation: 'slideUp'
      },
      {
        id: '3',
        character: 'Mr. Compound',
        characterEmoji: '🧙',
        dialogue: "Indeed it is, young Sam! Let me show you the Magic Money Tree! 🌳",
        animation: 'bounce'
      },
      {
        id: '4',
        narrator: 'Mr. Compound drew a picture...',
        dialogue: "Imagine you plant a $10 seed. Each year, it grows 10% bigger. After one year, you have $11!",
        animation: 'fadeIn'
      },
      {
        id: '5',
        character: 'Sam',
        characterEmoji: '👧',
        dialogue: "Only $1 more? That doesn't seem like much...",
        animation: 'slideUp'
      },
      {
        id: '6',
        character: 'Mr. Compound',
        characterEmoji: '🧙',
        dialogue: "Ah, but here's the MAGIC! ✨ The next year, your $11 grows 10%... that's $1.10 more! Now you have $12.10!",
        animation: 'bounce'
      },
      {
        id: '7',
        narrator: 'Mr. Compound continued...',
        dialogue: "Your money makes money, and THAT money makes MORE money! It's called COMPOUND INTEREST! 🎯",
        animation: 'fadeIn'
      },
      {
        id: '8',
        character: 'Mr. Compound',
        characterEmoji: '🧙',
        dialogue: "After 10 years, your $10 becomes $26! After 30 years? Nearly $175! And after 50 years? Over $1,170! 🤯",
        animation: 'bounce'
      },
      {
        id: '9',
        character: 'Sam',
        characterEmoji: '👧',
        dialogue: "WOW! So the earlier I plant my money seed, the bigger my tree grows?",
        animation: 'slideUp'
      },
      {
        id: '10',
        character: 'Mr. Compound',
        characterEmoji: '🧙',
        dialogue: "Exactly! Time is your superpower! 🦸 The kids who start saving NOW will have the biggest money trees when they grow up!",
        animation: 'bounce'
      }
    ],
    quiz: [
      {
        question: 'What is compound interest?',
        options: ['Interest that is complicated', 'Money that earns money on its earnings', 'A type of bank', 'A math problem'],
        correctIndex: 1,
        explanation: 'Compound interest means your money earns interest, and then that interest earns MORE interest!'
      },
      {
        question: 'Why is starting to save early so important?',
        options: ["It's not important", 'More time = more growth', 'Banks like young people', 'To impress friends'],
        correctIndex: 1,
        explanation: 'The more time your money has to grow, the bigger it becomes thanks to compound interest!'
      }
    ],
    reward: 150
  },
  {
    id: 'wise-spending',
    title: 'The Tale of Two Spenders',
    emoji: '⚖️',
    theme: 'budgeting',
    backgroundGradient: 'from-blue-400 via-indigo-300 to-purple-400',
    scenes: [
      {
        id: '1',
        narrator: 'In Moneyville, two friends each got $20 for their birthday...',
        dialogue: "Let's see what they did with it! 🎂",
        animation: 'fadeIn'
      },
      {
        id: '2',
        character: 'Speedy Spencer',
        characterEmoji: '🏃',
        dialogue: "WOOHOO! $20! I'm gonna buy candy, a toy, some stickers, and... wait, where did my money go?! 😱",
        animation: 'shake'
      },
      {
        id: '3',
        character: 'Wise Wendy',
        characterEmoji: '🧒',
        dialogue: "Hmm, $20! Let me think... I'll save $10, spend $5 on something I really want, and keep $5 for emergencies! 📝",
        animation: 'fadeIn'
      },
      {
        id: '4',
        narrator: 'One week later...',
        dialogue: "A new video game that both friends REALLY wanted went on sale for $15! 🎮",
        animation: 'bounce'
      },
      {
        id: '5',
        character: 'Speedy Spencer',
        characterEmoji: '🏃',
        dialogue: "Oh no! I spent all my money on little things I don't even remember! Now I can't get the game! 😭",
        animation: 'shake'
      },
      {
        id: '6',
        character: 'Wise Wendy',
        characterEmoji: '🧒',
        dialogue: "I have $15 saved! I can buy the game AND still have $5 left! Making a plan really works! 🌟",
        animation: 'bounce'
      },
      {
        id: '7',
        narrator: 'Speedy Spencer learned an important lesson that day...',
        dialogue: "A BUDGET is like a treasure map for your money! It helps you get what you REALLY want! 🗺️",
        animation: 'fadeIn'
      },
      {
        id: '8',
        character: 'Speedy Spencer',
        characterEmoji: '🏃',
        dialogue: "Wendy, will you teach me how to make a budget? I don't want to miss out again!",
        animation: 'slideUp'
      },
      {
        id: '9',
        character: 'Wise Wendy',
        characterEmoji: '🧒',
        dialogue: "Of course! It's easy: SAVE some, SPEND some wisely, and SHARE some! The 3 S's! 💝",
        animation: 'bounce'
      }
    ],
    quiz: [
      {
        question: 'What is a budget?',
        options: ['A type of bird', 'A plan for your money', 'A piggy bank', 'A video game'],
        correctIndex: 1,
        explanation: 'A budget is a plan that helps you decide how to save, spend, and share your money!'
      },
      {
        question: "What are Wendy's 3 S's of money?",
        options: ['Spend, Spend, Spend', 'Save, Spend, Share', 'Sleep, Snack, Study', 'Silly, Smart, Strong'],
        correctIndex: 1,
        explanation: 'Save some, Spend some wisely, and Share some - that\'s the balanced way to handle money!'
      }
    ],
    reward: 125
  },
  {
    id: 'wants-vs-needs',
    title: 'The Wants Monster',
    emoji: '👹',
    theme: 'needs vs wants',
    backgroundGradient: 'from-red-400 via-pink-300 to-rose-400',
    scenes: [
      {
        id: '1',
        narrator: 'Deep in the shopping mall lived a tricky creature...',
        dialogue: "The WANTS MONSTER! 👹 It made everything look SO tempting!",
        animation: 'shake'
      },
      {
        id: '2',
        character: 'Jamie',
        characterEmoji: '🧒',
        dialogue: "Mom, I NEED that toy! And I NEED that candy! And I NEED those shoes! PLEASE!!! 🥺",
        animation: 'bounce'
      },
      {
        id: '3',
        character: 'Mom',
        characterEmoji: '👩',
        dialogue: "Hold on, Jamie. Do you really NEED those things, or do you WANT them? There's a big difference!",
        animation: 'fadeIn'
      },
      {
        id: '4',
        narrator: 'Mom explained...',
        dialogue: "NEEDS are things you must have to live: food, water, clothes, a home, medicine. WANTS are extras that are nice but not necessary! 🤔",
        animation: 'fadeIn'
      },
      {
        id: '5',
        character: 'Jamie',
        characterEmoji: '🧒',
        dialogue: "So... the toy is a WANT, not a NEED?",
        animation: 'slideUp'
      },
      {
        id: '6',
        character: 'Mom',
        characterEmoji: '👩',
        dialogue: "Exactly! Here's a trick: when you want something, wait 24 hours. If you still want it tomorrow, maybe it's worth saving for! ⏰",
        animation: 'bounce'
      },
      {
        id: '7',
        narrator: 'Jamie tried the 24-hour trick...',
        dialogue: "The next day, Jamie realized they didn't even remember half the things they wanted! The Wants Monster had been tricked! 🎉",
        animation: 'fadeIn'
      },
      {
        id: '8',
        character: 'Jamie',
        characterEmoji: '🧒',
        dialogue: "Wow! I only really wanted ONE thing, not five! Now I can save up for just that! Thanks, Mom! 💖",
        animation: 'bounce'
      }
    ],
    quiz: [
      {
        question: 'Which of these is a NEED?',
        options: ['Video game', 'Food', 'Toy car', 'Candy'],
        correctIndex: 1,
        explanation: 'Food is a need because you must eat to live! Toys and candy are wants - nice to have but not necessary.'
      },
      {
        question: 'What is the 24-hour trick?',
        options: ['Buy everything in 24 hours', 'Wait a day before buying wants', 'Sleep for 24 hours', 'Save $24'],
        correctIndex: 1,
        explanation: 'Wait 24 hours before buying something you want. If you still want it the next day, it might be worth it!'
      }
    ],
    reward: 100
  }
]

interface StoryModeProps {
  onComplete: (chapterId: string, reward: number) => void
  onBack: () => void
  completedChapters: string[]
  playerMoney: number
}

export default function StoryMode({ 
  onComplete, 
  onBack, 
  completedChapters,
  playerMoney 
}: StoryModeProps) {
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [showOutcome, setShowOutcome] = useState(false)

  const currentScene = selectedChapter?.scenes[currentSceneIndex]
  const currentQuizQuestion = selectedChapter?.quiz[quizIndex]

  const handleNextScene = () => {
    if (!selectedChapter) return
    
    if (currentSceneIndex < selectedChapter.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1)
      setSelectedChoice(null)
      setShowOutcome(false)
    } else {
      setShowQuiz(true)
    }
  }

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1)
      setSelectedChoice(null)
      setShowOutcome(false)
    }
  }

  const handleChoice = (index: number) => {
    setSelectedChoice(index)
    setShowOutcome(true)
  }

  const handleQuizAnswer = (index: number) => {
    if (!currentQuizQuestion || !selectedChapter) return
    
    if (index === currentQuizQuestion.correctIndex) {
      setQuizScore(prev => prev + 1)
    }
    
    if (quizIndex < selectedChapter.quiz.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      // Chapter complete!
      const reward = Math.round(selectedChapter.reward * (quizScore + 1) / selectedChapter.quiz.length)
      onComplete(selectedChapter.id, reward)
      setSelectedChapter(null)
      setCurrentSceneIndex(0)
      setShowQuiz(false)
      setQuizIndex(0)
      setQuizScore(0)
    }
  }

  // Chapter selection screen
  if (!selectedChapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="retro-btn retro-btn-yellow">
              <ArrowLeft size={20} className="mr-2" /> Back
            </button>
            <div className="retro-money-display">
              <span className="retro-money-icon">💰</span>
              <span>${playerMoney.toLocaleString()}</span>
            </div>
          </div>
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Book size={40} /> Story Mode
            </h1>
            <p className="text-purple-200">Learn money wisdom through magical tales!</p>
          </motion.div>
        </div>

        {/* Chapter Grid */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {STORY_CHAPTERS.map((chapter, index) => {
            const isCompleted = completedChapters.includes(chapter.id)
            const isLocked = index > 0 && !completedChapters.includes(STORY_CHAPTERS[index - 1].id)
            
            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`retro-card overflow-hidden ${isLocked ? 'opacity-60' : ''}`}
              >
                <div className={`h-32 bg-gradient-to-r ${chapter.backgroundGradient} flex items-center justify-center relative`}>
                  <span className="text-6xl">{chapter.emoji}</span>
                  {isCompleted && (
                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-2">
                      <Star size={24} weight="fill" className="text-yellow-700" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{chapter.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">Theme: {chapter.theme}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600 flex items-center gap-1">
                      <Coins size={16} /> +{chapter.reward} coins
                    </span>
                    <button
                      onClick={() => !isLocked && setSelectedChapter(chapter)}
                      disabled={isLocked}
                      className={`retro-btn ${isLocked ? 'retro-btn-yellow opacity-50' : 'retro-btn-green'} text-sm py-2`}
                    >
                      {isCompleted ? 'Replay' : isLocked ? 'Locked' : 'Read'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Quiz screen
  if (showQuiz && currentQuizQuestion) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${selectedChapter.backgroundGradient} p-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-start mb-4">
            <button
              onClick={() => {
                setSelectedChapter(null)
                setCurrentSceneIndex(0)
                setShowQuiz(false)
                setQuizIndex(0)
                setQuizScore(0)
              }}
              className="retro-btn retro-btn-yellow"
            >
              <ArrowLeft size={20} className="mr-2" /> Exit Quiz
            </button>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="retro-card"
          >
            <div className="retro-card-header">
              📝 Quiz Time! Question {quizIndex + 1} of {selectedChapter.quiz.length}
            </div>
            <div className="retro-card-body">
              <h2 className="text-xl font-bold mb-6">{currentQuizQuestion.question}</h2>
              
              <div className="space-y-3">
                {currentQuizQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuizAnswer(index)}
                    className="w-full p-4 text-left rounded-xl border-3 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                Score: {quizScore} / {quizIndex}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Story scene screen
  return (
    <div className={`min-h-screen bg-gradient-to-br ${selectedChapter.backgroundGradient} p-4`}>
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="retro-progress">
            <div 
              className="retro-progress-fill"
              ref={(el) => { if (el) el.style.setProperty('--progress', `${((currentSceneIndex + 1) / selectedChapter.scenes.length) * 100}%`) }}
            />
          </div>
          <div className="text-center text-white text-sm mt-2">
            {selectedChapter.title} - Scene {currentSceneIndex + 1} of {selectedChapter.scenes.length}
          </div>
        </div>

        {/* Scene card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneIndex}
            initial={{ 
              opacity: 0, 
              x: currentScene?.animation === 'slideUp' ? 0 : 50,
              y: currentScene?.animation === 'slideUp' ? 50 : 0,
              scale: currentScene?.animation === 'bounce' ? 0.8 : 1
            }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="retro-card"
          >
            <div className="retro-card-body">
              {/* Narrator text */}
              {currentScene?.narrator && (
                <div className="text-center text-gray-500 italic mb-4">
                  {currentScene.narrator}
                </div>
              )}
              
              {/* Character dialogue */}
              {currentScene?.character && (
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{currentScene.characterEmoji}</div>
                  <div>
                    <div className="font-bold text-purple-600 mb-1">{currentScene.character}</div>
                    <div className="retro-speech-bubble">
                      {currentScene.dialogue}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Non-character dialogue */}
              {!currentScene?.character && currentScene?.dialogue && (
                <div className="text-center text-xl font-medium p-6 bg-white/50 rounded-xl">
                  {currentScene.dialogue}
                </div>
              )}
              
              {/* Choices */}
              {currentScene?.choices && !showOutcome && (
                <div className="mt-6 space-y-3">
                  <div className="text-center font-bold text-purple-600 mb-2">What do you think? 🤔</div>
                  {currentScene.choices.map((choice, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(index)}
                      className="w-full p-4 text-left rounded-xl border-3 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      {choice.text}
                    </motion.button>
                  ))}
                </div>
              )}
              
              {/* Choice outcome */}
              {showOutcome && currentScene?.choices && selectedChoice !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-xl ${
                    currentScene.choices[selectedChoice].correct 
                      ? 'bg-green-100 border-3 border-green-400' 
                      : 'bg-yellow-100 border-3 border-yellow-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {currentScene.choices[selectedChoice].correct ? (
                      <>
                        <span className="text-2xl">✅</span>
                        <span className="font-bold text-green-700">Correct!</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">💡</span>
                        <span className="font-bold text-yellow-700">Good try!</span>
                      </>
                    )}
                  </div>
                  <p>{currentScene.choices[selectedChoice].outcome}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevScene}
            disabled={currentSceneIndex === 0}
            className="retro-btn retro-btn-yellow disabled:opacity-50"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          
          <button
            onClick={() => {
              setSelectedChapter(null)
              setCurrentSceneIndex(0)
            }}
            className="retro-btn retro-btn-red"
          >
            Exit Story
          </button>
          
          <button
            onClick={handleNextScene}
            disabled={currentScene?.choices && !showOutcome}
            className="retro-btn retro-btn-green disabled:opacity-50"
          >
            {currentSceneIndex === selectedChapter.scenes.length - 1 ? 'Take Quiz' : 'Next'} <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
