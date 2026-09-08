import { useCallback, useEffect, useState } from "react";
import {
  advanceDay,
  buyStock,
  purchaseAsset,
  purchaseBusiness,
  purchaseCharacter,
  purchaseProperty,
  sellStock,
  startInvestment,
  triggerRandomEvent,
  upgradeBusiness,
} from "@/game/engine";
import { depositMoney, withdrawMoney } from "@/game/economy";
import { loadGame, resetGame, saveGame } from "@/game/save";
import { createInitialState } from "@/game/state";
import type { GameState } from "@/game/types";

export function useGame() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadGame());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveGame(state);
  }, [state, hydrated]);

  const mutate = useCallback((fn: (draft: GameState) => unknown) => {
    setState((prev) => {
      const draft: GameState = {
        ...prev,
        player: { ...prev.player },
        ownedBusinesses: { ...prev.ownedBusinesses },
        stockPortfolio: { ...prev.stockPortfolio },
        marketPrices: { ...prev.marketPrices },
        ownedCharacters: [...prev.ownedCharacters],
        ownedProperties: [...prev.ownedProperties],
        ownedAssets: [...prev.ownedAssets],
        investments: prev.investments.map((i) => ({ ...i })),
        activeModifiers: prev.activeModifiers.map((m) => ({ ...m })),
        eventHistory: [...prev.eventHistory],
        transactionHistory: [...prev.transactionHistory],
      };
      fn(draft);
      return draft;
    });
  }, []);

  return {
    state,
    hydrated,
    nextDay: () => mutate((d) => advanceDay(d)),
    randomEvent: () => mutate((d) => triggerRandomEvent(d)),
    buyBusiness: (id: string) => mutate((d) => purchaseBusiness(d, id)),
    upgradeBusiness: (id: string) => mutate((d) => upgradeBusiness(d, id)),
    buyProperty: (id: string) => mutate((d) => purchaseProperty(d, id)),
    buyAsset: (id: string) => mutate((d) => purchaseAsset(d, id)),
    buyCharacter: (id: string) => mutate((d) => purchaseCharacter(d, id)),
    buyStock: (id: string, shares: number) => mutate((d) => buyStock(d, id, shares)),
    sellStock: (id: string, shares: number) => mutate((d) => sellStock(d, id, shares)),
    invest: (id: string, amount: number) => mutate((d) => startInvestment(d, id, amount)),
    deposit: (amount: number) => mutate((d) => depositMoney(d, amount)),
    withdraw: (amount: number) => mutate((d) => withdrawMoney(d, amount)),
    reset: () => setState(resetGame()),
  };
}
