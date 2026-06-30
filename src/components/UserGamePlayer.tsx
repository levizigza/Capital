import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Heart, Star } from '@/lib/lucide';
import { motion, AnimatePresence } from 'framer-motion';

interface UserGamePlayerProps {
  onExit: () => void;
  game: CommunityGame;
  userProfile: any;
  onGameComplete: (score: number, additionalData?: Record<string, unknown>) => void;
}

interface CommunityGame {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorId: string;
  creatorAvatar: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  tags: string[];
  likes: number;
  plays: number;
  rating: number;
  createdAt: Date;
  featured: boolean;
  isNew: boolean;
}

interface GameObject {
  id: string;
  type: 'character' | 'collectible' | 'obstacle';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
  emoji: string;
  value?: number;
  color?: string;
}

export default function UserGamePlayer({ onExit, game, userProfile, onGameComplete }: UserGamePlayerProps) {
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'playing' | 'paused' | 'ended'>('loading');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(120);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 200 });
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [collectedItems, setCollectedItems] = useState<Set<string>>(new Set());
  const [highScore, setHighScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ type: 'good' | 'bad' | 'neutral'; message: string; x: number; y: number } | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const keysPressed = useRef<Set<string>>(new Set());

  // Initialize game based on game category and difficulty
  useEffect(() => {
    const initializeGame = () => {
      const objects: GameObject[] = [];

      // Generate game objects based on category
      switch (game.category) {
        case 'savings':
          // Create coins and expenses
          for (let i = 0; i < 10; i++) {
            objects.push({
              id: `coin-${i}`,
              type: 'collectible',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: 0, y: 0 },
              size: 30,
              emoji: '💰',
              value: 10
            });
          }
          for (let i = 0; i < 5; i++) {
            objects.push({
              id: `expense-${i}`,
              type: 'obstacle',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: (Math.random() - 0.5) * 2, y: 0 },
              size: 35,
              emoji: '💸',
              value: -5
            });
          }
          break;

        case 'investing':
          // Create investment opportunities and market risks
          for (let i = 0; i < 8; i++) {
            objects.push({
              id: `investment-${i}`,
              type: 'collectible',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: 0, y: 0 },
              size: 35,
              emoji: '💎',
              value: 25
            });
          }
          for (let i = 0; i < 3; i++) {
            objects.push({
              id: `risk-${i}`,
              type: 'obstacle',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: (Math.random() - 0.5) * 3, y: 0 },
              size: 40,
              emoji: '📉',
              value: -15
            });
          }
          break;

        case 'budgeting':
          // Create budget items and overspending traps
          for (let i = 0; i < 12; i++) {
            objects.push({
              id: `budget-${i}`,
              type: 'collectible',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: 0, y: 0 },
              size: 25,
              emoji: '📋',
              value: 5
            });
          }
          for (let i = 0; i < 6; i++) {
            objects.push({
              id: `overspend-${i}`,
              type: 'obstacle',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: (Math.random() - 0.5) * 1.5, y: 0 },
              size: 30,
              emoji: '💳',
              value: -8
            });
          }
          break;

        default:
          // Generic game with mixed objects
          for (let i = 0; i < 15; i++) {
            const isCollectible = Math.random() > 0.4;
            objects.push({
              id: `item-${i}`,
              type: isCollectible ? 'collectible' : 'obstacle',
              position: { x: 50 + Math.random() * 600, y: 50 + Math.random() * 300 },
              velocity: { x: isCollectible ? 0 : (Math.random() - 0.5) * 2, y: 0 },
              size: 25 + Math.random() * 15,
              emoji: isCollectible ?
                ['💰', '💎', '🏆', '⭐'][Math.floor(Math.random() * 4)] :
                ['👾', '💀', '☠️', '🕳️'][Math.floor(Math.random() * 4)],
              value: isCollectible ? 10 + Math.random() * 20 : -(5 + Math.random() * 10)
            });
          }
      }

      setGameObjects(objects);
      setGameState('ready');
    };

    // Simulate loading time
    setTimeout(initializeGame, 1000);
  }, [game.category]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);

      if (gameState === 'playing') {
        switch (e.key) {
          case 'Escape':
            setGameState('paused');
            break;
          case ' ':
            if (e.target === document.body) {
              e.preventDefault();
            }
            break;
        }
      } else if (gameState === 'paused' && e.key === 'Escape') {
        setGameState('playing');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game physics and collision detection
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update player position based on keyboard input
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      const speed = 5;

      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
        newX = Math.max(20, prev.x - speed);
      }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
        newX = Math.min(680, prev.x + speed);
      }
      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
        newY = Math.max(20, prev.y - speed);
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
        newY = Math.min(380, prev.y + speed);
      }

      return { x: newX, y: newY };
    });

    // Update moving objects
    setGameObjects(prev => {
      return prev.map(obj => {
        if (obj.type === 'obstacle' && obj.velocity.x !== 0) {
          let newX = obj.position.x + obj.velocity.x;
          if (newX <= 20 || newX >= 680) {
            obj.velocity.x = -obj.velocity.x;
            newX = obj.position.x + obj.velocity.x;
          }
          return { ...obj, position: { ...obj.position, x: newX } };
        }
        return obj;
      });
    });

    // Check collisions
    setGameObjects(prev => {
      const updated = [...prev];
      const toRemove = new Set<string>();

      updated.forEach(obj => {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - obj.position.x, 2) +
          Math.pow(playerPosition.y - obj.position.y, 2)
        );

        if (distance < 30 && !collectedItems.has(obj.id)) {
          toRemove.add(obj.id);
          setCollectedItems(prev => new Set([...prev, obj.id]));

          if (obj.type === 'collectible') {
            const points = obj.value || 10;
            setScore(prev => prev + points);
            setShowFeedback({
              type: 'good',
              message: `+${points}`,
              x: obj.position.x,
              y: obj.position.y
            });
          } else {
            const damage = Math.abs(obj.value || 5);
            setLives(prev => Math.max(0, prev - 1));
            setShowFeedback({
              type: 'bad',
              message: `-${damage}`,
              x: obj.position.x,
              y: obj.position.y
            });

            if (lives <= 1) {
              // Game over after this hit
              setTimeout(() => setGameState('ended'), 1000);
            }
          }

          setTimeout(() => setShowFeedback(null), 1000);
        }
      });

      return updated.filter(obj => !toRemove.has(obj.id));
    });
  }, [gameState, playerPosition, collectedItems, lives]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = () => {
        updateGame();
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, updateGame]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('ended');
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setTimeLeft(120);
    setCollectedItems(new Set());
    setPlayerPosition({ x: 100, y: 200 });
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLives(3);
    setTimeLeft(120);
    setCollectedItems(new Set());
    setPlayerPosition({ x: 100, y: 200 });
    setShowFeedback(null);
    // Reinitialize game objects
    initializeGameObjects();
  };

  const initializeGameObjects = () => {
    // This would regenerate the game objects similar to the initialization
    // For simplicity, we'll just reload the page component
    setGameState('loading');
    setTimeout(() => {
      const objects: GameObject[] = [];
      // (Same initialization logic as before)
      setGameObjects(objects);
      setGameState('ready');
    }, 500);
  };

  const endGame = () => {
    setGameState('ended');
    const finalScore = score + (timeLeft * 2); // Bonus for remaining time
    setHighScore(Math.max(highScore, finalScore));
    onGameComplete(finalScore, {
      gameId: game.id,
      plays: game.plays + 1,
      completedAt: new Date(),
      accuracy: collectedItems.size / 15, // Approximate
      timeBonus: timeLeft * 2
    });
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Loading Game...</h2>
          <p className="text-gray-600">Preparing "{game.title}" by {game.creatorName}</p>
        </div>
      </div>
    );
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">🎮</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">{game.title}</h2>
          <p className="text-xl text-muted-foreground mb-4 text-center max-w-lg">
            {game.description}
          </p>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-lg">{game.creatorAvatar}</span>
                <span>Created by {game.creatorName}</span>
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {game.category}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                game.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {game.difficulty}
              </span>
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
            <p className="text-sm text-yellow-800 text-center">
              <strong>How to Play:</strong> Use Arrow Keys or WASD to move. Collect good items and avoid bad ones!
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={startGame} className="game-arcade-btn text-xl px-8 py-4">
              <Play className="w-6 h-6 mr-2" />
              Start Game
            </Button>
            <Button onClick={onExit} variant="outline" className="text-lg px-8 py-4 border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const success = score > 100;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">
            {success ? '🏆' : score > 50 ? '⭐' : '💪'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Game Complete!</h2>

          <div className="text-center space-y-4">
            <div className={`text-3xl font-bold ${success ? 'text-green-600' : 'text-blue-600'}`}>
              Final Score: {score}
            </div>
            <div className="text-xl text-muted-foreground">
              High Score: {highScore}
            </div>
            <div className="text-lg text-muted-foreground">
              Time Bonus: {timeLeft * 2} points
            </div>
          </div>

          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <p className="text-sm text-green-800 text-center">
              {success ? 'Amazing job! You\'re a financial literacy master!' :
               score > 50 ? 'Great work! Keep practicing to improve!' :
               'Good effort! Every game makes you smarter about money!'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={resetGame} className="game-arcade-btn">
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            <Button onClick={onExit} variant="outline" className="text-lg px-8 border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={onExit} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div>
              <h1 className="text-xl font-bold">{game.title}</h1>
              <p className="text-sm text-gray-600">by {game.creatorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-lg">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-bold text-lg">{lives}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
            <Button
              onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
              size="sm"
            >
              {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
              <p className="text-gray-600 mb-6">Press ESC to resume</p>
              <Button onClick={() => setGameState('playing')}>
                <Play className="w-5 h-5 mr-2" />
                Resume Game
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ width: '720px', height: '400px', margin: '0 auto' }}
      >
        {/* Player */}
        <div
          className="absolute text-3xl transition-all duration-100"
          style={{
            left: `${playerPosition.x}px`,
            top: `${playerPosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          🤖
        </div>

        {/* Game Objects */}
        {gameObjects.map(obj => (
          <div
            key={obj.id}
            className={`absolute transition-all duration-100 ${obj.type === 'obstacle' ? 'animate-pulse' : ''}`}
            style={{
              left: `${obj.position.x}px`,
              top: `${obj.position.y}px`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${obj.size}px`
            }}
          >
            {obj.emoji}
          </div>
        ))}

        {/* Feedback Animations */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1.5 }}
              exit={{ opacity: 0, y: -60, scale: 0.5 }}
              className={`absolute font-bold text-2xl ${
                showFeedback.type === 'good' ? 'text-green-500' : 'text-red-500'
              }`}
              style={{
                left: `${showFeedback.x}px`,
                top: `${showFeedback.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {showFeedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-gray-600">
        <p>Use Arrow Keys or WASD to move • Press ESC to pause</p>
      </div>
    </div>
  );
}