import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Play, Coins, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MoneyMazeProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

type CellType = 'empty' | 'wall' | 'coin' | 'gem' | 'trap' | 'goal' | 'player' | 'key' | 'door'

interface Position {
  x: number
  y: number
}

// Generate a maze with collectibles
const generateMaze = (level: number): { maze: CellType[][]; start: Position; goal: Position } => {
  const size = Math.min(8 + level, 12)
  const maze: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('empty'))
  
  // Add walls (more walls at higher levels)
  const wallCount = Math.floor(size * size * (0.15 + level * 0.02))
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * size)
    const y = Math.floor(Math.random() * size)
    if (x !== 0 || y !== 0) { // Don't block start
      maze[y][x] = 'wall'
    }
  }
  
  // Add coins
  const coinCount = 5 + level * 2
  for (let i = 0; i < coinCount; i++) {
    let x, y
    do {
      x = Math.floor(Math.random() * size)
      y = Math.floor(Math.random() * size)
    } while (maze[y][x] !== 'empty' || (x === 0 && y === 0))
    maze[y][x] = 'coin'
  }
  
  // Add gems (worth more)
  const gemCount = Math.floor(level / 2) + 1
  for (let i = 0; i < gemCount; i++) {
    let x, y
    do {
      x = Math.floor(Math.random() * size)
      y = Math.floor(Math.random() * size)
    } while (maze[y][x] !== 'empty' || (x === 0 && y === 0))
    maze[y][x] = 'gem'
  }
  
  // Add traps at higher levels
  if (level > 2) {
    const trapCount = Math.floor(level / 2)
    for (let i = 0; i < trapCount; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * size)
        y = Math.floor(Math.random() * size)
      } while (maze[y][x] !== 'empty' || (x === 0 && y === 0))
      maze[y][x] = 'trap'
    }
  }
  
  // Set goal
  const goalX = size - 1
  const goalY = size - 1
  maze[goalY][goalX] = 'goal'
  
  return { maze, start: { x: 0, y: 0 }, goal: { x: goalX, y: goalY } }
}

export function MoneyMaze({ onComplete, onExit, userTier = 'middle' }: MoneyMazeProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'levelComplete' | 'gameOver'>('ready')
  const [level, setLevel] = useState(1)
  const [maze, setMaze] = useState<CellType[][]>([])
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [coinsCollected, setCoinsCollected] = useState(0)
  const [gemsCollected, setGemsCollected] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [totalCoins, setTotalCoins] = useState(0)

  const initLevel = useCallback((lvl: number) => {
    const { maze: newMaze, start } = generateMaze(lvl)
    setMaze(newMaze)
    setPlayerPos(start)
    setTimeLeft(60 + lvl * 10)
    
    // Count total coins
    let coins = 0
    newMaze.forEach(row => row.forEach(cell => {
      if (cell === 'coin') coins++
    }))
    setTotalCoins(coins)
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('gameOver')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameState])

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return

    const newX = playerPos.x + dx
    const newY = playerPos.y + dy

    // Check bounds
    if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) return
    
    // Check wall
    if (maze[newY][newX] === 'wall') return

    const cell = maze[newY][newX]
    
    // Handle cell interactions
    if (cell === 'coin') {
      setScore(prev => prev + 10)
      setCoinsCollected(prev => prev + 1)
      toast.success('+10 coins!')
    } else if (cell === 'gem') {
      setScore(prev => prev + 50)
      setGemsCollected(prev => prev + 1)
      toast.success('+50 gems! 💎')
    } else if (cell === 'trap') {
      setScore(prev => Math.max(0, prev - 20))
      setTimeLeft(prev => Math.max(0, prev - 5))
      toast.error('Trap! -20 coins, -5 seconds!')
    } else if (cell === 'goal') {
      // Level complete
      const bonus = Math.floor(timeLeft * 2) + (coinsCollected >= totalCoins ? 100 : 0)
      setScore(prev => prev + bonus)
      toast.success(`Level ${level} Complete! +${bonus} bonus!`)
      setGameState('levelComplete')
      return
    }

    // Clear the cell and move player
    const newMaze = [...maze.map(row => [...row])]
    newMaze[newY][newX] = 'empty'
    setMaze(newMaze)
    setPlayerPos({ x: newX, y: newY })
    setMoves(prev => prev + 1)
  }, [gameState, playerPos, maze, level, coinsCollected, totalCoins, timeLeft])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          movePlayer(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          movePlayer(0, 1)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePlayer(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePlayer(1, 0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, movePlayer])

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setCoinsCollected(0)
    setGemsCollected(0)
    setMoves(0)
    initLevel(1)
    setGameState('playing')
  }

  const nextLevel = () => {
    const newLevel = level + 1
    setLevel(newLevel)
    setCoinsCollected(0)
    initLevel(newLevel)
    setGameState('playing')
  }

  const finishGame = () => {
    onComplete(score, {
      levelsCompleted: level,
      coinsCollected,
      gemsCollected,
      totalMoves: moves
    })
  }

  const getCellEmoji = (cell: CellType, x: number, y: number) => {
    if (x === playerPos.x && y === playerPos.y) return '🏃'
    switch (cell) {
      case 'wall': return '🧱'
      case 'coin': return '🪙'
      case 'gem': return '💎'
      case 'trap': return '⚠️'
      case 'goal': return '🏆'
      default: return ''
    }
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl mb-4"
            >
              🗺️
            </motion.div>
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Money Maze</h2>
            <p className="text-gray-600 mb-6">
              Navigate through the maze collecting coins and gems! Avoid traps and reach the goal before time runs out!
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-amber-100 p-3 rounded-lg">
                <div className="text-2xl mb-1">🪙</div>
                <div className="text-sm font-semibold">Coins +10</div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-sm font-semibold">Gems +50</div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <div className="text-2xl mb-1">⚠️</div>
                <div className="text-sm font-semibold">Traps -20</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onExit} className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-amber-500 hover:bg-amber-600">
                <Play className="mr-2" /> Start
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'levelComplete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              className="text-7xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-green-700 mb-2">Level {level} Complete!</h2>
            <p className="text-2xl font-bold text-amber-600 mb-4">Score: {score}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-amber-100 p-3 rounded-lg">
                <div className="text-xl font-bold text-amber-700">{coinsCollected}</div>
                <div className="text-sm">Coins Collected</div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="text-xl font-bold text-purple-700">{gemsCollected}</div>
                <div className="text-sm">Gems Found</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={finishGame} className="flex-1">
                Finish
              </Button>
              <Button onClick={nextLevel} className="flex-1 bg-green-500 hover:bg-green-600">
                Level {level + 1} →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'gameOver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="text-7xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold text-gray-700 mb-2">Time's Up!</h2>
            <p className="text-2xl font-bold text-amber-600 mb-4">Final Score: {score}</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="text-xl font-bold text-blue-700">{level}</div>
                <div className="text-sm">Levels</div>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <div className="text-xl font-bold text-amber-700">{coinsCollected}</div>
                <div className="text-sm">Coins</div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="text-xl font-bold text-purple-700">{gemsCollected}</div>
                <div className="text-sm">Gems</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={startGame} className="flex-1">
                Try Again
              </Button>
              <Button onClick={finishGame} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-4">
      {/* HUD */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Level</div>
              <div className="text-2xl font-bold text-blue-600">{level}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-2xl font-bold text-amber-600">{score}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-2xl font-bold text-yellow-600">{coinsCollected}/{totalCoins}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Time</div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                {timeLeft}s
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maze */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/90">
          <CardContent className="p-4">
            <div 
              className="grid gap-1 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${maze[0]?.length || 8}, minmax(0, 1fr))`,
                maxWidth: `${(maze[0]?.length || 8) * 48}px`
              }}
            >
              {maze.map((row, y) => 
                row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`
                      aspect-square flex items-center justify-center text-2xl rounded-lg
                      ${cell === 'wall' ? 'bg-gray-700' : 'bg-amber-50'}
                      ${x === playerPos.x && y === playerPos.y ? 'bg-blue-200 ring-2 ring-blue-500' : ''}
                      ${cell === 'goal' ? 'bg-green-200' : ''}
                      ${cell === 'trap' ? 'bg-red-100' : ''}
                    `}
                    initial={x === playerPos.x && y === playerPos.y ? { scale: 1.2 } : {}}
                    animate={x === playerPos.x && y === playerPos.y ? { scale: 1 } : {}}
                  >
                    {getCellEmoji(cell, x, y)}
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mt-4">
        <Card className="bg-white/90">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => movePlayer(0, -1)}
                className="w-12 h-12"
              >
                <ArrowUp className="w-6 h-6" />
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer(-1, 0)}
                  className="w-12 h-12"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer(0, 1)}
                  className="w-12 h-12"
                >
                  <ArrowDown className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer(1, 0)}
                  className="w-12 h-12"
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Use WASD or Arrow Keys to move
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exit */}
      <div className="max-w-4xl mx-auto mt-4 text-center">
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft className="mr-2" /> Exit Game
        </Button>
      </div>
    </div>
  )
}

export default MoneyMaze
