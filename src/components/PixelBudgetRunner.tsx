import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Trophy, Coins, ArrowLeft } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Platform {
  x: number
  y: number
  width: number
  hasCoin: boolean
  coinCollected: boolean
}

interface Player {
  x: number
  y: number
  velocityY: number
  isJumping: boolean
}

const BUDGETING_TIPS = [
  "Assign every dollar a job!",
  "Income minus expenses should equal zero",
  "Prioritize your needs first",
  "Set aside money for savings",
  "Track every expense",
  "Review your budget monthly",
  "Build an emergency fund",
  "Plan for irregular expenses",
  "Give yourself some fun money",
  "Zero-based doesn't mean zero in the bank!"
]

interface PixelBudgetRunnerProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

export default function PixelBudgetRunner({ onComplete, onExit, userTier = 'middle' }: PixelBudgetRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [currentTip, setCurrentTip] = useState<string>('')
  const [showTip, setShowTip] = useState(false)
  const [startTime, setStartTime] = useState(0)
  
  const gameLoopRef = useRef<number>(0)
  const playerRef = useRef<Player>({
    x: 100,
    y: 300,
    velocityY: 0,
    isJumping: false
  })
  const platformsRef = useRef<Platform[]>([])
  const gameSpeedRef = useRef(3)
  const lastTipScoreRef = useRef(0)

  const GRAVITY = 0.6
  const JUMP_FORCE = -12
  const PLAYER_SIZE = 32
  const PLATFORM_HEIGHT = 16
  const GROUND_Y = 400

  useEffect(() => {
    const stored = localStorage.getItem('pixel-budget-runner-high-score')
    if (stored) {
      setHighScore(parseInt(stored))
    }
  }, [])

  const initGame = () => {
    playerRef.current = {
      x: 100,
      y: 300,
      velocityY: 0,
      isJumping: false
    }
    
    platformsRef.current = []
    for (let i = 0; i < 8; i++) {
      platformsRef.current.push({
        x: 200 + i * 200,
        y: Math.random() * 200 + 250,
        width: 100 + Math.random() * 50,
        hasCoin: true,
        coinCollected: false
      })
    }
    
    gameSpeedRef.current = 3
    lastTipScoreRef.current = 0
    setScore(0)
    setCurrentTip('')
    setShowTip(false)
    setStartTime(Date.now())
  }

  const jump = () => {
    if (gameState === 'playing' && !playerRef.current.isJumping) {
      playerRef.current.velocityY = JUMP_FORCE
      playerRef.current.isJumping = true
    }
  }

  const checkCollision = (player: Player, platform: Platform): boolean => {
    return (
      player.x + PLAYER_SIZE > platform.x &&
      player.x < platform.x + platform.width &&
      player.y + PLAYER_SIZE >= platform.y &&
      player.y + PLAYER_SIZE <= platform.y + PLATFORM_HEIGHT + 10 &&
      player.velocityY >= 0
    )
  }

  const gameLoop = (): void => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#7DD3FC'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#A5F3FC'
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(i * 200 - (Date.now() / 20) % 200, 50 + i * 20, 100, 10)
    }

    ctx.fillStyle = '#86EFAC'
    ctx.fillRect(0, GROUND_Y + PLATFORM_HEIGHT, canvas.width, canvas.height - GROUND_Y - PLATFORM_HEIGHT)

    const player = playerRef.current
    player.velocityY += GRAVITY
    player.y += player.velocityY

    let onPlatform = false

    if (player.y + PLAYER_SIZE >= GROUND_Y) {
      player.y = GROUND_Y - PLAYER_SIZE
      player.velocityY = 0
      player.isJumping = false
      onPlatform = true
    }

    platformsRef.current.forEach((platform) => {
      platform.x -= gameSpeedRef.current

      if (checkCollision(player, platform)) {
        player.y = platform.y - PLAYER_SIZE
        player.velocityY = 0
        player.isJumping = false
        onPlatform = true

        if (platform.hasCoin && !platform.coinCollected) {
          platform.coinCollected = true
          const newScore = score + 1
          setScore(newScore)

          if (newScore % 10 === 0 && newScore > lastTipScoreRef.current) {
            const tipIndex = Math.floor(newScore / 10) % BUDGETING_TIPS.length
            setCurrentTip(BUDGETING_TIPS[tipIndex])
            setShowTip(true)
            lastTipScoreRef.current = newScore
            setTimeout(() => setShowTip(false), 3000)
          }

          if (newScore % 5 === 0) {
            gameSpeedRef.current += 0.3
          }
        }
      }

      ctx.fillStyle = '#8B5CF6'
      ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT)

      ctx.fillStyle = '#A78BFA'
      ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, 4)

      if (platform.hasCoin && !platform.coinCollected) {
        ctx.fillStyle = '#FCD34D'
        ctx.beginPath()
        ctx.arc(platform.x + platform.width / 2, platform.y - 20, 12, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#F59E0B'
        ctx.beginPath()
        ctx.arc(platform.x + platform.width / 2, platform.y - 20, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#FCD34D'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('$', platform.x + platform.width / 2, platform.y - 17)
      }
    })

    platformsRef.current = platformsRef.current.filter(p => p.x + p.width > -50)

    while (platformsRef.current.length < 8) {
      const lastPlatform = platformsRef.current[platformsRef.current.length - 1]
      const lastX = lastPlatform ? lastPlatform.x : 0
      platformsRef.current.push({
        x: lastX + 180 + Math.random() * 100,
        y: Math.random() * 200 + 250,
        width: 100 + Math.random() * 50,
        hasCoin: true,
        coinCollected: false
      })
    }

    ctx.fillStyle = '#EC4899'
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE)

    ctx.fillStyle = '#F9A8D4'
    ctx.fillRect(player.x + 4, player.y + 4, 8, 8)
    ctx.fillRect(player.x + PLAYER_SIZE - 12, player.y + 4, 8, 8)

    ctx.fillStyle = '#1F2937'
    ctx.fillRect(player.x + 8, player.y + 16, PLAYER_SIZE - 16, 4)

    if (player.y > canvas.height || !onPlatform && player.y + PLAYER_SIZE >= GROUND_Y + 50) {
      const timeSpent = Date.now() - startTime
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('pixel-budget-runner-high-score', score.toString())
      }
      setGameState('gameover')
      onComplete(score * 10, { timeSpent })
      return
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current)
        }
      }
    }
  }, [gameState])

  const startGame = () => {
    initGame()
    setGameState('playing')
  }

  const handleCanvasClick = () => {
    if (gameState === 'playing') {
      jump()
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState])

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <Coins className="w-12 h-12 text-white" weight="fill" />
              </div>
            </motion.div>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Pixel Budget Runner</h1>
              <p className="text-muted-foreground text-lg">Learn Zero-Based Budgeting</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
              <h2 className="font-semibold text-lg text-center mb-4">How to Play</h2>
              <div className="space-y-2 text-sm">
                <p>🏃 Your character runs automatically</p>
                <p>⬆️ Click or press SPACE to jump</p>
                <p>💰 Collect budget envelope coins ($1 each)</p>
                <p>📚 Learn budgeting tips every 10 coins</p>
                <p>⚠️ Don't fall off platforms!</p>
              </div>
            </div>

            {highScore > 0 && (
              <div className="flex items-center justify-center gap-2 text-accent font-semibold">
                <Trophy weight="fill" className="w-6 h-6" />
                <span>High Score: ${highScore}</span>
              </div>
            )}

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={startGame}
              >
                <Play weight="fill" className="w-6 h-6 mr-2" />
                Start Game
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={onExit}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/10 via-muted/20 to-accent/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Card className="p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">💸</div>
            </motion.div>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Game Over!</h1>
              <p className="text-muted-foreground">Keep practicing your budgeting skills</p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">Final Score</p>
                <p className="text-5xl font-bold text-primary">${score}</p>
              </div>

              {score > highScore && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-accent/10 rounded-lg p-4"
                >
                  <p className="text-accent font-semibold flex items-center justify-center gap-2">
                    <Trophy weight="fill" className="w-5 h-5" />
                    New High Score!
                  </p>
                </motion.div>
              )}

              {highScore > 0 && score < highScore && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Trophy weight="fill" className="w-5 h-5" />
                  <span>High Score: ${highScore}</span>
                </div>
              )}

              {currentTip && (
                <div className="bg-secondary/50 rounded-lg p-4 border-l-4 border-secondary">
                  <p className="text-sm font-semibold text-secondary-foreground">
                    💡 {currentTip}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={startGame}
              >
                <Play weight="fill" className="w-6 h-6 mr-2" />
                Play Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={onExit}
              >
                Back to Hub
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="flex gap-4">
            <div className="bg-card rounded-lg px-6 py-3 shadow-md border">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold text-primary flex items-center gap-2">
                <Coins weight="fill" className="w-6 h-6" />
                ${score}
              </p>
            </div>

            <div className="bg-card rounded-lg px-6 py-3 shadow-md border">
              <p className="text-sm text-muted-foreground">High Score</p>
              <p className="text-2xl font-bold text-accent flex items-center gap-2">
                <Trophy weight="fill" className="w-5 h-5" />
                ${highScore}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onClick={handleCanvasClick}
            className="w-full border-4 border-card rounded-lg shadow-2xl cursor-pointer bg-white"
            style={{ imageRendering: 'pixelated' }}
          />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            Click or Press SPACE to Jump
          </div>
        </div>

        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-gradient-to-r from-accent to-secondary text-white rounded-lg p-4 shadow-lg text-center"
            >
              <p className="font-bold text-lg">💡 Budgeting Tip!</p>
              <p className="text-sm mt-1">{currentTip}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
