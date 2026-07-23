/**
 * Harbor Haven spend loop — coins leave the pouch for real upgrades.
 * Capsule items, carpet polish, and plaza passes sink wealth into progress.
 */

import type { IslandSaveV1 } from "./types";
import type { PartyItemId } from "./partyItems";
import { PARTY_ITEMS, MAX_PARTY_ITEMS } from "./partyItems";
import { BOAT_TIERS, getBoatTier, type BoatTier } from "./boats";
import { hasHarborFreedom, type PlazaRoomId } from "./progressGates";
import { HUB_ISLAND_ID } from "./worldMapLayout";

export type HarborShopState = {
  /** Highest carpet tier id unlocked by purchase (not just coin thresholds). */
  carpetTierId?: string;
  /** Plaza rooms opened with a pass. */
  unlockedRooms?: PlazaRoomId[];
  /** Companion ids already paid for at the Outfitter. */
  ownedCompanions?: string[];
};

export type CapsuleOffer = {
  itemId: PartyItemId;
  price: number;
};

export const CAPSULE_OFFERS: CapsuleOffer[] = [
  { itemId: "shield_ledger", price: 40 },
  { itemId: "coin_magnet", price: 55 },
  { itemId: "raid_writ", price: 45 },
  { itemId: "compound_charm", price: 70 },
  { itemId: "bailout_buoy", price: 60 },
];

export const COMPANION_PRICES: Record<string, number> = {
  /** Starter pet — always free so Outfitter pets make sense */
  tortoise: 0,
  finch: 30,
  iguana: 45,
  otter: 40,
  crab: 35,
};

/** Free Slow Coin pet — granted on first Outfitter leave / adopt. */
export const STARTER_COMPANION_ID = "tortoise";

export const PLAZA_PASS_PRICE = 80;
export const CARPET_POLISH_MARKUP = 0.35;

export function ensureHarborShop(save: IslandSaveV1): HarborShopState {
  return save.harborShop ?? {};
}

export function withHarborShop(save: IslandSaveV1, shop: HarborShopState): IslandSaveV1 {
  return { ...save, harborShop: shop };
}

/** Effective carpet: max(coin tier, purchased polish, freedom floor). */
export function resolveHarborBoatTier(totalCoins: number, save?: IslandSaveV1 | null): BoatTier {
  let tier = getBoatTier(totalCoins);
  if (save) {
    if (hasHarborFreedom(save)) {
      const flyer = BOAT_TIERS.find((t) => t.id === "fortune_flyer")!;
      if (flyer.minCoins > tier.minCoins) tier = flyer;
    }
    const purchasedId = save.harborShop?.carpetTierId;
    if (purchasedId) {
      const purchased = BOAT_TIERS.find((t) => t.id === purchasedId);
      if (purchased && purchased.minCoins > tier.minCoins) tier = purchased;
    }
  }
  return tier;
}

export function nextPurchasableCarpet(
  totalCoins: number,
  save: IslandSaveV1,
): { tier: BoatTier; price: number } | null {
  const current = resolveHarborBoatTier(totalCoins, save);
  const idx = BOAT_TIERS.findIndex((t) => t.id === current.id);
  const next = BOAT_TIERS[idx + 1];
  if (!next) return null;
  const price = Math.max(50, Math.round(next.minCoins * CARPET_POLISH_MARKUP));
  return { tier: next, price };
}

export function hubPartyItems(save: IslandSaveV1): PartyItemId[] {
  return save.partyBoard?.[HUB_ISLAND_ID]?.items ?? [];
}

export function canBuyCapsule(
  save: IslandSaveV1,
  totalCoins: number,
  itemId: PartyItemId,
  price: number,
): { ok: boolean; reason?: string } {
  if (totalCoins < price) return { ok: false, reason: "Not enough coins" };
  const items = hubPartyItems(save);
  if (items.includes(itemId)) return { ok: false, reason: "Already owned" };
  if (items.length >= MAX_PARTY_ITEMS) return { ok: false, reason: `Capsule full (${MAX_PARTY_ITEMS})` };
  return { ok: true };
}

export function applyCapsulePurchase(save: IslandSaveV1, itemId: PartyItemId): IslandSaveV1 {
  const board = save.partyBoard?.[HUB_ISLAND_ID] ?? {
    position: 0,
    turnsPlayed: 0,
    stars: 0,
    items: [],
  };
  const items = [...(board.items ?? [])];
  if (!items.includes(itemId) && items.length < MAX_PARTY_ITEMS) items.push(itemId);
  return {
    ...save,
    partyBoard: {
      ...save.partyBoard,
      [HUB_ISLAND_ID]: { ...board, items },
    },
  };
}

export function applyCarpetPolish(save: IslandSaveV1, tierId: string): IslandSaveV1 {
  return withHarborShop(save, { ...ensureHarborShop(save), carpetTierId: tierId });
}

export function applyPlazaPass(save: IslandSaveV1, room: PlazaRoomId): IslandSaveV1 {
  const shop = ensureHarborShop(save);
  const unlocked = new Set(shop.unlockedRooms ?? ["plaza"]);
  unlocked.add(room);
  return withHarborShop(save, { ...shop, unlockedRooms: Array.from(unlocked) as PlazaRoomId[] });
}

export function isRoomUnlocked(save: IslandSaveV1, room: PlazaRoomId): boolean {
  if (room === "plaza" || room === "dock") return true;
  if (room === "pavilion") return hasHarborFreedom(save);
  return (save.harborShop?.unlockedRooms ?? []).includes(room);
}

export function companionPrice(id: string): number {
  if (Object.prototype.hasOwnProperty.call(COMPANION_PRICES, id)) {
    return COMPANION_PRICES[id]!;
  }
  // Unknown ids are not free — treat as unavailable / not for sale
  return Number.POSITIVE_INFINITY;
}

export function ownsCompanion(save: IslandSaveV1, companionId: string): boolean {
  if (companionId === "none") return true;
  if (companionId === STARTER_COMPANION_ID) return true;
  return (save.harborShop?.ownedCompanions ?? []).includes(companionId);
}

export function applyCompanionPurchase(save: IslandSaveV1, companionId: string): IslandSaveV1 {
  if (companionId === "none") return save;
  const shop = ensureHarborShop(save);
  const owned = new Set(shop.ownedCompanions ?? []);
  owned.add(companionId);
  // Always keep the free starter marked owned once any companion is adopted
  owned.add(STARTER_COMPANION_ID);
  return withHarborShop(save, { ...shop, ownedCompanions: Array.from(owned) });
}

/** Ensure starter pet is owned without charging. */
export function grantStarterCompanion(save: IslandSaveV1): IslandSaveV1 {
  return applyCompanionPurchase(save, STARTER_COMPANION_ID);
}

export function capsuleLabel(itemId: PartyItemId): string {
  const def = PARTY_ITEMS[itemId];
  return def ? `${def.icon} ${def.name}` : itemId;
}
