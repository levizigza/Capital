import { useState, useEffect, useCallback, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameController, Book, Gear, Users, Coins, ArrowLeft, FloppyDisk } from '@phosphor-icons/react'
import EnhancedAvatarCustomizer, { EnhancedAvatarConfig } from './EnhancedAvatarCustomizer'
import PokemonWorld3D from './PokemonWorld3D'
import StoryMode from './StoryMode'
import CoinAndCapital from './MonopolyMode'
import MarketRallyGame from './MarketRallyGame'
import BudgetMazeGame from './BudgetMazeGame'
import ComebackChallenge from './ComebackChallenge'
import SaveSystem, { GameSaveData, useSaveSystem, PopupGuide } from './SaveSystem'
import ProgressionCutscene from './ProgressionCutscenes'
import GameInstructionBox from './GameInstructionBox'
import { GAME_INSTRUCTIONS } from '@/data/gameInstructions'
import type { UserProfile, GameScore } from '@/App'
import { buildBossForNeighborhood } from '@/data/worldBoss'
import { BossBattle } from '@/game/components/games/BossBattle'

// Import existing game components
import { CoinCatcherGame } from '@/game/components/games/CoinCatcherGame'
import { BudgetBalance } from '@/game/components/BudgetBalance'
import { InvestmentTower } from '@/game/components/InvestmentTower'
import { SavingsSprintGame } from '@/game/components/games/SavingsSprint'
import { DebtDungeonGame } from '@/game/components/games/DebtDungeon'
import { CompoundGrowth } from '@/game/components/CompoundGrowth'
import { CreditCardMemory } from '@/game/components/CreditCardMemory'
import { StockMarketGame } from '@/game/components/games/StockMarketGame'
import { ExpenseExpressGame } from '@/game/components/games/ExpenseExpress'
import { LemonadeBossGame } from '@/game/components/games/LemonadeBossGame'
import BusinessBuilder2D from '@/game/components/games/BusinessBuilder2D'
import CollectGame2D from '@/game/components/games/CollectGame2D'
import PortfolioOptimizer from '@/game/components/games/PortfolioOptimizer'

type GameMode = 'menu' | 'world' | 'story' | 'boardgame' | 'marketrally' | 'budgetmaze' | 'avatar' | 'playing' | 'comeback'
type CutsceneType = 'game-start' | 'level-up' | 'achievement' | 'broke' | 'rich' | 'boss-intro' | 'boss-victory' | 'chapter-complete' | 'game-over' | 'new-location'

interface EnhancedGameHubProps {
  userProfile: UserProfile
  setUserProfile: (fn: (prev: UserProfile) => UserProfile) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>) => void
  onModeSwitch: () => void
}

const DEFAULT_AVATAR: EnhancedAvatarConfig = {
  characterType: 'kid',
  gender: 'neutral',
  skinTone: 'medium',
  bodyType: 'average',
  height: 'medium',
  faceShape: 'round',
  eyeStyle: 'normal',
  eyeColor: '#2C3E50',
  noseStyle: 'normal',
  mouthStyle: 'smile',
  hairStyle: 'short',
  hairColor: 'brown',
  topStyle: 'tshirt',
  topColor: '#3498DB',
  bottomStyle: 'jeans',
  bottomColor: '#2C3E50',
  shoesStyle: 'sneakers',
  shoesColor: '#E74C3C',
  hat: 'none',
  glasses: 'none',
  pet: 'none',
  aura: 'none',
  money: 1000,
}

/** Map profile difficulty to mini-game difficulty props */
function playDifficulty(prefs: UserProfile['preferences']): 'easy' | 'medium' | 'hard' {
  const d = prefs?.difficulty ?? 'adaptive'
  if (d === 'beginner') return 'easy'
  if (d === 'advanced' || d === 'expert') return 'hard'
  return 'medium'
}

// Game component mapping (ids must match `PokemonWorld3D` WORLD_LOCATIONS games)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GAME_COMPONENTS: Record<string, ComponentType<any>> = {
  'coin-catcher': CoinCatcherGame,
  'budget-balance': BudgetBalance,
  'investment-tower': InvestmentTower,
  'savings-sprint': SavingsSprintGame,
  'debt-dungeon': DebtDungeonGame,
  'compound-growth': CompoundGrowth,
  'credit-card-memory': CreditCardMemory,
  'stock-market': StockMarketGame,
  'expense-escape': ExpenseExpressGame,
  'lemonade-stand': LemonadeBossGame,
  'business-builder': BusinessBuilder2D,
  'piggy-bank-puzzle': CollectGame2D,
  'final-challenge': PortfolioOptimizer,
}

export default function EnhancedGameHub({
  userProfile,
  onGameComplete,
  onModeSwitch
}: EnhancedGameHubProps) {
  // State
  const [gameMode, setGameMode] = useState<GameMode>('menu')
  const [avatarConfig, setAvatarConfig] = useState<EnhancedAvatarConfig>(DEFAULT_AVATAR)
  const [playerMoney, setPlayerMoney] = useState(1000)
  const [completedGames, setCompletedGames] = useState<string[]>([])
  const [completedChapters, setCompletedChapters] = useState<string[]>([])
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string>('starter-town')
  const [showSaveSystem, setShowSaveSystem] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showCutscene, setShowCutscene] = useState(false)
  const [cutsceneType, setCutsceneType] = useState<CutsceneType>('game-start')
  const [cutsceneData, setCutsceneData] = useState<Record<string, unknown>>({})
  const [showGuide, setShowGuide] = useState(false)
  const [guideMessage, setGuideMessage] = useState({ title: '', message: '', emoji: '' })
  const [playTime, setPlayTime] = useState(0)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // Save system hook
  const { autoSave } = useSaveSystem()

  // Track play time
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayTime(prev => prev + 1)
    }, 60000) // Every minute
    return () => clearInterval(timer)
  }, [])

  // Auto-save every 5 minutes
  useEffect(() => {
    const saveTimer = setInterval(() => {
      autoSave({
        playerName: userProfile.name || 'Explorer',
        avatarConfig,
        money: playerMoney,
        completedGames,
        completedChapters,
        unlockedLocations: [],
        currentLocation,
        totalPlayTime: playTime,
        achievements: userProfile.achievements,
        settings: {
          musicVolume: 0.5,
          sfxVolume: 0.5,
          musicEnabled: true
        }
      })
    }, 300000) // 5 minutes
    return () => clearInterval(saveTimer)
  }, [avatarConfig, playerMoney, completedGames, completedChapters, currentLocation, playTime, userProfile, autoSave])

  // First visit guide
  useEffect(() => {
    if (isFirstVisit && gameMode === 'menu') {
      setTimeout(() => {
        setGuideMessage({
          title: 'Welcome to FinanceQuest!',
          message: "Start by creating your avatar, then explore the world to play games and learn about money! Don't forget to check out Story Mode for fun financial tales!",
          emoji: '🎮'
        })
        setShowGuide(true)
        setIsFirstVisit(false)
      }, 1000)
    }
  }, [isFirstVisit, gameMode])

  // Check for broke status
  useEffect(() => {
    if (playerMoney <= 0 && gameMode !== 'comeback') {
      triggerCutscene('broke')
      setTimeout(() => {
        setGameMode('comeback')
      }, 4000)
    }
  }, [playerMoney, gameMode])

  // Check for rich status
  useEffect(() => {
    if (playerMoney >= 10000 && !completedGames.includes('reached-10k')) {
      triggerCutscene('rich', { amount: playerMoney })
      setCompletedGames(prev => [...prev, 'reached-10k'])
    }
  }, [playerMoney, completedGames])

  const triggerCutscene = (type: CutsceneType, data?: Record<string, unknown>) => {
    setCutsceneType(type)
    setCutsceneData(data || {})
    setShowCutscene(true)
  }

  const handleAvatarSave = (config: EnhancedAvatarConfig) => {
    setAvatarConfig(config)
    setPlayerMoney(config.money)
    setGameMode('menu')
  }

  const handleStartGame = (gameId: string, locationId: string) => {
    setCurrentGame(gameId)
    setCurrentLocation(locationId)
    // Always enter playing shell so instructions + game render (was bug: instructions never showed while still in "world")
    setGameMode('playing')
    setShowInstructions(Boolean(GAME_INSTRUCTIONS[gameId]))
  }

  const handleGameComplete = useCallback((score: number, secondArg?: number | Record<string, unknown>, thirdArg?: number) => {
    if (!currentGame) return
    
    // Handle different callback signatures from games:
    // - Most games: (score, additionalData?)
    // - BudgetBalance: (score, timeSpent)
    // - InvestmentTower: (score, finalValue, timeSpent)
    const timeSpent = typeof secondArg === 'number'
      ? (typeof thirdArg === 'number' ? thirdArg : secondArg)
      : 0
    const additionalData = typeof secondArg === 'object' ? secondArg : undefined
    
    // Calculate rewards
    const baseReward = Math.floor(score * 0.5) + 25
    setPlayerMoney(prev => prev + baseReward)
    
    // Mark game as completed
    if (!completedGames.includes(currentGame)) {
      setCompletedGames(prev => [...prev, currentGame!])
    }
    
    // Call parent handler
    onGameComplete(currentGame, score, timeSpent, { ...additionalData, finalAmount: playerMoney + baseReward })
    
    // Return to world
    setCurrentGame(null)
    setGameMode('world')
  }, [currentGame, completedGames, playerMoney, onGameComplete])

  const handleChapterComplete = (chapterId: string, reward: number) => {
    setPlayerMoney(prev => prev + reward)
    if (!completedChapters.includes(chapterId)) {
      setCompletedChapters(prev => [...prev, chapterId])
      triggerCutscene('chapter-complete', { chapterTitle: chapterId })
    }
  }

  const handleComebackComplete = (earnedMoney: number) => {
    setPlayerMoney(earnedMoney)
    setGameMode('menu')
  }

  const handleLoadSave = (saveData: GameSaveData) => {
    setAvatarConfig(saveData.avatarConfig)
    setPlayerMoney(saveData.money)
    setCompletedGames(saveData.completedGames)
    setCompletedChapters(saveData.completedChapters)
    setCurrentLocation(saveData.currentLocation)
    setPlayTime(saveData.totalPlayTime)
    setShowSaveSystem(false)
  }

  const exitGameToWorld = useCallback(() => {
    setCurrentGame(null)
    setGameMode('world')
    setShowInstructions(false)
  }, [])

  const tier = playDifficulty(userProfile.preferences)
  const userTier: 'elementary' | 'middle' | 'adult' =
    tier === 'easy' ? 'elementary' : tier === 'hard' ? 'adult' : 'middle'

  // Render current game
  const renderGame = () => {
    if (!currentGame) return null

    if (currentGame === 'boss-battle') {
      const boss = buildBossForNeighborhood(currentLocation)
      return (
        <div className="min-h-screen">
          <button
            type="button"
            onClick={exitGameToWorld}
            className="fixed top-4 left-4 z-50 retro-btn retro-btn-yellow"
          >
            <ArrowLeft size={20} className="mr-2" /> Exit boss
          </button>
          <BossBattle
            boss={boss}
            neighborhoodId={currentLocation}
            onComplete={handleGameComplete}
            onExit={exitGameToWorld}
          />
        </div>
      )
    }

    const GameComponent = GAME_COMPONENTS[currentGame]
    if (!GameComponent) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="retro-card p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Game not linked yet</h2>
            <p className="text-gray-600 mb-4">
              This activity isn&apos;t wired to a playable build. Pick another game from the map.
            </p>
            <button type="button" onClick={exitGameToWorld} className="retro-btn retro-btn-blue">
              Back to World
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen">
        <button
          type="button"
          onClick={exitGameToWorld}
          className="fixed top-4 left-4 z-50 retro-btn retro-btn-yellow"
        >
          <ArrowLeft size={20} className="mr-2" /> Exit Game
        </button>

        <GameComponent
          onComplete={handleGameComplete}
          onExit={exitGameToWorld}
          userProfile={userProfile}
          difficulty={tier}
          userTier={userTier}
          startingAmount={1000}
          targetGrowth={50}
          timeLimit={300}
          income={5000}
        />
      </div>
    )
  }

  // Main menu
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-orange-400 p-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onModeSwitch} className="retro-btn retro-btn-red">
              <ArrowLeft size={20} className="mr-2" /> Home
            </button>
            <h1 className="text-white text-lg font-bold drop-shadow-sm hidden sm:block">Creative Mode</h1>
            <div className="flex gap-2">
              <button onClick={() => setShowSaveSystem(true)} className="retro-btn retro-btn-blue" aria-label="Save game">
                <FloppyDisk size={20} /> <span className="hidden sm:inline ml-1">Save</span>
              </button>
            </div>
          </div>

          {/* Player info card */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="retro-card"
          >
            <div className="retro-card-body flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {avatarConfig.characterType === 'robot' ? '🤖' : 
                   avatarConfig.characterType === 'alien' ? '👽' : 
                   avatarConfig.gender === 'girl' ? '👧' : '👦'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userProfile.name || 'Explorer'}</h2>
                  <p className="text-gray-600">Level {userProfile.level}</p>
                </div>
              </div>
              <div className="retro-money-display text-xl">
                <span className="retro-money-icon">💰</span>
                <span>${playerMoney.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section title */}
        <div className="max-w-4xl mx-auto mb-4">
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold drop-shadow-md text-center">Choose Your Adventure</h2>
          <p className="text-white/80 text-center text-sm mt-1">Pick a mode to start learning about money</p>
        </div>

        {/* Main menu options */}
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Explore World */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="retro-card cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform"
            onClick={() => setGameMode('world')}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGameMode('world') } }}
          >
            <div className="h-36 sm:h-40 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center rounded-t-xl relative">
              <span className="text-6xl sm:text-7xl">🗺️</span>
              <span className="absolute top-2 right-2 bg-white/90 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Adventure</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                <GameController size={24} /> Explore World
              </h3>
              <p className="text-gray-600 text-sm">
                Travel neighborhoods, play mini-games, and battle bosses!
              </p>
            </div>
          </motion.div>

          {/* Story Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="retro-card cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform"
            onClick={() => setGameMode('story')}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGameMode('story') } }}
          >
            <div className="h-36 sm:h-40 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center rounded-t-xl relative">
              <span className="text-6xl sm:text-7xl">📚</span>
              <span className="absolute top-2 right-2 bg-white/90 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Story</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                <Book size={24} /> Story Mode
              </h3>
              <p className="text-gray-600 text-sm">
                Learn money wisdom through magical tales and parables!
              </p>
            </div>
          </motion.div>

          {/* Board Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="retro-card cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform"
            onClick={() => setGameMode('boardgame')}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGameMode('boardgame') } }}
          >
            <div className="h-36 sm:h-40 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center rounded-t-xl relative">
              <span className="text-6xl sm:text-7xl">🎲</span>
              <span className="absolute top-2 right-2 bg-white/90 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Board Game</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                <Users size={24} /> Coin &amp; Capital
              </h3>
              <p className="text-gray-600 text-sm">
                Roll dice, buy properties, and outsmart AI rivals!
              </p>
            </div>
          </motion.div>

          {/* Market Rally */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="retro-card cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform"
            onClick={() => setGameMode('marketrally')}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGameMode('marketrally') } }}
          >
            <div className="h-36 sm:h-40 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center rounded-t-xl relative">
              <span className="text-6xl sm:text-7xl">📈</span>
              <span className="absolute top-2 right-2 bg-white/90 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Strategy</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                <Coins size={24} /> Market Rally
              </h3>
              <p className="text-gray-600 text-sm">
                Buy &amp; sell stocks, react to breaking news, and grow your portfolio!
              </p>
            </div>
          </motion.div>

          {/* Budget Maze */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="retro-card cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform"
            onClick={() => setGameMode('budgetmaze')}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGameMode('budgetmaze') } }}
          >
            <div className="h-36 sm:h-40 bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center rounded-t-xl relative">
              <span className="text-6xl sm:text-7xl">🧩</span>
              <span className="absolute top-2 right-2 bg-white/90 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Puzzle</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                <GameController size={24} /> Budget Maze
              </h3>
              <p className="text-gray-600 text-sm">
                Navigate a maze of spending decisions, answer quizzes, and escape with your budget!
              </p>
            </div>
          </motion.div>

          {/* Customize Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="retro-card cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform sm:col-span-2 lg:col-span-1"
            onClick={() => setGameMode('avatar')}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGameMode('avatar') } }}
          >
            <div className="h-36 sm:h-40 bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center rounded-t-xl relative">
              <span className="text-6xl sm:text-7xl">🎨</span>
              <span className="absolute top-2 right-2 bg-white/90 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Customize</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                <Gear size={24} /> My Avatar
              </h3>
              <p className="text-gray-600 text-sm">
                Create your unique character with tons of options!
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="retro-card">
            <div className="retro-card-body">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{completedGames.length}</p>
                  <p className="text-sm text-gray-500">Games Played</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedChapters.length}</p>
                  <p className="text-sm text-gray-500">Stories Read</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{userProfile.level}</p>
                  <p className="text-sm text-gray-500">Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{playTime}m</p>
                  <p className="text-sm text-gray-500">Play Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save System Modal */}
        <AnimatePresence>
          {showSaveSystem && (
            <SaveSystem
              currentData={{
                playerName: userProfile.name || 'Explorer',
                avatarConfig,
                money: playerMoney,
                completedGames,
                completedChapters,
                unlockedLocations: [],
                currentLocation,
                totalPlayTime: playTime,
                achievements: userProfile.achievements,
                settings: {
                  musicVolume: 0.5,
                  sfxVolume: 0.5,
                  musicEnabled: true
                }
              }}
              onLoad={handleLoadSave}
              onClose={() => setShowSaveSystem(false)}
            />
          )}
        </AnimatePresence>

        {/* Guide Popup */}
        <AnimatePresence>
          {showGuide && (
            <PopupGuide
              title={guideMessage.title}
              message={guideMessage.message}
              emoji={guideMessage.emoji}
              onConfirm={() => setShowGuide(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Avatar customizer
  if (gameMode === 'avatar') {
    return (
      <EnhancedAvatarCustomizer
        currentConfig={avatarConfig}
        onSave={handleAvatarSave}
        onCancel={() => setGameMode('menu')}
        startingMoney={playerMoney}
      />
    )
  }

  // World exploration
  if (gameMode === 'world') {
    return (
      <>
        <PokemonWorld3D
          avatarConfig={avatarConfig}
          onSelectLocation={() => {}}
          onStartGame={handleStartGame}
          completedGames={completedGames}
          playerMoney={playerMoney}
        />
        <button
          type="button"
          onClick={() => setGameMode('menu')}
          className="fixed top-4 left-4 z-50 retro-btn retro-btn-yellow"
          aria-label="Back to Creative Mode menu"
        >
          <ArrowLeft size={20} className="mr-2" /> Menu
        </button>
      </>
    )
  }

  // Story mode
  if (gameMode === 'story') {
    return (
      <StoryMode
        onComplete={handleChapterComplete}
        onBack={() => setGameMode('menu')}
        completedChapters={completedChapters}
        playerMoney={playerMoney}
      />
    )
  }

  // Board game mode
  if (gameMode === 'boardgame') {
    return (
      <CoinAndCapital
        playerAvatar={avatarConfig}
        playerName={userProfile.name || 'Explorer'}
        onExit={() => setGameMode('menu')}
        onMiniGame={(callback) => {
          // For now, auto-complete mini-games
          setTimeout(() => callback(Math.random() > 0.3, Math.floor(Math.random() * 100) + 50), 2000)
        }}
      />
    )
  }

  // Market Rally mode
  if (gameMode === 'marketrally') {
    return (
      <MarketRallyGame
        onExit={() => setGameMode('menu')}
      />
    )
  }

  // Budget Maze mode
  if (gameMode === 'budgetmaze') {
    return (
      <BudgetMazeGame
        onExit={() => setGameMode('menu')}
      />
    )
  }

  // Comeback challenge
  if (gameMode === 'comeback') {
    return (
      <ComebackChallenge
        avatarConfig={avatarConfig}
        onComplete={handleComebackComplete}
        onGiveUp={() => {
          setPlayerMoney(100) // Give small amount to continue
          setGameMode('menu')
        }}
        debtAmount={100}
      />
    )
  }

  // Playing a game
  if (gameMode === 'playing') {
    return (
      <>
        {/* Instructions overlay */}
        <AnimatePresence>
          {showInstructions && currentGame && GAME_INSTRUCTIONS[currentGame] && (
            <GameInstructionBox
              instruction={GAME_INSTRUCTIONS[currentGame]}
              onStart={() => setShowInstructions(false)}
              onBackToMap={() => {
                setShowInstructions(false)
                setCurrentGame(null)
                setGameMode('world')
              }}
            />
          )}
        </AnimatePresence>

        {!showInstructions && renderGame()}

        {/* Cutscenes */}
        <AnimatePresence>
          {showCutscene && (
            <ProgressionCutscene
              type={cutsceneType}
              avatarConfig={avatarConfig}
              data={cutsceneData}
              onComplete={() => setShowCutscene(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return null
}
