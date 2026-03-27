import { create } from "zustand";

interface WatchlistStore {
  tickers: string[];
  setTickers: (tickers: string[]) => void;
  add: (ticker: string) => void;
  remove: (ticker: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>((set) => ({
  tickers: [],
  setTickers: (tickers) => set({ tickers }),
  add: (ticker) => set((s) => ({ tickers: [...new Set([...s.tickers, ticker])] })),
  remove: (ticker) => set((s) => ({ tickers: s.tickers.filter((t) => t !== ticker) })),
}));
