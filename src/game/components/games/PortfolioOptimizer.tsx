import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, PieChart, Target, Brain } from '@/lib/lucide';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioOptimizerProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: 'stocks' | 'bonds' | 'realestate' | 'commodities' | 'crypto';
  risk: 'low' | 'medium' | 'high';
  expectedReturn: number;
  volatility: number;
  currentAllocation: number;
  minAllocation: number;
  maxAllocation: number;
  cost: number;
}

interface MarketScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // quarters
  marketConditions: {
    growth: number;
    volatility: number;
    interest: number;
    inflation: number;
  };
}

interface OptimizationGoal {
  id: string;
  name: string;
  description: string;
  targetReturn: number;
  maxRisk: number;
  constraints: string[];
  points: number;
}

const assets: Asset[] = [
  {
    id: 'snp500',
    name: 'S&P 500 Index',
    symbol: 'SPY',
    category: 'stocks',
    risk: 'high',
    expectedReturn: 10.5,
    volatility: 15.2,
    currentAllocation: 40,
    minAllocation: 0,
    maxAllocation: 80,
    cost: 0.03
  },
  {
    id: 'bonds',
    name: 'Government Bonds',
    symbol: 'BND',
    category: 'bonds',
    risk: 'low',
    expectedReturn: 4.2,
    volatility: 3.8,
    currentAllocation: 30,
    minAllocation: 10,
    maxAllocation: 60,
    cost: 0.015
  },
  {
    id: 'realestate',
    name: 'Real Estate ETF',
    symbol: 'REIT',
    category: 'realestate',
    risk: 'medium',
    expectedReturn: 7.8,
    volatility: 12.5,
    currentAllocation: 15,
    minAllocation: 0,
    maxAllocation: 30,
    cost: 0.08
  },
  {
    id: 'commodities',
    name: 'Commodities Index',
    symbol: 'GCC',
    category: 'commodities',
    risk: 'medium',
    expectedReturn: 6.5,
    volatility: 18.3,
    currentAllocation: 10,
    minAllocation: 0,
    maxAllocation: 25,
    cost: 0.12
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency Index',
    symbol: 'CRYPTO',
    category: 'crypto',
    risk: 'high',
    expectedReturn: 25.4,
    volatility: 45.8,
    currentAllocation: 5,
    minAllocation: 0,
    maxAllocation: 15,
    cost: 0.25
  }
];

const optimizationGoals: OptimizationGoal[] = [
  {
    id: 'balanced',
    name: 'Balanced Growth',
    description: 'Achieve steady growth with moderate risk tolerance',
    targetReturn: 8.5,
    maxRisk: 12,
    constraints: ['Bonds ≥ 20%', 'Stocks ≤ 60%', 'Max 25% in high-risk assets'],
    points: 100
  },
  {
    id: 'aggressive',
    name: 'Aggressive Growth',
    description: 'Maximize returns with higher risk tolerance',
    targetReturn: 12.0,
    maxRisk: 18,
    constraints: ['Stocks ≥ 50%', 'Crypto ≤ 15%', 'At least 10% in commodities'],
    points: 150
  },
  {
    id: 'conservative',
    name: 'Conservative Income',
    description: 'Preserve capital with steady income generation',
    targetReturn: 5.5,
    maxRisk: 8,
    constraints: ['Bonds ≥ 40%', 'High-risk ≤ 10%', 'No more than 20% growth assets'],
    points: 75
  }
];

const marketScenarios: MarketScenario[] = [
  {
    id: 'normal',
    name: 'Normal Market',
    description: 'Stable economic conditions with moderate growth',
    duration: 4,
    marketConditions: { growth: 2.5, volatility: 1.0, interest: 3.0, inflation: 2.0 }
  },
  {
    id: 'bull',
    name: 'Bull Market',
    description: 'Strong economic expansion and investor confidence',
    duration: 3,
    marketConditions: { growth: 4.5, volatility: 0.8, interest: 4.5, inflation: 2.5 }
  },
  {
    id: 'bear',
    name: 'Bear Market',
    description: 'Economic contraction with heightened volatility',
    duration: 2,
    marketConditions: { growth: -1.5, volatility: 2.0, interest: 1.5, inflation: 1.8 }
  }
];

export default function PortfolioOptimizer({ onComplete, onExit, userTier = 'middle' }: PortfolioOptimizerProps) {
  const [gameState, setGameState] = useState<'ready' | 'analyzing' | 'simulating' | 'ended'>('ready');
  const [selectedGoal, setSelectedGoal] = useState<OptimizationGoal | null>(null);
  const [portfolio, setPortfolio] = useState<Asset[]>(assets.map(asset => ({ ...asset })));
  const [currentScenario, setCurrentScenario] = useState<MarketScenario | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<'allocation' | 'risk' | 'optimization'>('allocation');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [simulationResults, setSimulationResults] = useState<{
    totalReturn: number;
    riskLevel: number;
    sharpeRatio: number;
    maxDrawdown: number;
  } | null>(null);

  const calculatePortfolioMetrics = useCallback((currentPortfolio: Asset[]) => {
    const totalAllocation = currentPortfolio.reduce((sum, asset) => sum + asset.currentAllocation, 0);
    const weightedReturn = currentPortfolio.reduce((sum, asset) =>
      sum + (asset.expectedReturn * asset.currentAllocation / 100), 0) / 100;
    const weightedVolatility = Math.sqrt(
      currentPortfolio.reduce((sum, asset) =>
        sum + Math.pow(asset.volatility * asset.currentAllocation / 100, 2), 0
      )
    );
    const totalCost = currentPortfolio.reduce((sum, asset) =>
      sum + (asset.cost * asset.currentAllocation / 100), 0);

    return {
      totalAllocation,
      expectedReturn: weightedReturn,
      risk: weightedVolatility,
      totalCost,
      sharpeRatio: weightedReturn / weightedVolatility
    };
  }, []);

  const checkConstraints = useCallback((currentPortfolio: Asset[], goal: OptimizationGoal) => {
    const violations: string[] = [];
    const metrics = calculatePortfolioMetrics(currentPortfolio);

    // Check return target
    if (metrics.expectedReturn < goal.targetReturn) {
      violations.push(`Expected return ${metrics.expectedReturn.toFixed(1)}% is below target ${goal.targetReturn}%`);
    }

    // Check risk limit
    if (metrics.risk > goal.maxRisk) {
      violations.push(`Portfolio risk ${metrics.risk.toFixed(1)}% exceeds limit ${goal.maxRisk}%`);
    }

    // Check specific constraints
    goal.constraints.forEach(constraint => {
      if (constraint.includes('Bonds')) {
        const minBonds = parseInt(constraint.match(/(\d+)%/)?.[1] || '0');
        const bondsAllocation = currentPortfolio.find(a => a.category === 'bonds')?.currentAllocation || 0;
        if (bondsAllocation < minBonds) {
          violations.push(`Bond allocation ${bondsAllocation}% is below minimum ${minBonds}%`);
        }
      }

      if (constraint.includes('Stocks')) {
        const maxStocks = parseInt(constraint.match(/(\d+)%/)?.[1] || '100');
        const stocksAllocation = currentPortfolio.find(a => a.category === 'stocks')?.currentAllocation || 0;
        if (stocksAllocation > maxStocks) {
          violations.push(`Stock allocation ${stocksAllocation}% exceeds maximum ${maxStocks}%`);
        }
      }

      if (constraint.includes('high-risk')) {
        const maxHighRisk = parseInt(constraint.match(/(\d+)%/)?.[1] || '100');
        const highRiskAllocation = currentPortfolio
          .filter(a => a.risk === 'high')
          .reduce((sum, a) => sum + a.currentAllocation, 0);
        if (highRiskAllocation > maxHighRisk) {
          violations.push(`High-risk allocation ${highRiskAllocation}% exceeds maximum ${maxHighRisk}%`);
        }
      }
    });

    return violations;
  }, [calculatePortfolioMetrics]);

  const handleAllocationChange = useCallback((assetId: string, newAllocation: number) => {
    setPortfolio(prev => {
      const updated = prev.map(asset =>
        asset.id === assetId
          ? {
              ...asset,
              currentAllocation: Math.max(asset.minAllocation, Math.min(asset.maxAllocation, newAllocation))
            }
          : asset
      );

      // Ensure total allocation doesn't exceed 100%
      const total = updated.reduce((sum, asset) => sum + asset.currentAllocation, 0);
      if (total > 100) {
        const excess = total - 100;
        const otherAssets = updated.filter(a => a.id !== assetId && a.currentAllocation > a.minAllocation);
        const reductionPerAsset = excess / otherAssets.length;

        return updated.map(asset => {
          if (asset.id !== assetId && asset.currentAllocation > asset.minAllocation) {
            return {
              ...asset,
              currentAllocation: Math.max(asset.minAllocation, asset.currentAllocation - reductionPerAsset)
            };
          }
          return asset;
        });
      }

      return updated;
    });
  }, []);

  const runSimulation = useCallback(() => {
    if (!selectedGoal || !currentScenario) return;

    const metrics = calculatePortfolioMetrics(portfolio);
    const scenarioMultiplier = currentScenario.marketConditions.growth / 2.5; // Normalize to normal market

    const totalReturn = metrics.expectedReturn * scenarioMultiplier;
    const scenarioVolatility = metrics.risk * currentScenario.marketConditions.volatility;
    const maxDrawdown = scenarioVolatility * 0.8; // Approximate max drawdown

    const results = {
      totalReturn,
      riskLevel: scenarioVolatility,
      sharpeRatio: totalReturn / scenarioVolatility,
      maxDrawdown
    };

    setSimulationResults(results);

    // Calculate score
    let points = selectedGoal.points;
    const violations = checkConstraints(portfolio, selectedGoal);

    if (violations.length > 0) {
      points -= violations.length * 20;
      setFeedback(['Portfolio violates constraints:', ...violations]);
    } else {
      setFeedback(['Portfolio meets all constraints!']);
      // Bonus for optimization
      if (Math.abs(totalReturn - selectedGoal.targetReturn) < 0.5) {
        points += 50;
        setFeedback(prev => [...prev, 'Perfect return optimization! +50 points']);
      }
      if (scenarioVolatility <= selectedGoal.maxRisk * 0.8) {
        points += 25;
        setFeedback(prev => [...prev, 'Excellent risk management! +25 points']);
      }
    }

    setScore(Math.max(0, points));
  }, [selectedGoal, currentScenario, portfolio, calculatePortfolioMetrics, checkConstraints]);

  const startOptimization = (goal: OptimizationGoal) => {
    setSelectedGoal(goal);
    setGameState('analyzing');
    setAnalysisPhase('allocation');
    setFeedback([]);
    setSimulationResults(null);
  };

  const nextPhase = () => {
    if (analysisPhase === 'allocation') {
      setAnalysisPhase('risk');
    } else if (analysisPhase === 'risk') {
      setAnalysisPhase('optimization');
    } else if (analysisPhase === 'optimization') {
      setGameState('simulating');
      setCurrentScenario(marketScenarios[0]);
      setTimeout(() => runSimulation(), 2000);
    }
  };

  const completeGame = () => {
    setGameState('ended');
    onComplete(score, {
      goal: selectedGoal?.id,
      portfolioReturn: simulationResults?.totalReturn,
      riskLevel: simulationResults?.riskLevel,
      sharpeRatio: simulationResults?.sharpeRatio,
      violations: checkConstraints(portfolio, selectedGoal!).length
    });
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="w-full max-w-4xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">📊</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Portfolio Optimizer!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-2xl">
            Master the art of portfolio optimization! Balance risk and return, analyze market scenarios,
            and build the perfect investment strategy using advanced financial analytics.
          </p>
          <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
            <p className="text-sm text-blue-800">
              <strong>Strategist Special:</strong> Perfect for analytical thinkers who love data-driven optimization!
            </p>
          </div>

          <div className="grid gap-6 w-full max-w-2xl">
            <h3 className="text-2xl font-semibold text-center">Choose Your Optimization Goal:</h3>
            {optimizationGoals.map(goal => (
              <div key={goal.id} className="bg-white p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold">{goal.name}</h4>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {goal.points} points
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{goal.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  🎯 Target: {goal.targetReturn}% return | ⚠️ Max risk: {goal.maxRisk}%
                </div>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-2">Constraints:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {goal.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => startOptimization(goal)}
                  className="w-full game-arcade-btn"
                >
                  Begin Optimization
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg border-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const success = score >= selectedGoal!.points;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="w-full max-w-4xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">
            {success ? '🏆' : score >= selectedGoal!.points * 0.8 ? '📈' : '📊'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            {success ? 'Portfolio Master!' : 'Optimization Complete!'}
          </h2>

          <div className="text-center space-y-4">
            <div className={`text-3xl font-bold ${success ? 'text-green-600' : 'text-blue-600'}`}>
              Final Score: {score} / {selectedGoal!.points}
            </div>
            {simulationResults && (
              <>
                <div className="text-xl text-muted-foreground">
                  Portfolio Return: {simulationResults.totalReturn.toFixed(1)}%
                </div>
                <div className="text-lg text-muted-foreground">
                  Risk Level: {simulationResults.riskLevel.toFixed(1)}% | Sharpe Ratio: {simulationResults.sharpeRatio.toFixed(2)}
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
            <p className="text-sm text-blue-800 text-center">
              {success ? 'Outstanding analytical skills! You\'ve mastered portfolio optimization!' :
               score >= selectedGoal!.points * 0.8 ? 'Great analysis! Fine-tune your approach for perfection!' :
               'Good foundation! Study the constraints and try again!'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setGameState('ready')} className="game-arcade-btn px-8 py-3 text-lg">
              Try Another Goal
            </Button>
            <Button onClick={onExit} variant="outline" className="px-8 py-3 text-lg border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = calculatePortfolioMetrics(portfolio);

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl">📊</span>
          <div>
            <h2 className="text-2xl font-bold">Portfolio Optimizer</h2>
            <p className="text-sm text-muted-foreground">
              {selectedGoal?.name} - {gameState === 'simulating' ? 'Simulating...' : `Phase: ${analysisPhase}`}
            </p>
          </div>
        </div>
      </div>

      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">{metrics.expectedReturn.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Expected Return</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-red-600">{metrics.risk.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Portfolio Risk</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">{metrics.sharpeRatio.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-orange-600">{metrics.totalCost.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">Total Cost</div>
        </div>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="mb-6 space-y-2">
          {feedback.map((message, index) => (
            <div key={index} className={`p-3 rounded-lg border-2 ${
              message.includes('Perfect') || message.includes('Excellent') || message.includes('meets') ?
              'bg-green-50 border-green-300 text-green-800' :
              'bg-red-50 border-red-300 text-red-800'
            }`}>
              <p className="font-medium text-sm">{message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="game-arcade-content">
        {/* Allocation Editor */}
        {analysisPhase === 'allocation' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Asset Allocation
            </h3>
            <div className="space-y-4">
              {portfolio.map(asset => (
                <div key={asset.id} className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-semibold">{asset.name}</h4>
                      <p className="text-sm text-gray-600">{asset.symbol} • {asset.category} • {asset.risk} risk</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{asset.currentAllocation}%</div>
                      <div className="text-sm text-gray-600">Exp: {asset.expectedReturn}% • Vol: {asset.volatility}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">0%</span>
                    <input
                      type="range"
                      min={asset.minAllocation}
                      max={asset.maxAllocation}
                      value={asset.currentAllocation}
                      onChange={(e) => handleAllocationChange(asset.id, parseInt(e.target.value))}
                      className="flex-1"
                      aria-label={`${asset.name} allocation percentage`}
                      title={`${asset.name} allocation: ${asset.currentAllocation}%`}
                    />
                    <span className="text-sm">100%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Range: {asset.minAllocation}% - {asset.maxAllocation}% | Cost: {asset.cost}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Analysis */}
        {analysisPhase === 'risk' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-500" />
              Risk Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg border-2 border-red-200">
                <h4 className="font-semibold mb-2">Portfolio Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Allocation:</span>
                    <span className="font-medium">{metrics.totalAllocation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Return:</span>
                    <span className="font-medium">{metrics.expectedReturn.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portfolio Risk:</span>
                    <span className="font-medium">{metrics.risk.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio:</span>
                    <span className="font-medium">{metrics.sharpeRatio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
                <h4 className="font-semibold mb-2">Goal Constraints</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Target Return:</span>
                    <span className="font-medium">{selectedGoal?.targetReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Risk:</span>
                    <span className="font-medium">{selectedGoal?.maxRisk}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      metrics.expectedReturn >= selectedGoal!.targetReturn && metrics.risk <= selectedGoal!.maxRisk
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.expectedReturn >= selectedGoal!.targetReturn && metrics.risk <= selectedGoal!.maxRisk
                        ? 'On Track' : 'Needs Adjustment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Preview */}
        {analysisPhase === 'optimization' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Optimization Preview
            </h3>
            <div className="bg-white p-6 rounded-lg border-2 border-green-200">
              <h4 className="font-semibold mb-3">Final Portfolio Analysis</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.expectedReturn.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Expected Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.risk.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Portfolio Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.sharpeRatio.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Sharpe Ratio</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h5 className="font-medium mb-2">Constraint Check:</h5>
                {checkConstraints(portfolio, selectedGoal!).length === 0 ? (
                  <p className="text-green-600 text-sm">✓ All constraints satisfied</p>
                ) : (
                  <div className="space-y-1">
                    {checkConstraints(portfolio, selectedGoal!).map((violation, index) => (
                      <p key={index} className="text-red-600 text-sm">✗ {violation}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simulation Results */}
        {gameState === 'simulating' && simulationResults && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Simulation Results
            </h3>
            <div className="bg-white p-6 rounded-lg border-2 border-green-200">
              <h4 className="font-semibold mb-2">{currentScenario?.name} Scenario</h4>
              <p className="text-sm text-gray-600 mb-4">{currentScenario?.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{simulationResults.totalReturn.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Simulated Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{simulationResults.riskLevel.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Risk Level</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-arcade-actions">
        {gameState === 'analyzing' && (
          <button onClick={nextPhase} className="game-arcade-btn bg-blue-500 hover:bg-blue-600">
            {analysisPhase === 'allocation' ? 'Analyze Risk' :
             analysisPhase === 'risk' ? 'Preview Optimization' :
             'Run Simulation'}
          </button>
        )}
        {gameState === 'simulating' && (
          <button onClick={completeGame} className="game-arcade-btn bg-green-500 hover:bg-green-600">
            Complete Analysis
          </button>
        )}
        <button onClick={onExit} className="game-arcade-btn bg-gray-500 hover:bg-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </button>
      </div>
    </div>
  );
}