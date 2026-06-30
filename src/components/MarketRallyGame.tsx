import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TrendUp, TrendDown, Lightning, ShieldCheck, Coins } from '@phosphor-icons/react'

// --- Types ---

interface Stock {
  id: string
  name: string
  ticker: string
  emoji: string
  price: number
  history: number[]
  sector: 'tech' | 'energy' | 'food' | 'retail'
  volatility: number // 0-1, higher = wilder swings
}

interface PlayerPortfolio {
  cash: number
  holdings: Record<string, number> // ticker → shares owned
  netWorth: number
  transactions: Transaction[]
}

interface Transaction {
  ticker: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  round: number
}

interface NewsEvent {
  headline: string
  emoji: string
  effect: Record<string, number> // sector → price multiplier
  duration: number // rounds
}

// --- Constants ---

const INITIAL_STOCKS: Stock[] = [
  { id: '1', name: 'CloudNine Tech', ticker: 'CLND', emoji: '☁️', price: 50, history: [50], sector: 'tech', volatility: 0.6 },
  { id: '2', name: 'SunBolt Energy', ticker: 'SNBT', emoji: '⚡', price: 35, history: [35], sector: 'energy', volatility: 0.45 },
  { id: '3', name: 'FreshBite Foods', ticker: 'FRBF', emoji: '🍎', price: 25, history: [25], sector: 'food', volatility: 0.25 },
  { id: '4', name: 'PixelMart', ticker: 'PXMT', emoji: '🛒', price: 40, history: [40], sector: 'retail', volatility: 0.35 },
  { id: '5', name: 'RoboLearn AI', ticker: 'RBLA', emoji: '🤖', price: 75, history: [75], sector: 'tech', volatility: 0.7 },
  { id: '6', name: 'GreenGrow Bio', ticker: 'GGRB', emoji: '🌱', price: 20, history: [20], sector: 'food', volatility: 0.3 },
]

const NEWS_EVENTS: NewsEvent[] = [
  { headline: 'Tech boom! New AI breakthrough excites investors', emoji: '🚀', effect: { tech: 1.15 }, duration: 2 },
  { headline: 'Oil prices surge after supply cut', emoji: '🛢️', effect: { energy: 1.2 }, duration: 1 },
  { headline: 'Grocery inflation hits record high', emoji: '📈', effect: { food: 0.85, retail: 0.9 }, duration: 2 },
  { headline: 'Holiday shopping season begins early!', emoji: '🎁', effect: { retail: 1.18 }, duration: 1 },
  { headline: 'Market-wide selloff as interest rates rise', emoji: '📉', effect: { tech: 0.88, energy: 0.92, food: 0.95, retail: 0.9 }, duration: 1 },
  { headline: 'Government announces green energy subsidies', emoji: '🌿', effect: { energy: 1.25 }, duration: 3 },
  { headline: 'Supply chain crisis hits retailers hard', emoji: '🚢', effect: { retail: 0.82 }, duration: 2 },
  { headline: 'Record harvest drives food prices down', emoji: '🌾', effect: { food: 1.12 }, duration: 1 },
  { headline: 'Cybersecurity scare spooks tech investors', emoji: '🔒', effect: { tech: 0.85 }, duration: 1 },
  { headline: 'Consumer confidence at all-time high!', emoji: '😀', effect: { tech: 1.08, energy: 1.05, food: 1.05, retail: 1.12 }, duration: 1 },
  { headline: 'Surprise earnings beat across all sectors!', emoji: '🎉', effect: { tech: 1.1, energy: 1.1, food: 1.08, retail: 1.1 }, duration: 1 },
  { headline: 'Trade tensions cool as new deal signed', emoji: '🤝', effect: { tech: 1.05, retail: 1.08 }, duration: 2 },
]

const TOTAL_ROUNDS = 12
const STARTING_CASH = 1000

// --- Helpers ---

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function sectorColor(sector: string) {
  switch (sector) {
    case 'tech': return 'text-blue-600 bg-blue-50'
    case 'energy': return 'text-amber-600 bg-amber-50'
    case 'food': return 'text-green-600 bg-green-50'
    case 'retail': return 'text-purple-600 bg-purple-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

// --- Sparkline mini-chart ---
function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  )
}

// --- Component ---

interface MarketRallyGameProps {
  onExit: () => void
}

export default function MarketRallyGame({ onExit }: MarketRallyGameProps) {
  const [round, setRound] = useState(1)
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS)
  const [portfolio, setPortfolio] = useState<PlayerPortfolio>({
    cash: STARTING_CASH,
    holdings: {},
    netWorth: STARTING_CASH,
    transactions: [],
  })
  const [activeNews, setActiveNews] = useState<(NewsEvent & { remaining: number })[]>([])
  const [currentNews, setCurrentNews] = useState<NewsEvent | null>(null)
  const [phase, setPhase] = useState<'news' | 'trade' | 'results' | 'gameover'>('trade')
  const [buyAmount, setBuyAmount] = useState<Record<string, number>>({})
  const [flashMessage, setFlashMessage] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(true)

  // Calculate net worth
  const calcNetWorth = useCallback((p: PlayerPortfolio, s: Stock[]) => {
    let total = p.cash
    for (const stock of s) {
      total += (p.holdings[stock.ticker] || 0) * stock.price
    }
    return Math.round(total * 100) / 100
  }, [])

  // Advance market prices
  const advanceMarket = useCallback(() => {
    setStocks(prev => prev.map(stock => {
      let modifier = 1
      // Apply active news effects
      for (const news of activeNews) {
        const effect = news.effect[stock.sector]
        if (effect) modifier *= effect
      }
      // Random walk with volatility
      const change = randomBetween(-stock.volatility * 0.15, stock.volatility * 0.15)
      const trend = randomBetween(-0.02, 0.03) // slight upward bias
      const newPrice = clamp(
        Math.round((stock.price * modifier * (1 + change + trend)) * 100) / 100,
        1, 999
      )
      return {
        ...stock,
        price: newPrice,
        history: [...stock.history, newPrice],
      }
    }))
  }, [activeNews])

  // End trading phase → advance round
  const endTradingPhase = useCallback(() => {
    // Advance market
    advanceMarket()
    // Decay news durations
    setActiveNews(prev => prev.map(n => ({ ...n, remaining: n.remaining - 1 })).filter(n => n.remaining > 0))

    if (round >= TOTAL_ROUNDS) {
      setPhase('gameover')
    } else {
      // Maybe spawn news
      if (Math.random() < 0.55) {
        const news = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)]
        setCurrentNews(news)
        setActiveNews(prev => [...prev, { ...news, remaining: news.duration }])
        setPhase('news')
      } else {
        setRound(r => r + 1)
        setPhase('trade')
      }
    }
  }, [round, advanceMarket])

  // After dismissing news
  const dismissNews = useCallback(() => {
    setCurrentNews(null)
    setRound(r => r + 1)
    setPhase('trade')
  }, [])

  // Buy stock
  const handleBuy = (ticker: string, shares: number) => {
    const stock = stocks.find(s => s.ticker === ticker)
    if (!stock || shares <= 0) return
    const cost = stock.price * shares
    if (cost > portfolio.cash) {
      setFlashMessage("Not enough cash!")
      setTimeout(() => setFlashMessage(null), 1500)
      return
    }
    setPortfolio(prev => {
      const updated = {
        ...prev,
        cash: Math.round((prev.cash - cost) * 100) / 100,
        holdings: { ...prev.holdings, [ticker]: (prev.holdings[ticker] || 0) + shares },
        transactions: [...prev.transactions, { ticker, type: 'buy' as const, shares, price: stock.price, round }],
      }
      updated.netWorth = calcNetWorth(updated, stocks)
      return updated
    })
    setBuyAmount(prev => ({ ...prev, [ticker]: 0 }))
    setFlashMessage(`Bought ${shares} ${ticker}!`)
    setTimeout(() => setFlashMessage(null), 1200)
  }

  // Sell stock
  const handleSell = (ticker: string, shares: number) => {
    const stock = stocks.find(s => s.ticker === ticker)
    if (!stock || shares <= 0) return
    const owned = portfolio.holdings[ticker] || 0
    if (shares > owned) return
    const revenue = stock.price * shares
    setPortfolio(prev => {
      const updated = {
        ...prev,
        cash: Math.round((prev.cash + revenue) * 100) / 100,
        holdings: { ...prev.holdings, [ticker]: owned - shares },
        transactions: [...prev.transactions, { ticker, type: 'sell' as const, shares, price: stock.price, round }],
      }
      updated.netWorth = calcNetWorth(updated, stocks)
      return updated
    })
    setFlashMessage(`Sold ${shares} ${ticker} for $${revenue.toFixed(2)}!`)
    setTimeout(() => setFlashMessage(null), 1200)
  }

  // Update net worth whenever stocks change
  useEffect(() => {
    setPortfolio(prev => ({ ...prev, netWorth: calcNetWorth(prev, stocks) }))
  }, [stocks, calcNetWorth])

  // Max shares affordable
  const maxBuyable = (ticker: string) => {
    const stock = stocks.find(s => s.ticker === ticker)
    if (!stock) return 0
    return Math.floor(portfolio.cash / stock.price)
  }

  // --- Game Over ---
  if (phase === 'gameover') {
    const profit = portfolio.netWorth - STARTING_CASH
    const pctReturn = ((profit / STARTING_CASH) * 100).toFixed(1)
    const won = profit > 0
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">{won ? '🏆' : '📉'}</div>
          <h2 className="text-3xl font-extrabold mb-2">{won ? 'Market Champion!' : 'Market Closed'}</h2>
          <p className="text-gray-600 mb-6">{won ? 'Great investing skills!' : 'Every loss is a lesson learned.'}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Starting Cash</span><span className="font-bold">${STARTING_CASH}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Final Net Worth</span><span className="font-bold text-lg">${portfolio.netWorth.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Return</span><span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{profit >= 0 ? '+' : ''}{pctReturn}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trades Made</span><span className="font-bold">{portfolio.transactions.length}</span></div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-blue-800 mb-1 flex items-center gap-1"><ShieldCheck size={18} /> What You Learned</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Diversification reduces risk across sectors</li>
              <li>- News events cause short-term price swings</li>
              <li>- Buy low, sell high is easier said than done!</li>
              <li>- Patience and strategy beat impulsive trades</li>
            </ul>
          </div>
          <button onClick={onExit} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Back to Menu
          </button>
        </motion.div>
      </div>
    )
  }

  // --- News Phase ---
  if (phase === 'news' && currentNews) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-3">{currentNews.emoji}</div>
          <div className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3">Breaking News</div>
          <h2 className="text-xl font-bold mb-4">{currentNews.headline}</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.entries(currentNews.effect).map(([sector, mult]) => (
              <span key={sector} className={`text-xs font-bold px-2 py-1 rounded-full ${mult > 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {sector} {mult > 1 ? '↑' : '↓'} {Math.round(Math.abs(mult - 1) * 100)}%
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-4">Lasts {currentNews.duration} round{currentNews.duration > 1 ? 's' : ''}</p>
          <button onClick={dismissNews} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Continue Trading →
          </button>
        </motion.div>
      </div>
    )
  }

  // --- Trading Phase ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Top Bar */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onExit} className="text-white/70 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
            <ArrowLeft size={18} /> Exit
          </button>
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendUp size={22} weight="bold" /> Market Rally
          </h1>
          <div className="text-white/70 text-sm font-medium">
            Round <span className="text-white font-bold">{round}</span>/{TOTAL_ROUNDS}
          </div>
        </div>
      </div>

      {/* Portfolio Strip */}
      <div className="bg-black/20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-white/60">Cash: <span className="text-green-400 font-bold">${portfolio.cash.toFixed(2)}</span></span>
            <span className="text-white/60">Net Worth: <span className="text-yellow-400 font-bold">${portfolio.netWorth.toFixed(2)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            {activeNews.map((n, i) => (
              <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80" title={n.headline}>
                {n.emoji} {n.remaining}r
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <AnimatePresence>
        {showTip && round === 1 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-indigo-600/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
              <p className="text-white text-sm"><Lightning size={16} className="inline mr-1" weight="fill" /> <strong>Tip:</strong> Buy stocks, wait for prices to rise, then sell for profit. Watch the news!</p>
              <button onClick={() => setShowTip(false)} className="text-white/70 hover:text-white text-xs ml-4">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash message */}
      <AnimatePresence>
        {flashMessage && (
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-xl px-6 py-3 font-bold text-sm">
            {flashMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Grid */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.map(stock => {
            const owned = portfolio.holdings[stock.ticker] || 0
            const change = stock.history.length >= 2 ? stock.price - stock.history[stock.history.length - 2] : 0
            const changePct = stock.history.length >= 2 ? (change / stock.history[stock.history.length - 2]) * 100 : 0
            const sparkColor = change >= 0 ? '#22c55e' : '#ef4444'
            const qty = buyAmount[stock.ticker] || 1

            return (
              <motion.div key={stock.id} layout className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stock.emoji}</span>
                    <div>
                      <div className="text-white font-bold text-sm">{stock.ticker}</div>
                      <div className="text-white/50 text-xs">{stock.name}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sectorColor(stock.sector)}`}>{stock.sector}</span>
                </div>

                {/* Price + Chart */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-white text-2xl font-extrabold">${stock.price.toFixed(2)}</div>
                    <div className={`text-xs font-bold flex items-center gap-0.5 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change >= 0 ? <TrendUp size={12} /> : <TrendDown size={12} />}
                      {change >= 0 ? '+' : ''}{changePct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-24">
                    <Sparkline data={stock.history} color={sparkColor} />
                  </div>
                </div>

                {/* Holdings */}
                {owned > 0 && (
                  <div className="bg-white/5 rounded-lg px-3 py-1.5 mb-3 flex items-center justify-between">
                    <span className="text-white/60 text-xs">You own</span>
                    <span className="text-white font-bold text-sm">{owned} shares (${(owned * stock.price).toFixed(2)})</span>
                  </div>
                )}

                {/* Trade controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/10 rounded-lg overflow-hidden">
                    <button onClick={() => setBuyAmount(prev => ({ ...prev, [stock.ticker]: Math.max(1, (prev[stock.ticker] || 1) - 1) }))} className="px-2 py-1 text-white/70 hover:bg-white/10 text-sm font-bold">−</button>
                    <span className="px-2 text-white text-sm font-bold min-w-[28px] text-center">{qty}</span>
                    <button onClick={() => setBuyAmount(prev => ({ ...prev, [stock.ticker]: Math.min(maxBuyable(stock.ticker), (prev[stock.ticker] || 1) + 1) }))} className="px-2 py-1 text-white/70 hover:bg-white/10 text-sm font-bold">+</button>
                  </div>
                  <button onClick={() => handleBuy(stock.ticker, qty)} disabled={portfolio.cash < stock.price * qty} className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-white/30 text-white text-xs font-bold rounded-lg transition-colors">
                    Buy ${(stock.price * qty).toFixed(0)}
                  </button>
                  {owned > 0 && (
                    <button onClick={() => handleSell(stock.ticker, Math.min(qty, owned))} className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors">
                      Sell {Math.min(qty, owned)}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* End Round Button */}
        <div className="mt-6 text-center">
          <button onClick={endTradingPhase} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-900/50 flex items-center gap-2 mx-auto">
            <Coins size={22} weight="bold" /> End Round {round} →
          </button>
          <p className="text-white/40 text-xs mt-2">Prices will change when you end the round</p>
        </div>
      </div>
    </div>
  )
}
