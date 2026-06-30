import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Heart, Coins, ShieldCheck, Star } from '@phosphor-icons/react'

// --- Types ---

interface MazeCell {
  type: 'empty' | 'start' | 'exit' | 'coin' | 'bill' | 'shop' | 'chest' | 'wall' | 'trap' | 'quiz'
  emoji?: string
  value?: number
  label?: string
  quizId?: number
  collected?: boolean
}

interface QuizQuestion {
  id: number
  question: string
  answers: string[]
  correct: number
  explanation: string
  reward: number
}

interface PlayerState {
  row: number
  col: number
  budget: number
  score: number
  moves: number
  health: number
  answeredQuizzes: number[]
  itemsCollected: string[]
}

// --- Constants ---

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 1, question: 'What does "paying yourself first" mean?', answers: ['Buying yourself a treat', 'Saving before spending', 'Paying your bills early', 'Getting a raise'], correct: 1, explanation: 'It means putting money into savings before paying for other things!', reward: 50 },
  { id: 2, question: 'What is compound interest?', answers: ['Interest on interest', 'A type of bank fee', 'A government tax', 'A savings account name'], correct: 0, explanation: 'Compound interest is when you earn interest on your interest — your money grows faster over time!', reward: 60 },
  { id: 3, question: 'Which is usually the BEST way to build wealth over time?', answers: ['Lottery tickets', 'Keeping cash under your mattress', 'Investing regularly', 'Spending less on everything'], correct: 2, explanation: 'Consistent investing over time harnesses the power of compound growth!', reward: 50 },
  { id: 4, question: 'What is a budget?', answers: ['A limit on fun', 'A plan for your money', 'A type of bank account', 'A credit score'], correct: 1, explanation: 'A budget is simply a plan that helps you decide how to spend and save your money!', reward: 40 },
  { id: 5, question: 'What\'s the "50/30/20" rule?', answers: ['50% save, 30% invest, 20% spend', '50% needs, 30% wants, 20% savings', '50% rent, 30% food, 20% fun', '50% work, 30% play, 20% sleep'], correct: 1, explanation: 'The 50/30/20 rule suggests 50% for needs, 30% for wants, and 20% for savings!', reward: 60 },
  { id: 6, question: 'What is an emergency fund?', answers: ['Money for vacations', 'Savings for unexpected expenses', 'A government program', 'A type of insurance'], correct: 1, explanation: 'An emergency fund is 3-6 months of expenses saved for unexpected situations!', reward: 50 },
  { id: 7, question: 'Why is diversification important in investing?', answers: ['It sounds impressive', 'It reduces risk', 'It guarantees profits', 'It avoids taxes'], correct: 1, explanation: 'Diversification spreads your investments so one bad pick doesn\'t ruin everything!', reward: 70 },
  { id: 8, question: 'What does APR stand for?', answers: ['Annual Percentage Rate', 'Applied Payment Ratio', 'Average Price Return', 'Automatic Payment Request'], correct: 0, explanation: 'APR is the Annual Percentage Rate — it tells you the true cost of borrowing money.', reward: 50 },
]

// Maze layouts (7x9 grid) — 0=empty, 1=wall, 2=coin, 3=bill, 4=shop, 5=chest, 6=trap, 7=quiz, 8=start, 9=exit
const MAZE_LAYOUTS = [
  // Level 1 - Easy
  [
    [8,0,2,1,0,2,0,0,0],
    [0,1,0,1,0,1,0,1,2],
    [0,0,0,0,0,0,7,1,0],
    [1,0,1,1,1,0,1,0,0],
    [2,0,0,2,0,0,0,0,1],
    [0,1,0,1,0,1,7,0,0],
    [0,0,2,0,0,0,0,0,9],
  ],
  // Level 2 - Medium
  [
    [8,0,1,2,0,5,1,0,0],
    [0,1,0,1,0,0,0,1,2],
    [0,0,7,0,1,6,0,0,0],
    [1,0,1,0,0,1,1,0,1],
    [2,0,0,3,0,0,2,0,0],
    [0,1,6,1,1,0,1,7,0],
    [0,0,0,4,0,0,0,0,9],
  ],
  // Level 3 - Hard
  [
    [8,0,6,1,5,0,1,2,0],
    [0,1,0,0,0,1,0,1,0],
    [7,0,1,3,0,6,0,0,2],
    [1,0,0,1,0,1,7,1,0],
    [0,6,0,0,0,0,0,0,1],
    [0,1,1,4,1,3,1,0,6],
    [2,0,0,0,0,0,0,7,9],
  ],
]

function buildMaze(layout: number[][]): MazeCell[][] {
  let quizIdx = 0
  return layout.map(row => row.map(cell => {
    switch (cell) {
      case 1: return { type: 'wall' }
      case 2: return { type: 'coin', emoji: '🪙', value: 25, label: '+$25' }
      case 3: return { type: 'bill', emoji: '📄', value: -30, label: 'Bill -$30' }
      case 4: return { type: 'shop', emoji: '🏪', value: -50, label: 'Shop -$50 (+1❤️)' }
      case 5: return { type: 'chest', emoji: '💎', value: 75, label: 'Treasure +$75' }
      case 6: return { type: 'trap', emoji: '⚠️', value: -20, label: 'Trap -$20' }
      case 7: {
        const q = QUIZ_QUESTIONS[quizIdx % QUIZ_QUESTIONS.length]
        quizIdx++
        return { type: 'quiz', emoji: '❓', quizId: q.id, label: 'Quiz Challenge' }
      }
      case 8: return { type: 'start', emoji: '🏁' }
      case 9: return { type: 'exit', emoji: '🚪', label: 'Exit' }
      default: return { type: 'empty' }
    }
  }))
}

// --- Component ---

interface BudgetMazeGameProps {
  onExit: () => void
}

export default function BudgetMazeGame({ onExit }: BudgetMazeGameProps) {
  const [level, setLevel] = useState(0)
  const [maze, setMaze] = useState<MazeCell[][]>(() => buildMaze(MAZE_LAYOUTS[0]))
  const [player, setPlayer] = useState<PlayerState>({ row: 0, col: 0, budget: 200, score: 0, moves: 0, health: 3, answeredQuizzes: [], itemsCollected: [] })
  const [phase, setPhase] = useState<'playing' | 'quiz' | 'result' | 'levelcomplete' | 'gameover'>('playing')
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null)
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null)
  const [flashMsg, setFlashMsg] = useState<string | null>(null)

  const totalLevels = MAZE_LAYOUTS.length
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Auto-focus game container for keyboard controls
  useEffect(() => {
    if (phase === 'playing' && gameContainerRef.current) {
      gameContainerRef.current.focus()
    }
  }, [phase])

  // Reset level
  const resetLevel = useCallback((lvl: number) => {
    const newMaze = buildMaze(MAZE_LAYOUTS[lvl])
    setMaze(newMaze)
    let sr = 0, sc = 0
    for (let r = 0; r < newMaze.length; r++) {
      for (let c = 0; c < newMaze[r].length; c++) {
        if (newMaze[r][c].type === 'start') { sr = r; sc = c }
      }
    }
    setPlayer(prev => ({ ...prev, row: sr, col: sc, moves: 0 }))
    setPhase('playing')
  }, [])

  // Flash helper
  const flash = (msg: string) => {
    setFlashMsg(msg)
    setTimeout(() => setFlashMsg(null), 1200)
  }

  // Move player
  const move = useCallback((dr: number, dc: number) => {
    if (phase !== 'playing') return
    const nr = player.row + dr
    const nc = player.col + dc
    if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze[0].length) return
    const cell = maze[nr][nc]
    if (cell.type === 'wall') return

    const newPlayer = { ...player, row: nr, col: nc, moves: player.moves + 1 }

    // Handle cell effects
    if (cell.type === 'coin' && !cell.collected) {
      newPlayer.budget += cell.value || 0
      newPlayer.score += 25
      newPlayer.itemsCollected = [...newPlayer.itemsCollected, '🪙']
      flash(`+$${cell.value} coins!`)
      setMaze(prev => {
        const copy = prev.map(r => r.map(c => ({ ...c })))
        copy[nr][nc].collected = true
        return copy
      })
    } else if (cell.type === 'chest' && !cell.collected) {
      newPlayer.budget += cell.value || 0
      newPlayer.score += 75
      newPlayer.itemsCollected = [...newPlayer.itemsCollected, '💎']
      flash(`Treasure! +$${cell.value}!`)
      setMaze(prev => {
        const copy = prev.map(r => r.map(c => ({ ...c })))
        copy[nr][nc].collected = true
        return copy
      })
    } else if (cell.type === 'bill') {
      newPlayer.budget += cell.value || 0
      flash(`Bill! $${Math.abs(cell.value || 0)} deducted`)
      setMaze(prev => {
        const copy = prev.map(r => r.map(c => ({ ...c })))
        copy[nr][nc] = { type: 'empty' }
        return copy
      })
    } else if (cell.type === 'trap') {
      newPlayer.budget += cell.value || 0
      newPlayer.health -= 1
      flash(`Trap! Lost $${Math.abs(cell.value || 0)} and 1❤️`)
      setMaze(prev => {
        const copy = prev.map(r => r.map(c => ({ ...c })))
        copy[nr][nc] = { type: 'empty' }
        return copy
      })
    } else if (cell.type === 'shop') {
      if (newPlayer.budget >= Math.abs(cell.value || 0)) {
        newPlayer.budget += cell.value || 0
        newPlayer.health = Math.min(newPlayer.health + 1, 5)
        flash(`Healed! Spent $${Math.abs(cell.value || 0)}, +1❤️`)
      } else {
        flash("Can't afford the shop!")
      }
    } else if (cell.type === 'quiz' && cell.quizId && !newPlayer.answeredQuizzes.includes(cell.quizId)) {
      const q = QUIZ_QUESTIONS.find(q => q.id === cell.quizId)
      if (q) {
        setActiveQuiz(q)
        setPhase('quiz')
      }
    } else if (cell.type === 'exit') {
      newPlayer.score += Math.max(0, newPlayer.budget) + (50 - newPlayer.moves)
      if (level < totalLevels - 1) {
        setPlayer(newPlayer)
        setPhase('levelcomplete')
        return
      } else {
        setPlayer(newPlayer)
        setPhase('gameover')
        return
      }
    }

    // Check game over
    if (newPlayer.health <= 0 || newPlayer.budget <= -100) {
      setPlayer(newPlayer)
      setPhase('gameover')
      return
    }

    setPlayer(newPlayer)
  }, [phase, player, maze, level, totalLevels])

  // Quiz answer
  const handleQuizAnswer = (answerIdx: number) => {
    if (!activeQuiz) return
    const correct = answerIdx === activeQuiz.correct
    if (correct) {
      setPlayer(prev => ({
        ...prev,
        budget: prev.budget + activeQuiz.reward,
        score: prev.score + activeQuiz.reward,
        answeredQuizzes: [...prev.answeredQuizzes, activeQuiz.id],
      }))
    } else {
      setPlayer(prev => ({
        ...prev,
        answeredQuizzes: [...prev.answeredQuizzes, activeQuiz.id],
      }))
    }
    setQuizResult({ correct, explanation: activeQuiz.explanation })
  }

  const dismissQuizResult = () => {
    setQuizResult(null)
    setActiveQuiz(null)
    setPhase('playing')
  }

  const nextLevel = () => {
    const nl = level + 1
    setLevel(nl)
    resetLevel(nl)
  }

  // Keyboard controls
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (phase !== 'playing') return
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': e.preventDefault(); move(-1, 0); break
      case 'ArrowDown': case 's': case 'S': e.preventDefault(); move(1, 0); break
      case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); move(0, -1); break
      case 'ArrowRight': case 'd': case 'D': e.preventDefault(); move(0, 1); break
    }
  }, [phase, move])

  // --- Game Over ---
  if (phase === 'gameover') {
    const won = player.health > 0 && player.budget > -100
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">{won ? '🎉' : '💸'}</div>
          <h2 className="text-3xl font-extrabold mb-2">{won ? 'Budget Master!' : 'Out of Budget!'}</h2>
          <p className="text-gray-600 mb-6">{won ? 'You navigated the maze wisely!' : 'Your budget ran dry. Try again!'}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Final Budget</span><span className="font-bold">${player.budget}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Score</span><span className="font-bold text-lg">{player.score}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Moves</span><span className="font-bold">{player.moves}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Levels Cleared</span><span className="font-bold">{level + (won ? 1 : 0)}/{totalLevels}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Quizzes Answered</span><span className="font-bold">{player.answeredQuizzes.length}</span></div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-green-800 mb-1 flex items-center gap-1"><ShieldCheck size={18} /> Lessons Learned</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>- Every spending decision has a trade-off</li>
              <li>- Planning your route (budget) saves resources</li>
              <li>- Unexpected expenses (traps) are part of life</li>
              <li>- Financial knowledge (quizzes) literally pays off!</li>
            </ul>
          </div>
          <button onClick={onExit} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
            Back to Menu
          </button>
        </motion.div>
      </div>
    )
  }

  // --- Level Complete ---
  if (phase === 'levelcomplete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-3xl font-extrabold mb-2">Level {level + 1} Complete!</h2>
          <p className="text-gray-600 mb-4">Budget: ${player.budget} · Score: {player.score}</p>
          <div className="flex justify-center gap-1 mb-6">
            {player.itemsCollected.slice(-8).map((item, i) => <span key={i} className="text-2xl">{item}</span>)}
          </div>
          <button onClick={nextLevel} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mb-3">
            <Star size={20} weight="fill" /> Next Level →
          </button>
          <button onClick={onExit} className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors text-sm">
            Exit to Menu
          </button>
        </motion.div>
      </div>
    )
  }

  // --- Quiz Phase ---
  if (phase === 'quiz' && activeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {quizResult ? (
            <div className="text-center">
              <div className="text-5xl mb-3">{quizResult.correct ? '✅' : '❌'}</div>
              <h3 className="text-xl font-bold mb-2">{quizResult.correct ? `Correct! +$${activeQuiz.reward}` : 'Not quite!'}</h3>
              <p className="text-gray-600 text-sm mb-4">{quizResult.explanation}</p>
              <button onClick={dismissQuizResult} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Continue</button>
            </div>
          ) : (
            <>
              <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-3">💰 Reward: ${activeQuiz.reward}</div>
              <h3 className="text-lg font-bold mb-4">{activeQuiz.question}</h3>
              <div className="space-y-2">
                {activeQuiz.answers.map((answer, idx) => (
                  <button key={idx} onClick={() => handleQuizAnswer(idx)} className="w-full text-left p-3 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-sm font-medium">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-lg text-xs font-bold mr-2">{idx + 1}</span>
                    {answer}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    )
  }

  // --- Playing Phase ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-black" onKeyDown={handleKeyDown} tabIndex={0} ref={gameContainerRef}>
      {/* Top Bar */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onExit} className="text-white/70 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
            <ArrowLeft size={18} /> Exit
          </button>
          <h1 className="text-white font-bold text-lg">Budget Maze</h1>
          <div className="text-white/70 text-sm">Level <span className="text-white font-bold">{level + 1}</span>/{totalLevels}</div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-black/20 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-white/60 flex items-center gap-1"><Coins size={14} className="text-yellow-400" /> <span className="text-yellow-400 font-bold">${player.budget}</span></span>
            <span className="text-white/60 flex items-center gap-1">
              {Array.from({ length: player.health }).map((_, i) => <Heart key={i} size={14} weight="fill" className="text-red-400" />)}
              {Array.from({ length: Math.max(0, 3 - player.health) }).map((_, i) => <Heart key={i} size={14} className="text-white/20" />)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60">Score: <span className="text-white font-bold">{player.score}</span></span>
            <span className="text-white/60">Moves: <span className="text-white font-bold">{player.moves}</span></span>
          </div>
        </div>
      </div>

      {/* Flash message */}
      <AnimatePresence>
        {flashMsg && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-xl px-5 py-2 font-bold text-sm">
            {flashMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maze Grid */}
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center">
        <div className="bg-black/30 rounded-2xl p-3 sm:p-4 backdrop-blur-sm border border-white/10 inline-block">
          {maze.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((cell, ci) => {
                const isPlayer = ri === player.row && ci === player.col
                const cellSize = 'w-10 h-10 sm:w-12 sm:h-12'
                let bg = 'bg-emerald-800/40'
                let content = ''

                if (cell.type === 'wall') bg = 'bg-stone-700'
                else if (cell.type === 'coin' && !cell.collected) content = '🪙'
                else if (cell.type === 'chest' && !cell.collected) content = '💎'
                else if (cell.type === 'bill') content = '📄'
                else if (cell.type === 'shop') content = '🏪'
                else if (cell.type === 'trap') content = '⚠️'
                else if (cell.type === 'quiz' && cell.quizId && !player.answeredQuizzes.includes(cell.quizId)) content = '❓'
                else if (cell.type === 'exit') { content = '🚪'; bg = 'bg-yellow-900/40' }
                else if (cell.type === 'start') { content = '🏁'; bg = 'bg-green-900/40' }

                return (
                  <div key={ci} className={`${cellSize} flex items-center justify-center text-lg sm:text-xl rounded-md m-0.5 relative transition-colors ${bg} ${isPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
                    {isPlayer ? (
                      <motion.span key={`${ri}-${ci}`} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-xl sm:text-2xl z-10">🧑</motion.span>
                    ) : content ? (
                      <span>{content}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* D-Pad Controls (mobile friendly) */}
        <div className="mt-6 grid grid-cols-3 gap-1 w-36">
          <div />
          <button onClick={() => move(-1, 0)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-3 flex items-center justify-center active:scale-90 transition-all" aria-label="Move up">
            <ArrowUp size={24} weight="bold" />
          </button>
          <div />
          <button onClick={() => move(0, -1)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-3 flex items-center justify-center active:scale-90 transition-all" aria-label="Move left">
            <ArrowLeft size={24} weight="bold" />
          </button>
          <button onClick={() => move(1, 0)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-3 flex items-center justify-center active:scale-90 transition-all" aria-label="Move down">
            <ArrowDown size={24} weight="bold" />
          </button>
          <button onClick={() => move(0, 1)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-3 flex items-center justify-center active:scale-90 transition-all" aria-label="Move right">
            <ArrowRight size={24} weight="bold" />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-white/30 text-xs mt-4 select-none" aria-hidden="true">
          Use <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-mono">WASD</kbd> or <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-mono">Arrow Keys</kbd> to move
        </p>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-white/50">
          <span>🪙 Coin</span><span>💎 Treasure</span><span>📄 Bill</span><span>⚠️ Trap</span><span>🏪 Shop</span><span>❓ Quiz</span><span>🚪 Exit</span>
        </div>
      </div>
    </div>
  )
}
