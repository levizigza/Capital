import React, { useState, useCallback } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, Shield } from '@/lib/lucide';

interface CreditDefender2DProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

interface CreditEvent {
  id: number;
  type: 'payment' | 'purchase' | 'emergency' | 'opportunity';
  description: string;
  impact: number;
  choices: {
    text: string;
    impact: number;
    explanation: string;
  }[];
}

const creditEvents: CreditEvent[] = [
  {
    id: 1,
    type: 'payment',
    description: 'Your credit card bill of $500 is due today',
    impact: 0,
    choices: [
      {
        text: 'Pay full amount',
        impact: +15,
        explanation: 'Great! Paying in full builds positive credit history'
      },
      {
        text: 'Pay minimum only ($25)',
        impact: -5,
        explanation: 'Minimum payment avoids late fees but costs you interest'
      },
      {
        text: 'Skip payment',
        impact: -20,
        explanation: 'Missed payments hurt your credit score significantly'
      }
    ]
  },
  {
    id: 2,
    type: 'purchase',
    description: 'You want to buy a new laptop for $1,200',
    impact: 0,
    choices: [
      {
        text: 'Save up and buy later',
        impact: +10,
        explanation: 'Smart financial planning avoids debt'
      },
      {
        text: 'Use credit card and pay over time',
        impact: -5,
        explanation: 'Adds to your credit utilization ratio'
      },
      {
        text: 'Apply for store financing',
        impact: -10,
        explanation: 'New credit inquiry can temporarily lower your score'
      }
    ]
  },
  {
    id: 3,
    type: 'emergency',
    description: 'Unexpected car repair costs $800',
    impact: 0,
    choices: [
      {
        text: 'Use emergency savings',
        impact: +10,
        explanation: 'Emergency funds protect your credit in crises'
      },
      {
        text: 'Put on credit card',
        impact: -5,
        explanation: 'Increases your credit utilization ratio'
      },
      {
        text: 'Skip the repair',
        impact: -15,
        explanation: 'Neglecting maintenance can lead to bigger problems'
      }
    ]
  },
  {
    id: 4,
    type: 'opportunity',
    description: 'You\'re pre-approved for a credit limit increase',
    impact: 0,
    choices: [
      {
        text: 'Accept the increase',
        impact: +5,
        explanation: 'Higher limit can improve your credit utilization ratio'
      },
      {
        text: 'Decline politely',
        impact: 0,
        explanation: 'Maintaining current limit is also a valid choice'
      },
      {
        text: 'Request smaller increase',
        impact: +3,
        explanation: 'Moderate approach to credit management'
      }
    ]
  },
  {
    id: 5,
    type: 'payment',
    description: 'You have 3 credit cards with balances',
    impact: 0,
    choices: [
      {
        text: 'Pay off highest interest card first',
        impact: +12,
        explanation: 'Avalanche method saves money on interest'
      },
      {
        text: 'Pay off smallest balance first',
        impact: +8,
        explanation: 'Snowball method provides psychological wins'
      },
      {
        text: 'Pay minimum on all cards',
        impact: -8,
        explanation: 'This strategy prolongs debt and costs more'
      }
    ]
  }
];

export default function CreditDefender2D({ onComplete, onExit, userTier = 'middle' }: CreditDefender2DProps) {
  const [score, setScore] = useState(700); // Start with average credit score
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [currentEvent, setCurrentEvent] = useState<CreditEvent | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'good' | 'bad' | 'neutral' } | null>(null);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 700) return { text: 'Good', color: 'text-blue-600' };
    if (score >= 650) return { text: 'Fair', color: 'text-yellow-600' };
    if (score >= 600) return { text: 'Poor', color: 'text-orange-600' };
    return { text: 'Very Poor', color: 'text-red-600' };
  };

  const handleChoice = useCallback((choice: { impact: number; explanation: string }) => {
    setScore(prev => Math.max(300, Math.min(850, prev + choice.impact)));
    setFeedback({
      message: choice.explanation,
      type: choice.impact > 0 ? 'good' : choice.impact < 0 ? 'bad' : 'neutral'
    });

    setDecisions(prev => [...prev, currentEvent?.description || '']);
    setTotalEvents(prev => prev + 1);

    // Move to next round after a short delay
    setTimeout(() => {
      setRound(prev => prev + 1);
      setCurrentEvent(null);
      setFeedback(null);

      // End game after 5 events
      if (round >= 5) {
        endGame();
      } else {
        // Get next event
        const availableEvents = creditEvents.filter(e => !decisions.includes(e.description));
        if (availableEvents.length > 0) {
          const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
          setCurrentEvent(randomEvent);
        }
      }
    }, 2500);
  }, [currentEvent, decisions, round]);

  const startGame = () => {
    setGameState('playing');
    setScore(700);
    setRound(1);
    setTotalEvents(0);
    setDecisions([]);

    // Start with first random event
    const firstEvent = creditEvents[Math.floor(Math.random() * creditEvents.length)];
    setCurrentEvent(firstEvent);
  };

  const endGame = () => {
    setGameState('ended');
    const finalScore = Math.round(score);
    onComplete(finalScore, {
      creditScore: finalScore,
      decisions: totalEvents,
      improvement: finalScore - 700
    });
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">💳</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Credit Defender Challenge!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
            Make smart financial decisions to protect and improve your credit score!
            Start with a 700 credit score and see how your choices affect it.
          </p>
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
            <p className="text-sm text-purple-800">
              <strong>Learning Goal:</strong> Understand how payment history, credit utilization,
              and financial decisions impact your credit score.
            </p>
          </div>
          <button onClick={startGame} className="game-arcade-btn w-full max-w-md text-2xl">
            Start Challenge
          </button>
          <button onClick={onExit} className="w-full max-w-md text-lg mt-2 border-2 bg-white text-purple-700 font-bold border-purple-300 hover:bg-purple-50 transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const rating = getCreditScoreRating(score);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">
            {score >= 750 ? '🏆' : score >= 700 ? '🌟' : score >= 650 ? '⚠️' : '💔'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Credit Challenge Complete!</h2>

          <div className="text-center space-y-4">
            <div className={`text-3xl font-bold ${rating.color}`}>
              Credit Score: {Math.round(score)}
            </div>
            <div className={`text-xl ${rating.color}`}>
              Rating: {rating.text}
            </div>
            <div className="text-lg text-muted-foreground">
              Change: {score >= 700 ? '+' : ''}{Math.round(score - 700)} points
            </div>
          </div>

          <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
            <p className="text-sm text-purple-800 text-center">
              {score >= 750 ? 'Outstanding! You\'re a credit management expert!' :
               score >= 700 ? 'Great job! You maintained excellent credit!' :
               score >= 650 ? 'Good effort! Consider improving your payment habits.' :
               'Keep learning! Credit management takes practice.'}
            </p>
          </div>

          <div className="flex gap-4">
            <button onClick={startGame} className="game-arcade-btn px-8 py-3 text-lg">
              Try Again
            </button>
            <button onClick={onExit} className="w-full max-w-md text-lg px-8 py-3 border-2 bg-white text-purple-700 font-bold border-purple-300 hover:bg-purple-50 transition">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rating = getCreditScoreRating(score);

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl">💳</span>
          <div>
            <h2 className="text-2xl font-bold">Credit Defender</h2>
            <p className="text-sm text-muted-foreground">Round {round} of 5</p>
          </div>
        </div>
      </div>

      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className={`text-2xl font-bold ${rating.color}`}>{Math.round(score)}</div>
          <div className="text-xs text-muted-foreground">Credit Score</div>
        </div>
        <div className="game-arcade-stat">
          <div className={`text-lg font-semibold ${rating.color}`}>{rating.text}</div>
          <div className="text-xs text-muted-foreground">Rating</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
          <div className="text-xs text-muted-foreground">Decisions Made</div>
        </div>
      </div>

      <div className="game-arcade-content">
        {currentEvent && (
          <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              {currentEvent.type === 'payment' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {currentEvent.type === 'purchase' && <TrendingUp className="w-5 h-5 text-blue-500" />}
              {currentEvent.type === 'emergency' && <Shield className="w-5 h-5 text-red-500" />}
              {currentEvent.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-green-500" />}
              <h3 className="text-lg font-semibold">Credit Decision Needed</h3>
            </div>

            <p className="text-lg text-gray-800 mb-6">{currentEvent.description}</p>

            <div className="space-y-3">
              {currentEvent.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  disabled={!!feedback}
                >
                  <div className="font-medium text-gray-800">{choice.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {feedback && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            feedback.type === 'good' ? 'bg-green-50 border-green-300 text-green-800' :
            feedback.type === 'bad' ? 'bg-red-50 border-red-300 text-red-800' :
            'bg-blue-50 border-blue-300 text-blue-800'
          }`}>
            <p className="font-medium">{feedback.message}</p>
          </div>
        )}
      </div>

      <div className="game-arcade-actions">
        <button onClick={onExit} className="game-arcade-btn bg-gray-500 hover:bg-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Challenge
        </button>
      </div>
    </div>
  );
}
