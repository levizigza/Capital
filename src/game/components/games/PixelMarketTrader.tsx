import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, DollarSign, Bitcoin, Package,
  Clock, AlertTriangle, Trophy, Zap, Shield, Target
} from '@/lib/lucide';
import { ArrowLeft, RefreshCw, Info } from '@/lib/lucide';

interface PixelMarketTraderProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

interface Asset {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  previousPrice: number;
  volatility: number;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  category: 'cryptocurrency' | 'gaming' | 'tech' | 'commodities';
  history: number[];
}

interface Trade {
  id: string;
  assetId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  profit?: number;
}

interface NewsEvent {
  id: string;
  title: string;
  description: string;
  impact: { [key: string]: number }; // assetId: priceChange
  type: 'positive' | 'negative' | 'neutral';
  emoji: string;
}

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'pixelcoin',
    name: 'PixelCoin',
    icon: <Bitcoin className="w-5 h-5" />,
    price: 100,
    previousPrice: 100,
    volatility: 0.15,
    description: 'The original cryptocurrency of the pixel world',
    rarity: 'common',
    category: 'cryptocurrency',
    history: [100]
  },
  {
    id: 'gaming-token',
    name: 'Gaming Token',
    icon: <Package className="w-5 h-5" />,
    price: 50,
    previousPrice: 50,
    volatility: 0.12,
    description: 'Tokens used in popular retro games',
    rarity: 'common',
    category: 'gaming',
    history: [50]
  },
  {
    id: 'tech-stock',
    name: 'TechStock',
    icon: <TrendingUp className="w-5 h-5" />,
    price: 200,
    previousPrice: 200,
    volatility: 0.08,
    description: 'Shares in the biggest tech company',
    rarity: 'uncommon',
    category: 'tech',
    history: [200]
  },
  {
    id: 'diamond-shards',
    name: 'Diamond Shards',
    icon: <Zap className="w-5 h-5" />,
    price: 500,
    previousPrice: 500,
    volatility: 0.20,
    description: 'Rare gaming commodity with high demand',
    rarity: 'rare',
    category: 'commodities',
    history: [500]
  },
  {
    id: 'nft-art',
    name: 'Pixel NFT',
    icon: <Trophy className="w-5 h-5" />,
    price: 1000,
    previousPrice: 1000,
    volatility: 0.25,
    description: 'Unique digital art pieces',
    rarity: 'legendary',
    category: 'gaming',
    history: [1000]
  }
];

const NEWS_EVENTS: NewsEvent[] = [
  {
    id: 'news-1',
    title: 'Major Gaming Tournament Announced!',
    description: 'The biggest retro gaming tournament will use Gaming Tokens as prizes',
    impact: { 'gaming-token': 0.3 },
    type: 'positive',
    emoji: '🎮'
  },
  {
    id: 'news-2',
    title: 'Tech Company Releases Breakthrough Product',
    description: 'Innovation expected to boost tech stocks significantly',
    impact: { 'tech-stock': 0.25 },
    type: 'positive',
    emoji: '💡'
  },
  {
    id: 'news-3',
    title: 'Market Regulation Changes',
    description: 'New regulations affect cryptocurrency trading',
    impact: { 'pixelcoin': -0.2, 'nft-art': -0.15 },
    type: 'negative',
    emoji: '⚠️'
  },
  {
    id: 'news-4',
    title: 'Diamond Mining Discovery',
    description: 'New diamond mining areas discovered, increasing supply',
    impact: { 'diamond-shards': -0.1 },
    type: 'negative',
    emoji: '💎'
  },
  {
    id: 'news-5',
    title: 'NFT Marketplace Partnership',
    description: 'Major platform announces partnership with Pixel NFT creators',
    impact: { 'nft-art': 0.4 },
    type: 'positive',
    emoji: '🎨'
  }
];

export default function PixelMarketTrader({ onComplete, onExit, userTier = 'middle' }: PixelMarketTraderProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [balance, setBalance] = useState(1000);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [round, setRound] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [currentNews, setCurrentNews] = useState<NewsEvent[]>([]);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [score, setScore] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);

  const maxRounds = 10;

  // Initialize game
  const startGame = useCallback(() => {
    setGameState('playing');
    setBalance(1000);
    setAssets(INITIAL_ASSETS.map(asset => ({ ...asset, history: [asset.price] })));
    setPortfolio({});
    setTrades([]);
    setRound(1);
    setSelectedAsset(null);
    setTradeAmount(1);
    setCurrentNews([]);
    setGameMessage('Welcome to Pixel Market Trader! Buy and sell assets to grow your portfolio!');
    setScore(0);
    setTotalProfitLoss(0);
  }, []);

  // Generate random news events
  const generateNews = useCallback(() => {
    const numEvents = Math.floor(Math.random() * 3) + 1;
    const selectedEvents: NewsEvent[] = [];

    for (let i = 0; i < numEvents; i++) {
      const randomEvent = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
      if (!selectedEvents.find(e => e.id === randomEvent.id)) {
        selectedEvents.push(randomEvent);
      }
    }

    setCurrentNews(selectedEvents);

    if (selectedEvents.length > 0) {
      setGameMessage(`Breaking: ${selectedEvents[0].title}`);
    }
  }, []);

  // Update asset prices based on volatility and news
  const updatePrices = useCallback(() => {
    setAssets(prevAssets => {
      return prevAssets.map(asset => {
        let priceChange = 0;

        // Apply base volatility
        const baseChange = (Math.random() - 0.5) * 2 * asset.volatility;
        priceChange += baseChange;

        // Apply news impacts
        currentNews.forEach(news => {
          if (news.impact[asset.id]) {
            priceChange += news.impact[asset.id];
          }
        });

        const newPrice = Math.max(10, asset.price * (1 + priceChange));

        return {
          ...asset,
          previousPrice: asset.price,
          price: Math.round(newPrice),
          history: [...asset.history.slice(-9), Math.round(newPrice)]
        };
      });
    });
  }, [currentNews]);

  // Calculate portfolio value
  const calculatePortfolioValue = useCallback(() => {
    return Object.entries(portfolio).reduce((total, [assetId, amount]) => {
      const asset = assets.find(a => a.id === assetId);
      return total + (asset ? asset.price * amount : 0);
    }, 0);
  }, [portfolio, assets]);

  // Execute trade
  const executeTrade = useCallback((type: 'buy' | 'sell') => {
    if (!selectedAsset) {
      setGameMessage('Select an asset first!');
      return;
    }

    const asset = assets.find(a => a.id === selectedAsset);
    if (!asset) return;

    const totalCost = asset.price * tradeAmount;

    if (type === 'buy') {
      if (balance < totalCost) {
        setGameMessage('Insufficient balance!');
        return;
      }

      setBalance(prev => prev - totalCost);
      setPortfolio(prev => ({
        ...prev,
        [selectedAsset]: (prev[selectedAsset] || 0) + tradeAmount
      }));

      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        assetId: selectedAsset,
        type: 'buy',
        amount: tradeAmount,
        price: asset.price,
        timestamp: Date.now()
      };

      setTrades(prev => [...prev, newTrade]);
      setGameMessage(`Bought ${tradeAmount} ${asset.name} for $${totalCost}!`);
    } else {
      if (!portfolio[selectedAsset] || portfolio[selectedAsset] < tradeAmount) {
        setGameMessage('Insufficient assets to sell!');
        return;
      }

      setBalance(prev => prev + totalCost);
      setPortfolio(prev => ({
        ...prev,
        [selectedAsset]: prev[selectedAsset] - tradeAmount
      }));

      // Calculate profit/loss
      const buyTrades = trades.filter(t => t.assetId === selectedAsset && t.type === 'buy');
      const avgBuyPrice = buyTrades.reduce((sum, t) => sum + t.price, 0) / buyTrades.length || asset.price;
      const profit = (asset.price - avgBuyPrice) * tradeAmount;

      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        assetId: selectedAsset,
        type: 'sell',
        amount: tradeAmount,
        price: asset.price,
        timestamp: Date.now(),
        profit
      };

      setTrades(prev => [...prev, newTrade]);
      setTotalProfitLoss(prev => prev + profit);
      setGameMessage(`Sold ${tradeAmount} ${asset.name} for $${totalCost}! ${profit >= 0 ? '📈' : '📉'} ${profit >= 0 ? '+' : ''}$${Math.round(profit)}`);
    }

    // Update score based on trade
    setScore(prev => prev + (type === 'sell' && totalProfitLoss > 0 ? 10 : 5));
  }, [selectedAsset, tradeAmount, balance, portfolio, assets, trades, totalProfitLoss]);

  // Next round
  const nextRound = useCallback(() => {
    if (round >= maxRounds) {
      endGame();
      return;
    }

    setRound(prev => prev + 1);
    generateNews();
    updatePrices();
  }, [round, generateNews, updatePrices]);

  // End game
  const endGame = useCallback(() => {
    setGameState('ended');
    const portfolioValue = calculatePortfolioValue();
    const totalValue = balance + portfolioValue;
    const finalScore = Math.max(0, Math.round((totalValue / 1000 - 1) * 100 + score + (totalProfitLoss / 10)));

    onComplete(finalScore, {
      finalBalance: Math.round(totalValue),
      profitLoss: Math.round(totalProfitLoss),
      tradesCompleted: trades.length,
      portfolioValue: Math.round(portfolioValue)
    });
  }, [balance, score, totalProfitLoss, trades.length, calculatePortfolioValue, onComplete]);

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'uncommon': return 'border-green-400 bg-green-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'legendary': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="w-full max-w-2xl bg-gray-900 border-2 border-cyan-500 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">Pixel Market Trader</h2>
            <p className="text-gray-300 text-lg">
              Buy and sell retro gaming assets to build your fortune!
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-purple-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Target className="w-6 h-6" />
              How to Play
            </h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Start with $1,000 and grow your portfolio through smart trading</li>
              <li>• Watch the news - it affects asset prices!</li>
              <li>• Buy low, sell high to maximize profits</li>
              <li>• Diversify your portfolio to manage risk</li>
              <li>• Complete 10 rounds to achieve the highest score</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-green-500">
            <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Asset Types
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-300">
                <span className="text-cyan-400">🪙 Crypto:</span> High risk, high reward
              </div>
              <div className="text-gray-300">
                <span className="text-purple-400">🎮 Gaming:</span> Medium risk
              </div>
              <div className="text-gray-300">
                <span className="text-blue-400">💻 Tech:</span> Stable growth
              </div>
              <div className="text-gray-300">
                <span className="text-yellow-400">💎 Commodities:</span> Varies with market
              </div>
            </div>
          </div>

          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 text-lg"
          >
            Start Trading
          </Button>

          <Button
            onClick={onExit}
            variant="outline"
            className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const portfolioValue = calculatePortfolioValue();
    const totalValue = balance + portfolioValue;
    const success = totalValue >= 2000;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="w-full max-w-2xl bg-gray-900 border-2 border-cyan-500 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{success ? '🏆' : totalValue >= 1500 ? '⭐' : '📊'}</div>
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">
              {success ? 'Market Master!' : 'Trading Complete!'}
            </h2>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Final Results</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <div className="text-sm text-gray-500">Final Balance</div>
                <div className="text-2xl font-bold text-cyan-400">${Math.round(totalValue)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total P&L</div>
                <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfitLoss >= 0 ? '+' : ''}${Math.round(totalProfitLoss)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Trades Made</div>
                <div className="text-2xl font-bold text-purple-400">{trades.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Final Score</div>
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-green-500">
            <h3 className="text-xl font-bold text-green-400 mb-3">Performance Analysis</h3>
            <p className="text-gray-300">
              {success
                ? 'Outstanding trading performance! You\'ve mastered market dynamics and risk management.'
                : totalValue >= 1500
                ? 'Good trading instincts! With practice, you\'ll become a market expert.'
                : 'Trading takes practice. Study market patterns and try again!'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-gray-900 border border-cyan-500 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎮</div>
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">Pixel Market Trader</h2>
              <p className="text-gray-400">Round {round} of {maxRounds}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-gray-500">Balance</div>
              <div className="text-2xl font-bold text-green-400">${Math.round(balance)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Portfolio</div>
              <div className="text-2xl font-bold text-purple-400">${Math.round(calculatePortfolioValue())}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-yellow-400">${Math.round(balance + calculatePortfolioValue())}</div>
            </div>
            <Button onClick={onExit} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* News Ticker */}
      {currentNews.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-yellow-900 border-2 border-yellow-500 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" />
              Breaking News
            </div>
            {currentNews.map(news => (
              <div key={news.id} className="text-yellow-100 mb-2">
                <span className="text-2xl mr-2">{news.emoji}</span>
                <span className="font-semibold">{news.title}</span> - {news.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Message */}
      {gameMessage && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-4 text-blue-200 text-center font-semibold">
            {gameMessage}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Market */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Market Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAsset === asset.id
                      ? 'border-cyan-500 bg-cyan-950'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  } ${getRarityColor(asset.rarity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {asset.icon}
                      <span className="font-bold text-white">{asset.name}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      asset.price > asset.previousPrice ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {asset.price > asset.previousPrice ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-bold">${asset.price}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{asset.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Owned: {portfolio[asset.id] || 0}</span>
                    <span className="text-gray-500">
                      {asset.price > asset.previousPrice ? '+' : ''}
                      {Math.round(((asset.price - asset.previousPrice) / asset.previousPrice) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Controls */}
          {selectedAsset && (
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Trading Controls</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Button
                  onClick={() => setTradeAmount(Math.max(1, tradeAmount - 1))}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  -
                </Button>
                <div className="flex items-center justify-center bg-gray-800 rounded border border-gray-600">
                  <span className="text-white font-bold">{tradeAmount}</span>
                </div>
                <Button
                  onClick={() => setTradeAmount(tradeAmount + 1)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  +
                </Button>
                <Button
                  onClick={() => setTradeAmount(10)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Max
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => executeTrade('buy')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  disabled={!selectedAsset}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Buy {tradeAmount}
                </Button>
                <Button
                  onClick={() => executeTrade('sell')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  disabled={!selectedAsset || !portfolio[selectedAsset]}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sell {tradeAmount}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Portfolio */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Your Portfolio
            </h3>
            <div className="space-y-2">
              {Object.entries(portfolio).map(([assetId, amount]) => {
                const asset = assets.find(a => a.id === assetId);
                if (!asset || amount === 0) return null;
                return (
                  <div key={assetId} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      {asset.icon}
                      <span className="text-white">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{amount}</div>
                      <div className="text-green-400 text-sm">${Math.round(asset.price * amount)}</div>
                    </div>
                  </div>
                );
              })}
              {Object.values(portfolio).every(amount => amount === 0) && (
                <div className="text-gray-500 text-center py-4">No assets owned yet</div>
              )}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Recent Trades
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trades.slice(-5).reverse().map(trade => {
                const asset = assets.find(a => a.id === trade.assetId);
                if (!asset) return null;
                return (
                  <div key={trade.id} className="bg-gray-800 p-2 rounded text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                          {trade.type === 'buy' ? '📈' : '📉'}
                        </span>
                        <span className="text-white">
                          {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.amount} {asset.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">${Math.round(trade.price * trade.amount)}</div>
                        {trade.profit !== undefined && (
                          <div className={`text-xs ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profit >= 0 ? '+' : ''}${Math.round(trade.profit)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {trades.length === 0 && (
                <div className="text-gray-500 text-center py-4">No trades yet</div>
              )}
            </div>
          </div>

          {/* Next Round Button */}
          <Button
            onClick={nextRound}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4"
          >
            Next Round →
          </Button>
        </div>
      </div>
    </div>
  );
}