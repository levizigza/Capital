import { useEffect } from "react";
import { GameButton, GamePanel } from "@/game-ui";
import { toast } from "sonner";
import type { UserProfile } from "@/App";
import type { IslandSaveV1 } from "../types";
import { PARTY_ITEMS, MAX_PARTY_ITEMS } from "../partyItems";
import {
  CAPSULE_OFFERS,
  canBuyCapsule,
  capsuleLabel,
  hubPartyItems,
  isRoomUnlocked,
  nextPurchasableCarpet,
  PLAZA_PASS_PRICE,
} from "../harborShop";
import { CapsuleStudio3D } from "./CapsuleStudio3D";

export type CapsulePurchase =
  | { kind: "capsule"; itemId: import("../partyItems").PartyItemId; price: number }
  | { kind: "carpet"; tierId: string; price: number }
  | { kind: "plaza_pass"; room: "market"; price: number };

type Props = {
  save: IslandSaveV1;
  userProfile: UserProfile;
  onLeave: () => void;
  onHarborPurchase: (purchase: CapsulePurchase) => boolean;
  /** Guided spend beat — allow peek-complete without buying */
  showPeekDone?: boolean;
  onPeekDone?: () => void;
};

/**
 * Full-bleed 3D Capsule Stall — spend UI over a live shop interior.
 * Plaza Canvas must be unmounted while this is open.
 */
export function CapsuleStudioOverlay({
  save,
  userProfile,
  onLeave,
  onHarborPurchase,
  showPeekDone,
  onPeekDone,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onLeave();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onLeave]);

  const ownedItems = hubPartyItems(save);
  const slotsUsed = ownedItems.length;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      data-testid="capsule-studio-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Capsule Stall"
    >
      <CapsuleStudio3D className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />

      <header className="relative z-[2] flex items-start justify-between gap-3 p-3 sm:p-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
            Harbor Haven · 3D Capsule Stall
          </div>
          <h2 className="text-xl font-black text-white drop-shadow sm:text-2xl">Tiny spend</h2>
          <p className="max-w-sm text-xs text-white/80 sm:text-sm">
            Buy help for the plaza — capsules, carpet polish, and Pasaran Lane. Esc leaves anytime.
          </p>
          <div className="mt-1 flex flex-wrap gap-3 text-sm font-bold text-amber-100">
            <span>Balance: 🪙 {userProfile.totalCoins}</span>
            <span>
              Capsules: {slotsUsed}/{MAX_PARTY_ITEMS}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-full border-2 border-white/35 bg-black/45 px-3 py-1.5 text-sm font-bold text-white hover:bg-black/60"
          data-testid="capsule-leave"
        >
          ✕ Leave
        </button>
      </header>

      <div className="relative z-[2] mt-auto max-h-[52vh] w-full overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto w-full max-w-xl space-y-3 rounded-3xl border border-white/15 bg-black/55 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          <GamePanel padding="default" className="space-y-2 border-white/10 bg-white/95 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Fortune Capsules
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground">
                {slotsUsed >= MAX_PARTY_ITEMS
                  ? "Bag full — sell or use items on the practice board"
                  : `${MAX_PARTY_ITEMS - slotsUsed} slot${MAX_PARTY_ITEMS - slotsUsed === 1 ? "" : "s"} free`}
              </div>
            </div>
            {CAPSULE_OFFERS.map((offer) => {
              const def = PARTY_ITEMS[offer.itemId];
              const check = canBuyCapsule(save, userProfile.totalCoins, offer.itemId, offer.price);
              const owned = ownedItems.includes(offer.itemId);
              return (
                <div
                  key={offer.itemId}
                  className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold">
                      {def.icon} {def.name}
                    </div>
                    <div className="line-clamp-1 text-[11px] text-muted-foreground">{def.moneyTip}</div>
                    {!check.ok && !owned ? (
                      <div className="text-[11px] font-semibold text-amber-800">{check.reason}</div>
                    ) : null}
                  </div>
                  <GameButton
                    size="sm"
                    variant={owned ? "ghost" : "primary"}
                    disabled={!check.ok}
                    title={!check.ok ? check.reason : undefined}
                    onClick={() => {
                      const ok = onHarborPurchase({
                        kind: "capsule",
                        itemId: offer.itemId,
                        price: offer.price,
                      });
                      if (ok) toast.success(`Bought ${capsuleLabel(offer.itemId)}`);
                      else toast.error(check.reason ?? "Can't buy");
                    }}
                  >
                    {owned ? "Owned" : `🪙 ${offer.price}`}
                  </GameButton>
                </div>
              );
            })}
          </GamePanel>

          <GamePanel padding="default" className="space-y-2 border-white/10 bg-white/95 text-left">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Carpet polish
            </div>
            {(() => {
              const next = nextPurchasableCarpet(userProfile.totalCoins, save);
              if (!next) {
                return <p className="text-sm text-muted-foreground">Your carpet is maxed out.</p>;
              }
              const can = userProfile.totalCoins >= next.price;
              return (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold">
                      {next.tier.emoji} Unlock {next.tier.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Early unlock — cheaper than earning every coin for the tier.
                    </div>
                    {!can ? (
                      <div className="text-[11px] font-semibold text-amber-800">
                        Need 🪙 {next.price} (you have {userProfile.totalCoins})
                      </div>
                    ) : null}
                  </div>
                  <GameButton
                    size="sm"
                    variant="primary"
                    disabled={!can}
                    title={!can ? `Need 🪙 ${next.price}` : undefined}
                    onClick={() => {
                      const ok = onHarborPurchase({
                        kind: "carpet",
                        tierId: next.tier.id,
                        price: next.price,
                      });
                      if (ok) toast.success(`${next.tier.label} unlocked!`);
                      else toast.error(`Need 🪙 ${next.price}`);
                    }}
                  >
                    🪙 {next.price}
                  </GameButton>
                </div>
              );
            })()}
          </GamePanel>

          <GamePanel padding="default" className="space-y-2 border-white/10 bg-white/95 text-left">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Plaza pass
            </div>
            {isRoomUnlocked(save, "market") ? (
              <p className="text-sm text-muted-foreground">
                🧺 Pasaran Lane is open on the plaza — walk to the market stall for fair-trade practice.
              </p>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold">🧺 Pasaran Lane pass</div>
                  <div className="text-[11px] text-muted-foreground">
                    Opens a market stall on the plaza for exact-change practice.
                  </div>
                  {userProfile.totalCoins < PLAZA_PASS_PRICE ? (
                    <div className="text-[11px] font-semibold text-amber-800">
                      Need 🪙 {PLAZA_PASS_PRICE} (you have {userProfile.totalCoins})
                    </div>
                  ) : null}
                </div>
                <GameButton
                  size="sm"
                  variant="primary"
                  disabled={userProfile.totalCoins < PLAZA_PASS_PRICE}
                  title={
                    userProfile.totalCoins < PLAZA_PASS_PRICE
                      ? `Need 🪙 ${PLAZA_PASS_PRICE}`
                      : undefined
                  }
                  onClick={() => {
                    const ok = onHarborPurchase({
                      kind: "plaza_pass",
                      room: "market",
                      price: PLAZA_PASS_PRICE,
                    });
                    if (ok) toast.success("Pasaran Lane unlocked on the plaza!");
                    else toast.error(`Need 🪙 ${PLAZA_PASS_PRICE}`);
                  }}
                >
                  🪙 {PLAZA_PASS_PRICE}
                </GameButton>
              </div>
            )}
          </GamePanel>

          <div className="flex flex-col gap-2">
            <GameButton variant="outline" className="w-full bg-white/90" onClick={onLeave}>
              Back to plaza
            </GameButton>
            {showPeekDone ? (
              <GameButton
                variant="ghost"
                className="w-full bg-white/70 text-sm"
                onClick={() => {
                  onPeekDone?.();
                  onLeave();
                  toast.message("Peek complete — coins can buy help later!");
                }}
              >
                I’ve seen enough →
              </GameButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
