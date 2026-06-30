import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Storefront } from '@phosphor-icons/react';
import { TrendingUp, AlertTriangle, DollarSign, ArrowLeft } from '@/lib/lucide';

interface BusinessBuilder2DProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

interface BusinessDecision {
  id: number;
  title: string;
  description: string;
  cost: number;
  potentialReturn: number;
  risk: 'low' | 'medium' | 'high';
  category: 'marketing' | 'product' | 'operations' | 'hr';
  timeToImplement: number;
}

const businessDecisions: BusinessDecision[] = [
  {
    id: 1,
    title: 'Social Media Campaign',
    description: 'Launch targeted ads on social media platforms',
    cost: 50,
    potentialReturn: 120,
    risk: 'low',
    category: 'marketing',
    timeToImplement: 1
  },
  {
    id: 2,
    title: 'New Equipment',
    description: 'Upgrade production equipment for better efficiency',
    cost: 200,
    potentialReturn: 300,
    risk: 'medium',
    category: 'operations',
    timeToImplement: 2
  },
  {
    id: 3,
    title: 'Hire Sales Team',
    description: 'Expand your sales team to reach more customers',
    cost: 150,
    potentialReturn: 250,
    risk: 'medium',
    category: 'hr',
    timeToImplement: 2
  },
  {
    id: 4,
    title: 'Product Development',
    description: 'Research and develop new product lines',
    cost: 100,
    potentialReturn: 400,
    risk: 'high',
    category: 'product',
    timeToImplement: 3
  },
  {
    id: 5,
    title: 'Customer Service Training',
    description: 'Train staff to improve customer satisfaction',
    cost: 30,
    potentialReturn: 80,
    risk: 'low',
    category: 'hr',
    timeToImplement: 1
  },
  {
    id: 6,
    title: 'Email Marketing',
    description: 'Build and engage with email subscriber list',
    cost: 25,
    potentialReturn: 60,
    risk: 'low',
    category: 'marketing',
    timeToImplement: 1
  },
  {
    id: 7,
    title: 'Office Expansion',
    description: 'Move to a larger location to accommodate growth',
    cost: 300,
    potentialReturn: 500,
    risk: 'high',
    category: 'operations',
    timeToImplement: 3
  },
  {
    id: 8,
    title: 'Quality Control System',
    description: 'Implement better quality control to reduce returns',
    cost: 75,
    potentialReturn: 150,
    risk: 'low',
    category: 'operations',
    timeToImplement: 2
  }
];

interface RandomEvent {
  title: string;
  description: string;
  impact: number;
  type: 'positive' | 'negative' | 'neutral';
}

const randomEvents: RandomEvent[] = [
  { title: 'Economic Boom', description: 'Strong economy boosts sales', impact: +50, type: 'positive' },
  { title: 'Competitor Opens', description: 'New competitor opens nearby', impact: -30, type: 'negative' },
  { title: 'Viral Marketing', description: 'Your business goes viral online', impact: +80, type: 'positive' },
  { title: 'Supply Chain Issues', description: 'Supplier delays increase costs', impact: -40, type: 'negative' },
  { title: 'Great Review', description: 'Positive review brings new customers', impact: +25, type: 'positive' },
  { title: 'Equipment Failure', description: 'Critical equipment needs repair', impact: -60, type: 'negative' },
  { title: 'Tax Incentive', description: 'Local government offers business tax break', impact: +35, type: 'positive' },
  { title: 'Rising Costs', description: 'Inflation increases operating costs', impact: -25, type: 'negative' }
];

export default function BusinessBuilder2D({ onComplete, onExit, userTier = 'middle' }: BusinessBuilder2DProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [capital, setCapital] = useState(500);
  const [monthlyRevenue, setMonthlyRevenue] = useState(100);
  const [monthlyExpenses, setMonthlyExpenses] = useState(80);
  const [month, setMonth] = useState(1);
  const [decisions, setDecisions] = useState<BusinessDecision[]>([]);
  const [eventHistory, setEventHistory] = useState<string[]>([]);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [availableDecisions, setAvailableDecisions] = useState<BusinessDecision[]>(businessDecisions.slice(0, 4));

  const netProfit = monthlyRevenue - monthlyExpenses;

  const handleDecision = useCallback((decision: BusinessDecision) => {
    if (capital < decision.cost) {
      setGameMessage('Insufficient capital for this decision!');
      setTimeout(() => setGameMessage(''), 2000);
      return;
    }

    // Calculate outcome based on risk
    const successChance = decision.risk === 'low' ? 0.9 : decision.risk === 'medium' ? 0.7 : 0.5;
    const isSuccessful = Math.random() < successChance;

    const actualReturn = isSuccessful ? decision.potentialReturn : decision.potentialReturn * 0.3;

    setCapital(prev => prev - decision.cost);
    setMonthlyRevenue(prev => prev + (actualReturn / decision.timeToImplement));
    setMonthlyExpenses(prev => prev + (decision.cost * 0.1)); // Ongoing maintenance

    setDecisions(prev => [...prev, decision]);
    setEventHistory(prev => [...prev, `${decision.title}: ${isSuccessful ? 'Success' : 'Partial success'} - $${Math.round(actualReturn)} revenue`]);

    // Trigger random event occasionally
    if (Math.random() < 0.3) {
      triggerRandomEvent();
    }

    // Next month
    nextMonth();
  }, [capital]);

  const triggerRandomEvent = useCallback(() => {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    setMonthlyRevenue(prev => prev + (event.impact * 0.3)); // Spread impact over time
    setCapital(prev => Math.max(0, prev + event.impact));
    setEventHistory(prev => [...prev, `${event.title}: ${event.description} - $${event.impact}`]);
    setGameMessage(event.title);
    setTimeout(() => setGameMessage(''), 3000);
  }, []);

  const nextMonth = useCallback(() => {
    const profit = netProfit;
    setCapital(prev => prev + profit);
    setMonth(prev => prev + 1);

    // Add new decision options
    if (month % 2 === 0 && availableDecisions.length < businessDecisions.length) {
      setAvailableDecisions(prev => {
        const nextDecision = businessDecisions[prev.length];
        return prev.length < businessDecisions.length ? [...prev, nextDecision] : prev;
      });
    }

    // Check win/lose conditions
    if (capital < 0) {
      endGame();
    } else if (month >= 12 || capital >= 5000) {
      endGame();
    }
  }, [netProfit, month, capital, availableDecisions.length]);

  const startGame = () => {
    setGameState('playing');
    setCapital(500);
    setMonthlyRevenue(100);
    setMonthlyExpenses(80);
    setMonth(1);
    setDecisions([]);
    setEventHistory([]);
    setAvailableDecisions(businessDecisions.slice(0, 4));
  };

  const endGame = () => {
    setGameState('ended');
    const finalScore = Math.max(0, Math.round(capital));
    onComplete(finalScore, {
      months: month,
      decisions: decisions.length,
      finalRevenue: Math.round(monthlyRevenue),
      profit: Math.round(netProfit)
    });
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-100 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">🏪</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Business Builder Challenge!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
            Build and grow your business over 12 months! Make smart investment decisions,
            manage risks, and grow your capital to $5,000 to win.
          </p>
          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
            <p className="text-sm text-yellow-800">
              <strong>Learning Goal:</strong> Understand business investment, risk management,
              and strategic decision-making in entrepreneurship.
            </p>
          </div>
          <Button onClick={startGame} className="game-arcade-btn w-full max-w-md text-2xl">
            <Storefront className="w-6 h-6 mr-3" />
            Start Building
          </Button>
          <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg mt-2 border-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const success = capital >= 5000;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-100 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">
            {success ? '🏆' : capital > 1000 ? '⭐' : '💼'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            {success ? 'Business Tycoon!' : 'Business Journey Complete!'}
          </h2>

          <div className="text-center space-y-4">
            <div className={`text-3xl font-bold ${success ? 'text-green-600' : 'text-blue-600'}`}>
              Final Capital: ${Math.round(capital)}
            </div>
            <div className="text-xl text-muted-foreground">
              {success ? 'You reached your $5,000 goal!' : `Goal: $5,000 (${Math.round((capital/5000)*100)}% achieved)`}
            </div>
            <div className="text-lg text-muted-foreground">
              Months in Business: {month} | Decisions Made: {decisions.length}
            </div>
            <div className={`text-lg font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Monthly Profit: ${Math.round(netProfit)}
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
            <p className="text-sm text-yellow-800 text-center">
              {success ? 'Outstanding entrepreneurship! You\'ve mastered business strategy!' :
               capital > 1000 ? 'Good business instincts! Keep refining your strategy!' :
               'Building a business takes practice. Learn from each decision!'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={startGame} className="game-arcade-btn px-8 py-3 text-lg">
              Try Again
            </Button>
            <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg px-8 py-3 border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl">🏪</span>
          <div>
            <h2 className="text-2xl font-bold">Business Builder</h2>
            <p className="text-sm text-muted-foreground">Month {month} of 12</p>
          </div>
        </div>
      </div>

      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className={`text-2xl font-bold ${capital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.round(capital)}
          </div>
          <div className="text-xs text-muted-foreground">Capital</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">${Math.round(monthlyRevenue)}</div>
          <div className="text-xs text-muted-foreground">Monthly Revenue</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-orange-600">${Math.round(monthlyExpenses)}</div>
          <div className="text-xs text-muted-foreground">Monthly Expenses</div>
        </div>
        <div className="game-arcade-stat">
          <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.round(netProfit)}
          </div>
          <div className="text-xs text-muted-foreground">Monthly Profit</div>
        </div>
      </div>

      {gameMessage && (
        <div className="mb-6 p-4 rounded-lg bg-blue-100 border-2 border-blue-300 text-center">
          <p className="text-blue-800 font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {gameMessage}
          </p>
        </div>
      )}

      <div className="game-arcade-content">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Business Opportunities
          </h3>

          <div className="grid gap-4">
            {availableDecisions.map((decision) => {
              const canAfford = capital >= decision.cost;
              const riskColor = decision.risk === 'low' ? 'text-green-600' :
                               decision.risk === 'medium' ? 'text-yellow-600' : 'text-red-600';

              return (
                <div
                  key={decision.id}
                  className={`p-4 rounded-lg border-2 ${
                    canAfford ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50' :
                    'border-gray-200 opacity-50 cursor-not-allowed'
                  } transition-all duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{decision.title}</h4>
                    <div className="text-right">
                      <div className="font-bold text-gray-700">-${decision.cost}</div>
                      <div className={`text-sm ${riskColor}`}>{decision.risk} risk</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{decision.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Category: {decision.category} | {decision.timeToImplement} month(s)
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Potential: +${decision.potentialReturn} revenue
                    </div>
                  </div>
                  <button
                    onClick={() => handleDecision(decision)}
                    disabled={!canAfford}
                    className={`mt-3 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      canAfford ?
                      'bg-blue-500 text-white hover:bg-blue-600' :
                      'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Invest' : 'Insufficient Capital'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {eventHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Recent Events
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {eventHistory.slice(-3).map((event, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="game-arcade-actions">
        <button onClick={onExit} className="game-arcade-btn bg-gray-500 hover:bg-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Business
        </button>
      </div>
    </div>
  );
}
