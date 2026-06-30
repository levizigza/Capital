import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MinigameProps } from "../types";
import {
  STOCKS,
  NEWS_EVENTS,
  generateAllPriceHistories,
  deriveSeed,
  portfolioValue,
  positionPnL,
  portfolioVolatility,
  diversificationScore,
  economyOverridesForPhase,
  sectorRiskMap,
  portfolioVaR,
  stressTestPortfolio,
  explainPriceMove,
  STRESS_SCENARIOS,
  type Position,
  type StockTick,
  type SectorExposure,
} from "./market-sim";
import { ECONOMY_PHASE_CONFIG } from "@/islands/economy";

const TOTAL_DAYS = 30;
const STARTING_CASH = 10000;

type OrderType = "market" | "limit";
type Order = {
  id: number;
  symbol: string;
  shares: number;
  type: OrderType;
  limitPrice?: number;
  filled: boolean;
  fillPrice?: number;
  fillDay?: number;
};

type Tab = "market" | "portfolio" | "orders" | "risk";

export default function PaperTradingGame({ onComplete, onClose, difficulty, save, island }: MinigameProps) {
  const economyPhase = save.economyState?.phase;

  // Session-unique seed: same save + island + difficulty = same market
  const seed = useMemo(
    () => deriveSeed(island.id, save.updatedAt, difficulty),
    [island.id, save.updatedAt, difficulty],
  );

  const priceHistory = useMemo(
    () => generateAllPriceHistories(STOCKS, TOTAL_DAYS, seed, NEWS_EVENTS, economyPhase),
    [seed, economyPhase],
  );

  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(STARTING_CASH);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextOrderId, setNextOrderId] = useState(1);
  const [tab, setTab] = useState<Tab>("market");
  const [finished, setFinished] = useState(false);
  const [newsFlash, setNewsFlash] = useState<string | null>(null);
  const [priceExplanation, setPriceExplanation] = useState<string | null>(null);

  const [selectedSymbol, setSelectedSymbol] = useState(STOCKS[0].symbol);
  const [orderShares, setOrderShares] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState("");

  const currentPrices = useMemo(() => {
    const p: Record<string, number> = {};
    for (const stock of STOCKS) {
      p[stock.symbol] = priceHistory[stock.symbol]?.[day]?.price ?? stock.startPrice;
    }
    return p;
  }, [day, priceHistory]);

  const totalValue = cash + portfolioValue(positions, currentPrices);
  const pnl = totalValue - STARTING_CASH;
  const divScore = diversificationScore(positions, currentPrices);
  const vol = portfolioVolatility(positions, currentPrices, economyPhase);
  const dailyVaR = portfolioVaR(positions, currentPrices, economyPhase);
  const riskMap = sectorRiskMap(positions, currentPrices, economyPhase);

  const advanceDay = useCallback(() => {
    if (day >= TOTAL_DAYS) return;
    const nextDay = day + 1;

    // Show news + causal explanation
    const event = NEWS_EVENTS.find((e) => e.day === nextDay);
    if (event) {
      setNewsFlash(event.headline);
      setTimeout(() => setNewsFlash(null), 4000);
    }

    // Show price explanation for selected stock
    const tick = priceHistory[selectedSymbol]?.[nextDay];
    if (tick) {
      const stock = STOCKS.find((s) => s.symbol === selectedSymbol)!;
      setPriceExplanation(explainPriceMove(stock, tick, economyPhase));
      setTimeout(() => setPriceExplanation(null), 6000);
    }

    // fill pending limit orders
    setOrders((prev) => {
      const updated = [...prev];
      const fills: { symbol: string; shares: number; price: number }[] = [];
      for (const order of updated) {
        if (order.filled || order.type !== "limit") continue;
        const price = priceHistory[order.symbol]?.[nextDay]?.price;
        if (price && order.limitPrice && price <= order.limitPrice) {
          const cost = price * order.shares;
          if (cost <= cash) {
            order.filled = true;
            order.fillPrice = price;
            order.fillDay = nextDay;
            fills.push({ symbol: order.symbol, shares: order.shares, price });
          }
        }
      }
      if (fills.length > 0) {
        let newCash = cash;
        setPositions((prevPos) => {
          const next = [...prevPos];
          for (const fill of fills) {
            newCash -= fill.price * fill.shares;
            const existing = next.find((p) => p.symbol === fill.symbol);
            if (existing) {
              const totalShares = existing.shares + fill.shares;
              existing.avgCost =
                (existing.avgCost * existing.shares + fill.price * fill.shares) / totalShares;
              existing.shares = totalShares;
            } else {
              next.push({ symbol: fill.symbol, shares: fill.shares, avgCost: fill.price });
            }
          }
          return next;
        });
        setCash(newCash);
      }
      return updated;
    });

    setDay(nextDay);
    if (nextDay >= TOTAL_DAYS) {
      setFinished(true);
    }
  }, [day, cash, priceHistory, selectedSymbol, economyPhase]);

  const placeOrder = useCallback(() => {
    const price = currentPrices[selectedSymbol];
    if (!price || orderShares <= 0) return;

    if (orderType === "market") {
      const cost = price * orderShares;
      if (cost > cash) return;
      setCash((c) => c - cost);
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === selectedSymbol);
        if (existing) {
          const totalShares = existing.shares + orderShares;
          const newAvg =
            (existing.avgCost * existing.shares + price * orderShares) / totalShares;
          return prev.map((p) =>
            p.symbol === selectedSymbol ? { ...p, shares: totalShares, avgCost: newAvg } : p
          );
        }
        return [...prev, { symbol: selectedSymbol, shares: orderShares, avgCost: price }];
      });
      setOrders((prev) => [
        ...prev,
        {
          id: nextOrderId,
          symbol: selectedSymbol,
          shares: orderShares,
          type: "market",
          filled: true,
          fillPrice: price,
          fillDay: day,
        },
      ]);
    } else {
      const lp = parseFloat(limitPrice);
      if (isNaN(lp) || lp <= 0) return;
      setOrders((prev) => [
        ...prev,
        {
          id: nextOrderId,
          symbol: selectedSymbol,
          shares: orderShares,
          type: "limit",
          limitPrice: lp,
          filled: false,
        },
      ]);
    }
    setNextOrderId((id) => id + 1);
  }, [cash, currentPrices, day, limitPrice, nextOrderId, orderShares, orderType, selectedSymbol]);

  const divThreshold = difficulty === "easy" ? 15 : difficulty === "hard" ? 50 : 30;
  const winCondition = pnl > 0 && divScore >= divThreshold;

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-black">📈 Paper Trading Simulator</div>
          <div className="text-sm text-muted-foreground">
            Day {day}/{TOTAL_DAYS} · Build a diversified portfolio with virtual money
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100">
              {difficulty === "easy" ? "🟢 Easy" : difficulty === "hard" ? "🔴 Hard" : "🟡 Normal"}
            </span>
          </div>
        </div>
        <div className="text-right text-sm space-y-1">
          <div className="font-bold">💰 ${totalValue.toFixed(2)}</div>
          <div className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
            P/L: {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
          </div>
        </div>
      </div>

      {/* news flash */}
      {newsFlash ? (
        <div className="bg-yellow-100 border-yellow-400 border rounded-lg px-3 py-2 text-sm font-bold text-yellow-800 animate-pulse">
          📰 {newsFlash}
        </div>
      ) : null}

      {/* causal price explanation */}
      {priceExplanation ? (
        <div className="bg-blue-50 border-blue-200 border rounded-lg px-3 py-2 text-xs text-blue-800">
          🔍 {priceExplanation}
        </div>
      ) : null}

      {/* economy phase banner */}
      {economyPhase && economyPhase !== "normal" && (() => {
        const cfg = ECONOMY_PHASE_CONFIG[economyPhase];
        const eco = economyOverridesForPhase(economyPhase);
        return (
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: `${cfg.color}10`, borderColor: `${cfg.color}30`, color: cfg.color }}
          >
            <span className="text-base">{cfg.icon}</span>
            <span className="font-bold">{cfg.label} Economy</span>
            <span className="opacity-70">
              Volatility {eco.volatilityMultiplier > 1 ? "+" : ""}{Math.round((eco.volatilityMultiplier - 1) * 100)}%
              {" · "}
              Drift {eco.driftMultiplier > 1 ? "+" : ""}{Math.round((eco.driftMultiplier - 1) * 100)}%
            </span>
          </div>
        );
      })()}

      {/* stats bar */}
      <div className="flex gap-2 flex-wrap text-xs">
        <Badge variant="secondary">Cash: ${cash.toFixed(2)}</Badge>
        <Badge variant="secondary">Diversification: {divScore}/100</Badge>
        <Badge variant="secondary">Volatility: {(vol * 100).toFixed(1)}%</Badge>
        {dailyVaR > 0 && (
          <Badge variant="secondary" className="border-red-200">
            Daily VaR(95%): ${dailyVaR.toFixed(2)}
          </Badge>
        )}
      </div>

      {/* tabs */}
      <div className="flex gap-1">
        {(["market", "portfolio", "risk", "orders"] as Tab[]).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t)}
            className="text-xs capitalize"
          >
            {t === "risk" ? "🗺️ Risk Map" : t}
          </Button>
        ))}
      </div>

      {/* tab content */}
      {tab === "market" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STOCKS.map((stock) => {
              const ticks = priceHistory[stock.symbol];
              const price = currentPrices[stock.symbol];
              const prev = ticks?.[Math.max(0, day - 1)]?.price ?? price;
              const change = price - prev;
              const tick = ticks?.[day];
              const decomp = tick?.decomposition;
              return (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedSymbol === stock.symbol
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-bold text-sm">{stock.symbol}</div>
                    <div className="font-mono text-sm">${price.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                  <div className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}
                  </div>
                  {/* Mini decomposition bar */}
                  {decomp && day > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {decomp.shockComponent !== 0 && (
                        <span className="text-[9px] px-1 py-px rounded bg-yellow-100 text-yellow-700">
                          shock {decomp.shockComponent > 0 ? "+" : ""}{(decomp.shockComponent * 100).toFixed(1)}%
                        </span>
                      )}
                      <span className="text-[9px] px-1 py-px rounded bg-gray-100 text-gray-500">
                        noise {decomp.noiseComponent > 0 ? "+" : ""}{(decomp.noiseComponent * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {!finished ? (
            <Card>
              <CardContent className="p-3 space-y-2">
                <div className="text-sm font-bold">Place Order — {selectedSymbol}</div>
                <div className="flex gap-2 items-end flex-wrap">
                  <div>
                    <label className="text-xs text-muted-foreground">Shares</label>
                    <input
                      type="number"
                      min={1}
                      value={orderShares}
                      onChange={(e) => setOrderShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="block w-20 border rounded px-2 py-1 text-sm"
                      aria-label="Number of shares"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Type</label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as OrderType)}
                      className="block border rounded px-2 py-1 text-sm"
                      aria-label="Order type"
                    >
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>
                  {orderType === "limit" ? (
                    <div>
                      <label className="text-xs text-muted-foreground">Limit $</label>
                      <input
                        type="number"
                        step="0.01"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="block w-24 border rounded px-2 py-1 text-sm"
                        aria-label="Limit price"
                      />
                    </div>
                  ) : null}
                  <Button size="sm" onClick={placeOrder}>
                    Buy
                  </Button>
                </div>
                {orderType === "market" ? (
                  <div className="text-xs text-muted-foreground">
                    Cost: ${(currentPrices[selectedSymbol] * orderShares).toFixed(2)}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : tab === "portfolio" ? (
        <div className="space-y-2">
          {positions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No positions yet. Buy some stocks!</div>
          ) : (
            <div className="space-y-2">
              {positions.map((pos) => {
                const price = currentPrices[pos.symbol];
                const pl = positionPnL(pos, price);
                return (
                  <div key={pos.symbol} className="flex justify-between items-center border rounded-lg px-3 py-2 bg-white">
                    <div>
                      <div className="font-bold text-sm">{pos.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {pos.shares} shares @ ${pos.avgCost.toFixed(2)} avg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">${(pos.shares * price).toFixed(2)}</div>
                      <div className={`text-xs ${pl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {pl >= 0 ? "+" : ""}${pl.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : tab === "risk" ? (
        <RiskMapPanel
          positions={positions}
          prices={currentPrices}
          riskMap={riskMap}
          dailyVaR={dailyVaR}
          economyPhase={economyPhase}
        />
      ) : (
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="text-sm text-muted-foreground">No orders placed yet.</div>
          ) : (
            <div className="space-y-1">
              {[...orders].reverse().map((o) => (
                <div key={o.id} className="text-xs border rounded px-2 py-1 bg-white flex justify-between">
                  <span>
                    {o.type.toUpperCase()} {o.symbol} ×{o.shares}
                    {o.type === "limit" ? ` @ $${o.limitPrice?.toFixed(2)}` : ""}
                  </span>
                  <span>
                    {o.filled ? (
                      <span className="text-green-600">Filled @ ${o.fillPrice?.toFixed(2)} (day {o.fillDay})</span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* advance day / finish */}
      <div className="flex gap-2 pt-2">
        {!finished ? (
          <Button onClick={advanceDay} className="flex-1">
            ⏩ Advance Day ({day}/{TOTAL_DAYS})
          </Button>
        ) : (
          <div className="w-full space-y-2">
            <div className={`rounded-lg p-3 text-center font-bold ${winCondition ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {winCondition
                ? `🎉 Great job! You finished with $${totalValue.toFixed(2)} and a diversification score of ${divScore}/100.`
                : `📊 You finished with $${totalValue.toFixed(2)} (P/L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}) and diversification ${divScore}/100. Try again for a positive return with diversification ≥ ${divThreshold}!`}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onComplete(winCondition, Math.round(pnl))} className="flex-1">
                {winCondition ? "✅ Claim Reward" : "🔄 Try Again"}
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Map Panel — sector heatmap, VaR gauge, stress scenarios
// ---------------------------------------------------------------------------

function RiskMapPanel({
  positions,
  prices,
  riskMap,
  dailyVaR,
  economyPhase,
}: {
  positions: Position[];
  prices: Record<string, number>;
  riskMap: SectorExposure[];
  dailyVaR: number;
  economyPhase?: string;
}) {
  const [stressIdx, setStressIdx] = useState(0);
  const total = portfolioValue(positions, prices);

  if (positions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        Buy some stocks to see your risk map.
      </div>
    );
  }

  const scenario = STRESS_SCENARIOS[stressIdx];
  const stressResult = stressTestPortfolio(positions, prices, scenario);

  const maxRisk = Math.max(...riskMap.map((r) => r.riskContribution), 0.01);

  return (
    <div className="space-y-4">
      {/* Sector Risk Heatmap */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-bold">🗺️ Sector Risk Heatmap</div>
          <div className="text-xs text-muted-foreground mb-2">
            Bar length = risk contribution (weight × volatility). Concentrated risk in one sector means a single news event can hit hard.
          </div>
          <div className="space-y-2">
            {riskMap.map((sector) => {
              const pct = sector.riskContribution / maxRisk;
              const hue = Math.round(120 * (1 - pct)); // 120=green, 0=red
              return (
                <div key={sector.sector} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold capitalize">{sector.sector}</span>
                    <span className="font-mono text-muted-foreground">
                      {(sector.weight * 100).toFixed(0)}% exposure · {(sector.annualizedVol * 100).toFixed(0)}% vol
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(4, pct * 100)}%`,
                        backgroundColor: `hsl(${hue}, 75%, 50%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* VaR Gauge */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-bold mb-1">📊 Value at Risk (95% daily)</div>
          <div className="text-xs text-muted-foreground mb-2">
            On 19 out of 20 trading days, your portfolio should not lose more than this amount.
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black text-red-600">
              -${dailyVaR.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              ({total > 0 ? ((dailyVaR / total) * 100).toFixed(2) : "0"}% of portfolio)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stress Test */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">⚡ Stress Scenarios</div>
            <select
              className="text-xs border rounded px-2 py-1"
              value={stressIdx}
              onChange={(e) => setStressIdx(Number(e.target.value))}
            >
              {STRESS_SCENARIOS.map((s, i) => (
                <option key={s.id} value={i}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-muted-foreground">{scenario.description}</div>

          <div className="space-y-1">
            {stressResult.perStock.map((ps) => (
              <div key={ps.symbol} className="flex justify-between text-xs border rounded px-2 py-1 bg-white">
                <span className="font-semibold">{ps.symbol}</span>
                <span>
                  <span className="text-muted-foreground mr-2">
                    {ps.shockPct >= 0 ? "+" : ""}{(ps.shockPct * 100).toFixed(0)}%
                  </span>
                  <span className={ps.impact >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {ps.impact >= 0 ? "+" : ""}${ps.impact.toFixed(2)}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className={`text-sm font-bold text-center py-1 rounded ${
            stressResult.totalImpact >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            Portfolio impact: {stressResult.totalImpact >= 0 ? "+" : ""}${stressResult.totalImpact.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
