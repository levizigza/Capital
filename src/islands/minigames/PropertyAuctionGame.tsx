import { useCallback, useMemo, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

/**
 * Property Auction — bid near fair value across several listings. Use comps,
 * reno estimates, and inspection notes; overpaying or winning a lemon shows up
 * in equity. Teaching beat: price ≠ value — buy the spread.
 */

type Property = {
  id: string;
  name: string;
  list: number;
  reno: number;
  /** Fraction of reno that typically remains after negotiation / DIY */
  renoHaircut: number;
  comps: number[];
  inspection: string;
  surprise: number;
  surpriseNote: string;
};

const PROPERTIES: Property[] = [
  {
    id: "p1",
    name: "Cozy Cottage",
    list: 120000,
    reno: 15000,
    renoHaircut: 0.55,
    comps: [118000, 122000, 125000],
    inspection: "Solid bones; kitchen dated but functional.",
    surprise: -2000,
    surpriseNote: "Minor plumbing patch after closing.",
  },
  {
    id: "p2",
    name: "Fixer Upper",
    list: 85000,
    reno: 38000,
    renoHaircut: 0.7,
    comps: [78000, 90000, 88000],
    inspection: "Roof soft; foundation OK. Big upside if reno stays on budget.",
    surprise: -12000,
    surpriseNote: "Hidden mold — reno overran.",
  },
  {
    id: "p3",
    name: "City Condo",
    list: 210000,
    reno: 8000,
    renoHaircut: 0.4,
    comps: [205000, 215000, 220000],
    inspection: "HOA healthy; unit turnkey-ish.",
    surprise: 4000,
    surpriseNote: "Seller credit for appliance package.",
  },
  {
    id: "p4",
    name: "Duplex Near Transit",
    list: 175000,
    reno: 22000,
    renoHaircut: 0.6,
    comps: [165000, 180000, 172000],
    inspection: "One unit rented; other vacant — cashflow potential.",
    surprise: -5000,
    surpriseNote: "Tenant left; one month vacancy.",
  },
];

type Deal = {
  property: Property;
  bid: number;
  fair: number;
  equity: number;
  skipped: boolean;
  note: string;
};

function fairValue(p: Property): number {
  const compAvg = p.comps.reduce((a, b) => a + b, 0) / p.comps.length;
  return Math.round(compAvg * 0.55 + p.list * 0.45 - p.reno * p.renoHaircut);
}

export default function PropertyAuctionGame({
  minigameId,
  island,
  difficulty,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const startBudget = difficulty === "easy" ? 320000 : difficulty === "hard" ? 240000 : 280000;
  const rivalAggression = difficulty === "easy" ? 0.92 : difficulty === "hard" ? 1.05 : 0.98;

  const [round, setRound] = useState(0);
  const [budget, setBudget] = useState(startBudget);
  const [bid, setBid] = useState(() => Math.round(PROPERTIES[0].list * 0.95));
  const [deals, setDeals] = useState<Deal[]>([]);
  const [phase, setPhase] = useState<"bid" | "reveal" | "done">("bid");
  const [lastDeal, setLastDeal] = useState<Deal | null>(null);
  const [doneScore, setDoneScore] = useState(0);

  const property = PROPERTIES[round];
  const fair = useMemo(() => (property ? fairValue(property) : 0), [property]);

  const rivalBid = useMemo(() => {
    if (!property) return 0;
    return Math.round(fair * rivalAggression + (property.list - fair) * 0.15);
  }, [fair, property, rivalAggression]);

  const closeout = useCallback(
    (all: Deal[]) => {
      const bought = all.filter((d) => !d.skipped);
      const totalEquity = bought.reduce((s, d) => s + d.equity, 0);
      const goodDeals = bought.filter((d) => d.equity > 0).length;
      const accuracy = bought.length
        ? bought.reduce((s, d) => s + Math.max(0, 1 - Math.abs(d.bid - d.fair) / d.fair), 0) /
          bought.length
        : 0;
      let pts = 30 + goodDeals * 12 + clampScore(accuracy * 40);
      if (totalEquity > 20000) pts += 15;
      else if (totalEquity > 0) pts += 8;
      if (bought.length === 0) pts = 25;
      const score = clampScore(pts + Math.min(15, Math.max(0, totalEquity) / 4000));
      setDoneScore(score);
      setPhase("done");
      onComplete(score >= 55, score);
    },
    [onComplete],
  );

  const placeBid = (amount: number | null) => {
    if (!property || phase !== "bid") return;

    if (amount === null) {
      const deal: Deal = {
        property,
        bid: 0,
        fair,
        equity: 0,
        skipped: true,
        note: "Passed — capital saved for better entries.",
      };
      setDeals((d) => [...d, deal]);
      setLastDeal(deal);
      setPhase("reveal");
      return;
    }

    if (amount > budget || amount <= 0) return;

    const won = amount >= rivalBid;
    if (!won) {
      const deal: Deal = {
        property,
        bid: amount,
        fair,
        equity: 0,
        skipped: true,
        note: `Outbid — rival cleared at ~$${rivalBid.toLocaleString()}. Fair was $${fair.toLocaleString()}.`,
      };
      setDeals((d) => [...d, deal]);
      setLastDeal(deal);
      setPhase("reveal");
      return;
    }

    const allInCost = amount + property.reno + property.surprise;
    const marketAfter = fair + property.reno * (1 - property.renoHaircut) * 0.3;
    const equity = Math.round(marketAfter - allInCost + property.list * 0.02);
    const deal: Deal = {
      property,
      bid: amount,
      fair,
      equity,
      skipped: false,
      note:
        equity >= 0
          ? `Won under pressure. Equity ≈ $${equity.toLocaleString()}. ${property.surpriseNote}`
          : `Won but overpaid vs value. Equity $${equity.toLocaleString()}. ${property.surpriseNote}`,
    };
    setBudget((b) => b - amount);
    setDeals((d) => [...d, deal]);
    setLastDeal(deal);
    setPhase("reveal");
  };

  const nextRound = () => {
    if (round + 1 >= PROPERTIES.length) {
      closeout(deals);
      return;
    }
    const next = PROPERTIES[round + 1];
    setRound((r) => r + 1);
    setBid(Math.round(next.list * 0.95));
    setLastDeal(null);
    setPhase("bid");
  };

  const bidMax = property ? Math.min(budget, property.list + 35000) : budget;
  const bidMin = property ? Math.max(20000, property.list - 40000) : 20000;
  const safeBid = Math.min(Math.max(bid, bidMin), bidMax);

  return (
    <GameVisualShell
      shell="flat"
      title={def?.name ?? "Property Auction"}
      icon={def?.icon ?? "🔨"}
      genre="strategy"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap justify-between gap-2 text-sm font-bold">
          <span>
            Lot {Math.min(round + 1, PROPERTIES.length)}/{PROPERTIES.length}
          </span>
          <span>Budget ${budget.toLocaleString()}</span>
        </div>

        {phase === "bid" && property ? (
          <>
            <div className="rounded-lg border-2 border-amber-800/30 bg-amber-50 p-3 space-y-1">
              <div className="text-xl font-black">{property.name}</div>
              <div className="text-sm text-gray-700">
                Ask ${property.list.toLocaleString()} · Est. reno ${property.reno.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">🔍 {property.inspection}</div>
              <div className="text-xs font-mono text-gray-500">
                Comps: {property.comps.map((c) => `$${c.toLocaleString()}`).join(" · ")}
              </div>
            </div>

            <p className="text-sm">
              Fair value blends comps + ask − likely reno drag. Bid close — don&apos;t chase the hammer.
            </p>

            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>Your bid</span>
                <span>${safeBid.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={bidMin}
                max={Math.max(bidMin + 1000, bidMax)}
                step={1000}
                value={safeBid}
                onChange={(e) => setBid(Number(e.target.value))}
                className="w-full accent-amber-700"
                aria-label="Bid amount"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Lowball</span>
                <span>Stretch</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <GameButton
                variant="primary"
                disabled={safeBid > budget || safeBid <= 0}
                onClick={() => placeBid(safeBid)}
              >
                Bid ${safeBid.toLocaleString()}
              </GameButton>
              <GameButton variant="outline" onClick={() => placeBid(null)}>
                Pass this lot
              </GameButton>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[Math.round(property.list * 0.9), property.list, Math.round(property.list * 1.05)].map(
                (amt) => (
                  <GameButton
                    key={amt}
                    size="sm"
                    variant="outline"
                    disabled={amt > budget}
                    onClick={() => setBid(amt)}
                  >
                    ${amt.toLocaleString()}
                  </GameButton>
                ),
              )}
            </div>
          </>
        ) : null}

        {phase === "reveal" && lastDeal ? (
          <div className="space-y-3">
            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                lastDeal.skipped
                  ? "bg-gray-100"
                  : lastDeal.equity >= 0
                    ? "bg-emerald-50 text-emerald-900"
                    : "bg-red-50 text-red-900"
              }`}
            >
              <div className="font-black mb-1">
                {lastDeal.skipped ? "No deal" : lastDeal.equity >= 0 ? "Value captured" : "Overpaid"}
              </div>
              <p>{lastDeal.note}</p>
              {!lastDeal.skipped ? (
                <p className="mt-1 text-xs opacity-80">
                  Your bid ${lastDeal.bid.toLocaleString()} vs fair ${lastDeal.fair.toLocaleString()}
                </p>
              ) : null}
            </div>
            <GameButton variant="primary" className="w-full" onClick={nextRound}>
              {round + 1 >= PROPERTIES.length ? "Tallies →" : "Next listing →"}
            </GameButton>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="space-y-3 text-center">
            <div className="text-lg font-black">Auction closed · {doneScore}/100</div>
            <div className="text-sm">
              Equity across deals: $
              {deals.filter((d) => !d.skipped).reduce((s, d) => s + d.equity, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              Lesson: winning the auction isn&apos;t winning the investment. Fair value = comps + remaining work −
              surprises. Discipline on pass/bid protects capital.
            </p>
            <div className="max-h-28 overflow-y-auto text-left text-xs space-y-1">
              {deals.map((d) => (
                <div key={d.property.id} className="rounded border px-2 py-1">
                  {d.property.name}:{" "}
                  {d.skipped ? "passed/lost" : `equity $${d.equity.toLocaleString()}`}
                </div>
              ))}
            </div>
            <GameButton variant="primary" className="w-full" onClick={onClose}>
              Close
            </GameButton>
          </div>
        ) : null}
      </div>
    </GameVisualShell>
  );
}
