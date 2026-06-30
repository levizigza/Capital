import React, { useState, useCallback } from 'react';
import { ArrowLeft } from '@/lib/lucide';

interface CollectGame2DProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

export default function CollectGame2D({ onComplete, onExit, userTier = 'middle' }: CollectGame2DProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [juiceCollected, setJuiceCollected] = useState(0);

  const handleCollect = useCallback(() => {
    const points = Math.floor(Math.random() * 5) + 3;
    setScore(prev => prev + points);
    setJuiceCollected(prev => prev + 1);

    if (juiceCollected >= 10) {
      setRound(prev => prev + 1);
      setJuiceCollected(0);
    }
  }, [juiceCollected]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(1);
    setTimeLeft(30);
    setJuiceCollected(0);
  };

  const endGame = () => {
    setGameState('ended');
    onComplete(score, {
      rounds: round,
      efficiency: score / (30 - timeLeft + 1)
    });
  };

  // Timer for game duration
  React.useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">🧃</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Welcome to Juice Collector!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
            Collect as much juice as you can in 30 seconds! Each collection earns you points.
            Collect 10 juices to advance to the next round for bonus points!
          </p>
          <button onClick={startGame} className="game-arcade-btn w-full max-w-md text-2xl">
            Start Collection
          </button>
          <button onClick={onExit} className="w-full max-w-md text-lg mt-2 border-2 bg-white text-green-700 font-bold border-green-300 hover:bg-green-50 transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">🏆</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Collection Complete!</h2>
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold text-green-600">Final Score: {score}</p>
            <p className="text-xl text-muted-foreground">Rounds Completed: {round}</p>
            <p className="text-lg text-muted-foreground">
              {score >= 100 ? 'Excellent collection skills!' :
               score >= 50 ? 'Great job!' :
               'Good effort! Keep practicing!'}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={startGame} className="game-arcade-btn px-8 py-3 text-lg">
              Play Again
            </button>
            <button onClick={onExit} className="w-full max-w-md text-lg px-8 py-3 border-2 bg-white text-green-700 font-bold border-green-300 hover:bg-green-50 transition">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <span className="text-5xl">🧃</span>
        <div>
          <h2 className="text-2xl font-bold">Juice Collector</h2>
          <p className="text-sm text-muted-foreground">Round {round} - {timeLeft}s left</p>
        </div>
      </div>

      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">{juiceCollected}/10</div>
          <div className="text-xs text-muted-foreground">Juice Progress</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-purple-600">{timeLeft}s</div>
          <div className="text-xs text-muted-foreground">Time Left</div>
        </div>
      </div>

      <div className="game-arcade-content">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-100 to-blue-100 rounded-2xl border-4 border-pink-300">
            <span className="text-8xl mb-4 animate-bounce">🧃</span>
            <p className="text-lg font-semibold text-gray-700">Click to collect juice!</p>
            <p className="text-sm text-gray-600">Each click gives 3-7 points</p>
          </div>
        </div>
      </div>

      <div className="game-arcade-actions">
        <button
          onClick={handleCollect}
          className="game-arcade-btn text-xl py-6 px-12 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
        >
          🧃 Collect Juice! 🧃
        </button>
        <button onClick={onExit} className="game-arcade-btn bg-gray-500 hover:bg-gray-600">
          Exit
        </button>
      </div>
    </div>
  );
}