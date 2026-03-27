import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DemoTicker = "AAPL" | "TSLA" | "MSFT";

interface TickerStore {
  currentTicker: string;
  setCurrentTicker: (ticker: string) => void;

  isDemoMode: boolean;
  setDemoMode: (v: boolean) => void;

  recentSearches: string[];
  pushRecentSearch: (ticker: string) => void;
  clearRecentSearches: () => void;

  watchlist: string[];
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
}

export const useTickerStore = create<TickerStore>()(
  persist(
    (set, get) => ({
      currentTicker: "AAPL",
      setCurrentTicker: (ticker) => set({ currentTicker: ticker.toUpperCase() }),

      isDemoMode: true, // default ON so the app works without API keys
      setDemoMode: (v) => set({ isDemoMode: v }),

      recentSearches: [],
      pushRecentSearch: (ticker) =>
        set((s) => ({
          recentSearches: [ticker, ...s.recentSearches.filter((t) => t !== ticker)].slice(0, 6),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      watchlist: ["AAPL", "TSLA", "MSFT"],
      addToWatchlist: (ticker) =>
        set((s) => ({
          watchlist: [...new Set([...s.watchlist, ticker.toUpperCase()])],
        })),
      removeFromWatchlist: (ticker) =>
        set((s) => ({ watchlist: s.watchlist.filter((t) => t !== ticker.toUpperCase()) })),
      isInWatchlist: (ticker) => get().watchlist.includes(ticker.toUpperCase()),
    }),
    { name: "fintech-ticker-store" }
  )
);
